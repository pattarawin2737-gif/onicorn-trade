// Cloudflare Pages Function: /api/admin-users
// Manages admin and user accounts in local D1 database.

export async function onRequestGet(context) {
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

    // Insert default admins
    await db.prepare(`
      INSERT OR IGNORE INTO users (username, password, role, approved)
      VALUES ('admin', 'admin1234', 'admin', 1)
    `).run();

    await db.prepare(`
      INSERT OR IGNORE INTO users (username, password, role, approved)
      VALUES ('pattarawin', '123456', 'admin', 1)
    `).run();

    // 2. Parse query parameters
    const url = new URL(request.url);
    const filter = url.searchParams.get("filter") || "admin"; // 'admin' or 'all'

    let query = "SELECT username, password, role, approved FROM users WHERE LOWER(role) = 'admin'";
    if (filter === "all") {
      query = "SELECT username, password, role, approved FROM users";
    }

    const { results } = await db.prepare(query).all();

    return new Response(JSON.stringify({ success: true, results }), {
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
    return new Response(JSON.stringify({ success: false, error: "ไม่พบการเชื่อมต่อฐานข้อมูล D1" }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  try {
    const data = await request.json();
    const action = String(data.action || "save").toLowerCase();
    const username = String(data.username || "").trim();
    
    if (!username) {
      return new Response(JSON.stringify({ success: false, error: "กรุณาระบุ Username" }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    if (action === "delete") {
      // Delete the user completely from D1
      await db.prepare("DELETE FROM users WHERE LOWER(username) = LOWER(?)").bind(username).run();
      
      return new Response(JSON.stringify({ success: true, message: "ลบผู้ใช้สำเร็จ" }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
        }
      });
    } else {
      // Check if this is an approval toggle
      const approved = data.approved !== undefined ? Number(data.approved) : null;

      if (approved !== null) {
        await db.prepare("UPDATE users SET approved = ? WHERE LOWER(username) = LOWER(?)")
          .bind(approved, username)
          .run();
      } else {
        // Save / Update User (promote, demote or change password)
        const password = String(data.password || "").trim();
        const role = String(data.role || "user").trim();

        if (!password) {
          return new Response(JSON.stringify({ success: false, error: "กรุณาระบุ Password" }), {
            status: 400,
            headers: { 
              "Content-Type": "application/json",
              "Access-Control-Origin": "*"
            }
          });
        }

        // Upsert user in D1 (Backoffice created users are approved (1) by default)
        const defaultApproved = (role === "admin") ? 1 : 1; 

        await db.prepare(`
          INSERT INTO users (username, password, role, approved) 
          VALUES (?, ?, ?, ?)
          ON CONFLICT(username) DO UPDATE SET password=excluded.password, role=excluded.role
        `).bind(username, password, role, defaultApproved).run();
      }

      return new Response(JSON.stringify({ success: true, message: "บันทึกข้อมูลผู้ใช้สำเร็จ" }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
        }
      });
    }
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
