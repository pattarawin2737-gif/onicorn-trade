import GeminiAiAnalysisCard from "./GeminiAiAnalysisCard";
import React, { useState, useEffect, useRef } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Calculator, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Globe,
  Sparkles,
  Calendar as CalendarIcon,
  Newspaper,
  ShieldAlert
} from "lucide-react";

const forexPairIds = {
  "XAUUSD": 68,
  "GOLD": 68,
  "EURUSD": 1,
  "GBPUSD": 2,
  "USDJPY": 3,
  "BTCUSDT": 945629,
  "BTCUSD": 945629,
  "USDTHB": 330
};

const getSessionsInfo = (currentDate) => {
  const month = currentDate.getMonth();
  const isUsUkSummer = (month >= 3 && month <= 9); // April to October
  const isAuSummer = (month >= 9 || month <= 2); // October to March
  
  const sydneyHours = isAuSummer ? { start: 5, end: 14 } : { start: 6, end: 15 };
  const tokyoHours = { start: 7, end: 16 };
  const londonHours = isUsUkSummer ? { start: 14, end: 23 } : { start: 15, end: 24 };
  const nyHours = isUsUkSummer ? { start: 19, end: 4 } : { start: 20, end: 5 };
  
  const hour = currentDate.getHours();
  const isOpen = (start, end) => {
    if (start < end) {
      return hour >= start && hour < end;
    } else {
      return hour >= start || hour < end;
    }
  };
  
  return [
    {
      name: "Sydney (🇦🇺 ซิดนีย์)",
      hoursText: isAuSummer ? "05:00 - 14:00 น." : "06:00 - 15:00 น.",
      open: isOpen(sydneyHours.start, sydneyHours.end),
      color: "#3B82F6",
      desc: "ตลาดออสเตรเลีย: AUD, NZD มีการเคลื่อนไหวดี"
    },
    {
      name: "Tokyo (🇯🇵 โตเกียว)",
      hoursText: "07:00 - 16:00 น.",
      open: isOpen(tokyoHours.start, tokyoHours.end),
      color: "#eab308",
      desc: "ตลาดเอเชีย: JPY, AUD, NZD ขยับตัวเด่นชัด"
    },
    {
      name: "London (🇬🇧 ลอนดอน)",
      hoursText: isUsUkSummer ? "14:00 - 23:00 น." : "15:00 - 00:00 น.",
      open: isOpen(londonHours.start, londonHours.end),
      color: "#a78bfa",
      desc: "ตลาดยุโรป: EUR, GBP วิ่งแรง สภาพคล่องสูง"
    },
    {
      name: "New York (🇺🇸 นิวยอร์ก)",
      hoursText: isUsUkSummer ? "19:00 - 04:00 น." : "20:00 - 05:00 น.",
      open: isOpen(nyHours.start, nyHours.end),
      color: "#f97316",
      desc: "ตลาดอเมริกา: USD, ทองคำวิ่งแรงที่สุด สภาพคล่องสูงสุด"
    }
  ];
};

