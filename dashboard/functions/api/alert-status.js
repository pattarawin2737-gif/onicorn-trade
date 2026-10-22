// Cloudflare Pages Function: /api/alert-status
// บันทึกและตรวจสอบประวัติการส่งแจ้งเตือน Telegram (Deduplication Engine)
// รองรับการทำงานคู่ขนานระหว่าง VPS (เครื่องหลัก) และ GitHub Actions (เครื่องสำรอง)
// รองรับรอบเวลา: รายวัน (Daily), รายสัปดาห์ (Weekly), รายเดือน (Monthly)

export async function onRequestGet(context) {
  const db = context.env.DB;
  const url = new URL(context.request.url);
  const task = url.searchParams.get("task");
  const date = url.searchParams.get("date"); // e.g. "2026-10-22" or "2026-W43"
  const period = url.searchParams.get("period") || "daily";
  const isSummary = url.searchParams.get("summary") === "1" || url.searchParams.get("summary") === "true";

  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  if (!db) {
    return new Response(JSON.stringify({
      success: true,
      already_sent: false,
      notice: "D1 database not bound. Operating in standalone mode."
    }), { headers: corsHeaders });
  }

  try {
    // Ensure table exists
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS alert_history (
        task_id TEXT NOT NULL,
        sent_date TEXT NOT NULL,
        sent_at TEXT NOT NULL,
        runner TEXT,
        status TEXT,
        PRIMARY KEY (task_id, sent_date)
      )
    `).run();

    // 1. Summary mode for Dashboard UI (Latest record for each task)
    if (isSummary) {
      const { results } = await db.prepare(`
        SELECT a.task_id, a.sent_date, a.sent_at, a.runner, a.status
        FROM alert_history a
        INNER JOIN (
          SELECT task_id, MAX(sent_at) as max_sent_at
          FROM alert_history
          GROUP BY task_id
        ) b ON a.task_id = b.task_id AND a.sent_at = b.max_sent_at
        ORDER BY a.sent_at DESC
      `).all();

      const latestByTask = {};
      (results || []).forEach(r => {
        latestByTask[r.task_id] = r;
      });

      return new Response(JSON.stringify({
        success: true,
        summary: true,
        latest_by_task: latestByTask
      }), { headers: corsHeaders });
    }

    // 2. Check deduplication for a specific task & period
    if (task && date) {
      let record = null;

      if (period === "weekly") {
        // Calculate ISO week range
        const d = new Date(date + "T00:00:00Z");
        if (!isNaN(d.getTime())) {
          const day = d.getUTCDay() || 7; // 1=Mon, 7=Sun
          const mon = new Date(d);
          mon.setUTCDate(d.getUTCDate() - (day - 1));
          const sun = new Date(mon);
          sun.setUTCDate(mon.getUTCDate() + 6);

          const monStr = mon.toISOString().slice(0, 10);
          const sunStr = sun.toISOString().slice(0, 10);

          // Get ISO week string e.g. "2026-W43"
          const target = new Date(d.valueOf());
          const dayNr = (d.getUTCDay() + 6) % 7;
          target.setUTCDate(target.getUTCDate() - dayNr + 3);
          const firstThursday = target.valueOf();
          target.setUTCMonth(0, 1);
          if (target.getUTCDay() !== 4) {
            target.setUTCMonth(0, 1 + ((4 - target.getUTCDay()) + 7) % 7);
          }
          const weekNr = 1 + Math.ceil((firstThursday - target) / 604800000);
          const isoWeek = `${target.getUTCFullYear()}-W${String(weekNr).padStart(2, '0')}`;

          record = await db.prepare(`
            SELECT task_id, sent_date, sent_at, runner, status
            FROM alert_history
            WHERE task_id = ? AND (
              sent_date = ? OR
              sent_date = ? OR
              (sent_date >= ? AND sent_date <= ?)
            )
            ORDER BY sent_at DESC LIMIT 1
          `).bind(task, date, isoWeek, monStr, sunStr).first();
        }
      } else if (period === "monthly") {
        const monthPrefix = date.slice(0, 7); // "YYYY-MM"
        record = await db.prepare(`
          SELECT task_id, sent_date, sent_at, runner, status
          FROM alert_history
          WHERE task_id = ? AND (
            sent_date = ? OR
            sent_date = ? OR
            sent_date LIKE ?
          )
          ORDER BY sent_at DESC LIMIT 1
        `).bind(task, date, monthPrefix, `${monthPrefix}-%`).first();
      } else {
        // Daily
        record = await db.prepare(
          "SELECT task_id, sent_date, sent_at, runner, status FROM alert_history WHERE task_id = ? AND sent_date = ?"
        ).bind(task, date).first();
      }

      return new Response(JSON.stringify({
        success: true,
        already_sent: !!record,
        record: record || null
      }), { headers: corsHeaders });
    }

    // 3. Query by date only
    if (date) {
      const { results } = await db.prepare(
        "SELECT task_id, sent_date, sent_at, runner, status FROM alert_history WHERE sent_date = ? ORDER BY sent_at DESC"
      ).bind(date).all();

      return new Response(JSON.stringify({
        success: true,
        date,
        records: results || []
      }), { headers: corsHeaders });
    }

    // 4. Default: Return latest 50 alert records
    const { results } = await db.prepare(
      "SELECT task_id, sent_date, sent_at, runner, status FROM alert_history ORDER BY sent_at DESC LIMIT 50"
    ).all();

    return new Response(JSON.stringify({
      success: true,
      records: results || []
    }), { headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      already_sent: false,
      error: err.message
    }), { status: 200, headers: corsHeaders });
  }
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  const request = context.request;

  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  try {
    const body = await request.json();
    const { task, date, period_key, runner = "vps", status = "success" } = body;

    // Use period_key if provided, otherwise date
    const saveDate = period_key || date;

    if (!task || !saveDate) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing required fields: 'task' and 'date' or 'period_key' are required."
      }), { status: 400, headers: corsHeaders });
    }

    const sentAt = new Date().toISOString();

    if (!db) {
      return new Response(JSON.stringify({
        success: true,
        saved: true,
        notice: "D1 database not bound. Mocking successful registration.",
        task,
        date: saveDate,
        runner,
        sent_at: sentAt
      }), { headers: corsHeaders });
    }

    // Ensure table exists
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS alert_history (
        task_id TEXT NOT NULL,
        sent_date TEXT NOT NULL,
        sent_at TEXT NOT NULL,
        runner TEXT,
        status TEXT,
        PRIMARY KEY (task_id, sent_date)
      )
    `).run();

    // Upsert record
    await db.prepare(`
      INSERT INTO alert_history (task_id, sent_date, sent_at, runner, status)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(task_id, sent_date) DO UPDATE SET
        sent_at = excluded.sent_at,
        runner = excluded.runner,
        status = excluded.status
    `).bind(task, saveDate, sentAt, runner, status).run();

    return new Response(JSON.stringify({
      success: true,
      saved: true,
      task,
      date: saveDate,
      runner,
      sent_at: sentAt
    }), { headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), { status: 500, headers: corsHeaders });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    }
  });
}
