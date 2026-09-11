// Cloudflare Pages Function: /api/auth-sync
// Silently syncs username and password from Apps Script / LocalStorage into local D1 database.

export async function onRequestPost(context) {
  const db = context.env.DB;
  const request = context.request;

  if (!db) {
    return new Response(JSON.stringify({ success: false, error: "ไม่พบการเชื่อมต่อฐานข้อมูล D1" }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  try {
    // 1. Self-healing schema initialization
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'User',
        approved INTEGER DEFAULT 0
      )
    `).run();

    try {
      await db.prepare("ALTER TABLE users ADD COLUMN approved INTEGER DEFAULT 0").run();
    } catch (e) {}

    // 2. Parse request
    const data = await request.json();
    const username = String(data.username || "").trim();
    const password = String(data.password || "").trim();
    const role = String(data.role || "user").trim();

    if (!username || !password) {
      return new Response(JSON.stringify({ success: false, error: "กรุณาระบุ Username และ Password" }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    const existing = await db.prepare("SELECT role, approved FROM users WHERE LOWER(username) = LOWER(?)")
      .bind(username)
      .first();

    let finalRole = (existing && existing.role) ? existing.role : role;
    if (username.toLowerCase() === "pattarawin" || username.toLowerCase() === "admin") {
      finalRole = "admin";
    }

    // Default to approved (1) for successfully synced active users
    const finalApproved = (existing && existing.approved !== undefined) ? existing.approved : 1;

    await db.prepare(`
      INSERT INTO users (username, password, role, approved) 
      VALUES (?, ?, ?, ?)
      ON CONFLICT(username) DO UPDATE SET password=excluded.password, role=excluded.role, approved=excluded.approved
    `).bind(username, password, finalRole, finalApproved).run();

    return new Response(JSON.stringify({ success: true, message: "ซิงก์รหัสข้อมูลเก่าสำเร็จ" }), {
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

// OPTIONS handler for CORS preflight
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