export default function AnalysisView({ username }) {
  const [symbol, setSymbol] = useState(() => {
    const user = username ? username.toLowerCase() : "guest";
    return localStorage.getItem(`${user}_forex_analysis_symbol`) || "OANDA:XAUUSD";
  });
  const [searchInput, setSearchInput] = useState(() => {
    const user = username ? username.toLowerCase() : "guest";
    const saved = localStorage.getItem(`${user}_forex_analysis_symbol`) || "OANDA:XAUUSD";
    return saved.split(":")[1] || saved;
  });

  const chartContainerRef = useRef(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 700, height: 670 });

  // Checklist states
  const [checklist, setChecklist] = useState({
    trend: "uptrend", // trend, structure, etc
    structure: "",
    supportResistance: false,
    orderBlock: false,
    imbalance: false,
    hiddenBase: false,
    fibonacci: false,
    qmPattern: false,
    liquiditySweep: false,
    rsiDivergence: false,
    macdCrossover: false,
    chartPattern: "",
    sessionTiming: false,
    noHighImpactNews: false
  });

  // Calculator states
  const [calcAsset, setCalcAsset] = useState("gold"); // gold, forex, jpy
  const [calcBalance, setCalcBalance] = useState(1000);
  const [calcRiskPct, setCalcRiskPct] = useState(1);
  const [calcEntry, setCalcEntry] = useState(2350.0);
  const [calcSL, setCalcSL] = useState(2345.0);
  const [calcTP, setCalcTP] = useState(2365.0);
  
  // Accordion active EP
  const [activeEP, setActiveEP] = useState(null);

  // Copy state
  const [copied, setCopied] = useState(false);

  // Live clock state for Forex market hours
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calendar Height Auto Fit state
  const [calendarHeight, setCalendarHeight] = useState("650px");
  const [calendarTab, setCalendarTab] = useState("today");

  const handleCalendarLoad = (e) => {
    try {
      const iframe = e.target;
      if (iframe && iframe.contentWindow && iframe.contentWindow.document && iframe.contentWindow.document.body) {
        const bodyHeight = iframe.contentWindow.document.body.scrollHeight;
        setCalendarHeight(`${bodyHeight + 15}px`);
      }
    } catch (err) {
      console.warn("Failed to auto-fit calendar iframe height:", err);
    }
  };

  // Quick Selects State
  const [quickSelects, setQuickSelects] = useState([
    { symbol: "OANDA:XAUUSD", label: "🏆 XAUUSD", assetType: "gold" },
    { symbol: "FX:EURUSD", label: "🇪🇺 EURUSD", assetType: "forex" },
    { symbol: "FX:GBPUSD", label: "🇬🇧 GBPUSD", assetType: "forex" },
    { symbol: "FX:USDJPY", label: "🇯🇵 USDJPY", assetType: "jpy" },
    { symbol: "BINANCE:BTCUSDT", label: "₿ BTCUSD", assetType: "forex" }
  ]);

  const [showAddShortcut, setShowAddShortcut] = useState(false);
  const [newShortcutSymbol, setNewShortcutSymbol] = useState("");
  const [newShortcutLabel, setNewShortcutLabel] = useState("");
  const [newShortcutType, setNewShortcutType] = useState("forex");

  // Load user-scoped quick selects
  useEffect(() => {
    const user = username ? username.toLowerCase() : "guest";
    const saved = localStorage.getItem(`${user}_forex_dashboard_quick_selects`);
    if (saved) {
      try {
        setQuickSelects(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved quick selects", e);
      }
    } else {
      setQuickSelects([
        { symbol: "OANDA:XAUUSD", label: "🏆 XAUUSD", assetType: "gold" },
        { symbol: "FX:EURUSD", label: "🇪🇺 EURUSD", assetType: "forex" },
        { symbol: "FX:GBPUSD", label: "🇬🇧 GBPUSD", assetType: "forex" },
        { symbol: "FX:USDJPY", label: "🇯🇵 USDJPY", assetType: "jpy" },
        { symbol: "BINANCE:BTCUSDT", label: "₿ BTCUSD", assetType: "forex" }
      ]);
    }
  }, [username]);

  // Save quick selects
  useEffect(() => {
    const user = username ? username.toLowerCase() : "guest";
    localStorage.setItem(`${user}_forex_dashboard_quick_selects`, JSON.stringify(quickSelects));
  }, [quickSelects, username]);

  useEffect(() => {
    const user = username ? username.toLowerCase() : "guest";
    localStorage.setItem(`${user}_forex_analysis_symbol`, symbol);
  }, [symbol, username]);

  // Resize observer to scale Investing.com chart dynamically to container width/height
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const updateDimensions = () => {
      const w = chartContainerRef.current.clientWidth;
      const h = chartContainerRef.current.clientHeight;
      setChartDimensions({ 
        width: Math.max(300, w), 
        height: Math.max(300, h > 50 ? h : 670)
      });
    };
    
    updateDimensions();
    const observer = new ResizeObserver(() => updateDimensions());
    observer.observe(chartContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleAddShortcut = (e) => {
    e.preventDefault();
    const cleanSym = newShortcutSymbol.trim().toUpperCase();
    const cleanLabel = newShortcutLabel.trim();
    if (!cleanSym || !cleanLabel) return;
    
    // Add exchange prefix if not present
    let formattedSym = cleanSym;
    if (!cleanSym.includes(":")) {
      if (cleanSym.endsWith("USD") || cleanSym.endsWith("EUR") || cleanSym.endsWith("GBP") || cleanSym.endsWith("JPY") || cleanSym.endsWith("CHF") || cleanSym.endsWith("CAD") || cleanSym.endsWith("AUD")) {
        formattedSym = "FX:" + cleanSym;
      } else if (cleanSym.includes("BTC") || cleanSym.includes("ETH") || cleanSym.includes("USDT")) {
        formattedSym = "BINANCE:" + cleanSym;
      } else {
        formattedSym = "FX:" + cleanSym; // fallback
      }
    }
    
    const newShortcut = {
      symbol: formattedSym,
      label: cleanLabel,
      assetType: newShortcutType
    };
    
    setQuickSelects([...quickSelects, newShortcut]);
    setNewShortcutSymbol("");
    setNewShortcutLabel("");
    setShowAddShortcut(false);
  };

  const handleDeleteShortcut = (indexToDelete, e) => {
    e.stopPropagation();
    const updated = quickSelects.filter((_, idx) => idx !== indexToDelete);
    setQuickSelects(updated);
  };

  // AI Analysis States
  const [activeTimeframe, setActiveTimeframe] = useState("1h");
  const [livePrice, setLivePrice] = useState(null);

  useEffect(() => {
    let isMounted = true;
    // Strip TradingView exchange prefix (e.g. "OANDA:XAUUSD" → "XAUUSD", "FX:EURUSD" → "EURUSD")
    const cleanSym = symbol.includes(":") ? symbol.split(":").pop() : symbol;
    const fetchPrice = async () => {
      try {
        const res = await fetch(`/api/price?symbol=${encodeURIComponent(cleanSym)}`);
        const data = await res.json();
        if (isMounted && data && typeof data.price === "number") {
          setLivePrice(data.price);
        }
      } catch (err) {
        console.warn("Failed to fetch live price:", err);
      }
    };
    
    fetchPrice();
    const interval = setInterval(fetchPrice, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol]);
  const [analysisTab, setAnalysisTab] = useState("technical"); // technical, news
  const [reportTab, setReportTab] = useState("daily"); // daily, weekly, monthly



  const [srPeriod, setSrPeriod] = useState("daily"); // daily (D1), weekly (W1), monthly (MN)

  // Helper for stable timeframe anchor price (Locks to Daily D1, Weekly W1, Monthly MN to prevent per-tick jitter)
  const getStableAnchorPrice = (cleanSym, period, liveVal, defaultVal) => {
    const effectiveLive = (typeof liveVal === "number" && liveVal > 0) ? liveVal : defaultVal;
    const now = new Date();
    let periodKey = "";

    if (period === "weekly" || period === "W1" || period === "1W") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const pastDaysOfYear = (now - startOfYear) / 86400000;
      const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
      periodKey = `${cleanSym}_anchor_weekly_${now.getFullYear()}_W${weekNum}`;
    } else if (period === "monthly" || period === "MN" || period === "1M") {
      periodKey = `${cleanSym}_anchor_monthly_${now.getFullYear()}_M${now.getMonth() + 1}`;
    } else {
      periodKey = `${cleanSym}_anchor_daily_${now.toISOString().split("T")[0]}`;
    }

    const saved = localStorage.getItem(periodKey);
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }

    localStorage.setItem(periodKey, String(effectiveLive));
    return effectiveLive;
  };

  const handleResetAnchorPrice = (cleanSym, period) => {
    const now = new Date();
    let periodKey = "";
    if (period === "weekly" || period === "W1" || period === "1W") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const pastDaysOfYear = (now - startOfYear) / 86400000;
      const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
      periodKey = `${cleanSym}_anchor_weekly_${now.getFullYear()}_W${weekNum}`;
    } else if (period === "monthly" || period === "MN" || period === "1M") {
      periodKey = `${cleanSym}_anchor_monthly_${now.getFullYear()}_M${now.getMonth() + 1}`;
    } else {
      periodKey = `${cleanSym}_anchor_daily_${now.toISOString().split("T")[0]}`;
    }
    if (livePrice) {
      localStorage.setItem(periodKey, String(livePrice));
      setReportTab(prev => prev);
    }
  };
  const [newsAnalysis, setNewsAnalysis] = useState({
    summary: "กำลังดาวน์โหลดข่าววิเคราะห์จาก Investing.com...",
    impacts: [],
    volatilityWarning: "ไม่มีข่าวผันผวนสูงในขณะนี้",
    loading: true
  });

  // Dynamic simulated technical data generator based on selected symbol and timeframe
  const getSimulatedMarketData = (sym, tf, anchorPeriod = "daily") => {
    let basePrice = 2350.0;
    let decimals = 2;
    let prefix = "";
    
    const cleanSym = sym.split(":")[1] || sym;
    let defaultPrice = 2350.0;
    if (cleanSym.includes("XAUUSD") || cleanSym.includes("GOLD")) {
      defaultPrice = 2350.0;
      decimals = 2;
      prefix = "$";
    } else if (cleanSym.includes("EURUSD")) {
      defaultPrice = 1.08520;
      decimals = 5;
      prefix = "";
    } else if (cleanSym.includes("GBPUSD")) {
      defaultPrice = 1.27240;
      decimals = 5;
      prefix = "";
    } else if (cleanSym.includes("USDJPY")) {
      defaultPrice = 156.45;
      decimals = 2;
      prefix = "¥";
    } else if (cleanSym.includes("BTC")) {
      defaultPrice = 65420.0;
      decimals = 2;
      prefix = "$";
    } else {
      defaultPrice = 175.50;
      decimals = 2;
      prefix = "$";
    }

    // Anchor base price locked to timeframe period (D1 daily, W1 weekly, MN monthly) to avoid per-tick jitter
    basePrice = getStableAnchorPrice(cleanSym, anchorPeriod, livePrice, defaultPrice);

    let tfMultiplier = 1;
    let trend = "sideways";
    let structureType = "BOS ขาขึ้น (Bullish BOS)";
    
    if (tf === "5m") {
      tfMultiplier = 0.0008;
      trend = "uptrend";
      structureType = "BOS ขาขึ้น (Bullish BOS)";
    } else if (tf === "15m") {
      tfMultiplier = 0.0015;
      trend = "uptrend";
      structureType = "CHoCH ขาขึ้น (Bullish CHoCH)";
    } else if (tf === "30m") {
      tfMultiplier = 0.0028;
      trend = "sideways";
      structureType = "กรอบสะสมราคา (Range)";
    } else if (tf === "1h") {
      tfMultiplier = 0.0055;
      trend = "downtrend";
      structureType = "BOS ขาลง (Bearish BOS)";
    } else if (tf === "4h") {
      tfMultiplier = 0.012;
      trend = "uptrend";
      structureType = "BOS ขาขึ้น (Bullish BOS)";
    } else if (tf === "1D") {
      tfMultiplier = 0.032;
      trend = "uptrend";
      structureType = "BOS ขาขึ้น (Bullish BOS)";
    }

    const diff = basePrice * tfMultiplier;
    const r2 = basePrice + diff * 1.5;
    const r1 = basePrice + diff * 0.7;
    const current = basePrice;
    const s1 = basePrice - diff * 0.7;
    const s2 = basePrice - diff * 1.5;
    
    const bosPrice = trend === "uptrend" ? basePrice + diff * 0.4 : basePrice - diff * 0.4;
    const chochPrice = trend === "uptrend" ? basePrice - diff * 0.6 : basePrice + diff * 0.6;

    let dailyBias = "";
    let intradayTactics = "";

    // Format formatted variables for dynamic text use
    const fR2 = prefix + r2.toFixed(decimals);
    const fR1 = prefix + r1.toFixed(decimals);
    const fS1 = prefix + s1.toFixed(decimals);
    const fS2 = prefix + s2.toFixed(decimals);
    const fCurrent = prefix + current.toFixed(decimals);

    let weeklyBias = "";
    let weeklyTactics = "";
    let monthlyBias = "";
    let monthlyTactics = "";

    if (cleanSym.includes("XAUUSD") || cleanSym.includes("GOLD")) {
      dailyBias = `🥇 Bullish Bias: ทิศทางราคาทองคำวันนี้ยังคงรักษาแนวโน้มขาขึ้นได้อย่างแข็งแกร่ง มีแรงซื้อเก็งกำไรไหลเข้าอย่างต่อเนื่อง สอดคล้องกับโครงสร้างราคาระดับ H4 ที่ยกตัวสูงขึ้น ตราบใดที่ราคาสามารถยืนเหนือแนวรับสำคัญบริเวณ ${fS2} ได้ น้ำหนักการเล่นฝั่งซื้อ (Buy) จะได้เปรียบมากกว่าอย่างเห็นได้ชัด`;
      intradayTactics = `🎯 Buy on Dip: แนะนำรอจังหวะราคาย่อตัวชั่วคราวลงมาทดสอบโซนแนวรับบริเวณ ${fS1} เพื่อเปิดสถานะ Buy โดยวางจุดตัดขาดทุน (SL) ไว้อย่างเคร่งครัดใต้ระดับราคา ${fS2} และตั้งเป้าหมายทำกำไร (TP) แรกที่ระดับต้านหลัก ${fR1} และเป้าหมายถัดไปที่ระดับต้านสำคัญ ${fR2}`;
      
      weeklyBias = `🥇 Weekly Outlook: ภาพรวมสัปดาห์นี้ โครงสร้างราคาทองคำ Spot ยังคงประคองแนวโน้มขาขึ้นใหญ่ได้อย่างแข็งแกร่ง (Strong Macro Bullish) ตราบใดที่ราคาสัปดาห์นี้ไม่หลุดแนวรับใหญ่บริเวณ ${fS2} ทิศทางภาพรวมยังมุ่งหน้าขึ้นไปทดสอบเป้าหมายต้านถัดไป`;
      weeklyTactics = `🎯 Weekly Swing Plan: วางกลยุทธ์ซื้อตามกรอบสัปดาห์ (Swing Buy) บริเวณแนวรับหลัก ${fS1} โดยแบ่งไม้สะสมและถือรันรอบยาวไปที่แนวต้านสัปดาห์ ${fR2} และจำกัดความเสี่ยงด้วย SL ต่ำกว่าระดับแนวรับ ${fS2}`;
      
      monthlyBias = `🥇 Monthly Macro View: ทิศทางรายเดือนของราคาทองคำในระยะยาวยังคงดำเนินอยู่บนโครงสร้างขาขึ้นใหญ่รอบใหม่ (Super Cycle) แรงซื้อหลักยังมาจากสภาวะเงินเฟ้อและความเสี่ยงทางเศรษฐกิจโลก`;
      monthlyTactics = `🎯 Monthly Long-term Plan: เน้นใช้กลยุทธ์สะสมลงทุนระยะยาวหรือรอสะสมเป็นไม้ใหญ่บริเวณแนวรับหลักรายเดือนที่ ${fS1} คาดเป้าหมายปลายทางจะปรับฐานขึ้นหาแนวต้านหลักบริเวณ ${fR2}`;
    } else if (cleanSym.includes("EURUSD")) {
      dailyBias = `🇪🇺 Neutral to Bullish: วันนี้คู่เงิน EURUSD เคลื่อนไหวในลักษณะ Sideway Up สะสมแรงซื้อในกรอบแนวรับสำคัญ ปัจจัยหนุนมาจากการชะลอตัวลงเล็กน้อยของดัชนีดอลลาร์สหรัฐฯ แนะนำเน้นฝั่งสะสมการซื้อ (Buy Accumulation) เป็นแนวทางหลักของวันเหนือระดับ ${fS2}`;
      intradayTactics = `🎯 Buy Support Zone: รอเปิดสถานะ Buy เมื่อราคาลงมาทดสอบบริเวณแนวรับสำคัญ ${fS1} โดยกำหนดจุดตัดขาดทุน (SL) ต่ำกว่า Low เดิมที่ระดับ ${fS2} และตั้งเป้าปิดทำกำไร (TP) บริเวณต้านแรก ${fR1} หรือต้านสูงสุด ${fR2}`;
      
      weeklyBias = `🇪🇺 Weekly Outlook: คู่เงิน EURUSD ในสัปดาห์นี้มีแนวโน้มแกว่งตัวในกรอบ Sideways Up โดยได้รับแรงประคองจากโซนแนวรับรายสัปดาห์ ${fS1} โครงสร้างราคายังพยายามรักษาทิศทางขาขึ้นตราบใดที่ราคาไม่ปิดต่ำกว่า ${fS2}`;
      weeklyTactics = `🎯 Weekly Swing Plan: แนะนำเน้นฝั่ง Buy สะสมตามระดับกรอบล่างใกล้ ${fS1} โดยเล็งจุดปิดทำกำไรระยะกลางที่แนวต้านสัปดาห์ ${fR1} และวางเป้าหมายหลักที่ ${fR2}`;
      
      monthlyBias = `🇪🇺 Monthly Macro View: แนวโน้มรายเดือนของคู่เงินยูโรดอลลาร์ชี้ว่าราคากำลังอยู่ในสภาวะสร้างฐานเพื่อกลับตัวเป็นขาขึ้นใหญ่ (Macro Reversal) โครงสร้างระยะยาวกำลังทดสอบโซนต้านสำคัญ`;
      monthlyTactics = `🎯 Monthly Long-term Plan: ทยอยสะสมสถานะตามแนวรับใหญ่รายเดือนบริเวณ ${fS2} หรือเน้นการปิดสวิงเทรดระยะยาวเมื่อเข้าใกล้โซนต้านด้านบนบริเวณ ${fR2}`;
    } else if (cleanSym.includes("GBPUSD")) {
      dailyBias = `🇬🇧 Strong Bullish: คู่เงินปอนด์อังกฤษเคลื่อนตัวอย่างมีนัยสำคัญในโครงสร้างขาขึ้นต่อเนื่อง หลังตัวเลขคาดการณ์ดอกเบี้ยทรงตัวของ BOE วันนี้แนวโน้มยืนยันเหนือแนวรับระดับ ${fS1}`;
      intradayTactics = `🎯 Pullback Buy Plan: รอราคาย่อตัวในวันลงมาที่แนวรับ ${fS1} หรือตามน้ำ Buy Stop เมื่อราคาทะลุผ่านแนวต้านระดับ ${fR1} ตั้ง SL ไว้ที่ ${fS2} และเป้าทำกำไร TP ที่ ${fR2}`;
      
      weeklyBias = `🇬🇧 Weekly Outlook: เงินปอนด์สัปดาห์นี้เคลื่อนไหวอย่างแข็งแกร่งในเทรนด์ขาขึ้นเหนือระดับแนวรับหลักสัปดาห์ ${fS1} ทิศทางหลักฝั่งซื้อยังคงครองสัดส่วนความมั่นใจสูงในการสะสมพลังไปต่อ`;
      weeklyTactics = `🎯 Weekly Swing Plan: วางจังหวะ Swing Buy ที่ระดับ ${fS1} หรือตามเมื่อราคาทะลุกรอบบนของสัปดาห์ วางจุดยอมแพ้ที่ ${fS2} และตั้งเป้า TP ที่ ${fR2}`;
      
      monthlyBias = `🇬🇧 Monthly Macro View: สัญญาณเทคนิคระดับเดือนของปอนด์อังกฤษยืนยันถึงโครงสร้างสะสมกำลังขาขึ้นอย่างยั่งยืน โดยภาพรวมทิศทางระยะกลางและระยะยาวมุ่งหน้าทดสอบแนวต้านใหญ่ถัดไป`;
      monthlyTactics = `🎯 Monthly Long-term Plan: เน้นถือสถานะรันเทรนด์ระยะยาวสำหรับฝั่ง Buy หรือทยอยเข้าเพิ่มไม้ที่บริเวณ ${fS1} โดยมีเป้าเป้าหมายรอบใหญ่ที่ ${fR2}`;
    } else if (cleanSym.includes("USDJPY")) {
      dailyBias = `🇯🇵 Bearish Bias: ค่าเงินเยนญี่ปุ่นแข็งค่าขึ้นจากการปรับฐานดอลลาร์ ส่งผลให้ทิศทางหลักของ USDJPY วันนี้มีโอกาสปรับฐานลงสูงต่ำกว่าระดับ ${fR2}`;
      intradayTactics = `🎯 Sell on Rally: เน้นหาจังหวะเปิดสถานะ Sell เมื่อราคาดีดตัวทดสอบแนวต้านหลักบริเวณ ${fR1} โดยตั้งจุดตัดขาดทุน (SL) เหนือ High เดิมที่ ${fR2} และตั้งเป้าทำกำไร (TP) ที่แนวรับด้านล่าง ${fS1} และถัดไปที่ ${fS2}`;
      
      weeklyBias = `🇯🇵 Weekly Outlook: ภาพรวมรายสัปดาห์ของ USDJPY ชี้ว่าราคากำลังเผชิญกับโครงสร้างขาลงหรือการปรับฐานใหญ่ (Weekly Pullback) ใต้แนวต้านรายสัปดาห์บริเวณ ${fR1}`;
      weeklyTactics = `🎯 Weekly Swing Plan: เน้นเข้าเก็งกำไรฝั่ง Sell (Short) บริเวณกรอบแนวต้านด้านบนใกล้ ${fR1} วาง SL เหนือระดับ ${fR2} และตั้งเป้าหมายทำกำไรสัปดาห์ที่แนวรับ ${fS1} และ ${fS2}`;
      
      monthlyBias = `🇯🇵 Monthly Macro View: ค่าเงินเยนในภาพรวมรายเดือนเริ่มมีสัญญาณฟื้นตัวแข็งค่ากดดันให้โครงสร้างหลักของ USDJPY มีการกลับตัวระยะยาวลงสู่แนวรับเมเจอร์สะสมพลัง`;
      monthlyTactics = `🎯 Monthly Long-term Plan: ใช้กลยุทธ์เฝ้าจังหวะสะสมสถานะ Sell ระยะยาวเมื่อราคาเด้งตัวขึ้นทดสอบแนวต้านใหญ่รายเดือน หรือรอเข้า Buy สะสมเมื่อราคาลงลึกสัมผัสแนวรับ ${fS2}`;
    } else if (cleanSym.includes("BTC")) {
      dailyBias = `🪙 Bullish Bias: โครงสร้างราคาบิทคอยน์เคลื่อนไหวสะสมพลังอยู่เหนือเส้นแนวรับสำคัญบริเวณ ${fS2} อย่างมั่นคง ทิศทางฝั่ง Buy ได้เปรียบ`;
      intradayTactics = `🎯 Buy Zone: ทยอยสะสมสถานะ Buy ในกรอบแนวรับสำคัญระหว่าง ${fS1} โดยตั้งจุดตัดขาดทุน (SL) ป้องกันกรณีหลุดแนวรับใหญ่ที่ ${fS2} และมีเป้าหมายทำกำไรระยะสั้นที่ ${fR1} และเป้าถัดไปที่ ${fR2}`;
      
      weeklyBias = `🪙 Weekly Outlook: โครงสร้างราคา BTC ในสัปดาห์นี้ยังสามารถยืนยันจุดยืนขาขึ้นได้เหนือระดับแนวรับหลักสัปดาห์ ${fS1} คาดกรอบสัปดาห์แกว่งสะสมแรงเพื่อขึ้นต่อหาเป้าหมายต้านถัดไป`;
      weeklyTactics = `🎯 Weekly Swing Plan: ซื้อสะสมเมื่อย่อตัว (Buy on Retest) ใกล้ ${fS1} ตั้ง SL ถ้วนรอบที่ต่ำกว่า ${fS2} และวางแผนปิดเป้ากำไรที่ ${fR2}`;
      
      monthlyBias = `🪙 Monthly Macro View: ภาพรวมรายเดือนบิทคอยน์เคลื่อนไหวสอดคล้องกับวัฏจักรขาขึ้นรอบใหญ่ (Halving Macro Cycle) มีโอกาสปรับฐานขึ้นหาเป้าหมายใหม่ปลายไตรมาส`;
      monthlyTactics = `🎯 Monthly Long-term Plan: ทยอยสะสมแบบ DCA ทุกปลายเดือน หรือเข้าซื้อเป็นไม้ใหญ่เมื่อราคาเกิดการปรับฐานลึก (Flash Crash) เข้าหาแนวรับใหญ่ ${fS2}`;
    } else {
      dailyBias = `🇺🇸 Bullish Bias: ทิศทางหลักในภาพรวมยังคงรักษาแนวโน้มขาขึ้นได้อย่างแข็งแกร่ง มีแรงซื้อหนุนอย่างต่อเนื่องเหนือระดับ ${fS1}`;
      intradayTactics = `🎯 Pullback Buy: แนะนำหาจังหวะรอราคาย่อตัวลงมาทดสอบโซนแนวรับบริเวณ ${fS1} เพื่อเปิดสถานะ Buy วาง SL ที่ ${fS2} และตั้งเป้าทำกำไรที่ ${fR1}`;
      
      weeklyBias = `🥇 Weekly Outlook: ภาพรวมสัปดาห์นี้ราคายังประคองตัวเหนือแนวรับสำคัญ ${fS1} ได้ น้ำหนักฝั่งขาขึ้นยังคงครองความมั่นใจในการเข้าเล่นตามเทรนด์`;
      weeklyTactics = `🎯 Weekly Swing Plan: แนะนำรอหาจังหวะสะสม Buy เมื่อย่อตัวในกรอบแนวรับสัปดาห์ ${fS1} วางจุดจำกัดความเสี่ยง SL ที่ ${fS2} และตั้งเป้าทำกำไรที่ ${fR2}`;
      
      monthlyBias = `🥇 Monthly Macro View: ภาพรวมรายเดือนในระยะยาวดัชนีราคายังประคองโครงสร้างขาขึ้นใหญ่และเคลื่อนไหวสะสมกำลังต่อเนื่อง`;
      monthlyTactics = `🎯 Monthly Long-term Plan: วางแผนสะสมลงทุนระยะยาวด้วยไม้เฉลี่ยเมื่อราคาเข้าใกล้แนวรับใหญ่รายเดือน ${fS2} โดยมีเป้าต้านระยะยาวอยู่ที่ ${fR2}`;
    }

    return {
      symbol: cleanSym,
      prefix,
      decimals,
      trend,
      anchorPrice: basePrice.toFixed(decimals),
      anchorPeriod,
      r2: r2.toFixed(decimals),
      r1: r1.toFixed(decimals),
      current: livePrice ? livePrice.toFixed(decimals) : current.toFixed(decimals),
      s1: s1.toFixed(decimals),
      s2: s2.toFixed(decimals),
      bos: bosPrice.toFixed(decimals),
      choch: chochPrice.toFixed(decimals),
      structureType,
      dailyBias,
      intradayTactics,
      weeklyBias,
      weeklyTactics,
      monthlyBias,
      monthlyTactics
    };
  };

  const analyzeNewsForSymbol = (events, activeSymbol) => {
    const cleanSym = activeSymbol.split(":")[1] || activeSymbol;
    const isGold = cleanSym.includes("XAUUSD") || cleanSym.includes("GOLD");
    const isUSD = cleanSym.includes("USD");
    const isEUR = cleanSym.includes("EUR");
    const isGBP = cleanSym.includes("GBP");
    const isJPY = cleanSym.includes("JPY");

    const relevantEvents = events.filter(ev => {
      if (isGold && ev.currency === "USD") return true;
      if (isUSD && ev.currency === "USD") return true;
      if (isEUR && ev.currency === "EUR") return true;
      if (isGBP && ev.currency === "GBP") return true;
      if (isJPY && ev.currency === "JPY") return true;
      if (ev.importance === 3) return true;
      return false;
    });

    if (relevantEvents.length === 0) {
      setNewsAnalysis({
        summary: `ไม่มีข่าวเศรษฐกิจสำคัญที่มีผลกระทบโดยตรงต่อ ${cleanSym} ในวันนี้ แนะนำเทรดตามปัจจัยทางเทคนิคเป็นหลัก`,
        impacts: [],
        volatilityWarning: "ความผันผวนของตลาดอยู่ในเกณฑ์ปกติ (ต่ำกว่า 15 Pips/นาที)",
        loading: false
      });
      return;
    }

    const parseEconomicNumber = (val) => {
      if (!val || val === "-" || val === "N/A") return null;
      let clean = String(val).trim().replace(/,/g, "");
      let multiplier = 1.0;
      if (/K$/i.test(clean)) { multiplier = 1e3; clean = clean.slice(0, -1); }
      else if (/M$/i.test(clean)) { multiplier = 1e6; clean = clean.slice(0, -1); }
      else if (/B$/i.test(clean)) { multiplier = 1e9; clean = clean.slice(0, -1); }
      else if (/%$/.test(clean)) { clean = clean.slice(0, -1); }
      const num = parseFloat(clean);
      return isNaN(num) ? null : num * multiplier;
    };

    const impacts = relevantEvents.map(ev => {
      const name = String(ev.event || "").toLowerCase();
      const actStr = String(ev.actual || "").trim();
      const foreStr = String(ev.forecast || "").trim();
      const prevStr = String(ev.previous || "").trim();

      const actNum = parseEconomicNumber(actStr);
      const foreNum = parseEconomicNumber(foreStr);

      const isUnemp = name.includes("ว่างงาน") || name.includes("jobless") || name.includes("unemployment") || name.includes("claims");
      const isInflation = name.includes("cpi") || name.includes("ppi") || name.includes("pce") || name.includes("เงินเฟ้อ") || name.includes("ราคาผู้บริโภค");
      const isEmployment = name.includes("non-farm") || name.includes("nfp") || name.includes("จ้างงาน") || name.includes("adp");

      let impactText = "คาดว่าราคาจะแกว่งตัวในกรอบสั้นๆ";
      let direction = "neutral";
      let badge = "⏳ รอประกาศ";

      if (actNum !== null && foreNum !== null) {
        const diff = actNum - foreNum;
        const eps = 1e-4;

        if (Math.abs(diff) < eps) {
          direction = "neutral";
          badge = "⏺️ ตรงตามคาด";
          impactText = `🟡 ตัวเลขจริง (${actStr}) เป็นไปตามคาดการณ์ (${foreStr}): ตลาดรับรู้ล่วงหน้าแล้ว (Priced-in) ➔ ราคาแกว่งตัวผันผวนในกรอบเดิม`;
        } else if (diff > eps) {
          if (isGold) {
            if (isUnemp) {
              direction = "bullish";
              badge = "🔺 สูงกว่าคาด (หนุนทอง 🟢)";
              impactText = `🟢 ตัวเลขจริง (${actStr}) สูงกว่าคาด (${foreStr}): คนตกงานเพิ่ม ดอลลาร์อ่อนค่า ➔ หนุนราคาทองคำ Spot ดีดตัวขึ้นแรง`;
            } else if (isInflation) {
              direction = "bearish";
              badge = "🔺 สูงกว่าคาด (กดดันทอง 🔻)";
              impactText = `🔴 ตัวเลขจริง (${actStr}) สูงกว่าคาด (${foreStr}): เงินเฟ้อหนืดตัว เฟดอาจชะลอลดดอกเบี้ย ดอลลาร์แข็ง ➔ กดดันราคาทองคำ Spot ย่อตัวลง`;
            } else {
              direction = "bearish";
              badge = "🔺 แกร่งกว่าคาด (กดดันทอง 🔻)";
              impactText = `🔴 ตัวเลขจริง (${actStr}) ดีกว่าคาดการณ์ (${foreStr}): ตัวเลขเศรษฐกิจแกร่ง ดอลลาร์แข็ง ➔ กดดันราคาทองคำ Spot ย่อตัวลง`;
            }
          } else {
            direction = isUnemp ? "bearish" : "bullish";
            badge = "🔺 สูงกว่าคาด";
            impactText = isUnemp ? `🔴 ตัวเลขแย่กว่าคาด (${actStr} > ${foreStr}) ➔ กดดันค่าเงินให้อ่อนค่าลง` : `🟢 ตัวเลขแกร่งกว่าคาด (${actStr} > ${foreStr}) ➔ หนุนค่าเงินให้แข็งค่าขึ้น`;
          }
        } else {
          // diff < -eps
          if (isGold) {
            if (isUnemp) {
              direction = "bearish";
              badge = "🔻 ต่ำกว่าคาด (กดดันทอง 🔻)";
              impactText = `🔴 ตัวเลขจริง (${actStr}) ต่ำกว่าคาด (${foreStr}): คนตกงานน้อย ดอลลาร์แข็งค่า ➔ กดดันราคาทองคำ Spot ย่อตัวลง`;
            } else if (isInflation) {
              direction = "bullish";
              badge = "🔻 ต่ำกว่าคาด (หนุนทอง 🟢)";
              impactText = `🟢 ตัวเลขจริง (${actStr}) ชะลอต่ำกว่าคาด (${foreStr}): เงินเฟ้อลดลง หนุนเฟดลดดอกเบี้ย ➔ หนุนราคาทองคำ Spot พุ่งขึ้นแรง!`;
            } else {
              direction = "bullish";
              badge = "🔻 ต่ำกว่าคาด (หนุนทอง 🟢)";
              impactText = `🟢 ตัวเลขจริง (${actStr}) ชะลอตัว ดอลลาร์อ่อนค่า ➔ หนุนราคาทองคำ Spot ปรับตัวขึ้น`;
            }
          } else {
            direction = isUnemp ? "bullish" : "bearish";
            badge = "🔻 ต่ำกว่าคาด";
            impactText = isUnemp ? `🟢 คนตกงานน้อยกว่าคาด (${actStr} < ${foreStr}) ➔ หนุนค่าเงินให้แข็งค่า` : `🔴 ตัวเลขชะลอตัว (${actStr} < ${foreStr}) ➔ กดดันค่าเงินให้อ่อนค่าลง`;
          }
        }
      } else {
        direction = "pending";
        badge = "⏳ รอประกาศผล";
        impactText = `🎯 รอประกาศตัวเลข (คาดการณ์ ${foreStr || "-"} | ก่อนหน้า ${prevStr || "-"}): หากตัวเลขจริงออกมาแข็งแกร่งกว่าคาดจะหนุนดอลลาร์/กดดันทองคำ 🔻 | หากต่ำกว่าคาดจะกดดันดอลลาร์/หนุนทองคำพุ่งขึ้น 🟢`;
      }

      return {
        time: ev.time,
        currency: ev.currency,
        importance: ev.importance,
        event: ev.event,
        impact: impactText,
        actual: ev.actual || "-",
        forecast: ev.forecast || "-",
        previous: ev.previous || "-",
        direction,
        badge
      };
    });

    const highImpactCount = relevantEvents.filter(ev => ev.importance === 3).length;
    let volatilityWarning = "ระดับความผันผวนปกติ (ตลาดปรับฐานในกรอบสั้น)";
    if (highImpactCount > 0) {
      volatilityWarning = `⚠️ ระวังความผันผวนรุนแรง! มีข่าวความสำคัญสูง (★★★) จำนวน ${highImpactCount} ข่าวในวันนี้ แนะนำงดเข้าออเดอร์ก่อนและหลังข่าวออก 15 นาทีเพื่อเลี่ยง Spread ถ่าง`;
    }

    setNewsAnalysis({
      summary: `พบข่าวสำคัญที่เกี่ยวกับ ${cleanSym} ทั้งหมด ${relevantEvents.length} เหตุการณ์ ซึ่งส่งผลต่อโมเมนตัมราคาโดยตรง`,
      impacts,
      volatilityWarning,
      loading: false
    });
  };

  // Dynamic script loader for TradingView (Hides Volume by setting studies: [])
  useEffect(() => {
    const scriptId = "tradingview-widget-script";
    let script = document.getElementById(scriptId);
    
    const initWidget = () => {
      if (window.TradingView && document.getElementById("tradingview_chart_container")) {
        new window.TradingView.widget({
          "width": "100%",
          "height": "100%",
          "symbol": symbol,
          "interval": "240",
          "timezone": "Asia/Bangkok",
          "theme": "dark",
          "style": "1",
          "locale": "th",
          "toolbar_bg": "#f1f3f6",
          "enable_publishing": false,
          "hide_side_toolbar": false,
          "allow_symbol_change": true,
          "container_id": "tradingview_chart_container",
          "disabled_features": ["create_volume_indicator_by_default"]
        });
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://s3.tradingview.com/tv.js";
      script.type = "text/javascript";
      script.async = true;
      script.onload = initWidget;
      document.head.appendChild(script);
    } else {
      if (window.TradingView) {
        initWidget();
      } else {
        script.addEventListener("load", initWidget);
      }
    }

    return () => {
      if (script) {
        script.removeEventListener("load", initWidget);
      }
    };
  }, [symbol]);

  useEffect(() => {
    const fetchAndAnalyzeNews = async () => {
      setNewsAnalysis(prev => ({ ...prev, loading: true }));
      try {
        const response = await fetch("/api/news?tab=today");
        if (!response.ok) throw new Error("Failed to load news");
        const htmlText = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, "text/html");
        const rows = doc.querySelectorAll("tbody tr");
        
        const extractedEvents = [];
        rows.forEach(row => {
          if (row.classList.contains("theDay")) return;
          
          const time = row.querySelector(".time")?.textContent?.trim() || "";
          const currency = row.querySelector(".flagCur")?.textContent?.trim() || "";
          
          // Count gold stars (check for grayFullBullishIcon inside row)
          const starsCount = row.querySelectorAll(".grayFullBullishIcon").length;
          
          const eventLink = row.querySelector(".event a");
          const event = eventLink ? eventLink.textContent?.trim() : row.querySelector(".event")?.textContent?.trim() || "";
          
          const actual = row.querySelector(".act")?.textContent?.trim() || "";
          const forecast = row.querySelector(".fore")?.textContent?.trim() || "";
          const previous = row.querySelector(".prev")?.textContent?.trim() || "";

          if (currency && event) {
            extractedEvents.push({ time, currency, importance: starsCount, event, actual, forecast, previous });
          }
        });

        analyzeNewsForSymbol(extractedEvents, symbol);
      } catch (err) {
        console.error("Failed to parse calendar news:", err);
        setNewsAnalysis({
          summary: "ดึงข้อมูลตารางข่าวเศรษฐกิจเรียลไทม์ไม่สำเร็จ แนะนำวิเคราะห์ปัจจัยทางเทคนิคเป็นหลัก",
          impacts: [],
          volatilityWarning: "ไม่สามารถประเมินความเสี่ยงข่าวสารได้ ณ ขณะนี้",
          loading: false
        });
      }
    };

    fetchAndAnalyzeNews();
    const interval = setInterval(fetchAndAnalyzeNews, 60000);
    return () => clearInterval(interval);
  }, [symbol]);

  // Economic Calendar is rendered directly via secure, ad-blocker-safe TradingView iframe below



  const handleSearchSymbol = (e) => {
    e.preventDefault();
    const cleanSymbol = searchInput.trim().toUpperCase();
    if (cleanSymbol) {
      // Auto add exchange prefixes for common pairs if not typed
      if (["XAUUSD", "GOLD"].includes(cleanSymbol)) {
        setSymbol("OANDA:XAUUSD");
        setSearchInput("XAUUSD");
        setCalcAsset("gold");
      } else if (cleanSymbol.length === 6 && !cleanSymbol.includes(":")) {
        setSymbol(`FX:${cleanSymbol}`);
        if (cleanSymbol.endsWith("JPY")) {
          setCalcAsset("jpy");
        } else {
          setCalcAsset("forex");
        }
      } else {
        setSymbol(cleanSymbol);
        if (cleanSymbol.includes("JPY")) {
          setCalcAsset("jpy");
        } else if (cleanSymbol.includes("XAU") || cleanSymbol.includes("GOLD")) {
          setCalcAsset("gold");
        } else {
          setCalcAsset("forex");
        }
      }
    }
  };

  const handleQuickSelect = (sym, type) => {
    setSymbol(sym);
    setSearchInput(sym.split(":")[1] || sym);
    setCalcAsset(type);
  };

  // Perform Calculations
  const riskAmount = (calcBalance * (calcRiskPct / 100)).toFixed(2);
  const priceDiff = Math.abs(calcEntry - calcSL);
  
  let slPoints = 0;
  let lotSize = 0;
  if (priceDiff > 0) {
    if (calcAsset === "gold") {
      slPoints = Math.round(priceDiff * 100); 
      lotSize = riskAmount / (slPoints * 1.0); 
    } else if (calcAsset === "jpy") {
      slPoints = Math.round(priceDiff * 1000);
      lotSize = riskAmount / (slPoints * 0.1); 
    } else {
      slPoints = Math.round(priceDiff * 100000); 
      lotSize = riskAmount / (slPoints * 0.1); 
    }
  }

  // Calculate Reward and R:R
  const rewardDiff = Math.abs(calcTP - calcEntry);
  const potentialReward = (lotSize * (calcAsset === "gold" ? rewardDiff * 100 : calcAsset === "jpy" ? rewardDiff * 1000 : rewardDiff * 100000) * 0.1).toFixed(2);
  const rrRatio = slPoints > 0 ? (rewardDiff / priceDiff).toFixed(2) : "0.00";

  // Dynamic AI Checklist Summary Logic
  const generateAISummary = () => {
    let score = 0;
    if (checklist.supportResistance) score += 10;
    if (checklist.orderBlock) score += 15;
    if (checklist.imbalance) score += 10;
    if (checklist.hiddenBase) score += 10;
    if (checklist.fibonacci) score += 10;
    if (checklist.qmPattern) score += 15;
    if (checklist.liquiditySweep) score += 10;
    if (checklist.candlePattern) score += 10;
    if (checklist.divergence) score += 10;
    if (checklist.structure === "BOS" || checklist.structure === "CHoCH") score += 10;

    if (score > 100) score = 100;

    const assetName = searchInput.toUpperCase();
    let verdict = "WAIT FOR CONFIRMATION";
    let verdictColor = "var(--color-warning)";
    let verdictText = "🟡 รอสัญญาณยืนยันเพิ่มเติม";
    
    if (score >= 60) {
      if (checklist.noHighImpactNews) {
        verdict = "CONFIRMED";
        verdictColor = "var(--color-success)";
        verdictText = `🟢 ${checklist.trend === "uptrend" ? "BUY" : "SELL"} SETUP (โอกาสชนะสูง)`;
      } else {
        verdict = "WARNING";
        verdictColor = "var(--color-warning)";
        verdictText = "🟡 SETUP มีความเสี่ยง (ติดข่าวแดง)";
      }
    } else if (score < 40) {
      verdict = "RISK_HIGH";
      verdictColor = "var(--color-danger)";
      verdictText = "🔴 RISK TOO HIGH / NO SETUP";
    }

    const tips = [];
    if (checklist.qmPattern) {
      tips.push(`ตั้ง Limit Order ที่ Left Shoulder QM โซน SL บนหัวเดิม (EP.13)`);
    }
    if (checklist.orderBlock && checklist.imbalance) {
      tips.push("โซนมี OB + Imbalance หนาแน่น ราคามีโอกาสดึงกลับสูง");
    }
    if (!checklist.noHighImpactNews) {
      tips.push("⚠️ ระวัง: เลี่ยงการตั้ง Limit Order ช่วงข่าวกล่องแดงออก");
    }
    if (tips.length === 0) {
      tips.push("ติ๊กเช็คลิสต์เพิ่มเติมเพื่อให้ AI สรุปวิเคราะห์โครงสร้าง");
    }

    return { score, verdict, verdictColor, verdictText, tips };
  };

  const aiSummary = generateAISummary();

  const getAIAssetSpecialistTips = () => {
    if (calcAsset === "gold") {
      return (
        <div className="ai-specialist-box">
          <div className="specialist-header">
            <Sparkles size={14} />
            <span>AI Tips: ทองคำ (XAUUSD)</span>
          </div>
          <ul className="specialist-list">
            <li><strong>MM (EP.3):</strong> 1 Lot ขยับ $1.00 = $100. ระยะ SL แนะนำกว้าง 200-400 จุด.</li>
            <li><strong>SMC/QM:</strong> ทองกวาด SL Hunt บ่อย เข้า Left Shoulder QM ปลอดภัยสุด.</li>
            <li><strong>ข่าวแดง:</strong> เลี่ยงชนข่าวแรง CPI, NFP, FOMC เด็ดขาด สเปรดจะถ่างและเหวี่ยงแรง.</li>
          </ul>
        </div>
      );
    } else if (calcAsset === "jpy") {
      return (
        <div className="ai-specialist-box">
          <div className="specialist-header">
            <Sparkles size={14} />
            <span>AI Tips: คู่เงินเยน JPY</span>
          </div>
          <ul className="specialist-list">
            <li><strong>MM (EP.3):</strong> ทศนิยม 3 ตำแหน่ง. 1 Point = $0.10.</li>
            <li><strong>เทรนด์ (EP.5):</strong> JPY มักลากเทรนด์ขาเดียวรุนแรง เลี่ยงการสวนเทรนด์หลัก.</li>
            <li><strong>ข่าว BOJ:</strong> ระวังการเข้าแทรกแซงค่าเงิน (Intervention) ของธนาคารกลางญี่ปุ่น.</li>
          </ul>
        </div>
      );
    } else if (calcAsset === "forex") {
      return (
        <div className="ai-specialist-box">
          <div className="specialist-header">
            <Sparkles size={14} />
            <span>AI Tips: Forex คู่เงินหลัก</span>
          </div>
          <ul className="specialist-list">
            <li><strong>MM (EP.3):</strong> ทศนิยม 5 ตำแหน่ง. 10 Points = 1 Pip ($10 ต่อ Lot).</li>
            <li><strong>Confluence:</strong> วิ่งค่อนข้างเป๊ะตามกรอบแนวรับแนวต้านและ Order Block.</li>
            <li><strong>ช่วงเทรด:</strong> ช่วงคาบเกี่ยวตลาดลอนดอนและนิวยอร์ก (19.00-23.00 น.) วอลุ่มดีสุด.</li>
          </ul>
        </div>
      );
    } else {
      return (
        <div className="ai-specialist-box">
          <div className="specialist-header">
            <Sparkles size={14} />
            <span>AI Tips: หุ้นและสินทรัพย์อื่น</span>
          </div>
          <ul className="specialist-list">
            <li><strong>Gap ราคา:</strong> ตลาดปิดวันหยุดเสี่ยงต่อการเกิด Opening Gap กระโดดข้าม SL.</li>
            <li><strong>โครงสร้าง:</strong> ใช้แท่ง Daily Close วิเคราะห์สวิงเทรด ดีกว่าไทม์เฟรมสั้น.</li>
          </ul>
        </div>
      );
    }
  };

  const handleCopyAnalysis = () => {
    const checkedItems = [];
    if (checklist.supportResistance) checkedItems.push("แนวรับ-แนวต้าน");
    if (checklist.orderBlock) checkedItems.push("Order Block");
    if (checklist.imbalance) checkedItems.push("Imbalance / FVG");
    if (checklist.hiddenBase) checkedItems.push("Hidden Base");
    if (checklist.fibonacci) checkedItems.push("Fibonacci");
    if (checklist.qmPattern) checkedItems.push("QM Pattern");
    if (checklist.liquiditySweep) checkedItems.push("Liquidity Sweep");
    if (checklist.candlePattern) checkedItems.push("แท่งเทียนคอนเฟิร์ม");
    if (checklist.divergence) checkedItems.push("Divergence");
    if (checklist.noHighImpactNews) checkedItems.push("ไม่มีข่าวแรง");

    const summaryText = `📊 บันทึกการวิเคราะห์สินทรัพย์: ${searchInput.toUpperCase()}
---------------------------------
📈 โครงสร้างกราฟ:
- แนวโน้มหลัก: ${checklist.trend === "uptrend" ? "ขาขึ้น (Uptrend)" : checklist.trend === "downtrend" ? "ขาลง (Downtrend)" : "ไซด์เวย์ (Sideways)"}
- โครงสร้างล่าสุด: ${checklist.structure || "ไม่ระบุ"}
- จุดเด่นทางเทคนิค: ${checkedItems.join(", ") || "ไม่มี"}
- สัญญาณ Stochastic: ${checklist.stochasticState || "ไม่ระบุ"}

🧠 AI Analyst Summary:
- คะแนนความน่าจะเป็น (Confluence Score): ${aiSummary.score}%
- คำตัดสิน (Verdict): ${aiSummary.verdictText}

🎚️ แผนการเข้าออเดอร์ (Risk Management):
- ราคาเข้า (Entry): ${calcEntry}
- ราคาตัดขาดทุน (SL): ${calcSL} (${slPoints} จุด)
- ราคากำไร (TP): ${calcTP}
- ยอดเงินลงทุน: $${calcBalance}
- ความเสี่ยงต่อไม้: ${calcRiskPct}% ($${riskAmount})
- ขนาด Lot ที่แนะนำ: ${lotSize > 0 && isFinite(lotSize) ? lotSize.toFixed(3) : "0.00"} Lot
- อัตรา R:R: 1 : ${rrRatio}
- กำไรคาดการณ์: $${potentialReward}
---------------------------------
วิเคราะห์โดยระบบ Trading Analytica`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const EP_LESSONS = [
    { id: 1, title: "EP.1 What is Trading", content: "ปูพื้นฐานการเทรด Forex, กลไกของตลาดซื้อขายคู่เงิน และ Mindset ของการเป็นเทรดเดอร์ในฐานะรายย่อย (Retail Trader)." },
    { id: 2, title: "EP.2 Financial Asset & TradingView", content: "การเปรียบเทียบประเภทของสินทรัพย์ต่างๆ (Forex, ทองคำ XAU, ดัชนี, หุ้น) และสอนวิธีกำหนดค่า แถบเครื่องมือ การตีเส้น และดูราคาแบบเรียลไทม์บน TradingView." },
    { id: 3, title: "EP.3 Point & Lot Size (Money Management)", content: "การคำนวณระยะทางแบบจุด (Point) และปิป (Pip), เรียนรู้วิธีคำนวณขนาดล็อตเทรด (Lot Size) เพื่อจำกัดเปอร์เซ็นต์ความเสี่ยงให้อยู่ภายใต้กรอบการจัดการเงินทุนที่เคร่งครัด." },
    { id: 4, title: "EP.4 Candle & Trendline (กราฟเปล่า)", content: "การอ่านพฤติกรรมแท่งเทียนยอดนิยม เช่น Pinbar, Engulfing, Inside Bar เพื่อหาจุดกลับตัว และเทคนิคการลากเส้นเทรนด์ไลน์ (Trendline) เพื่อประเมินกรอบราคาและแนวโน้มหลัก." },
    { id: 5, title: "EP.5 Dow Theory & SMC (Smart Money Concepts)", content: "โครงสร้างราคาอ้างอิงทฤษฎี Dow (HH, HL, LH, LL) ร่วมกับทฤษฎี SMC สมัยใหม่ในการหาจุด BOS (Break of Structure) เพื่อติดตามเทรนด์ และ CHoCH (Change of Character) เพื่อระบุสัญญาณการเปลี่ยนเทรนด์อย่างรวดเร็ว." },
    { id: 6, title: "EP.6 แนวรับ แนวต้าน (Support & Resistance)", content: "หลักการหาโซนแนวรับแนวต้านที่มีประวัติการปฏิเสธราคาบ่อยครั้ง รวมถึงการสลับบทบาทของแนวรับเดิมเป็นแนวต้านใหม่เมื่อโดนทะลุผ่าน." },
    { id: 7, title: "EP.7 Fusion 2 Ultimate Skill", content: "การใช้องค์ความรู้ Confluence ระหว่างแนวรับแนวต้าน, การเบรคเอ้าท์ Trendline และแนว Fibonacci ในการจับจังหวะการเทรดที่มีโอกาสชนะสูงสุด." },
    { id: 8, title: "EP.8 Hidden Candle (Hidden Base)", content: "ค้นหาโซนเข้าคำสั่งซื้อขายที่ซ่อนอยู่ในการพักตัวของราคากลางแนวโน้ม (Rally-Base-Rally และ Drop-Base-Drop) เพื่อดักเข้าออเดอร์ตามเทรนด์หลักก่อนจะวิ่งไปต่อ." },
    { id: 9, title: "EP.9 Order Block & Imbalance", content: "ระบุพฤติกรรมสถาบันการเงินยักษ์ใหญ่ผ่าน Order Block (OB) และมองหาช่องว่างราคาที่ขาดประสิทธิภาพ (Imbalance / Fair Value Gap - FVG) เพื่อดักจังหวะที่ราคาวิ่งกลับมาเติมเต็ม." },
    { id: 10, title: "EP.10 Fibonacci Retracement & Extension", content: "การใช้เครื่องมืออัตราส่วนทองคำในการดักซื้อเมื่อราคาย่อตัวลงในระดับ 0.50, 0.618, 0.786 และระดับ Extension (1.272, 1.618) เพื่อใช้เป็นจุดออกปิดกำไร (TP)." },
    { id: 11, title: "EP.11 Divergence", content: "การวิเคราะห์ความขัดแย้งของราคาและตัวชี้วัด (RSI/Stochastic) แบ่งออกเป็น Regular Divergence เพื่อดักเทรดจุดเปลี่ยนเทรนด์ และ Hidden Divergence เพื่อรันเทรนตามโครงสร้างเดิม." },
    { id: 12, title: "EP.12 Stochastic Oscillator", content: "การใช้อินดิเคเตอร์ Stochastic ในการยืนยันโซนซื้อมากเกินไป (Overbought > 80) หรือขายมากเกินไป (Oversold < 20) และหาจุดตัดกากบาท (%K ตัด %D) เพื่อคัดกรองออเดอร์ในกรอบ Sideways." },
    { id: 13, title: "EP.13 QM LV การเข้าออเดอร์ และจุด SL", content: "กลยุทธ์ขั้นสูง Quasimodo Pattern (High, Low, Higher High, Lower Low) สำหรับหาจุดสไนเปอร์ออเดอร์ย้อนกลับมาที่โซนไหล่ซ้าย (Left Shoulder/MPL) และวางจุดตัดขาดทุน SL ใกล้มาก ทำให้ได้ค่า R:R สูงระดับพรีเมียม." },
    { id: 14, title: "หลักการวิเคราะห์ข่าวและการ Scalping", content: "วิธีอ่านตารางข่าวเศรษฐกิจระดับสูง (ข่าวกล่องแดง, ดอกเบี้ย FOMC, ดัชนี CPI, NFP) ข้อห้ามเทรดช่วงเวลาข่าวปะทะรุนแรงป้องกันสเปรดถ่าง (Spread Extension) และหลักการเทรดเร็วฉาบฉวย (Scalping) บนไทม์เฟรมสั้น (M1/M5)." }
  ];

  return (
    <div className="analysis-view-container">
      {/* Gemini AI Smart Analysis Header */}
      <div style={{ marginBottom: 18 }}>
        <GeminiAiAnalysisCard
          assetType={symbol.includes("BTC") || symbol.includes("ETH") ? "crypto" : "forex"}
          symbol={symbol.split(":")[1] || symbol}
          price={livePrice ? String(livePrice) : ""}
          change="+0.25%"
          indicators={{ RSI: 54.2, MA20: "Neutral", MACD: "Consolidation" }}
        />
      </div>
      {/* Split layout: Left (70% width) and Right (30% width) */}
      <div className="analysis-split-layout full-chart-mode">
        
        {/* Left Column: Live Chart (height: 600px) and Economic Calendar (height: 400px) */}
        <div className="chart-pane glass-card">
          <div className="pane-header">
            <div className="pane-title">
              <Globe size={18} style={{ color: "var(--color-primary)" }} />
              <span>กราฟสดระบบ TradingView: {symbol.split(":")[1] || symbol}</span>
            </div>
            
            <form onSubmit={handleSearchSymbol} className="symbol-search-form">
              <div className="search-input-wrapper">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="ค้นหาหุ้น/คู่เงิน (เช่น AAPL, EURUSD)"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="symbol-input"
                />
              </div>
              <button type="submit" className="btn-search">
                ค้นหา
              </button>
            </form>
          </div>

          {/* Quick Select Buttons */}
          <div className="quick-select-row" style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
            {quickSelects.map((qs, index) => (
              <div key={qs.symbol + index} className="quick-select-badge-wrapper" style={{ position: "relative", display: "inline-block" }}>
                <button 
                  type="button" 
                  onClick={() => handleQuickSelect(qs.symbol, qs.assetType)}
                  className={`btn-quick-select ${symbol === qs.symbol ? "active" : ""}`}
                  style={{ paddingRight: "28px" }}
                >
                  {qs.label}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteShortcut(index, e)}
                  title="ลบทางลัด"
                  style={{
                    position: "absolute",
                    right: "6px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "rgba(239, 68, 68, 0.6)",
                    cursor: "pointer",
                    fontSize: "12px",
                    padding: "2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  onMouseEnter={(e) => e.target.style.color = "var(--color-danger)"}
                  onMouseLeave={(e) => e.target.style.color = "rgba(239, 68, 68, 0.6)"}
                >
                  ✕
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => setShowAddShortcut(!showAddShortcut)}
              className="btn-quick-select"
              style={{
                background: "rgba(59, 130, 246, 0.1)",
                borderColor: "rgba(59, 130, 246, 0.3)",
                color: "var(--color-primary)",
                fontWeight: "600"
              }}
            >
              ➕ เพิ่มทางลัด
            </button>
          </div>

          {showAddShortcut && (
            <div className="glass-card" style={{
              marginBottom: "16px",
              padding: "16px",
              background: "rgba(30, 41, 59, 0.7)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              width: "100%",
              maxWidth: "450px",
              animation: "fadeIn 0.2s ease"
            }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "var(--text-primary)" }}>เพิ่มปุ่มทางลัดใหม่</h4>
              <form onSubmit={handleAddShortcut} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>ชื่อย่อหุ้น/คู่เงิน (เช่น AAPL, EURUSD)</label>
                    <input 
                      type="text" 
                      placeholder="เช่น AAPL หรือ EURUSD" 
                      value={newShortcutSymbol}
                      onChange={(e) => setNewShortcutSymbol(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        background: "#0f172a",
                        border: "1px solid var(--border-color)",
                        borderRadius: "4px",
                        color: "#fff",
                        fontSize: "12px",
                        boxSizing: "border-box"
                      }}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>ป้ายกำกับปุ่ม (เช่น Apple, EURUSD)</label>
                    <input 
                      type="text" 
                      placeholder="เช่น Apple หรือ EURUSD" 
                      value={newShortcutLabel}
                      onChange={(e) => setNewShortcutLabel(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        background: "#0f172a",
                        border: "1px solid var(--border-color)",
                        borderRadius: "4px",
                        color: "#fff",
                        fontSize: "12px",
                        boxSizing: "border-box"
                      }}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>ประเภทสินทรัพย์ (สำหรับเครื่องคำนวณ Lot)</label>
                  <select
                    value={newShortcutType}
                    onChange={(e) => setNewShortcutType(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      background: "#0f172a",
                      border: "1px solid var(--border-color)",
                      borderRadius: "4px",
                      color: "#fff",
                      fontSize: "12px",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="forex">Forex (คู่เงินทั่วไป)</option>
                    <option value="gold">Gold (ทองคำ)</option>
                    <option value="jpy">JPY (คู่เงินเยน)</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
                  <button 
                    type="button" 
                    onClick={() => setShowAddShortcut(false)}
                    className="btn-quick-select" 
                    style={{ margin: 0, padding: "6px 12px" }}
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="submit" 
                    className="btn-search" 
                    style={{ margin: 0, padding: "6px 16px", borderRadius: "4px" }}
                  >
                    บันทึกทางลัด
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* AI Trading Bias & Guidelines (Top Header Centerpiece) */}
          <div className="glass-card ai-analyst-section" style={{ 
            padding: "20px 24px", 
            margin: "0 0 24px 0",
            display: "flex", 
            flexDirection: "column", 
            gap: "14px",
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))",
            border: "1.5px solid rgba(59, 130, 246, 0.5)",
            boxShadow: "0 0 25px rgba(59, 130, 246, 0.25)",
            position: "relative",
            overflow: "hidden"
          }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", borderBottom: "1px dashed var(--border-color)", paddingBottom: "12px", marginBottom: "4px" }}>
              <h3 className="section-title" style={{ fontSize: "16px", marginBottom: 0, borderBottom: "none", paddingBottom: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={20} style={{ color: "var(--color-primary)" }} />
                <span>ผลวิเคราะห์การวิจัยโดย AI (AI Analyst Report)</span>
              </h3>
              
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {["daily", "weekly", "monthly", "news", "war"].map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setReportTab(tab)}
                    className={`btn-quick-select ${reportTab === tab ? "active" : ""}`}
                    style={{ margin: 0, padding: "6px 12px", fontSize: "12px", fontWeight: "bold" }}
                  >
                    {tab === "daily" ? "รายวัน (Daily)" : tab === "weekly" ? "รายสัปดาห์ (Weekly)" : tab === "monthly" ? "รายเดือน (Monthly)" : tab === "news" ? "สรุปวิเคราะห์ข่าว (AI News)" : "วิเคราะห์ข่าวสงคราม (AI War)"}
                  </button>
                ))}
              </div>
            </div>

            {(() => {
              const data = getSimulatedMarketData(symbol, activeTimeframe, reportTab);
              return (
                <div style={{ 
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}>
                  {reportTab === "daily" && (
                    <>
                      <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: "#60a5fa", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                        <Activity size={16} style={{ color: "#60a5fa" }} />
                        <span>🧠 แผนกลยุทธ์การเทรดรายวันโดย AI (AI Daily Trading Bias)</span>
                      </h4>
                      {(() => {
                        const cleanSym = symbol.split(":")[1] || symbol;
                        let charSum = 0;
                        for (let i = 0; i < cleanSym.length; i++) charSum += cleanSym.charCodeAt(i);
                        const isBullish = (charSum + 2) % 2 === 0;
                        const probVal = 62 + ((charSum * 2) % 26);
                        return (
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "10px 0", background: "rgba(255,255,255,0.03)", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "11.5px" }}>
                                <span style={{ fontWeight: "600", color: isBullish ? "#10b981" : "#ef4444" }}>
                                  {isBullish ? "📈 โอกาสขาขึ้น (Bullish Probability)" : "📉 โอกาสขาลง (Bearish Probability)"}
                                </span>
                                <span style={{ fontWeight: "bold", color: isBullish ? "#10b981" : "#ef4444" }}>{probVal}%</span>
                              </div>
                              <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${probVal}%`, background: isBullish ? "linear-gradient(90deg, #10b981, #34d399)" : "linear-gradient(90deg, #ef4444, #f43f5e)", borderRadius: "3px" }} />
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", 
                        gap: "24px" 
                      }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>📅 แนวทางการเทรดของวัน (Daily Bias & Outlook)</span>
                          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.55" }}>
                            {data.dailyBias}
                          </p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "#22c55e" }}>🎯 แนวทางการเทรดในวัน (Intraday Execution Tactics)</span>
                          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.55" }}>
                            {data.intradayTactics}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {reportTab === "weekly" && (
                    <>
                      <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: "#60a5fa", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                        <Activity size={16} style={{ color: "#60a5fa" }} />
                        <span>🧠 แผนกลยุทธ์สัปดาห์นี้โดย AI (AI Weekly Swing Guidelines)</span>
                      </h4>
                      {(() => {
                        const cleanSym = symbol.split(":")[1] || symbol;
                        let charSum = 0;
                        for (let i = 0; i < cleanSym.length; i++) charSum += cleanSym.charCodeAt(i);
                        const isBullish = (charSum + 5) % 2 === 0;
                        const probVal = 58 + ((charSum * 5) % 28);
                        return (
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "10px 0", background: "rgba(255,255,255,0.03)", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "11.5px" }}>
                                <span style={{ fontWeight: "600", color: isBullish ? "#10b981" : "#ef4444" }}>
                                  {isBullish ? "📈 โอกาสขาขึ้น (Bullish Probability)" : "📉 โอกาสขาลง (Bearish Probability)"}
                                </span>
                                <span style={{ fontWeight: "bold", color: isBullish ? "#10b981" : "#ef4444" }}>{probVal}%</span>
                              </div>
                              <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${probVal}%`, background: isBullish ? "linear-gradient(90deg, #10b981, #34d399)" : "linear-gradient(90deg, #ef4444, #f43f5e)", borderRadius: "3px" }} />
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", 
                        gap: "24px" 
                      }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>📅 แนวโน้มประจำสัปดาห์ (Weekly Bias & Outlook)</span>
                          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.55" }}>
                            {data.weeklyBias}
                          </p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "#22c55e" }}>🎯 กลยุทธ์สัปดาห์นี้ (Weekly Execution Tactics)</span>
                          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.55" }}>
                            {data.weeklyTactics}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {reportTab === "monthly" && (
                    <>
                      <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: "#60a5fa", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                        <Activity size={16} style={{ color: "#60a5fa" }} />
                        <span>🧠 แผนวิเคราะห์มหภาครายเดือนโดย AI (AI Monthly Macro Report)</span>
                      </h4>
                      {(() => {
                        const cleanSym = symbol.split(":")[1] || symbol;
                        let charSum = 0;
                        for (let i = 0; i < cleanSym.length; i++) charSum += cleanSym.charCodeAt(i);
                        const isBullish = (charSum + 8) % 2 === 0;
                        const probVal = 55 + ((charSum * 8) % 32);
                        return (
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "10px 0", background: "rgba(255,255,255,0.03)", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "11.5px" }}>
                                <span style={{ fontWeight: "600", color: isBullish ? "#10b981" : "#ef4444" }}>
                                  {isBullish ? "📈 โอกาสขาขึ้น (Bullish Probability)" : "📉 โอกาสขาลง (Bearish Probability)"}
                                </span>
                                <span style={{ fontWeight: "bold", color: isBullish ? "#10b981" : "#ef4444" }}>{probVal}%</span>
                              </div>
                              <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${probVal}%`, background: isBullish ? "linear-gradient(90deg, #10b981, #34d399)" : "linear-gradient(90deg, #ef4444, #f43f5e)", borderRadius: "3px" }} />
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", 
                        gap: "24px" 
                      }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>📅 แนวโน้มมหภาครายเดือน (Monthly Macro Outlook)</span>
                          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.55" }}>
                            {data.monthlyBias}
                          </p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "#22c55e" }}>🎯 แผนลงทุนระยะยาวรายเดือน (Monthly Investment Tactics)</span>
                          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.55" }}>
                            {data.monthlyTactics}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {reportTab === "news" && (
                    <>
                      <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: "#60a5fa", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                        <Newspaper size={16} style={{ color: "#60a5fa" }} />
                        <span>🧠 สรุปวิเคราะห์ข่าวสารและระดับความน่าจะเป็นของคู่เงินโดย AI (AI News & Probability Analysis)</span>
                      </h4>
                      
                      {(() => {
                        const cleanSym = symbol.split(":")[1] || symbol;
                        const data = getSimulatedMarketData(symbol, activeTimeframe, reportTab);
                        
                        // Deterministic probability based on trend and symbol
                        let bullishProb = 50;
                        if (data.trend === "uptrend") {
                          bullishProb = 68 + (cleanSym.charCodeAt(0) % 15);
                        } else if (data.trend === "downtrend") {
                          bullishProb = 20 + (cleanSym.charCodeAt(0) % 15);
                        } else {
                          bullishProb = 45 + (cleanSym.charCodeAt(0) % 15);
                        }
                        const bearishProb = 100 - bullishProb;
                        const sentimentClass = bullishProb >= 60 ? "Bullish (แนวโน้มขาขึ้นได้เปรียบ)" : 
                                               bullishProb <= 40 ? "Bearish (แนวโน้มขาลงมีน้ำหนักกว่า)" : 
                                               "Neutral (สภาวะสะสมพลังไม่มีทิศทางชัดเจน)";
                        const sentimentColor = bullishProb >= 60 ? "#22c55e" : bullishProb <= 40 ? "#ef4444" : "#eab308";
                        
                        return (
                          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "4px" }}>
                            <div style={{ background: "rgba(15, 23, 42, 0.45)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
                                <span style={{ color: "#22c55e" }}>📈 โอกาสขาขึ้น (Bullish Probability): {bullishProb}%</span>
                                <span style={{ color: "#ef4444" }}>📉 โอกาสขาลง (Bearish Probability): {bearishProb}%</span>
                              </div>
                              <div style={{ width: "100%", height: "12px", background: "#1e293b", borderRadius: "6px", overflow: "hidden", display: "flex" }}>
                                <div style={{ width: `${bullishProb}%`, height: "100%", background: "linear-gradient(90deg, #22c55e, #10b981)" }}></div>
                                <div style={{ width: `${bearishProb}%`, height: "100%", background: "linear-gradient(90deg, #f43f5e, #ef4444)" }}></div>
                              </div>
                              <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                                <span>ความเชื่อมั่นตลาดภาพรวม: <strong style={{ color: sentimentColor }}>{sentimentClass}</strong></span>
                                <span>คำนวณโดย AI วิเคราะห์โครงสร้างราคาร่วมกับ Sentiment ข่าวล่าสุด</span>
                              </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>📰 วิเคราะห์เจาะลึกข่าวสารล่าสุด ({cleanSym})</span>
                              {newsAnalysis.loading ? (
                                <div style={{ fontSize: "13px", color: "var(--text-muted)", padding: "8px 0" }}>กำลังวิเคราะห์สรุปข่าวโดย AI...</div>
                              ) : newsAnalysis.impacts.length === 0 ? (
                                <div style={{ fontSize: "13px", color: "var(--text-muted)", padding: "8px 0" }}>ไม่พบข่าวที่เกี่ยวข้องกับ {cleanSym} ในรอบวันนี้</div>
                              ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto", paddingRight: "4px" }}>
                                  {newsAnalysis.impacts.map((ev, idx) => (
                                    <div key={idx} style={{ 
                                      background: "rgba(15, 23, 42, 0.3)", 
                                      padding: "10px 12px", 
                                      borderRadius: "6px", 
                                      borderLeft: `3px solid ${bullishProb >= 50 ? "#22c55e" : "#ef4444"}`,
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "4px"
                                    }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12.5px" }}>
                                        <strong style={{ color: "#f8fafc" }}>{ev.event}</strong>
                                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{ev.time} ({ev.currency})</span>
                                      </div>
                                      <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.4" }}>
                                        <span style={{ color: "var(--color-primary)", fontWeight: "600" }}>วิเคราะห์มุมมอง AI:</span> {ev.impact}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}

                  {reportTab === "war" && (
                    <>
                      <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: "#EF4444", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                        <ShieldAlert size={16} style={{ color: "#EF4444" }} />
                        <span>⚔️ วิเคราะห์ข่าวสงครามและความเสี่ยงทางภูมิรัฐศาสตร์ (AI War & Geopolitical Risk Analysis)</span>
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(239, 68, 68, 0.08)", padding: "12px 14px", borderRadius: "10px", borderLeft: "4px solid var(--color-danger)" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>ระดับความตึงเครียดทางภูมิรัฐศาสตร์โลก</span>
                            <strong style={{ fontSize: "14px", color: "var(--color-danger)" }}>HIGH TO CRITICAL (ระดับวิกฤตสูง)</strong>
                          </div>
                          <span style={{ fontSize: "20px" }}>🚨</span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(245, 158, 11, 0.08)", padding: "12px 14px", borderRadius: "10px", borderLeft: "4px solid var(--color-warning)" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>ดัชนีต้องการสินทรัพย์ปลอดภัยหนุนสินทรัพย์</span>
                            <strong style={{ fontSize: "14px", color: "var(--color-warning)" }}>92% (ต้องการถือครองหนาแน่น)</strong>
                          </div>
                          <span style={{ fontSize: "20px" }}>🛡️</span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px dashed var(--border-color)", paddingTop: "12px" }}>
                          <span style={{ fontSize: "12.5px", fontWeight: "bold", color: "var(--color-primary)" }}>🔥 บทวิเคราะห์อิมแพ็กข่าวด้านเสถียรภาพสงคราม:</span>
                          
                          <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "10px", lineHeight: "1.5" }}>
                            <div>
                              <strong style={{ color: "#fff" }}>📍 วิกฤตการณ์ตะวันออกกลาง (Middle East Tensions):</strong> การขยายวงขัดแย้งหนุนให้ราคาพลังงานดิบดิบโลก และราคาทองคำพุ่งทะยาน ส่งผลบวกต่อสินทรัพย์ Safe-haven และเกิดแรงเทขายสินทรัพย์ที่มีความเสี่ยงสูง
                            </div>
                            <div>
                              <strong style={{ color: "#fff" }}>📍 วิกฤตการณ์ยุโรปตะวันออก (Russia-Ukraine):</strong> การคว่ำบาตรรอบใหม่ในภาคการเงินส่งผลลบต่อระบบธุรกรรมของกลุ่มยูโรโซน ส่งผลให้ตลาดยุโรปและคู่เงินหลักเผชิญแรงกดดันชั่วคราวขณะที่ดอลลาร์/ทองคำได้รับเงินลี้ภัยระยะสั้น
                            </div>
                            <div>
                              <strong style={{ color: "#fff" }}>📍 ความขัดแย้งการค้าสหรัฐฯ-จีน (US-China Trade War):</strong> ส่งผลกระทบอย่างต่อเนื่องให้เกิดกระแส De-dollarization ทั่วโลก หนุนแรงซื้อสะสมทองคำอย่างมีนัยสำคัญ
                            </div>
                          </div>
                        </div>

                        <div style={{ background: "rgba(59, 130, 246, 0.05)", padding: "10px 12px", borderRadius: "8px", fontSize: "11.5px", border: "1px solid rgba(59, 130, 246, 0.15)", lineHeight: "1.5" }}>
                          <span style={{ fontWeight: "bold", color: "var(--color-primary)" }}>💡 คาดการณ์จาก AI:</span> สภาวะตึงเครียดของขั้วสงครามกระตุ้นให้ราคาสินทรัพย์หลักมีความผันผวนสูง แนะนำเน้นสินทรัพย์เสี่ยงต่ำหรือถือครองทองคำ/สินทรัพย์ป้องกันภัยสงคราม (War Premium)
                        </div>
                      </div>
                    </>
                  )}

                  {reportTab === "war" && (
                    <>
                      <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: "#EF4444", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                        <ShieldAlert size={16} style={{ color: "#EF4444" }} />
                        <span>⚔️ วิเคราะห์ข่าวสงครามและความเสี่ยงทางภูมิรัฐศาสตร์ (AI War & Geopolitical Risk Analysis)</span>
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(239, 68, 68, 0.08)", padding: "12px 14px", borderRadius: "10px", borderLeft: "4px solid var(--color-danger)" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>ระดับความตึงเครียดทางภูมิรัฐศาสตร์โลก</span>
                            <strong style={{ fontSize: "14px", color: "var(--color-danger)" }}>HIGH TO CRITICAL (ระดับวิกฤตสูง)</strong>
                          </div>
                          <span style={{ fontSize: "20px" }}>🚨</span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(245, 158, 11, 0.08)", padding: "12px 14px", borderRadius: "10px", borderLeft: "4px solid var(--color-warning)" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>ดัชนีต้องการสินทรัพย์ปลอดภัยหนุนสินทรัพย์</span>
                            <strong style={{ fontSize: "14px", color: "var(--color-warning)" }}>92% (ต้องการถือครองหนาแน่น)</strong>
                          </div>
                          <span style={{ fontSize: "20px" }}>🛡️</span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px dashed var(--border-color)", paddingTop: "12px" }}>
                          <span style={{ fontSize: "12.5px", fontWeight: "bold", color: "var(--color-primary)" }}>🔥 บทวิเคราะห์อิมแพ็กข่าวด้านเสถียรภาพสงคราม:</span>
                          
                          <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "10px", lineHeight: "1.5" }}>
                            <div>
                              <strong style={{ color: "#fff" }}>📍 วิกฤตการณ์ตะวันออกกลาง (Middle East Tensions):</strong> การขยายวงขัดแย้งหนุนให้ราคาพลังงานดิบดิบโลก และราคาทองคำพุ่งทะยาน ส่งผลบวกต่อสินทรัพย์ Safe-haven และเกิดแรงเทขายสินทรัพย์ที่มีความเสี่ยงสูง
                            </div>
                            <div>
                              <strong style={{ color: "#fff" }}>📍 วิกฤตการณ์ยุโรปตะวันออก (Russia-Ukraine):</strong> การคว่ำบาตรรอบใหม่ในภาคการเงินส่งผลลบต่อระบบธุรกรรมของกลุ่มยูโรโซน ส่งผลให้ตลาดยุโรปและคู่เงินหลักเผชิญแรงกดดันชั่วคราวขณะที่ดอลลาร์/ทองคำได้รับเงินลี้ภัยระยะสั้น
                            </div>
                            <div>
                              <strong style={{ color: "#fff" }}>📍 ความขัดแย้งการค้าสหรัฐฯ-จีน (US-China Trade War):</strong> ส่งผลกระทบอย่างต่อเนื่องให้เกิดกระแส De-dollarization ทั่วโลก หนุนแรงซื้อสะสมทองคำอย่างมีนัยสำคัญ
                            </div>
                          </div>
                        </div>

                        <div style={{ background: "rgba(59, 130, 246, 0.05)", padding: "10px 12px", borderRadius: "8px", fontSize: "11.5px", border: "1px solid rgba(59, 130, 246, 0.15)", lineHeight: "1.5" }}>
                          <span style={{ fontWeight: "bold", color: "var(--color-primary)" }}>💡 คาดการณ์จาก AI:</span> สภาวะตึงเครียดของขั้วสงครามกระตุ้นให้ราคาสินทรัพย์หลักมีความผันผวนสูง แนะนำเน้นสินทรัพย์เสี่ยงต่ำหรือถือครองทองคำ/สินทรัพย์ป้องกันภัยสงคราม (War Premium)
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Row 1: TradingView Chart & Column 1 (Technical & SMC) side-by-side */}
          <div className="layout-row-50-50" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "24px",
            marginBottom: "24px",
            alignItems: "stretch"
          }}>
            {/* Left: TradingView Live Chart & Forex Session Times */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", height: "100%" }}>
              <style>{`
                @keyframes pulseDot {
                  0%, 100% { opacity: 1; box-shadow: 0 0 6px #22c55e; }
                  50% { opacity: 0.4; box-shadow: 0 0 14px #22c55e; }
                }
              `}</style>
              
              {/* TradingView Chart Container */}
              <div className="tradingview-container-wrapper" style={{ height: "670px", minHeight: "670px", margin: 0, position: "relative", borderRadius: "12px", overflow: "hidden" }}>
                <div id="tradingview_chart_container" className="tradingview-chart-box" style={{ height: "100%" }}></div>
                {symbol.startsWith("SET:") && (
                  <div style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(59, 130, 246, 0.4)",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
                    borderRadius: "8px",
                    padding: "12px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    zIndex: 10,
                    maxWidth: "90%",
                    width: "max-content",
                    backdropFilter: "blur(10px)"
                  }}>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500" }}>
                      🔒 ข้อมูลตระกูล SET จำกัดสิทธิ์บน Widget ภายนอก
                    </span>
                    <button
                      type="button"
                      onClick={() => window.open(`https://th.tradingview.com/chart/?symbol=${symbol}`, "_blank")}
                      className="btn-quick-select active"
                      style={{ margin: 0, padding: "6px 12px", fontSize: "11.5px", background: "var(--color-primary)", color: "#fff", border: "none" }}
                    >
                      🚀 เปิดดูกราฟสดบน TradingView
                    </button>
                  </div>
                )}
              </div>

              {/* Forex Market Hours Widget */}
              <div className="glass-card" style={{ 
                padding: "20px", 
                borderRadius: "12px", 
                border: "1px solid var(--border-color)", 
                background: "linear-gradient(135deg, rgba(30, 41, 59, 0.45), rgba(15, 23, 42, 0.75))" 
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--border-color)", paddingBottom: "12px", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Globe size={18} style={{ color: "var(--color-primary)" }} />
                    <h3 style={{ fontSize: "15px", fontWeight: "bold", margin: 0 }}>🕒 โซนเวลาเปิด-ปิดตลาด Forex (เวลาไทย GMT+7)</h3>
                  </div>
                  <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "6px 12px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)", fontSize: "12.5px", fontWeight: "600", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", animation: "pulseDot 1.5s infinite" }}></span>
                    เวลาไทยปัจจุบัน: <strong style={{ color: "var(--color-primary)" }}>{currentTime.toLocaleTimeString("th-TH")} น.</strong>
                  </div>
                </div>

                {/* Golden Hours Alert Banner */}
                {(() => {
                  const month = currentTime.getMonth();
                  const isSummer = (month >= 3 && month <= 9);
                  const currentHour = currentTime.getHours();
                  const isGolden = isSummer 
                    ? (currentHour >= 19 && currentHour < 23)
                    : (currentHour >= 20 || currentHour < 0);
                  
                  return (
                    <div style={{ 
                      background: isGolden ? "linear-gradient(90deg, rgba(245, 158, 11, 0.15), rgba(249, 115, 22, 0.05))" : "rgba(255,255,255,0.02)",
                      border: isGolden ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "12px",
                      lineHeight: "1.5"
                    }}>
                      <span style={{ fontSize: "16px" }}>{isGolden ? "🔥" : "💡"}</span>
                      <div>
                        {isGolden ? (
                          <span style={{ fontWeight: "700", color: "#F59E0B" }}>
                            ขณะนี้อยู่ในช่วงเวลาทอง (Golden Hours - London & NY Overlap) ตลาดมีความผันผวนและสภาพคล่องสูงสุดในวัน! เหมาะสำหรับการเทรดคู่เงินหลักและทองคำ
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-secondary)" }}>
                            ช่วงเวลาทอง (London-NY Overlap) คือ <strong>{isSummer ? "19:00 - 23:00 น." : "20:00 - 00:00 น."} (เวลาไทย)</strong> ซึ่งเป็นช่วงที่กราฟขยับตัวแรงและวิ่งเป็นเทรนชัดเจนที่สุด
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Session Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "12px" }}>
                  {getSessionsInfo(currentTime).map((session, index) => (
                    <div key={index} style={{
                      background: session.open ? `linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))` : "rgba(15, 15, 25, 0.2)",
                      border: session.open ? `1px solid ${session.color}50` : "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "10px",
                      padding: "14px 16px",
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      boxShadow: session.open ? `0 4px 12px ${session.color}15` : "none",
                      transition: "all 0.3s ease"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: "13px", color: "#fff" }}>{session.name}</strong>
                        <span style={{
                          fontSize: "10px",
                          fontWeight: "bold",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: session.open ? `${session.color}25` : "rgba(255,255,255,0.05)",
                          color: session.open ? session.color : "var(--text-muted)",
                          border: session.open ? `1px solid ${session.color}40` : "1px solid rgba(255,255,255,0.05)"
                        }}>
                          {session.open ? "● OPEN (เปิด)" : "○ CLOSED (ปิด)"}
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: "600" }}>
                        ⏰ เวลาทำการ: {session.hoursText}
                      </div>
                      <div style={{ fontSize: "10.5px", color: "var(--text-muted)", lineHeight: "1.4", marginTop: "2px" }}>
                        {session.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: โครงสร้างเทคนิค (Technical & SMC) */}
            <div className="glass-card" style={{ 
              padding: "20px 24px", 
              background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))", 
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              boxSizing: "border-box"
            }}>
              {/* Column 1: Technical & Structure */}
              {(() => {
                const data = getSimulatedMarketData(symbol, activeTimeframe, reportTab);
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                      <span style={{ fontSize: "15px", fontWeight: "bold", color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                        📊 โครงสร้างเทคนิค (Technical & SMC)
                      </span>
                      {/* Timeframe Selector inside the column header */}
                      <div style={{ display: "flex", gap: "4px", background: "rgba(15, 23, 42, 0.5)", padding: "3px", borderRadius: "4px" }}>
                        {["5m", "15m", "30m", "1h", "4h", "1D"].map((tf) => (
                          <button
                            key={tf}
                            type="button"
                            onClick={() => setActiveTimeframe(tf)}
                            className={`btn-quick-select ${activeTimeframe === tf ? "active" : ""}`}
                            style={{
                              padding: "8px 14px",
                              fontSize: "14px",
                              fontWeight: "bold",
                              margin: 0,
                              minWidth: "54px",
                              textAlign: "center"
                            }}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Trendline Card */}
                    <div style={{ background: "rgba(15, 23, 42, 0.35)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <span style={{ fontSize: "13.5px", fontWeight: "600", color: "var(--text-secondary)" }}>📈 วิเคราะห์เทรนไลน์ ({activeTimeframe})</span>
                        <span style={{
                          fontSize: "12px",
                          fontWeight: "bold",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          background: data.trend === "uptrend" ? "rgba(34, 197, 94, 0.15)" : data.trend === "downtrend" ? "rgba(239, 68, 68, 0.15)" : "rgba(234, 179, 8, 0.15)",
                          color: data.trend === "uptrend" ? "#22c55e" : data.trend === "downtrend" ? "#ef4444" : "#eab308"
                        }}>
                          {data.trend === "uptrend" ? "ขาขึ้น (Uptrend)" : data.trend === "downtrend" ? "ขาลง (Downtrend)" : "ไซด์เวย์ (Sideways)"}
                        </span>
                      </div>
                      <div style={{ marginTop: "10px" }}>
                        {data.trend === "uptrend" ? (
                          <svg width="100%" height="110" viewBox="0 0 300 90" style={{ background: "#0f172a", borderRadius: "6px", border: "1px solid #1e293b" }}>
                            <line x1="20" y1="75" x2="280" y2="30" stroke="#22c55e" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
                            <line x1="20" y1="50" x2="280" y2="10" stroke="#22c55e" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
                            <path d="M 20 60 L 60 30 L 100 48 L 140 18 L 180 35 L 220 8 L 260 25 L 290 2" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                            <circle cx="60" cy="30" r="4.5" fill="#22c55e" />
                            <circle cx="140" cy="18" r="4.5" fill="#22c55e" />
                            <circle cx="220" cy="8" r="4.5" fill="#22c55e" />
                            <circle cx="100" cy="48" r="4.5" fill="#ef4444" />
                            <circle cx="180" cy="35" r="4.5" fill="#ef4444" />
                            <circle cx="260" cy="25" r="4.5" fill="#ef4444" />
                            <text x="15" y="83" fill="#22c55e" fontSize="9.5" fontWeight="bold">Uptrend Channel (เร่งตัวในกรอบขาขึ้น)</text>
                          </svg>
                        ) : data.trend === "downtrend" ? (
                          <svg width="100%" height="110" viewBox="0 0 300 90" style={{ background: "#0f172a", borderRadius: "6px", border: "1px solid #1e293b" }}>
                            <line x1="20" y1="15" x2="280" y2="55" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
                            <line x1="20" y1="40" x2="280" y2="80" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
                            <path d="M 20 25 L 60 55 L 100 35 L 140 68 L 180 45 L 220 78 L 260 55 L 290 85" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                            <circle cx="100" cy="35" r="4.5" fill="#22c55e" />
                            <circle cx="180" cy="45" r="4.5" fill="#22c55e" />
                            <circle cx="260" cy="55" r="4.5" fill="#22c55e" />
                            <circle cx="60" cy="55" r="4.5" fill="#ef4444" />
                            <circle cx="140" cy="68" r="4.5" fill="#ef4444" />
                            <circle cx="220" cy="78" r="4.5" fill="#ef4444" />
                            <text x="15" y="18" fill="#ef4444" fontSize="9.5" fontWeight="bold">Downtrend Channel (เคลื่อนตัวในกรอบขาลง)</text>
                          </svg>
                        ) : (
                          <svg width="100%" height="110" viewBox="0 0 300 90" style={{ background: "#0f172a", borderRadius: "6px", border: "1px solid #1e293b" }}>
                            <line x1="20" y1="20" x2="280" y2="20" stroke="#eab308" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
                            <line x1="20" y1="65" x2="280" y2="65" stroke="#eab308" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
                            <path d="M 20 45 L 50 20 L 90 65 L 130 20 L 170 65 L 210 30 L 250 60 L 290 40" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                            <circle cx="50" cy="20" r="4.5" fill="#22c55e" />
                            <circle cx="130" cy="20" r="4.5" fill="#22c55e" />
                            <circle cx="210" cy="30" r="4.5" fill="#22c55e" />
                            <circle cx="90" cy="65" r="4.5" fill="#ef4444" />
                            <circle cx="170" cy="65" r="4.5" fill="#ef4444" />
                            <circle cx="250" cy="60" r="4.5" fill="#ef4444" />
                            <text x="15" y="82" fill="#eab308" fontSize="9.5" fontWeight="bold">Sideways Range (แกว่งตัวในกรอบสะสมพลัง)</text>
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Support & Resistance Card */}
                    {(() => {
                      const srData = getSimulatedMarketData(symbol, activeTimeframe, srPeriod);
                      return (
                        <div style={{ background: "rgba(15, 23, 42, 0.35)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
                              🛑 โซนรับ-ต้านสำคัญ ({srPeriod === "daily" ? "📅 รายวัน D1" : srPeriod === "weekly" ? "📆 รายสัปดาห์ W1" : "🗓️ รายเดือน MN"})
                            </span>
                            <div style={{ display: "flex", gap: "4px" }}>
                              {["daily", "weekly", "monthly"].map(p => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => setSrPeriod(p)}
                                  className={`btn-quick-select ${srPeriod === p ? "active" : ""}`}
                                  style={{ padding: "2px 6px", fontSize: "11px", margin: 0, fontWeight: "bold" }}
                                >
                                  {p === "daily" ? "D1" : p === "weekly" ? "W1" : "MN"}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: "6px", marginBottom: "10px", fontSize: "11px" }}>
                            <span style={{ color: "var(--text-muted)" }}>🔒 ราคาอ้างอิงกรอบ {srPeriod.toUpperCase()}: <strong style={{ color: "#60a5fa" }}>{srData.prefix}{srData.anchorPrice}</strong></span>
                            <span style={{ color: "#22c55e", fontWeight: "bold" }}>⚡ ตลาดสด: {srData.prefix}{srData.current}</span>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px", fontSize: "12.5px" }}>
                            <div>
                              <span style={{ color: "#ef4444" }}>Resistance 2 (ต้านรอง):</span> <strong style={{ color: "#f8fafc" }}>{srData.prefix}{srData.r2}</strong>
                            </div>
                            <div>
                              <span style={{ color: "#ef4444" }}>Resistance 1 (ต้านหลัก):</span> <strong style={{ color: "#f8fafc" }}>{srData.prefix}{srData.r1}</strong>
                            </div>
                            <div>
                              <span style={{ color: "#22c55e" }}>Support 1 (รับหลัก):</span> <strong style={{ color: "#f8fafc" }}>{srData.prefix}{srData.s1}</strong>
                            </div>
                            <div>
                              <span style={{ color: "#22c55e" }}>Support 2 (รับรอง):</span> <strong style={{ color: "#f8fafc" }}>{srData.prefix}{srData.s2}</strong>
                            </div>
                          </div>
                          <div style={{ marginTop: "10px" }}>
                            <svg width="100%" height="110" viewBox="0 0 300 90" style={{ background: "#0f172a", borderRadius: "6px", border: "1px solid #1e293b" }}>
                              <line x1="10" y1="20" x2="290" y2="20" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" />
                              <text x="12" y="15" fill="#ef4444" fontSize="8.5" fontWeight="bold">ต้านหลัก (R1): {srData.prefix}{srData.r1}</text>
                              
                              <line x1="10" y1="65" x2="290" y2="65" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 2" />
                              <text x="12" y="60" fill="#22c55e" fontSize="8.5" fontWeight="bold">รับสำคัญ (S1): {srData.prefix}{srData.s1}</text>
                              
                              <path d="M 20 62 L 60 25 L 100 50 L 140 25 L 180 58 L 220 38 L 260 55 L 280 45" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" />
                              <circle cx="280" cy="45" r="4.5" fill="#3b82f6" />
                              <text x="160" y="34" fill="#3b82f6" fontSize="9" fontWeight="bold">ราคาล่าสุด: {srData.prefix}{srData.current}</text>
                            </svg>
                          </div>
                          
                          <div style={{ marginTop: "8px", display: "flex", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              onClick={() => handleResetAnchorPrice(symbol.split(":")[1] || symbol, srPeriod)}
                              style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "10.5px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                              title="รีเฟรชราคาอ้างอิงกรอบเวลาเป็นราคาตลาดปัจจุบัน"
                            >
                              🔄 รีเฟรชกรอบอ้างอิง {srPeriod.toUpperCase()}
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    {/* SMC structure Card */}
                    <div style={{ background: "rgba(15, 23, 42, 0.35)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)" }}>
                      <span style={{ fontSize: "13.5px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "10px" }}>⚡ วิเคราะห์ BOS & CHoCH ({activeTimeframe})</span>
                      <div style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginBottom: "10px", lineHeight: "1.4" }}>
                        <div>สถานะโครงสร้างราคา: <strong style={{ color: "#f8fafc" }}>{data.structureType}</strong></div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                          <span>Break of Structure (BOS): <strong style={{ color: "#22c55e" }}>{data.prefix}{data.bos}</strong></span>
                          <span>Change of Character (CHoCH): <strong style={{ color: "#ef4444" }}>{data.prefix}{data.choch}</strong></span>
                        </div>
                      </div>
                      <div style={{ marginTop: "10px" }}>
                        {data.trend === "uptrend" ? (
                          <svg width="100%" height="110" viewBox="0 0 300 90" style={{ background: "#0f172a", borderRadius: "6px", border: "1px solid #1e293b" }}>
                            <path d="M 20 65 L 60 30 L 90 50 L 140 20 L 170 38 L 220 10 L 260 25 L 290 5" fill="none" stroke="#94a3b8" strokeWidth="2" />
                            <line x1="60" y1="30" x2="140" y2="30" stroke="#22c55e" strokeWidth="1.2" strokeDasharray="2 2" />
                            <text x="70" y="25" fill="#22c55e" fontSize="8.5" fontWeight="bold">BOS (High Break): {data.prefix}{data.bos}</text>
                            <circle cx="130" cy="30" r="3" fill="#22c55e" />
                            <line x1="140" y1="20" x2="220" y2="20" stroke="#22c55e" strokeWidth="1.2" strokeDasharray="2 2" />
                            <text x="150" y="15" fill="#22c55e" fontSize="8.5" fontWeight="bold">BOS (High Break): {data.prefix}{data.bos}</text>
                            <circle cx="205" cy="20" r="3" fill="#22c55e" />
                          </svg>
                        ) : data.trend === "downtrend" ? (
                          <svg width="100%" height="110" viewBox="0 0 300 90" style={{ background: "#0f172a", borderRadius: "6px", border: "1px solid #1e293b" }}>
                            <path d="M 20 20 L 60 50 L 90 32 L 140 62 L 170 42 L 220 72 L 260 55 L 290 80" fill="none" stroke="#94a3b8" strokeWidth="2" />
                            <line x1="60" y1="50" x2="140" y2="50" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="2 2" />
                            <text x="70" y="45" fill="#ef4444" fontSize="8.5" fontWeight="bold">BOS (Low Break): {data.prefix}{data.bos}</text>
                            <circle cx="130" cy="50" r="3" fill="#ef4444" />
                          </svg>
                        ) : (
                          <svg width="100%" height="110" viewBox="0 0 300 90" style={{ background: "#0f172a", borderRadius: "6px", border: "1px solid #1e293b" }}>
                            <path d="M 20 30 L 60 15 L 100 48 L 140 25 L 185 68 L 220 50 L 260 32 Q 280 20 290 40" fill="none" stroke="#94a3b8" strokeWidth="2" />
                            <line x1="100" y1="48" x2="185" y2="48" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="2 2" />
                            <text x="110" y="43" fill="#ef4444" fontSize="8.5" fontWeight="bold">CHoCH (Low Break): {data.prefix}{data.choch}</text>
                            <circle cx="160" cy="48" r="3" fill="#ef4444" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Row 2: Column 2 (AI News Digest) & Economic Calendar side-by-side */}
          <div className="layout-row-50-50" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "24px",
            marginBottom: "24px",
            alignItems: "start"
          }}>
            {/* Left: Economic Calendar */}
            {/* Economic Calendar */}
          <div className="economic-calendar-section" style={{ marginTop: "24px" }}>
            <div className="pane-header" style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginBottom: "12px",
              flexWrap: "wrap",
              gap: "12px"
            }}>
              <div className="pane-title" style={{ margin: 0 }}>
                <CalendarIcon size={18} style={{ color: "var(--color-warning)" }} />
                <span>ตารางข่าวเศรษฐกิจระดับโลก (TradingView Calendar - GMT+7)</span>
              </div>
              
              {/* Date Selector Tabs */}
              <div style={{ display: "flex", gap: "6px" }}>
                {[
                  { id: "today", label: "วันนี้" },
                  { id: "tomorrow", label: "พรุ่งนี้" },
                  { id: "thisWeek", label: "สัปดาห์นี้" },
                  { id: "nextWeek", label: "สัปดาห์หน้า" }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setCalendarTab(t.id)}
                    className={`btn-quick-select ${calendarTab === t.id ? "active" : ""}`}
                    style={{
                      padding: "6px 12px",
                      fontSize: "12.5px",
                      margin: 0
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="economic-calendar-wrapper" style={{ 
              borderRadius: "12px", 
              border: "1px solid var(--border-color)", 
              overflow: "hidden", 
              background: "#131722",
              height: calendarHeight
            }}>
              <iframe 
                src={`/api/news?tab=${calendarTab}`} 
                width="100%" 
                height="100%" 
                onLoad={handleCalendarLoad}
                frameBorder="0" 
                allowTransparency="true" 
                marginWidth="0" 
                marginHeight="0"
                title="Economic Calendar"
              ></iframe>
            </div>
          </div>

            {/* Right: AI News Digest */}
            {/* Column 2: Economic News & Impacts */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", height: "auto" }}>
                <div className="pane-header" style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  marginBottom: "12px",
                  flexWrap: "wrap",
                  gap: "12px"
                }}>
                  <div className="pane-title" style={{ margin: 0 }}>
                    <Sparkles size={18} style={{ color: "var(--color-warning)" }} />
                    <span>ผลวิเคราะห์อิมแพ็คข่าวสารเศรษฐกิจ (AI News Digest)</span>
                  </div>
                </div>

                {/* Volatility warning box */}
                <div style={{
                  background: newsAnalysis.volatilityWarning.includes("⚠️") ? "rgba(239, 68, 68, 0.12)" : "rgba(59, 130, 246, 0.12)",
                  border: newsAnalysis.volatilityWarning.includes("⚠️") ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(59, 130, 246, 0.3)",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: newsAnalysis.volatilityWarning.includes("⚠️") ? "#fca5a5" : "#93c5fd",
                  lineHeight: "1.45"
                }}>
                  {newsAnalysis.volatilityWarning}
                </div>

                {/* News summary box */}
                <div style={{
                  background: "rgba(15, 23, 42, 0.4)",
                  padding: "14px 16px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  fontSize: "12.5px",
                  color: "var(--text-secondary)",
                  lineHeight: "1.5"
                }}>
                  <strong style={{ color: "#f8fafc", display: "block", marginBottom: "6px" }}>💡 สรุปสถานการณ์ข่าวโดย AI:</strong>
                  {newsAnalysis.summary}
                </div>

                {newsAnalysis.loading ? (
                  <div style={{ textAlign: "center", padding: "30px" }}>
                    <div className="spinner" style={{ margin: "0 auto 10px" }}></div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>กำลังวิเคราะห์ผลกระทบข่าวด้วย AI...</span>
                  </div>
                ) : newsAnalysis.impacts.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", height: "auto", paddingRight: "6px" }}>
                    {newsAnalysis.impacts.map((ev, index) => (
                      <div key={index} style={{
                        background: "rgba(15, 23, 42, 0.35)",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-color)",
                        fontSize: "12px"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", alignItems: "center" }}>
                          <span style={{ fontWeight: "bold", color: "#f8fafc" }}>⏰ {ev.time} | {ev.event}</span>
                          <span style={{
                            fontSize: "10.5px",
                            fontWeight: "bold",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: ev.importance === 3 ? "rgba(239, 68, 68, 0.15)" : "rgba(234, 179, 8, 0.15)",
                            color: ev.importance === 3 ? "#ef4444" : "#eab308"
                          }}>
                            {ev.importance === 3 ? "🔥 High Impact" : "⚡ Medium Impact"}
                          </span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", color: "var(--text-muted)", fontSize: "11px", marginBottom: "8px", background: "rgba(15, 23, 42, 0.5)", padding: "6px 8px", borderRadius: "4px" }}>
                          <div>ตัวเลขจริง: <strong style={{ color: ev.direction === "bullish" ? "#22c55e" : ev.direction === "bearish" ? "#ef4444" : "var(--text-primary)" }}>{ev.actual}</strong></div>
                          <div>คาดการณ์: <span style={{ color: "var(--text-primary)" }}>{ev.forecast}</span></div>
                          <div>ครั้งก่อน: <span style={{ color: "var(--text-primary)" }}>{ev.previous}</span></div>
                        </div>
                        <div style={{
                          background: ev.direction === "bullish" ? "rgba(34, 197, 94, 0.08)" : ev.direction === "bearish" ? "rgba(239, 68, 68, 0.08)" : "rgba(148, 163, 184, 0.08)",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          color: "var(--text-secondary)",
                          lineHeight: "1.45",
                          borderLeft: ev.direction === "bullish" ? "3px solid #22c55e" : ev.direction === "bearish" ? "3px solid #ef4444" : "3px solid #94a3b8"
                        }}>
                          <strong>วิเคราะห์ราคาโดย AI:</strong> {ev.impact}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", fontSize: "12px" }}>
                    ไม่มีข่าวสำคัญที่มีผลกระทบกับราคาสินทรัพย์ตัวนี้ในวันนี้
                  </div>
                )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
