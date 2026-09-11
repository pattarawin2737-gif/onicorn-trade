import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle, Bell, ShieldAlert, Sparkles, ChevronDown, ChevronUp, Radio } from "lucide-react";

export default function HighImpactNewsCountdown() {
  const [nextEvent, setNextEvent] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, totalSec: 0 });
  const [isImminent, setIsImminent] = useState(false); // true if <= 30 mins
  const [isExpanded, setIsExpanded] = useState(false);
  const [allUpcoming, setAllUpcoming] = useState([]);

  // Mock list of major high-impact recurring events in GMT+7 time
  const sampleEvents = [
    { title: "🇺🇸 ดัชนีราคาผู้บริโภค CPI (ปีต่อปี) สหรัฐฯ", currency: "USD", timeStr: "19:30 น.", targetHour: 19, targetMin: 30, forecast: "2.8%", prev: "2.9%", impact: "ความผันผวนสูงมากต่อทองคำ XAUUSD และดัชนีดอลลาร์ DXY" },
    { title: "🇺🇸 ดอกเบี้ยนโยบาย FOMC & ถ้อยแถลงพาวเวลล์", currency: "USD", timeStr: "01:00 น.", targetHour: 1, targetMin: 0, forecast: "5.25%", prev: "5.50%", impact: "กำหนดทิศทางใหญ่ของตลาดหุ้นโลกและค่าเงินทุกคู่" },
    { title: "🇺🇸 ตัวเลขการจ้างงานนอกภาคเกษตร NFP & อัตราว่างงาน", currency: "USD", timeStr: "19:30 น.", targetHour: 19, targetMin: 30, forecast: "165K", prev: "175K", impact: "สเปรดถ่างรวดเร็ว เหวี่ยง 1,000-2,000 จุดในแท่ง M5" },
    { title: "🇪🇺 มติอัตราดอกเบี้ย ECB ยุโรป", currency: "EUR", timeStr: "19:15 น.", targetHour: 19, targetMin: 15, forecast: "3.75%", prev: "3.75%", impact: "กระทบต่อคู่เงิน EURUSD, EURGBP" },
    { title: "🇬🇧 ดัชนีเงินเฟ้อ CPI อังกฤษ", currency: "GBP", timeStr: "13:00 น.", targetHour: 13, targetMin: 0, forecast: "2.2%", prev: "2.0%", impact: "กระทบต่อคู่เงิน GBPUSD, GBPJPY" }
  ];

  // Calculate nearest upcoming event
  const calculateNearestEvent = () => {
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    let upcoming = sampleEvents
      .map(ev => {
        let evMinutes = ev.targetHour * 60 + ev.targetMin;
        let diffMinutes = evMinutes - currentTotalMinutes;
        let isTomorrow = false;
        if (diffMinutes < 0) {
          diffMinutes += 24 * 60;
          isTomorrow = true;
        }
        return {
          ...ev,
          diffMinutes,
          isTomorrow,
          diffSec: diffMinutes * 60 - now.getSeconds()
        };
      })
      .sort((a, b) => a.diffMinutes - b.diffMinutes);

    setAllUpcoming(upcoming);

    if (upcoming.length > 0) {
      const nearest = upcoming[0];
      setNextEvent(nearest);

      const totalSec = Math.max(0, nearest.diffSec);
      const hrs = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;

      setTimeLeft({ hours: hrs, minutes: mins, seconds: secs, totalSec });
      setIsImminent(totalSec <= 1800); // 30 mins
    }
  };

  useEffect(() => {
    calculateNearestEvent();
    const interval = setInterval(calculateNearestEvent, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!nextEvent) return null;

  return (
    <div
      className="glass-card"
      style={{
        marginBottom: 16,
        padding: "12px 18px",
        borderRadius: 10,
        background: isImminent
          ? "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(15, 23, 42, 0.9))"
          : "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(15, 23, 42, 0.85))",
        border: isImminent ? "1.5px solid rgba(239, 68, 68, 0.5)" : "1px solid rgba(245, 158, 11, 0.3)",
        boxShadow: isImminent ? "0 0 20px rgba(239, 68, 68, 0.25)" : "0 4px 15px rgba(0,0,0,0.2)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        {/* Left info */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 280 }}>
          <div
            style={{
              background: isImminent ? "#ef4444" : "#f59e0b",
              color: "#fff",
              padding: "6px 10px",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 800,
              boxShadow: isImminent ? "0 0 10px rgba(239, 68, 68, 0.6)" : "none",
              animation: isImminent ? "pulse 1.5s infinite" : "none"
            }}
          >
            <Radio size={14} className={isImminent ? "pulse-anim" : ""} />
            <span>{isImminent ? "🔴 ข่าวกล่องแดงใกล้ประกาศ!" : "⏰ ข่าวเศรษฐกิจสำคัญถัดไป"}</span>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
              <span>{nextEvent.title}</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 4 }}>
                {nextEvent.timeStr} {nextEvent.isTomorrow ? "(พรุ่งนี้)" : "(วันนี้)"}
              </span>
            </div>
            <span style={{ fontSize: 11, color: isImminent ? "#fca5a5" : "var(--text-muted)" }}>
              {isImminent
                ? "⚠️ สเปรดจะถ่างและราคาอาจเหวี่ยงรุนแรง แนะนำงดเปิดออเดอร์ชนข่าวโดยเด็ดขาด!"
                : nextEvent.impact}
            </span>
          </div>
        </div>

        {/* Right Countdown Clock */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginRight: 4 }}>นับถอยหลัง:</span>
            <div style={{ background: "rgba(0,0,0,0.4)", padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", fontSize: 14, fontWeight: 800, color: isImminent ? "#ef4444" : "#facc15", letterSpacing: 0.5 }}>
              {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--text-secondary)",
              padding: "4px 8px",
              borderRadius: 6,
              fontSize: 11,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4
            }}
          >
            <span>{isExpanded ? "ซ่อนรายการ" : "ตารางข่าววันนี้"}</span>
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Expanded list of upcoming major news */}
      {isExpanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>
            🗓️ รายการข่าวระดับ High Impact ถัดไปใน 24 ชั่วโมง:
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 8 }}>
            {allUpcoming.slice(0, 4).map((ev, i) => (
              <div key={i} style={{ background: "rgba(0,0,0,0.25)", padding: "8px 10px", borderRadius: 6, fontSize: 11.5, border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <strong style={{ color: "#fff" }}>{ev.title}</strong>
                  <span style={{ color: "#facc15", fontWeight: 700 }}>{ev.timeStr}</span>
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: 11 }}>
                  คาดการณ์: <strong style={{ color: "#60a5fa" }}>{ev.forecast}</strong> | ก่อนหน้า: {ev.prev}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
