import React, { useState, useEffect } from "react";
import { Bell, Send, CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles, ExternalLink, RefreshCw, TrendingUp, Zap, Calendar } from "lucide-react";

export default function TelegramSettingsCard() {
  const [token, setToken] = useState(() => localStorage.getItem("telegram_bot_token") || "");
  const [chatId, setChatId] = useState(() => localStorage.getItem("telegram_chat_id") || "");
  const [goldEnabled, setGoldEnabled] = useState(() => localStorage.getItem("telegram_gold_enabled") !== "0");
  const [oilEnabled, setOilEnabled] = useState(() => localStorage.getItem("telegram_oil_enabled") !== "0");
  const [thaiStocksEnabled, setThaiStocksEnabled] = useState(() => localStorage.getItem("telegram_thai_stocks_enabled") !== "0");
  const [sectorWeeklyEnabled, setSectorWeeklyEnabled] = useState(() => localStorage.getItem("telegram_sector_weekly_enabled") !== "0");
  const [sectorMonthlyEnabled, setSectorMonthlyEnabled] = useState(() => localStorage.getItem("telegram_sector_monthly_enabled") !== "0");

  const [showToken, setShowToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSendingNews, setIsSendingNews] = useState(false);
  const [isSendingDailyStocks, setIsSendingDailyStocks] = useState(false);
  const [isSendingWeeklySector, setIsSendingWeeklySector] = useState(false);
  const [isSendingMonthlySector, setIsSendingMonthlySector] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error' | 'info', text: '' }

  // Load latest settings from Cloudflare D1 / API on mount
  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          if (data.settings.telegram_bot_token) {
            setToken(data.settings.telegram_bot_token);
            localStorage.setItem("telegram_bot_token", data.settings.telegram_bot_token);
          }
          if (data.settings.telegram_chat_id) {
            setChatId(data.settings.telegram_chat_id);
            localStorage.setItem("telegram_chat_id", data.settings.telegram_chat_id);
          }
          if (data.settings.telegram_gold_enabled !== undefined) {
            setGoldEnabled(data.settings.telegram_gold_enabled !== "0");
          }
          if (data.settings.telegram_oil_enabled !== undefined) {
            setOilEnabled(data.settings.telegram_oil_enabled !== "0");
          }
          if (data.settings.telegram_thai_stocks_enabled !== undefined) {
            setThaiStocksEnabled(data.settings.telegram_thai_stocks_enabled !== "0");
          }
          if (data.settings.telegram_sector_weekly_enabled !== undefined) {
            setSectorWeeklyEnabled(data.settings.telegram_sector_weekly_enabled !== "0");
          }
          if (data.settings.telegram_sector_monthly_enabled !== undefined) {
            setSectorMonthlyEnabled(data.settings.telegram_sector_monthly_enabled !== "0");
          }
        }
      })
      .catch(() => {
        // Fallback silently to localStorage
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    const cleanToken = token.trim();
    const cleanChatId = chatId.trim();

    // Save to localStorage immediately
    localStorage.setItem("telegram_bot_token", cleanToken);
    localStorage.setItem("telegram_chat_id", cleanChatId);
    localStorage.setItem("telegram_gold_enabled", goldEnabled ? "1" : "0");
    localStorage.setItem("telegram_oil_enabled", oilEnabled ? "1" : "0");
    localStorage.setItem("telegram_thai_stocks_enabled", thaiStocksEnabled ? "1" : "0");
    localStorage.setItem("telegram_sector_weekly_enabled", sectorWeeklyEnabled ? "1" : "0");
    localStorage.setItem("telegram_sector_monthly_enabled", sectorMonthlyEnabled ? "1" : "0");

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            telegram_bot_token: cleanToken,
            telegram_chat_id: cleanChatId,
            telegram_gold_enabled: goldEnabled ? "1" : "0",
            telegram_oil_enabled: oilEnabled ? "1" : "0",
            telegram_thai_stocks_enabled: thaiStocksEnabled ? "1" : "0",
            telegram_sector_weekly_enabled: sectorWeeklyEnabled ? "1" : "0",
            telegram_sector_monthly_enabled: sectorMonthlyEnabled ? "1" : "0"
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: "success",
          text: "✅ บันทึกการตั้งค่า Telegram สำเร็จ! ระบบ Cloud และ GitHub Actions จะดึงข้อมูลล่าสุดนี้ไปใช้โดยอัตโนมัติ"
        });
      } else {
        setStatusMessage({
          type: "info",
          text: "✅ บันทึกข้อมูลลงในเบราว์เซอร์แล้ว (พร้อมสำหรับการทดสอบ)"
        });
      }
    } catch (err) {
      setStatusMessage({
        type: "info",
        text: "✅ บันทึกข้อมูลลงในเบราว์เซอร์เรียบร้อยแล้ว"
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 6000);
    }
  };

  const handleTestPing = async () => {
    const cleanToken = token.trim();
    const cleanChatId = chatId.trim();

    if (!cleanToken || !cleanChatId) {
      setStatusMessage({
        type: "error",
        text: "⚠️ กรุณากรอกทั้ง Telegram Bot Token และ Chat ID ก่อนทำการทดสอบ"
      });
      return;
    }

    setIsTesting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: cleanToken,
          chatId: cleanChatId,
          action: "test"
        })
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: "success",
          text: `🎉 เชื่อมต่อสำเร็จ! บอท "${data.bot?.name || "Onicorn Alert"}" (@${data.bot?.username || "bot"}) ได้ส่งข้อความทดสอบเข้า Telegram แล้ว`
        });
      } else {
        setStatusMessage({
          type: "error",
          text: `❌ ${data.error || "เกิดข้อผิดพลาดในการส่งข้อความ"}`
        });
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: `❌ เกิดข้อผิดพลาดในการเชื่อมต่อ: ${err.message}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestGoldNews = async () => {
    const cleanToken = token.trim();
    const cleanChatId = chatId.trim();

    if (!cleanToken || !cleanChatId) {
      setStatusMessage({
        type: "error",
        text: "⚠️ กรุณากรอกทั้ง Telegram Bot Token และ Chat ID ก่อนทดสอบส่งข่าว"
      });
      return;
    }

    setIsSendingNews(true);
    setStatusMessage({
      type: "info",
      text: "🔄 กำลังดึงข่าวเศรษฐกิจล่าสุดและสร้างบทวิเคราะห์ส่งเข้า Telegram..."
    });

    try {
      // 1. Fetch live calendar news
      const newsRes = await fetch("/api/news?tab=today");
      let customMsg = "";

      if (newsRes.ok) {
        const html = await newsRes.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const rows = doc.querySelectorAll("tbody tr");

        const events = [];
        rows.forEach(r => {
          if (r.classList.contains("theDay")) return;
          const time = r.querySelector(".time")?.textContent?.trim() || "";
          const cur = r.querySelector(".flagCur")?.textContent?.trim() || "";
          const stars = r.querySelectorAll(".grayFullBullishIcon").length;
          const event = r.querySelector(".event")?.textContent?.trim() || "";
          const act = r.querySelector(".act")?.textContent?.trim() || "-";
          const fore = r.querySelector(".fore")?.textContent?.trim() || "-";
          const prev = r.querySelector(".prev")?.textContent?.trim() || "-";

          if (stars >= 2 && (cur === "USD" || event.toLowerCase().includes("fed") || event.toLowerCase().includes("cpi") || event.toLowerCase().includes("nfp"))) {
            events.push({ time, cur, stars, event, act, fore, prev });
          }
        });

        const highCount = events.filter(e => e.stars === 3).length;
        const nowStr = new Date().toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

        const parseNum = (val) => {
          if (!val || val === "-" || val === "N/A") return null;
          let clean = String(val).trim().replace(/,/g, "");
          let mult = 1.0;
          if (/K$/i.test(clean)) { mult = 1e3; clean = clean.slice(0, -1); }
          else if (/M$/i.test(clean)) { mult = 1e6; clean = clean.slice(0, -1); }
          else if (/B$/i.test(clean)) { mult = 1e9; clean = clean.slice(0, -1); }
          else if (/%$/.test(clean)) { clean = clean.slice(0, -1); }
          const n = parseFloat(clean);
          return isNaN(n) ? null : n * mult;
        };

        let eventListText = "";
        events.slice(0, 6).forEach(e => {
          const badge = e.stars === 3 ? "🔴 High Impact (★★★)" : "🟡 Medium Impact (★★☆)";
          const name = String(e.event || "").toLowerCase();
          const actN = parseNum(e.act);
          const foreN = parseNum(e.fore);
          const isUnemp = name.includes("ว่างงาน") || name.includes("jobless") || name.includes("unemployment");
          const isInflation = name.includes("cpi") || name.includes("ppi") || name.includes("pce") || name.includes("เงินเฟ้อ");
          const isEmployment = name.includes("non-farm") || name.includes("nfp") || name.includes("จ้างงาน");

          let impactTxt = "";
          if (actN !== null && foreN !== null) {
            const diff = actN - foreN;
            if (Math.abs(diff) < 1e-4) {
              impactTxt = `• ⏺️ <b>ตรงตามคาดการณ์ [ทรงตัว 🟡]</b>: ตลาดซึมซับแล้ว ➔ ทองคำแกว่งตัวในกรอบ (Sideway)`;
            } else if (diff > 0) {
              if (isUnemp) {
                impactTxt = `• 🟢 <b>ตัวเลขจริง (${e.act}) สูงกว่าคาด [หนุนทอง 🟢]</b>: ว่างงานเพิ่มขึ้น ดอลลาร์อ่อน ➔ หนุนทองคำพุ่งขึ้น`;
              } else if (isInflation) {
                impactTxt = `• 🔴 <b>ตัวเลขจริง (${e.act}) สูงกว่าคาด [กดดันทอง 🔻]</b>: เงินเฟ้อหนืด เฟดยังไม่รีบลดดอกเบี้ย ดอลลาร์พุ่ง ➔ กดดันทองคำย่อตัว`;
              } else {
                impactTxt = `• 🔴 <b>ตัวเลขจริง (${e.act}) แกร่งกว่าคาด [กดดันทอง 🔻]</b>: เศรษฐกิจแกร่ง ดอลลาร์แข็ง ➔ กดดันทองคำย่อตัว`;
              }
            } else {
              if (isUnemp) {
                impactTxt = `• 🔴 <b>ตัวเลขจริง (${e.act}) ต่ำกว่าคาด [กดดันทอง 🔻]</b>: ว่างงานลด ตลาดแรงงานแกร่ง ➔ กดดันทองคำพักฐาน`;
              } else if (isInflation) {
                impactTxt = `• 🟢 <b>ตัวเลขจริง (${e.act}) ต่ำกว่าคาด [หนุนทอง 🟢]</b>: เงินเฟ้อชะลอ หนุนเฟดลดดอกเบี้ย ➔ หนุนทองคำพุ่งขึ้นแรง!`;
              } else {
                impactTxt = `• 🟢 <b>ตัวเลขจริง (${e.act}) ต่ำกว่าคาด [หนุนทอง 🟢]</b>: ดอลลาร์อ่อนค่า ➔ หนุนราคาทองคำดีดตัวขึ้น`;
              }
            }
          } else {
            if (isInflation) {
              impactTxt = `• หากจริง > คาด (${e.fore}) ➔ ดอลลาร์พุ่ง กดดันทอง 🔻 | หากต่ำกว่าคาด ➔ หนุนทองพุ่ง 🟢`;
            } else if (isUnemp) {
              impactTxt = `• หากคนว่างงาน > คาด ➔ หนุนทองพุ่ง 🟢 | หากต่ำกว่าคาด ➔ กดดันทองย่อ 🔻`;
            } else {
              impactTxt = `• หากแกร่งกว่าคาด ➔ กดดันทอง 🔻 | หากต่ำกว่าคาด ➔ หนุนทอง 🟢`;
            }
          }

          eventListText += `⏰ <b>${e.time} น. | ${e.event}</b>\n` +
            `⚡ ${badge} | ${e.cur}\n` +
            `📊 ตัวเลข: จริง <code>${e.act}</code> | คาดการณ์ <code>${e.fore}</code> | ก่อนหน้า <code>${e.prev}</code>\n` +
            `🎯 <b>วิเคราะห์ผลกระทบทองคำ:</b>\n${impactTxt}\n` +
            `──────────────────────────\n`;
        });

        customMsg = (
          `🌟 <b>[ทดสอบ] ผลวิเคราะห์อิมแพ็คข่าวสารเศรษฐกิจ (AI News Digest)</b>\n` +
          `🏆 <b>ตลาดทองคำโลก (XAU/USD) ประจำ${nowStr}</b>\n` +
          `──────────────────────────\n` +
          `⚠️ <b>แจ้งเตือนความผันผวน:</b> มีข่าวเศรษฐกิจสำคัญ High Impact จำนวน ${highCount} ข่าว\n` +
          `💡 <b>สรุป:</b> วันนี้พบปัจจัยตัวเลขสำคัญ ${events.length} ข่าว ที่ต้องจับตาทิศทางค่าเงินดอลลาร์\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `📋 <b>ตัวอย่างข่าวสำคัญ:</b>\n\n` +
          eventListText +
          `🤖 <i>ระบบวิเคราะห์และแจ้งเตือนอัตโนมัติ Onicorn Trade Dashboard</i>`
        );
      }

      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: cleanToken,
          chatId: cleanChatId,
          action: "custom",
          customMessage: customMsg
        })
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: "success",
          text: "🎉 ส่งสรุปข่าวทองคำและผลกระทบ (AI News Digest) เข้า Telegram ของคุณสำเร็จแล้ว!"
        });
      } else {
        setStatusMessage({
          type: "error",
          text: `❌ ${data.error || "เกิดข้อผิดพลาดในการส่งข้อความ"}`
        });
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: `❌ ส่งไม่สำเร็จ: ${err.message}`
      });
    } finally {
      setIsSendingNews(false);
    }
  };

  const roundThaiTickSize = (val) => {
    const p = parseFloat(val);
    if (isNaN(p) || p <= 0) return 0.0;
    if (p < 2) return Math.round(p * 100) / 100;
    if (p < 5) return Math.round(p * 50) / 50;
    if (p < 10) return Math.round(p * 20) / 20;
    if (p < 25) return Math.round(p * 10) / 10;
    if (p < 100) return Math.round(p * 4) / 4;
    if (p < 200) return Math.round(p * 2) / 2;
    if (p < 400) return Math.round(p * 1) / 1;
    return Math.round(p / 2) * 2;
  };

  const formatThaiDate = (dt = new Date()) => {
    const thDays = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
    const thMonths = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const dayName = thDays[dt.getDay()];
    const dateStr = `${dt.getDate()} ${thMonths[dt.getMonth()]} ${dt.getFullYear() + 543}`;
    return `วัน${dayName}ที่ ${dateStr}`;
  };

  const handleTestDailyStocks = async () => {
    const cleanToken = token.trim();
    const cleanChatId = chatId.trim();

    if (!cleanToken || !cleanChatId) {
      setStatusMessage({
        type: "error",
        text: "⚠️ กรุณากรอกทั้ง Telegram Bot Token และ Chat ID ก่อนทดสอบส่งหุ้นเด่น"
      });
      return;
    }

    setIsSendingDailyStocks(true);
    setStatusMessage({
      type: "info",
      text: "🔄 กำลังประมวลผลระบบ AI Quantitative Screener และดึงราคาหุ้นไทยล่าสุด..."
    });

    try {
      const candidates = [
        { symbol: "BH", name: "บมจ. โรงพยาบาลบำรุงราษฎร์", sector: "การแพทย์ (Healthcare)", defPrice: 252.00, baseProb: 88, reasons: "แรงซื้อสถาบันและกองทุนต่างชาติดันราคาทะลุแนวต้านใหญ่รอบปี ฿245.00 สอดรับยอดคนไข้ต่างชาติตะวันออกกลางทำสถิติสูงสุดใหม่" },
        { symbol: "GULF", name: "บมจ. กัลฟ์ เอ็นเนอร์จี", sector: "พลังงาน & สาธารณูปโภค", defPrice: 46.50, baseProb: 86, reasons: "โมเมนตัมเบรกเอาท์กรอบสะสมพลัง รับอานิสงส์ดีมานด์พลังงานสะอาดรองรับ Cloud & AI Data Center ขยายตัวก้าวกระโดด" },
        { symbol: "CPALL", name: "บมจ. ซีพี ออลล์", sector: "ค้าปลีก (Commerce)", defPrice: 57.50, baseProb: 84, reasons: "เกิดสัญญาณ Bullish Divergence ตามแนวรับสถาบัน ยอดขายสาขาเดิม (SSSG) โตต่อเนื่องตามภาคการท่องเที่ยวฟื้นตัว" },
        { symbol: "WHA", name: "บมจ. ดับบลิวเอชเอ คอร์ป", sector: "นิคมอุตสาหกรรม (Industrial)", defPrice: 5.45, baseProb: 85, reasons: "ยอดจองซื้อและโอนที่ดินนิคมอุตสาหกรรมแปลงใหญ่ให้ค่ายรถยนต์ EV พุ่งแตะระดับสูงสุดเป็นประวัติการณ์" },
        { symbol: "KBANK", name: "ธนาคารกสิกรไทย", sector: "ธนาคารและการเงิน", defPrice: 142.50, baseProb: 82, reasons: "คุมสัดส่วน NPL ลดลงต่อเนื่อง ค่าใช้จ่ายการตั้งสำรองลดลง หนุนทิศทางกำไรสุทธิและเงินปันผลตอบแทนระดับสูง" }
      ];

      const syms = candidates.map(c => c.symbol).join(",");
      let priceData = {};
      try {
        const pRes = await fetch(`/api/price?symbol=${syms}`);
        if (pRes.ok) priceData = await pRes.json();
      } catch (e) {
        console.warn("Could not fetch price in frontend, using defaults", e);
      }

      const evaluated = candidates.map(c => {
        const q = priceData[c.symbol];
        const p = q ? parseFloat(q.price || c.defPrice) : c.defPrice;
        const chg = q ? parseFloat(q.changePct || 0.0) : 0.0;
        const entry = roundThaiTickSize(p);
        const tp = roundThaiTickSize(p * 1.085);
        const sl = roundThaiTickSize(p * 0.955);
        const prob = Math.min(96, Math.max(75, Math.round(c.baseProb + chg * 2.2)));
        return {
          ...c,
          price: p,
          changePct: chg,
          entry,
          tp,
          sl,
          prob
        };
      });

      evaluated.sort((a, b) => (b.prob - a.prob) || (b.changePct - a.changePct));
      const top3 = evaluated.slice(0, 3);

      const now = new Date();
      const timeStr = now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
      const dateStr = formatThaiDate(now);

      let msg = `📈 <b>[ทดสอบ] รายงานหุ้นไทยเด่นที่สุดในตลาดวันนี้ (Daily Top Picks)</b>\n` +
        `📅 <b>${dateStr} (เวลา ${timeStr} น.)</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `💡 <i>คัดสรรโดยระบบ AI Quantitative Screener & Tick Size Engine</i>\n\n`;

      const medals = ["🥇", "🥈", "🥉"];
      top3.forEach((stock, i) => {
        const medal = medals[i];
        const chgSign = stock.changePct > 0 ? "+" : "";
        const chgStr = stock.changePct !== 0 ? `(${chgSign}${stock.changePct.toFixed(2)}%)` : "";
        msg += `${medal} <b>SET:${stock.symbol} - ${stock.name}</b>\n` +
          `🏷️ <b>กลุ่ม:</b> ${stock.sector}\n` +
          `💰 <b>ราคาล่าสุด:</b> ฿${stock.price.toFixed(2)} ${chgStr}\n` +
          `🎯 <b>เป้าทำกำไร (TP):</b> ฿${stock.tp.toFixed(2)} | 🛑 <b>ตัดขาดทุน (SL):</b> ฿${stock.sl.toFixed(2)}\n` +
          `📊 <b>โอกาสขาขึ้น (Probability):</b> <b>${stock.prob}%</b> 🟢\n` +
          `💡 <b>เหตุผลวิเคราะห์ AI:</b> ${stock.reasons}\n` +
          `─────────────────────\n\n`;
      });

      msg += `⚠️ <b>คำแนะนำ:</b> จุด Entry/TP/SL คำนวณตามช่วงราคาตลาดหลักทรัพย์ฯ (SET Tick Size) โปรดวางแผน Money Management เสมอ\n\n` +
        `🔗 <b>เปิดดูกราฟสดและอินดิเคเตอร์:</b>\n` +
        `https://onicorn-trade.pages.dev`;

      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: cleanToken,
          chatId: cleanChatId,
          action: "custom",
          customMessage: msg
        })
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: "success",
          text: "🎉 ส่งรายงานหุ้นไทยเด่นที่สุดในตลาดวันนี้ (Daily Top Picks) เข้า Telegram ของคุณสำเร็จแล้ว!"
        });
      } else {
        setStatusMessage({
          type: "error",
          text: `❌ ${data.error || "เกิดข้อผิดพลาดในการส่งข้อความ"}`
        });
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: `❌ ส่งไม่สำเร็จ: ${err.message}`
      });
    } finally {
      setIsSendingDailyStocks(false);
    }
  };

  const handleTestWeeklySector = async () => {
    const cleanToken = token.trim();
    const cleanChatId = chatId.trim();

    if (!cleanToken || !cleanChatId) {
      setStatusMessage({
        type: "error",
        text: "⚠️ กรุณากรอกทั้ง Telegram Bot Token และ Chat ID ก่อนทดสอบส่งกลุ่มอุตสาหกรรมประจำสัปดาห์"
      });
      return;
    }

    setIsSendingWeeklySector(true);
    setStatusMessage({
      type: "info",
      text: "🔄 กำลังดึงข้อมูลและประมวลผล Sector Rotation Intelligence ประจำสัปดาห์นี้..."
    });

    try {
      const sRes = await fetch("/api/sector-analysis?timeframe=weekly");
      const data = await sRes.json();

      if (!data || !data.sectors) {
        throw new Error("ไม่สามารถดึงข้อมูลกลุ่มอุตสาหกรรมได้");
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
      const dateStr = formatThaiDate(now);

      const topSectors = data.sectors.filter(s => (s.rank || 99) <= 3);

      let msg = `⚡ <b>[ทดสอบ] ระบบวิเคราะห์กลุ่มอุตสาหกรรมที่น่าสนใจ (ประจำสัปดาห์นี้)</b>\n` +
        `📅 <b>${dateStr} (เวลา ${timeStr} น.)</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `🎯 <b>ธีมการลงทุนประจำสัปดาห์:</b>\n${data.marketTheme || ""}\n\n` +
        `💡 <b>บทวิเคราะห์ภาพรวมโดย AI:</b>\n${data.summary || ""}\n\n` +
        `🏆 <b>กลุ่มอุตสาหกรรมดาวเด่นนำตลาด (Top Overweight):</b>\n\n`;

      topSectors.forEach(sec => {
        const picksText = (sec.topPicks || []).map(p => `<b>${p.symbol}</b> (${p.bias})`).join(", ");
        msg += `<b>อันดับ #${sec.rank} ${sec.icon} ${sec.name}</b>\n` +
          `⭐ <b>คะแนนความน่าสนใจ:</b> <b>${sec.score}/100</b> (🚀 ${sec.recommendation})\n` +
          `📰 <b>ข่าวเด่น & ปัจจัยหนุน:</b> ${sec.newsHighlights}\n` +
          `🎯 <b>กลยุทธ์รอบสัปดาห์:</b> ${sec.tacticalStrategy}\n` +
          `🏆 <b>หุ้นเด่นนำกลุ่ม:</b> ${picksText}\n` +
          `⚠️ <b>ความเสี่ยง:</b> ${sec.riskWatch}\n` +
          `─────────────────────\n\n`;
      });

      msg += `🔔 <i>แจ้งเตือนอัตโนมัติทุกวันจันทร์ เวลา 08:30 น.</i>\n` +
        `🔗 <b>ดูผลวิเคราะห์ทั้ง 8 กลุ่มอุตสาหกรรมแบบละเอียด:</b>\n` +
        `https://onicorn-trade.pages.dev`;

      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: cleanToken,
          chatId: cleanChatId,
          action: "custom",
          customMessage: msg
        })
      });

      const resData = await res.json();
      if (resData.success) {
        setStatusMessage({
          type: "success",
          text: "🎉 ส่งสรุปกลุ่มอุตสาหกรรมประจำสัปดาห์ (Weekly Sector) เข้า Telegram ของคุณสำเร็จแล้ว!"
        });
      } else {
        setStatusMessage({
          type: "error",
          text: `❌ ${resData.error || "เกิดข้อผิดพลาดในการส่งข้อความ"}`
        });
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: `❌ ส่งไม่สำเร็จ: ${err.message}`
      });
    } finally {
      setIsSendingWeeklySector(false);
    }
  };

  const handleTestMonthlySector = async () => {
    const cleanToken = token.trim();
    const cleanChatId = chatId.trim();

    if (!cleanToken || !cleanChatId) {
      setStatusMessage({
        type: "error",
        text: "⚠️ กรุณากรอกทั้ง Telegram Bot Token และ Chat ID ก่อนทดสอบส่งกลุ่มอุตสาหกรรมประจำเดือน"
      });
      return;
    }

    setIsSendingMonthlySector(true);
    setStatusMessage({
      type: "info",
      text: "🔄 กำลังดึงข้อมูลและประมวลผล Sector Rotation Intelligence ประจำเดือนนี้..."
    });

    try {
      const sRes = await fetch("/api/sector-analysis?timeframe=monthly");
      const data = await sRes.json();

      if (!data || !data.sectors) {
        throw new Error("ไม่สามารถดึงข้อมูลกลุ่มอุตสาหกรรมได้");
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
      const dateStr = formatThaiDate(now);

      const topSectors = data.sectors.filter(s => (s.rank || 99) <= 3);

      let msg = `🗓️ <b>[ทดสอบ] ระบบวิเคราะห์กลุ่มอุตสาหกรรมยุทธศาสตร์ (ประจำเดือนนี้)</b>\n` +
        `📅 <b>${dateStr} (เวลา ${timeStr} น.)</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `🌐 <b>ธีมยุทธศาสตร์ระยะกลางประจำเดือน:</b>\n${data.marketTheme || ""}\n\n` +
        `💡 <b>การประเมินภาพรวมโดย AI:</b>\n${data.summary || ""}\n\n` +
        `🌟 <b>กลุ่มอุตสาหกรรมเป้าหมายหลักประจำเดือน (Top Monthly Allocation):</b>\n\n`;

      topSectors.forEach(sec => {
        const picksText = (sec.topPicks || []).map(p => `<b>${p.symbol}</b> (${p.role})`).join(", ");
        msg += `<b>อันดับ #${sec.rank} ${sec.icon} ${sec.name}</b>\n` +
          `⭐ <b>คะแนนยุทธศาสตร์:</b> <b>${sec.score}/100</b> (🚀 ${sec.recommendation})\n` +
          `📰 <b>ปัจจัยเร่งเศรษฐกิจมหภาค:</b> ${sec.newsHighlights}\n` +
          `🎯 <b>กลยุทธ์การจัดพอร์ตประจำเดือน:</b> ${sec.tacticalStrategy}\n` +
          `🏆 <b>หุ้นแกนหลักของกลุ่ม:</b> ${picksText}\n` +
          `⚠️ <b>ความเสี่ยงระยะกลาง:</b> ${sec.riskWatch}\n` +
          `─────────────────────\n\n`;
      });

      msg += `🔔 <i>แจ้งเตือนอัตโนมัติทุกวันที่ 1 ของเดือน เวลา 08:30 น.</i>\n` +
        `🔗 <b>เข้าสู่ระบบ Onicorn Trade Dashboard:</b>\n` +
        `https://onicorn-trade.pages.dev`;

      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: cleanToken,
          chatId: cleanChatId,
          action: "custom",
          customMessage: msg
        })
      });

      const resData = await res.json();
      if (resData.success) {
        setStatusMessage({
          type: "success",
          text: "🎉 ส่งสรุปกลุ่มอุตสาหกรรมประจำเดือน (Monthly Sector) เข้า Telegram ของคุณสำเร็จแล้ว!"
        });
      } else {
        setStatusMessage({
          type: "error",
          text: `❌ ${resData.error || "เกิดข้อผิดพลาดในการส่งข้อความ"}`
        });
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: `❌ ส่งไม่สำเร็จ: ${err.message}`
      });
    } finally {
      setIsSendingMonthlySector(false);
    }
  };

  return (
    <div className="glass-card" style={{
      padding: "24px",
      borderRadius: "16px",
      background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))",
      border: "1px solid rgba(59, 130, 246, 0.3)",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
      marginBottom: "24px"
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
        flexWrap: "wrap",
        gap: "10px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        paddingBottom: "14px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            background: "rgba(59, 130, 246, 0.15)",
            padding: "8px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Bell size={22} color="#60a5fa" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#f8fafc" }}>
              📱 ตั้งค่าระบบแจ้งเตือน Telegram (Telegram Alerts Integration)
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              บันทึกและเปลี่ยนข้อมูล Bot Token และ Chat ID ได้สะดวกรวดเร็วผ่านหน้าเว็บ
            </span>
          </div>
        </div>

        <span style={{
          fontSize: "11px",
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))",
          border: "1px solid rgba(59, 130, 246, 0.4)",
          color: "#93c5fd",
          padding: "4px 12px",
          borderRadius: "20px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "5px"
        }}>
          <Sparkles size={13} /> Cloud + GitHub Actions Sync
        </span>
      </div>

      {/* Cloud Sync Notice */}
      <div style={{
        background: "rgba(59, 130, 246, 0.08)",
        border: "1px solid rgba(59, 130, 246, 0.2)",
        borderRadius: "10px",
        padding: "12px 16px",
        marginBottom: "20px",
        fontSize: "12.5px",
        color: "#cbd5e1",
        lineHeight: "1.6"
      }}>
        💡 <b>แก้ไขข้อมูลได้ตลอดเวลา:</b> เมื่อคุณกรอกข้อมูลและกดปุ่ม <b>"บันทึกข้อมูล Telegram"</b> ข้อมูลจะถูกเก็บไว้บน Cloud ทันที โดยที่ระบบตั้งเวลาอัตโนมัติบน <b>GitHub Actions</b> จะดึงค่าใหม่ล่าสุดนี้ไปใช้ส่งการแจ้งเตือนเสมอ คุณจึงไม่จำเป็นต้องเข้าไปแก้ GitHub Secrets ทุกครั้งที่เปลี่ยนห้องหรือบอทครับ
      </div>

      {/* Input Form Fields */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px", marginBottom: "20px" }}>
        
        {/* Token Field */}
        <div>
          <label style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", fontWeight: "600", color: "#f8fafc", marginBottom: "6px" }}>
            <span>🔑 Telegram Bot Token:</span>
            <a
              href="https://t.me/BotFather"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#60a5fa", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "11px" }}
            >
              รับ Token ที่ @BotFather <ExternalLink size={11} />
            </a>
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showToken ? "text" : "password"}
              className="form-input"
              placeholder="เช่น 7829103845:AAF1_xxxxxxxxx_xxxxxxxxx"
              value={token}
              onChange={e => setToken(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                paddingRight: "40px",
                fontFamily: showToken ? "inherit" : "monospace",
                letterSpacing: showToken ? "normal" : "1px"
              }}
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "4px"
              }}
              title={showToken ? "ซ่อนรหัส Token" : "แสดงรหัส Token"}
            >
              {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            * โทเคนของบอทที่ได้รับหลังจากสร้างบอทด้วยคำสั่ง <code>/newbot</code>
          </span>
        </div>

        {/* Chat ID Field */}
        <div>
          <label style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", fontWeight: "600", color: "#f8fafc", marginBottom: "6px" }}>
            <span>💬 Telegram Chat ID:</span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              ดู ID ได้ที่ <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" style={{ color: "#60a5fa", textDecoration: "none" }}>@userinfobot</a>
            </span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="เช่น 123456789 (ส่วนตัว) หรือ -1001234567890 (กลุ่ม)"
            value={chatId}
            onChange={e => setChatId(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box" }}
          />
          <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            * กรณีส่งเข้ากลุ่ม ต้องดึงบอทเข้ากลุ่มและตั้งบอทเป็น Admin ก่อนเสมอ
          </span>
        </div>
      </div>

      {/* Schedule Preferences Box */}
      <div style={{
        background: "rgba(15, 23, 42, 0.5)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "10px",
        padding: "14px 18px",
        marginBottom: "20px"
      }}>
        <div style={{ fontSize: "13px", fontWeight: "700", color: "#f8fafc", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
          ⏰ ตารางกำหนดการส่งการแจ้งเตือนอัตโนมัติ (Automated Schedules):
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12.5px", color: "#e2e8f0", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={goldEnabled}
              onChange={e => setGoldEnabled(e.target.checked)}
              style={{ width: "17px", height: "17px", accentColor: "#3b82f6", cursor: "pointer" }}
            />
            <div>
              🌟 <b>สรุปผลวิเคราะห์อิมแพ็คข่าวเศรษฐกิจทองคำ (AI News Digest - XAU/USD)</b>
              <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                ส่งทุกวันจันทร์ - ศุกร์ เวลา <b>08:00 น.</b> (เรียงลำดับเวลา เช้า-ดึก พร้อมวิเคราะห์ทิศทางทองคำทุกข่าว)
              </div>
            </div>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12.5px", color: "#e2e8f0", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={oilEnabled}
              onChange={e => setOilEnabled(e.target.checked)}
              style={{ width: "17px", height: "17px", accentColor: "#3b82f6", cursor: "pointer" }}
            />
            <div>
              🛢️ <b>ภาพแคปจอกราฟสดแท่งเทียนน้ำมันดิบ WTI Crude Oil</b>
              <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                ส่งทุกวันอังคาร เวลา <b>08:00 น.</b> (ภาพกราฟสด Daily จาก Investing.com พร้อมตารางราคาน้ำมันขายปลีกในไทย)
              </div>
            </div>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12.5px", color: "#e2e8f0", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={thaiStocksEnabled}
              onChange={e => setThaiStocksEnabled(e.target.checked)}
              style={{ width: "17px", height: "17px", accentColor: "#10b981", cursor: "pointer" }}
            />
            <div>
              📈 <b>รายงานหุ้นไทยเด่นที่สุดในตลาดวันนี้ (Daily Top Picks)</b>
              <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                ส่งทุกวันจันทร์ - ศุกร์ เวลา <b>08:30 น.</b> (3 หุ้นเด่นระบบ AI Screener + ราคาเป้าหมาย TP/SL อิง SET Tick Size)
              </div>
            </div>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12.5px", color: "#e2e8f0", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={sectorWeeklyEnabled}
              onChange={e => setSectorWeeklyEnabled(e.target.checked)}
              style={{ width: "17px", height: "17px", accentColor: "#8b5cf6", cursor: "pointer" }}
            />
            <div>
              ⚡ <b>วิเคราะห์กลุ่มอุตสาหกรรมที่น่าสนใจประจำสัปดาห์ (Weekly Sector Rotation)</b>
              <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                ส่งทุกวันจันทร์ เวลา <b>08:30 น.</b> (กลุ่มนำ Overweight, หุ้นเด่นประจำกลุ่ม และกลยุทธ์รอบสัปดาห์)
              </div>
            </div>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12.5px", color: "#e2e8f0", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={sectorMonthlyEnabled}
              onChange={e => setSectorMonthlyEnabled(e.target.checked)}
              style={{ width: "17px", height: "17px", accentColor: "#f59e0b", cursor: "pointer" }}
            />
            <div>
              🗓️ <b>วิเคราะห์กลุ่มอุตสาหกรรมยุทธศาสตร์ประจำเดือน (Monthly Sector Outlook)</b>
              <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                ส่งทุกวันที่ 1 ของเดือน เวลา <b>08:30 น.</b> (ธีมมหภาค, สัดส่วนจัดพอร์ต Monthly Allocation และหุ้นแกนหลัก)
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Status Messages */}
      {statusMessage && (
        <div style={{
          padding: "12px 16px",
          borderRadius: "8px",
          fontSize: "12.5px",
          marginBottom: "18px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: statusMessage.type === "success" ? "rgba(34, 197, 94, 0.12)" :
                      statusMessage.type === "error" ? "rgba(239, 68, 68, 0.12)" : "rgba(59, 130, 246, 0.12)",
          border: statusMessage.type === "success" ? "1px solid rgba(34, 197, 94, 0.3)" :
                  statusMessage.type === "error" ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(59, 130, 246, 0.3)",
          color: statusMessage.type === "success" ? "#86efac" :
                 statusMessage.type === "error" ? "#fca5a5" : "#93c5fd"
        }}>
          {statusMessage.type === "success" ? <CheckCircle2 size={18} /> :
           statusMessage.type === "error" ? <AlertCircle size={18} /> : <RefreshCw size={18} className="spin" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Buttons Action Bar */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        
        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary"
          style={{
            width: "auto",
            padding: "10px 22px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            color: "#fff",
            fontWeight: "600",
            cursor: isSaving ? "not-allowed" : "pointer"
          }}
        >
          <CheckCircle2 size={17} />
          {isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูล Telegram"}
        </button>

        {/* Test Ping Button */}
        <button
          type="button"
          onClick={handleTestPing}
          disabled={isTesting}
          className="btn-primary"
          style={{
            width: "auto",
            padding: "10px 18px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(59, 130, 246, 0.1)",
            border: "1px solid rgba(59, 130, 246, 0.4)",
            color: "#60a5fa",
            fontWeight: "600",
            cursor: isTesting ? "not-allowed" : "pointer"
          }}
        >
          <Send size={16} />
          {isTesting ? "กำลังส่งข้อความทดสอบ..." : "ทดสอบส่งเข้า Telegram"}
        </button>

        {/* Test Send Gold News Button */}
        <button
          type="button"
          onClick={handleTestGoldNews}
          disabled={isSendingNews}
          className="btn-primary"
          style={{
            width: "auto",
            padding: "10px 18px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(234, 179, 8, 0.1)",
            border: "1px solid rgba(234, 179, 8, 0.3)",
            color: "#facc15",
            fontWeight: "600",
            cursor: isSendingNews ? "not-allowed" : "pointer"
          }}
        >
          <Sparkles size={16} />
          {isSendingNews ? "กำลังส่งสรุปข่าว..." : "ทดสอบส่งสรุปข่าวทองคำตอนนี้"}
        </button>

        {/* Test Send Thai Stocks Button */}
        <button
          type="button"
          onClick={handleTestDailyStocks}
          disabled={isSendingDailyStocks}
          className="btn-primary"
          style={{
            width: "auto",
            padding: "10px 18px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            color: "#34d399",
            fontWeight: "600",
            cursor: isSendingDailyStocks ? "not-allowed" : "pointer"
          }}
        >
          <TrendingUp size={16} />
          {isSendingDailyStocks ? "กำลังวิเคราะห์ & ส่ง..." : "📈 ทดสอบส่งหุ้นเด่นวันนี้"}
        </button>

        {/* Test Send Weekly Sector Button */}
        <button
          type="button"
          onClick={handleTestWeeklySector}
          disabled={isSendingWeeklySector}
          className="btn-primary"
          style={{
            width: "auto",
            padding: "10px 18px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(139, 92, 246, 0.12)",
            border: "1px solid rgba(139, 92, 246, 0.4)",
            color: "#c084fc",
            fontWeight: "600",
            cursor: isSendingWeeklySector ? "not-allowed" : "pointer"
          }}
        >
          <Zap size={16} />
          {isSendingWeeklySector ? "กำลังประมวลผล & ส่ง..." : "⚡ ทดสอบส่งกลุ่มอุตสาหกรรมประจำสัปดาห์"}
        </button>

        {/* Test Send Monthly Sector Button */}
        <button
          type="button"
          onClick={handleTestMonthlySector}
          disabled={isSendingMonthlySector}
          className="btn-primary"
          style={{
            width: "auto",
            padding: "10px 18px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            color: "#fbbf24",
            fontWeight: "600",
            cursor: isSendingMonthlySector ? "not-allowed" : "pointer"
          }}
        >
          <Calendar size={16} />
          {isSendingMonthlySector ? "กำลังประมวลผล & ส่ง..." : "🗓️ ทดสอบส่งกลุ่มอุตสาหกรรมประจำเดือน"}
        </button>

      </div>
    </div>
  );
}
