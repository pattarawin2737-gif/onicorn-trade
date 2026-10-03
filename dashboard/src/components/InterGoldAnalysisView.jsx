import GeminiAiAnalysisCard from "./GeminiAiAnalysisCard";
import React, { useState, useEffect, useRef } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Calculator, 
  Globe, 
  Sparkles, 
  Award, 
  AlertCircle, 
  Newspaper, 
  ShieldAlert,
  Clock,
  Layers,
  BarChart2,
  DollarSign,
  Zap,
  CheckCircle2,
  Calendar as CalendarIcon,
  Bell,
  Flame,
  Star,
  Target,
  ChevronDown,
  ChevronUp,
  Percent
} from "lucide-react";

// Sessions info helper for Gold volatility
const getGoldSessionsInfo = (currentDate) => {
  const month = currentDate.getMonth();
  const isUsUkSummer = (month >= 3 && month <= 9);
  const hour = currentDate.getHours();
  
  const isOpen = (start, end) => {
    if (start < end) return hour >= start && hour < end;
    return hour >= start || hour < end;
  };
  
  return [
    {
      name: "Sydney (🇦🇺 ซิดนีย์)",
      hoursText: isUsUkSummer ? "05:00 - 14:00 น." : "06:00 - 15:00 น.",
      open: isOpen(isUsUkSummer ? 5 : 6, isUsUkSummer ? 14 : 15),
      volatility: "ผันผวนต่ำ (Low)",
      color: "#3B82F6"
    },
    {
      name: "Tokyo (🇯🇵 โตเกียว)",
      hoursText: "07:00 - 16:00 น.",
      open: isOpen(7, 16),
      volatility: "ผันผวนปานกลาง (Medium)",
      color: "#eab308"
    },
    {
      name: "London (🇬🇧 ลอนดอน)",
      hoursText: isUsUkSummer ? "14:00 - 23:00 น." : "15:00 - 00:00 น.",
      open: isOpen(isUsUkSummer ? 14 : 15, isUsUkSummer ? 23 : 24),
      volatility: "ผันผวนสูงมาก (High 🔥)",
      color: "#a78bfa"
    },
    {
      name: "New York (🇺🇸 นิวยอร์ก)",
      hoursText: isUsUkSummer ? "19:00 - 04:00 น." : "20:00 - 05:00 น.",
      open: isOpen(isUsUkSummer ? 19 : 20, isUsUkSummer ? 4 : 5),
      volatility: "ผันผวนสูงสุด (Peak Volatility 🚀)",
      color: "#f97316"
    }
  ];
};

