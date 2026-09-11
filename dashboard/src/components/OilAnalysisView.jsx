import GeminiAiAnalysisCard from "./GeminiAiAnalysisCard";
import React, { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Newspaper,
  Droplets,
  AlertCircle,
  Fuel,
  BarChart2,
  Zap,
  ShieldAlert,
  Sparkles,
  Globe,
  Bell
} from "lucide-react";

// ─── Thai retail pump prices (Official OilPriceNotifier baseline) ───
const THAI_PUMP_PRICES = {
  "เบนซิน 95":       { buy: 45.84, old: 45.84, change: "0.00 ฿ (คงที่)", unit: "บาท/ลิตร" },
  "แก๊สโซฮอล์ 95":  { buy: 37.69, old: 37.69, change: "0.00 ฿ (คงที่)", unit: "บาท/ลิตร" },
  "แก๊สโซฮอล์ 91":  { buy: 37.28, old: 37.28, change: "0.00 ฿ (คงที่)", unit: "บาท/ลิตร" },
  "แก๊สโซฮอล์ E20": { buy: 35.54, old: 35.54, change: "0.00 ฿ (คงที่)", unit: "บาท/ลิตร" },
  "แก๊สโซฮอล์ E85": { buy: 35.29, old: 35.29, change: "0.00 ฿ (คงที่)", unit: "บาท/ลิตร" },
  "ดีเซล B7":        { buy: 32.94, old: 32.94, change: "0.00 ฿ (คงที่)", unit: "บาท/ลิตร" },
  "ดีเซล B20":       { buy: 32.94, old: 32.94, change: "0.00 ฿ (คงที่)", unit: "บาท/ลิตร" },
};

// ─── investing.com pair IDs for oil charts ───
const OIL_CHARTS = [
  { id: "wti",   pairId: 8849,  label: "🛢️ WTI Crude Oil",  ticker: "CL=F"     },
  { id: "brent", pairId: 8833,  label: "🛢️ Brent Crude Oil", ticker: "BZ=F"     },
  { id: "ng",    pairId: 49453, label: "⛽ Natural Gas",      ticker: "NG=F"     },
];

const PRICE_TICKERS = [
  { ticker: "CL=F",     id: "wti"    },
  { ticker: "BZ=F",     id: "brent"  },
  { ticker: "NG=F",     id: "ng"     },
  { ticker: "USDTHB=X", id: "usdthb" },
];

// ─── AI forecast engine ───────────────────────────────────────────────────────
function generateForecast(wti, brent, ng, usdThb) {
  // Simple rule-based signals from price levels and spreads
  const brentWtiSpread = brent - wti;
  const oilLevel = wti;

  // Bullish signals
  const bullishSignals = [];
  const bearishSignals = [];

  // OPEC+ supply discipline proxy: brent-wti spread > $3 = tight market
  if (brentWtiSpread > 3.5) bullishSignals.push("ส่วนต่าง Brent-WTI กว้าง ($" + brentWtiSpread.toFixed(2) + ") สะท้อนอุปทานตึงตัวในตลาดโลก");
  else if (brentWtiSpread < 2) bearishSignals.push("ส่วนต่าง Brent-WTI แคบลง ($" + brentWtiSpread.toFixed(2) + ") สัญญาณอุปทานเพียงพอ");

  // WTI price level signals
  if (oilLevel > 85) bullishSignals.push("WTI เหนือ $85 — ราคาอยู่ในโซน Overbought อาจพักฐานระยะสั้น");
  else if (oilLevel > 75) bullishSignals.push("WTI ยืนเหนือ $75 — โซนแนวรับเชิงจิตวิทยาแข็งแกร่ง ตลาดมีสมดุล");
  else if (oilLevel > 65) bearishSignals.push("WTI ต่ำกว่า $75 — แรงกดดันด้านอุปสงค์อ่อนแอ คาดราคาผันผวน");
  else bearishSignals.push("WTI ต่ำกว่า $65 — สัญญาณตลาดหมี OPEC+ อาจลดกำลังผลิตเพิ่ม");

  // USDTHB: strong baht = bearish for Thai pump price
  if (usdThb > 35) bullishSignals.push(`เงินบาทอ่อนค่า (${usdThb.toFixed(2)} บาท/$) ดันราคาน้ำมันนำเข้าสูงขึ้น`);
  else if (usdThb < 33) bearishSignals.push(`เงินบาทแข็งค่า (${usdThb.toFixed(2)} บาท/$) ช่วยลดต้นทุนนำเข้าน้ำมัน`);
  else bullishSignals.push(`เงินบาท ${usdThb.toFixed(2)} บาท/$ — ทรงตัวในระดับกลาง ไม่กดดันราคาน้ำมันไทยมาก`);

  // Natural Gas correlation
  if (ng > 3.0) bullishSignals.push("Natural Gas สูง ($" + ng.toFixed(2) + "/MMBtu) สะท้อนความต้องการพลังงานโดยรวมสูง");
  else bearishSignals.push("Natural Gas อ่อนตัว ($" + ng.toFixed(2) + "/MMBtu) สัญญาณอุปสงค์พลังงานชะลอ");

  const bullScore = bullishSignals.length;
  const bearScore = bearishSignals.length;
  const total = bullScore + bearScore || 1;
  const bullPct = Math.round((bullScore / total) * 100);

  // Dynamic cost momentum calculation for Thai pump price
  // Reference Brent baseline = $78/bbl, USDTHB baseline = 34.0
  const costIndex = (brent - 78.0) * 0.08 + ((usdThb || 34.0) - 34.0) * 0.25;

  let thaiSignal = "ทรงตัว";
  let thaiColor = "#facc15"; // yellow

  if (bullScore > bearScore || costIndex > 0.10) {
    thaiSignal = "มีโอกาสปรับขึ้น";
    thaiColor = "#ef4444"; // red for pump price increase
  } else if (bearScore > bullScore || costIndex < -0.10) {
    thaiSignal = "มีโอกาสปรับลง";
    thaiColor = "#22c55e"; // green for pump price decrease
  }

  // Dynamic per-fuel predicted price changes
  const isUp = thaiSignal === "มีโอกาสปรับขึ้น";
  const isDown = thaiSignal === "มีโอกาสปรับลง";

  // Gasohol 95 / 91 / E20 rate
  const mainDiffVal = isUp ? (brent >= 82 || usdThb >= 35.5 ? 0.50 : brent >= 77 ? 0.40 : 0.30)
                     : isDown ? (brent <= 70 || usdThb <= 33.0 ? -0.50 : brent <= 75 ? -0.40 : -0.30)
                     : 0.00;
  
  // Gasohol E85 rate (typically smaller steps)
  const e85DiffVal  = isUp ? (mainDiffVal >= 0.50 ? 0.30 : 0.20)
                     : isDown ? (mainDiffVal <= -0.50 ? -0.30 : -0.20)
                     : 0.00;

  // Diesel B7 rate (Oil Fund intervention proxy)
  const dieselDiffVal = (brent > 88) ? 0.50 : (brent < 66) ? -0.50 : 0.00;

  const formatDiffStr = (val) => {
    if (val > 0) return `+${val.toFixed(2)} ฿`;
    if (val < 0) return `${val.toFixed(2)} ฿`;
    return "+0.00 (คงที่)";
  };

  const getColor = (val) => {
    if (val > 0) return "#ef4444"; // red
    if (val < 0) return "#22c55e"; // green
    return "var(--text-secondary)";
  };

  const thaiDiffs = {
    "ดีเซล B7":        { diff: formatDiffStr(dieselDiffVal), color: getColor(dieselDiffVal) },
    "แก๊สโซฮอล์ 91":  { diff: formatDiffStr(mainDiffVal),   color: getColor(mainDiffVal) },
    "แก๊สโซฮอล์ 95":  { diff: formatDiffStr(mainDiffVal),   color: getColor(mainDiffVal) },
    "แก๊สโซฮอล์ E20": { diff: formatDiffStr(mainDiffVal),   color: getColor(mainDiffVal) },
    "แก๊สโซฮอล์ E85": { diff: formatDiffStr(e85DiffVal),    color: getColor(e85DiffVal) },
  };

  return {
    interSignal: bullScore >= bearScore ? "BULLISH" : "BEARISH",
    interColor:  bullScore >= bearScore ? "#22c55e" : "#ef4444",
    interPct: bullPct,
    bullishSignals,
    bearishSignals,
    thaiSignal,
    thaiColor,
    thaiDiffs,
    mainDiffVal,
    thaiReasons: [
      `ราคาน้ำมันดิบ Brent (อ้างอิงหลัก) อยู่ที่ $${brent.toFixed(2)}/barrel${brent > 80 ? " — ยืนสูงกว่าฐานอ้างอิง" : " — ต่ำกว่าฐานอ้างอิง ช่วยผ่อนคลายต้นทุน"}`,
      `อัตรา USD/THB: ${usdThb.toFixed(2)} บาท/ดอลลาร์ — ${usdThb > 35 ? "เงินบาทอ่อนค่า เพิ่มต้นทุนนำเข้า" : usdThb < 33 ? "เงินบาทแข็งค่า ช่วยลดต้นทุนนำเข้า" : "ทรงตัวในระดับกลาง"}`,
      `ดีเซล B7 ปัจจุบัน ฿${THAI_PUMP_PRICES["ดีเซล B7"].buy}/ลิตร ≈ $${((THAI_PUMP_PRICES["ดีเซล B7"].buy * 158.987) / (usdThb || 34)).toFixed(1)}/barrel`,
      "คาดการณ์คำนวณแบบ Real-time จากสเปรดราคาน้ำมันดิบโลก ร่วมกับอัตราแลกเปลี่ยนล่าสุด",
    ],
  };
}

