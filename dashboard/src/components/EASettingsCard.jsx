import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Eye, EyeOff, RefreshCw, ExternalLink } from "lucide-react";

export default function EASettingsCard({ currentUser }) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [showToken, setShowToken] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // { type: 'success' | 'error' | 'info', text: '' }
  const [isTesting, setIsTesting] = useState(false);
  const [viewCodeModal, setViewCodeModal] = useState(null); // 'mt4' | 'mt5' | null
  const [codeContent, setCodeContent] = useState("");
  const [isLoadingCode, setIsLoadingCode] = useState(false);

  // Derive username and token
  const username = (currentUser && currentUser.username) 
    ? currentUser.username 
    : (() => {
        try {
          const u = sessionStorage.getItem("trader_user");
          return u ? JSON.parse(u).username : "pattarawin";
        } catch {
          return "pattarawin";
        }
      })();

  const token = (() => {
    try {
      const savedPass = localStorage.getItem("saved_remember") === "1" 
        ? atob(localStorage.getItem("saved_password") || "") 
        : "";
      return sessionStorage.getItem("trader_token") || savedPass || "123456";
    } catch {
      return "123456";
    }
  })();

  const serverDomain = "https://onicorn-trade.pages.dev";
  const apiUrl = `${serverDomain}/api/ea-sync`;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleTestPing = async () => {
    setIsTesting(true);
    setTestStatus({ type: "info", text: "กำลังส่งสัญญาณ PING ไปยัง API Server..." });
    try {
      const res = await fetch("/api/ea-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          token: token,
          event: "PING"
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus({
          type: "success",
          text: `✅ เชื่อมต่อสำเร็จ! ระบบตรวจสอบสิทธิ์บัญชี '${data.user || username}' ถูกต้องและพร้อมรับข้อมูลออเดอร์จาก MT4 / MT5`
        });
      } else {
        setTestStatus({
          type: "error",
          text: `❌ การทดสอบล้มเหลว: ${data.error || "ไม่สามารถยืนยันตัวตนได้"}`
        });
      }
    } catch (err) {
      setTestStatus({
        type: "error",
        text: `❌ เกิดข้อผิดพลาดในการเชื่อมต่อ: ${err.message}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleOpenSourceCode = async (platform) => {
    setViewCodeModal(platform);
    setIsLoadingCode(true);
    setCodeContent("");
    try {
      const fileName = platform === "mt4" ? "Onicorn_AutoJournal_MT4.mq4" : "Onicorn_AutoJournal_MT5.mq5";
      const res = await fetch(`/ea/${fileName}`);
      if (res.ok) {
        const text = await res.text();
        setCodeContent(text);
      } else {
        setCodeContent(`// ไม่สามารถโหลดโค้ดได้ กรุณาดาวน์โหลดไฟล์โดยตรง`);
      }
    } catch (e) {
      setCodeContent(`// Error loading file: ${e.message}`);
    } finally {
      setIsLoadingCode(false);
    }
  };

  return (
    <div className="glass-card" style={{
      padding: "24px",
      borderRadius: "16px",
      background: "linear-gradient(135deg, rgba(30, 41, 59, 0.75), rgba(15, 23, 42, 0.85))",
      border: "1px solid rgba(59, 130, 246, 0.35)",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
      marginBottom: "24px"
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "18px",
        flexWrap: "wrap",
        gap: "12px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        paddingBottom: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(37, 99, 235, 0.35))",
            padding: "10px",
            borderRadius: "12px",
            fontSize: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(59, 130, 246, 0.4)"
          }}>
            🤖
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "700", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
              เชื่อมต่อ MetaTrader 4 / 5 (Auto-Journal EA)
              <span style={{
                fontSize: "11px",
                background: "rgba(34, 197, 94, 0.2)",
                color: "#4ade80",
                border: "1px solid rgba(34, 197, 94, 0.4)",
                padding: "2px 8px",
                borderRadius: "10px",
                fontWeight: "600"
              }}>
                รองรับ MT4 & MT5
              </span>
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", display: "block" }}>
              ระบบบันทึกไม้เทรดอัตโนมัติ (เปิดไม้, แก้ไข SL/TP, ปิดไม้รับกำไร/ขาดทุน PnL) บันทึกเข้า Onicorn Trade ทันที
            </span>
          </div>
        </div>

        <button
          onClick={handleTestPing}
          disabled={isTesting}
          style={{
            background: "rgba(59, 130, 246, 0.15)",
            border: "1px solid rgba(59, 130, 246, 0.4)",
            color: "#60a5fa",
            padding: "8px 14px",
            borderRadius: "8px",
            cursor: isTesting ? "wait" : "pointer",
            fontSize: "12px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s ease"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.25)"}
          onMouseOut={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)"}
        >
          <RefreshCw size={14} className={isTesting ? "animate-spin" : ""} />
          {isTesting ? "กำลังทดสอบ..." : "🧪 ทดสอบเชื่อมต่อ API (Test Ping)"}
        </button>
      </div>

      {/* Alert Status Message */}
      {testStatus && (
        <div style={{
          padding: "12px 16px",
          borderRadius: "10px",
          marginBottom: "18px",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: testStatus.type === "success" 
            ? "rgba(34, 197, 94, 0.12)" 
            : testStatus.type === "error" 
              ? "rgba(239, 68, 68, 0.12)" 
              : "rgba(59, 130, 246, 0.12)",
          border: `1px solid ${
            testStatus.type === "success" 
              ? "rgba(34, 197, 94, 0.3)" 
              : testStatus.type === "error" 
                ? "rgba(239, 68, 68, 0.3)" 
                : "rgba(59, 130, 246, 0.3)"
          }`,
          color: testStatus.type === "success" 
            ? "#4ade80" 
            : testStatus.type === "error" 
              ? "#f87171" 
              : "#60a5fa"
        }}>
          {testStatus.type === "success" && <CheckCircle2 size={18} />}
          {testStatus.type === "error" && <AlertCircle size={18} />}
          {testStatus.type === "info" && <RefreshCw size={18} className="animate-spin" />}
          <span>{testStatus.text}</span>
        </div>
      )}

      {/* Connection Parameters Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "14px",
        marginBottom: "20px"
      }}>
        {/* WebRequest Allow URL */}
        <div style={{
          background: "rgba(15, 23, 42, 0.6)",
          padding: "14px",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600" }}>
              🌐 1. Allow WebRequest URL (สำหรับ MT4/MT5 Options)
            </span>
            <button
              onClick={() => copyToClipboard(serverDomain, "serverDomain")}
              style={{
                background: copiedKey === "serverDomain" ? "#22c55e" : "rgba(255, 255, 255, 0.08)",
                border: "none",
                borderRadius: "6px",
                padding: "3px 8px",
                fontSize: "11px",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              {copiedKey === "serverDomain" ? "✓ คัดลอกแล้ว" : "คัดลอก"}
            </button>
          </div>
          <code style={{
            fontSize: "12px",
            color: "#38bdf8",
            background: "rgba(0, 0, 0, 0.3)",
            padding: "6px 8px",
            borderRadius: "6px",
            wordBreak: "break-all"
          }}>
            {serverDomain}
          </code>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            * ติ๊ก Allow WebRequest ใน MT4/MT5 แล้วเพิ่ม URL นี้
          </span>
        </div>

        {/* Server API URL */}
        <div style={{
          background: "rgba(15, 23, 42, 0.6)",
          padding: "14px",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600" }}>
              🎯 2. Server API URL (InpServerUrl ใน EA)
            </span>
            <button
              onClick={() => copyToClipboard(apiUrl, "apiUrl")}
              style={{
                background: copiedKey === "apiUrl" ? "#22c55e" : "rgba(255, 255, 255, 0.08)",
                border: "none",
                borderRadius: "6px",
                padding: "3px 8px",
                fontSize: "11px",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              {copiedKey === "apiUrl" ? "✓ คัดลอกแล้ว" : "คัดลอก"}
            </button>
          </div>
          <code style={{
            fontSize: "12px",
            color: "#a78bfa",
            background: "rgba(0, 0, 0, 0.3)",
            padding: "6px 8px",
            borderRadius: "6px",
            wordBreak: "break-all"
          }}>
            {apiUrl}
          </code>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            * ค่าเริ่มต้นใน EA ตั้งค่าไว้อัตโนมัติแล้ว
          </span>
        </div>

        {/* InpUsername */}
        <div style={{
          background: "rgba(15, 23, 42, 0.6)",
          padding: "14px",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600" }}>
              👤 3. Username (InpUsername ในหน้า Inputs EA)
            </span>
            <button
              onClick={() => copyToClipboard(username, "username")}
              style={{
                background: copiedKey === "username" ? "#22c55e" : "rgba(255, 255, 255, 0.08)",
                border: "none",
                borderRadius: "6px",
                padding: "3px 8px",
                fontSize: "11px",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              {copiedKey === "username" ? "✓ คัดลอกแล้ว" : "คัดลอก"}
            </button>
          </div>
          <div style={{
            fontSize: "14px",
            fontWeight: "700",
            color: "#f8fafc",
            background: "rgba(0, 0, 0, 0.3)",
            padding: "6px 10px",
            borderRadius: "6px"
          }}>
            {username}
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            * ใส่ในช่อง InpUsername ในหน้าต่าง Inputs ของ EA
          </span>
        </div>

        {/* InpApiToken */}
        <div style={{
          background: "rgba(15, 23, 42, 0.6)",
          padding: "14px",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600" }}>
              🔑 4. รหัสผ่าน/Token (InpApiToken ในหน้า Inputs EA)
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "none",
                  borderRadius: "6px",
                  padding: "3px 6px",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {showToken ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button
                onClick={() => copyToClipboard(token, "token")}
                style={{
                  background: copiedKey === "token" ? "#22c55e" : "rgba(255, 255, 255, 0.08)",
                  border: "none",
                  borderRadius: "6px",
                  padding: "3px 8px",
                  fontSize: "11px",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                {copiedKey === "token" ? "✓ คัดลอกแล้ว" : "คัดลอก"}
              </button>
            </div>
          </div>
          <div style={{
            fontSize: "13px",
            fontFamily: "monospace",
            color: "#fbbf24",
            background: "rgba(0, 0, 0, 0.3)",
            padding: "6px 10px",
            borderRadius: "6px"
          }}>
            {showToken ? token : "••••••••••••"}
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            * ใส่ในช่อง InpApiToken หรือใช้รหัสผ่านล็อกอินของคุณ
          </span>
        </div>
      </div>

      {/* Download & Source Code Actions */}
      <div style={{
        background: "rgba(15, 23, 42, 0.4)",
        border: "1px solid rgba(59, 130, 246, 0.25)",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "20px"
      }}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "700", color: "#f8fafc" }}>
          📥 ดาวน์โหลดไฟล์ EA หรือคัดลอกซอร์สโค้ด (Download & Source Code)
        </h4>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "12px"
        }}>
          {/* MT4 EA Box */}
          <div style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            borderRadius: "10px",
            padding: "14px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "18px" }}>📈</span>
                <strong style={{ fontSize: "14px", color: "#fff" }}>MetaTrader 4 (MT4)</strong>
              </div>
              <span style={{ fontSize: "11px", color: "#60a5fa", background: "rgba(59, 130, 246, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
                .mq4
              </span>
            </div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              ไฟล์ EA สำหรับ MT4: Onicorn_AutoJournal_MT4.mq4
            </span>
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <a
                href="/ea/Onicorn_AutoJournal_MT4.mq4"
                download="Onicorn_AutoJournal_MT4.mq4"
                style={{
                  flex: 1,
                  textAlign: "center",
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  color: "#fff",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "600",
                  textDecoration: "none",
                  boxShadow: "0 2px 6px rgba(59, 130, 246, 0.3)"
                }}
              >
                📥 ดาวน์โหลด .mq4
              </a>
              <button
                type="button"
                onClick={() => handleOpenSourceCode("mt4")}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "var(--text-secondary)",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
              >
                ดูซอร์สโค้ด
              </button>
            </div>
          </div>

          {/* MT5 EA Box */}
          <div style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            borderRadius: "10px",
            padding: "14px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "18px" }}>🚀</span>
                <strong style={{ fontSize: "14px", color: "#fff" }}>MetaTrader 5 (MT5)</strong>
              </div>
              <span style={{ fontSize: "11px", color: "#c084fc", background: "rgba(168, 85, 247, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
                .mq5
              </span>
            </div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              ไฟล์ EA สำหรับ MT5: Onicorn_AutoJournal_MT5.mq5
            </span>
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <a
                href="/ea/Onicorn_AutoJournal_MT5.mq5"
                download="Onicorn_AutoJournal_MT5.mq5"
                style={{
                  flex: 1,
                  textAlign: "center",
                  background: "linear-gradient(135deg, #a855f7, #7e22ce)",
                  color: "#fff",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "600",
                  textDecoration: "none",
                  boxShadow: "0 2px 6px rgba(168, 85, 247, 0.3)"
                }}
              >
                📥 ดาวน์โหลด .mq5
              </a>
              <button
                type="button"
                onClick={() => handleOpenSourceCode("mt5")}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "var(--text-secondary)",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
              >
                ดูซอร์สโค้ด
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Step by Step Guide */}
      <div style={{
        background: "rgba(15, 23, 42, 0.4)",
        borderRadius: "12px",
        padding: "16px",
        border: "1px solid rgba(255, 255, 255, 0.06)"
      }}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "700", color: "#f8fafc" }}>
          📖 ขั้นตอนการติดตั้งและเปิดใช้งานใน 4 สเต็ปง่ายๆ
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px", color: "var(--text-secondary)" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <span style={{
              background: "#3b82f6",
              color: "#fff",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: "700",
              flexShrink: 0,
              marginTop: "1px"
            }}>1</span>
            <div>
              <strong style={{ color: "#fff" }}>นำไฟล์ EA ไปใส่ใน MetaTrader:</strong> เปิด MT4 หรือ MT5 ไปที่เมนู <code style={{ color: "#60a5fa" }}>File ➔ Open Data Folder</code> แล้วเข้าไปที่โฟลเดอร์ <code style={{ color: "#60a5fa" }}>MQL4/Experts</code> (สำหรับ MT4) หรือ <code style={{ color: "#c084fc" }}>MQL5/Experts</code> (สำหรับ MT5) วางไฟล์แล้วกด Compile ใน MetaEditor หรือคลิกขวา Refresh ในหน้าต่าง Navigator
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <span style={{
              background: "#3b82f6",
              color: "#fff",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: "700",
              flexShrink: 0,
              marginTop: "1px"
            }}>2</span>
            <div>
              <strong style={{ color: "#fff" }}>อนุญาตการส่งข้อมูล WebRequest:</strong> ไปที่เมนูบนสุดของ MT4/MT5 เลือก <code style={{ color: "#fbbf24" }}>Tools ➔ Options ➔ แท็บ Expert Advisors</code> ติ๊ก ✅ <strong style={{ color: "#fff" }}>Allow WebRequest for listed URL</strong> แล้วกดปุ่มเขียว <code style={{ color: "#4ade80" }}>+ (Add new URL)</code> ใส่ URL: <code style={{ color: "#38bdf8" }}>https://onicorn-trade.pages.dev</code> แล้วกด OK
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <span style={{
              background: "#3b82f6",
              color: "#fff",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: "700",
              flexShrink: 0,
              marginTop: "1px"
            }}>3</span>
            <div>
              <strong style={{ color: "#fff" }}>เปิดกราฟและลาก EA เข้าใช้งาน:</strong> เปิดกราฟคู่เงินใดก็ได้ใน MT4/MT5 (เช่น XAUUSD หรือ EURUSD ไทม์เฟรมใดก็ได้) แล้วลาก EA <code style={{ color: "#60a5fa" }}>Onicorn_AutoJournal</code> ลงบนกราฟ ติ๊ก ✅ <strong style={{ color: "#fff" }}>Allow Live Trading</strong> หรือ Allow Algo Trading
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <span style={{
              background: "#3b82f6",
              color: "#fff",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: "700",
              flexShrink: 0,
              marginTop: "1px"
            }}>4</span>
            <div>
              <strong style={{ color: "#fff" }}>กรอก Username และ Token ในหน้าต่าง Inputs:</strong> ในแถบ <strong style={{ color: "#fbbf24" }}>Inputs (ค่าตัวแปร)</strong> ของ EA ตรวจสอบว่า <code style={{ color: "#38bdf8" }}>InpUsername</code> และ <code style={{ color: "#38bdf8" }}>InpApiToken</code> ตรงกับด้านบนนี้ จากนั้นกด OK เมื่อเชื่อมต่อสำเร็จจะขึ้นข้อความในแท็บ Experts ว่า <code style={{ color: "#4ade80" }}>✅ [Onicorn EA]: เชื่อมต่อกับ Onicorn Trade Dashboard สำเร็จเรียบร้อย!</code>
            </div>
          </div>
        </div>
      </div>

      {/* Code Modal */}
      {viewCodeModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(4px)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "#0f172a",
            border: "1px solid rgba(59, 130, 246, 0.4)",
            borderRadius: "14px",
            width: "100%",
            maxWidth: "850px",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)"
          }}>
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>{viewCodeModal === "mt4" ? "📈" : "🚀"}</span>
                <strong style={{ fontSize: "16px", color: "#fff" }}>
                  ซอร์สโค้ด EA สำหรับ {viewCodeModal === "mt4" ? "MetaTrader 4 (.mq4)" : "MetaTrader 5 (.mq5)"}
                </strong>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => copyToClipboard(codeContent, "modalCode")}
                  style={{
                    background: copiedKey === "modalCode" ? "#22c55e" : "#3b82f6",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  {copiedKey === "modalCode" ? "✓ คัดลอกโค้ดทั้งหมดแล้ว" : "คัดลอกโค้ดทั้งหมด (Copy)"}
                </button>
                <button
                  type="button"
                  onClick={() => setViewCodeModal(null)}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  ✕ ปิด
                </button>
              </div>
            </div>

            <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
              {isLoadingCode ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  กำลังโหลดซอร์สโค้ด...
                </div>
              ) : (
                <pre style={{
                  margin: 0,
                  fontSize: "12px",
                  fontFamily: "monospace",
                  color: "#e2e8f0",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.5"
                }}>
                  {codeContent}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
