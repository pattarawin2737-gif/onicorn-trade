// Cloudflare Pages Function: /api/trades

export async function onRequestGet(context) {
  const db = context.env.DB;
  const { searchParams } = new URL(context.request.url);
  const username = searchParams.get("username");

  if (!db) {
    return new Response(JSON.stringify({ error: "ไม่พบการเชื่อมต่อฐานข้อมูล D1" }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  if (!username) {
    return new Response(JSON.stringify({ error: "กรุณาระบุ Username" }), {
      status: 400,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  try {
    // 0. Ensure user_settings table exists
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS user_settings (
        username TEXT PRIMARY KEY,
        candle_reasons TEXT,
        indicator_reasons TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // 1. ดึงรายการเทรด
    const { results: tradeRows } = await db.prepare(
      "SELECT id, trade_data FROM user_trades WHERE username = ?"
    ).bind(username).all();

    // 2. ดึงรายการ ID ออเดอร์ที่ถูกลบ
    const { results: deletedRows } = await db.prepare(
      "SELECT trade_id FROM user_deleted_trades WHERE username = ?"
    ).bind(username).all();

    // 3. ดึงรายการเหตุผลที่ตั้งค่าไว้ (ถ้ามี)
    let candleReasons = null;
    let indicatorReasons = null;
    try {
      const settingsRow = await db.prepare(
        "SELECT candle_reasons, indicator_reasons FROM user_settings WHERE username = ?"
      ).bind(username).first();
      if (settingsRow) {
        if (settingsRow.candle_reasons) candleReasons = JSON.parse(settingsRow.candle_reasons);
        if (settingsRow.indicator_reasons) indicatorReasons = JSON.parse(settingsRow.indicator_reasons);
      }
    } catch (e) {}

    const trades = tradeRows.map(row => {
      try {
        return JSON.parse(row.trade_data);
      } catch {
        return null;
      }
    }).filter(Boolean);

    const deletedIds = deletedRows.map(row => row.trade_id);

    return new Response(JSON.stringify({ success: true, trades, deletedIds, candleReasons, indicatorReasons }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  const request = context.request;

  if (!db) {
    return new Response(JSON.stringify({ error: "ไม่พบการเชื่อมต่อฐานข้อมูล D1" }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  try {
    const body = await request.json();
    const { action, username } = body;

    if (!username) {
      return new Response(JSON.stringify({ success: false, error: "กรุณาระบุ Username" }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    if (action === "save") {
      const { trade } = body;
      if (!trade || !trade.id) {
        return new Response(JSON.stringify({ success: false, error: "ข้อมูลออเดอร์ไม่ครบถ้วน" }), {
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }

      await db.prepare(
        "INSERT OR REPLACE INTO user_trades (id, username, trade_data) VALUES (?, ?, ?)"
      ).bind(trade.id, username, JSON.stringify(trade)).run();

      return new Response(JSON.stringify({ success: true, message: "บันทึกออเดอร์สำเร็จ" }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });

    } else if (action === "save_reasons") {
      const { candleReasons, indicatorReasons } = body;
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS user_settings (
          username TEXT PRIMARY KEY,
          candle_reasons TEXT,
          indicator_reasons TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      await db.prepare(`
        INSERT INTO user_settings (username, candle_reasons, indicator_reasons, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(username) DO UPDATE SET
          candle_reasons = CASE WHEN ? IS NOT NULL THEN ? ELSE candle_reasons END,
          indicator_reasons = CASE WHEN ? IS NOT NULL THEN ? ELSE indicator_reasons END,
          updated_at = CURRENT_TIMESTAMP
      `).bind(
        username,
        candleReasons ? JSON.stringify(candleReasons) : null,
        indicatorReasons ? JSON.stringify(indicatorReasons) : null,
        candleReasons ? JSON.stringify(candleReasons) : null,
        candleReasons ? JSON.stringify(candleReasons) : null,
        indicatorReasons ? JSON.stringify(indicatorReasons) : null,
        indicatorReasons ? JSON.stringify(indicatorReasons) : null
      ).run();

      return new Response(JSON.stringify({ success: true, message: "บันทึกเหตุผลขึ้น Cloud สำเร็จ" }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });

    } else if (action === "delete") {
      const { tradeId } = body;
      if (!tradeId) {
        return new Response(JSON.stringify({ success: false, error: "กรุณาระบุ tradeId" }), {
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }

      // 1. ลบออกจากตาราง user_trades (ถ้ามี)
      await db.prepare("DELETE FROM user_trades WHERE id = ? AND username = ?").bind(tradeId, username).run();

      // 2. บันทึกเข้าตาราง user_deleted_trades (เพื่อป้องกันชีตดั้งเดิมโชว์ออเดอร์ที่ถูกลบ)
      await db.prepare("INSERT OR REPLACE INTO user_deleted_trades (trade_id, username) VALUES (?, ?)").bind(tradeId, username).run();

      return new Response(JSON.stringify({ success: true, message: "ลบออเดอร์สำเร็จ" }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });

    } else if (action === "bulk") {
      const { localTrades, deletedIds } = body;
      
      // บันทึกแบบกลุ่ม (Bulk)
      if (Array.isArray(localTrades)) {
        for (const t of localTrades) {
          if (t && t.id) {
            // ป้องกันการซิงค์ข้อมูลออเดอร์ของผู้ใช้อื่นเข้ามาในบัญชีนี้
            const tUser = String(t["ผู้ใช้งาน"] || t.username || "").toLowerCase().trim();
            if (tUser && tUser !== username.toLowerCase().trim() && tUser !== "guest") {
              continue;
            }
            await db.prepare(
              "INSERT OR REPLACE INTO user_trades (id, username, trade_data) VALUES (?, ?, ?)"
            ).bind(t.id, username, JSON.stringify(t)).run();
          }
        }
      }

      if (Array.isArray(deletedIds)) {
        for (const id of deletedIds) {
          if (id) {
            await db.prepare("DELETE FROM user_trades WHERE id = ? AND username = ?").bind(id, username).run();
            await db.prepare("INSERT OR REPLACE INTO user_deleted_trades (trade_id, username) VALUES (?, ?)").bind(id, username).run();
          }
        }
      }

      return new Response(JSON.stringify({ success: true, message: "ผสานข้อมูลแบบกลุ่มสำเร็จ" }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } else if (action === "clear") {
      const marketType = body.marketType;
      if (marketType) {
        if (marketType === "forex") {
          // If marketType is forex, we match both 'forex' and any empty/NULL values as legacy
          // First, let's fetch matching trades to add to deleted trades so we track them correctly.
          // For simplicity, we just delete them.
          await db.prepare("DELETE FROM user_trades WHERE username = ? AND (trade_data LIKE '%\"marketType\":\"forex\"%' OR trade_data NOT LIKE '%\"marketType\"%')").bind(username).run();
        } else {
          await db.prepare("DELETE FROM user_trades WHERE username = ? AND trade_data LIKE ?").bind(username, `%"marketType":"${marketType}"%`).run();
        }
      } else {
        await db.prepare("DELETE FROM user_trades WHERE username = ?").bind(username).run();
        await db.prepare("DELETE FROM user_deleted_trades WHERE username = ?").bind(username).run();
      }
      return new Response(JSON.stringify({ success: true, message: "ล้างข้อมูลตลาดสำเร็จ" }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    return new Response(JSON.stringify({ success: false, error: "Action ไม่ถูกต้อง" }), {
      status: 400,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}

export async function onRequestOptions(context) {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    }
  });
}
