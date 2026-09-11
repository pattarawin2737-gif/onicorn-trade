import React, { useState, useEffect } from "react";
import { Bell, Send, CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles, ExternalLink, RefreshCw } from "lucide-react";

export default function TelegramSettingsCard() {
  const [token, setToken] = useState(() => localStorage.getItem("telegram_bot_token") || "");
  const [chatId, setChatId] = useState(() => localStorage.getItem("telegram_chat_id") || "");
  const [goldEnabled, setGoldEnabled] = useState(() => localStorage.getItem("telegram_gold_enabled") !== "0");
  const [oilEnabled, setOilEnabled] = useState(() => localStorage.getItem("telegram_oil_enabled") !== "0");

  const [showToken, setShowToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSendingNews, setIsSendingNews] = useState(false);
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

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            telegram_bot_token: cleanToken,
            telegram_chat_id: cleanChatId,
            telegram_gold_enabled: goldEnabled ? "1" : "0",
            telegram_oil_enabled: oilEnabled ? "1" : "0"
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

      </div>
    </div>
  );
}
