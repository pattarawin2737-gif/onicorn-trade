// Cloudflare Pages Function: /api/alert-status
// บันทึกและตรวจสอบประวัติการส่งแจ้งเตือน Telegram (Deduplication Engine)
// รองรับการทำงานคู่ขนานระหว่าง VPS (เครื่องหลัก) และ GitHub Actions (เครื่องสำรอง)

export async function onRequestGet(context) {
  const db = context.env.DB;
  const url = new URL(context.request.url);
  const task = url.searchParams.get("task");
  const date = url.searchParams.get("date"); // e.g. "2026-10-20"

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

    if (task && date) {
      const record = await db.prepare(
        "SELECT task_id, sent_date, sent_at, runner, status FROM alert_history WHERE task_id = ? AND sent_date = ?"
      ).bind(task, date).first();

      return new Response(JSON.stringify({
        success: true,
        already_sent: !!record,
        record: record || null
      }), { headers: corsHeaders });
    }

    // If query by date only, return all tasks for that date
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

    // Default: Return latest 50 alert records
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
    const { task, date, runner = "vps", status = "success" } = body;

    if (!task || !date) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing required fields: 'task' and 'date' are required."
      }), { status: 400, headers: corsHeaders });
    }

    const sentAt = new Date().toISOString();

    if (!db) {
      return new Response(JSON.stringify({
        success: true,
        saved: true,
        notice: "D1 database not bound. Mocking successful registration.",
        task,
        date,
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
    `).bind(task, date, sentAt, runner, status).run();

    return new Response(JSON.stringify({
      success: true,
      saved: true,
      task,
      date,
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
