import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, AlertTriangle, ShieldCheck, Target, TrendingUp, TrendingDown, Activity, CheckCircle2 } from "lucide-react";

export default function GeminiAiAnalysisCard({ assetType = "stock", symbol = "ASSET", price = "", change = "", indicators = {}, news = [] }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchAiAnalysis = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/gemini-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetType,
          symbol,
          price: String(price),
          change: String(change),
          indicators,
          news
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.aiAnalysis) {
          setData(json.aiAnalysis);
          const now = new Date();
          setLastUpdated(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} น.`);
        }
      }
    } catch (err) {
      console.error("Failed fetching Gemini AI analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiAnalysis();
  }, [symbol, price]);

  const signal = data?.signal || "BULLISH";
  const isBull = signal === "BULLISH";
  const isBear = signal === "BEARISH";

  const themeColor = isBull ? "#22c55e" : isBear ? "#ef4444" : "#facc15";
  const themeBg = isBull
    ? "linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(15, 23, 42, 0.85))"
    : isBear
    ? "linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(15, 23, 42, 0.85))"
    : "linear-gradient(135deg, rgba(250, 204, 21, 0.08), rgba(15, 23, 42, 0.85))";
  const themeBorder = isBull ? "rgba(34, 197, 94, 0.3)" : isBear ? "rgba(239, 68, 68, 0.3)" : "rgba(250, 204, 21, 0.3)";

  return (
    <div className="glass-card" style={{ padding: "20px 24px", background: themeBg, border: `1.5px solid ${themeBorder}`, borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.25)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)", padding: 6, borderRadius: 8, color: "#fff", display: "flex" }}>
            <Sparkles size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
              บทวิเคราะห์ Gemini AI สังเคราะห์เรียลไทม์ ({symbol})
            </h3>
            <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block" }}>
              ประมวลผลด้วย Google Gemini API ร่วมกับสัญญาณเทคนิค & ข่าวสารตลาด
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {lastUpdated && (
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              อัปเดต: {lastUpdated}
            </span>
          )}
          <button
            onClick={fetchAiAnalysis}
            disabled={loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(168, 85, 247, 0.15)",
              border: "1px solid rgba(168, 85, 247, 0.4)",
              color: "#c084fc",
              padding: "5px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: loading ? "wait" : "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            {loading ? "กำลังวิเคราะห์..." : "✨ ให้ Gemini AI วิเคราะห์สด"}
          </button>
        </div>
      </div>

      {/* Main Analysis Body */}
      {data ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Signal & Confidence Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 12 }}>
            <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                สัญญาณคำแนะนำ (Trade Signal)
              </span>
              <div style={{ fontSize: 14, fontWeight: 700, color: themeColor }}>
                {data.biasTitle || (isBull ? "🟢 BUY / LONG BIAS" : isBear ? "🔴 SELL / SHORT BIAS" : "🟡 NEUTRAL / WAIT")}
              </div>
            </div>

            <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
                <span>ระดับความเชื่อมั่น AI (Confidence Score)</span>
                <strong style={{ color: themeColor }}>{data.confidenceScore || 80}%</strong>
              </div>
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 4, height: 8, overflow: "hidden", marginTop: 6 }}>
                <div style={{ background: themeColor, height: "100%", width: `${data.confidenceScore || 80}%`, transition: "width 0.4s ease" }} />
              </div>
            </div>
          </div>

          {/* Key Targets Row OR Oil Vending Machine Monthly Target Matrix */}
          {assetType === "oil" || data.fuelTargets ? (
            <div style={{ background: "rgba(0,0,0,0.3)", padding: "14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#facc15", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                <span>⛽ คาดการณ์เป้าหมายราคาซื้อน้ำมันไทยรายเดือน (สำหรับเติมตู้หยอดเหรียญ)</span>
                <span style={{ fontSize: 10, background: "rgba(250,204,21,0.15)", color: "#facc15", padding: "2px 8px", borderRadius: 10 }}>
                  วิเคราะห์ร่วม Brent & ราคาน้ำมันไทย
                </span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ color: "var(--text-muted)", borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left" }}>
                      <th style={{ padding: "6px 8px" }}>ประเภทน้ำมัน</th>
                      <th style={{ padding: "6px 8px" }}>ราคาปัจจุบัน</th>
                      <th style={{ padding: "6px 8px", color: "#22c55e" }}>🎯 โซนราคาซื้อคุ้มค่าที่สุดรายเดือน</th>
                      <th style={{ padding: "6px 8px" }}>คำแนะนำสต็อกตู้หยอดเหรียญ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.fuelTargets || [
                      { name: "แก๊สโซฮอล์ 95", current: "฿37.69", targetBuy: "฿36.80 - ฿37.20", status: "โซนสะสมเติมตู้", statusColor: "#22c55e" },
                      { name: "แก๊สโซฮอล์ 91", current: "฿37.28", targetBuy: "฿36.40 - ฿36.80", status: "ทยอยเติมตามรอบ", statusColor: "#facc15" },
                      { name: "แก๊สโซฮอล์ E20", current: "฿35.54", targetBuy: "฿34.80 - ฿35.20", status: "เน้นสต็อกล็อตใหญ่ (กำไร/ลิตรสูง)", statusColor: "#3b82f6" },
                      { name: "ดีเซล B7",      current: "฿32.94", targetBuy: "฿32.40 - ฿32.80", status: "ได้รับการตรึงราคา ซื้อได้ต่อเนื่อง", statusColor: "#a855f7" }
                    ]).map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px dashed rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "8px", fontWeight: 700, color: "#fff" }}>{row.name}</td>
                        <td style={{ padding: "8px", color: "var(--text-muted)" }}>{row.current}</td>
                        <td style={{ padding: "8px", color: "#22c55e", fontWeight: 700 }}>{row.targetBuy}</td>
                        <td style={{ padding: "8px" }}>
                          <span style={{ fontSize: 11, background: `${row.statusColor}20`, color: row.statusColor, border: `1px solid ${row.statusColor}40`, padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: 10 }}>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block" }}>🎯 กรอบเข้าซื้อ (Entry Zone)</span>
                <strong style={{ fontSize: 13, color: "#60a5fa" }}>{data.entryZone || "-"}</strong>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block" }}>🚀 เป้าหมายทำกำไร (TP)</span>
                <strong style={{ fontSize: 13, color: "#22c55e" }}>{data.targetPrice || "-"}</strong>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block" }}>🛡️ จุดตัดขาดทุน (SL)</span>
                <strong style={{ fontSize: 13, color: "#ef4444" }}>{data.stopLoss || "-"}</strong>
              </div>
            </div>
          )}

          {/* Executive Summary */}
          <div style={{ background: "rgba(0,0,0,0.2)", padding: "12px 14px", borderRadius: 8, borderLeft: `3px solid ${themeColor}`, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            <strong style={{ color: "#fff", display: "block", marginBottom: 4 }}>📋 สรุปบทวิเคราะห์จาก Gemini AI:</strong>
            {data.summary}
          </div>

          {/* Key Drivers & Risk Warning */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 12, fontSize: 12 }}>
            {data.keyDrivers && data.keyDrivers.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px 12px", borderRadius: 8 }}>
                <span style={{ color: "#22c55e", fontWeight: 700, display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                  <CheckCircle2 size={14} /> ปัจจัยขับเคลื่อนสำคัญ (Key Drivers)
                </span>
                <ul style={{ margin: 0, paddingLeft: 16, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {data.keyDrivers.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.riskWarning && (
              <div style={{ background: "rgba(239, 68, 68, 0.06)", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                <span style={{ color: "#ef4444", fontWeight: 700, display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                  <AlertTriangle size={14} /> ข้อควรระวัง & ความเสี่ยง (Risk Warning)
                </span>
                <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.6, fontSize: 11.5 }}>
                  {data.riskWarning}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: 13 }}>
          <Activity size={24} style={{ marginBottom: 8, opacity: 0.7 }} /><br />
          กำลังเชื่อมต่อประมวลผลบทวิเคราะห์ด้วย Gemini AI...
        </div>
      )}

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
