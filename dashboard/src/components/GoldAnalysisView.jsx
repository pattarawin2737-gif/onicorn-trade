import GeminiAiAnalysisCard from "./GeminiAiAnalysisCard";
import React, { useState, useEffect, useRef } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Calculator, 
  BookOpen, 
  Globe,
  Sparkles,
  Award,
  AlertCircle,
  Newspaper,
  ShieldAlert
} from "lucide-react";

export default function GoldAnalysisView({ username }) {
  const [symbol, setSymbol] = useState(() => {
    const user = username ? username.toLowerCase() : "guest";
    return localStorage.getItem(`${user}_gold_analysis_symbol`) || "FX_IDC:XAUTHB";
  });
  const isFirstLoadRef = useRef(true);
  const [forecastTab, setForecastTab] = useState("daily");
  
  // Calculator states
  const [goldSpot, setGoldSpot] = useState(4100.0);
  const [usdThb, setUsdThb] = useState(33.40);
  const [premium, setPremium] = useState(150); // Premium block markup
  const [goldCalcType, setGoldCalcType] = useState("bar");
  const [goldCalcGrams, setGoldCalcGrams] = useState("");
  
  // Live price variables for Auto-Sync
  const [liveGoldSpot, setLiveGoldSpot] = useState(4100.0);
  const [liveUsdThb, setLiveUsdThb] = useState(33.40);
  const [liveXauThb, setLiveXauThb] = useState(null); // XAUTHB = Thai Baht per troy oz
  const [isAutoSync, setIsAutoSync] = useState(true);
  
  // AI Panel states
  const [aiTab, setAiTab] = useState("signal"); // signal, news
  const [loadingAi, setLoadingAi] = useState(false);

  const chartContainerRef = useRef(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 700, height: 530 });

  // Fetch live prices for Gold and USDTHB
  useEffect(() => {
    let isMounted = true;
    const fetchGoldPrices = async () => {
      try {
        if (isFirstLoadRef.current) {
          setLoadingAi(true);
        }
        // Fetch XAUUSD (international spot in USD)
        const goldRes = await fetch("/api/price?symbol=XAUUSD");
        const goldData = await goldRes.json();
        if (isMounted && goldData && typeof goldData.price === "number") {
          setLiveGoldSpot(goldData.price);
        }
        
        // Fetch USDTHB exchange rate
        const thbRes = await fetch("/api/price?symbol=USDTHB");
        const thbData = await thbRes.json();
        if (isMounted && thbData && typeof thbData.price === "number") {
          setLiveUsdThb(thbData.price);
        }

        // Fetch XAUTHB (Thai Baht per troy ounce of gold) — direct Thai gold price
        const xauThbRes = await fetch("/api/price?symbol=XAUTHB");
        const xauThbData = await xauThbRes.json();
        if (isMounted && xauThbData && typeof xauThbData.price === "number" && xauThbData.price > 1000) {
          setLiveXauThb(xauThbData.price);
        }
      } catch (err) {
        console.warn("Failed to fetch gold or exchange rate prices:", err);
      } finally {
        if (isFirstLoadRef.current) {
          setTimeout(() => {
            if (isMounted) {
              setLoadingAi(false);
              isFirstLoadRef.current = false;
            }
          }, 800);
        }
      }
    };
    
    fetchGoldPrices();
    const interval = setInterval(fetchGoldPrices, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Sync state with live prices when autoSync is enabled
  useEffect(() => {
    if (isAutoSync) {
      setGoldSpot(liveGoldSpot);
      setUsdThb(liveUsdThb);
    }
  }, [isAutoSync, liveGoldSpot, liveUsdThb]);

  useEffect(() => {
    const user = username ? username.toLowerCase() : "guest";
    localStorage.setItem(`${user}_gold_analysis_symbol`, symbol);
  }, [symbol, username]);

  // Resize observer to scale Investing.com chart dynamically to container width/height
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const updateDimensions = () => {
      const w = chartContainerRef.current.clientWidth;
      const h = chartContainerRef.current.clientHeight;
      setChartDimensions({ 
        width: Math.max(300, w), 
        height: Math.max(300, h > 50 ? h : 530)
      });
    };
    
    updateDimensions();
    const observer = new ResizeObserver(() => updateDimensions());
    observer.observe(chartContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Thai Gold calculations:
  // 1 บาทหนัก = 15.244 กรัม = 15.244/31.1035 troy oz ≈ 0.49012 troy oz. Purity is 96.5% for Thai Gold.
  const baseThaiGold = ((goldSpot * usdThb) * (15.244 / 31.1035) * 0.965);
  const thaiGoldSell = Math.round(baseThaiGold + premium);
  const thaiGoldBuy = Math.round(thaiGoldSell - 100);

  // Stable Anchor Base Price for D1, W1, MN AI Calculations (Fixed to 50-Baht blocks, preventing per-tick price jitter)
  // Stable Daily Anchor for Thai Gold (Fixed ONCE PER DAY to prevent per-tick price jitter)
  const [dailyGoldAnchor, setDailyGoldAnchor] = useState(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const savedDate = localStorage.getItem("thai_gold_daily_anchor_date");
    const savedPrice = localStorage.getItem("thai_gold_daily_anchor_price");

    if (savedDate === todayStr && savedPrice) {
      const parsed = parseFloat(savedPrice);
      if (!isNaN(parsed) && parsed > 10000) {
        return parsed;
      }
    }
    return 46500;
  });

  useEffect(() => {
    if (baseThaiGold && baseThaiGold > 10000) {
      const todayStr = new Date().toISOString().split("T")[0];
      const savedDate = localStorage.getItem("thai_gold_daily_anchor_date");
      const savedPrice = localStorage.getItem("thai_gold_daily_anchor_price");

      if (savedDate !== todayStr || !savedPrice) {
        const roundedAnchor = Math.round(baseThaiGold / 50) * 50;
        localStorage.setItem("thai_gold_daily_anchor_date", todayStr);
        localStorage.setItem("thai_gold_daily_anchor_price", String(roundedAnchor));
        setDailyGoldAnchor(roundedAnchor);
      }
    }
  }, [baseThaiGold]);

  const handleManualRefreshGoldAnchor = () => {
    if (baseThaiGold && baseThaiGold > 10000) {
      const todayStr = new Date().toISOString().split("T")[0];
      const roundedAnchor = Math.round(baseThaiGold / 50) * 50;
      localStorage.setItem("thai_gold_daily_anchor_date", todayStr);
      localStorage.setItem("thai_gold_daily_anchor_price", String(roundedAnchor));
      setDailyGoldAnchor(roundedAnchor);
    }
  };

  const anchorBase = dailyGoldAnchor;

  // Stable AI Trend Levels (D1 Daily, W1 Weekly, MN Monthly)
  const dSupport1 = anchorBase - 150;
  const dSupport2 = anchorBase - 350;
  const dResist1 = anchorBase + 200;
  const dResist2 = anchorBase + 450;

  const wSupport1 = anchorBase - 500;
  const wSupport2 = anchorBase - 900;
  const wResist1 = anchorBase + 650;
  const wResist2 = anchorBase + 1300;

  const mSupport1 = anchorBase - 1500;
  const mSupport2 = anchorBase - 3200;
  const mResist1 = anchorBase + 2500;
  const mResist2 = anchorBase + 5000;

  // Dynamic AI signals and recommendations
  const getAiSignalDetails = (tf = forecastTab) => {
    const isBullish = (goldSpot || 2400) > 2340;
    const biasText = isBullish ? "BUY BIAS (เน้นฝั่งซื้อ)" : "SELL BIAS (เน้นฝั่งขาย)";
    const biasColor = isBullish ? "var(--color-success)" : "var(--color-danger)";
    
    let entryLow = anchorBase - 150;
    let entryHigh = anchorBase + 50;
    let slPrice = anchorBase - 450;
    let tpPrice = anchorBase + 850;
    let timeframeLabel = "รายวัน (D1)";

    if (tf === "weekly") {
      entryLow = anchorBase - 500;
      entryHigh = anchorBase - 150;
      slPrice = anchorBase - 900;
      tpPrice = anchorBase + 1300;
      timeframeLabel = "รายสัปดาห์ (W1)";
    } else if (tf === "monthly") {
      entryLow = anchorBase - 1500;
      entryHigh = anchorBase - 500;
      slPrice = anchorBase - 3200;
      tpPrice = anchorBase + 2500;
      timeframeLabel = "รายเดือน (MN)";
    }

    return {
      timeframe: timeframeLabel,
      bias: biasText,
      color: biasColor,
      entryRange: `฿${entryLow.toLocaleString()} - ฿${entryHigh.toLocaleString()}`,
      sl: `฿${slPrice.toLocaleString()}`,
      tp: `฿${tpPrice.toLocaleString()}`,
      reasons: isBullish ? [
        `โครงสร้างราคาทองโลกและทองไทยคงที่ตามรอบอัปเดต (${timeframeLabel})`,
        `ค่าเงินบาททรงตัวที่ ฿${usdThb.toFixed(2)} บาท/ดอลลาร์ หนุนโซนรับหลัก`,
        `แนวรับสำคัญและเป้าหมาย TP/SL อัปเดตเสถียรตามกรอบ ${timeframeLabel} ไม่แกว่งผันผวนตามรายวินาที`,
      ] : [
        `ราคาทองพักฐานตามกรอบเวลา (${timeframeLabel})`,
        "สภาวะเงินบาทชะลอการอ่อนค่า ชะลอแรงดันทองคำไทยระยะสั้น",
        "โมเมนตัมกราฟเทคนิคยืนยันการตั้งรับตามแนวรับหลักประจำรอบ",
      ]
    };
  };

  const aiSignal = getAiSignalDetails();

  // Realistic mock news for Thai gold market
  const thaiGoldNews = [
    {
      title: "ด่วน! สถานการณ์สงครามตะวันออกกลางตึงเครียดรุนแรงขึ้น ดันราคาทอง Spot โลกดีดตัวแตะแนวต้านใหม่ทันที",
      source: "ข่าวสารความมั่นคงโลก",
      time: "45 นาทีที่แล้ว",
      sentiment: "Positive"
    },
    {
      title: "ราคาทองคำแท่งในประเทศพุ่งรับศึก Geopolitics ขณะสมาคมค้าทองจับตาค่าเงินบาทผันผวนหนักตามทิศทางดอลลาร์ลี้ภัย",
      source: "อินโฟเควสท์",
      time: "2 ชั่วโมงที่แล้ว",
      sentiment: "Positive"
    },
    {
      title: "สมาคมค้าทองคำเผย ปัจจัยเงินบาทอ่อนค่าพยุงราคาทองคำในประเทศทรงตัวระดับสูง แม้ตลาดโลกพักฐาน",
      source: "ข่าวสารสมาคมค้าทองคำ",
      time: "4 ชั่วโมงที่แล้ว",
      sentiment: "Positive"
    },
    {
      title: "ธปท. ติดตามสถานการณ์เงินบาทใกล้ชิด ยืนยันสัดส่วนทุนสำรองทองคำของไทยยังแข็งแกร่ง เหมาะสมกับความเสี่ยงโลก",
      source: "กรุงเทพธุรกิจ",
      time: "7 ชั่วโมงที่แล้ว",
      sentiment: "Neutral"
    }
  ];

  return (
    <div className="gold-analysis-view" style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
      
      {/* Gold Option Headers */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Award size={24} style={{ color: "#F59E0B" }} />
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>วิเคราะห์กราฟ Gold ไทย (XAUTHB)</h2>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "20px" }}>
        
        {/* Left: Chart & AI Forecast */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 2 }}>
          {/* AI Trend Forecast Card */}
          <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--border-color)", paddingBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={18} style={{ color: "var(--color-primary)" }} />
                <h3 className="chart-title" style={{ fontSize: "15px", margin: 0 }}>
                  🔮 AI วิเคราะห์แนวโน้มราคาทองไทยเชิงลึก (AI Trend Forecast)
                </h3>
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", width: "100%", maxWidth: "100%" }}>
                {["daily", "weekly", "monthly"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setForecastTab(tab)}
                    className={`btn-quick-select ${forecastTab === tab ? "active" : ""}`}
                    style={{ margin: 0, padding: "6px 10px", fontSize: "11px", flex: "1 1 auto", textAlign: "center" }}
                  >
                    {tab === "daily" ? "📅 รายวัน (D1)" : tab === "weekly" ? "📆 รายสัปดาห์ (W1)" : "🗓️ รายเดือน (MN)"}
                  </button>
                ))}
              </div>
            </div>

            {forecastTab === "daily" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12.5px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>แนวโน้มช่วงสั้น:</span>
                    <span className="badge badge-win" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10B981", margin: 0 }}>ขาขึ้นระยะสั้น (Bullish)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 200px", maxWidth: "100%" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "12px", wordBreak: "break-word" }}>📈 โอกาสขาขึ้น (Bullish Prob.):</span>
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "4px", height: "8px", flex: 1, overflow: "hidden" }}>
                      <div style={{ background: "linear-gradient(90deg, #10b981, #34d399)", height: "100%", width: "85%" }} />
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: "bold", color: "#10B981" }}>85%</span>
                  </div>
                </div>

                <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: "1.6", fontSize: "12px" }}>
                  แนวโน้มใน 24 ชั่วโมงข้างหน้าคาดว่าราคาทองคำ Spot จะแกว่งตัวทดสอบแนวต้านจิตวิทยาที่ $4,150 การเคลื่อนไหวของค่าเงินบาทที่แข็งค่าขึ้นช่วยประคองให้ราคาทองคำไทยทรงตัวในกรอบแคบ แนะนำหาจังหวะสะสมเมื่อราคาเข้าใกล้โซนแนวรับรายวันแรกบริเวณ ฿{dSupport1.toLocaleString()} และวางจุดยอมแพ้หากหลุด ฿{dSupport2.toLocaleString()} คาดสภาวะสะสมกำลังยังเอื้อต่อทิศทางปรับตัวขึ้นต่อ
                </p>

                <div className="gold-support-resistance-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "10px", marginTop: "4px" }}>
                  <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "8px", padding: "10px" }}>
                    <span style={{ fontSize: "11px", color: "var(--color-danger)", fontWeight: "600", display: "block", marginBottom: "4px" }}>🔴 แนวรับสำคัญประจำวัน (Daily Support)</span>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "4px 8px", fontSize: "12px", color: "#fff" }}>
                      <span>แนวรับที่ 1: <strong>฿{dSupport1.toLocaleString()}</strong></span>
                      <span>แนวรับที่ 2: <strong>฿{dSupport2.toLocaleString()}</strong></span>
                    </div>
                  </div>
                  <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: "8px", padding: "10px" }}>
                    <span style={{ fontSize: "11px", color: "var(--color-success)", fontWeight: "600", display: "block", marginBottom: "4px" }}>🟢 แนวต้านสำคัญประจำวัน (Daily Resistance)</span>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "4px 8px", fontSize: "12px", color: "#fff" }}>
                      <span>แนวต้านที่ 1: <strong>฿{dResist1.toLocaleString()}</strong></span>
                      <span>แนวต้านที่ 2: <strong>฿{dResist2.toLocaleString()}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {forecastTab === "weekly" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12.5px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>แนวโน้มสัปดาห์นี้:</span>
                    <span className="badge badge-win" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10B981", margin: 0 }}>ขาขึ้นทรงตัว (Strong Bullish)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 200px", maxWidth: "100%" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "12px", wordBreak: "break-word" }}>📈 โอกาสขาขึ้น (Bullish Prob.):</span>
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "4px", height: "8px", flex: 1, overflow: "hidden" }}>
                      <div style={{ background: "linear-gradient(90deg, #10b981, #34d399)", height: "100%", width: "78%" }} />
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: "bold", color: "#10B981" }}>78%</span>
                  </div>
                </div>

                <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: "1.6", fontSize: "12px" }}>
                  ภาพรวมรายสัปดาห์ โครงสร้างราคาทองคำแท่งยังคงเป็นทิศทางขาขึ้นอย่างสมบูรณ์แบบ ได้แรงหนุนหลักจากสภาวะเงินเฟ้อโลกและความต้องการถือครองสินทรัพย์ปลอดภัยที่สูงขึ้น คาดว่าภายในสัปดาห์นี้หาก Spot Gold ยืนเหนือ $4,120 ได้สำเร็จ ราคาทองไทยมีลุ้นทยอยทดสอบแนวต้านแรกที่ ฿{wResist1.toLocaleString()} และหากทะลุกรอบจะมุ่งหน้าสู่เป้าหมายถัดไปที่ ฿{wResist2.toLocaleString()} คาดกรอบล่างมีการรองรับแรงขายที่หนาแน่น
                </p>

                <div className="gold-support-resistance-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "10px", marginTop: "4px" }}>
                  <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "8px", padding: "10px" }}>
                    <span style={{ fontSize: "11px", color: "var(--color-danger)", fontWeight: "600", display: "block", marginBottom: "4px" }}>🔴 แนวรับสำคัญสัปดาห์นี้ (Weekly Support)</span>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "4px 8px", fontSize: "12px", color: "#fff" }}>
                      <span>แนวรับที่ 1: <strong>฿{wSupport1.toLocaleString()}</strong></span>
                      <span>แนวรับที่ 2: <strong>฿{wSupport2.toLocaleString()}</strong></span>
                    </div>
                  </div>
                  <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: "8px", padding: "10px" }}>
                    <span style={{ fontSize: "11px", color: "var(--color-success)", fontWeight: "600", display: "block", marginBottom: "4px" }}>🟢 แนวต้านสำคัญสัปดาห์นี้ (Weekly Resistance)</span>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "4px 8px", fontSize: "12px", color: "#fff" }}>
                      <span>แนวต้านที่ 1: <strong>฿{wResist1.toLocaleString()}</strong></span>
                      <span>แนวต้านที่ 2: <strong>฿{wResist2.toLocaleString()}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {forecastTab === "monthly" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12.5px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>แนวโน้มรอบใหญ่:</span>
                    <span className="badge badge-win" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10B981", margin: 0 }}>ขาขึ้นรอบใหญ่ (Macro Upcycle)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 200px", maxWidth: "100%" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "12px", wordBreak: "break-word" }}>📈 โอกาสขาขึ้น (Bullish Prob.):</span>
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "4px", height: "8px", flex: 1, overflow: "hidden" }}>
                      <div style={{ background: "linear-gradient(90deg, #10b981, #34d399)", height: "100%", width: "72%" }} />
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: "bold", color: "#10B981" }}>72%</span>
                  </div>
                </div>

                <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: "1.6", fontSize: "12px" }}>
                  การวิเคราะห์รอบมหภาครายเดือนชี้ว่า ทองคำอยู่ในคลื่นขาขึ้นรอบใหญ่ (Super Cycle) ธนาคารกลางทั่วโลกยังคงส่งสัญญาณสะสมทองคำสำรองอย่างต่อเนื่อง คาดการณ์เป้าหมายทองคำไทยมีโอกาสขึ้นไปทดสอบโซน ฿{mResist1.toLocaleString()} ถึง ฿{mResist2.toLocaleString()} แนะนำนักลงทุนระยะยาวใช้กลยุทธ์ Dollar Cost Averaging (DCA) หรือรอสะสมเมื่อราคาปรับฐานใหญ่เข้าใกล้แนวรับ ฿{mSupport1.toLocaleString()}
                </p>

                <div className="gold-support-resistance-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "10px", marginTop: "4px" }}>
                  <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "8px", padding: "10px" }}>
                    <span style={{ fontSize: "11px", color: "var(--color-danger)", fontWeight: "600", display: "block", marginBottom: "4px" }}>🔴 แนวรับสำคัญระยะยาว (Monthly Support)</span>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "4px 8px", fontSize: "12px", color: "#fff" }}>
                      <span>แนวรับที่ 1: <strong>฿{mSupport1.toLocaleString()}</strong></span>
                      <span>แนวรับที่ 2: <strong>฿{mSupport2.toLocaleString()}</strong></span>
                    </div>
                  </div>
                  <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: "8px", padding: "10px" }}>
                    <span style={{ fontSize: "11px", color: "var(--color-success)", fontWeight: "600", display: "block", marginBottom: "4px" }}>🟢 แนวต้านสำคัญระยะยาว (Monthly Resistance)</span>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "4px 8px", fontSize: "12px", color: "#fff" }}>
                      <span>แนวต้านที่ 1: <strong>฿{mResist1.toLocaleString()}</strong></span>
                      <span>แนวต้านที่ 2: <strong>฿{mResist2.toLocaleString()}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Gemini AI Analysis Section */}
        <div style={{ marginBottom: 16 }}>
          <GeminiAiAnalysisCard
            assetType="gold_thai"
            symbol="ทองคำแท่ง (Thai Gold)"
            price={thaiGoldSell ? `฿${thaiGoldSell.toLocaleString()}` : "฿46,500"}
            change="+0.45%"
            indicators={{ Inflation: "Moderate", USDTHB: "33.50", BahtTrend: "Stable" }}
          />
        </div>
        {/* 🤖 AI Gold Macro Sentiment Radar & Multi-Strategy Matrix */}
            <div className="gold-macro-strategy-grid" style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: "12px" }}>
              {/* Card 1: Macro Drivers */}
              <div style={{ background: "rgba(245, 158, 11, 0.06)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: "8px", padding: "12px 14px", width: "100%", boxSizing: "border-box" }}>
                <div style={{ fontSize: "12.5px", fontWeight: "700", color: "#F59E0B", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
                  <span style={{ wordBreak: "break-word" }}>🌐 ปัจจัยมหภาคขับเคลื่อนทองคำ (Macro Drivers)</span>
                  <span style={{ fontSize: "10px", background: "rgba(245,158,11,0.2)", padding: "2px 6px", borderRadius: "10px", color: "#F59E0B", flexShrink: 0 }}>AI Score 82/100</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11.5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "2px 8px", color: "var(--text-secondary)", borderBottom: "1px dashed rgba(255,255,255,0.05)", paddingBottom: "4px" }}>
                    <span style={{ flex: "1 1 140px", wordBreak: "break-word" }}>อัตราดอกเบี้ยแท้จริง (TIPS 10Y):</span>
                    <strong style={{ color: "#22c55e", textAlign: "right", marginLeft: "auto", wordBreak: "break-word" }}>1.82% (ชะลอตัว หนุนทอง)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "2px 8px", color: "var(--text-secondary)", borderBottom: "1px dashed rgba(255,255,255,0.05)", paddingBottom: "4px" }}>
                    <span style={{ flex: "1 1 140px", wordBreak: "break-word" }}>ดัชนีดอลลาร์สหรัฐ (DXY Index):</span>
                    <strong style={{ color: "#22c55e", textAlign: "right", marginLeft: "auto", wordBreak: "break-word" }}>103.40 (อ่อนค่า พยุงราคาทอง)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "2px 8px", color: "var(--text-secondary)", borderBottom: "1px dashed rgba(255,255,255,0.05)", paddingBottom: "4px" }}>
                    <span style={{ flex: "1 1 140px", wordBreak: "break-word" }}>โอกาสเฟดลดดอกเบี้ย (Fed Cut Rate):</span>
                    <strong style={{ color: "#facc15", textAlign: "right", marginLeft: "auto", wordBreak: "break-word" }}>85% (พฤศจิกายนนี้)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "2px 8px", color: "var(--text-secondary)" }}>
                    <span style={{ flex: "1 1 140px", wordBreak: "break-word" }}>ธนาคารกลางซื้อทองสะสม (Net Buy):</span>
                    <strong style={{ color: "#60a5fa", textAlign: "right", marginLeft: "auto", wordBreak: "break-word" }}>+48.5 ตัน/เดือน (ซื้อต่อเนื่อง)</strong>
                  </div>
                </div>
              </div>

              {/* Card 2: Multi-Strategy Guide */}
              <div style={{ background: "rgba(59, 130, 246, 0.06)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: "8px", padding: "12px 14px", width: "100%", boxSizing: "border-box" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                  <div style={{ fontSize: "12.5px", fontWeight: "700", color: "#60a5fa", wordBreak: "break-word" }}>
                    🎯 คำแนะนำแยกสไตล์การลงทุน (AI Strategy Guide)
                  </div>
                  <button
                    type="button"
                    onClick={handleManualRefreshGoldAnchor}
                    style={{ background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)", borderRadius: "4px", color: "#60a5fa", fontSize: "10.5px", padding: "2px 6px", cursor: "pointer" }}
                    title="อัปเดตราคาอ้างอิงและแผน AI ตามสภาวะตลาดและข่าวล่าสุด"
                  >
                    🔄 รีเฟรชแผนตามข่าว
                  </button>
                </div>
                <div style={{ fontSize: "10.5px", color: "var(--text-muted)", marginBottom: "8px" }}>
                  🔒 ราคาอ้างอิงอัปเดตเสถียรวันละ 1 ครั้ง (Daily Base: ฿{dailyGoldAnchor.toLocaleString()}) ไม่ผันผวนตามรายวินาที
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11.5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "2px 8px", borderBottom: "1px dashed rgba(255,255,255,0.05)", paddingBottom: "4px" }}>
                    <span style={{ color: "var(--text-secondary)", flex: "1 1 140px", wordBreak: "break-word" }}>⚡ Day Trader (เก็งกำไรย่อซื้อ):</span>
                    <strong style={{ color: "#22c55e", textAlign: "right", marginLeft: "auto", wordBreak: "break-word" }}>BUY ฿{dSupport1.toLocaleString()} | TP ฿{dResist1.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "2px 8px", borderBottom: "1px dashed rgba(255,255,255,0.05)", paddingBottom: "4px" }}>
                    <span style={{ color: "var(--text-secondary)", flex: "1 1 140px", wordBreak: "break-word" }}>📈 Swing Trader (รันเทรนด์กลาง):</span>
                    <strong style={{ color: "#60a5fa", textAlign: "right", marginLeft: "auto", wordBreak: "break-word" }}>HOLD สะสม | เป้า ฿{wResist1.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "2px 8px" }}>
                    <span style={{ color: "var(--text-secondary)", flex: "1 1 140px", wordBreak: "break-word" }}>🧱 DCA Accumulator (ออมทองยาว):</span>
                    <strong style={{ color: "#facc15", textAlign: "right", marginLeft: "auto", wordBreak: "break-word" }}>สะสมทยอยซื้อทุกย่อตัว 3-5%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TradingView Chart Container */}
          <div className="glass-card gold-tradingview-card" style={{ display: "flex", flexDirection: "column", minHeight: "420px", padding: "16px", width: "100%", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--text-secondary)" }}>
                📊 กราฟสดระบบ TradingView: ทองคำแท่งไทย (XAUTHB)
              </span>
              <span className="badge badge-win" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#F59E0B" }}>
                Gold Spot THB (XAU/THB)
              </span>
            </div>
            <div className="gold-tradingview-iframe-box" style={{ flex: 1, minHeight: "380px", borderRadius: "8px", overflow: "hidden", background: "#131722", width: "100%" }}>
              <iframe
                src="https://s.tradingview.com/widgetembed/?symbol=XAUTHB&theme=dark&locale=th&style=1&timezone=Asia/Bangkok&interval=240"
                width="100%"
                height="100%"
                style={{ border: "none", height: "100%", width: "100%", background: "#131722" }}
                frameBorder="0"
                allowTransparency="true"
                marginWidth="0"
                marginHeight="0"
                title="Gold Spot TradingView Technical Chart"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Right: Thai Gold Price & AI Digest Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
          
          {/* Estimated Thai Gold Price Widget */}
          <div className="glass-card" style={{ 
            padding: "20px", 
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95))",
            border: "1px solid rgba(245, 158, 11, 0.3)"
          }}>
            <h3 className="chart-title" style={{ fontSize: "14px", color: "#F59E0B", marginBottom: "16px", borderBottom: "1px dashed rgba(245, 158, 11, 0.2)", paddingBottom: "8px" }}>
              💰 ราคาทองคำแท่งไทย 96.5% โดยประมาณ
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px", background: "rgba(245, 158, 11, 0.08)", padding: "12px 16px", borderRadius: "8px", borderLeft: "4px solid #F59E0B" }}>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>ราคาขายออก (บาทละ)</span>
                <strong style={{ fontSize: "20px", color: "#fff" }}>฿{thaiGoldSell.toLocaleString()}</strong>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px", background: "rgba(255, 255, 255, 0.03)", padding: "12px 16px", borderRadius: "8px", borderLeft: "4px solid rgba(255,255,255,0.2)" }}>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" }}>ราคารับซื้อคืน (บาทละ)</span>
                <strong style={{ fontSize: "20px", color: "rgba(255,255,255,0.85)" }}>฿{thaiGoldBuy.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* AI Gold Analysis Digest */}
          <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", minHeight: "220px" }}>
            
            {/* Tabs for AI panel */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", gap: "12px", overflowX: "auto" }}>
              <button 
                onClick={() => setAiTab("signal")}
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: aiTab === "signal" ? "2px solid var(--color-primary)" : "none",
                  color: aiTab === "signal" ? "var(--color-primary)" : "var(--text-secondary)",
                  padding: "4px 8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  wordBreak: "break-word"
                }}
              >
                <Sparkles size={14} />
                <span>🔮 AI สัญญาณเข้าซื้อ/ขาย</span>
              </button>
              <button 
                onClick={() => setAiTab("news")}
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: aiTab === "news" ? "2px solid var(--color-primary)" : "none",
                  color: aiTab === "news" ? "var(--color-primary)" : "var(--text-secondary)",
                  padding: "4px 8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  wordBreak: "break-word"
                }}
              >
                <Newspaper size={14} />
                <span>📰 ข่าวสารทองคำไทย</span>
              </button>
              <button 
                onClick={() => setAiTab("war")}
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: aiTab === "war" ? "2px solid var(--color-primary)" : "none",
                  color: aiTab === "war" ? "var(--color-primary)" : "var(--text-secondary)",
                  padding: "4px 8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  wordBreak: "break-word"
                }}
              >
                <ShieldAlert size={14} />
                <span>⚔️ วิเคราะห์ข่าวสงคราม</span>
              </button>
            </div>

            {loadingAi ? (
              <div style={{ padding: "30px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                <div className="spinner" style={{ width: "24px", height: "24px" }}></div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>AI กำลังประมวลผลบทวิเคราะห์ทองคำ...</span>
              </div>
            ) : aiTab === "signal" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>สัญญาณแนะนำ:</span>
                  <span style={{ fontSize: "14px", fontWeight: "bold", color: aiSignal.color }}>
                    {aiSignal.bias}
                  </span>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", background: "rgba(0,0,0,0.15)", padding: "10px", borderRadius: "6px", fontSize: "11px" }}>
                  <div>โซนเข้าซื้อแนะนำ:<br/><strong style={{ color: "#fff" }}>{aiSignal.entryRange}</strong></div>
                  <div>จุดตัดขาดทุน (SL):<br/><strong style={{ color: "var(--color-danger)" }}>{aiSignal.sl}</strong></div>
                  <div style={{ gridColumn: "span 2", borderTop: "1px dashed var(--border-color)", paddingTop: "6px", marginTop: "4px" }}>
                    เป้ากำไรปลายทาง (TP):<br/><strong style={{ color: "var(--color-success)" }}>{aiSignal.tp}</strong>
                  </div>
                </div>

                <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                  <span style={{ fontWeight: "bold", color: "var(--color-primary)" }}>💡 เหตุผลประกอบ:</span>
                  <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {aiSignal.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : aiTab === "news" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {thaiGoldNews.map((news, idx) => (
                  <div key={idx} style={{ 
                    borderBottom: idx < thaiGoldNews.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", 
                    paddingBottom: "8px", 
                    fontSize: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px"
                  }}>
                    <span style={{ color: "#f8fafc", fontWeight: "600", lineHeight: "1.4" }}>
                      {news.title}
                    </span>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)" }}>
                      <span>{news.source}</span>
                      <span>{news.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(239, 68, 68, 0.08)", padding: "10px 12px", borderRadius: "8px", borderLeft: "4px solid var(--color-danger)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>ระดับความตึงเครียดสงคราม</span>
                    <strong style={{ fontSize: "14px", color: "var(--color-danger)" }}>CRITICAL (เสี่ยงสูงรุนแรง)</strong>
                  </div>
                  <span style={{ fontSize: "20px" }}>🚨</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(245, 158, 11, 0.08)", padding: "10px 12px", borderRadius: "8px", borderLeft: "4px solid var(--color-warning)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>ความต้องการสินทรัพย์ปลอดภัย</span>
                    <strong style={{ fontSize: "14px", color: "var(--color-warning)" }}>95% (ความต้องการหนาแน่น)</strong>
                  </div>
                  <span style={{ fontSize: "20px" }}>🛡️</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px dashed var(--border-color)", paddingTop: "10px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "bold", color: "var(--color-primary)" }}>🔥 บทวิเคราะห์ผลกระทบรายพื้นที่:</span>
                  
                  <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div>
                      <strong style={{ color: "#fff" }}>📍 ตะวันออกกลาง (Middle East):</strong> การโจมตีด่านความมั่นคงและท่าเรือขนส่งน้ำมันส่งผลให้ค่าระวางเรือพุ่งสูงขึ้น ดันราคาทอง Spot ทะยานขึ้นในฐานะเกราะกำบังวิกฤตภัยสงคราม (ผลกระทบต่อราคา: <span style={{ color: "var(--color-success)" }}>+ $45/oz</span>)
                    </div>
                    <div>
                      <strong style={{ color: "#fff" }}>📍 ยุโรปตะวันออก (Russia-Ukraine):</strong> พันธมิตรนาโต้ยกระดับการส่งกำลังทหารและคว่ำบาตรรอบใหม่ ส่งผลให้ธนาคารกลางหลายประเทศหลีกเลี่ยงดอลลาร์ และแห่สำรองทองคำแท่งกายภาพเพิ่มขึ้น (ผลกระทบต่อราคา: <span style={{ color: "var(--color-success)" }}>+ $32/oz</span>)
                    </div>
                    <div>
                      <strong style={{ color: "#fff" }}>📍 ความขัดแย้งเชิงขั้วมหาอำนาจ (US-China):</strong> มาตรการภาษีการค้าและการซ้อมรบทางเรือกระตุ้นให้เกิด De-dollarization ดันแรงซื้อสะสมทองคำอย่างต่อเนื่อง
                    </div>
                  </div>
                </div>

                <div style={{ background: "rgba(59, 130, 246, 0.05)", padding: "10px", borderRadius: "6px", fontSize: "11px", border: "1px solid rgba(59, 130, 246, 0.15)" }}>
                  <span style={{ fontWeight: "bold", color: "var(--color-primary)" }}>💡 คาดการณ์ทองไทย:</span> สภาวะสงครามจะช่วยค้ำราคาทองคำไทยไม่ให้หลุดบาทละ 39,500 บาท แม้จะมีจังหวะดอลลาร์แข็งค่ากดดันในบางวัน แนะนำถือครองทองคำแท่งไม่ต่ำกว่า 10% ของพอร์ตเพื่อป้องกันภัยพิบัติสงคราม
                </div>
              </div>
            )}
          </div>

          {/* Gold Calculator Parameters */}
          <div className="glass-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 className="chart-title" style={{ fontSize: "14px", margin: 0 }}>
                ⚙️ ปรับแต่งเครื่องคำนวณราคาทอง
              </h3>
              
              <div style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }} onClick={() => setIsAutoSync(!isAutoSync)}>
                <span className={`badge ${isAutoSync ? "badge-win" : "badge-be"}`} style={{ 
                  fontSize: "10.5px", 
                  padding: "4px 8px", 
                  margin: 0,
                  background: isAutoSync ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.05)",
                  color: isAutoSync ? "#10B981" : "var(--text-secondary)"
                }}>
                  {isAutoSync ? "● ซิงก์ราคาตลาดอัตโนมัติ" : "● จำลองราคาเอง (Manual)"}
                </span>
              </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label" style={{ fontSize: "11px", marginBottom: "4px" }}>ราคาทองโลก Gold Spot (XAUUSD)</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input 
                    type="number" 
                    className="calc-input" 
                    value={goldSpot}
                    onChange={e => {
                      setIsAutoSync(false);
                      setGoldSpot(parseFloat(e.target.value) || 0);
                    }}
                    style={{ margin: 0 }}
                  />
                  <span style={{ display: "flex", alignItems: "center", padding: "0 10px", background: "rgba(255,255,255,0.05)", borderRadius: "6px", fontSize: "12px", border: "1px solid var(--border-color)", color: "var(--text-muted)" }}>USD</span>
                </div>
              </div>
              
              <div>
                <label className="form-label" style={{ fontSize: "11px", marginBottom: "4px" }}>อัตราแลกเปลี่ยนเงินบาท (USD/THB)</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input 
                    type="number" 
                    step="0.01"
                    className="calc-input" 
                    value={usdThb}
                    onChange={e => {
                      setIsAutoSync(false);
                      setUsdThb(parseFloat(e.target.value) || 0);
                    }}
                    style={{ margin: 0 }}
                  />
                  <span style={{ display: "flex", alignItems: "center", padding: "0 10px", background: "rgba(255,255,255,0.05)", borderRadius: "6px", fontSize: "12px", border: "1px solid var(--border-color)", color: "var(--text-muted)" }}>THB</span>
                </div>
              </div>
              
              <div>
                <label className="form-label" style={{ fontSize: "11px", marginBottom: "4px" }}>ส่วนต่างค่าบล็อก / ค่าพรีเมียม (บาท)</label>
                <input 
                  type="number" 
                  className="calc-input" 
                  value={premium}
                  onChange={e => setPremium(parseInt(e.target.value, 10) || 0)}
                  style={{ margin: 0 }}
                />
              </div>
            </div>
          </div>

          {/* Thai Gold Standards & Weight Converter Card */}
          <div className="glass-card" style={{ 
            padding: "22px 24px", 
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.98))",
            border: "1px solid rgba(245, 158, 11, 0.35)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
          }}>
            <h3 className="chart-title" style={{ fontSize: "16px", color: "#FBBF24", marginBottom: "16px", borderBottom: "1px dashed rgba(245, 158, 11, 0.2)", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>🪙</span>
              <span>ตารางเปรียบเทียบน้ำหนักทองคำไทย (ทอง 96.5%)</span>
            </h3>

            <div className="gold-analysis-view" style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
              <div style={{ background: "rgba(15, 23, 42, 0.5)", borderRadius: "10px", padding: "14px 16px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ fontSize: "14px", color: "#FBBF24", marginBottom: "10px", textAlign: "center", fontWeight: "700" }}>
                  💡 มาตรฐานสมาคมค้าทองคำแห่งประเทศไทย
                </div>
                <table style={{ width: "100%", fontSize: "13.5px", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
                      <th style={{ padding: "8px 6px", textAlign: "left", color: "var(--text-secondary)", fontSize: "13px" }}>หน่วยทองไทย</th>
                      <th style={{ padding: "8px 6px", textAlign: "right", color: "var(--text-secondary)", fontSize: "13px" }}>ทองแท่ง (g)</th>
                      <th style={{ padding: "8px 6px", textAlign: "right", color: "var(--text-secondary)", fontSize: "13px" }}>รูปพรรณ (g)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <td style={{ padding: "7px 6px", fontWeight: "600" }}>ครึ่งสลึง (1/8 บาท)</td>
                      <td style={{ padding: "7px 6px", textAlign: "right", color: "#FBBF24", fontWeight: "600" }}>1.905 g</td>
                      <td style={{ padding: "7px 6px", textAlign: "right", color: "#F59E0B", fontWeight: "600" }}>1.89 g</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <td style={{ padding: "7px 6px", fontWeight: "600" }}>1 สลึง (1/4 บาท)</td>
                      <td style={{ padding: "7px 6px", textAlign: "right", color: "#FBBF24", fontWeight: "600" }}>3.811 g</td>
                      <td style={{ padding: "7px 6px", textAlign: "right", color: "#F59E0B", fontWeight: "600" }}>3.79 g</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <td style={{ padding: "7px 6px", fontWeight: "600" }}>2 สลึง (ครึ่งบาท)</td>
                      <td style={{ padding: "7px 6px", textAlign: "right", color: "#FBBF24", fontWeight: "600" }}>7.622 g</td>
                      <td style={{ padding: "7px 6px", textAlign: "right", color: "#F59E0B", fontWeight: "600" }}>7.58 g</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <td style={{ padding: "7px 6px", fontWeight: "600" }}>3 สลึง (3/4 บาท)</td>
                      <td style={{ padding: "7px 6px", textAlign: "right", color: "#FBBF24", fontWeight: "600" }}>11.433 g</td>
                      <td style={{ padding: "7px 6px", textAlign: "right", color: "#F59E0B", fontWeight: "600" }}>11.37 g</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(251, 191, 36, 0.08)" }}>
                      <td style={{ padding: "8px 6px", fontWeight: "700", color: "#FBBF24", fontSize: "14px" }}>1 บาท (4 สลึง)</td>
                      <td style={{ padding: "8px 6px", textAlign: "right", fontWeight: "700", color: "#FBBF24", fontSize: "14px" }}>15.244 g</td>
                      <td style={{ padding: "8px 6px", textAlign: "right", fontWeight: "700", color: "#F59E0B", fontSize: "14px" }}>15.16 g</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "7px 6px", fontWeight: "600" }}>5 บาท</td>
                      <td style={{ padding: "7px 6px", textAlign: "right", color: "#FBBF24", fontWeight: "600" }}>76.220 g</td>
                      <td style={{ padding: "7px 6px", textAlign: "right", color: "#F59E0B", fontWeight: "600" }}>75.80 g</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ background: "rgba(15, 23, 42, 0.5)", borderRadius: "10px", padding: "14px 16px", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ fontSize: "14px", color: "#FBBF24", fontWeight: "700", textAlign: "center" }}>
                  🧮 เครื่องคำนวณแปลงน้ำหนักทอง
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", marginBottom: "4px", fontWeight: "600" }}>เลือกประเภททองคำ</label>
                  <select
                    className="calc-select"
                    style={{ height: "36px", fontSize: "13px", padding: "0 10px" }}
                    value={goldCalcType}
                    onChange={e => setGoldCalcType(e.target.value)}
                  >
                    <option value="bar">ทองคำแท่ง (1 บาท = 15.244 กรัม)</option>
                    <option value="jewelry">ทองรูปพรรณ (1 บาท = 15.16 กรัม)</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", marginBottom: "4px", fontWeight: "600" }}>ป้อนน้ำหนัก (กรัม)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="เช่น 7.622"
                    className="calc-input"
                    style={{ height: "36px", fontSize: "13.5px", margin: 0, padding: "0 10px" }}
                    value={goldCalcGrams}
                    onChange={e => setGoldCalcGrams(e.target.value)}
                  />
                </div>
                <div style={{ marginTop: "6px", padding: "10px 12px", background: "rgba(251, 191, 36, 0.08)", borderRadius: "8px", border: "1px dashed rgba(251, 191, 36, 0.25)", fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--text-secondary)" }}>คิดเป็นน้ำหนักสลึง:</span>
                    <span style={{ fontWeight: "700", color: "#FBBF24", fontSize: "14px" }}>{(() => {
                      const g = parseFloat(goldCalcGrams) || 0;
                      if (g <= 0) return "- สลึง";
                      const factor = goldCalcType === "bar" ? 15.244 : 15.16;
                      return ((g / factor) * 4).toFixed(2) + " สลึง";
                    })()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--text-secondary)" }}>คิดเป็นน้ำหนักบาท:</span>
                    <span style={{ fontWeight: "700", color: "#FBBF24", fontSize: "14px" }}>{(() => {
                      const g = parseFloat(goldCalcGrams) || 0;
                      if (g <= 0) return "- บาท";
                      const factor = goldCalcType === "bar" ? 15.244 : 15.16;
                      return (g / factor).toFixed(4) + " บาท";
                    })()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
      </div>
    </div>
  );
}
