// Cloudflare Pages Function: /api/telegram
// ส่งข้อความหรือทดสอบการเชื่อมต่อ Telegram Bot โดยตรงจากหน้าเว็บ

export async function onRequestPost(context) {
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  try {
    const { token, chatId, action, customMessage } = await context.request.json();

    const botToken = token?.trim();
    const targetChatId = chatId?.trim();

    if (!botToken || !targetChatId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "กรุณาระบุ Telegram Bot Token และ Chat ID ให้ครบถ้วน" 
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // 1. Verify Bot Token via getMe
    const getMeRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const getMeData = await getMeRes.json();

    if (!getMeData.ok) {
      return new Response(JSON.stringify({
        success: false,
        error: `Bot Token ไม่ถูกต้อง หรือไม่สามารถเชื่อมต่อได้: ${getMeData.description || 'Unauthorized'}`
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const botInfo = getMeData.result;

    // Action handling
    let messageText = "";

    if (action === "test") {
      const nowStr = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
      messageText = (
        `🔔 <b>ทดสอบการเชื่อมต่อ Telegram สำเร็จ!</b>\n\n` +
        `🤖 <b>ชื่อบอท:</b> ${botInfo.first_name} (@${botInfo.username})\n` +
        `💬 <b>Chat ID:</b> <code>${targetChatId}</code>\n` +
        `⏰ <b>เวลาทดสอบ:</b> ${nowStr} น.\n\n` +
        `✅ ระบบแจ้งเตือน Onicorn Trade พร้อมทำงานอัตโนมัติผ่าน GitHub Actions แล้วครับ!\n` +
        `• 🌟 <b>สรุปข่าวทองคำ (XAU/USD):</b> จันทร์ - ศุกร์ เวลา 08:00 น.\n` +
        `• 🛢️ <b>ภาพกราฟสดน้ำมัน WTI:</b> ทุกวันอังคาร เวลา 08:00 น.\n` +
        `• 📈 <b>หุ้นไทยเด่นที่สุดในตลาด (Daily Top Picks):</b> จันทร์ - ศุกร์ เวลา 08:30 น.\n` +
        `• ⚡ <b>วิเคราะห์กลุ่มอุตสาหกรรม (Weekly Sector):</b> ทุกวันจันทร์ เวลา 08:30 น.\n` +
        `• 🗓️ <b>วิเคราะห์กลุ่มอุตสาหกรรม (Monthly Outlook):</b> ทุกวันที่ 1 ของเดือน เวลา 08:30 น.`
      );
    } else if (action === "custom" && customMessage) {
      messageText = customMessage;
    } else if (action === "daily_stocks") {
      messageText = customMessage || `📈 <b>ทดสอบระบบแจ้งเตือน หุ้นไทยเด่นที่สุดในตลาดวันนี้ (Daily Top Picks)</b>\nระบบพร้อมส่งแจ้งเตือนอัตโนมัติ จันทร์ - ศุกร์ เวลา 08:30 น.`;
    } else if (action === "weekly_sector") {
      messageText = customMessage || `⚡ <b>ทดสอบระบบวิเคราะห์กลุ่มอุตสาหกรรมที่น่าสนใจ (ประจำสัปดาห์นี้)</b>\nระบบพร้อมส่งแจ้งเตือนอัตโนมัติ ทุกวันจันทร์ เวลา 08:30 น.`;
    } else if (action === "monthly_sector") {
      messageText = customMessage || `🗓️ <b>ทดสอบระบบวิเคราะห์กลุ่มอุตสาหกรรมยุทธศาสตร์ (ประจำเดือนนี้)</b>\nระบบพร้อมส่งแจ้งเตือนอัตโนมัติ ทุกวันที่ 1 ของเดือน เวลา 08:30 น.`;
    } else {
      messageText = `🔔 แจ้งเตือนจาก Onicorn Trade Dashboard`;
    }

    // Send Message via Telegram API
    const sendRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: messageText,
        parse_mode: "HTML",
        disable_web_page_preview: true
      })
    });

    const sendData = await sendRes.json();

    if (!sendData.ok) {
      return new Response(JSON.stringify({
        success: false,
        error: `Telegram ส่งข้อความไม่สำเร็จ: ${sendData.description} (ตรวจสอบว่าท่านได้กด Start ที่ตัวบอทหรือยัง)`
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: "ส่งข้อความเข้า Telegram สำเร็จเรียบร้อย!",
      bot: {
        name: botInfo.first_name,
        username: botInfo.username
      }
    }), {
      headers: corsHeaders
    });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: `เกิดข้อผิดพลาด: ${err.message}`
    }), {
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
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    }
  });
}
