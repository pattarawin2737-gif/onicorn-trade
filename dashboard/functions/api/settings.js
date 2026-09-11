// Cloudflare Pages Function: /api/settings
// จัดการการตั้งค่าของระบบ (เช่น Telegram Bot Token, Chat ID, Google Sheet ID)

export async function onRequestGet(context) {
  const db = context.env.DB;

  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  if (!db) {
    return new Response(JSON.stringify({ 
      success: true, 
      settings: {}, 
      notice: "D1 database not bound. Operating in client-side storage mode." 
    }), {
      headers: corsHeaders
    });
  }

  try {
    // Ensure table exists
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS app_settings (
        setting_key TEXT PRIMARY KEY,
        setting_value TEXT
      )
    `).run();

    const { results } = await db.prepare("SELECT setting_key, setting_value FROM app_settings").all();
    
    const settings = {};
    if (results && results.length > 0) {
      results.forEach(row => {
        settings[row.setting_key] = row.setting_value;
      });
    }

    return new Response(JSON.stringify({ success: true, settings }), {
      headers: corsHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message, settings: {} }), {
      status: 200, // Return 200 with empty settings so client can fallback to localStorage
      headers: corsHeaders
    });
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
    const settings = body.settings || body; // Support either { settings: {...} } or { key: val }

    if (!db) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "บันทึกในโหมด Client เรียบร้อย (ไม่มีการผูก D1)",
        settings
      }), {
        headers: corsHeaders
      });
    }

    // Ensure table exists
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS app_settings (
        setting_key TEXT PRIMARY KEY,
        setting_value TEXT
      )
    `).run();

    // Upsert each setting
    const entries = Object.entries(settings);
    for (const [key, value] of entries) {
      const valStr = typeof value === "object" ? JSON.stringify(value) : String(value ?? "");
      await db.prepare(`
        INSERT INTO app_settings (setting_key, setting_value) 
        VALUES (?, ?)
        ON CONFLICT(setting_key) DO UPDATE SET setting_value=excluded.setting_value
      `).bind(key, valStr).run();
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "บันทึกการตั้งค่าระบบเรียบร้อยแล้ว",
      updatedKeys: entries.map(e => e[0])
    }), {
      headers: corsHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
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
