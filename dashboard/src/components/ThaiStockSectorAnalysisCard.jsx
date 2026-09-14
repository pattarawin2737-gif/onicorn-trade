import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Flame,
  Zap,
  Info,
  Layers,
  Calendar,
  Award,
  ArrowUpRight
} from "lucide-react";

export default function ThaiStockSectorAnalysisCard({ onSelectSymbol }) {
  const [timeframe, setTimeframe] = useState("weekly"); // "weekly" | "monthly"
  const [sectorData, setSectorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filterRating, setFilterRating] = useState("all"); // "all" | "overweight" | "selective" | "neutral"
  const [livePrices, setLivePrices] = useState({});
  const [countdown, setCountdown] = useState(60);

  // Fetch Sector Intelligence Data
  const fetchSectorIntelligence = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else if (!sectorData) setLoading(true);

    try {
      const res = await fetch(`/api/sector-analysis?timeframe=${timeframe}`);
      if (res.ok) {
        const data = await res.json();
        setSectorData(data);
        setLastUpdated(new Date());
        setCountdown(60);

        // Extract all top pick symbols to fetch their latest live prices
        const symbolsToFetch = [];
        if (data && data.sectors) {
          data.sectors.forEach(sec => {
            if (sec.topPicks) {
              sec.topPicks.forEach(p => {
                if (!symbolsToFetch.includes(p.symbol)) {
                  symbolsToFetch.push(p.symbol);
                }
              });
            }
          });
        }

        // Fetch live prices for top picks
        if (symbolsToFetch.length > 0) {
          try {
            const priceRes = await fetch(`/api/price?symbol=${encodeURIComponent(symbolsToFetch.join(","))}`);
            if (priceRes.ok) {
              const prices = await priceRes.json();
              setLivePrices(prices);
            }
          } catch (pErr) {
            console.warn("Could not fetch live prices for sector picks:", pErr);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load sector intelligence:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeframe, sectorData]);

  // Initial load and refetch on timeframe change
  useEffect(() => {
    fetchSectorIntelligence();
  }, [timeframe]);

  // Automated 60s background refresh loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchSectorIntelligence();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchSectorIntelligence]);

  // Filtered sectors
  const displayedSectors = useMemo(() => {
    if (!sectorData || !sectorData.sectors) return [];
    if (filterRating === "overweight") {
      return sectorData.sectors.filter(s => s.recommendation === "Overweight");
    }
    if (filterRating === "selective") {
      return sectorData.sectors.filter(s => s.recommendation === "Selective Buy");
    }
    if (filterRating === "neutral") {
      return sectorData.sectors.filter(s => s.recommendation === "Neutral");
    }
    return sectorData.sectors;
  }, [sectorData, filterRating]);

  // Format timestamp in Thai
  const formatTimeThai = (date) => {
    if (!date) return "กำลังโหลด...";
    return date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " น.";
  };

  return (
    <div style={{
      marginTop: "24px",
      marginBottom: "28px",
      background: "linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(7, 17, 32, 0.95))",
      border: "1.5px solid rgba(234, 179, 8, 0.35)",
      borderRadius: "14px",
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: "18px",
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)",
      boxSizing: "border-box"
    }}>
      {/* Top Header Bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "14px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        paddingBottom: "14px"
      }}>
        {/* Title & Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(245, 158, 11, 0.05))",
            border: "1px solid rgba(234, 179, 8, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#eab308"
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>
                ระบบวิเคราะห์กลุ่มอุตสาหกรรมที่น่าสนใจ (Sector Rotation Intelligence)
              </h3>
              <span style={{
                fontSize: "10.5px",
                fontWeight: "700",
                background: "rgba(34, 197, 94, 0.15)",
                color: "#4ade80",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                padding: "2px 8px",
                borderRadius: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 8px #22c55e" }} />
                AI วิเคราะห์เรียลไทม์
              </span>
            </div>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>
              ประเมินความน่าสนใจและคะแนนกลุ่มอุตสาหกรรม โดยอิงจากข่าวสารจริง ตัวเร่งเศรษฐกิจมหภาค และทิศทาง Fund Flow
            </p>
          </div>
        </div>

        {/* Timeframe Tabs & Auto-update Status */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Timeframe switcher */}
          <div style={{
            display: "inline-flex",
            background: "rgba(10, 16, 30, 0.8)",
            padding: "3px",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.08)"
          }}>
            <button
              type="button"
              onClick={() => setTimeframe("weekly")}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                border: timeframe === "weekly" ? "1px solid #eab308" : "none",
                background: timeframe === "weekly" ? "rgba(234, 179, 8, 0.2)" : "transparent",
                color: timeframe === "weekly" ? "#facc15" : "var(--text-muted)",
                transition: "all 0.15s",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              📅 ประจำสัปดาห์นี้
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("monthly")}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                border: timeframe === "monthly" ? "1px solid #38bdf8" : "none",
                background: timeframe === "monthly" ? "rgba(56, 189, 248, 0.2)" : "transparent",
                color: timeframe === "monthly" ? "#38bdf8" : "var(--text-muted)",
                transition: "all 0.15s",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              🗓️ ประจำเดือนนี้
            </button>
          </div>

          {/* Manual refresh button */}
          <button
            type="button"
            onClick={() => fetchSectorIntelligence(true)}
            disabled={refreshing}
            style={{
              padding: "6px 12px",
              background: "rgba(234, 179, 8, 0.12)",
              border: "1px solid rgba(234, 179, 8, 0.35)",
              borderRadius: "6px",
              color: "#eab308",
              fontSize: "11.5px",
              fontWeight: "600",
              cursor: refreshing ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s"
            }}
            title="คลิกเพื่อสั่งให้ AI วิเคราะห์คะแนนกลุ่มอุตสาหกรรมใหม่ทันที"
            onMouseOver={e => !refreshing && (e.currentTarget.style.background = "rgba(234, 179, 8, 0.25)")}
            onMouseOut={e => !refreshing && (e.currentTarget.style.background = "rgba(234, 179, 8, 0.12)")}
          >
            <RefreshCw size={13} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
            {refreshing ? "กำลังประมวลผล..." : "วิเคราะห์ใหม่"}
          </button>
        </div>
      </div>

      {/* Auto-update Banner & Market Theme */}
      {sectorData && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: "12px",
          background: "rgba(10, 16, 30, 0.6)",
          padding: "12px 16px",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.05)"
        }}>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
              <Layers size={13} style={{ color: "#38bdf8" }} />
              ธีมการลงทุนหลัก ({sectorData.periodLabel}):
            </div>
            <div style={{ fontSize: "12.5px", color: "#f1f5f9", fontWeight: "600", marginTop: "3px", lineHeight: "1.4" }}>
              {sectorData.marketTheme}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={13} style={{ color: "#eab308" }} />
              สรุปภาพรวมจาก AI:
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "3px", lineHeight: "1.4" }}>
              {sectorData.summary}
            </div>
          </div>
        </div>
      )}

      {/* Status & Filter Controls */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "10px"
      }}>
        {/* Rating filter pills */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: "600" }}>กรองตามคำแนะนำ:</span>
          <button
            type="button"
            onClick={() => setFilterRating("all")}
            style={{
              padding: "4px 10px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: "600",
              cursor: "pointer",
              border: filterRating === "all" ? "1px solid #eab308" : "1px solid rgba(255, 255, 255, 0.08)",
              background: filterRating === "all" ? "rgba(234, 179, 8, 0.2)" : "rgba(15, 23, 42, 0.4)",
              color: filterRating === "all" ? "#facc15" : "var(--text-muted)"
            }}
          >
            ทั้งหมด ({sectorData?.sectors?.length || 8})
          </button>
          <button
            type="button"
            onClick={() => setFilterRating("overweight")}
            style={{
              padding: "4px 10px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: "600",
              cursor: "pointer",
              border: filterRating === "overweight" ? "1px solid #22c55e" : "1px solid rgba(255, 255, 255, 0.08)",
              background: filterRating === "overweight" ? "rgba(34, 197, 94, 0.2)" : "rgba(15, 23, 42, 0.4)",
              color: filterRating === "overweight" ? "#4ade80" : "var(--text-muted)"
            }}
          >
            🚀 Overweight ({sectorData?.sectors?.filter(s => s.recommendation === "Overweight").length || 0})
          </button>
          <button
            type="button"
            onClick={() => setFilterRating("selective")}
            style={{
              padding: "4px 10px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: "600",
              cursor: "pointer",
              border: filterRating === "selective" ? "1px solid #60a5fa" : "1px solid rgba(255, 255, 255, 0.08)",
              background: filterRating === "selective" ? "rgba(96, 165, 250, 0.2)" : "rgba(15, 23, 42, 0.4)",
              color: filterRating === "selective" ? "#60a5fa" : "var(--text-muted)"
            }}
          >
            💎 Selective Buy ({sectorData?.sectors?.filter(s => s.recommendation === "Selective Buy").length || 0})
          </button>
          <button
            type="button"
            onClick={() => setFilterRating("neutral")}
            style={{
              padding: "4px 10px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: "600",
              cursor: "pointer",
              border: filterRating === "neutral" ? "1px solid #eab308" : "1px solid rgba(255, 255, 255, 0.08)",
              background: filterRating === "neutral" ? "rgba(234, 179, 8, 0.2)" : "rgba(15, 23, 42, 0.4)",
              color: filterRating === "neutral" ? "#facc15" : "var(--text-muted)"
            }}
          >
            ⚖️ Neutral ({sectorData?.sectors?.filter(s => s.recommendation === "Neutral").length || 0})
          </button>
        </div>

        {/* Live sync timer indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "var(--text-muted)" }}>
          <span>อัปเดตล่าสุด: <strong style={{ color: "#f8fafc" }}>{formatTimeThai(lastUpdated)}</strong></span>
          <span style={{
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "2px 7px",
            borderRadius: "4px",
            color: "#94a3b8"
          }}>
            รีเฟรชใน {countdown} วินาที
          </span>
        </div>
      </div>

      {/* Main Sector Cards Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
          <div className="spinner" style={{ margin: "0 auto 12px" }}></div>
          <span style={{ fontSize: "13px" }}>AI กำลังประมวลผลข้อมูลข่าวสารและคะแนนกลุ่มอุตสาหกรรม...</span>
        </div>
      ) : displayedSectors.length > 0 ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
          gap: "18px"
        }}>
          {displayedSectors.map((sector) => {
            const isTop3 = sector.rank <= 3;
            const rankBadgeColor = sector.rank === 1 ? "#eab308" : sector.rank === 2 ? "#94a3b8" : sector.rank === 3 ? "#b45309" : "#64748b";

            return (
              <div
                key={sector.id}
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  border: isTop3 ? "1.5px solid rgba(234, 179, 8, 0.35)" : "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  boxShadow: isTop3 ? "0 4px 18px rgba(234, 179, 8, 0.06)" : "none",
                  transition: "transform 0.2s, box-shadow 0.2s"
                }}
              >
                {/* Sector Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      fontSize: "24px",
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {sector.icon}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <h4 style={{ margin: 0, fontSize: "14.5px", fontWeight: "800", color: "#f8fafc" }}>
                          {sector.name}
                        </h4>
                        <span style={{
                          fontSize: "10.5px",
                          fontWeight: "800",
                          color: rankBadgeColor,
                          background: `${rankBadgeColor}15`,
                          border: `1px solid ${rankBadgeColor}40`,
                          padding: "1px 6px",
                          borderRadius: "4px"
                        }}>
                          อันดับ #{sector.rank}
                        </span>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{sector.englishName}</span>
                    </div>
                  </div>

                  {/* Recommendation Badge */}
                  <span style={{
                    fontSize: "11px",
                    fontWeight: "800",
                    color: sector.recommendationColor,
                    background: sector.recommendationBg,
                    border: `1px solid ${sector.recommendationColor}40`,
                    padding: "3px 8px",
                    borderRadius: "6px",
                    whiteSpace: "nowrap"
                  }}>
                    {sector.recommendation === "Overweight" ? "🚀 Overweight" : sector.recommendation === "Selective Buy" ? "💎 Selective Buy" : "⚖️ Neutral"}
                  </span>
                </div>

                {/* Score Progress Bar */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11.5px" }}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>คะแนนความน่าสนใจโดย AI:</span>
                    <strong style={{ color: sector.score >= 90 ? "#22c55e" : sector.score >= 80 ? "#60a5fa" : "#eab308", fontSize: "13px" }}>
                      {sector.score} / 100
                    </strong>
                  </div>
                  <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${sector.score}%`,
                      background: sector.score >= 90 ? "linear-gradient(90deg, #10b981, #22c55e)" : sector.score >= 80 ? "linear-gradient(90deg, #3b82f6, #60a5fa)" : "linear-gradient(90deg, #eab308, #facc15)",
                      borderRadius: "3px",
                      transition: "width 0.6s ease-in-out"
                    }} />
                  </div>
                </div>

                {/* News & Catalysts Box */}
                <div style={{
                  background: "rgba(10, 16, 30, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  fontSize: "11.5px",
                  lineHeight: "1.45"
                }}>
                  <div style={{ color: "#eab308", fontWeight: "700", marginBottom: "3px", display: "flex", alignItems: "center", gap: "5px" }}>
                    📰 ข่าวเด่น & ปัจจัยหนุน (News & Catalysts):
                  </div>
                  <div style={{ color: "#e2e8f0" }}>
                    {sector.newsHighlights}
                  </div>
                </div>

                {/* Tactical Strategy */}
                <div style={{
                  background: "rgba(59, 130, 246, 0.06)",
                  borderLeft: "3px solid #3b82f6",
                  borderRadius: "0 6px 6px 0",
                  padding: "8px 12px",
                  fontSize: "11.5px",
                  lineHeight: "1.45"
                }}>
                  <strong style={{ color: "#93c5fd" }}>🎯 กลยุทธ์การเทรด ({sectorData.periodLabel}):</strong>{" "}
                  <span style={{ color: "#cbd5e1" }}>{sector.tacticalStrategy}</span>
                </div>

                {/* Leading Stock Picks */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Award size={13} style={{ color: "#eab308" }} />
                    หุ้นเด่นนำกลุ่ม (Top Sector Picks):
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {sector.topPicks.map((pick) => {
                      const quote = livePrices[pick.symbol];
                      const priceVal = quote ? parseFloat(quote.price) : null;
                      const chgVal = quote ? parseFloat(quote.changePct || 0) : null;

                      return (
                        <div
                          key={pick.symbol}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "rgba(10, 16, 30, 0.5)",
                            border: "1px solid rgba(255, 255, 255, 0.05)",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            flexWrap: "wrap",
                            gap: "6px"
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <strong style={{ color: "#f8fafc", fontSize: "12px" }}>{pick.symbol}</strong>
                              <span style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>{pick.name}</span>
                              <span style={{
                                fontSize: "10px",
                                color: "#60a5fa",
                                background: "rgba(59, 130, 246, 0.1)",
                                padding: "1px 5px",
                                borderRadius: "3px"
                              }}>
                                {pick.bias}
                              </span>
                            </div>
                            <div style={{ fontSize: "10.5px", color: "var(--text-secondary)", marginTop: "1px" }}>
                              {pick.highlight}
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {priceVal !== null && (
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "11.5px", fontWeight: "700", color: "#f8fafc" }}>
                                  ฿{priceVal.toFixed(2)}
                                </div>
                                {chgVal !== null && (
                                  <div style={{
                                    fontSize: "10px",
                                    fontWeight: "700",
                                    color: chgVal > 0 ? "#22c55e" : chgVal < 0 ? "#ef4444" : "var(--text-muted)"
                                  }}>
                                    {chgVal > 0 ? `+${chgVal.toFixed(2)}%` : `${chgVal.toFixed(2)}%`}
                                  </div>
                                )}
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => onSelectSymbol && onSelectSymbol(pick.symbol)}
                              style={{
                                padding: "3px 8px",
                                background: "rgba(234, 179, 8, 0.15)",
                                border: "1px solid rgba(234, 179, 8, 0.35)",
                                borderRadius: "4px",
                                color: "#eab308",
                                fontSize: "10.5px",
                                fontWeight: "700",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                                transition: "all 0.15s"
                              }}
                              title={`สลับกราฟและดูผลวิเคราะห์ ${pick.symbol}`}
                              onMouseOver={e => e.currentTarget.style.background = "rgba(234, 179, 8, 0.3)"}
                              onMouseOut={e => e.currentTarget.style.background = "rgba(234, 179, 8, 0.15)"}
                            >
                              กราฟ 📊
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Risk Watch */}
                <div style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "5px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                  paddingTop: "8px",
                  marginTop: "2px"
                }}>
                  <AlertTriangle size={13} style={{ color: "#f59e0b", flexShrink: 0, marginTop: "1px" }} />
                  <span><strong>ความเสี่ยง:</strong> {sector.riskWatch}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", fontSize: "12px" }}>
          ไม่พบข้อมูลกลุ่มอุตสาหกรรมตามเงื่อนไขที่เลือก
        </div>
      )}
    </div>
  );
}