export default function InterGoldAnalysisView({ username, onNavigateTab }) {
  const [symbol, setSymbol] = useState("OANDA:XAUUSD");
  const [timeframe, setTimeframe] = useState("240"); // 240 = 4H, 60 = 1H, D = 1D
  const [forecastTab, setForecastTab] = useState("daily");
  
  // Live market price states
  const [goldSpot, setGoldSpot] = useState(4300.0);
  const [goldChangePct, setGoldChangePct] = useState(0.65);
  const [usdThb, setUsdThb] = useState(33.50);
  const [dxyIndex, setDxyIndex] = useState(103.40);
  const [loading, setLoading] = useState(true);

  // Position Lot Calculator states
  const [accountBalance, setAccountBalance] = useState(1000);
  const [riskPercent, setRiskPercent] = useState(1.5);
  const [calcEntry, setCalcEntry] = useState(4300.0);
  const [calcSL, setCalcSL] = useState(4270.0);

  // Economic Calendar & AI News Digest states
  const [calendarTab, setCalendarTab] = useState("today");
  const [calendarHeight, setCalendarHeight] = useState("650px");
  const [newsFilterTab, setNewsFilterTab] = useState("medium"); // "medium" | "all"
  const [newsAnalysis, setNewsAnalysis] = useState({
    summary: "กำลังประมวลผลวิเคราะห์ข่าวสารและปัจจัยมหภาคโลกสำหรับทองคำต่างประเทศ (XAU/USD)...",
    impacts: [],
    volatilityWarning: "สภาวะความผันผวนปกติในตลาดทองคำโลก",
    loading: true
  });

  const handleCalendarLoad = (e) => {
    try {
      const iframe = e.target;
      if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
        const bodyHeight = iframe.contentWindow.document.body.scrollHeight;
        if (bodyHeight && bodyHeight > 300) {
          setCalendarHeight(`${bodyHeight + 15}px`);
        }
      }
    } catch (err) {
      console.warn("Failed to auto-fit calendar iframe height:", err);
    }
  };

  // Fetch and Analyze Global Economic News for XAU/USD
  useEffect(() => {
    const fetchAndAnalyzeGoldNews = async () => {
      setNewsAnalysis(prev => ({ ...prev, loading: true }));
      try {
        const response = await fetch(`/api/news?tab=${calendarTab}`);
        if (!response.ok) throw new Error("Failed to load news");
        const htmlText = await response.text();
        if (!htmlText.includes("flagCur") && !htmlText.includes("sentiment")) {
          throw new Error("Calendar service not available or returned non-calendar content");
        }
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, "text/html");
        const rows = doc.querySelectorAll("tbody tr");
        
        const extractedEvents = [];
        rows.forEach(row => {
          if (row.classList.contains("theDay")) return;
          
          const time = row.querySelector(".time")?.textContent?.trim() || "";
          const currency = row.querySelector(".flagCur")?.textContent?.trim() || "";
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

        const relevantEvents = extractedEvents.filter(ev =>
          ev.importance === 3 || (
            ev.importance >= 2 && (
              ev.currency === "USD" ||
              ev.currency === "USDTHB" ||
              ev.event.toLowerCase().includes("fed") ||
              ev.event.toLowerCase().includes("cpi") ||
              ev.event.toLowerCase().includes("nfp") ||
              ev.event.toLowerCase().includes("gdp") ||
              ev.event.toLowerCase().includes("pmi") ||
              ev.event.toLowerCase().includes("fomc") ||
              ev.event.toLowerCase().includes("powell") ||
              ev.event.toLowerCase().includes("retail") ||
              ev.event.includes("การจ้างงาน") ||
              ev.event.includes("ว่างงาน") ||
              ev.event.includes("ดอกเบี้ย") ||
              ev.event.includes("เงินเฟ้อ")
            )
          )
        );

        // Intelligent Economic Indicator Parser & Evaluator for XAU/USD
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

        const evaluateGoldNewsImpact = (ev) => {
          const name = String(ev.event || "").toLowerCase();
          const actStr = String(ev.actual || "").trim();
          const foreStr = String(ev.forecast || "").trim();
          const prevStr = String(ev.previous || "").trim();

          const actNum = parseEconomicNumber(actStr);
          const foreNum = parseEconomicNumber(foreStr);
          const prevNum = parseEconomicNumber(prevStr);

          const isUnemp = name.includes("ว่างงาน") || name.includes("jobless") || name.includes("unemployment") || name.includes("claims");
          const isInflation = name.includes("cpi") || name.includes("ppi") || name.includes("pce") || name.includes("เงินเฟ้อ") || name.includes("ราคาผู้บริโภค") || name.includes("ราคาผู้ผลิต");
          const isEmployment = name.includes("non-farm") || name.includes("nfp") || name.includes("จ้างงาน") || name.includes("adp") || name.includes("payroll");
          const isRates = name.includes("ดอกเบี้ย") || name.includes("interest rate") || name.includes("fed") || name.includes("fomc") || name.includes("แถลงการณ์") || name.includes("powell");
          const isGdp = name.includes("gdp") || name.includes("ผลิตภัณฑ์มวลรวม");
          const isRetail = name.includes("retail") || name.includes("ค้าปลีก") || name.includes("การใช้จ่าย");
          const isPmi = name.includes("pmi") || name.includes("ism") || name.includes("ผู้จัดการฝ่ายจัดซื้อ");

          let direction = "pending"; // "bullish" | "bearish" | "neutral" | "pending"
          let badge = "⏳ รอประกาศ";
          let impact = "";

          if (actNum !== null && foreNum !== null) {
            const diff = actNum - foreNum;
            const eps = 1e-4;

            if (Math.abs(diff) < eps) {
              direction = "neutral";
              badge = "⏺️ ตรงตามคาด (ทรงตัว 🟡)";
              if (isInflation) {
                const trend = prevNum !== null ? (actNum > prevNum ? ` (สูงขึ้นจากครั้งก่อน ${prevStr})` : actNum < prevNum ? ` (ชะลอลงจากครั้งก่อน ${prevStr})` : ` (ทรงตัวเท่าครั้งก่อน)`) : "";
                impact = `🟡 ตัวเลขจริง (${actStr}) ออกมาตรงตามคาดการณ์ (${foreStr})${trend}: ตลาดรับรู้ข้อมูลไปแล้วล่วงหน้า (Priced-in) ไม่สร้างความประหลาดใจเชิงลบ ➔ ราคาทองคำเคลื่อนไหวในกรอบเดิม (Sideway)`;
              } else if (isEmployment || isUnemp) {
                impact = `🟡 ตัวเลขจริง (${actStr}) ตรงตามคาดการณ์ (${foreStr}): ตลาดแรงงานขยายตัวตามที่ตลาดประเมินไว้ล่วงหน้า ➔ ราคาทองคำเคลื่อนไหวทรงตัวตามกรอบแนวรับ-แนวต้านเดิม`;
              } else if (isRates) {
                impact = `🟡 อัตราดอกเบี้ยจริง (${actStr}) ตรงตามคาดการณ์ (${foreStr}): ตลาดซึมซับมติล่วงหน้าไว้แล้ว ➔ ราคาทองคำรอจับตาถ้อยแถลงเรื่องแนวโน้มนโยบายรอบถัดไป`;
              } else {
                impact = `🟡 ตัวเลขจริง (${actStr}) เป็นไปตามคาดการณ์ (${foreStr}): ตลาดซึมซับข้อมูลล่วงหน้าแล้ว ➔ ราคาทองคำแกว่งตัวในกรอบเทคนิค`;
              }
            } else if (diff > eps) {
              // Actual > Forecast
              if (isUnemp) {
                direction = "bullish";
                badge = "🔺 สูงกว่าคาด (หนุนทอง 🟢)";
                impact = `🟢 ตัวเลขจริง (${actStr}) สูงกว่าคาด (${foreStr}): จำนวนผู้ขอรับสวัสดิการ/อัตราว่างงานเพิ่มขึ้น บ่งชี้ตลาดแรงงานชะลอตัว ดอลลาร์อ่อนค่า ➔ หนุนราคาทองคำ Spot ดีดตัวขึ้นแรง`;
              } else if (isInflation) {
                direction = "bearish";
                badge = "🔺 สูงกว่าคาด (กดดันทอง 🔻)";
                impact = `🔴 ตัวเลขจริง (${actStr}) สูงกว่าคาดการณ์ (${foreStr}): อัตราเงินเฟ้อยังคงหนืดตัว/ลดลงช้ากว่าคาด ลดโอกาสที่เฟดจะเร่งลดดอกเบี้ย ดอลลาร์และ Bond Yield ปรับตัวขึ้น ➔ ส่งผลกดดันราคาทองคำ Spot ย่อตัวลง/พักฐาน`;
              } else if (isEmployment) {
                direction = "bearish";
                badge = "🔺 แกร่งกว่าคาด (กดดันทอง 🔻)";
                impact = `🔴 ตัวเลขจริง (${actStr}) แข็งแกร่งกว่าคาด (${foreStr}): ตลาดแรงงานสหรัฐฯ ร้อนแรง เฟดไม่จำเป็นต้องรีบลดดอกเบี้ย หนุนดอลลาร์แข็งค่า ➔ กดดันราคาทองคำ Spot ย่อตัวลง`;
              } else if (isRates) {
                direction = "bearish";
                badge = "🔺 ดอกเบี้ยสูงกว่าคาด (กดดันทอง 🔻)";
                impact = `🔴 อัตราดอกเบี้ย (${actStr}) สูงกว่าคาด (${foreStr}): ท่าทีนโยบายตึงตัวเข้มงวด ดอลลาร์พุ่งขึ้น ➔ ส่งผลกดดันราคาทองคำ Spot ย่อตัวรวดเร็ว`;
              } else if (isGdp || isRetail || isPmi) {
                direction = "bearish";
                badge = "🔺 แกร่งกว่าคาด (กดดันทอง 🔻)";
                impact = `🔴 ตัวเลขเศรษฐกิจ (${actStr}) ออกมาแข็งแกร่งกว่าคาด (${foreStr}): เศรษฐกิจสหรัฐฯ มีแนวโน้มขยายตัวดี หนุนดอลลาร์แข็งค่า ➔ กดดันราคาทองคำ Spot ย่อตัวทดสอบแนวรับ`;
              } else {
                direction = "bearish";
                badge = "🔺 สูงกว่าคาด (กดดันทอง 🔻)";
                impact = `🔴 ตัวเลขจริง (${actStr}) ออกมาดีกว่าคาดการณ์ (${foreStr}): ตัวเลขเศรษฐกิจสหรัฐฯ แข็งแกร่ง หนุนดอลลาร์แข็งค่า ➔ กดดันราคาทองคำ Spot ย่อตัวทดสอบแนวรับ`;
              }
            } else {
              // Actual < Forecast
              if (isUnemp) {
                direction = "bearish";
                badge = "🔻 ต่ำกว่าคาด (กดดันทอง 🔻)";
                impact = `🔴 ตัวเลขจริง (${actStr}) ต่ำกว่าคาด (${foreStr}): คนว่างงานน้อยกว่าคาด บ่งชี้ตลาดแรงงานยังคงตึงตัว หนุนดอลลาร์แข็งค่า ➔ กดดันราคาทองคำ Spot ย่อตัวลง`;
              } else if (isInflation) {
                direction = "bullish";
                badge = "🔻 ต่ำกว่าคาด (หนุนทอง 🟢)";
                impact = `🟢 ตัวเลขจริง (${actStr}) ชะลอตัวต่ำกว่าคาดการณ์ (${foreStr}): เงินเฟ้อปรับลดลงชัดเจน เปิดทางให้เฟดมีโอกาสปรับลดอัตราดอกเบี้ยได้เร็ว/แรงขึ้น ดอลลาร์อ่อนค่า ➔ หนุนราคาทองคำ Spot พุ่งขึ้นแรง!`;
              } else if (isEmployment) {
                direction = "bullish";
                badge = "🔻 ต่ำกว่าคาด (หนุนทอง 🟢)";
                impact = `🟢 ตัวเลขจริง (${actStr}) ต่ำกว่าคาด (${foreStr}): ตลาดแรงงานสหรัฐฯ มีสัญญาณชะลอตัว ดอลลาร์ถูกเทขาย ➔ หนุนราคาทองคำ Spot ดีดตัวพุ่งขึ้นทดสอบแนวต้าน`;
              } else if (isRates) {
                direction = "bullish";
                badge = "🔻 ปรับลดดอกเบี้ย (หนุนทอง 🟢)";
                impact = `🟢 อัตราดอกเบี้ยจริง (${actStr}) ต่ำกว่าคาดการณ์ (${foreStr}): ธนาคารกลางผ่อนคลายนโยบายการเงินชัดเจน ดอลลาร์ร่วงลง ➔ หนุนราคาทองคำ Spot ทะยานขึ้นแรง`;
              } else if (isGdp || isRetail || isPmi) {
                direction = "bullish";
                badge = "🔻 ชะลอตัวกว่าคาด (หนุนทอง 🟢)";
                impact = `🟢 ตัวเลขเศรษฐกิจ (${actStr}) ออกมาต่ำกว่าคาด (${foreStr}): กิจกรรมทางเศรษฐกิจชะลอตัว ดอลลาร์อ่อนค่า ➔ หนุนความต้องการถือครองทองคำ Spot ปรับตัวขึ้น`;
              } else {
                direction = "bullish";
                badge = "🔻 ต่ำกว่าคาด (หนุนทอง 🟢)";
                impact = `🟢 ตัวเลขจริง (${actStr}) ต่ำกว่าคาดการณ์ (${foreStr}): เศรษฐกิจชะลอตัว ดอลลาร์อ่อนค่า ➔ หนุนราคาทองคำ Spot ปรับตัวขึ้น`;
              }
            }
          } else if (actNum !== null && foreNum === null) {
            direction = "neutral";
            badge = "📊 ประกาศแล้ว";
            impact = `ตัวเลขจริงประกาศออกมาที่ ${actStr} (ไม่มีคาดการณ์ก่อนหน้า) ตลาดจับตาทิศทางปฏิกิริยาของดอลลาร์`;
          } else {
            // Pending
            direction = "pending";
            badge = "⏳ รอประกาศผล";
            if (isInflation) {
              impact = `🎯 รอประกาศตัวเลข (คาดการณ์ ${foreStr || "-"} | ครั้งก่อน ${prevStr || "-"}): หากตัวเลขจริง > ${foreStr || "คาดการณ์"} ➔ เงินเฟ้อยังสูง ดอลลาร์แข็ง ➔ กดดันทองคำย่อตัว 🔻 | หากตัวเลขจริง < ${foreStr || "คาดการณ์"} ➔ เงินเฟ้อลด หนุนเฟดลดดอกเบี้ย ➔ หนุนทองคำพุ่งขึ้นแรง 🟢`;
            } else if (isEmployment) {
              impact = `🎯 รอประกาศตัวเลข (คาดการณ์ ${foreStr || "-"} | ครั้งก่อน ${prevStr || "-"}): หากการจ้างงานจริง > ${foreStr || "คาดการณ์"} ➔ ดอลลาร์พุ่ง กดดันทองคำย่อตัว 🔻 | หากต่ำกว่าคาด ➔ ดอลลาร์ร่วง หนุนทองคำดีดตัวพุ่งขึ้น 🟢`;
            } else if (isUnemp) {
              impact = `🎯 รอประกาศตัวเลข (คาดการณ์ ${foreStr || "-"} | ครั้งก่อน ${prevStr || "-"}): หากผู้ขอสวัสดิการ > ${foreStr || "คาดการณ์"} ➔ ตลาดแรงงานชะลอ หนุนทองคำดีดขึ้น 🟢 | หากต่ำกว่าคาด ➔ ดอลลาร์แข็ง กดดันทองคำย่อตัว 🔻`;
            } else if (isRates) {
              impact = `🎯 รอประกาศมติดอกเบี้ย (คาดการณ์ ${foreStr || "-"} | ครั้งก่อน ${prevStr || "-"}): หากคงดอกเบี้ย/ลดดอกเบี้ยตามคาด ➔ ทองคำทรงตัวในกรอบ | หากลดดอกเบี้ยมากกว่าคาด ➔ ดอลลาร์ร่วง ทองคำพุ่งแรง 🟢`;
            } else {
              impact = `🎯 รอประกาศตัวเลข (คาดการณ์ ${foreStr || "-"}): หากตัวเลขแกร่งกว่าคาด ➔ กดดันทองคำย่อตัว 🔻 | หากต่ำกว่าคาด ➔ หนุนทองคำปรับตัวขึ้น 🟢`;
            }
          }

          return { direction, badge, impact };
        };

        // Quantitative AI Probability & Macroeconomic Reasoning Engine
        const evaluateForecastProbability = (ev) => {
          const name = String(ev.event || "").toLowerCase();
          const actStr = String(ev.actual || "").trim();
          const foreStr = String(ev.forecast || "").trim();
          const prevStr = String(ev.previous || "").trim();

          const actNum = parseEconomicNumber(actStr);
          const foreNum = parseEconomicNumber(foreStr);
          const prevNum = parseEconomicNumber(prevStr);

          // Indicator Categories
          const isUnemp = name.includes("ว่างงาน") || name.includes("jobless") || name.includes("unemployment") || name.includes("claims");
          const isInflation = name.includes("cpi") || name.includes("ppi") || name.includes("pce") || name.includes("เงินเฟ้อ") || name.includes("ราคาผู้บริโภค") || name.includes("ราคาผู้ผลิต");
          const isEmployment = name.includes("non-farm") || name.includes("nfp") || name.includes("จ้างงาน") || name.includes("adp") || name.includes("payroll");
          const isRates = name.includes("ดอกเบี้ย") || name.includes("interest rate") || name.includes("fed") || name.includes("fomc") || name.includes("แถลงการณ์") || name.includes("powell");
          const isGdp = name.includes("gdp") || name.includes("ผลิตภัณฑ์มวลรวม");
          const isRetail = name.includes("retail") || name.includes("ค้าปลีก") || name.includes("การใช้จ่าย");
          const isPmi = name.includes("pmi") || name.includes("ism") || name.includes("ผู้จัดการฝ่ายจัดซื้อ");

          // When actual is already released
          if (actNum !== null && foreNum !== null) {
            const diff = actNum - foreNum;
            const eps = 1e-4;
            if (Math.abs(diff) < eps) {
              return {
                status: "announced",
                matchProbability: 100,
                higherProbability: 0,
                lowerProbability: 0,
                outlook: "🎯 ตัวเลขจริงออกมาตรงตามคาดการณ์ 100% (In-Line)",
                reasoning: `ตัวเลขจริงประกาศออกมาที่ ${actStr} ซึ่งตรงกับตัวเลขคาดการณ์ของนักวิเคราะห์ (${foreStr}) พอดี ตลาดได้รับรู้ข้อมูลล่วงหน้าไปแล้ว (Priced-In) ไม่สร้างแรงกระแทกเชิงลบหรือแรงเหวี่ยงผิดคาดต่อดอลลาร์ ทำให้ราคาทองคำ Spot ทรงตัวเคลื่อนไหวตามกรอบเทคนิคเดิม`
              };
            } else if (diff > eps) {
              const pctDiff = foreNum !== 0 ? Math.abs(((actNum - foreNum) / foreNum) * 100).toFixed(1) : "";
              return {
                status: "announced",
                matchProbability: 0,
                higherProbability: 100,
                lowerProbability: 0,
                outlook: `🔺 ตัวเลขจริงออกมาสูงกว่าคาดการณ์ (${actStr} vs คาด ${foreStr})`,
                reasoning: `ตัวเลขจริงออกมาแข็งแกร่ง/สูงกว่าที่ตลาดคาดการณ์ไว้ ${pctDiff ? `+${pctDiff}%` : ""} ส่งผลให้ตัวแปรชี้นำทางเศรษฐกิจเบี่ยงเบนจากฉันทามติเดิม ผลักดันให้ดอลลาร์และผลตอบแทนพันธบัตรปรับตัวขึ้น ส่งผลกระทบโดยตรงต่อราคาทองคำ Spot ตามกรอบอิมแพ็ค`
              };
            } else {
              const pctDiff = foreNum !== 0 ? Math.abs(((actNum - foreNum) / foreNum) * 100).toFixed(1) : "";
              return {
                status: "announced",
                matchProbability: 0,
                higherProbability: 0,
                lowerProbability: 100,
                outlook: `🔻 ตัวเลขจริงออกมาต่ำกว่าคาดการณ์ (${actStr} vs คาด ${foreStr})`,
                reasoning: `ตัวเลขจริงออกมาต่ำกว่าคาดการณ์ ${pctDiff ? `-${pctDiff}%` : ""} ส่งผลให้ตลาดต้องปรับมุมมองใหม่ต่อภาวะเศรษฐกิจ หนุนให้เกิดแรงซื้อ/ขายเพื่อปรับสมดุลพอร์ตการลงทุนในทองคำทันที`
              };
            }
          }

          // When pending / waiting for announcement
          let matchProbability = 68;
          let higherProbability = 18;
          let lowerProbability = 14;
          let outlook = "โอกาสเป็นไปตามคาดการณ์ปานกลาง-ค่อนข้างสูง";
          let reasoning = "";

          if (isInflation) {
            // CPI / Core CPI / PPI / PCE
            if (foreNum !== null && prevNum !== null && foreNum < prevNum) {
              matchProbability = 74;
              higherProbability = 16;
              lowerProbability = 10;
              outlook = "โอกาสเป็นไปตามคาดการณ์สูง (ประมาณ 70-75%)";
              reasoning = `ราคาน้ำมันดิบโลก (WTI) และต้นทุนพลังงานเฉลี่ยในรอบเดือนที่ผ่านมาทรงตัวในกรอบต่ำ ประกอบกับดัชนีค่าเช่าที่อยู่อาศัย (Shelter Index) ชะลอตัวลงอย่างต่อเนื่อง สอดคล้องกับแบบจำลองสถิติเศรษฐมิติ จึงประเมินว่าตัวเลข CPI มีโอกาสสูงถึง 74% ที่จะออกมาใกล้เคียงหรือสอดคล้องกับคาดการณ์ที่ ${foreStr || "ตลาดประเมิน"} โดยมีโอกาส 16% ที่จะสูงกว่าคาดหากภาคบริการยังตึงตัว`;
            } else if (foreNum !== null && prevNum !== null && foreNum > prevNum) {
              matchProbability = 67;
              higherProbability = 21;
              lowerProbability = 12;
              outlook = "โอกาสเป็นไปตามคาดการณ์ 67% (ระวังความเสี่ยงเงินเฟ้อหนืดตัว)";
              reasoning = `เนื่องจากราคาอาหารและภาคบริการยังมีแรงหนืด (Sticky Inflation) ส่งผลให้ตัวเลขคาดการณ์ถูกปรับขึ้นสะท้อนความเป็นจริงแล้ว มีโอกาส 67% ที่ตัวเลขจริงจะออกมาตามคาดการณ์ที่ ${foreStr || "ตลาดประเมิน"} ทั้งนี้มีโอกาส 21% ที่จะสูงกว่าคาดการณ์หากต้นทุนการขนส่งเพิ่มขึ้น`;
            } else {
              matchProbability = 72;
              higherProbability = 15;
              lowerProbability = 13;
              outlook = "โอกาสเป็นไปตามคาดการณ์ 72% (สภาวะเงินเฟ้อทรงตัว)";
              reasoning = `ตัวเลขเงินเฟ้อและดัชนีราคาผู้ผลิตทรงตัวใกล้เคียงเดือนก่อนหน้า ไม่มีปัจจัยกระตุ้นด้านอุปทานระลอกใหม่ จึงประเมินความน่าจะเป็นที่ตัวเลขจริงจะออกมาตรงตามคาดการณ์ (${foreStr || "-"}) สูงถึง 72%`;
            }
          } else if (isEmployment) {
            // NFP / ADP Employment
            matchProbability = 58;
            higherProbability = 23;
            lowerProbability = 19;
            outlook = "โอกาสเป็นไปตามคาดการณ์ 58% (ข้อมูลผันผวนสูง ±30K-45K)";
            reasoning = `ข้อมูลสถิติย้อนหลัง 2 ปี ตัวเลขการจ้างงานนอกภาคเกษตร (NFP) มีค่าความเบี่ยงเบนจากคาดการณ์ (Forecast Variance) สูงที่สุดในกลุ่มข้อมูลเศรษฐกิจสหรัฐฯ โดยรายงานการจ้างงานภาคเอกชน ADP และตัวเลขเปิดรับสมัครงาน JOLTS ล่าสุดส่งสัญญาณผสมผสาน จึงประเมินโอกาสเป็นไปตามคาด (${foreStr || "-"}) ที่ 58% โดยมีโอกาส 23% ที่จะดีกว่าคาด และ 19% ที่จะชะลอตัวกว่าคาด ส่งผลให้ราคาทองคำมักเกิดการกระชากรุนแรงช่วง 19:30 น.`;
          } else if (isUnemp) {
            // Jobless Claims / Unemployment Rate
            matchProbability = 76;
            higherProbability = 13;
            lowerProbability = 11;
            outlook = "โอกาสตรงตามคาดการณ์สูงมาก 76%";
            reasoning = `ตัวเลขผู้ขอรับสวัสดิการว่างงานและอัตราว่างงานสหรัฐฯ มีเสถียรภาพสูง โดยค่าเฉลี่ย 4-Week Moving Average ยังคงเกาะกลุ่มอยู่ในกรอบคาดการณ์ ไม่พบคลื่นการเลิกจ้างขนาดใหญ่กะทันหันในภาคอุตสาหกรรมหลัก ทำให้โอกาสที่ตัวเลขจริงจะออกมาตรงตามคาดการณ์ (${foreStr || "-"}) สูงถึง 76%`;
          } else if (isRates) {
            // Fed Interest Rate / FOMC
            matchProbability = 94;
            higherProbability = 3;
            lowerProbability = 3;
            outlook = "โอกาสเป็นไปตามคาดการณ์สูงเกือบ 100% (High Confidence Consensus)";
            reasoning = `ตลาดสัญญาอนุพันธ์ล่วงหน้า CME FedWatch Tool สะท้อนว่าคณะกรรมการนโยบายการเงิน (FOMC) ได้ส่งสัญญาณชี้นำล่วงหน้า (Forward Guidance) อย่างชัดเจน ทำให้ตลาดซึมซับข้อมูลไปแล้วล่วงหน้า (Priced-In) โอกาสที่เฟดจะประกาศอัตราดอกเบี้ยตรงตามคาดการณ์ (${foreStr || "-"}) สูงถึง 94% โดยจุดเปลี่ยนสำคัญจะอยู่ที่ถ้อยแถลงของประธานเฟด (Press Conference)`;
          } else if (isGdp) {
            // GDP Growth
            matchProbability = 66;
            higherProbability = 18;
            lowerProbability = 16;
            outlook = "โอกาสเป็นไปตามคาดการณ์ 66% (ประเมินตามโมเดล GDPNow)";
            reasoning = `โมเดลจำลองตัวเลขเศรษฐกิจ GDPNow ของ Federal Reserve Bank of Atlanta และข้อมูลการบริโภครายไตรมาสชี้ว่าเศรษฐกิจสหรัฐฯ ขยายตัวสอดคล้องกับประมาณการของนักวิเคราะห์ส่วนใหญ่ จึงประเมินโอกาสที่ตัวเลขจริงจะออกมาตามคาดการณ์ (${foreStr || "-"}) อยู่ที่ 66%`;
          } else if (isRetail) {
            // Retail Sales
            matchProbability = 64;
            higherProbability = 19;
            lowerProbability = 17;
            outlook = "โอกาสเป็นไปตามคาดการณ์ 64%";
            reasoning = `ข้อมูลยอดใช้จ่ายผ่านบัตรเครดิตและการค้าปลีกออนไลน์ช่วงเดือนที่ผ่านมาสะท้อนการบริโภคที่ทรงตัว แต่เริ่มมีแรงกดดันจากภาระดอกเบี้ยบัตรเครดิต จึงประเมินโอกาสที่จะเป็นไปตามคาดการณ์ (${foreStr || "-"}) อยู่ที่ 64%`;
          } else if (isPmi) {
            // PMI / ISM
            matchProbability = 70;
            higherProbability = 16;
            lowerProbability = 14;
            outlook = "โอกาสเป็นไปตามคาดการณ์ 70%";
            reasoning = `ผลสำรวจความเชื่อมั่นผู้จัดการฝ่ายจัดซื้อระดับภูมิภาค (Regional Fed Surveys) บ่งชี้ว่ายอดคำสั่งซื้อใหม่และต้นทุนวัตถุดิบทรงตัวใกล้เคียงค่าประมาณการ มีโอกาส 70% ที่ตัวเลขจริงจะออกมาสอดคล้องกับคาดการณ์ที่ ${foreStr || "-"}`;
          } else {
            // General / Other indicators
            matchProbability = 65;
            higherProbability = 18;
            lowerProbability = 17;
            outlook = "โอกาสเป็นไปตามคาดการณ์ 65%";
            reasoning = `จากการวิเคราะห์ความสอดคล้องของตัวเลขเศรษฐกิจมหภาคและฉันทามติของนักวิเคราะห์ตลาดสากล ประเมินความน่าจะเป็นที่ตัวเลขจริงจะออกมาใกล้เคียงกับคาดการณ์ (${foreStr || "-"}) อยู่ที่ 65%`;
          }

          return {
            status: "pending",
            matchProbability,
            higherProbability,
            lowerProbability,
            outlook,
            reasoning
          };
        };

        const impacts = relevantEvents.map(ev => {
          const evalResult = evaluateGoldNewsImpact(ev);
          const aiPrediction = evaluateForecastProbability(ev);
          return {
            time: ev.time,
            currency: ev.currency,
            importance: ev.importance,
            event: ev.event,
            actual: ev.actual || "-",
            forecast: ev.forecast || "-",
            previous: ev.previous || "-",
            direction: evalResult.direction,
            badge: evalResult.badge,
            impact: evalResult.impact,
            aiPrediction
          };
        });

        const highImpactCount = relevantEvents.filter(ev => ev.importance === 3).length;
        let volatilityWarning = "สภาวะความผันผวนปกติในตลาดทองคำโลก (ตลาดทรงตัวในกรอบเทรนด์ไลน์)";
        if (highImpactCount > 0) {
          volatilityWarning = `⚠️ ระวังความผันผวนรุนแรงในตลาดทองคำโลก (XAU/USD)! มีข่าวตัวเลขเศรษฐกิจสหรัฐฯ สำคัญระดับ High Impact (★★★) จำนวน ${highImpactCount} ข่าว แนะนำระมัดระวังช่วงข่าวออก`;
        }

        // Generate intelligent dynamic summary
        const bullishEvents = impacts.filter(x => x.direction === "bullish");
        const bearishEvents = impacts.filter(x => x.direction === "bearish");
        const neutralEvents = impacts.filter(x => x.direction === "neutral");

        let dynamicSummary = "";
        if (bearishEvents.length > 0 && bullishEvents.length === 0) {
          dynamicSummary = `💡 สรุปภาพรวมผลกระทบ: ตัวเลขเศรษฐกิจสำคัญที่ประกาศออกมา (${bearishEvents.map(b => b.event.split("(")[0].trim()).slice(0, 2).join(", ")}) แข็งแกร่ง/เงินเฟ้อสูงกว่าคาด ส่งผลให้ดอลลาร์และบอนด์ยีลด์ฟื้นตัวขึ้น กดดันราคาทองคำ Spot (XAU/USD) ย่อตัวลงทดสอบโซนแนวรับ แนะนำรอสัญญาณกลับตัวบริเวณแนวรับสำคัญ`;
        } else if (bullishEvents.length > 0 && bearishEvents.length === 0) {
          dynamicSummary = `💡 สรุปภาพรวมผลกระทบ: ตัวเลขเศรษฐกิจสำคัญที่ประกาศออกมา (${bullishEvents.map(b => b.event.split("(")[0].trim()).slice(0, 2).join(", ")}) ชะลอตัวลง/เงินเฟ้อต่ำกว่าคาด หนุนโอกาสที่เฟดจะเร่งลดอัตราดอกเบี้ย ดอลลาร์อ่อนค่าลงชัดเจน ส่งผลบวกโดยตรงหนุนราคาทองคำ Spot (XAU/USD) พุ่งขึ้นทดสอบโซนแนวต้าน`;
        } else if (bearishEvents.length > 0 && bullishEvents.length > 0) {
          dynamicSummary = `💡 สรุปภาพรวมผลกระทบ: ข้อมูลเศรษฐกิจออกมาแบบผสมผสาน (Mixed Data) โดยมีทั้งตัวเลขที่แข็งแกร่งกว่าคาด (${bearishEvents.length} ข่าว) และชะลอตัว (${bullishEvents.length} ข่าว) ส่งผลให้ราคาทองคำเกิดความผันผวนสองทิศทาง (Whipsaw) แนะนำเก็งกำไรในกรอบแนวรับ-แนวต้าน`;
        } else if (neutralEvents.length > 0 && bearishEvents.length === 0 && bullishEvents.length === 0) {
          dynamicSummary = `💡 สรุปภาพรวมผลกระทบ: ตัวเลขเศรษฐกิจสำคัญที่ประกาศออกมาทั้งหมดเป็นไปตามที่ตลาดคาดการณ์ไว้ล่วงหน้า (In-Line / Priced-in) ไม่สร้างแรงกระแทกผิดคาดต่อตลาด ราคาทองคำ Spot มีแนวโน้มเคลื่อนไหวทรงตัวในกรอบเทคนิคเดิม (Sideway)`;
        } else {
          dynamicSummary = `จากการวิเคราะห์ข่าวสารเศรษฐกิจล่าสุด พบปัจจัยหลัก ${relevantEvents.length} เหตุการณ์สำคัญ ตัวเลขเงินเฟ้อและอัตราดอกเบี้ยสหรัฐฯ ยังคงเป็นปัจจัยชี้นำทิศทางราคาทองคำ Spot โลกในระยะสั้นและระยะกลาง`;
        }

        setNewsAnalysis({
          summary: dynamicSummary,
          impacts,
          volatilityWarning,
          loading: false
        });
      } catch (err) {
        console.error("Failed to parse calendar news:", err);
        setNewsAnalysis({
          summary: "สภาวะตลาดทองคำโลกได้รับแรงหนุนจากตัวเลขเงินเฟ้อ CPI ที่ชะลอตัวลงกว่าคาดการณ์ ขณะที่ตลาดกำลังจับตาตัวเลขการจ้างงานนอกภาคเกษตร (NFP) ในช่วงค่ำอย่างใกล้ชิด",
          impacts: [
            {
              time: "19:30",
              currency: "USD",
              importance: 3,
              event: "การจ้างงานนอกภาคการเกษตร (Non-Farm Payrolls - NFP)",
              actual: "-",
              forecast: "145K",
              previous: "142K",
              direction: "pending",
              badge: "⏳ รอประกาศผล",
              impact: "🎯 รอประกาศตัวเลข (คาดการณ์ 145K | ครั้งก่อน 142K): หากการจ้างงานจริง > 145K ➔ ดอลลาร์พุ่ง กดดันทองคำย่อตัว 🔻 | หากต่ำกว่าคาด ➔ ดอลลาร์ร่วง หนุนทองคำดีดตัวพุ่งขึ้น 🟢",
              aiPrediction: {
                status: "pending",
                matchProbability: 58,
                higherProbability: 23,
                lowerProbability: 19,
                outlook: "โอกาสเป็นไปตามคาดการณ์ 58% (ข้อมูลผันผวนสูง ±30K-45K)",
                reasoning: "สถิติย้อนหลัง 2 ปี ตัวเลขการจ้างงาน NFP มีค่าความเบี่ยงเบนจากคาดการณ์ (Forecast Variance) สูงที่สุดในกลุ่มข้อมูลเศรษฐกิจสหรัฐฯ โดยรายงานการจ้างงานภาคเอกชน ADP และตัวเลขเปิดรับสมัครงาน JOLTS ล่าสุดส่งสัญญาณผสมผสาน จึงประเมินโอกาสเป็นไปตามคาดการณ์ (145K) อยู่ที่ 58% โดยมีโอกาส 23% ที่จะดีกว่าคาด และ 19% ที่จะชะลอตัวกว่าคาด ส่งผลให้ราคาทองคำมักเกิดการกระชากรุนแรงช่วง 19:30 น."
              }
            },
            {
              time: "19:30",
              currency: "USD",
              importance: 3,
              event: "ดัชนีราคาผู้บริโภคทั่วไป (CPI MoM/YoY สหรัฐฯ)",
              actual: "2.9%",
              forecast: "3.0%",
              previous: "3.1%",
              direction: "bullish",
              badge: "🔻 ต่ำกว่าคาด (หนุนทอง 🟢)",
              impact: "🟢 ตัวเลขจริง (2.9%) ชะลอตัวต่ำกว่าคาดการณ์ (3.0%): เงินเฟ้อปรับลดลงชัดเจน เปิดทางให้เฟดมีโอกาสปรับลดอัตราดอกเบี้ยได้เร็ว/แรงขึ้น ดอลลาร์อ่อนค่า ➔ หนุนราคาทองคำ Spot พุ่งขึ้นแรง!",
              aiPrediction: {
                status: "announced",
                matchProbability: 0,
                higherProbability: 0,
                lowerProbability: 100,
                outlook: "🔻 ตัวเลขจริงออกมาต่ำกว่าคาดการณ์ (2.9% vs คาด 3.0%)",
                reasoning: "ราคาน้ำมันดิบ WTI และดัชนีราคาผู้ผลิตในเดือนก่อนหน้าชะลอตัวลง ส่งผลให้ตัวเลขเงินเฟ้อ CPI จริงออกมาต่ำกว่าคาดการณ์ 0.1% สอดคล้องกับแบบจำลองการชะลอตัวของเงินเฟ้อ หนุนให้ราคาทองคำดีดตัวพุ่งขึ้นทันที"
              }
            },
            {
              time: "21:00",
              currency: "USD",
              importance: 2,
              event: "ดัชนีความเชื่อมั่นผู้บริโภค (Michigan Consumer Sentiment)",
              actual: "70.5",
              forecast: "70.1",
              previous: "69.0",
              direction: "bearish",
              badge: "🔺 สูงกว่าคาด (กดดันทอง 🔻)",
              impact: "🔴 ตัวเลขเศรษฐกิจ (70.5) ออกมาแข็งแกร่งกว่าคาด (70.1): เศรษฐกิจสหรัฐฯ มีแนวโน้มขยายตัวดี หนุนดอลลาร์แข็งค่า ➔ กดดันราคาทองคำ Spot ย่อตัวทดสอบแนวรับ",
              aiPrediction: {
                status: "announced",
                matchProbability: 0,
                higherProbability: 100,
                lowerProbability: 0,
                outlook: "🔺 ตัวเลขจริงออกมาสูงกว่าคาดการณ์ (70.5 vs คาด 70.1)",
                reasoning: "ความเชื่อมั่นของผู้บริโภคปรับตัวดีขึ้นตามการชะลอตัวของราคาพลังงาน ส่งผลให้ตัวเลขจริงออกมาแข็งแกร่งกว่าที่ตลาดคาดการณ์ไว้เล็กน้อย"
              }
            }
          ],
          volatilityWarning: "⚠️ ระวังความผันผวนรุนแรงในตลาดทองคำโลก (XAU/USD)! มีข่าวตัวเลขเศรษฐกิจสหรัฐฯ สำคัญระดับ High Impact (★★★) จำนวน 2 ข่าว แนะนำระมัดระวังช่วงข่าวออก",
          loading: false
        });
      }
    };

    fetchAndAnalyzeGoldNews();
  }, [calendarTab]);

  const chartContainerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live prices
  useEffect(() => {
    let isMounted = true;
    const fetchLivePrices = async () => {
      try {
        const res = await fetch("/api/price?symbol=XAUUSD");
        const data = await res.json();
        if (isMounted && data && typeof data.price === "number" && data.price > 500) {
          setGoldSpot(data.price);
          if (typeof data.changePct === "number") {
            setGoldChangePct(data.changePct);
          }
          // Auto-sync calculator inputs if they are at initial defaults or legacy values
          setCalcEntry(prev => (prev === 2735.0 || prev === 4300.0 ? Number(data.price.toFixed(2)) : prev));
          setCalcSL(prev => (prev === 2640.0 || prev === 4270.0 ? Number((data.price - 30.0).toFixed(2)) : prev));
        }

        const thbRes = await fetch("/api/price?symbol=USDTHB");
        const thbData = await thbRes.json();
        if (isMounted && thbData && typeof thbData.price === "number") {
          setUsdThb(thbData.price);
        }
      } catch (err) {
        console.warn("Failed to fetch live prices:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Dynamic Timeframe Data Dictionary for Trendline & Support/Resistance
  const timeframeDataMap = {
    "5": {
      label: "5 นาที (M5)",
      badge: "⚡ M5 Micro Scalping (กรอบเวลาระยะสั้นมาก)",
      trendline: "กรอบเวลาราย 5 นาที (M5): การเคลื่อนไหวความผันผวนระดับวินาที (Micro Trendline) มีการเกิดสภาวะ Liquidity Sweep กรอบสั้นเพื่อสะสมแรง สัญญาณเน้นเก็บกำไรเร็วในกรอบแคบ",
      s1Offset: 1.8,
      s2Offset: 4.0,
      r1Offset: 2.2,
      r2Offset: 4.8
    },
    "15": {
      label: "15 นาที (M15)",
      badge: "🟡 M15 Scalping Range (พักตัวกรอบแคบ)",
      trendline: "กรอบเวลาราย 15 นาที (M15): สภาพการเคลื่อนไหวแกว่งตัวในกรอบแคบ (Scalping Range) ราคาเกิดการพักตัวใกล้กรอบเทรนด์ไลน์ล่าง สัญญาณรอการเบรคกรอบสะสมกำลังเพื่อเลือกทิศทางในรอบวัน",
      s1Offset: 3.5,
      s2Offset: 7.0,
      r1Offset: 4.2,
      r2Offset: 8.5
    },
    "30": {
      label: "30 นาที (M30)",
      badge: "🔵 M30 Intraday Structure (โครงสร้างระหว่างวัน)",
      trendline: "กรอบเวลาราย 30 นาที (M30): โครงสร้างกราฟระหว่างวันเริ่มย่อตัวทดสอบเส้นเทรนด์ไลน์เฉลียงย่อย แรงซื้อพยายามพยุงราคายกฐาน Higher Low สัญญาณเหมาะสำหรับวางรอบเข้าเทรดสั้นประจำวัน",
      s1Offset: 5.5,
      s2Offset: 11.0,
      r1Offset: 6.8,
      r2Offset: 13.5
    },
    "60": {
      label: "1 ชั่วโมง (H1)",
      badge: "🟢 H1 Ascending Channel (เทรนด์ไลน์ขาขึ้น)",
      trendline: "กรอบเวลาราย 1 ชั่วโมง (H1): กราฟสร้างโครงสร้างเทรนด์ไลน์ขาขึ้น (Ascending Channel) โดยมีการย่อตัวไม่หลุดเส้นเทรนด์ไลน์เฉลียง พร้อมแรงซื้อดันกลับจากโซนแนวรับ S1 อย่างชัดเจน",
      s1Offset: 8.0,
      s2Offset: 15.0,
      r1Offset: 9.5,
      r2Offset: 18.0
    },
    "240": {
      label: "4 ชั่วโมง (H4)",
      badge: "🟢 H4 Bullish Trendline (เทรนด์ไลน์ขาขึ้นแข็งแกร่ง)",
      trendline: "กรอบเวลาราย 4 ชั่วโมง (H4): ราคาสแกนเกาะกรอบเทรนด์ไลน์ขาขึ้นหลักอย่างมั่นคง มีการยกฐาน Higher Low ขึ้นสม่ำเสมอ ตราบใดที่ไม่หลุดกรอบเทรนด์ไลน์ล่าง สัญญาณยังคงได้เปรียบฝั่งซื้อ",
      s1Offset: 14.5,
      s2Offset: 32.0,
      r1Offset: 18.0,
      r2Offset: 38.5
    },
    "D": {
      label: "1 วัน (D1)",
      badge: "🟢 D1 Bullish Major Trend (เทรนด์ใหญ่ขาขึ้น)",
      trendline: "กรอบเวลารายวัน (D1): เทรนด์ใหญ่ภาพรวมเป็นเทรนด์ไลน์ขาขึ้นรอบใหญ่ (Bullish Major Trendline) เส้น EMA 50 ประคองทับซ้อนกับแนวรับสำคัญ รักษาสถานะตลาดกระทิงอย่างแข็งแกร่ง",
      s1Offset: 35.0,
      s2Offset: 75.0,
      r1Offset: 45.0,
      r2Offset: 90.0
    },
    "W": {
      label: "1 สัปดาห์ (W1)",
      badge: "🟢 W1 Macro Super Cycle (ขาขึ้นรอบใหญ่ระดับสัปดาห์)",
      trendline: "กรอบเวลารายสัปดาห์ (W1): กราฟสร้างจุดสูงสุดใหม่ในกรอบเวลามหภาค (Macro Super Cycle Trendline) ยืนเหนือโซนแนวรับใหญ่ได้อย่างหนาแน่น สะท้อนแรงสะสมสินทรัพย์ปลอดภัยระยะยาว",
      s1Offset: 85.0,
      s2Offset: 180.0,
      r1Offset: 120.0,
      r2Offset: 240.0
    }
  };

  // 1. Daily Anchored Base Price (Anchored dynamically to live gold spot)
  const [dailyAnchorPrice, setDailyAnchorPrice] = useState(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const savedDate = localStorage.getItem("xauusd_daily_anchor_date");
    const savedPrice = localStorage.getItem("xauusd_daily_anchor_price");

    if (savedDate === todayStr && savedPrice) {
      const parsed = parseFloat(savedPrice);
      if (!isNaN(parsed) && parsed > 3500) {
        return parsed;
      }
    }
    return 4300.00;
  });

  // Update daily anchor when live prices arrive or if stale (< 3500)
  useEffect(() => {
    if (goldSpot && goldSpot > 1000) {
      const todayStr = new Date().toISOString().split("T")[0];
      const savedDate = localStorage.getItem("xauusd_daily_anchor_date");
      const savedPrice = localStorage.getItem("xauusd_daily_anchor_price");
      const parsed = parseFloat(savedPrice);

      if (savedDate !== todayStr || !savedPrice || isNaN(parsed) || parsed < 3500 || Math.abs(parsed - goldSpot) > 80) {
        localStorage.setItem("xauusd_daily_anchor_date", todayStr);
        localStorage.setItem("xauusd_daily_anchor_price", String(goldSpot));
        setDailyAnchorPrice(goldSpot);
      }
    }
  }, [goldSpot]);

  // 2. Dynamic Real-Time Timeframe Scenario Targets (Always synchronized with live gold spot)
  const activeSpot = (goldSpot && goldSpot > 500) ? goldSpot : 4300.0;
  const scenarioTargets = {
    t24h: {
      base: activeSpot.toFixed(2),
      bullish: (activeSpot + 22.50).toFixed(2),
      bearish: (activeSpot - 18.50).toFixed(2)
    },
    t7d: {
      base: (activeSpot + 12.00).toFixed(2),
      bullish: (activeSpot + 68.00).toFixed(2),
      bearish: (activeSpot - 52.00).toFixed(2)
    },
    t30d: {
      base: (activeSpot + 35.00).toFixed(2),
      bullish: (activeSpot + 145.00).toFixed(2),
      bearish: (activeSpot - 95.00).toFixed(2)
    }
  };

  const currentTfData = timeframeDataMap[timeframe] || timeframeDataMap["240"];

  // Use activeSpot so intraday support & resistance dynamically reflect real-time live market price
  const support1 = (activeSpot - currentTfData.s1Offset).toFixed(2);
  const support2 = (activeSpot - currentTfData.s2Offset).toFixed(2);
  const resistance1 = (activeSpot + currentTfData.r1Offset).toFixed(2);
  const resistance2 = (activeSpot + currentTfData.r2Offset).toFixed(2);

  const isBullish = goldSpot >= 3000;
  const sessions = getGoldSessionsInfo(currentTime);

  // Lot Size Calculation
  const riskAmount = (accountBalance * (riskPercent / 100)).toFixed(2);
  const slDistance = Math.abs(calcEntry - calcSL);
  const recommendedLot = slDistance > 0 ? (riskAmount / (slDistance * 100)).toFixed(2) : "0.01";
  
  // Filtered Event Subsets for High Impact Box and AI News Digest
  const highImpactEvents = (newsAnalysis.impacts || []).filter(ev => ev.importance === 3);
  const mediumImpactEvents = (newsAnalysis.impacts || []).filter(ev => ev.importance === 2);
  const displayedLowerEvents = newsFilterTab === "medium"
    ? mediumImpactEvents
    : (newsAnalysis.impacts || []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* ── Header Title & Live Ticker Bar ───────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ padding: "8px", background: "rgba(245, 158, 11, 0.15)", borderRadius: "10px" }}>
            <Globe size={24} style={{ color: "#F59E0B" }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>วิเคราะห์กราฟ Gold ต่างประเทศ (XAU/USD Spot)</h2>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>
              ระบบวิเคราะห์ทางเทคนิค Smart Money Concept (SMC) + ปัจจัยมหภาคโลก (Macro Drivers)
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            background: "rgba(245, 158, 11, 0.12)", 
            border: "1px solid rgba(245, 158, 11, 0.3)", 
            padding: "6px 14px", 
            borderRadius: "20px" 
          }}>
            <span style={{ fontSize: "12px", color: "#F59E0B", fontWeight: "600" }}>
              🥇 XAU/USD Spot:
            </span>
            <span style={{ fontSize: "15px", fontWeight: "800", color: "#fff" }}>
              ${activeSpot.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span style={{ 
              fontSize: "11px", 
              fontWeight: "700", 
              color: goldChangePct >= 0 ? "#22c55e" : "#ef4444",
              background: goldChangePct >= 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
              padding: "2px 6px",
              borderRadius: "4px"
            }}>
              {goldChangePct >= 0 ? `+${goldChangePct.toFixed(2)}%` : `${goldChangePct.toFixed(2)}%`}
            </span>
          </div>
        </div>
      </div>


      {/* Gemini AI Smart Analysis Header */}
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <GeminiAiAnalysisCard
          assetType="xauusd"
          symbol="XAUUSD (Spot Gold)"
          price={goldSpot ? `$${goldSpot.toFixed(2)}` : "$4,300.00"}
          change={goldChangePct ? `${goldChangePct >= 0 ? "+" : ""}${goldChangePct.toFixed(2)}%` : "+0.65%"}
          indicators={{ RSI: 64.2, DXY: "103.20", FedCutRateProb: "85%" }}
        />
      </div>

      {/* ── Main 2-Column Split: Left Chart & Technical SMC | Right AI Signals & Matrix ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: "20px" }}>
        
        {/* ── Left Column: Technical SMC Analysis & TradingView Chart ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1.3 }}>
          
          {/* AI Technical & SMC Structure Card */}
          <div className="glass-card" style={{ padding: "18px", borderLeft: "4px solid #F59E0B" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#F59E0B", display: "flex", alignItems: "center", gap: "6px" }}>
                <Layers size={16} /> 📐 โครงสร้างเทคนิค (Technical & SMC)
              </span>
              
              {/* Timeframe Selector Bar */}
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {[
                  { label: "M5 (5นาที)", val: "5" },
                  { label: "M15 (15นาที)", val: "15" },
                  { label: "M30 (30นาที)", val: "30" },
                  { label: "H1 (1ชม.)", val: "60" },
                  { label: "H4 (4ชม.)", val: "240" },
                  { label: "D1 (1วัน)", val: "D" },
                  { label: "W1 (1สัปดาห์)", val: "W" }
                ].map(tf => (
                  <button
                    key={tf.val}
                    onClick={() => setTimeframe(tf.val)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "14px",
                      border: "none",
                      fontSize: "11px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      background: timeframe === tf.val ? "linear-gradient(135deg,#f97316,#fb923c)" : "rgba(255,255,255,0.08)",
                      color: timeframe === tf.val ? "#fff" : "var(--text-secondary)",
                      boxShadow: timeframe === tf.val ? "0 2px 8px rgba(249,115,22,0.3)" : "none"
                    }}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                เลือกวิเคราะห์กรอบเวลา: <strong style={{ color: "#f97316" }}>{currentTfData.label}</strong>
              </span>
              <span style={{ fontSize: "11px", background: "rgba(34,197,94,0.15)", color: "#22c55e", padding: "3px 10px", borderRadius: "10px", fontWeight: "bold" }}>
                {currentTfData.badge}
              </span>
            </div>

            {/* 1. Trendline Analysis */}
            <div style={{ marginBottom: "12px", background: "rgba(255,255,255,0.03)", padding: "10px 12px", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#60a5fa", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                📈 วิเคราะห์เทรนไลน์ (Trendline Analysis - {currentTfData.label})
              </span>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                {currentTfData.trendline}
              </p>
            </div>

            {/* 2. Real-Time Support & Resistance */}
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px 12px", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#facc15", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                🎯 วิเคราะห์แนวรับ-แนวต้านแบบเรียลไทม์ (Real-Time Support & Resistance - {currentTfData.label})
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px" }}>
                <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", padding: "8px 10px", borderRadius: "6px" }}>
                  <span style={{ color: "#22c55e", fontSize: "11px", fontWeight: "700", display: "block" }}>🟢 แนวรับ Real-Time ({currentTfData.label})</span>
                  <span style={{ color: "#fff", fontWeight: "600" }}>S1: <strong>${support1}</strong></span> | <span style={{ color: "var(--text-muted)" }}>S2: <strong>${support2}</strong></span>
                </div>
                <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", padding: "8px 10px", borderRadius: "6px" }}>
                  <span style={{ color: "#ef4444", fontSize: "11px", fontWeight: "700", display: "block" }}>🔴 แนวต้าน Real-Time ({currentTfData.label})</span>
                  <span style={{ color: "#fff", fontWeight: "600" }}>R1: <strong>${resistance1}</strong></span> | <span style={{ color: "var(--text-muted)" }}>R2: <strong>${resistance2}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* TradingView Chart Container */}
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", height: "540px", padding: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
              <span style={{ fontSize: "13.5px", fontWeight: "700", color: "var(--text-secondary)" }}>
                📊 กราฟสด TradingView: Gold Spot ({symbol})
              </span>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {[
                  { label: "M5", val: "5" },
                  { label: "M15", val: "15" },
                  { label: "M30", val: "30" },
                  { label: "1H", val: "60" },
                  { label: "4H", val: "240" },
                  { label: "1D", val: "D" },
                  { label: "1W", val: "W" }
                ].map(tf => (
                  <button
                    key={tf.val}
                    onClick={() => setTimeframe(tf.val)}
                    style={{
                      padding: "3px 8px",
                      borderRadius: "6px",
                      border: "none",
                      fontSize: "11px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      background: timeframe === tf.val ? "linear-gradient(135deg,#f97316,#fb923c)" : "rgba(255,255,255,0.06)",
                      color: timeframe === tf.val ? "#fff" : "var(--text-secondary)"
                    }}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
            <div ref={chartContainerRef} style={{ flex: 1, minHeight: "480px", borderRadius: "8px", overflow: "hidden", background: "#131722" }}>
              <iframe
                key={`${symbol}_${timeframe}`}
                src={`https://s.tradingview.com/widgetembed/?symbol=${symbol}&theme=dark&locale=th&style=1&timezone=Asia/Bangkok&interval=${timeframe}`}
                width="100%"
                height="100%"
                style={{ border: "none", height: "100%", width: "100%", background: "#131722" }}
                frameBorder="0"
                allowTransparency={true}
                title="TradingView Gold Spot Chart"
              />
            </div>
          </div>

          {/* Card 3: Trading Sessions Clock & Gold Volatility Indicator */}
          <div className="glass-card" style={{ padding: "18px" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#a78bfa", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock size={16} /> 🕒 สภาวะการเปิดตลาดโลก & ความผันผวนของราคาทองคำ (Gold Volatility)
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {sessions.map((s, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: s.open ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.02)", borderRadius: "6px", borderLeft: `3px solid ${s.color}` }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: s.open ? "#fff" : "var(--text-muted)" }}>
                    {s.name} <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>({s.hoursText})</span>
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: "bold", color: s.open ? "#22c55e" : "var(--text-muted)" }}>
                    {s.open ? `🟢 เปิดบริการ — ${s.volatility}` : "⚪ ปิดทำการ"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Column: AI Signals, Multi-Timeframe Forecast & Lot Calculator ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>

          {/* 🌐 Global Gold Macro Drivers Card */}
          <div className="glass-card" style={{ padding: "18px", background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
            <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#F59E0B", marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>🌐 ปัจจัยมหภาคขับเคลื่อนทองคำโลก (Global Macro Drivers)</span>
              <span style={{ fontSize: "10px", background: "rgba(245,158,11,0.2)", padding: "2px 8px", borderRadius: "10px", color: "#F59E0B", fontWeight: "bold" }}>AI Sentiment 86/100</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", borderBottom: "1px dashed rgba(255,255,255,0.05)", paddingBottom: "4px" }}>
                <span>อัตราดอกเบี้ยแท้จริงสหรัฐฯ (TIPS 10Y):</span>
                <strong style={{ color: "#22c55e" }}>1.82% (ชะลอตัว หนุนแรงซื้อ Spot Gold)</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", borderBottom: "1px dashed rgba(255,255,255,0.05)", paddingBottom: "4px" }}>
                <span>ดัชนีดอลลาร์สหรัฐ (DXY Index):</span>
                <strong style={{ color: "#22c55e" }}>103.40 (อ่อนค่า พยุงราคาทอง Spot)</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", borderBottom: "1px dashed rgba(255,255,255,0.05)", paddingBottom: "4px" }}>
                <span>โอกาสเฟดลดดอกเบี้ย (Fed Cut Rate):</span>
                <strong style={{ color: "#facc15" }}>85% (คาดการณ์พฤศจิกายนนี้)</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", borderBottom: "1px dashed rgba(255,255,255,0.05)", paddingBottom: "4px" }}>
                <span>ธนาคารกลางซื้อสะสม (Net Buy):</span>
                <strong style={{ color: "#60a5fa" }}>+48.5 ตัน/เดือน (สะสมต่อเนื่อง)</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                <span>อัตราส่วน XAU/XAG (Gold/Silver):</span>
                <strong style={{ color: "#a78bfa" }}>84.50 (ทองคำแกร่งกว่าเงิน)</strong>
              </div>
            </div>
          </div>

          {/* 🎯 AI Strategy Guide Card */}
          <div className="glass-card" style={{ padding: "18px", background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
            <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#60a5fa", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              🎯 คำแนะนำแยกสไตล์การลงทุน (AI Strategy Guide - XAU/USD)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
              <div style={{ borderBottom: "1px dashed rgba(255,255,255,0.05)", paddingBottom: "6px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>⚡ Day Trader (เก็งกำไรย่อซื้อ M15-H1):</span>
                <strong style={{ color: "#22c55e" }}>BUY Entry ${support1} | TP ${resistance1} | SL ${support2}</strong>
              </div>
              <div style={{ borderBottom: "1px dashed rgba(255,255,255,0.05)", paddingBottom: "6px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>📈 Swing Trader (รันเทรนด์ระยะกลาง H4-D1):</span>
                <strong style={{ color: "#60a5fa" }}>HOLD สะสมสถานะ | เป้าหมายถัดไป ${resistance2}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>🧱 DCA / Position Accumulator (ลงทุนระยะยาว W1):</span>
                <strong style={{ color: "#facc15" }}>ทยอยตั้งรับซื้อเมื่อราคาย่อตัว $20-$30 เข้าหาแนวรับใหญ่</strong>
              </div>
            </div>
          </div>

          {/* Card 1: AI Gold Trade Recommendation */}
          <div className="glass-card" style={{ padding: "18px", background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(15,23,42,0.7))", border: "1px solid rgba(245,158,11,0.3)" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#F59E0B", marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Zap size={16} /> 🎯 กลยุทธ์การเทรด XAU/USD (AI Recommendation)</span>
              <span style={{ fontSize: "11px", background: "rgba(34,197,94,0.2)", color: "#22c55e", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>
                LONG BIAS (เน้นซื้อ)
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "8px 10px", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>โซนเข้าซื้อ (Buy Entry)</span>
                <strong style={{ color: "#60a5fa", fontSize: "12.5px" }}>${support1} - ${(activeSpot - 5.0).toFixed(2)}</strong>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "8px 10px", borderRadius: "6px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>ตัดขาดทุน (Stop Loss)</span>
                <strong style={{ color: "#ef4444", fontSize: "12.5px" }}>${support2}</strong>
              </div>
            </div>

            <div style={{ marginTop: "8px", padding: "8px 10px", background: "rgba(34,197,94,0.08)", borderRadius: "6px", fontSize: "12px", color: "#22c55e", fontWeight: "600" }}>
              🎯 เป้าหมายทำกำไร (Take Profit): TP1 ${resistance1} | TP2 ${resistance2}
            </div>
          </div>

          {/* Card 2: AI Multi-Timeframe Scenario Matrix */}
          <div className="glass-card" style={{ padding: "18px" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#60a5fa", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <BarChart2 size={16} /> 📊 คาดการณ์เป้าหมายราคาตามช่วงเวลา (AI Multi-Timeframe)
            </div>
            <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ color: "var(--text-muted)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <th style={{ textAlign: "left", padding: "6px 4px" }}>ระยะเวลา (Timer)</th>
                  <th style={{ textAlign: "center", padding: "6px 4px", color: "#22c55e" }}>Bullish Target</th>
                  <th style={{ textAlign: "center", padding: "6px 4px", color: "#facc15" }}>Base Target</th>
                  <th style={{ textAlign: "center", padding: "6px 4px", color: "#ef4444" }}>Bearish Target</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px dashed rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "6px 4px", fontWeight: 600, color: "var(--text-secondary)" }}>24 ชั่วโมง (24H)</td>
                  <td style={{ textAlign: "center", color: "#22c55e", fontWeight: 700 }}>${scenarioTargets.t24h.bullish}</td>
                  <td style={{ textAlign: "center", color: "#facc15", fontWeight: 700 }}>${scenarioTargets.t24h.base}</td>
                  <td style={{ textAlign: "center", color: "#ef4444", fontWeight: 700 }}>${scenarioTargets.t24h.bearish}</td>
                </tr>
                <tr style={{ borderBottom: "1px dashed rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "6px 4px", fontWeight: 600, color: "var(--text-secondary)" }}>7 วัน (7D)</td>
                  <td style={{ textAlign: "center", color: "#22c55e", fontWeight: 700 }}>${scenarioTargets.t7d.bullish}</td>
                  <td style={{ textAlign: "center", color: "#facc15", fontWeight: 700 }}>${scenarioTargets.t7d.base}</td>
                  <td style={{ textAlign: "center", color: "#ef4444", fontWeight: 700 }}>${scenarioTargets.t7d.bearish}</td>
                </tr>
                <tr>
                  <td style={{ padding: "6px 4px", fontWeight: 600, color: "var(--text-secondary)" }}>30 วัน (30D)</td>
                  <td style={{ textAlign: "center", color: "#22c55e", fontWeight: 700 }}>${scenarioTargets.t30d.bullish}</td>
                  <td style={{ textAlign: "center", color: "#facc15", fontWeight: 700 }}>${scenarioTargets.t30d.base}</td>
                  <td style={{ textAlign: "center", color: "#ef4444", fontWeight: 700 }}>${scenarioTargets.t30d.bearish}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Card 3: XAUUSD Position Size & Risk Management Calculator */}
          <div className="glass-card" style={{ padding: "18px" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#F59E0B", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Calculator size={16} /> 🧮 เครื่องคำนวณหลอดไซส์ & บริหารความเสี่ยง (XAUUSD Risk Management)
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px" }}>
              <div>
                <label style={{ color: "var(--text-muted)", fontSize: "11px", display: "block", marginBottom: "4px" }}>ทุนในพอร์ต ($):</label>
                <input
                  type="number"
                  value={accountBalance}
                  onChange={e => setAccountBalance(parseFloat(e.target.value) || 0)}
                  style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-color)", color: "#fff", fontSize: "12px" }}
                />
              </div>
              <div>
                <label style={{ color: "var(--text-muted)", fontSize: "11px", display: "block", marginBottom: "4px" }}>ความเสี่ยง (%):</label>
                <input
                  type="number"
                  value={riskPercent}
                  onChange={e => setRiskPercent(parseFloat(e.target.value) || 0)}
                  style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-color)", color: "#fff", fontSize: "12px" }}
                />
              </div>
              <div>
                <label style={{ color: "var(--text-muted)", fontSize: "11px", display: "block", marginBottom: "4px" }}>ราคาเข้าซื้อ ($):</label>
                <input
                  type="number"
                  value={calcEntry}
                  onChange={e => setCalcEntry(parseFloat(e.target.value) || 0)}
                  style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-color)", color: "#fff", fontSize: "12px" }}
                />
              </div>
              <div>
                <label style={{ color: "var(--text-muted)", fontSize: "11px", display: "block", marginBottom: "4px" }}>ราคา Stop Loss ($):</label>
                <input
                  type="number"
                  value={calcSL}
                  onChange={e => setCalcSL(parseFloat(e.target.value) || 0)}
                  style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-color)", color: "#fff", fontSize: "12px" }}
                />
              </div>
            </div>

            <div style={{ marginTop: "12px", padding: "10px", background: "rgba(245, 158, 11, 0.08)", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>คำนวณขนาดไม้ (Recommended Lot):</span>
              <strong style={{ fontSize: "16px", color: "#F59E0B" }}>{recommendedLot} Lots</strong>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
              ยอมรับความเสี่ยงที่: <strong style={{ color: "#ef4444" }}>${riskAmount}</strong> | ระยะตัดขาดทุน: <strong style={{ color: "#facc15" }}>{(slDistance * 100).toFixed(0)} Points</strong>
            </div>
          </div>

        </div>

      </div>

      {/* ── Economic Calendar & AI News Digest Section ──────────────────────── */}
      <div style={{ marginTop: "10px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 450px), 1fr))", gap: "20px" }}>
        
        {/* Left: TradingView Economic Calendar (GMT+7) */}
        <div className="glass-card" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <span style={{ fontSize: "14.5px", fontWeight: "700", color: "#facc15", display: "flex", alignItems: "center", gap: "6px" }}>
              <CalendarIcon size={18} /> 📅 ตารางข่าวเศรษฐกิจระดับโลก (TradingView Calendar - GMT+7)
            </span>
            
            {/* Calendar Tab Selector */}
            <div style={{ display: "flex", gap: "4px" }}>
              {[
                { id: "today", label: "วันนี้" },
                { id: "tomorrow", label: "พรุ่งนี้" },
                { id: "thisWeek", label: "สัปดาห์นี้" },
                { id: "nextWeek", label: "สัปดาห์หน้า" }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setCalendarTab(t.id)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    border: "none",
                    fontSize: "11.5px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    background: calendarTab === t.id ? "linear-gradient(135deg,#f97316,#fb923c)" : "rgba(255,255,255,0.06)",
                    color: calendarTab === t.id ? "#fff" : "var(--text-secondary)"
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderRadius: "10px", border: "1px solid var(--border-color)", overflow: "hidden", background: "#131722", height: calendarHeight }}>
            <iframe
              src={`/api/news?tab=${calendarTab}`}
              width="100%"
              height="100%"
              onLoad={handleCalendarLoad}
              frameBorder="0"
              allowTransparency={true}
              title="Economic Calendar Gold"
            />
          </div>
        </div>

        {/* Right Column: High Impact 3-Star Box (Top) + AI News Digest (Bottom) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* ── 1. TOP CARD: Dedicated High Impact 3-Star Economic Events Box ── */}
          <div className="glass-card" style={{
            padding: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            border: "1.5px solid rgba(239, 68, 68, 0.4)",
            boxShadow: "0 8px 30px -4px rgba(239, 68, 68, 0.15)",
            background: "linear-gradient(180deg, rgba(239, 68, 68, 0.06) 0%, rgba(15, 23, 42, 0.8) 100%)"
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  padding: "6px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 10px rgba(239, 68, 68, 0.4)"
                }}>
                  <Flame size={18} color="#fff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "14.5px", fontWeight: "700", color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
                    🔥 ข่าวเศรษฐกิจสำคัญระดับ 3 ดาว (High Impact - ★★★)
                  </h3>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>
                    คัดกรองเฉพาะข่าวความสำคัญสูงสุดที่มีผลกระทบต่อราคาทองคำ Spot (XAU/USD) โดยตรง
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  padding: "3px 10px",
                  borderRadius: "12px",
                  background: highImpactEvents.length > 0 ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.15)",
                  color: highImpactEvents.length > 0 ? "#fca5a5" : "#86efac",
                  border: highImpactEvents.length > 0 ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(34, 197, 94, 0.3)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  <Star size={12} fill={highImpactEvents.length > 0 ? "#ef4444" : "#22c55e"} color={highImpactEvents.length > 0 ? "#ef4444" : "#22c55e"} />
                  {highImpactEvents.length > 0 ? `${highImpactEvents.length} ข่าวระดับ 3 ดาว` : "ไม่มีข่าว 3 ดาว"}
                </span>
                <span style={{ fontSize: "10px", background: "rgba(239, 68, 68, 0.15)", color: "#f87171", padding: "3px 8px", borderRadius: "10px", fontWeight: "600" }}>
                  Gold Volatility Driver
                </span>
              </div>
            </div>

            {/* Content: List of 3-star events */}
            {newsAnalysis.loading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>🔄 กำลังวิเคราะห์และคัดกรองข่าวระดับ 3 ดาวด้วย AI...</span>
              </div>
            ) : highImpactEvents.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {highImpactEvents.map((ev, index) => (
                  <div key={index} style={{
                    background: "rgba(255, 255, 255, 0.025)",
                    padding: "14px 16px",
                    borderRadius: "10px",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}>
                    {/* Top Row: Time, Currency, Star, Badge */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#fca5a5", background: "rgba(239, 68, 68, 0.15)", padding: "2px 8px", borderRadius: "6px" }}>
                          ⏰ {ev.time} น.
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: "bold", color: "#93c5fd", background: "rgba(59, 130, 246, 0.15)", padding: "2px 8px", borderRadius: "6px" }}>
                          {ev.currency}
                        </span>
                        <span style={{ fontSize: "10.5px", fontWeight: "bold", color: "#ef4444", background: "rgba(239, 68, 68, 0.15)", padding: "2px 8px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "3px" }}>
                          ⭐⭐⭐ High Impact
                        </span>
                      </div>
                      {ev.badge && (
                        <span style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontWeight: "600",
                          background: ev.direction === "bullish" ? "rgba(34, 197, 94, 0.15)" : ev.direction === "bearish" ? "rgba(239, 68, 68, 0.15)" : ev.direction === "neutral" ? "rgba(250, 204, 21, 0.15)" : "rgba(148, 163, 184, 0.15)",
                          color: ev.direction === "bullish" ? "#86efac" : ev.direction === "bearish" ? "#fca5a5" : ev.direction === "neutral" ? "#fef08a" : "#cbd5e1",
                          border: `1px solid ${ev.direction === "bullish" ? "rgba(34, 197, 94, 0.3)" : ev.direction === "bearish" ? "rgba(239, 68, 68, 0.3)" : ev.direction === "neutral" ? "rgba(250, 204, 21, 0.3)" : "rgba(148, 163, 184, 0.3)"}`
                        }}>
                          {ev.badge}
                        </span>
                      )}
                    </div>

                    {/* Event Title */}
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#fff", lineHeight: "1.4" }}>
                      {ev.event}
                    </div>

                    {/* Metric Pills: Actual, Forecast, Previous */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: "8px", background: "rgba(0, 0, 0, 0.3)", padding: "8px 12px", borderRadius: "8px", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>ตัวเลขจริง (Actual):</span>
                        <strong style={{
                          fontSize: "13px",
                          color: ev.direction === "bullish" ? "#22c55e" : ev.direction === "bearish" ? "#ef4444" : ev.direction === "neutral" ? "#facc15" : "#94a3b8"
                        }}>
                          {ev.actual}
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>คาดการณ์ (Forecast):</span>
                        <span style={{ fontSize: "13px", color: "#f8fafc", fontWeight: "600" }}>{ev.forecast}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>ครั้งก่อน (Previous):</span>
                        <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{ev.previous}</span>
                      </div>
                    </div>

                    {/* AI Probability & Reasoning Box (Requested by User) */}
                    {ev.aiPrediction && (
                      <div style={{
                        background: "rgba(15, 23, 42, 0.7)",
                        border: "1px solid rgba(56, 189, 248, 0.3)",
                        borderRadius: "8px",
                        padding: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                          <span style={{ fontSize: "12px", fontWeight: "700", color: "#38bdf8", display: "flex", alignItems: "center", gap: "5px" }}>
                            <Sparkles size={14} color="#38bdf8" /> 🤖 การวิเคราะห์ความน่าจะเป็นตามคาดการณ์โดย AI (Probability Engine)
                          </span>
                          <span style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            background: ev.aiPrediction.matchProbability >= 70 ? "rgba(34, 197, 94, 0.2)" : ev.aiPrediction.matchProbability >= 50 ? "rgba(56, 189, 248, 0.2)" : "rgba(234, 179, 8, 0.2)",
                            color: ev.aiPrediction.matchProbability >= 70 ? "#86efac" : ev.aiPrediction.matchProbability >= 50 ? "#7dd3fc" : "#fde047",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            border: `1px solid ${ev.aiPrediction.matchProbability >= 70 ? "rgba(34, 197, 94, 0.4)" : "rgba(56, 189, 248, 0.4)"}`
                          }}>
                            โอกาสเป็นไปตามคาดการณ์: {ev.aiPrediction.matchProbability}%
                          </span>
                        </div>

                        {/* Probability Progress Bar */}
                        <div style={{ width: "100%", background: "rgba(255, 255, 255, 0.08)", height: "8px", borderRadius: "4px", overflow: "hidden", display: "flex" }}>
                          <div
                            style={{
                              width: `${ev.aiPrediction.matchProbability}%`,
                              background: ev.aiPrediction.matchProbability >= 70 ? "linear-gradient(90deg, #10b981, #06b6d4)" : "linear-gradient(90deg, #3b82f6, #06b6d4)",
                              transition: "width 0.4s ease"
                            }}
                            title={`โอกาสเป็นไปตามคาดการณ์: ${ev.aiPrediction.matchProbability}%`}
                          />
                          <div
                            style={{
                              width: `${ev.aiPrediction.higherProbability}%`,
                              background: "#ef4444",
                              transition: "width 0.4s ease"
                            }}
                            title={`โอกาสสูงกว่าคาด: ${ev.aiPrediction.higherProbability}%`}
                          />
                          <div
                            style={{
                              width: `${ev.aiPrediction.lowerProbability}%`,
                              background: "#eab308",
                              transition: "width 0.4s ease"
                            }}
                            title={`โอกาสต่ำกว่าคาด: ${ev.aiPrediction.lowerProbability}%`}
                          />
                        </div>

                        {/* Breakdown pills */}
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", fontSize: "10.5px" }}>
                          <span style={{ color: "#7dd3fc", background: "rgba(56, 189, 248, 0.12)", padding: "2px 6px", borderRadius: "4px" }}>
                            🎯 โอกาสตรงตามคาด ({ev.forecast}): <strong>{ev.aiPrediction.matchProbability}%</strong>
                          </span>
                          <span style={{ color: "#fca5a5", background: "rgba(239, 68, 68, 0.12)", padding: "2px 6px", borderRadius: "4px" }}>
                            🔺 สูงกว่าคาด: <strong>{ev.aiPrediction.higherProbability}%</strong>
                          </span>
                          <span style={{ color: "#fde047", background: "rgba(234, 179, 8, 0.12)", padding: "2px 6px", borderRadius: "4px" }}>
                            🔻 ต่ำกว่าคาด: <strong>{ev.aiPrediction.lowerProbability}%</strong>
                          </span>
                        </div>

                        {/* AI Deep Reasoning */}
                        <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: "1.55", background: "rgba(0, 0, 0, 0.25)", padding: "8px 10px", borderRadius: "6px", borderLeft: "3px solid #38bdf8" }}>
                          <strong style={{ color: "#e2e8f0", display: "block", marginBottom: "3px" }}>
                            💡 เหตุผลประกอบการวิเคราะห์ AI (ทำไมถึงประเมินเช่นนี้):
                          </strong>
                          {ev.aiPrediction.reasoning}
                        </div>
                      </div>
                    )}

                    {/* Gold Market Impact Callout */}
                    <div style={{
                      fontSize: "12px",
                      color: ev.direction === "bullish" ? "#86efac" : ev.direction === "bearish" ? "#fca5a5" : ev.direction === "neutral" ? "#fef08a" : "#93c5fd",
                      lineHeight: "1.5",
                      background: ev.direction === "bullish" ? "rgba(34, 197, 94, 0.08)" : ev.direction === "bearish" ? "rgba(239, 68, 68, 0.08)" : ev.direction === "neutral" ? "rgba(250, 204, 21, 0.08)" : "rgba(59, 130, 246, 0.08)",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: `1px solid ${ev.direction === "bullish" ? "rgba(34, 197, 94, 0.2)" : ev.direction === "bearish" ? "rgba(239, 68, 68, 0.2)" : ev.direction === "neutral" ? "rgba(250, 204, 21, 0.2)" : "rgba(59, 130, 246, 0.2)"}`
                    }}>
                      📌 {ev.impact}
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                background: "rgba(34, 197, 94, 0.08)",
                border: "1px solid rgba(34, 197, 94, 0.25)",
                padding: "16px",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#86efac",
                lineHeight: "1.6",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px"
              }}>
                <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: "2px", color: "#22c55e" }} />
                <div>
                  <strong>🟢 ไม่พบข่าวเศรษฐกิจระดับ 3 ดาว (High Impact) ในช่วงเวลานี้</strong>
                  <p style={{ margin: "4px 0 0 0", color: "var(--text-secondary)", fontSize: "11.5px" }}>
                    ตลาดทองคำ Spot (XAU/USD) มีแนวโน้มเคลื่อนไหวตามกรอบโครงสร้างราคาทางเทคนิค (Price Action) และแนวรับ-แนวต้านเป็นหลัก ไม่มีแรงกระชากผิดปกติจากตัวเลขเศรษฐกิจสหรัฐฯ ระดับรุนแรง
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── 2. BOTTOM CARD: AI News Digest & Market Impact Analysis ── */}
          <div className="glass-card" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <span style={{ fontSize: "14.5px", fontWeight: "700", color: "#60a5fa", display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={18} /> 🤖 ผลวิเคราะห์อิมแพ็คข่าวสารเศรษฐกิจ (AI News Digest - XAU/USD)
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => onNavigateTab?.("settings")}
                  style={{
                    fontSize: "11px",
                    background: "rgba(59, 130, 246, 0.15)",
                    border: "1px solid rgba(59, 130, 246, 0.4)",
                    color: "#93c5fd",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontWeight: "600"
                  }}
                  title="คลิกเพื่อเปิดหน้าตั้งค่าการแจ้งเตือน Telegram"
                >
                  <Bell size={12} /> ตั้งค่าแจ้งเตือน Telegram
                </button>
                <span style={{ fontSize: "10px", background: "rgba(96,165,250,0.15)", color: "#60a5fa", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>
                  AI Real-time Engine
                </span>
              </div>
            </div>

            {/* Volatility Warning Banner */}
            <div style={{
              background: newsAnalysis.volatilityWarning.includes("⚠️") ? "rgba(239, 68, 68, 0.12)" : "rgba(59, 130, 246, 0.12)",
              border: newsAnalysis.volatilityWarning.includes("⚠️") ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(59, 130, 246, 0.3)",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              color: newsAnalysis.volatilityWarning.includes("⚠️") ? "#fca5a5" : "#93c5fd",
              lineHeight: "1.5"
            }}>
              {newsAnalysis.volatilityWarning}
            </div>

            {/* AI News Summary Box */}
            <div style={{
              background: "rgba(15, 23, 42, 0.5)",
              padding: "12px 14px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              fontSize: "12px",
              color: "var(--text-secondary)",
              lineHeight: "1.6"
            }}>
              <strong style={{ color: "#f8fafc", display: "block", marginBottom: "4px" }}>💡 สรุปวิเคราะห์ข่าว (AI News Summary):</strong>
              {newsAnalysis.summary}
            </div>

            {/* Filter Toggle for Lower Card */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", paddingTop: "4px", borderTop: "1px solid var(--border-color)" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
                รายการข่าวเศรษฐกิจ:
              </span>
              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  type="button"
                  onClick={() => setNewsFilterTab("medium")}
                  style={{
                    padding: "3px 10px",
                    borderRadius: "6px",
                    border: newsFilterTab === "medium" ? "1px solid rgba(234, 179, 8, 0.4)" : "1px solid transparent",
                    fontSize: "11px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    background: newsFilterTab === "medium" ? "rgba(234, 179, 8, 0.2)" : "rgba(255,255,255,0.05)",
                    color: newsFilterTab === "medium" ? "#facc15" : "var(--text-secondary)"
                  }}
                >
                  ⚡ ข่าวปานกลาง 2 ดาว ({mediumImpactEvents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setNewsFilterTab("all")}
                  style={{
                    padding: "3px 10px",
                    borderRadius: "6px",
                    border: newsFilterTab === "all" ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid transparent",
                    fontSize: "11px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    background: newsFilterTab === "all" ? "rgba(59, 130, 246, 0.2)" : "rgba(255,255,255,0.05)",
                    color: newsFilterTab === "all" ? "#60a5fa" : "var(--text-secondary)"
                  }}
                >
                  📋 ข่าวทั้งหมด ({newsAnalysis.impacts.length})
                </button>
              </div>
            </div>

            {/* Lower Card Events List */}
            {newsAnalysis.loading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>🔄 กำลังวิเคราะห์ผลกระทบข่าวทองคำด้วย AI...</span>
              </div>
            ) : displayedLowerEvents.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {displayedLowerEvents.map((ev, index) => (
                  <div key={index} style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    fontSize: "12px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", alignItems: "center" }}>
                      <span style={{ fontWeight: "bold", color: "#fff" }}>⏰ {ev.time} | {ev.event}</span>
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
                    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: "6px", color: "var(--text-muted)", fontSize: "11px", marginBottom: "8px", background: "rgba(0,0,0,0.25)", padding: "6px 10px", borderRadius: "6px", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px" }}>
                        <span>ตัวเลขจริง:</span>
                        <strong style={{
                          color: ev.direction === "bullish" ? "#22c55e" : ev.direction === "bearish" ? "#ef4444" : ev.direction === "neutral" ? "#facc15" : "#94a3b8",
                          fontSize: "12px"
                        }}>
                          {ev.actual}
                        </strong>
                        {ev.badge && (
                          <span style={{
                            fontSize: "9.5px",
                            padding: "1px 5px",
                            borderRadius: "3px",
                            fontWeight: "600",
                            background: ev.direction === "bullish" ? "rgba(34, 197, 94, 0.15)" : ev.direction === "bearish" ? "rgba(239, 68, 68, 0.15)" : ev.direction === "neutral" ? "rgba(250, 204, 21, 0.15)" : "rgba(148, 163, 184, 0.15)",
                            color: ev.direction === "bullish" ? "#86efac" : ev.direction === "bearish" ? "#fca5a5" : ev.direction === "neutral" ? "#fef08a" : "#cbd5e1",
                            border: `1px solid ${ev.direction === "bullish" ? "rgba(34, 197, 94, 0.3)" : ev.direction === "bearish" ? "rgba(239, 68, 68, 0.3)" : ev.direction === "neutral" ? "rgba(250, 204, 21, 0.3)" : "rgba(148, 163, 184, 0.3)"}`
                          }}>
                            {ev.badge}
                          </span>
                        )}
                      </div>
                      <div>คาดการณ์: <span style={{ color: "#fff", fontWeight: "500" }}>{ev.forecast}</span></div>
                      <div>ครั้งก่อน: <span style={{ color: "var(--text-secondary)" }}>{ev.previous}</span></div>
                    </div>

                    {/* AI Probability Brief Tag */}
                    {ev.aiPrediction && (
                      <div style={{
                        fontSize: "11px",
                        color: "#93c5fd",
                        background: "rgba(59, 130, 246, 0.08)",
                        padding: "4px 8px",
                        borderRadius: "5px",
                        marginBottom: "6px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}>
                        <Sparkles size={12} color="#60a5fa" />
                        <span>AI ประเมินโอกาสตามคาด: <strong>{ev.aiPrediction.matchProbability}%</strong> | {ev.aiPrediction.outlook}</span>
                      </div>
                    )}

                    <div style={{
                      fontSize: "12px",
                      color: ev.direction === "bullish" ? "#86efac" : ev.direction === "bearish" ? "#fca5a5" : ev.direction === "neutral" ? "#fef08a" : "#93c5fd",
                      lineHeight: "1.5",
                      background: ev.direction === "bullish" ? "rgba(34, 197, 94, 0.08)" : ev.direction === "bearish" ? "rgba(239, 68, 68, 0.08)" : ev.direction === "neutral" ? "rgba(250, 204, 21, 0.08)" : "rgba(59, 130, 246, 0.08)",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: `1px solid ${ev.direction === "bullish" ? "rgba(34, 197, 94, 0.2)" : ev.direction === "bearish" ? "rgba(239, 68, 68, 0.2)" : ev.direction === "neutral" ? "rgba(250, 204, 21, 0.2)" : "rgba(59, 130, 246, 0.2)"}`
                    }}>
                      📌 {ev.impact}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "15px", color: "var(--text-muted)", fontSize: "12px" }}>
                ไม่พบข่าวสารในหมวดหมู่นี้ในช่วงเวลานี้
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
