// Cloudflare Pages Function: /api/register
// Handles user registration in local D1 database.

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

    if (!username || !password) {
      return new Response(JSON.stringify({ success: false, error: "กรุณาระบุ Username และ Password" }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // 3. Check if username already exists
    const existingUser = await db.prepare("SELECT username FROM users WHERE LOWER(username) = LOWER(?)")
      .bind(username)
      .first();

    if (existingUser) {
      return new Response(JSON.stringify({ success: false, error: "ชื่อผู้ใช้นี้ถูกใช้งานแล้วในระบบ" }), {
        status: 409,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    const finalRole = (username.toLowerCase() === "pattarawin" || username.toLowerCase() === "admin") ? "admin" : "user";
    const finalApproved = 1; // Auto-approve users so they can immediately log in and use the app

    // 4. Create user
    await db.prepare("INSERT INTO users (username, password, role, approved) VALUES (?, ?, ?, ?)")
      .bind(username, password, finalRole, finalApproved)
      .run();

    return new Response(JSON.stringify({ 
      success: true, 
      username,
      role: finalRole,
      approved: finalApproved,
      message: "ลงทะเบียนสมาชิกสำเร็จ! คุณสามารถเข้าสู่ระบบได้ทันที"
    }), {
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
