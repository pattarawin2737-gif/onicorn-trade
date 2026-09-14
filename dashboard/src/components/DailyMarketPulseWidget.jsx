import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Sparkles, ArrowRight, RefreshCw, Activity, Globe, DollarSign, ShieldAlert } from "lucide-react";

export default function DailyMarketPulseWidget({ onSelectTab }) {
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [marketData, setMarketData] = useState({
    thaiStock: { price: "1,452.20", change: "+0.45%", isUp: true, sentiment: "🟢 แรงซื้อกลุ่ม ICT & พลังงานหนุน", targetTab: "thai_stock_analysis" },
    usStock: { price: "5,648.40", change: "+0.82%", isUp: true, sentiment: "🟢 เทคฯ สหรัฐฯ ปรับขึ้นตอบรับงบ", targetTab: "inter_stock_analysis" },
    gold: { price: "$4,300.00", subPrice: "฿68,500", change: "+0.65%", isUp: true, sentiment: "🟢 เงินเฟ้อ & ดอกเบี้ยหนุน Spot Gold", targetTab: "inter_gold_analysis" },
    oil: { price: "$78.40", subPrice: "฿37.69 (G95)", change: "-0.20%", isUp: false, sentiment: "🟡 ทรงตัวในกรอบ โซนน่าตุนตู้", targetTab: "oil_analysis" },
    forex: { price: "฿33.52", subPrice: "DXY 103.4", change: "-0.15%", isUp: false, sentiment: "🟢 บาทแข็งค่าปานกลาง หนุนต้นทุนนำเข้า", targetTab: "analysis" }
  });

  const fetchLivePulse = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/price?symbol=^SET.BK,^GSPC,GC=F,BZ=F,USDTHB=X,DX-Y.NYB");
      if (res.ok) {
        const json = await res.json();
        const results = json.results || {};

        setMarketData(prev => {
          const next = { ...prev };
          if (results["^SET.BK"] && results["^SET.BK"].price) {
            const p = results["^SET.BK"];
            next.thaiStock = {
              ...next.thaiStock,
              price: p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              change: `${p.changePct >= 0 ? "+" : ""}${p.changePct.toFixed(2)}%`,
              isUp: p.changePct >= 0
            };
          }
          if (results["^GSPC"] && results["^GSPC"].price) {
            const p = results["^GSPC"];
            next.usStock = {
              ...next.usStock,
              price: p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              change: `${p.changePct >= 0 ? "+" : ""}${p.changePct.toFixed(2)}%`,
              isUp: p.changePct >= 0
            };
          }
          if (results["GC=F"] && results["GC=F"].price) {
            const p = results["GC=F"];
            const spot = p.price;
            const usdRate = results["USDTHB=X"]?.price || 33.50;
            const thaiGoldEst = Math.round((spot * usdRate) * (15.244 / 31.1035) * 0.965 + 150);
            next.gold = {
              ...next.gold,
              price: `$${spot.toFixed(2)}`,
              subPrice: `฿${thaiGoldEst.toLocaleString()}`,
              change: `${p.changePct >= 0 ? "+" : ""}${p.changePct.toFixed(2)}%`,
              isUp: p.changePct >= 0
            };
          }
          if (results["BZ=F"] && results["BZ=F"].price) {
            const p = results["BZ=F"];
            next.oil = {
              ...next.oil,
              price: `$${p.price.toFixed(2)}`,
              change: `${p.changePct >= 0 ? "+" : ""}${p.changePct.toFixed(2)}%`,
              isUp: p.changePct >= 0
            };
          }
          if (results["USDTHB=X"] && results["USDTHB=X"].price) {
            const p = results["USDTHB=X"];
            const dxy = results["DX-Y.NYB"]?.price ? `DXY ${results["DX-Y.NYB"].price.toFixed(1)}` : "DXY 103.4";
            next.forex = {
              ...next.forex,
              price: `฿${p.price.toFixed(2)}`,
              subPrice: dxy,
              change: `${p.changePct >= 0 ? "+" : ""}${p.changePct.toFixed(2)}%`,
              isUp: p.changePct >= 0
            };
          }
          return next;
        });

        const now = new Date();
        setLastUpdated(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")} น.`);
      }
    } catch (e) {
      console.warn("Failed fetching market pulse live quotes:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLivePulse();
    const interval = setInterval(fetchLivePulse, 60000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    {
      title: "🇹🇭 ตลาดหุ้นไทย (SET)",
      sub: "SET Index",
      price: marketData.thaiStock.price,
      change: marketData.thaiStock.change,
      isUp: marketData.thaiStock.isUp,
      sentiment: marketData.thaiStock.sentiment,
      tab: marketData.thaiStock.targetTab,
      borderColor: "rgba(59, 130, 246, 0.3)",
      bgGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(15, 23, 42, 0.75))"
    },
    {
      title: "🌎 ตลาดหุ้นสหรัฐฯ (US)",
      sub: "S&P 500 / Wall Street",
      price: marketData.usStock.price,
      change: marketData.usStock.change,
      isUp: marketData.usStock.isUp,
      sentiment: marketData.usStock.sentiment,
      tab: marketData.usStock.targetTab,
      borderColor: "rgba(168, 85, 247, 0.3)",
      bgGradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(15, 23, 42, 0.75))"
    },
    {
      title: "🥇 ทองคำ (Spot & แท่ง)",
      sub: marketData.gold.subPrice ? `ไทย ${marketData.gold.subPrice}` : "XAUUSD Spot",
      price: marketData.gold.price,
      change: marketData.gold.change,
      isUp: marketData.gold.isUp,
      sentiment: marketData.gold.sentiment,
      tab: marketData.gold.targetTab,
      borderColor: "rgba(245, 158, 11, 0.3)",
      bgGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(15, 23, 42, 0.75))"
    },
    {
      title: "🛢️ ราคาน้ำมัน (Brent & ปั๊ม)",
      sub: marketData.oil.subPrice ? `ปั๊ม ${marketData.oil.subPrice}` : "Brent Crude",
      price: marketData.oil.price,
      change: marketData.oil.change,
      isUp: marketData.oil.isUp,
      sentiment: marketData.oil.sentiment,
      tab: marketData.oil.targetTab,
      borderColor: "rgba(239, 68, 68, 0.3)",
      bgGradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(15, 23, 42, 0.75))"
    },
    {
      title: "💱 ค่าเงินบาท & DXY",
      sub: marketData.forex.subPrice,
      price: marketData.forex.price,
      change: marketData.forex.change,
      isUp: marketData.forex.isUp,
      sentiment: marketData.forex.sentiment,
      tab: marketData.forex.targetTab,
      borderColor: "rgba(34, 197, 94, 0.3)",
      bgGradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(15, 23, 42, 0.75))"
    }
  ];

  return (
    <div className="glass-card" style={{ padding: "18px 20px", marginBottom: 24, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "linear-gradient(180deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.85))" }}>
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", padding: 6, borderRadius: 8, color: "#fff", display: "flex" }}>
            <Activity size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
              📊 สรุปชีพจรตลาดการเงินประจำวัน (Daily Market Pulse)
            </h3>
            <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block" }}>
              ดัชนีราคาเรียลไทม์ 5 ตลาดหลัก + สัญญาณสรุป AI เชิงลึก
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {lastUpdated && (
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              อัปเดตสด: {lastUpdated}
            </span>
          )}
          <button
            onClick={fetchLivePulse}
            disabled={loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "var(--text-secondary)",
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              cursor: loading ? "wait" : "pointer"
            }}
          >
            <RefreshCw size={12} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            {loading ? "กำลังโหลด..." : "รีเฟรช"}
          </button>
        </div>
      </div>

      {/* Grid of 5 market items */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
        gap: 12
      }}>
        {items.map((m, idx) => (
          <div
            key={idx}
            style={{
              background: m.bgGradient,
              border: `1px solid ${m.borderColor}`,
              borderRadius: 10,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 8,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              cursor: "pointer"
            }}
            onClick={() => onSelectTab && onSelectTab(m.tab)}
            title="คลิกเพื่อเปิดหน้าวิเคราะห์กราฟและแผนการเทรดละเอียด"
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", display: "block" }}>{m.title}</span>
                <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{m.sub}</span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: m.isUp ? "#22c55e" : "#ef4444",
                  background: m.isUp ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                  padding: "2px 6px",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 3
                }}
              >
                {m.isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {m.change}
              </span>
            </div>

            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", marginTop: 2 }}>
              {m.price}
            </div>

            <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.4, background: "rgba(0,0,0,0.25)", padding: "6px 8px", borderRadius: 6 }}>
              {m.sentiment}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, fontSize: 11, color: "var(--color-primary)", fontWeight: 600, marginTop: 2 }}>
              <span>วิเคราะห์เชิงลึก</span>
              <ArrowRight size={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
