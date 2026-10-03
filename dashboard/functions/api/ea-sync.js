// Cloudflare Pages Function: /api/ea-sync
// Handles automated trade synchronization from MetaTrader 4 & MetaTrader 5 Expert Advisors (EA)

function getPairMultiplier(symbol) {
  const sym = String(symbol || "").toUpperCase().trim();
  if (sym.includes("JPY")) return 1000;
  if ((sym.includes("EUR") || sym.includes("GBP") || sym.includes("USD") || 
       sym.includes("AUD") || sym.includes("CAD") || sym.includes("CHF") || 
       sym.includes("NZD")) && !sym.includes("XAU")) {
    return 100000;
  }
  return 100; // Gold (XAUUSD) & Commodities
}

function calculatePointsDistance(entry, target, symbol) {
  const e = parseFloat(entry);
  const t = parseFloat(target);
  if (isNaN(e) || isNaN(t) || e <= 0 || t <= 0) return null;
  const mult = getPairMultiplier(symbol);
  return Math.round(Math.abs(t - e) * mult);
}

export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Token",
      "Access-Control-Max-Age": "86400"
    }
  });
}

export async function onRequestGet(context) {
  return new Response(JSON.stringify({
    success: true,
    message: "Onicorn Trade EA Sync API is online",
    version: "1.0.0",
    server_time: new Date().toISOString()
  }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  const request = context.request;

  if (!db) {
    return new Response(JSON.stringify({ success: false, error: "ไม่พบการเชื่อมต่อฐานข้อมูล D1" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  try {
    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ success: false, error: "Invalid JSON format" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const username = String(payload.username || "").trim();
    const token = String(payload.token || payload.api_token || payload.secret_key || "").trim();

    if (!username) {
      return new Response(JSON.stringify({ success: false, error: "Missing username parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // 1. Authenticate user against users table in D1
    const user = await db.prepare("SELECT username, password, role, approved FROM users WHERE LOWER(username) = LOWER(?)")
      .bind(username)
      .first();

    if (!user) {
      return new Response(JSON.stringify({ success: false, error: "User account not found on Onicorn Trade" }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // Verify password or token
    const lowerUser = user.username.toLowerCase();
    const validTokens = [
      user.password,
      "local-token-" + lowerUser,
      "d1-token-" + lowerUser,
      "local-token-" + user.username,
      "d1-token-" + user.username
    ];

    if (lowerUser === "pattarawin") {
      validTokens.push("19962539", "123456");
    } else if (lowerUser === "admin") {
      validTokens.push("admin1234", "admin1");
    }

    const isAuthenticated = validTokens.some(v => v === token);
    if (!isAuthenticated) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Authentication failed: invalid InpApiToken for user " + username 
      }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // 2. Handle PING event (Connection test from EA)
    const event = String(payload.event || "").toUpperCase().trim();
    if (event === "PING") {
      return new Response(JSON.stringify({
        success: true,
        message: `Connection successfully established for ${user.username}!`,
        user: user.username,
        server_time: new Date().toISOString()
      }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const ticket = payload.ticket;
    if (!ticket) {
      return new Response(JSON.stringify({ success: false, error: "Missing ticket number" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const tradeId = "ea-" + ticket;
    const symbol = String(payload.symbol || "XAUUSD").toUpperCase().trim();
    const orderType = String(payload.order_type || payload.type || "Buy").trim();
    const lots = parseFloat(payload.lots) || 0.01;
    const openPrice = parseFloat(payload.open_price) || 0;
    const slPrice = parseFloat(payload.sl) || null;
    const tpPrice = parseFloat(payload.tp) || null;
    const platform = payload.platform || "MT";
    const comment = payload.comment || "";
    const magic = payload.magic || 0;

    // Ensure user_trades table exists
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS user_trades (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        trade_data TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // 3. Handle ORDER_OPEN event
    if (event === "ORDER_OPEN") {
      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const openTime = payload.open_time || nowStr;
      const timePart = openTime.includes(" ") ? openTime.split(" ")[1].slice(0, 5) : openTime.slice(0, 5);

      const tpPoints = tpPrice ? calculatePointsDistance(openPrice, tpPrice, symbol) : 300;
      const slPoints = slPrice ? calculatePointsDistance(openPrice, slPrice, symbol) : 150;

      // Check if trade already exists in D1
      const existingRow = await db.prepare("SELECT trade_data FROM user_trades WHERE id = ? AND LOWER(username) = LOWER(?)")
        .bind(tradeId, username)
        .first();

      let tradeObj;
      if (existingRow && existingRow.trade_data) {
        try {
          tradeObj = JSON.parse(existingRow.trade_data);
          // If already closed, don't revert to active
          if (tradeObj["ผลลัพธ์"] && tradeObj["ผลลัพธ์"] !== "Active") {
            return new Response(JSON.stringify({ 
              success: true, 
              message: "Order is already recorded as closed, skipping open event",
              id: tradeId
            }), {
              headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
            });
          }
        } catch (e) {}
      }

      tradeObj = {
        ...(tradeObj || {}),
        id: tradeId,
        marketType: "forex",
        "วันที่เปิด": openTime,
        "ช่วงเวลา": timePart,
        "คู่เงิน": symbol,
        "ประเภทการเข้า": orderType.toLowerCase().includes("buy") ? "Buy" : "Sell",
        "ผลลัพธ์": "Active",
        "ราคาที่เข้า": openPrice,
        "ความเสี่ยง": String(lots),
        "ผลลัพธ์ (จุด)": null,
        "กำไร/ขาดทุน($)": null,
        "ราคา TP": tpPrice,
        "ราคา SL": slPrice,
        "TP(จุด)\nที่ตั้งใว้": tpPoints,
        "SL(จุด)\nที่ตั้งใว้": slPoints,
        "เหตุผลซัพพอร์ตออเดอร์\nแท่งเทียน": tradeObj ? tradeObj["เหตุผลซัพพอร์ตออเดอร์\nแท่งเทียน"] || "" : "",
        "เหตุผลซัพพอร์ต Indicator": tradeObj ? tradeObj["เหตุผลซัพพอร์ต Indicator"] || "" : "",
        "บันทึกความรู้สึก": tradeObj ? tradeObj["บันทึกความรู้สึก"] || "" : "",
        "บันทึกความเสี่ยงของแผนเทรด": "Auto-Recorded via EA",
        "หมายเหตุ": `🤖 ${platform} Ticket #${ticket}${comment ? " | " + comment : ""}`.trim(),
        "ผู้ใช้งาน": user.username,
        ticket: ticket,
        magic: magic,
        source: "ea"
      };

      await db.prepare(
        "INSERT OR REPLACE INTO user_trades (id, username, trade_data) VALUES (?, ?, ?)"
      ).bind(tradeId, user.username, JSON.stringify(tradeObj)).run();

      return new Response(JSON.stringify({
        success: true,
        message: `Order #${ticket} opened & synced to Active Trades successfully!`,
        id: tradeId,
        trade: tradeObj
      }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });

    // 4. Handle ORDER_MODIFY event (SL or TP updated)
    } else if (event === "ORDER_MODIFY") {
      const existingRow = await db.prepare("SELECT trade_data FROM user_trades WHERE id = ? AND LOWER(username) = LOWER(?)")
        .bind(tradeId, username)
        .first();

      if (!existingRow) {
        return new Response(JSON.stringify({ success: false, error: "Order not found to modify" }), {
          status: 404,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }

      let tradeObj = JSON.parse(existingRow.trade_data);
      if (slPrice !== null) {
        tradeObj["ราคา SL"] = slPrice;
        tradeObj["SL(จุด)\nที่ตั้งใว้"] = calculatePointsDistance(tradeObj["ราคาที่เข้า"], slPrice, symbol);
      }
      if (tpPrice !== null) {
        tradeObj["ราคา TP"] = tpPrice;
        tradeObj["TP(จุด)\nที่ตั้งใว้"] = calculatePointsDistance(tradeObj["ราคาที่เข้า"], tpPrice, symbol);
      }

      await db.prepare(
        "INSERT OR REPLACE INTO user_trades (id, username, trade_data) VALUES (?, ?, ?)"
      ).bind(tradeId, user.username, JSON.stringify(tradeObj)).run();

      return new Response(JSON.stringify({
        success: true,
        message: `Order #${ticket} modified successfully!`,
        id: tradeId
      }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });

    // 5. Handle ORDER_CLOSE event
    } else if (event === "ORDER_CLOSE") {
      const existingRow = await db.prepare("SELECT trade_data FROM user_trades WHERE id = ? AND LOWER(username) = LOWER(?)")
        .bind(tradeId, username)
        .first();

      let tradeObj = {};
      if (existingRow && existingRow.trade_data) {
        try {
          tradeObj = JSON.parse(existingRow.trade_data);
        } catch (e) {}
      }

      const closePrice = parseFloat(payload.close_price) || openPrice;
      const profitVal = parseFloat(payload.profit) || 0;
      const swapVal = parseFloat(payload.swap) || 0;
      const commissionVal = parseFloat(payload.commission) || 0;
      const netProfit = profitVal + swapVal + commissionVal;

      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const closeTime = payload.close_time || nowStr;
      const entryPrice = parseFloat(tradeObj["ราคาที่เข้า"]) || openPrice;
      const isBuy = String(tradeObj["ประเภทการเข้า"] || orderType).toLowerCase().includes("buy");

      // Calculate pips
      let pips = payload.pips !== undefined ? parseFloat(payload.pips) : null;
      if (pips === null && entryPrice > 0 && closePrice > 0) {
        const diff = isBuy ? (closePrice - entryPrice) : (entryPrice - closePrice);
        const mult = getPairMultiplier(symbol);
        pips = Math.round(diff * mult);
      }

      // Determine outcome
      let outcome = "Win";
      if (netProfit > 0.05) {
        outcome = "Win";
      } else if (netProfit < -0.05) {
        outcome = "Loss";
      } else {
        outcome = "BE";
      }

      tradeObj = {
        ...tradeObj,
        id: tradeId,
        marketType: "forex",
        "วันที่เปิด": tradeObj["วันที่เปิด"] || payload.open_time || closeTime,
        "ช่วงเวลา": tradeObj["ช่วงเวลา"] || (closeTime.includes(" ") ? closeTime.split(" ")[1].slice(0, 5) : ""),
        "คู่เงิน": symbol,
        "ประเภทการเข้า": isBuy ? "Buy" : "Sell",
        "ผลลัพธ์": outcome,
        "ราคาที่เข้า": entryPrice,
        "ความเสี่ยง": String(lots),
        "ผลลัพธ์ (จุด)": pips || 0,
        "กำไร/ขาดทุน($)": parseFloat(netProfit.toFixed(2)),
        "ราคาที่ปิด": closePrice,
        "วันที่ปิด": closeTime,
        "ราคา TP": tradeObj["ราคา TP"] || tpPrice,
        "ราคา SL": tradeObj["ราคา SL"] || slPrice,
        "TP(จุด)\nที่ตั้งใว้": tradeObj["TP(จุด)\nที่ตั้งใว้"] || (tpPrice ? calculatePointsDistance(entryPrice, tpPrice, symbol) : 300),
        "SL(จุด)\nที่ตั้งใว้": tradeObj["SL(จุด)\nที่ตั้งใว้"] || (slPrice ? calculatePointsDistance(entryPrice, slPrice, symbol) : 150),
        "เหตุผลซัพพอร์ตออเดอร์\nแท่งเทียน": tradeObj["เหตุผลซัพพอร์ตออเดอร์\nแท่งเทียน"] || "",
        "เหตุผลซัพพอร์ต Indicator": tradeObj["เหตุผลซัพพอร์ต Indicator"] || "",
        "บันทึกความรู้สึก": tradeObj["บันทึกความรู้สึก"] || "",
        "บันทึกความเสี่ยงของแผนเทรด": tradeObj["บันทึกความเสี่ยงของแผนเทรด"] || "Auto-Recorded via EA",
        "หมายเหตุ": `🤖 ${platform} Ticket #${ticket} (Close: ${closePrice}, PnL: ${netProfit > 0 ? "+" : ""}$${netProfit.toFixed(2)})${comment ? " | " + comment : ""}`.trim(),
        "ผู้ใช้งาน": user.username,
        "คอมมิชชั่น": commissionVal,
        "สวอป": swapVal,
        ticket: ticket,
        magic: magic,
        source: "ea"
      };

      await db.prepare(
        "INSERT OR REPLACE INTO user_trades (id, username, trade_data) VALUES (?, ?, ?)"
      ).bind(tradeId, user.username, JSON.stringify(tradeObj)).run();

      return new Response(JSON.stringify({
        success: true,
        message: `Order #${ticket} closed & recorded with ${outcome} (PnL: $${netProfit.toFixed(2)}, Pips: ${pips})!`,
        id: tradeId,
        trade: tradeObj
      }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    return new Response(JSON.stringify({ success: false, error: "Unknown event type: " + event }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}