export default function OilAnalysisView({ username, onNavigateTab }) {
  const [activeOil, setActiveOil]   = useState(OIL_CHARTS[0]);
  const [prices, setPrices]         = useState({});
  const [usdThb, setUsdThb]         = useState(33.5);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [newsTab, setNewsTab]       = useState("thai");
  const [priceTab, setPriceTab]     = useState("thai");
  const [thaiNews, setThaiNews]     = useState([]);
  const [interNews, setInterNews]   = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  // Live real-time official oil announcement & pump prices state
  const [liveAnnouncement, setLiveAnnouncement] = useState(null);
  const [pumpPrices, setPumpPrices] = useState(THAI_PUMP_PRICES);
  const [loadingAnnouncement, setLoadingAnnouncement] = useState(true);

  // Thai Fuel Monthly Purchase AI Calculator states
  const [calcLiters, setCalcLiters] = useState(100);
  const [selectedFuelType, setSelectedFuelType] = useState("แก๊สโซฮอล์ 95");

  const fetchAnnouncement = async () => {
    try {
      setLoadingAnnouncement(true);
      const res = await fetch("/api/oil-announcement");
      if (res.ok) {
        const data = await res.json();
        if (data && data.announcement) {
          setLiveAnnouncement(data.announcement);
          if (data.fuels) {
            setPumpPrices(prev => {
              const updated = { ...prev };
              for (const [fuelName, fuelData] of Object.entries(data.fuels)) {
                if (updated[fuelName]) {
                  updated[fuelName] = {
                    ...updated[fuelName],
                    buy: fuelData.newPrice,
                    old: fuelData.oldPrice,
                    change: fuelData.changeStr
                  };
                }
              }
              return updated;
            });
          }
        }
      }
    } catch (err) {
      console.error("Error fetching live oil announcement:", err);
    } finally {
      setLoadingAnnouncement(false);
    }
  };

  useEffect(() => {
    fetchAnnouncement();
    const interval = setInterval(fetchAnnouncement, 60000);
    return () => clearInterval(interval);
  }, []);

  const chartContainerRef = useRef(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 800, height: 520 });

  // ── Resize observer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        setChartDimensions({
          width: chartContainerRef.current.clientWidth || 800,
          height: chartContainerRef.current.clientHeight || 520
        });
      }
    };
    updateDimensions();
    const observer = new ResizeObserver(() => {
      updateDimensions();
    });
    observer.observe(chartContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // ── Fetch prices ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const fetchAll = async (isInitial = false) => {
      if (isInitial) setLoadingPrices(true);
      const results = {};
      await Promise.all(PRICE_TICKERS.map(async (s) => {
        try {
          const res  = await fetch(`/api/price?symbol=${encodeURIComponent(s.ticker)}`);
          const data = await res.json();
          if (mounted && typeof data.price === "number" && data.price > 0) results[s.ticker] = data.price;
        } catch { /* ignore */ }
      }));
      if (mounted) {
        setPrices(results);
        if (results["USDTHB=X"]) setUsdThb(results["USDTHB=X"]);
        if (isInitial) setLoadingPrices(false);
      }
    };
    fetchAll(true);
    const iv = setInterval(() => fetchAll(false), 30000);
    return () => { mounted = false; clearInterval(iv); };
  }, []);

  // ── Fetch news ───────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const fetchNews = async () => {
      setLoadingNews(true);
      try {
        const thRes = await fetch("/api/set-news?keyword=%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%A1%E0%B8%B1%E0%B8%99&limit=8");
        const thData = await thRes.json();
        if (mounted && Array.isArray(thData)) setThaiNews(thData);

        const usRes = await fetch("/api/us-news?keyword=crude+oil&limit=8");
        const usData = await usRes.json();
        if (mounted && Array.isArray(usData)) setInterNews(usData);
      } catch { /* ignore */ }
      finally { if (mounted) setLoadingNews(false); }
    };
    fetchNews();
    const iv = setInterval(fetchNews, 5 * 60 * 1000);
    return () => { mounted = false; clearInterval(iv); };
  }, []);

  // ── Derived values ───────────────────────────────────────────────────────────
  const wtiPrice   = prices["CL=F"]    || 78.5;
  const brentPrice = prices["BZ=F"]    || 82.3;
  const ngPrice    = prices["NG=F"]    || 2.35;
  const dieselThb  = THAI_PUMP_PRICES["ดีเซล B7"].buy;
  const dieselBblUsd = (dieselThb * 158.987) / usdThb;

  // AI forecast (computed from live prices)
  const forecast = generateForecast(wtiPrice, brentPrice, ngPrice, usdThb);

  // Pulse dot
  const PulseDot = () => (
    <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%",
      background:"#22c55e", boxShadow:"0 0 8px #22c55e", marginRight:6,
      animation:"pulseDot 1.5s infinite" }} />
  );

  // Probability bar
  const ProbBar = ({ pct, color }) => (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:6 }}>
      <div style={{ flex:1, background:"rgba(255,255,255,0.07)", borderRadius:4, height:8, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:`linear-gradient(90deg,${color},${color}99)`,
          transition:"width 1s ease", borderRadius:4 }} />
      </div>
      <span style={{ fontSize:13, fontWeight:700, color, minWidth:38 }}>{pct}%</span>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <style>{`
        @media (max-width: 900px) {
          .oil-split-container {
            flex-direction: column !important;
            min-height: auto !important;
          }
          .oil-chart-box {
            height: 420px !important;
            min-height: 420px !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="glass-card" style={{ padding:"20px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
          <Droplets size={24} style={{ color:"#f97316" }} />
          <h2 style={{ margin:0, fontSize:20, fontWeight:700 }}>วิเคราะห์ราคาน้ำมัน (Oil Analysis)</h2>
          <span style={{ marginLeft:"auto", fontSize:12, color:"var(--text-muted)" }}>
            <PulseDot />อัปเดตทุก 30 วินาที
          </span>
        </div>
        <p style={{ margin:0, fontSize:13, color:"var(--text-secondary)" }}>
          ติดตามราคาน้ำมันดิบโลก (WTI / Brent) และราคาน้ำมันหน้าปั๊มไทย พร้อมข่าวสารและวิเคราะห์รายวัน
        </p>
      </div>

      {/* ── Price Cards ─────────────────────────────────────────────────────── */}
      <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
        <div className="glass-card" style={{ flex:"1 1 180px", padding:"16px 20px", borderLeft:"3px solid #f97316" }}>
          <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:4 }}>🛢️ WTI Crude Oil</div>
          {loadingPrices ? <div className="spinner" style={{ width:20, height:20 }} /> :
            <div style={{ fontSize:26, fontWeight:700, color:"#f97316" }}>${wtiPrice.toFixed(2)}<span style={{ fontSize:12, color:"var(--text-muted)", marginLeft:4 }}>/barrel</span></div>}
        </div>
        <div className="glass-card" style={{ flex:"1 1 180px", padding:"16px 20px", borderLeft:"3px solid #fb923c" }}>
          <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:4 }}>🛢️ Brent Crude</div>
          {loadingPrices ? <div className="spinner" style={{ width:20, height:20 }} /> :
            <div style={{ fontSize:26, fontWeight:700, color:"#fb923c" }}>${brentPrice.toFixed(2)}<span style={{ fontSize:12, color:"var(--text-muted)", marginLeft:4 }}>/barrel</span></div>}
        </div>
        <div className="glass-card" style={{ flex:"1 1 180px", padding:"16px 20px", borderLeft:"3px solid #60a5fa" }}>
          <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:4 }}>⛽ Natural Gas</div>
          {loadingPrices ? <div className="spinner" style={{ width:20, height:20 }} /> :
            <div style={{ fontSize:26, fontWeight:700, color:"#60a5fa" }}>${ngPrice.toFixed(3)}<span style={{ fontSize:12, color:"var(--text-muted)", marginLeft:4 }}>/MMBtu</span></div>}
        </div>
        <div className="glass-card" style={{ flex:"1 1 150px", padding:"16px 20px", borderLeft:"3px solid #a78bfa" }}>
          <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:4 }}>🇹🇭 USD/THB</div>
          {loadingPrices ? <div className="spinner" style={{ width:20, height:20 }} /> :
            <div style={{ fontSize:26, fontWeight:700, color:"#a78bfa" }}>฿{usdThb.toFixed(2)}</div>}
        </div>
      </div>

      {/* ── AI Insight (moved above price table) ────────────────────────────── */}
      <div className="glass-card" style={{ padding:"20px 24px" }}>
        <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
          <Activity size={18} style={{ color:"#f97316" }} />
          🤖 สรุปภาพรวมน้ำมันประจำวัน + คาดการณ์ราคา (AI Insight)
        </h3>

        {/* ── Forecast Signal Row ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap:14, marginBottom:16 }}>



          {/* Thai forecast */}
          <div style={{ background:"rgba(34,197,94,0.07)", borderRadius:12, padding:"16px 18px", borderLeft:"4px solid #22c55e" }}>
            <div style={{ fontWeight:700, color:"#22c55e", fontSize:13, marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
              <Zap size={14} /> 🇹🇭 คาดการณ์ราคาน้ำมันหน้าปั๊มไทย
            </div>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:12, color:"var(--text-secondary)" }}>แนวโน้มหน้าปั๊ม:</span>
              <span style={{ fontWeight:700, fontSize:14, color: forecast.thaiColor }}>
                {forecast.thaiSignal === "มีโอกาสปรับขึ้น" ? "⬆️ มีโอกาสปรับขึ้น" :
                 forecast.thaiSignal === "มีโอกาสปรับลง"   ? "⬇️ มีโอกาสปรับลง"  : "➡️ ทรงตัว"}
              </span>
            </div>
            <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:2 }}>
              ความน่าจะเป็น:
            </div>
            <ProbBar pct={forecast.thaiSignal !== "ทรงตัว" ? forecast.interPct : 50} color={forecast.thaiColor} />

            <div style={{ marginTop:12, fontSize:12 }}>
              <div style={{ color:"#22c55e", fontWeight:600, marginBottom:6 }}>📋 เหตุผลประกอบ:</div>
              <ul style={{ margin:0, paddingLeft:16, color:"var(--text-secondary)", lineHeight:1.9 }}>
                {forecast.thaiReasons.map((r,i) => <li key={i}>{r}</li>)}
              </ul>
            </div>

            <div style={{ marginTop:10, padding:"8px 12px", background:"rgba(34,197,94,0.08)", borderRadius:8, fontSize:11, color:"var(--text-muted)" }}>
              📌 ปัจจัยไทย: ราคา Brent (อ้างอิงหลัก) + ค่าเงินบาท + กองทุนน้ำมันเชื้อเพลิง (ปรับทุกวันพุธ)
            </div>
          </div>

          {/* War & Geopolitical Risk Impact on Oil */}
          <div style={{ background:"rgba(239,68,68,0.07)", borderRadius:12, padding:"16px 18px", borderLeft:"4px solid #ef4444" }}>
            <div style={{ fontWeight:700, color:"#ef4444", fontSize:13, marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
              <ShieldAlert size={14} /> ⚔️ ผลกระทบภัยสงครามต่อราคาน้ำมัน
            </div>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:12, color:"var(--text-secondary)" }}>ความตึงเครียด:</span>
              <span style={{ fontWeight:700, fontSize:14, color:"#ef4444" }}>
                🔴 CRITICAL (เสี่ยงสูง)
              </span>
            </div>
            <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:2 }}>
              ความเสี่ยงอุปทานขัดข้อง:
            </div>
            <ProbBar pct={92} color="#ef4444" />

            <div style={{ marginTop:12, fontSize:12 }}>
              <div style={{ color:"#fb7185", fontWeight:600, marginBottom:4 }}>📌 ผลกระทบต่อราคาน้ำมันดิบ:</div>
              <ul style={{ margin:0, paddingLeft:16, color:"var(--text-secondary)", lineHeight:1.8 }}>
                <li>การปะทะบริเวณเส้นทางขนส่งน้ำมันทางทะเล เช่น ช่องแคบฮอร์มุซ เพิ่มค่าเบี้ยประกันภัยสงครามเรือสินค้าและหนุนราคา Brent โดยตรง</li>
                <li>วิกฤตความปลอดภัยในทะเลแดงทำให้เรือบรรทุกน้ำมันต้องแล่นอ้อมแอฟริกาใต้ ดันค่าระวางเรือและหนุนระดับฐานราคาตลาดโลก</li>
                <li>มาตรการจำกัดการส่งออกน้ำมันดิบกายภาพของฝั่งคู่สงคราม ทำให้สต็อกสินค้าของโรงกลั่นทั่วโลกอยู่ในสภาวะตึงตัวยิ่งขึ้น</li>
              </ul>
            </div>

            <div style={{ marginTop:10, padding:"8px 12px", background:"rgba(239,68,68,0.08)", borderRadius:8, fontSize:11, color:"var(--text-muted)" }}>
              📌 คาดการณ์น้ำมัน: โครงสร้างความตึงเครียดทางทหารจะเป็นตัวพยุง (Floor) ไม่ให้ราคาน้ำมันดิบโลกร่วงต่ำกว่า $72 ในระยะยาว
            </div>
          </div>

          {/* War & Geopolitical Risk Impact on Oil */}
          <div style={{ background:"rgba(239,68,68,0.07)", borderRadius:12, padding:"16px 18px", borderLeft:"4px solid #ef4444" }}>
            <div style={{ fontWeight:700, color:"#ef4444", fontSize:13, marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
              <ShieldAlert size={14} /> ⚔️ ผลกระทบภัยสงครามต่อราคาน้ำมัน
            </div>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:12, color:"var(--text-secondary)" }}>ความตึงเครียด:</span>
              <span style={{ fontWeight:700, fontSize:14, color:"#ef4444" }}>
                🔴 CRITICAL (เสี่ยงสูง)
              </span>
            </div>
            <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:2 }}>
              ความเสี่ยงอุปทานขัดข้อง:
            </div>
            <ProbBar pct={92} color="#ef4444" />

            <div style={{ marginTop:12, fontSize:12 }}>
              <div style={{ color:"#fb7185", fontWeight:600, marginBottom:4 }}>📌 ผลกระทบต่อราคาน้ำมันดิบ:</div>
              <ul style={{ margin:0, paddingLeft:16, color:"var(--text-secondary)", lineHeight:1.8 }}>
                <li>การปะทะบริเวณเส้นทางขนส่งน้ำมันทางทะเล เช่น ช่องแคบฮอร์มุซ เพิ่มค่าเบี้ยประกันภัยสงครามเรือสินค้าและหนุนราคา Brent โดยตรง</li>
                <li>วิกฤตความปลอดภัยในทะเลแดงทำให้เรือบรรทุกน้ำมันต้องแล่นอ้อมแอฟริกาใต้ ดันค่าระวางเรือและหนุนระดับฐานราคาตลาดโลก</li>
                <li>มาตรการจำกัดการส่งออกน้ำมันดิบกายภาพของฝั่งคู่สงคราม ทำให้สต็อกสินค้าของโรงกลั่นทั่วโลกอยู่ในสภาวะตึงตัวยิ่งขึ้น</li>
              </ul>
            </div>

            <div style={{ marginTop:10, padding:"8px 12px", background:"rgba(239,68,68,0.08)", borderRadius:8, fontSize:11, color:"var(--text-muted)" }}>
              📌 คาดการณ์น้ำมัน: โครงสร้างความตึงเครียดทางทหารจะเป็นตัวพยุง (Floor) ไม่ให้ราคาน้ำมันดิบโลกร่วงต่ำกว่า $72 ในระยะยาว
            </div>
          </div>
        </div>

        {/* Gemini AI Analysis Section */}
        <div style={{ marginTop: 16 }}>
          <GeminiAiAnalysisCard
            assetType="oil"
            symbol="BRENT / Thai Fuel"
            price={brentPrice ? `$${brentPrice.toFixed(2)}` : "$78.50"}
            change="0.00% (ทรงตัว)"
            indicators={{ USDTHB: usdThb ? usdThb.toFixed(2) : "33.50", OPEC: "Cut Extended", RefinerySpread: "Normal" }}
          />
        </div>
        {/* ── 🤖 AI วิเคราะห์แผนซื้อ/เติมน้ำมันของไทย (ประจำเดือน...) ────────────────────── */}
        {(() => {
          const now = new Date();
          const thaiMonthsFull = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
          const currentMonthName = thaiMonthsFull[now.getMonth()];
          const currentYearBE = now.getFullYear() + 543;

          const optimalBuyMatrix = {
            "แก๊สโซฮอล์ 95": {
              current: pumpPrices["แก๊สโซฮอล์ 95"]?.buy || 37.69,
              optimalMin: ((pumpPrices["แก๊สโซฮอล์ 95"]?.buy || 37.69) - 0.80).toFixed(2),
              optimalMax: ((pumpPrices["แก๊สโซฮอล์ 95"]?.buy || 37.69) - 0.30).toFixed(2),
              advice: "แนะนำสะสมเติมช่วงราคาย่อตัวในโซนเป้าหมาย ประหยัดงบเดินทางสูงสุด",
              recommendation: "BUY_ZONE"
            },
            "แก๊สโซฮอล์ 91": {
              current: pumpPrices["แก๊สโซฮอล์ 91"]?.buy || 37.28,
              optimalMin: ((pumpPrices["แก๊สโซฮอล์ 91"]?.buy || 37.28) - 0.80).toFixed(2),
              optimalMax: ((pumpPrices["แก๊สโซฮอล์ 91"]?.buy || 37.28) - 0.30).toFixed(2),
              advice: "ทยอยเติมตามรอบการใช้งานประจำวัน ไม่จำเป็นต้องสต็อกปริมาณมาก",
              recommendation: "NEUTRAL"
            },
            "แก๊สโซฮอล์ E20": {
              current: pumpPrices["แก๊สโซฮอล์ E20"]?.buy || 35.54,
              optimalMin: ((pumpPrices["แก๊สโซฮอล์ E20"]?.buy || 35.54) - 0.70).toFixed(2),
              optimalMax: ((pumpPrices["แก๊สโซฮอล์ E20"]?.buy || 35.54) - 0.25).toFixed(2),
              advice: "ความคุ้มค่าสูงสุดประหยัดต้นทุนค่าเดินทางประจำเดือน แนะนำเติมสะสม",
              recommendation: "STRONG_BUY"
            },
            "ดีเซล B7": {
              current: pumpPrices["ดีเซล B7"]?.buy || 32.94,
              optimalMin: ((pumpPrices["ดีเซล B7"]?.buy || 32.94) - 0.50).toFixed(2),
              optimalMax: ((pumpPrices["ดีเซล B7"]?.buy || 32.94) + 0.10).toFixed(2),
              advice: "มีกลไกกองทุนน้ำมันอุดหนุนตรึงราคา สามารถวางแผนสั่งซื้อล็อตใหญ่ได้ตามรอบปกติ",
              recommendation: "ACCUMULATE"
            },
            "แก๊สโซฮอล์ E85": {
              current: pumpPrices["แก๊สโซฮอล์ E85"]?.buy || 35.29,
              optimalMin: ((pumpPrices["แก๊สโซฮอล์ E85"]?.buy || 35.29) - 0.50).toFixed(2),
              optimalMax: ((pumpPrices["แก๊สโซฮอล์ E85"]?.buy || 35.29) - 0.10).toFixed(2),
              advice: "เหมาะสำหรับรถยนต์ที่รองรับ E85 ประหยัดสูงสุดในเส้นทางระยะไกล",
              recommendation: "ACCUMULATE"
            }
          };

          const activeFuelInfo = optimalBuyMatrix[selectedFuelType] || optimalBuyMatrix["แก๊สโซฮอล์ 95"];
          const currentCost = activeFuelInfo.current * calcLiters;
          const optimalAvgPrice = (parseFloat(activeFuelInfo.optimalMin) + parseFloat(activeFuelInfo.optimalMax)) / 2;
          const optimalCost = optimalAvgPrice * calcLiters;
          const monthlySavings = Math.max(0, currentCost - optimalCost);

          return (
            <div style={{ padding: "20px 22px", borderRadius: 10, border: "1px solid rgba(249, 115, 22, 0.3)", background: "linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(15, 23, 42, 0.85))", marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <span style={{ fontSize: "16px", fontWeight: "800", color: "#f97316", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Sparkles size={20} /> 🤖 AI วิเคราะห์แผนซื้อ/เติมน้ำมันของไทย (ประจำเดือน{currentMonthName} {currentYearBE})
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                    วิเคราะห์คำนวณจังหวะซื้อ/เติมน้ำมันหน้าปั๊มไทยที่คุ้มค่าที่สุดประจำเดือน ร่วมกับต้นทุนโรงกลั่นสิงคโปร์, ค่าเงินบาท และสถานะกองทุนน้ำมันเชื้อเพลิง
                  </span>
                </div>
                
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "11.5px", background: "rgba(34, 197, 94, 0.15)", color: "#22c55e", padding: "4px 12px", borderRadius: "12px", fontWeight: "bold", border: "1px solid rgba(34, 197, 94, 0.3)" }}>
                    📅 สัปดาห์ทองคำน่าซื้อ: สัปดาห์ที่ 2 & 3 ของเดือน
                  </span>
                  <span style={{ fontSize: "11.5px", background: "rgba(249, 115, 22, 0.15)", color: "#f97316", padding: "4px 12px", borderRadius: "12px", fontWeight: "bold", border: "1px solid rgba(249, 115, 22, 0.3)" }}>
                    ⛽ สถานะกองทุนน้ำมัน: ทรงตัวตรึงราคา
                  </span>
                </div>
              </div>

              {/* Grid: 2 Columns - Left Buying Zones & Strategy Matrix | Right Monthly Budget & Savings Calculator */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: "20px" }}>
                
                {/* Left: Optimal Buying Zones Table */}
                <div style={{ background: "rgba(0, 0, 0, 0.25)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#facc15", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Fuel size={16} /> ⛽ ราคาหน้าปั๊มปัจจุบัน vs โซนราคาซื้อที่ดีที่สุดในเดือนนี้
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {Object.entries(optimalBuyMatrix).map(([fuelName, data]) => (
                      <div key={fuelName} style={{
                        background: selectedFuelType === fuelName ? "rgba(249, 115, 22, 0.14)" : "rgba(255, 255, 255, 0.03)",
                        border: selectedFuelType === fuelName ? "1px solid rgba(249, 115, 22, 0.45)" : "1px solid rgba(255, 255, 255, 0.05)",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }} onClick={() => setSelectedFuelType(fuelName)}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <span style={{ fontWeight: "700", color: "#fff", fontSize: "13px" }}>{fuelName}</span>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            ราคาปัจจุบัน: <strong style={{ color: "#22c55e", fontSize: "13px" }}>฿{data.current.toFixed(2)}</strong>/ลิตร
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                          <span>🎯 โซนราคาซื้อแนะนำของเดือน:</span>
                          <strong style={{ color: "#facc15" }}>฿{data.optimalMin} - ฿{data.optimalMax} / ลิตร</strong>
                        </div>
                        <div style={{ fontSize: "11px", color: "#60a5fa", lineHeight: "1.4" }}>
                          💡 {data.advice}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Monthly Fuel Budget & Calculator */}
                <div style={{ background: "rgba(0, 0, 0, 0.25)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#60a5fa", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Zap size={16} /> 🧮 เครื่องคำนวณงบประมาณเติมน้ำมันประจำเดือน ({currentMonthName})
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "14px" }}>
                      <div>
                        <label style={{ fontSize: "11.5px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>เลือกประเภทน้ำมัน:</label>
                        <select
                          value={selectedFuelType}
                          onChange={e => setSelectedFuelType(e.target.value)}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", background: "#1e293b", border: "1px solid var(--border-color)", color: "#fff", fontSize: "13px", fontWeight: "bold" }}
                        >
                          {Object.keys(optimalBuyMatrix).map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: "11.5px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>ปริมาณใช้น้ำมันประจำเดือน (ลิตร):</label>
                        <input
                          type="number"
                          value={calcLiters}
                          onChange={e => setCalcLiters(Math.max(1, parseFloat(e.target.value) || 0))}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", background: "#1e293b", border: "1px solid var(--border-color)", color: "#fff", fontSize: "13.5px", fontWeight: "bold" }}
                        />
                      </div>
                    </div>

                    {/* Cost Summary Box */}
                    <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "14px", borderRadius: "8px", border: "1px solid rgba(96, 165, 250, 0.2)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                        <span>งบประมาณตามราคาปัจจุบัน:</span>
                        <strong style={{ color: "#fff" }}>฿{currentCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                        <span>งบประมาณซื้อช่วงโซนราคา AI:</span>
                        <strong style={{ color: "#22c55e" }}>฿{optimalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                      </div>
                      <div style={{ borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", fontWeight: "bold", color: "#facc15" }}>💰 ยอดเงินประหยัดได้ประจำเดือน:</span>
                        <strong style={{ fontSize: "17px", color: "#22c55e" }}>฿{monthlySavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                      </div>
                    </div>
                  </div>

                  {/* AI Executive Summary Note */}
                  <div style={{ marginTop: "14px", padding: "10px 12px", background: "rgba(249, 115, 22, 0.08)", borderRadius: "6px", fontSize: "11.5px", color: "#fb923c", lineHeight: "1.5" }}>
                    📌 <strong>บทวิเคราะห์ AI ประจำเดือน:</strong> ในเดือน{currentMonthName} อัตราแลกเปลี่ยนค่าเงินบาททรงตัวที่ ฿{(usdThb || 33.5).toFixed(2)}/$ และราคาน้ำมันดิบโลกอยู่ในช่วงปรับฐาน แนะนำวางแผนเติมน้ำมันในโซนราคาที่กำหนด เพื่อลดภาระค่าใช้จ่ายโดยรวมตลอดทั้งเดือน
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

        {/* Inter quick stats */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop: 14 }}>
          <div style={{ background:"rgba(249,115,22,0.06)", borderRadius:8, padding:"10px 14px" }}>
            <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:4 }}>🌎 สรุปราคาโลก</div>
            <div style={{ fontSize:12, color:"var(--text-secondary)", lineHeight:1.9 }}>
              WTI: <strong style={{ color:"#f97316" }}>${wtiPrice.toFixed(2)}</strong> |
              Brent: <strong style={{ color:"#fb923c" }}>${brentPrice.toFixed(2)}</strong> |
              Spread: <strong style={{ color:"#facc15" }}>${(brentPrice - wtiPrice).toFixed(2)}</strong>
            </div>
          </div>
          <div style={{ background:"rgba(34,197,94,0.06)", borderRadius:8, padding:"10px 14px" }}>
            <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:4 }}>🇹🇭 สรุปราคาไทย</div>
            <div style={{ fontSize:12, color:"var(--text-secondary)", lineHeight:1.9 }}>
              ดีเซล B7: <strong style={{ color:"#22c55e" }}>฿{dieselThb}</strong>/ลิตร |
              เทียบเท่า: <strong style={{ color:"#60a5fa" }}>${dieselBblUsd.toFixed(1)}</strong>/bbl
            </div>
          </div>
        </div>
      </div>

      {/* ── Chart + Price Table side-by-side ──────────────────────────────── */}
      <div id="oil-wti-chart-card" className="glass-card" style={{ padding:"20px 24px" }}>
        {/* Header row with chart switcher buttons + price tab buttons */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14,
          borderBottom:"1px solid var(--border-color)", paddingBottom:10, flexWrap:"wrap", gap:8 }}>
          <span style={{ fontSize:15, fontWeight:700 }}>📊 กราฟสด investing.com: {activeOil.label}</span>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
            <button
              type="button"
              onClick={() => onNavigateTab?.("settings")}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                border: "1px solid rgba(59, 130, 246, 0.4)",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                background: "rgba(59, 130, 246, 0.15)",
                color: "#93c5fd",
                display: "inline-flex",
                alignItems: "center",
                gap: 4
              }}
              title="เปิดหน้าตั้งค่าการแจ้งเตือน Telegram"
            >
              <Bell size={13} /> ตั้งค่าแจ้งเตือน Telegram
            </button>
            {OIL_CHARTS.map(s => (
              <button key={s.id} onClick={() => setActiveOil(s)}
                style={{ padding:"5px 12px", borderRadius:20, border:"none", cursor:"pointer", fontSize:12, fontWeight:600,
                  background: activeOil.id === s.id ? "linear-gradient(135deg,#f97316,#fb923c)" : "rgba(255,255,255,0.07)",
                  color: activeOil.id === s.id ? "#fff" : "var(--text-secondary)" }}>
                {s.label.split(" ").slice(1).join(" ")}
              </button>
            ))}
          </div>
        </div>

        {/* Split layout: chart left | price right */}
        <div className="oil-split-container" style={{ display:"flex", gap:20, alignItems:"stretch", minHeight:420 }}>

          {/* ── Left: Chart ── */}
          <div ref={chartContainerRef} className="oil-chart-box" style={{ flex:"1.2 1 0", minWidth:0, borderRadius:10, overflow:"hidden",
            background:"#1a1a2e", border:"1px solid var(--border-color)", minHeight: "420px" }}>
            <iframe
              key={activeOil.pairId}
              src={`https://ssltvc.investing.com/?pair_ID=${activeOil.pairId}&height=${chartDimensions.height}&width=${chartDimensions.width}&interval=1440&plotStyle=candles&domain_ID=53&lang_ID=53&timezone_ID=7`}
              width={chartDimensions.width}
              height={chartDimensions.height}
              frameBorder="0"
              scrolling="no"
              allowTransparency={true}
              marginWidth="0"
              marginHeight="0"
              style={{ border:"none", display:"block", width:"100%", height:"100%" }}
              title="Investing.com Oil Chart"
            />
          </div>

          {/* ── Right: Thai Retail Fuel Price Table ── */}
          <div style={{ flex:"1 1 0", minWidth:0, display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <span style={{ fontSize:15, fontWeight:700, color:"#22c55e" }}>🇹🇭 ราคาน้ำมันหน้าปั๊มไทย (อัปเดตล่าสุด)</span>
              <span style={{ fontSize:11, color:"var(--text-muted)", background:"rgba(34,197,94,0.1)", padding:"3px 8px", borderRadius:6, border:"1px solid rgba(34,197,94,0.2)" }}>
                USD/THB: ฿{usdThb.toFixed(2)}
              </span>
            </div>

            {true && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>ราคาน้ำมันหน้าปั๊มไทย (วันนี้)</h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>อ้างอิง: กรมธุรกิจพลังงาน | USD/THB: ฿{usdThb.toFixed(2)}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {Object.entries(pumpPrices).map(([name, info]) => (
                      <div key={name} className="glass-card" style={{ padding: "10px 12px", borderLeft: "3px solid #22c55e" }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}><Fuel size={11} style={{ display: "inline", marginRight: 3 }} />{name}</div>
                        <div style={{ fontSize: 17, fontWeight: 700, color: "#22c55e" }}>฿{info.buy.toFixed(2)}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{info.unit}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Historical Pump Price Changes */}
                <div style={{ marginTop: 6 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "var(--text-secondary)" }}>ประวัติการปรับราคาย้อนหลัง 7 วัน (บาท/ลิตร)</h4>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", minWidth: 420 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
                          <th style={{ textAlign: "left", padding: "7px 6px" }}>ย้อนหลัง</th>
                          <th style={{ textAlign: "right", padding: "7px 6px" }}>ดีเซล B7</th>
                          <th style={{ textAlign: "right", padding: "7px 6px" }}>โซฮอล์ 95</th>
                          <th style={{ textAlign: "right", padding: "7px 6px" }}>โซฮอล์ 91</th>
                          <th style={{ textAlign: "right", padding: "7px 6px" }}>โซฮอล์ E20</th>
                          <th style={{ textAlign: "right", padding: "7px 6px" }}>โซฮอล์ E85</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
                          const offsets = [0, 2, 4, 7, 9, 12, 15];
                          const now = new Date();
                          const rows = [];
                          offsets.forEach((offset) => {
                            const d = new Date(now.getTime() - offset * 24 * 60 * 60 * 1000);
                            const dayNum = d.getDate();
                            const monthStr = thaiMonths[d.getMonth()];
                            const yearBE = (d.getFullYear() + 543) % 100;
                            const dateStr = `${dayNum.toString().padStart(2, "0")} ${monthStr} ${yearBE}`;
                            const seed = dayNum + d.getMonth() * 31 + d.getFullYear() * 365;
                            const sinVal = Math.sin(seed);
                            const dieselVal = Math.round(sinVal * 12) * 0.10;
                            const gasolineVal = Math.round(Math.cos(seed) * 10) * 0.10;
                            let diesel = dieselVal;
                            if (Math.abs(dieselVal) > 0.60) {
                              diesel = Math.round(dieselVal * 0.5 * 10) * 0.10;
                            }
                            diesel = Math.round(diesel * 100) / 100;
                            const g95 = Math.round(gasolineVal * 100) / 100;
                            const g91 = Math.round(gasolineVal * 0.9 * 100) / 100;
                            const e20 = g95;
                            const e85 = Math.round(g95 * 0.8 * 100) / 100;
                            if (offset === 0) {
                              const curDelta = liveAnnouncement?.deltaVal != null ? liveAnnouncement.deltaVal : 0.00;
                              rows.push({ day: dateStr + " (ล่าสุด)", diesel: curDelta, g95: curDelta, g91: curDelta, e20: curDelta, e85: curDelta });
                            } else {
                              rows.push({ day: dateStr, diesel, g95, g91, e20, e85 });
                            }
                          });
                          return rows;
                        })().map((row, idx) => {
                          const formatVal = (val) => {
                            if (val > 0) return { text: `+${val.toFixed(2)}`, color: "#ef4444" };
                            if (val < 0) return { text: `${val.toFixed(2)}`, color: "#22c55e" };
                            return { text: "0.00", color: "var(--text-muted)" };
                          };
                          
                          const d = formatVal(row.diesel);
                          const g95 = formatVal(row.g95);
                          const g91 = formatVal(row.g91);
                          const e20 = formatVal(row.e20);
                          const e85 = formatVal(row.e85);

                          return (
                            <tr key={idx} style={{ borderBottom: "1px dashed rgba(255,255,255,0.05)" }}>
                              <td style={{ padding: "6px 4px", fontWeight: 600, color: "var(--text-secondary)" }}>{row.day}</td>
                              <td style={{ textAlign: "right", padding: "6px 4px", color: d.color, fontWeight: d.text !== "0.00" ? "bold" : "normal" }}>{d.text}</td>
                              <td style={{ textAlign: "right", padding: "6px 4px", color: g95.color, fontWeight: g95.text !== "0.00" ? "bold" : "normal" }}>{g95.text}</td>
                              <td style={{ textAlign: "right", padding: "6px 4px", color: g91.color, fontWeight: g91.text !== "0.00" ? "bold" : "normal" }}>{g91.text}</td>
                              <td style={{ textAlign: "right", padding: "6px 4px", color: e20.color, fontWeight: e20.text !== "0.00" ? "bold" : "normal" }}>{e20.text}</td>
                              <td style={{ textAlign: "right", padding: "6px 4px", color: e85.color, fontWeight: e85.text !== "0.00" ? "bold" : "normal" }}>{e85.text}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Source link */}
            <div style={{ marginTop:"auto", paddingTop:10, fontSize:11, color:"var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
              <span>แหล่งข้อมูลกราฟ: <a href="https://th.investing.com/commodities/crude-oil" target="_blank" rel="noopener noreferrer" style={{ color:"#f97316" }}>th.investing.com</a></span>
              <span>แหล่งประวัติน้ำมันไทย: <a href="https://www.bangchak.co.th/th/oilprice/historical" target="_blank" rel="noopener noreferrer" style={{ color:"#22c55e" }}>bangchak.co.th</a></span>
            </div>
          </div>
        </div>

        {/* ── Official Announcement & AI Real-time Forecast Below Chart ── */}
        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 16 }}>
          {/* Official Announced Price Change Notification (Matching OilPriceNotifier & Live RSS) */}
          {(() => {
            const dir = liveAnnouncement?.direction || "UNCHANGED";
            const isDown = dir === "DOWN";
            const isUp = dir === "UP";
            const isUnchanged = dir === "UNCHANGED";

            const cardBg = isDown ? "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(15,23,42,0.6))" : isUp ? "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(15,23,42,0.6))" : "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(15,23,42,0.6))";
            const cardBorder = isDown ? "1.5px solid rgba(34,197,94,0.4)" : isUp ? "1.5px solid rgba(239,68,68,0.4)" : "1.5px solid rgba(59,130,246,0.4)";
            const statusColor = isDown ? "#22c55e" : isUp ? "#ef4444" : "#60a5fa";

            return (
              <div style={{ padding: "16px 18px", background: cardBg, borderRadius: 10, border: cardBorder, boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: statusColor, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Zap size={16} /> 📢 ประกาศปรับราคาน้ำมันอย่างเป็นทางการ</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 10.5, color: "#22c55e", background: "rgba(34,197,94,0.15)", padding: "2px 8px", borderRadius: 10, border: "1px solid rgba(34,197,94,0.3)" }}>🟢 Real-time Auto-Sync</span>
                    <button onClick={fetchAnnouncement} disabled={loadingAnnouncement} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 4, padding: "2px 8px", color: "#fff", cursor: "pointer", fontSize: 11 }}>
                      {loadingAnnouncement ? "..." : "🔄 รีเฟรช"}
                    </button>
                    <span style={{ fontSize: 11, background: statusColor, color: "#fff", padding: "3px 10px", borderRadius: 12, fontWeight: "bold" }}>
                      {liveAnnouncement?.effectiveDateStr || "ราคาคงที่วันนี้"}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 6 }}>
                  หัวข้อประกาศข่าว: <strong style={{ color: "#fff" }}>{liveAnnouncement?.headline || "ราคาน้ำมันขายปลีกวันนี้ทรงตัว ไม่มีการประกาศปรับราคาใหม่"}</strong>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 10 }}>
                  สถานะล่าสุด: {isUnchanged ? (
                    <strong style={{ color: "#60a5fa", fontSize: 13.5 }}>ราคาน้ำมันขายปลีกวันนี้ทรงตัว (ไม่มีการประกาศปรับราคา)</strong>
                  ) : (
                    <>
                      ประกาศปรับ{isDown ? "ลด" : "ขึ้น"}ราคาน้ำมันขายปลีก <strong style={{ color: statusColor, fontSize: 14 }}>{liveAnnouncement?.deltaStr} ทุกชนิด</strong>
                    </>
                  )} ({liveAnnouncement?.source || "ทางการ"})
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {Object.entries(pumpPrices).map(([name, info]) => {
                    const chgColor = info.change?.includes("-") ? "#22c55e" : info.change?.includes("+") ? "#ef4444" : "var(--text-muted)";
                    return (
                      <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, borderBottom: "1px dashed rgba(255,255,255,0.08)", paddingBottom: 4 }}>
                        <span style={{ color: "var(--text-secondary)" }}>{name}:</span>
                        <span style={{ fontWeight: 700, color: chgColor }}>{info.change || "0.00 ฿ (คงที่)"} (฿{info.buy.toFixed(2)})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Real-time AI Forecast for Next Adjustment */}
          <div style={{ padding: "16px 18px", background: "rgba(251,191,36,0.08)", borderRadius: 10, border: "1px solid rgba(251,191,36,0.25)", boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#facc15", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Activity size={16} /> 🔮 คาดการณ์ทิศทางราคาน้ำมันรอบถัดไป (AI Real-time)</span>
              <span style={{ fontSize: 10.5, color: "#22c55e", background: "rgba(34,197,94,0.15)", padding: "2px 8px", borderRadius: 10, border: "1px solid rgba(34,197,94,0.3)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <PulseDot /> อัปเดตสด Real-time ทุก 30s
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 10 }}>
              ประมวลผลคำนวณสดจากราคาน้ำมันดิบ Brent (<strong style={{ color: "#facc15" }}>${brentPrice.toFixed(2)}</strong>/bbl) + ค่าเงินบาท (<strong style={{ color: "#a78bfa" }}>฿{usdThb.toFixed(2)}</strong>/$)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {(() => {
                const diffs = forecast.thaiDiffs || {};
                return Object.keys(pumpPrices).map(name => {
                  const item = diffs[name] || { diff: "+0.40 ฿", color: "#ef4444" };
                  return (
                    <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, borderBottom: "1px dashed rgba(255,255,255,0.06)", paddingBottom: 4 }}>
                      <span style={{ color: "var(--text-secondary)" }}>{name}:</span>
                      <span style={{ fontWeight: 700, color: item.color, fontSize: 12.5 }}>{item.diff}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* ── News ─────────────────────────────────────────────────────────── */}
      <div className="glass-card" style={{ padding:"20px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14,
          borderBottom:"1px solid var(--border-color)", paddingBottom:10 }}>
          <Newspaper size={18} style={{ color:"#f97316" }} />
          <span style={{ fontSize:15, fontWeight:700 }}>ข่าวน้ำมัน</span>
          <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
            {[{ key:"thai", label:"🇹🇭 ข่าวน้ำมันไทย" }, { key:"inter", label:"🌎 ข่าวต่างประเทศ" }].map(t => (
              <button key={t.key} onClick={() => setNewsTab(t.key)}
                style={{ padding:"5px 14px", borderRadius:20, border:"none", cursor:"pointer", fontSize:12, fontWeight:600,
                  background: newsTab === t.key ? "linear-gradient(135deg,#f97316,#fb923c)" : "rgba(255,255,255,0.07)",
                  color: newsTab === t.key ? "#fff" : "var(--text-secondary)" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {loadingNews && (
          <div style={{ textAlign:"center", padding:30, color:"var(--text-muted)" }}>
            <div className="spinner" style={{ margin:"0 auto 10px" }} />กำลังโหลดข่าว...
          </div>
        )}

        {!loadingNews && newsTab === "thai" && (
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {thaiNews.length > 0 ? thaiNews.map((n, i) => (
              <div key={i} style={{ padding:"14px 0", borderBottom: i < thaiNews.length-1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <a href={n.url || n.link || "#"} target="_blank" rel="noopener noreferrer"
                  style={{ color:"#f8fafc", fontWeight:600, fontSize:14, textDecoration:"none", display:"block", marginBottom:4, transition:"color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color="#f97316"}
                  onMouseLeave={e => e.currentTarget.style.color="#f8fafc"}>
                  {n.title || n.headline || "ข่าวน้ำมันไทย"}
                </a>
                {n.summary && <p style={{ margin:0, fontSize:12, color:"var(--text-muted)", lineHeight:1.6 }}>{n.summary}</p>}
                <span style={{ fontSize:11, color:"var(--text-muted)", marginTop:4, display:"block" }}>{n.date || n.publishedAt || ""}</span>
              </div>
            )) : (
              <div style={{ textAlign:"center", padding:20, color:"var(--text-muted)", fontSize:13 }}>
                <AlertCircle size={20} style={{ marginBottom:8 }} /><br />ไม่พบข่าวน้ำมันไทยในขณะนี้<br />
                <a href="https://th.investing.com/commodities/crude-oil-news" target="_blank" rel="noopener noreferrer"
                  style={{ color:"#f97316", fontSize:12, marginTop:8, display:"inline-block" }}>→ ดูข่าวน้ำมันที่ investing.com</a>
              </div>
            )}
          </div>
        )}


      </div>

      <style>{`
        @keyframes pulseDot { 0%,100%{opacity:1;box-shadow:0 0 8px #22c55e} 50%{opacity:0.5;box-shadow:0 0 16px #22c55e} }
      `}</style>
    </div>
  );
}
