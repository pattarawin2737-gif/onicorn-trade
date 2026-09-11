// Cloudflare Pages Function: /api/sessions

// ดึงประวัติประวัติการล็อกอินล่าสุด 20 รายการ
export async function onRequestGet(context) {
  const db = context.env.DB;
  
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
    const { results } = await db.prepare("SELECT * FROM user_sessions ORDER BY login_time DESC LIMIT 20").all();
    
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

// บันทึกประวัติการล็อกอินใหม่
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
    const data = await request.json();
    const { username } = data;
    
    if (!username) {
      return new Response(JSON.stringify({ success: false, error: "กรุณาระบุ Username" }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // ดึง IP Address และ User Agent จาก Headers ของ Cloudflare Request
    const ipAddress = request.headers.get("CF-Connecting-IP") || "127.0.0.1";
    const userAgent = request.headers.get("User-Agent") || "Unknown Browser";

    await db.prepare("INSERT INTO user_sessions (username, ip_address, user_agent) VALUES (?, ?, ?)")
      .bind(username, ipAddress, userAgent)
      .run();

    return new Response(JSON.stringify({ success: true, message: "บันทึกเซสชันลง D1 สำเร็จ" }), {
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

// ตอบกลับแบบ OPTIONS สำหรับ Preflight CORS ของบราวเซอร์
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
