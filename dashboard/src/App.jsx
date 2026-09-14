import React, { useState, useEffect, useRef } from "react";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { 
  BookOpen, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  Settings, 
  DollarSign, 
  Activity, 
  Award,
  Layers,
  LineChart,
  Lock,
  Menu,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  LogOut,
  X,
  User,
  CheckCircle2,
  Info,
  Link,
  Droplets,
  ShieldAlert
} from "lucide-react";
import Chart from "chart.js/auto";
import AnalysisView from "./components/AnalysisView";
import ThaiStockAnalysisView from "./components/ThaiStockAnalysisView";
import InterStockAnalysisView from "./components/InterStockAnalysisView";
import GoldAnalysisView from "./components/GoldAnalysisView";
import InterGoldAnalysisView from "./components/InterGoldAnalysisView";
import OilAnalysisView from "./components/OilAnalysisView";
import AdminUsersView from "./components/AdminUsersView";
import TelegramSettingsCard from "./components/TelegramSettingsCard";
import { CONFIG } from "./config";
import { fetchSheetData, parseCompoundingPlan, calculateTradingStats } from "./utils/googleSheets";
import "./App.css";

const logoSvg = CONFIG.logoSvg || "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%20width='100'%20height='100'%3e%3cdefs%3e%3clinearGradient%20id='grad1'%20x1='0%25'%20y1='0%25'%20x2='100%25'%20y2='100%25'%3e%3cstop%20offset='0%25'%20style='stop-color:%233B82F6;stop-opacity:1'%20/%3e%3cstop%20offset='100%25'%20style='stop-color:%23EC4899;stop-opacity:1'%20/%3e%3c/linearGradient%3e%3clinearGradient%20id='grad2'%20x1='0%25'%20y1='100%25'%20x2='100%25'%20y2='0%25'%3e%3cstop%20offset='0%25'%20style='stop-color:%238B5CF6;stop-opacity:1'%20/%3e%3cstop%20offset='100%25'%20style='stop-color:%2310B981;stop-opacity:1'%20/%3e%3c/linearGradient%3e%3c/defs%3e%3c!--%20Background%20Shape%20--%3e%3cpolygon%20points='50,5%2092,25%2092,75%2050,95%208,75%208,25'%20fill='url(%23grad1)'%20opacity='0.15'%20/%3e%3cpolygon%20points='50,10%2087,28%2087,72%2050,90%2013,72%2013,28'%20stroke='url(%23grad1)'%20stroke-width='3'%20fill='none'%20/%3e%3c!--%20Stylized%20Horn%20/%20OniCorn%20--%3e%3cpath%20d='M50,12%20L58,38%20L50,34%20L42,38%20Z'%20fill='url(%23grad2)'%20/%3e%3c!--%20Inner%20Star%20/%20Glow%20--%3e%3ccircle%20cx='50'%20cy='46'%20r='12'%20fill='none'%20stroke='%23fff'%20stroke-width='1.5'%20stroke-dasharray='2%202'%20/%3e%3c!--%20Letter%20O%20&%20C%20merged%20--%3e%3cpath%20d='M38,62%20A14,14%200%201,0%2062,62'%20fill='none'%20stroke='%23fff'%20stroke-width='5'%20stroke-linecap='round'%20/%3e%3cpath%20d='M43,62%20A9,9%200%201,1%2057,62'%20fill='none'%20stroke='url(%23grad2)'%20stroke-width='3'%20stroke-linecap='round'%20/%3e%3c!--%20Little%20Sparkle%20--%3e%3cpolygon%20points='72,26%2074,30%2078,31%2075,34%2076,38%2072,36%2068,38%2069,34%2066,31%2070,30'%20fill='%23FBBF24'%20/%3e%3c/svg%3e";
const mockTrades = CONFIG.mockTrades || [];
const defaultCompoundingPlan = CONFIG.defaultCompoundingPlan || { headerInfo: { initialCapital: 50, totalProfit: 145.5, profitTarget: 500 }, days: [] };

const $getCandleCat = it => {
  if (it.includes("ChoCh")) return { id: "choch", name: "⚡ ChoCh", desc: "Change of Character (กลับตัว)" };
  if (it.includes("BOS")) return { id: "bos", name: "📈 BOS", desc: "Break of Structure (ไปต่อ)" };
  if (it.includes("QM")) return { id: "qm", name: "👑 QM", desc: "Quasimodo Pattern" };
  if (it.includes("ORDER BLOCK") || it.includes("Hidden Candle")) return { id: "ob_hc", name: "🧱 Order Block & Hidden Candle", desc: "โซนสถาบัน & แท่งเทียนซ่อน" };
  if (it.includes("Demand") || it.includes("Supply")) return { id: "sd", name: "🛡️ Demand & Supply Zone", desc: "โซนอุปสงค์-อุปทาน (หลัก/ย่อย)" };
  if (it.includes("Trend Line") || it.includes("Sideway")) return { id: "trend", name: "📐 Trend Line & Sideway", desc: "เส้นแนวโน้ม & กรอบไซด์เวย์" };
  if (it.includes("Swing")) return { id: "swing", name: "🔄 Swing High / Low", desc: "จุดสวิงไฮ-สวิงโลว์" };
  return { id: "pattern", name: "🕯️ แท่งเทียนมาตรฐาน", desc: "Pin Bar, Engulfing, Doji ฯลฯ" };
};

const $getIndicatorCat = it => {
  if (it.includes("EMA")) return { id: "ema", name: "📉 EMA", desc: "Moving Average (9, 20, 50, 100, 200)" };
  if (it.includes("RSI")) return { id: "rsi", name: "📊 RSI", desc: "RSI บนเส้น, ล่างเส้น, Divergence" };
  if (it.includes("Stochastic")) return { id: "stoch", name: "⚡ Stochastic", desc: "Stochastic Oscillator ทุกรูปแบบ" };
  if (it.includes("Fibonacci")) return { id: "fibo", name: "🌀 Fibonacci", desc: "Fibonacci Retracement" };
  return { id: "other", name: "✨ อื่นๆ", desc: "MACD, Bollinger Bands ฯลฯ" };
};

const $getBaseConcept = it => {
  return it.replace(/\s*\(?(1D|4H|1H|30M|15M|5M|1M|1W)\)?\s*$/i, "").replace(/\s+/g, " ").trim();
};
const $conceptOrder = {
  "Demand": 1, "Demand ย่อย": 2, "Supply": 3, "Supply ย่อย": 4,
  "ORDER BLOCK(OB)": 1, "ORDER BLOCK": 1, "Hidden Candle(HC)": 2, "Hidden Candle": 2,
  "ChoCh (กลับตัวขึ้น)": 1, "ChoCh (กลับตัวลง)": 2,
  "BOS (ไปต่อ)": 1, "BOS (ขึ้นต่อ)": 2, "BOS (ลงต่อ)": 3,
  "QM (กลับตัว)": 1, "QM": 1,
  "Trend Line ขาขึ้น": 1, "Trend Line ขาลง": 2, "Sideway บน": 3, "Sideway ล่าง": 4,
  "Swing High": 1, "Swing Hight": 1, "Swing Low": 2,
  "Pin Bar": 1, "Engulfing": 2, "Doji": 3, "Inside Bar": 4, "Morning Star": 5, "Three White Soldiers": 6,
  "EMA 9": 1, "EMA 20": 2, "EMA 50": 3, "EMA 100": 4, "EMA 200": 5, "EMA 50/200 Cross": 6,
  "RSI บนเส้น": 1, "RSI ล่างเส้น": 2, "RSI Divergence": 3, "RSI Overbought": 4, "RSI Oversold": 5,
  "Stochastic ยกหัวขึ้น": 1, "Stochastic ปักหัวลง": 2, "Stochastic ตัดกัน": 3, "Stochastic บนเส้น": 4, "Stochastic ล่างเส้น": 5, "Stochastic Cross": 6,
  "Fibonacci": 1, "MACD Golden Cross": 1, "Bollinger Bands Bounce": 2
};
const $getConceptRank = it => {
  const base = $getBaseConcept(it);
  return $conceptOrder[base] || 50;
};
const $getTfRank = it => {
  if (it.includes("1D")) return 1;
  if (it.includes("4H")) return 2;
  if (it.includes("1H")) return 3;
  if (it.includes("30M")) return 4;
  if (it.includes("15M")) return 5;
  if (it.includes("5M")) return 6;
  if (it.includes("1M")) return 7;
  return 8;
};
const $sortReasons = (a, b) => {
  const rankA = $getConceptRank(a), rankB = $getConceptRank(b);
  if (rankA !== rankB) return rankA - rankB;
  const baseA = $getBaseConcept(a), baseB = $getBaseConcept(b);
  const baseDiff = baseA.localeCompare(baseB);
  if (baseDiff !== 0) return baseDiff;
  return $getTfRank(a) - $getTfRank(b) || a.localeCompare(b);
};

const $reasonPicker = opt => {
  if (!opt.isOpen) return null;
  const selList = opt.selectedItems || [];
  const getCat = opt.isCandle ? $getCandleCat : $getIndicatorCat;

  // Filter by search
  const filtered = opt.allItems.filter(it => {
    if (!opt.searchVal) return true;
    return it.toLowerCase().includes(opt.searchVal.toLowerCase().trim());
  });

  // Category counts for pill tabs
  const catMap = new Map();
  opt.allItems.forEach(it => {
    const c = getCat(it);
    if (!catMap.has(c.id)) catMap.set(c.id, { ...c, count: 0 });
    catMap.get(c.id).count++;
  });
  const catList = Array.from(catMap.values());

  // Groups of filtered items
  const groupsMap = new Map();
  filtered.forEach(it => {
    const c = getCat(it);
    if (!groupsMap.has(c.id)) groupsMap.set(c.id, { ...c, items: [] });
    groupsMap.get(c.id).items.push(it);
  });

  // Sort within each group
  groupsMap.forEach(g => {
    g.items.sort($sortReasons);
  });

  const visibleGroups = opt.catVal === "ALL"
    ? Array.from(groupsMap.values())
    : (groupsMap.has(opt.catVal) ? [groupsMap.get(opt.catVal)] : []);

  const currentlyVisible = [];
  visibleGroups.forEach(g => g.items.forEach(it => currentlyVisible.push(it)));

  return _jsx("div", {
    style: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(11, 15, 25, 0.85)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10005,
      padding: "16px",
      boxSizing: "border-box"
    },
    children: _jsxs("div", {
      style: {
        width: "100%",
        maxWidth: "760px",
        maxHeight: "90vh",
        background: "linear-gradient(145deg, #131A2E, #0b101f)",
        border: `1px solid ${opt.accentColor}66`,
        borderRadius: "18px",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        boxShadow: `0 25px 50px -12px rgba(0,0,0,0.85), 0 0 35px ${opt.accentColor}33`,
        boxSizing: "border-box"
      },
      children: [
        // Header
        _jsxs("div", {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            paddingBottom: "12px",
            gap: "10px"
          },
          children: [
            _jsxs("div", {
              children: [
                _jsx("h3", {
                  style: { margin: 0, fontSize: "17px", fontWeight: "700", color: "#fff", display: "flex", alignItems: "center", gap: "8px" },
                  children: `${opt.icon} ${opt.title}`
                }),
                _jsx("p", {
                  style: { margin: "3px 0 0", fontSize: "12px", color: "var(--text-muted)" },
                  children: `เลือกแล้ว ${selList.length} / ${opt.allItems.length} รายการ • จัดเรียงตามหมวดหมู่ชัดเจน`
                })
              ]
            }),
            _jsxs("div", {
              style: { display: "flex", alignItems: "center", gap: "8px" },
              children: [
                _jsx("button", {
                  type: "button",
                  onClick: opt.onOpenManager,
                  style: {
                    background: "rgba(59,130,246,0.12)",
                    border: "1px solid rgba(59,130,246,0.35)",
                    borderRadius: "8px",
                    color: "#60A5FA",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  },
                  children: "⚙️ จัดการรายการ"
                }),
                _jsx("button", {
                  type: "button",
                  onClick: opt.onCloudSync,
                  style: {
                    background: "rgba(16,185,129,0.12)",
                    border: "1px solid rgba(16,185,129,0.35)",
                    borderRadius: "8px",
                    color: "#34d399",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  },
                  children: "☁️ ซิงก์ Cloud"
                }),
                _jsx("button", {
                  type: "button",
                  onClick: opt.onClose,
                  style: {
                    background: "rgba(255,255,255,0.06)",
                    border: "none",
                    borderRadius: "8px",
                    color: "var(--text-muted)",
                    width: "34px",
                    height: "34px",
                    fontSize: "15px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  },
                  children: "✕"
                })
              ]
            })
          ]
        }),

        // Search Input
        _jsxs("div", {
          style: { display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" },
          children: [
            _jsx("input", {
              type: "text",
              value: opt.searchVal,
              onChange: e => opt.setSearchVal(e.target.value),
              placeholder: "🔍 พิมพ์เพื่อค้นหา เช่น 15M, ChoCh, EMA, Supply...",
              style: {
                flex: 1,
                padding: "9px 14px",
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "13px",
                outline: "none"
              }
            }),
            opt.searchVal && _jsx("button", {
              type: "button",
              onClick: () => opt.setSearchVal(""),
              style: {
                background: "rgba(255,255,255,0.08)",
                border: "none",
                borderRadius: "8px",
                color: "var(--text-muted)",
                padding: "8px 12px",
                fontSize: "12px",
                cursor: "pointer"
              },
              children: "ล้างค้นหา"
            })
          ]
        }),

        // Category Pills
        _jsx("div", {
          style: {
            display: "flex",
            gap: "6px",
            overflowX: "auto",
            padding: "8px 0 4px",
            margin: "4px 0",
            whiteSpace: "nowrap"
          },
          children: [
            _jsx("button", {
              type: "button",
              onClick: () => opt.setCatVal("ALL"),
              style: {
                padding: "5px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                border: opt.catVal === "ALL" ? `1.5px solid ${opt.accentColor}` : "1px solid rgba(255,255,255,0.1)",
                background: opt.catVal === "ALL" ? `${opt.accentColor}25` : "rgba(255,255,255,0.03)",
                color: opt.catVal === "ALL" ? "#fff" : "var(--text-secondary)",
                transition: "all 0.15s ease"
              },
              children: `ทั้งหมด (${opt.allItems.length})`
            }),
            ...catList.map(cat => _jsx("button", {
              type: "button",
              onClick: () => opt.setCatVal(cat.id),
              style: {
                padding: "5px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                border: opt.catVal === cat.id ? `1.5px solid ${opt.accentColor}` : "1px solid rgba(255,255,255,0.1)",
                background: opt.catVal === cat.id ? `${opt.accentColor}25` : "rgba(255,255,255,0.03)",
                color: opt.catVal === cat.id ? "#fff" : "var(--text-secondary)",
                transition: "all 0.15s ease"
              },
              children: `${cat.name} (${cat.count})`
            }, cat.id))
          ]
        }),

        // Quick Actions
        _jsxs("div", {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 0",
            borderBottom: "1px dashed rgba(255,255,255,0.08)",
            fontSize: "12px"
          },
          children: [
            _jsxs("span", {
              style: { color: "#93c5fd", fontWeight: "600" },
              children: [
                `เลือกแล้ว: ${selList.length} รายการ`,
                opt.catVal !== "ALL" ? ` (หมวด: ${catList.find(c => c.id === opt.catVal)?.name || ""})` : ""
              ]
            }),
            _jsxs("div", {
              style: { display: "flex", gap: "8px" },
              children: [
                _jsx("button", {
                  type: "button",
                  onClick: () => opt.onSelectAll(currentlyVisible),
                  style: {
                    background: "rgba(16,185,129,0.12)",
                    border: "1px solid rgba(16,185,129,0.3)",
                    borderRadius: "6px",
                    color: "#34d399",
                    padding: "4px 10px",
                    fontSize: "11.5px",
                    fontWeight: "600",
                    cursor: "pointer"
                  },
                  children: opt.catVal === "ALL" ? "✅ เลือกทั้งหมด" : "✅ เลือกหมวดนี้ทั้งหมด"
                }),
                _jsx("button", {
                  type: "button",
                  onClick: opt.onClearAll,
                  style: {
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    borderRadius: "6px",
                    color: "#f87171",
                    padding: "4px 10px",
                    fontSize: "11.5px",
                    fontWeight: "600",
                    cursor: "pointer"
                  },
                  children: "🔄 ล้างทั้งหมด"
                })
              ]
            })
          ]
        }),

        // Scrollable Groups
        _jsx("div", {
          style: {
            flex: 1,
            maxHeight: "52vh",
            overflowY: "auto",
            margin: "8px 0 14px",
            paddingRight: "6px"
          },
          children: visibleGroups.length === 0
            ? _jsx("div", {
                style: { textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: "14px" },
                children: "🔍 ไม่พบเหตุผลที่ตรงกับคำค้นหา"
              })
            : visibleGroups.map(group => {
                const grpSelCount = group.items.filter(it => selList.includes(it)).length;
                return _jsxs("div", {
                  style: { marginBottom: "16px" },
                  children: [
                    // Group Header
                    _jsxs("div", {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "7px 12px",
                        background: "rgba(255,255,255,0.035)",
                        borderLeft: `4px solid ${opt.accentColor}`,
                        borderRadius: "8px",
                        marginBottom: "8px"
                      },
                      children: [
                        _jsxs("div", {
                          style: { display: "flex", alignItems: "baseline", gap: "8px" },
                          children: [
                            _jsx("span", { style: { fontWeight: "700", fontSize: "13.5px", color: "#fff" }, children: group.name }),
                            _jsx("span", { style: { fontSize: "11px", color: "var(--text-muted)" }, children: group.desc })
                          ]
                        }),
                        _jsx("span", {
                          style: {
                            fontSize: "11px",
                            fontWeight: "600",
                            color: grpSelCount > 0 ? "#34d399" : "var(--text-muted)",
                            background: grpSelCount > 0 ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
                            padding: "2px 8px",
                            borderRadius: "10px"
                          },
                          children: `${grpSelCount} / ${group.items.length}`
                        })
                      ]
                    }),

                    // Items Grid
                    _jsx("div", {
                      style: {
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(195px, 1fr))",
                        gap: "7px"
                      },
                      children: group.items.map(it => {
                        const isChecked = selList.includes(it);
                        return _jsxs("label", {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 11px",
                            borderRadius: "9px",
                            cursor: "pointer",
                            fontSize: "12.5px",
                            color: isChecked ? "#fff" : "var(--text-secondary)",
                            background: isChecked ? `${opt.accentColor}25` : "rgba(255,255,255,0.025)",
                            border: isChecked ? `1.5px solid ${opt.accentColor}` : "1px solid rgba(255,255,255,0.07)",
                            transition: "all 0.12s ease",
                            boxShadow: isChecked ? `0 4px 12px ${opt.accentColor}33` : "none"
                          },
                          children: [
                            _jsx("input", {
                              type: "checkbox",
                              checked: isChecked,
                              onChange: () => opt.onToggleItem(it),
                              style: { accentColor: opt.accentColor, width: "15px", height: "15px", cursor: "pointer" }
                            }),
                            _jsx("span", { style: { fontWeight: isChecked ? "600" : "normal", flex: 1 }, children: it })
                          ]
                        }, it);
                      })
                    })
                  ]
                }, group.id);
              })
        }),

        // Footer
        _jsxs("div", {
          style: {
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          },
          children: [
            _jsxs("span", {
              style: { fontSize: "12.5px", color: "var(--text-muted)" },
              children: [
                "เลือกแล้ว ",
                _jsx("strong", { style: { color: "#fff" }, children: selList.length }),
                " รายการ"
              ]
            }),
            _jsx("button", {
              type: "button",
              onClick: opt.onClose,
              style: {
                background: opt.isCandle
                  ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                  : "linear-gradient(135deg, #10b981, #059669)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "9px 26px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: opt.isCandle
                  ? "0 4px 14px rgba(37,99,235,0.4)"
                  : "0 4px 14px rgba(16,185,129,0.4)"
              },
              children: `🎯 ยืนยันการเลือก (${selList.length} รายการ)`
            })
          ]
        })
      ]
    })
  });
};


export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!1), [currentUser, setCurrentUser] = useState(null), getUserKey = b => {
        let D = "guest";
        if (currentUser != null && currentUser.username) D = currentUser.username.toLowerCase();
        else {
            const z = sessionStorage.getItem("trader_user");
            if (z) try {
                D = JSON.parse(z).username.toLowerCase()
            } catch {}
        }
        return `${D}_${b}`
    }, [usernameInput, setUsernameInput] = useState(() => localStorage.getItem("saved_username") || ""), [passwordInput, setPasswordInput] = useState(() => {
        try {
            return localStorage.getItem("saved_remember") === "1" ? atob(localStorage.getItem("saved_password") || "") : ""
        } catch {
            return ""
        }
    }), [rememberMe, setRememberMe] = useState(() => localStorage.getItem("saved_remember") === "1"), [appsScriptUrl, setAppsScriptUrl] = useState(CONFIG.getAppsScriptUrl()), [authError, setAuthError] = useState(""), [authLoading, setAuthLoading] = useState(!1), [spreadsheetId, setSpreadsheetId] = useState(CONFIG.SPREADSHEET_ID), [activeSheetTab, setActiveSheetTab] = useState("active_trades"), getTodayDateString = () => {
        const b = new Date;
        return b.getFullYear() + "-" + String(b.getMonth() + 1).padStart(2, "0") + "-" + String(b.getDate()).padStart(2, "0")
    }, getCurrentTimeString = () => {
        const b = new Date;
        return String(b.getHours()).padStart(2, "0") + ":" + String(b.getMinutes()).padStart(2, "0")
    }, calculatePointsDistance = (b, D, z) => {
        const V = parseFloat(b),
            L = parseFloat(D);
        if (isNaN(V) || isNaN(L) || V <= 0 || L <= 0) return null;
        const W = String(z || "").toUpperCase().trim();
        let T = 100;
        W.includes("JPY") ? T = 1e3 : (W.includes("EUR") || W.includes("GBP") || W.includes("USD") || W.includes("AUD") || W.includes("CAD") || W.includes("CHF") || W.includes("NZD")) && (W.includes("XAU") || (T = 1e5));
        const $ = Math.abs(L - V);
        return Math.round($ * T)
    }, getPairMultiplier = b => {
        const D = String(b || "").toUpperCase().trim();
        return D.includes("JPY") ? 1e3 : (D.includes("EUR") || D.includes("GBP") || D.includes("USD") || D.includes("AUD") || D.includes("CAD") || D.includes("CHF") || D.includes("NZD")) && !D.includes("XAU") ? 1e5 : 100
    }, handleTpPriceChange = b => {
        const D = b.target.value,
            z = parseFloat(newTrade.entryPrice),
            V = parseFloat(D);
        let L = newTrade.tpPoints;
        if (!isNaN(z) && !isNaN(V) && z > 0 && V > 0) {
            const W = getPairMultiplier(newTrade.pair);
            L = String(Math.round(Math.abs(V - z) * W))
        }
        setNewTrade(W => ({
            ...W,
            tpPrice: D,
            tpPoints: L
        }))
    }, handleTpPointsChange = b => {
        const ptsStr = b.target.value,
            entry = parseFloat(newTrade.entryPrice),
            pts = parseFloat(ptsStr);
        let newPrice = newTrade.tpPrice;
        if (!isNaN(entry) && !isNaN(pts) && entry > 0 && pts > 0) {
            const mult = getPairMultiplier(newTrade.pair),
                isBuy = String(newTrade.type).toLowerCase().includes("buy"),
                dist = pts / mult,
                target = isBuy ? entry + dist : entry - dist,
                decimals = newTrade.pair.toUpperCase().includes("JPY") || newTrade.pair.toUpperCase().includes("XAU") ? 2 : 5;
            newPrice = target.toFixed(decimals);
        }
        setNewTrade(z => ({
            ...z,
            tpPoints: ptsStr,
            tpPrice: newPrice
        }))
    }, handleSlPriceChange = b => {
        const D = b.target.value,
            z = parseFloat(newTrade.entryPrice),
            V = parseFloat(D);
        let L = newTrade.slPoints;
        if (!isNaN(z) && !isNaN(V) && z > 0 && V > 0) {
            const W = getPairMultiplier(newTrade.pair);
            L = String(Math.round(Math.abs(V - z) * W))
        }
        setNewTrade(W => ({
            ...W,
            slPrice: D,
            slPoints: L
        }))
    }, handleSlPointsChange = b => {
        const ptsStr = b.target.value,
            entry = parseFloat(newTrade.entryPrice),
            pts = parseFloat(ptsStr);
        let newPrice = newTrade.slPrice;
        if (!isNaN(entry) && !isNaN(pts) && entry > 0 && pts > 0) {
            const mult = getPairMultiplier(newTrade.pair),
                isBuy = String(newTrade.type).toLowerCase().includes("buy"),
                dist = pts / mult,
                target = isBuy ? entry - dist : entry + dist,
                decimals = newTrade.pair.toUpperCase().includes("JPY") || newTrade.pair.toUpperCase().includes("XAU") ? 2 : 5;
            newPrice = target.toFixed(decimals);
        }
        setNewTrade(z => ({
            ...z,
            slPoints: ptsStr,
            slPrice: newPrice
        }))
    }, [assetList, setAssetList] = useState(["XAUUSD", "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "BTCUSD", "US30"]), [showAssetModal, setShowAssetModal] = useState(!1), [newAssetInput, setNewAssetInput] = useState(""), handleAddAsset = () => {
        const b = newAssetInput.trim().toUpperCase();
        if (!b) return;
        if (assetList.includes(b)) {
            alert("คู่เงิน/หุ้นนี้มีอยู่แล้วในรายการ");
            return
        }
        const D = [...assetList, b];
        setAssetList(D), localStorage.setItem(getUserKey(`${activeMarketType}_dashboard_assets`), JSON.stringify(D)), setNewAssetInput(""), setNewTrade(z => ({
            ...z,
            pair: b
        }))
    }, handleRemoveAsset = b => {
        if (assetList.length <= 1) {
            alert("ต้องมีคู่เงินอย่างน้อย 1 รายการในระบบ");
            return
        }
        const D = assetList.filter(z => z !== b);
        setAssetList(D), localStorage.setItem(getUserKey(`${activeMarketType}_dashboard_assets`), JSON.stringify(D)), newTrade.pair === b && setNewTrade(z => ({
            ...z,
            pair: D[0]
        }))
    }, handleAddEntryType = () => {
        const b = newEntryTypeInput.trim();
        if (!b) return;
        if (entryTypeList.includes(b)) {
            alert("ประเภทการเข้านี้มีอยู่แล้ว");
            return
        }
        const D = [...entryTypeList, b];
        setEntryTypeList(D), localStorage.setItem(getUserKey(`${activeMarketType}_dashboard_entry_types`), JSON.stringify(D)), setNewEntryTypeInput(""), setNewTrade(z => ({
            ...z,
            type: b
        }))
    }, handleEditEntryType = (oldVal) => {
        const newVal = prompt("แก้ไขประเภทการเข้า:", oldVal);
        if (newVal === null) return;
        const trimmed = newVal.trim();
        if (!trimmed) return;
        if (entryTypeList.includes(trimmed) && trimmed !== oldVal) {
            alert("ประเภทการเข้านี้มีอยู่แล้ว");
            return
        }
        const D = entryTypeList.map(z => z === oldVal ? trimmed : z);
        setEntryTypeList(D), localStorage.setItem(getUserKey(`${activeMarketType}_dashboard_entry_types`), JSON.stringify(D)), newTrade.type === oldVal && setNewTrade(z => ({
            ...z,
            type: trimmed
        }))
    }, handleRemoveEntryType = b => {
        if (entryTypeList.length <= 1) {
            alert("ต้องมีรายการประเภทการเข้าอย่างน้อย 1 รายการ");
            return
        }
        const D = entryTypeList.filter(z => z !== b);
        setEntryTypeList(D), localStorage.setItem(getUserKey(`${activeMarketType}_dashboard_entry_types`), JSON.stringify(D)), newTrade.type === b && setNewTrade(z => ({
            ...z,
            type: D[0]
        }))
    }, [candleList, setCandleList] = useState(["Pin Bar", "Engulfing", "Doji", "Inside Bar", "Morning Star", "Three White Soldiers"]), [showCandleModal, setShowCandleModal] = useState(!1), [newCandleInput, setNewCandleInput] = useState(""), [editingCandleIndex, setEditingCandleIndex] = useState(null), [editingCandleText, setEditingCandleText] = useState(""), [entryTypeList, setEntryTypeList] = useState([]), [showEntryTypeModal, setShowEntryTypeModal] = useState(!1), [newEntryTypeInput, setNewEntryTypeInput] = useState(""), [currentPrices, setCurrentPrices] = useState({}), handleAddCandle = () => {
        const b = newCandleInput.trim();
        if (!b) return;
        if (candleList.includes(b)) {
            alert("รายการนี้มีอยู่แล้ว");
            return
        }
        const D = [...candleList, b];
        setCandleList(D), localStorage.setItem(getUserKey("forex_dashboard_candle_reasons"), JSON.stringify(D)), setNewCandleInput(""), setNewTrade(z => ({
            ...z,
            candleReasons: [...z.candleReasons || [], b]
        }))
    }, handleRemoveCandle = b => {
        if (candleList.length <= 1) {
            alert("ต้องมีรายการอย่างน้อย 1 รายการ");
            return;
        }
        const D = candleList.filter(z => z !== b);
        setCandleList(D);
        localStorage.setItem(getUserKey("forex_dashboard_candle_reasons"), JSON.stringify(D));
        setNewTrade(z => ({
            ...z,
            candleReasons: (z.candleReasons || []).filter(V => V !== b)
        }));
    }, handleStartEditCandle = (index, oldText) => {
        setEditingCandleIndex(index);
        setEditingCandleText(oldText);
    }, handleCancelEditCandle = () => {
        setEditingCandleIndex(null);
        setEditingCandleText("");
    }, handleSaveEditCandle = (index, oldText) => {
        const trimmed = editingCandleText.trim();
        if (!trimmed) {
            alert("กรุณาระบุชื่อเหตุผลแท่งเทียน");
            return;
        }
        if (trimmed !== oldText && candleList.includes(trimmed)) {
            alert("มีรายการนี้อยู่แล้ว");
            return;
        }
        const updated = [...candleList];
        updated[index] = trimmed;
        setCandleList(updated);
        localStorage.setItem(getUserKey("forex_dashboard_candle_reasons"), JSON.stringify(updated));
        setNewTrade(prev => {
            const reasons = prev.candleReasons || [];
            if (reasons.includes(oldText)) {
                return {
                    ...prev,
                    candleReasons: reasons.map(r => r === oldText ? trimmed : r)
                };
            }
            return prev;
        });
        setEditingCandleIndex(null);
        setEditingCandleText("");
    }, [indicatorList, setIndicatorList] = useState(["RSI Oversold", "RSI Overbought", "MACD Golden Cross", "EMA 50/200 Cross", "Bollinger Bands Bounce", "Stochastic Cross"]), [showIndicatorModal, setShowIndicatorModal] = useState(!1), [$isLoggedIn, setNewIndicatorInput] = useState(""), [editingIndicatorIndex, setEditingIndicatorIndex] = useState(null), [editingIndicatorText, setEditingIndicatorText] = useState(""), handleAddIndicator = () => {
        const b = $isLoggedIn.trim();
        if (!b) return;
        if (indicatorList.includes(b)) {
            alert("รายการนี้มีอยู่แล้ว");
            return
        }
        const D = [...indicatorList, b];
        setIndicatorList(D), localStorage.setItem(getUserKey("forex_dashboard_indicator_reasons"), JSON.stringify(D)), setNewIndicatorInput(""), setNewTrade(z => ({
            ...z,
            indicatorReasons: [...z.indicatorReasons || [], b]
        }))
    }, handleRemoveIndicator = b => {
        if (indicatorList.length <= 1) {
            alert("ต้องมีรายการอย่างน้อย 1 รายการ");
            return;
        }
        const D = indicatorList.filter(z => z !== b);
        setIndicatorList(D);
        localStorage.setItem(getUserKey("forex_dashboard_indicator_reasons"), JSON.stringify(D));
        setNewTrade(z => ({
            ...z,
            indicatorReasons: (z.indicatorReasons || []).filter(V => V !== b)
        }));
    }, handleStartEditIndicator = (index, oldText) => {
        setEditingIndicatorIndex(index);
        setEditingIndicatorText(oldText);
    }, handleCancelEditIndicator = () => {
        setEditingIndicatorIndex(null);
        setEditingIndicatorText("");
    }, handleSaveEditIndicator = (index, oldText) => {
        const trimmed = editingIndicatorText.trim();
        if (!trimmed) {
            alert("กรุณาระบุชื่อเหตุผล Indicator");
            return;
        }
        if (trimmed !== oldText && indicatorList.includes(trimmed)) {
            alert("มีรายการนี้อยู่แล้ว");
            return;
        }
        const updated = [...indicatorList];
        updated[index] = trimmed;
        setIndicatorList(updated);
        localStorage.setItem(getUserKey("forex_dashboard_indicator_reasons"), JSON.stringify(updated));
        setNewTrade(prev => {
            const reasons = prev.indicatorReasons || [];
            if (reasons.includes(oldText)) {
                return {
                    ...prev,
                    indicatorReasons: reasons.map(r => r === oldText ? trimmed : r)
                };
            }
            return prev;
        });
        setEditingIndicatorIndex(null);
        setEditingIndicatorText("");
    }, [newTrade, setNewTrade] = useState({
        date: getTodayDateString(),
        time: getCurrentTimeString(),
        pair: "XAUUSD",
        type: "Buy",
        entryPrice: "",
        tpPrice: "",
        slPrice: "",
        tpPoints: "300",
        slPoints: "150",
        candleReasons: [],
        indicatorReasons: [],
        setup: "",
        feelings: "",
        remarks: ""
    }), [selectedActiveTrade, setSelectedActiveTrade] = useState(null), [activeClosingTrade, setActiveClosingTrade] = useState(null), [closeDetails, setCloseDetails] = useState({
        outcome: "Win",
        pips: "",
        profitUSD: "",
        remarks: "",
        closeMethod: "plan",
        closePrice: "",
        lotSize: "0.01",
        withholdingTax: "7"
    }), [initialCapital, setInitialCapital] = useState(50), [profitTarget, setProfitTarget] = useState(500), [showTargetSettings, setShowTargetSettings] = useState(!1), [hideSheetTrades, setHideSheetTrades] = useState(!1), [editingActiveTradeId, setEditingActiveTradeId] = useState(null), [editTrade, setEditTrade] = useState({
        date: "",
        time: "",
        pair: "",
        type: "Buy",
        entryPrice: "",
        risk: "",
        setup: "",
        feelings: "",
        remarks: "",
        tpPrice: "",
        slPrice: "",
        tpPoints: "300",
        slPoints: "150",
        candleReasons: [],
        indicatorReasons: []
    }), [selectedClosedTrade, setSelectedClosedTrade] = useState(null),
    [qSearch, setQSearch] = useState(""), [qCat, setQCat] = useState("ALL"),
    [qIndSearch, setQIndSearch] = useState(""), [qIndCat, setQIndCat] = useState("ALL"),
    [goldCalcType, setGoldCalcType] = useState("bar"), [goldCalcGrams, setGoldCalcGrams] = useState(""), [activeTradesViewMode, setActiveTradesViewMode] = useState("cards"), [sidebarMenuExpanded, setSidebarMenuExpanded] = useState(!0), [mobileMenuOpen, setMobileMenuOpen] = useState(!1), [showImportModal, setShowImportModal] = useState(!1), [showExportModal, setShowExportModal] = useState(!1), [reasonPickerModal, setReasonPickerModal] = useState(null), [isLocalMode, setIsLocalMode] = useState(!1), [localTrades, setLocalTrades] = useState(!1), [deletedTradeIds, setDeletedTradeIds] = useState(!1), [isDemoModeLocal, setIsDemoModeLocal] = useState(!1), getMarketBadgeStyle = b => {
        switch (b) {
            case "analysis":
                return {
                    color: "#3B82F6", bg: "rgba(59, 130, 246, 0.15)", gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))"
                };
            case "thai_stock_analysis":
                return {
                    color: "#10B981", bg: "rgba(16, 185, 129, 0.15)", gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))"
                };
            case "inter_stock_analysis":
                return {
                    color: "#38BDF8", bg: "rgba(56, 189, 248, 0.15)", gradient: "linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(56, 189, 248, 0.05))"
                };
            case "gold_analysis":
                return {
                    color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)", gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))"
                };
            case "overview":
                return {
                    color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.15)", gradient: "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))"
                };
            case "journal_plan":
                return {
                    color: "#F97316", bg: "rgba(249, 115, 22, 0.15)", gradient: "linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(249, 115, 22, 0.05))"
                };
            case "settings":
                return {
                    color: "#94A3B8", bg: "rgba(148, 163, 184, 0.15)", gradient: "linear-gradient(135deg, rgba(148, 163, 184, 0.2), rgba(148, 163, 184, 0.05))"
                };
            case "oil_analysis":
                return {
                    color: "#EC4899", bg: "rgba(236, 72, 153, 0.15)", gradient: "linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(236, 72, 153, 0.05))"
                };
            case "admin_users":
                return {
                    color: "#EF4444", bg: "rgba(239, 68, 68, 0.15)", gradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05))"
                };
            default:
                return {
                    color: "#3B82F6", bg: "rgba(59, 130, 246, 0.15)", gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))"
                }
        }
    }, [activeTab, setActiveTab] = useState(() => {
        try {
            if (typeof window !== "undefined") {
                const params = new URLSearchParams(window.location.search);
                const t = params.get("tab");
                if (t) return t;
                const savedTab = localStorage.getItem("onicorn_active_tab");
                if (savedTab) return savedTab;
            }
        } catch(e) {}
        return "inter_gold_analysis";
    }), [activeMarketType, setActiveMarketType] = useState("forex"), [selectedPlanSheet, setSelectedPlanSheet] = useState("PLAN 2569"), [overviewPairFilter, setOverviewPairFilter] = useState("ALL"), [overviewResultFilter, setOverviewResultFilter] = useState("ALL"), [overviewLimitFilter, setOverviewLimitFilter] = useState(10), [tradesData, setTradesData] = useState([]), [planData, setPlanData] = useState(null), [sessionLogs, setSessionLogs] = useState([]), [loading, setLoading] = useState(!1), [dataError, setDataError] = useState(""), [isDemoMode, setIsDemoMode] = useState(!1), [$authLoading, setShowConfigAlert] = useState(!1), [pairFilter, setPairFilter] = useState("ALL"), [resultFilter, setResultFilter] = useState("ALL"), chartRef1 = useRef(null), $setPasswordInput = useRef(null), zo = useRef(null), No = useRef(null);
    useEffect(() => {
        if (activeTab && typeof window !== "undefined") {
            try {
                localStorage.setItem("onicorn_active_tab", activeTab);
            } catch(e) {}
        }
    }, [activeTab]);
    useEffect(() => {
        if ((activeTab === "journal_plan" || activeTab === "overview") && activeMarketType === "thai_gold") {
            setActiveMarketType("forex");
        }
    }, [activeTab, activeMarketType]);
    useEffect(() => {
        if (!isDemoMode) return;
        const interval = setInterval(() => {
            setCurrentPrices(prev => {
                const next = { ...prev };
                tradesData.forEach(trade => {
                    const id = trade.id || trade.uniqueId;
                    if (id) {
                        const entryPrice = parseFloat(trade["ราคาที่เข้า"] || 0);
                        if (entryPrice > 0) {
                            const current = next[id] !== undefined ? next[id] : entryPrice;
                            const changePercent = (Math.random() - 0.5) * 0.001;
                            next[id] = current * (1 + changePercent);
                        }
                    }
                });
                return next;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, [tradesData, isDemoMode]);

    useEffect(() => {
        const fetchLivePrices = async () => {
            const activeTrades = tradesData.filter((t) => (t.marketType || "forex") === activeMarketType && (!t["สถานะ"] || t["สถานะ"] === "ถืออยู่" || t["สถานะ"] === "Active" || !t["ผลลัพธ์"] || t["ผลลัพธ์"] === "Active"));
            if (activeTrades.length === 0) return;
            const symbols = Array.from(new Set(activeTrades.map(t => (t["คู่เงิน"] || t.pair || "").trim()))).filter(Boolean).join(",");
            if (!symbols) return;
            try {
                const res = await fetch(`/api/price?symbol=${encodeURIComponent(symbols)}&marketType=${activeMarketType}`);
                const data = await res.json();
                const prices = { ...(data?.prices || {}) };
                if (data && typeof data.price === "number") {
                    symbols.split(",").forEach(s => {
                        const sTrim = s.trim();
                        prices[sTrim] = data.price;
                        prices[sTrim.toUpperCase()] = data.price;
                    });
                }
                if (data && data.results) {
                    Object.entries(data.results).forEach(([k, v]) => {
                        if (v && typeof v.price === "number") {
                            prices[k] = v.price;
                            prices[k.toUpperCase()] = v.price;
                        }
                    });
                }
                if (data) {
                    Object.entries(data).forEach(([k, v]) => {
                        if (v && typeof v.price === "number") {
                            prices[k] = v.price;
                            prices[k.toUpperCase()] = v.price;
                        }
                    });
                }
                if (Object.keys(prices).length > 0) {
                    setCurrentPrices((prev) => {
                        const next = { ...prev };
                        activeTrades.forEach((t) => {
                            const symKey = (t["คู่เงิน"] || t.pair || "").trim();
                            const p = prices[symKey] ?? prices[symKey.toUpperCase()];
                            if (p !== undefined) {
                                next[t.id] = p;
                                next[symKey] = p;
                                next[symKey.toUpperCase()] = p;
                            }
                        });
                        return next;
                    });
                }
            } catch (err) {
                console.error("Failed to fetch live prices:", err);
            }
        };
        fetchLivePrices();
        const interval = setInterval(fetchLivePrices, 10000);
        return () => clearInterval(interval);
    }, [tradesData, activeMarketType]);
    useEffect(() => {
        const b = sessionStorage.getItem("trader_user"),
            D = sessionStorage.getItem("trader_token");
        b && D && (setIsLoggedIn(!0), setCurrentUser(JSON.parse(b)))
    }, []), useEffect(() => {
        const b = currentUser != null && currentUser.username ? currentUser.username.toLowerCase() : "guest",
            D = localStorage.getItem(`${b}_${activeMarketType}_dashboard_assets`);
        let z = ["XAUUSD", "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "BTCUSD", "US30"];
        activeMarketType === "thai_stock" ? z = ["PTT", "CPALL", "ADVANC", "KBANK", "BDMS", "AOT", "SCC"] : activeMarketType === "inter_stock" && (z = ["AAPL", "TSLA", "NVDA", "MSFT", "AMZN", "GOOGL", "META"]);
        const V = D ? JSON.parse(D) : z;
        setAssetList(V);
        const L = localStorage.getItem(`${b}_${activeMarketType}_dashboard_candle_reasons`),
            W = L ? JSON.parse(L) : ["Pin Bar", "Engulfing", "Doji", "Inside Bar", "Morning Star", "Three White Soldiers"];
        setCandleList(W);
        const T = localStorage.getItem(`${b}_${activeMarketType}_dashboard_indicator_reasons`),
            $ = T ? JSON.parse(T) : ["RSI Oversold", "RSI Overbought", "MACD Golden Cross", "EMA 50/200 Cross", "Bollinger Bands Bounce", "Stochastic Cross"];
        setIndicatorList($);
        const savedEntryTypes = localStorage.getItem(`${b}_${activeMarketType}_dashboard_entry_types`),
            defaultEntryTypes = activeMarketType === "forex" ? ["Buy", "Sell", "Buy Limit", "Sell Limit"] : ["Buy", "Buy Limit"],
            entryTypesList = savedEntryTypes ? JSON.parse(savedEntryTypes) : defaultEntryTypes;
        setEntryTypeList(entryTypesList);
        const Z = localStorage.getItem(`${b}_${activeMarketType}_dashboard_initial_capital`);
        let lt = 50;
        activeMarketType === "thai_stock" ? lt = 1e4 : activeMarketType === "inter_stock" && (lt = 1e3), setInitialCapital(Z ? parseFloat(Z) : lt);
        const Dt = localStorage.getItem(`${b}_${activeMarketType}_dashboard_profit_target`);
        let Fe = 500;
        activeMarketType === "thai_stock" ? Fe = 5e4 : activeMarketType === "inter_stock" && (Fe = 5e3), setProfitTarget(Dt ? parseFloat(Dt) : Fe);
        const Pi = localStorage.getItem(`${b}_${activeMarketType}_dashboard_hide_sheet_trades`);
        setHideSheetTrades(Pi === "true");
        const defaultInitPair = V[0] || (activeMarketType === "forex" ? "XAUUSD" : activeMarketType === "thai_stock" ? "PTT" : "AAPL");
        setNewTrade(Ui => ({
            ...Ui,
            pair: defaultInitPair,
            type: entryTypesList[0] || "Buy",
            candleReasons: [],
            indicatorReasons: []
        }));
        fetch(`/api/price?symbol=${encodeURIComponent(defaultInitPair)}&marketType=${encodeURIComponent(activeMarketType)}`)
            .then(r => r.json())
            .then(d => {
                if (d && typeof d.price === "number" && d.price > 0) {
                    setNewTrade(prev => ({ ...prev, entryPrice: String(d.price) }));
                }
            }).catch(() => {});
    }, [currentUser, isLoggedIn, activeMarketType]), useEffect(() => {
        isLoggedIn && loadAllData()
    }, [isLoggedIn, selectedPlanSheet, isDemoMode]), useEffect(() => {
        const b = parseFloat(newTrade.entryPrice);
        if (isNaN(b) || b <= 0) return;
        const D = getPairMultiplier(newTrade.pair),
            z = parseFloat(newTrade.tpPoints) || 0,
            V = parseFloat(newTrade.slPoints) || 0,
            L = String(newTrade.type).toLowerCase().includes("buy");
        let W = "";
        if (z > 0) {
            const Dt = z / D;
            W = L ? b + Dt : b - Dt
        }
        let T = "";
        if (V > 0) {
            const Dt = V / D;
            T = L ? b - Dt : b + Dt
        }
        const $ = newTrade.pair.toUpperCase().includes("JPY") || newTrade.pair.toUpperCase().includes("XAU") ? 2 : 5,
            Z = W !== "" ? W.toFixed($) : "",
            lt = T !== "" ? T.toFixed($) : "";
        (Z !== newTrade.tpPrice || lt !== newTrade.slPrice) && setNewTrade(Dt => ({
            ...Dt,
            tpPrice: Z,
            slPrice: lt
        }))
    }, [newTrade.entryPrice, newTrade.type, newTrade.pair, newTrade.tpPoints, newTrade.slPoints]), useEffect(() => (isLoggedIn && activeTab === "overview" && tradesData.length > 0 && renderCharts(), () => {
        destroyCharts()
    }), [activeTab, tradesData, isLoggedIn, activeMarketType]);
    const loadAllData = async () => {
        setLoading(!0), setDataError("");
        const b = localStorage.getItem(getUserKey("forex_dashboard_hide_sheet_trades")) === "true";
        if (isDemoMode) {
            const D = JSON.parse(localStorage.getItem(getUserKey("forex_dashboard_local_trades")) || "[]"),
                z = mockTrades.map((T, $) => ({
                    ...T,
                    id: T.id || `demo-${$}`
                })),
                V = b ? D : [...D, ...z.filter(T => !D.some($ => $.id === T.id))],
                L = JSON.parse(localStorage.getItem(getUserKey("forex_dashboard_deleted_trade_ids")) || "[]"),
                W = V.filter(T => !L.includes(T.id));
            setTradesData(W), setPlanData(defaultCompoundingPlan), setLoading(!1), fetchD1SessionLogs();
            return
        }
        try {
            const z = (await fetchSheetData(spreadsheetId, "DayTrader")).rows.map((ge, ke) => ({
                    ...ge,
                    id: ge.id || `sheet-${ke}`
                })),
                V = currentUser != null && currentUser.username ? currentUser.username.toLowerCase().trim() : "",
                L = z.filter(ge => {
                    const ke = Object.keys(ge).find(cn => ["ผู้ใช้งาน", "ผู้ใช้", "username", "user", "trader"].includes(cn.toLowerCase().trim()));
                    return ke ? ge[ke] && String(ge[ke]).toLowerCase().trim() === V : !0
                });
            let W = [],
                T = [],
                $ = !1;
            try {
                const ge = await fetch(`/api/trades?username=${encodeURIComponent(currentUser.username)}`);
                if (ge.ok) {
                    const ke = await ge.json();
                    ke.success && (W = ke.trades || [], T = ke.deletedIds || [], $ = !0)
                }
            } catch (ge) {
                console.warn("ไม่สามารถดึงข้อมูล D1 Database ได้ (อาจรันแบบ local dev server):", ge)
            }
            const Z = JSON.parse(localStorage.getItem(getUserKey("forex_dashboard_local_trades")) || "[]"),
                lt = JSON.parse(localStorage.getItem(getUserKey("forex_dashboard_deleted_trade_ids")) || "[]");
            if ($ && (Z.length > 0 || lt.length > 0)) {
                const ge = Z.filter(cn => !W.some(fb => fb.id === cn.id)),
                    ke = lt.filter(cn => !T.includes(cn));
                (ge.length > 0 || ke.length > 0) && fetch("/api/trades", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        action: "bulk",
                        username: currentUser.username,
                        localTrades: ge,
                        deletedIds: ke
                    })
                }).then(cn => {
                    cn.ok && console.log("ซิงค์ประวัติจากเครื่องขึ้น D1 สำเร็จ")
                }).catch(cn => console.error("Sync to D1 failed:", cn))
            }
            const Dt = $ ? W : Z,
                Fe = $ ? T : lt,
                Ui = (b ? Dt : [...Dt, ...L.filter(ge => !Dt.some(ke => ke.id === ge.id))]).filter(ge => !Fe.includes(ge.id));
            setTradesData(Ui);
            const ta = await fetchSheetData(spreadsheetId, selectedPlanSheet),
                Xc = parseCompoundingPlan(ta.rows);
            setPlanData(Xc), fetchD1SessionLogs()
        } catch (D) {
            console.error(D), setDataError("ไม่สามารถเชื่อมโยงข้อมูลจาก Google Sheets ได้สำเร็จ กรุณาตรวจสอบว่าชีตได้รับการแชร์เป็น 'ทุกคนที่มีลิงก์มีสิทธิ์อ่าน' แล้ว หรือเปลี่ยนไปใช้โหมด Demo เพื่อทดลองใช้งานเว็บไซต์"), setShowConfigAlert(!0)
        } finally {
            setLoading(!1)
        }
    }, fetchD1SessionLogs = async () => {
        try {
            const b = await fetch("/api/sessions");
            if (b.ok) {
                const D = await b.json();
                D.success && setSessionLogs(D.results)
            }
        } catch (b) {
            console.warn("ไม่สามารถดึงข้อมูล D1 Database ได้สำเร็จ (อาจเกิดจากการรันแบบสแตนด์อโลนโดยไม่มี backend):", b)
        }
    }, saveD1LoginLog = async b => {
        try {
            await fetch("/api/sessions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: b
                })
            })
        } catch (D) {
            console.warn("ไม่สามารถบันทึกประวัติล็อกอินลง D1 ได้:", D)
        }
    }, handleLogin = async b => {
        b.preventDefault(), setAuthError(""), setAuthLoading(!0);
        const D = CONFIG.getAppsScriptUrl();
        CONFIG.setAppsScriptUrl(D);
        try {
            const z = await fetch(D, {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },
                body: JSON.stringify({
                    username: usernameInput.trim(),
                    password: passwordInput.trim()
                })
            });
            if (!z.ok) throw new Error(`การเข้าสู่ระบบล้มเหลว: HTTP ${z.status}`);
            const V = await z.json();
            if (V.success) {
                const L = {
                    username: V.username,
                    role: V.role
                };
                sessionStorage.setItem("trader_user", JSON.stringify(L)), sessionStorage.setItem("trader_token", V.token), localStorage.setItem("saved_username", usernameInput.trim()), rememberMe ? (localStorage.setItem("saved_remember", "1"), localStorage.setItem("saved_password", btoa(passwordInput.trim()))) : (localStorage.setItem("saved_remember", "0"), localStorage.removeItem("saved_password")), setCurrentUser(L), setIsLoggedIn(!0), saveD1LoginLog(V.username)
            } else setAuthError(V.message || "เกิดข้อผิดพลาดในการตรวจสอบบัญชีผู้ใช้")
        } catch (z) {
            console.error(z), setAuthError("ไม่สามารถเชื่อมต่อไปยังเซิร์ฟเวอร์ลงชื่อเข้าใช้ได้ กรุณาตรวจสอบว่าได้ตั้งค่าและเผยแพร่ (Deploy) Apps Script เป็น 'Everyone' แล้ว หรือกรอกข้อมูลและเข้าใช้งานแบบโหมดสาธิต (Demo)")
        } finally {
            setAuthLoading(!1)
        }
    }, handleDemoLogin = () => {
        setIsDemoMode(!0);
        const b = {
            username: "DemoTrader",
            role: "Demo Viewer"
        };
        sessionStorage.setItem("trader_user", JSON.stringify(b)), sessionStorage.setItem("trader_token", "demo-token"), setCurrentUser(b), setIsLoggedIn(!0)
    }, Zy = b => {
        if (b.preventDefault(), !newTrade.entryPrice || isNaN(parseFloat(newTrade.entryPrice))) {
            alert("กรุณากรอกราคาที่เข้าให้ถูกต้อง");
            return;
        }
        const symKey = newTrade.pair.trim().toUpperCase();
        const isStockOrGold = activeMarketType === "thai_stock" || activeMarketType === "inter_stock" || activeMarketType === "foreign_stock" || activeMarketType === "thai_gold";
        const existingIdx = tradesData.findIndex(t => (t["ผลลัพธ์"] === "Active" || !t["ผลลัพธ์"]) && (t.marketType || activeMarketType) === activeMarketType && (t["คู่เงิน"] || "").trim().toUpperCase() === symKey && (t["ประเภทการเข้า"] || "Buy") === newTrade.type);
        
        let newTradeList = [], savedTradeObj = null;
        if (isStockOrGold && existingIdx >= 0) {
            const exTrade = tradesData[existingIdx];
            const oldEntry = parseFloat(exTrade["ราคาที่เข้า"]) || 0;
            const oldQty = parseFloat(exTrade["ความเสี่ยง"]) || 1;
            const newEntry = parseFloat(newTrade.entryPrice) || 0;
            const newQty = parseFloat(newTrade.risk) || 1;
            const combinedQty = oldQty + newQty;
            const totalCost = oldEntry * oldQty + newEntry * newQty;
            const newAvgPrice = combinedQty > 0 ? totalCost / combinedQty : newEntry;
            const unitLabel = activeMarketType === "thai_gold" ? "กรัม" : "หุ้น";
            const curLabel = activeMarketType === "thai_stock" || activeMarketType === "thai_gold" ? "บาท" : "USD";
            const mergedCandle = Array.from(new Set([...(exTrade["เหตุผลซัพพอร์ตออเดอร์\nแท่งเทียน"] || "").split(", ").filter(Boolean), ...(newTrade.candleReasons || [])])).join(", ");
            const mergedInd = Array.from(new Set([...(exTrade["เหตุผลซัพพอร์ต Indicator"] || "").split(", ").filter(Boolean), ...(newTrade.indicatorReasons || [])])).join(", ");
            
            savedTradeObj = {
                ...exTrade,
                "วันที่เปิด": `${newTrade.date} ${newTrade.time}`,
                "ช่วงเวลา": newTrade.time,
                "ราคาที่เข้า": parseFloat(newAvgPrice.toFixed(2)),
                "ความเสี่ยง": String(combinedQty),
                "เหตุผลซัพพอร์ตออเดอร์\nแท่งเทียน": mergedCandle,
                "เหตุผลซัพพอร์ต Indicator": mergedInd,
                "หมายเหตุ": `ซื้อถัวเฉลี่ยสะสม ${combinedQty.toLocaleString()} ${unitLabel} (ทุนเฉลี่ย ${newAvgPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${curLabel}/${unitLabel})${newTrade.remarks ? " | " + newTrade.remarks : ""}`.trim()
            };
            newTradeList = tradesData.map((t, idx) => idx === existingIdx ? savedTradeObj : t);
        } else {
            const D = `${newTrade.date} ${newTrade.time}`,
                z = calculatePointsDistance(newTrade.entryPrice, newTrade.tpPrice, newTrade.pair) || 300,
                V = calculatePointsDistance(newTrade.entryPrice, newTrade.slPrice, newTrade.pair) || 150;
            savedTradeObj = {
                id: "trade-" + Date.now(),
                marketType: activeMarketType,
                "วันที่เปิด": D,
                "ช่วงเวลา": newTrade.time,
                "คู่เงิน": symKey,
                "ประเภทการเข้า": newTrade.type,
                "ผลลัพธ์": "Active",
                "ราคาที่เข้า": parseFloat(newTrade.entryPrice),
                "ผลลัพธ์ (จุด)": null,
                "TP(จุด)\nที่ตั้งใว้": z,
                "SL(จุด)\nที่ตั้งใว้": V,
                "ราคา TP": parseFloat(newTrade.tpPrice) || null,
                "ราคา SL": parseFloat(newTrade.slPrice) || null,
                "ความเสี่ยง": activeMarketType === "forex" ? "N/A" : (newTrade.risk || "100"),
                "เหตุผลซัพพอร์ตออเดอร์\nแท่งเทียน": (newTrade.candleReasons || []).join(", "),
                "เหตุผลซัพพอร์ต Indicator": (newTrade.indicatorReasons || []).join(", "),
                "บันทึกความเสี่ยงของแผนเทรด": newTrade.setup,
                "บันทึกความรู้สึก": newTrade.feelings,
                "หมายเหตุ": (() => {
                    const amt = activeMarketType === "thai_gold" 
                        ? (parseFloat(newTrade.totalMoneyInput) || 0)
                        : (parseFloat(newTrade.entryPrice) || 0) * (parseFloat(newTrade.risk) || 0);
                    const txt = activeMarketType === "forex" ? "" : ` (จำนวนเงินที่ซื้อ: ${amt.toLocaleString()} ${activeMarketType === "thai_stock" || activeMarketType === "thai_gold" ? "บาท" : "USD"})`;
                    return newTrade.remarks ? `${newTrade.remarks}${txt}` : (txt ? txt.trim() : "ถือออเดอร์เปล่า");
                })(),
                "ผู้ใช้งาน": (currentUser == null ? void 0 : currentUser.username) || "Guest"
            };
            newTradeList = [savedTradeObj, ...tradesData];
        }
        
        const localList = JSON.parse(localStorage.getItem(getUserKey("forex_dashboard_local_trades")) || "[]");
        let updatedLocal = [];
        if (existingIdx >= 0 && isStockOrGold) {
            const locIdx = localList.findIndex(t => t.id === savedTradeObj.id);
            if (locIdx >= 0) {
                updatedLocal = localList.map((t, idx) => idx === locIdx ? savedTradeObj : t);
            } else {
                updatedLocal = [savedTradeObj, ...localList];
            }
        } else {
            updatedLocal = [savedTradeObj, ...localList];
        }
        
        localStorage.setItem(getUserKey("forex_dashboard_local_trades"), JSON.stringify(updatedLocal));
        if (!isDemoMode && currentUser != null && currentUser.username) {
            fetch("/api/trades", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "save", username: currentUser.username, trade: savedTradeObj })
            }).catch(err => console.error("D1 save failed:", err));
        }
        setTradesData(newTradeList);
        setNewTrade({
            date: getTodayDateString(),
            time: getCurrentTimeString(),
            pair: assetList[0] || "XAUUSD",
            type: "Buy",
            entryPrice: "",
            tpPrice: "",
            slPrice: "",
            tpPoints: "300",
            slPoints: "150",
            candleReasons: [],
            indicatorReasons: [],
            setup: "",
            feelings: "",
            remarks: ""
        });
    }, reopenTrade = async tradeId => {
        if (!window.confirm("คุณต้องการนำออเดอร์นี้กลับไปที่ 'ออเดอร์ที่กำลังถืออยู่' (Active Trades) ใช่หรือไม่?")) return;
        const localTrades = JSON.parse(localStorage.getItem(getUserKey("forex_dashboard_local_trades")) || "[]");
        let updated = localTrades.map(t => t.id === tradeId ? {
            ...t,
            "ผลลัพธ์": "Active",
            "ผลลัพธ์ (จุด)": null,
            "กำไร/ขาดทุน($)": null,
            "ผลกำไร/ขาดทุน": null,
            "ราคาที่ปิด": null
        } : t);
        const existing = tradesData.find(t => t.id === tradeId);
        if (existing && !localTrades.some(t => t.id === tradeId)) {
            updated = [{
                ...existing,
                "ผลลัพธ์": "Active",
                "ผลลัพธ์ (จุด)": null,
                "กำไร/ขาดทุน($)": null,
                "ผลกำไร/ขาดทุน": null,
                "ราคาที่ปิด": null,
                "ผู้ใช้งาน": (currentUser == null ? void 0 : currentUser.username) || "Guest"
            }, ...updated];
        }
        localStorage.setItem(getUserKey("forex_dashboard_local_trades"), JSON.stringify(updated));
        const tradeToSave = updated.find(t => t.id === tradeId);
        if (tradeToSave && !isDemoMode && currentUser != null && currentUser.username) {
            fetch("/api/trades", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "save", username: currentUser.username, trade: tradeToSave })
            }).catch(err => console.error("D1 reopen failed:", err));
        }
        await loadAllData();
        alert("นำออเดอร์กลับไปที่ 'ออเดอร์ที่กำลังถืออยู่' เรียบร้อยแล้ว");}, tb = b => {
        const activeTradeObj = tradesData.find($ => $.id === b);
        const D = parseFloat(closeDetails.pips || 0),
            z = activeMarketType === "forex"
                ? parseFloat(closeDetails.profitUSD || 0)
                : activeTradeObj
                    ? (() => {
                        const entry = parseFloat(activeTradeObj["ราคาที่เข้า"] || 0);
                        const close = parseFloat(closeDetails.closePrice || 0);
                        const qty = parseFloat(closeDetails.lotSize || 0);
                        const taxPercent = parseFloat(closeDetails.withholdingTax || 0);
                        const gross = (close - entry) * qty;
                        const tax = gross > 0 ? gross * (taxPercent / 100) : 0;
                        return gross - tax;
                    })()
                    : 0,
            V = JSON.parse(localStorage.getItem(getUserKey("forex_dashboard_local_trades")) || "[]");
        let L = V.map($ => $.id === b ? {
            ...$,
            "ผลลัพธ์": closeDetails.outcome,
            "ผลลัพธ์ (จุด)": D,
            "กำไร/ขาดทุน($)": z,
            "ราคาที่ปิด": parseFloat(closeDetails.closePrice) || null,
            "หมายเหตุ": closeDetails.remarks || $.หมายเหตุ
        } : $);
        const W = tradesData.find($ => $.id === b);
        W && !V.some($ => $.id === b) && (L = [{
            ...W,
            "ผลลัพธ์": closeDetails.outcome,
            "ผลลัพธ์ (จุด)": D,
            "กำไร/ขาดทุน($)": z,
            "ราคาที่ปิด": parseFloat(closeDetails.closePrice) || null,
            "หมายเหตุ": closeDetails.remarks || W["หมายเหตุ"],
            "ผู้ใช้งาน": (currentUser == null ? void 0 : currentUser.username) || "Guest"
        }, ...L]), localStorage.setItem(getUserKey("forex_dashboard_local_trades"), JSON.stringify(L));
        const T = L.find($ => $.id === b);
        T && !isDemoMode && (currentUser != null && currentUser.username) && fetch("/api/trades", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "save",
                username: currentUser.username,
                trade: T
            })
        }).catch($ => console.error("D1 save failed:", $)), loadAllData(), setSelectedActiveTrade(null), setActiveClosingTrade(null), setCloseDetails({
            outcome: "Win",
            pips: "",
            profitUSD: "",
            remarks: "",
            closeMethod: "plan",
            closePrice: "",
            lotSize: activeMarketType === "forex" ? "0.01" : "100",
            withholdingTax: "7"
        })
    }, Dh = b => {
        if (!window.confirm("คุณต้องการลบข้อมูลออเดอร์นี้ใช่หรือไม่?")) return;
        const z = JSON.parse(localStorage.getItem(getUserKey("forex_dashboard_local_trades")) || "[]").filter(L => L.id !== b);
        localStorage.setItem(getUserKey("forex_dashboard_local_trades"), JSON.stringify(z));
        const V = JSON.parse(localStorage.getItem(getUserKey("forex_dashboard_deleted_trade_ids")) || "[]");
        V.includes(b) || (V.push(b), localStorage.setItem(getUserKey("forex_dashboard_deleted_trade_ids"), JSON.stringify(V))), !isDemoMode && (currentUser != null && currentUser.username) && fetch("/api/trades", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "delete",
                username: currentUser.username,
                tradeId: b
            })
        }).catch(L => console.error("D1 delete failed:", L)), loadAllData()
    }, eb = b => {
        const D = b.target.value;
        if (!activeClosingTrade) return;
        const z = parseFloat(activeClosingTrade["ราคาที่เข้า"]) || 0,
            V = parseFloat(D);
        let L = closeDetails.pips;
        if (!isNaN(z) && !isNaN(V)) {
            const W = getPairMultiplier(activeClosingTrade["คู่เงิน"]),
                T = String(activeClosingTrade["ประเภทการเข้า"]).toLowerCase().includes("buy"),
                $ = V - z;
            L = String(Math.round((T ? $ : -$) * W))
        }
        setCloseDetails(W => ({
            ...W,
            closePrice: D,
            pips: L
        }))
    }, ib = b => {
        const D = b.target.value,
            z = parseFloat(D),
            V = parseFloat(closeDetails.lotSize) || .01;
        let L = closeDetails.pips,
            W = closeDetails.closePrice;
        if (!isNaN(z) && activeClosingTrade) {
            const Z = (closeDetails.outcome === "Loss" ? -Math.abs(z) : Math.abs(z)) / V;
            L = String(Math.round(Z));
            const lt = parseFloat(activeClosingTrade["ราคาที่เข้า"]) || 0;
            if (!isNaN(lt)) {
                const Dt = getPairMultiplier(activeClosingTrade["คู่เงิน"]),
                    Fe = String(activeClosingTrade["ประเภทการเข้า"]).toLowerCase().includes("buy"),
                    Pi = activeClosingTrade["คู่เงิน"].toUpperCase().includes("JPY") || activeClosingTrade["คู่เงิน"].toUpperCase().includes("XAU") ? 2 : 5,
                    Ui = Z / Dt;
                W = (Fe ? lt + Ui : lt - Ui).toFixed(Pi)
            }
        }
        setCloseDetails(T => ({
            ...T,
            profitUSD: D,
            pips: L,
            closePrice: W
        }))
    }, nb = b => {
        const D = b.target.value,
            z = parseFloat(D) || .01,
            V = parseFloat(closeDetails.profitUSD);
        let L = closeDetails.pips,
            W = closeDetails.closePrice;
        if (!isNaN(V) && activeClosingTrade) {
            const Z = (closeDetails.outcome === "Loss" ? -Math.abs(V) : Math.abs(V)) / z;
            L = String(Math.round(Z));
            const lt = parseFloat(activeClosingTrade["ราคาที่เข้า"]) || 0;
            if (!isNaN(lt)) {
                const Dt = getPairMultiplier(activeClosingTrade["คู่เงิน"]),
                    Fe = String(activeClosingTrade["ประเภทการเข้า"]).toLowerCase().includes("buy"),
                    Pi = activeClosingTrade["คู่เงิน"].toUpperCase().includes("JPY") || activeClosingTrade["คู่เงิน"].toUpperCase().includes("XAU") ? 2 : 5,
                    Ui = Z / Dt;
                W = (Fe ? lt + Ui : lt - Ui).toFixed(Pi)
            }
        }
        setCloseDetails(T => ({
            ...T,
            lotSize: D,
            pips: L,
            closePrice: W
        }))
    }, sb = b => {
        const D = b.target.value;
        if (!activeClosingTrade) return;
        const z = parseFloat(activeClosingTrade["ราคาที่เข้า"]) || 0,
            V = parseFloat(D);
        let L = closeDetails.closePrice;
        if (!isNaN(z) && !isNaN(V)) {
            const W = getPairMultiplier(activeClosingTrade["คู่เงิน"]),
                T = String(activeClosingTrade["ประเภทการเข้า"]).toLowerCase().includes("buy"),
                $ = activeClosingTrade["คู่เงิน"].toUpperCase().includes("JPY") || activeClosingTrade["คู่เงิน"].toUpperCase().includes("XAU") ? 2 : 5,
                Z = V / W;
            L = (T ? z + Z : z - Z).toFixed($)
        }
        setCloseDetails(W => ({
            ...W,
            pips: D,
            closePrice: L
        }))
    };
    useEffect(() => {
        if (activeClosingTrade && closeDetails.closeMethod === "plan") {
            const b = parseFloat(activeClosingTrade["ราคาที่เข้า"]) || 0,
                D = String(activeClosingTrade["ประเภทการเข้า"]).toLowerCase().includes("buy"),
                z = getPairMultiplier(activeClosingTrade["คู่เงิน"]),
                V = activeClosingTrade["คู่เงิน"].toUpperCase().includes("JPY") || activeClosingTrade["คู่เงิน"].toUpperCase().includes("XAU") ? 2 : 5;
            let L = 300,
                W = b;
            if (closeDetails.outcome === "Win") L = parseInt(activeClosingTrade[`"TP(จุด)\nที่ตั้งใว้"`]) || 300, W = activeClosingTrade["ราคา TP"] ? parseFloat(activeClosingTrade["ราคา TP"]) : D ? b + L / z : b - L / z;
            else if (closeDetails.outcome === "Loss") {
                const T = parseInt(activeClosingTrade[`"SL(จุด)\nที่ตั้งใว้"`]) || 150;
                L = -T, W = activeClosingTrade["ราคา SL"] ? parseFloat(activeClosingTrade["ราคา SL"]) : D ? b - T / z : b + T / z
            } else L = 10, W = b + 10 / z * (D ? 1 : -1);
            setCloseDetails(T => ({
                ...T,
                pips: String(L),
                closePrice: W.toFixed(V)
            }))
        }
    }, [closeDetails.outcome, closeDetails.closeMethod, activeClosingTrade]);
    const handleEditActiveClick = b => {
            const z = (b["วันที่เปิด"] || "").split(" "),
                V = z[0] || "",
                L = z[1] || "",
                W = b[`เหตุผลซัพพอร์ตออเดอร์
แท่งเทียน`] || "",
                T = W ? W.split(",").map(lt => lt.trim()).filter(Boolean) : [],
                $ = b["เหตุผลซัพพอร์ต Indicator"] || b[`เหตุผลซัพพอร์ตออเดอร์
Indicator`] || "",
                Z = $ ? $.split(",").map(lt => lt.trim()).filter(Boolean) : [];
            setEditingActiveTradeId(b.id), setEditTrade({
                date: V,
                time: L || b["ช่วงเวลา"] || "",
                pair: b["คู่เงิน"] || "",
                type: b["ประเภทการเข้า"] || "Buy",
                entryPrice: b["ราคาที่เข้า"] || "",
                risk: b["ความเสี่ยง"] || "0.01",
                setup: b["บันทึกความเสี่ยงของแผนเทรด"] || "",
                feelings: b["บันทึกความรู้สึก"] || "",
                remarks: b["หมายเหตุ"] || "",
                tpPrice: b["ราคา TP"] || "",
                slPrice: b["ราคา SL"] || "",
                tpPoints: b["TP(จุด)\nที่ตั้งใว้"] || b["TP(จุด) ที่ตั้งใว้"] || b["TP (จุด)"] || b.tpPoints || "300",
                slPoints: b["SL(จุด)\nที่ตั้งใว้"] || b["SL(จุด) ที่ตั้งใว้"] || b["SL (จุด)"] || b.slPoints || "150",
                candleReasons: T,
                indicatorReasons: Z
            })
        },
        saveActiveEdit = b => {
            const D = JSON.parse(localStorage.getItem(getUserKey("forex_dashboard_local_trades")) || "[]"),
                V = {
                    ...tradesData.find(W => W.id === b) || {},
                    id: b,
                    "วันที่เปิด": `${editTrade.date} ${editTrade.time}`,
                    "ช่วงเวลา": editTrade.time,
                    "คู่เงิน": editTrade.pair.trim().toUpperCase(),
                    "ประเภทการเข้า": editTrade.type,
                    "ราคาที่เข้า": parseFloat(editTrade.entryPrice) || 0,
                    "ความเสี่ยง": editTrade.risk,
                    "บันทึกความเสี่ยงของแผนเทรด": editTrade.setup,
                    "บันทึกความรู้สึก": editTrade.feelings,
                    "หมายเหตุ": editTrade.remarks,
                    "ผลลัพธ์": "Active",
                    "ผู้ใช้งาน": (currentUser == null ? void 0 : currentUser.username) || "Guest",
                    "ราคา TP": parseFloat(editTrade.tpPrice) || null,
                    "ราคา SL": parseFloat(editTrade.slPrice) || null,
                    "TP(จุด)\nที่ตั้งใว้": parseInt(editTrade.tpPoints) || 300,
                    "SL(จุด)\nที่ตั้งใว้": parseInt(editTrade.slPoints) || 150,
                    "เหตุผลซัพพอร์ตออเดอร์\nแท่งเทียน": (editTrade.candleReasons || []).join(", "),
                    "เหตุผลซัพพอร์ต Indicator": (editTrade.indicatorReasons || []).join(", ")
                };
            let L = [];
            D.some(W => W.id === b) ? L = D.map(W => W.id === b ? V : W) : L = [V, ...D], localStorage.setItem(getUserKey("forex_dashboard_local_trades"), JSON.stringify(L)), !isDemoMode && (currentUser != null && currentUser.username) && fetch("/api/trades", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action: "save",
                    username: currentUser.username,
                    trade: V
                })
            }).catch(W => console.error("D1 save failed:", W)), loadAllData(), setEditingActiveTradeId(null)
        },
        handleEditClosedClick = b => {
            const z = (b["วันที่เปิด"] || "").split(" "),
                V = z[0] || "",
                L = z[1] || "",
                W = b[`เหตุผลซัพพอร์ตออเดอร์
แท่งเทียน`] || "",
                T = W ? W.split(",").map(lt => lt.trim()).filter(Boolean) : [],
                $ = b["เหตุผลซัพพอร์ต Indicator"] || b[`เหตุผลซัพพอร์ตออเดอร์
Indicator`] || "",
                Z = $ ? $.split(",").map(lt => lt.trim()).filter(Boolean) : [];
            setSelectedClosedTrade({
                ...b,
                uniqueId: b.id,
                dateField: V,
                timeField: L || b["ช่วงเวลา"] || "",
                pipsField: b["ผลลัพธ์ (จุด)"] || 0,
                profitField: b["กำไร/ขาดทุน($)"] || b["ผลกำไร/ขาดทุน"] || 0,
                candleReasons: T,
                indicatorReasons: Z
            })
        },
        saveClosedEdit = () => {
            const b = selectedClosedTrade.uniqueId,
                D = JSON.parse(localStorage.getItem(getUserKey("forex_dashboard_local_trades")) || "[]"),
                V = {
                    ...tradesData.find(W => W.id === b) || {},
                    id: b,
                    "วันที่เปิด": `${selectedClosedTrade.dateField} ${selectedClosedTrade.timeField}`,
                    "ช่วงเวลา": selectedClosedTrade.timeField,
                    "คู่เงิน": selectedClosedTrade["คู่เงิน"].trim().toUpperCase(),
                    "ประเภทการเข้า": selectedClosedTrade["ประเภทการเข้า"],
                    "ผลลัพธ์": selectedClosedTrade["ผลลัพธ์"],
                    "ผลลัพธ์ (จุด)": parseFloat(selectedClosedTrade.pipsField || 0),
                    "กำไร/ขาดทุน($)": parseFloat(selectedClosedTrade.profitField || 0),
                    "ราคาที่เข้า": parseFloat(selectedClosedTrade["ราคาที่เข้า"]) || 0,
                    "ความเสี่ยง": selectedClosedTrade["ความเสี่ยง"],
                    "เหตุผลซัพพอร์ตออเดอร์\nแท่งเทียน": (selectedClosedTrade.candleReasons || []).join(", "),
                    "เหตุผลซัพพอร์ต Indicator": (selectedClosedTrade.indicatorReasons || []).join(", "),
                    "บันทึกความรู้สึก": selectedClosedTrade["บันทึกความรู้สึก"] || "",
                    "หมายเหตุ": selectedClosedTrade["หมายเหตุ"] || "",
                    "ผู้ใช้งาน": (currentUser == null ? void 0 : currentUser.username) || "Guest"
                };
            let L = [];
            D.some(W => W.id === b) ? L = D.map(W => W.id === b ? V : W) : L = [V, ...D], localStorage.setItem(getUserKey("forex_dashboard_local_trades"), JSON.stringify(L)), !isDemoMode && (currentUser != null && currentUser.username) && fetch("/api/trades", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action: "save",
                    username: currentUser.username,
                    trade: V
                })
            }).catch(W => console.error("D1 save failed:", W)), loadAllData(), setSelectedClosedTrade(null)
        },
        kh = () => {
            window.confirm(`⚠️ ยืนยันการล้างประวัติการเทรดทั้งหมด?

* ข้อมูลออเดอร์ทั้งหมดที่คุณบันทึกในเครื่องจะถูกลบถาวร
* ข้อมูลประวัติเดิมจาก Google Sheets จะถูกซ่อนทั้งหมดเพื่อเริ่มบัญชีใหม่

การดำเนินการนี้ไม่สามารถยกเลิกได้ คุณแน่ใจใช่หรือไม่?`) && (localStorage.removeItem(getUserKey("forex_dashboard_local_trades")), localStorage.removeItem(getUserKey("forex_dashboard_deleted_trade_ids")), localStorage.setItem(getUserKey("forex_dashboard_hide_sheet_trades"), "true"), setHideSheetTrades(!0), localStorage.removeItem(getUserKey("forex_dashboard_initial_capital")), localStorage.removeItem(getUserKey("forex_dashboard_profit_target")), setInitialCapital(50), setProfitTarget(500), !isDemoMode && (currentUser != null && currentUser.username) && fetch("/api/trades", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action: "clear",
                    username: currentUser.username
                })
            }).catch(b => console.error("D1 clear failed:", b)), setTimeout(() => loadAllData(), 100), alert("ล้างประวัติการเทรดทั้งหมดเรียบร้อยแล้ว! หน้าพอร์ตของคุณได้รับการเริ่มต้นใหม่"))
        },
        handleResetSync = () => {
            window.confirm("คุณต้องการเรียกคืนและซิงก์ข้อมูลประวัติจาก Google Sheets กลับมาอีกครั้งใช่หรือไม่?") && (localStorage.removeItem(getUserKey("forex_dashboard_hide_sheet_trades")), localStorage.removeItem(getUserKey("forex_dashboard_deleted_trade_ids")), setHideSheetTrades(!1), setTimeout(() => loadAllData(), 100), alert("เรียกคืนประวัติและซิงก์ข้อมูลสำเร็จเรียบร้อย!"))
        },
        handleLogout = () => {
            sessionStorage.clear(), setIsLoggedIn(!1), setCurrentUser(null);
            const b = localStorage.getItem("saved_username") || "";
            let D = "";
            try {
                localStorage.getItem("saved_remember") === "1" && (D = atob(localStorage.getItem("saved_password") || ""))
            } catch (z) {
                console.warn("ไม่สามารถถอดรหัสผ่านได้:", z)
            }
            setUsernameInput(b), setPasswordInput(D), setRememberMe(localStorage.getItem("saved_remember") === "1"), setTradesData([]), setPlanData(null), setIsDemoMode(!1), setDataError(""), setShowConfigAlert(!1)
        },
        destroyCharts = () => {
            zo.current && (zo.current.destroy(), zo.current = null), No.current && (No.current.destroy(), No.current = null)
        },
        renderCharts = () => {
            destroyCharts();
            const D = tradesData.filter(z => (z.marketType || "forex") === activeMarketType).filter(z => z["วันที่เปิด"] && z["คู่เงิน"]);
            if (D.length !== 0) {
                if (chartRef1.current) {
                    let z = 0;
                    const V = ["เริ่มต้น"],
                        L = [0];
                    [...D].reverse().forEach(($, Z) => {
                        const lt = parseFloat($["ผลลัพธ์ (จุด)"] || $[`"ผลลัพธ์ (จุด)"`] || 0);
                        z += lt, V.push(`ไม้ที่ ${Z+1}`), L.push(z)
                    });
                    const T = chartRef1.current.getContext("2d");
                    zo.current = new Chart(T, {
                        type: "line",
                        data: {
                            labels: V,
                            datasets: [{
                                label: "กำไรรวมสะสม (จุด/Pips)",
                                data: L,
                                borderColor: "#3B82F6",
                                borderWidth: 2,
                                backgroundColor: "rgba(59, 130, 246, 0.1)",
                                fill: !0,
                                tension: .25,
                                pointRadius: L.length > 20 ? 1 : 4,
                                pointBackgroundColor: "#3B82F6"
                            }]
                        },
                        options: {
                            responsive: !0,
                            maintainAspectRatio: !1,
                            plugins: {
                                legend: {
                                    display: !1
                                }
                            },
                            scales: {
                                x: {
                                    grid: {
                                        color: "rgba(255, 255, 255, 0.05)"
                                    },
                                    ticks: {
                                        color: "#9CA3AF"
                                    }
                                },
                                y: {
                                    grid: {
                                        color: "rgba(255, 255, 255, 0.05)"
                                    },
                                    ticks: {
                                        color: "#9CA3AF"
                                    }
                                }
                            }
                        }
                    })
                }
                if ($setPasswordInput.current) {
                    const z = {};
                    D.forEach(T => {
                        const $ = String(T["คู่เงิน"] || "").toUpperCase().trim();
                        $ && (z[$] = (z[$] || 0) + 1)
                    });
                    const V = Object.keys(z),
                        L = Object.values(z),
                        W = $setPasswordInput.current.getContext("2d");
                    No.current = new Chart(W, {
                        type: "doughnut",
                        data: {
                            labels: V,
                            datasets: [{
                                data: L,
                                backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#14B8A6"],
                                borderWidth: 1,
                                borderColor: "#131A2E"
                            }]
                        },
                        options: {
                            responsive: !0,
                            maintainAspectRatio: !1,
                            plugins: {
                                legend: {
                                    position: "right",
                                    labels: {
                                        color: "#F3F4F6",
                                        font: {
                                            size: 12
                                        }
                                    }
                                }
                            }
                        }
                    })
                }
            }
        };
    [...new Set(tradesData.map(b => String(b["คู่เงิน"] || "").toUpperCase().trim()).filter(Boolean))], tradesData.filter(b => {
        const D = String(b["คู่เงิน"] || "").toUpperCase().trim(),
            z = String(b["ผลลัพธ์"] || "").trim().toLowerCase(),
            V = pairFilter === "ALL" || D === pairFilter;
        let L = !0;
        if (resultFilter !== "ALL") {
            const W = parseFloat(b["ผลลัพธ์ (จุด)"] || b[`"ผลลัพธ์ (จุด)"`] || 0);
            resultFilter === "WIN" ? L = z.includes("win") || z.includes("ชนะ") || z.includes("tp") || W > 0 : resultFilter === "LOSS" ? L = z.includes("loss") || z.includes("แพ้") || z.includes("sl") || W < 0 : resultFilter === "BE" && (L = !z.includes("win") && !z.includes("ชนะ") && !z.includes("tp") && !z.includes("loss") && !z.includes("แพ้") && !z.includes("sl") && W === 0)
        }
        return V && L
    });
    const ub = () => {
            switch (activeTab) {
                case "analysis":
                    return "วิเคราะห์กราฟ Forex & Crypto";
                case "thai_stock_analysis":
                    return "วิเคราะห์กราฟหุ้นไทย";
                case "inter_stock_analysis":
                    return "วิเคราะห์กราฟหุ้นต่างประเทศ";
                case "gold_analysis":
                    return "วิเคราะห์กราฟ Gold ไทย";
                case "overview":
                    return "ภาพรวมพอร์ต";
                case "journal_plan":
                    return "บันทึกผลการลงทุน";
                case "settings":
                    return "ตั้งค่าระบบ";
                default:
                    return "OniCorn Trading"
            }
        },
        Bo = tradesData.filter(b => (b.marketType || "forex") === activeMarketType),
        pe = calculateTradingStats(Bo);
    return _jsx("div", {
        className: "app-container",
        children: isLoggedIn ? _jsxs("div", {
            className: "main-layout-container",
            children: [mobileMenuOpen && _jsx("div", {
                className: "mobile-backdrop",
                onClick: () => setMobileMenuOpen(!1),
                style: {
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0, 0, 0, 0.6)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    zIndex: 998
                }
            }), _jsxs("aside", {
                className: `sidebar-menu ${sidebarMenuExpanded?"expanded":"collapsed"} ${mobileMenuOpen?"mobile-open":""}`,
                style: {
                    width: sidebarMenuExpanded ? "260px" : "70px"
                },
                children: [_jsx("div", {
                    style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: sidebarMenuExpanded ? "space-between" : "center",
                        padding: "16px",
                        borderBottom: "1px solid var(--border-color)",
                        height: "64px",
                        boxSizing: "border-box"
                    },
                    children: sidebarMenuExpanded ? _jsxs(_Fragment, {
                        children: [_jsxs("div", {
                            style: {
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            },
                            children: [_jsx("img", {
                                src: logoSvg,
                                alt: "OniCorn Logo",
                                style: {
                                    width: "32px",
                                    height: "32px",
                                    filter: "drop-shadow(0 0 4px rgba(59, 130, 246, 0.4))"
                                }
                            }), _jsx("span", {
                                style: {
                                    fontWeight: "bold",
                                    fontSize: "15px",
                                    color: "#f8fafc",
                                    whiteSpace: "nowrap"
                                },
                                children: "OniCorn Trading"
                            })]
                        }), _jsx("button", {
                            className: "mobile-menu-close-btn",
                            onClick: () => setMobileMenuOpen(!1),
                            style: {
                                background: "rgba(255, 255, 255, 0.05)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "6px",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                padding: "6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            },
                            title: "ปิดเมนู",
                            children: _jsx(X, {
                                size: 16
                            })
                        }), _jsx("button", {
                            className: "desktop-menu-toggle-btn",
                            onClick: () => setSidebarMenuExpanded(!1),
                            style: {
                                background: "rgba(255, 255, 255, 0.05)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "6px",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                padding: "6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            },
                            title: "ยุบเมนู",
                            children: _jsx(ChevronLeft, {
                                size: 16
                            })
                        })]
                    }) : _jsx("button", {
                        onClick: () => setSidebarMenuExpanded(!0),
                        style: {
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "6px",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            padding: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        },
                        title: "ขยายเมนู",
                        children: _jsx(ChevronRight, {
                            size: 18
                        })
                    })
                }), _jsx("nav", {
                    style: {
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        padding: "12px 8px",
                        flex: 1,
                        minHeight: 0,
                        overflowY: "auto",
                        overflowX: "hidden"
                    },
                    children: [{
                        id: "inter_gold_analysis",
                        label: "วิเคราะห์กราฟ Gold ต่างประเทศ",
                        icon: _jsx(Award, {
                            size: 18
                        })
                    }, {
                        id: "gold_analysis",
                        label: "วิเคราะห์กราฟ Gold ไทย",
                        icon: _jsx(Award, {
                            size: 18
                        })
                    }, {
                        id: "analysis",
                        label: "วิเคราะห์กราฟ Forex & Crypto",
                        icon: _jsx(LineChart, {
                            size: 18
                        })
                    }, {
                        id: "thai_stock_analysis",
                        label: "วิเคราะห์กราฟหุ้นไทย",
                        icon: _jsx(LineChart, {
                            size: 18
                        })
                    }, {
                        id: "inter_stock_analysis",
                        label: "วิเคราะห์กราฟหุ้นต่างประเทศ",
                        icon: _jsx(LineChart, {
                            size: 18
                        })
                    }, {
                        id: "oil_analysis",
                        label: "วิเคราะห์ราคาน้ำมัน",
                        icon: _jsx(Droplets, {
                            size: 18
                        })
                    }, {
                        id: "overview",
                        label: "ภาพรวมพอร์ต",
                        icon: _jsx(Activity, {
                            size: 18
                        })
                    }, {
                        id: "journal_plan",
                        label: "บันทึกผลการลงทุน",
                        icon: _jsx(BookOpen, {
                            size: 18
                        })
                    }].filter(b => {
                        if (b.hidden) return !1;
                        if (b.adminOnly) {
                            const D = String((currentUser == null ? void 0 : currentUser.role) || "").toLowerCase().trim();
                            return D === "admin" || D === "administrator"
                        }
                        return !0
                    }).map(b => {
                        const D = getMarketBadgeStyle(b.id),
                            z = activeTab === b.id;
                        return _jsxs("button", {
                            onClick: () => {
                                setActiveTab(b.id), setMobileMenuOpen(!1)
                            },
                            style: {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: sidebarMenuExpanded ? "flex-start" : "center",
                                gap: sidebarMenuExpanded ? "12px" : "0",
                                padding: "12px",
                                borderRadius: "8px",
                                background: z ? D.gradient : "transparent",
                                color: z ? "#ffffff" : "var(--text-secondary)",
                                border: "none",
                                borderLeft: z ? `3px solid ${D.color}` : "3px solid transparent",
                                cursor: "pointer",
                                textAlign: "left",
                                transition: "all 0.2s",
                                width: "100%",
                                position: "relative",
                                boxShadow: z ? "0 4px 12px rgba(0, 0, 0, 0.15)" : "none"
                            },
                            title: sidebarMenuExpanded ? "" : b.label,
                            children: [_jsx("span", {
                                style: {
                                    color: z ? D.color : "var(--text-muted)",
                                    display: "flex",
                                    alignItems: "center",
                                    filter: z ? `drop-shadow(0 0 6px ${D.color})` : "none"
                                },
                                children: b.icon
                            }), sidebarMenuExpanded && _jsx("span", {
                                style: {
                                    fontSize: "13.5px",
                                    fontWeight: z ? "600" : "normal",
                                    textShadow: z ? "0 0 10px rgba(255, 255, 255, 0.15)" : "none"
                                },
                                children: b.label
                            })]
                        }, b.id)
                    })
                }), _jsxs("div", {
                    style: {
                        borderTop: "1px solid var(--border-color)",
                        padding: "12px 8px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px"
                    },
                    children: [_jsxs("button", {
                        onClick: () => {
                            setActiveTab("settings");
                            setMobileMenuOpen(!1);
                        },
                        style: {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: sidebarMenuExpanded ? "flex-start" : "center",
                            gap: sidebarMenuExpanded ? "12px" : "0",
                            padding: "10px",
                            borderRadius: "6px",
                            background: activeTab === "settings" ? "rgba(59, 130, 246, 0.18)" : "rgba(255, 255, 255, 0.04)",
                            color: activeTab === "settings" ? "#60a5fa" : "var(--text-primary)",
                            border: activeTab === "settings" ? "1px solid #3b82f6" : "1px solid var(--border-color)",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "all 0.2s",
                            width: "100%",
                            fontWeight: activeTab === "settings" ? "600" : "500",
                            boxShadow: activeTab === "settings" ? "0 0 10px rgba(59, 130, 246, 0.2)" : "none"
                        },
                        title: sidebarMenuExpanded ? "" : "ตั้งค่าระบบ",
                        children: [_jsx(Settings, {
                            size: 16,
                            style: {
                                color: activeTab === "settings" ? "#60a5fa" : "var(--text-muted)",
                                filter: activeTab === "settings" ? "drop-shadow(0 0 6px #3b82f6)" : "none"
                            }
                        }), sidebarMenuExpanded && _jsx("span", {
                            style: {
                                fontSize: "13px"
                            },
                            children: "ตั้งค่าระบบ"
                        })]
                    }), (() => {
                        const role = String((currentUser == null ? void 0 : currentUser.role) || "").toLowerCase().trim();
                        const isUserAdmin = role === "admin" || role === "administrator";
                        if (!isUserAdmin) return null;
                        const isAct = activeTab === "admin_users";
                        return _jsxs("button", {
                            onClick: () => {
                                setActiveTab("admin_users");
                                setMobileMenuOpen(!1);
                            },
                            style: {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: sidebarMenuExpanded ? "flex-start" : "center",
                                gap: sidebarMenuExpanded ? "12px" : "0",
                                padding: "10px",
                                borderRadius: "6px",
                                background: isAct ? "rgba(239, 68, 68, 0.18)" : "rgba(255, 255, 255, 0.04)",
                                color: isAct ? "#f87171" : "var(--text-primary)",
                                border: isAct ? "1px solid #ef4444" : "1px solid var(--border-color)",
                                cursor: "pointer",
                                textAlign: "left",
                                transition: "all 0.2s",
                                width: "100%",
                                fontWeight: isAct ? "600" : "500",
                                boxShadow: isAct ? "0 0 10px rgba(239, 68, 68, 0.2)" : "none"
                            },
                            title: sidebarMenuExpanded ? "" : "จัดการผู้ดูแลระบบ",
                            children: [_jsx(ShieldAlert, {
                                size: 16,
                                style: {
                                    color: isAct ? "#f87171" : "var(--text-muted)",
                                    filter: isAct ? "drop-shadow(0 0 6px #ef4444)" : "none"
                                }
                            }), sidebarMenuExpanded && _jsx("span", {
                                style: {
                                    fontSize: "13px"
                                },
                                children: "จัดการผู้ดูแลระบบ"
                            })]
                        });
                    })(), sidebarMenuExpanded ? _jsxs("div", {
                        style: {
                            padding: "10px",
                            borderRadius: "6px",
                            background: "rgba(255, 255, 255, 0.02)",
                            fontSize: "12px",
                            color: "var(--text-muted)",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                        },
                        children: [_jsx(User, {
                            size: 14,
                            style: {
                                color: "var(--color-primary)"
                            }
                        }), _jsx("span", {
                            style: {
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                            },
                            children: currentUser == null ? void 0 : currentUser.username
                        })]
                    }) : null, _jsxs("button", {
                        onClick: handleLogout,
                        style: {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: sidebarMenuExpanded ? "flex-start" : "center",
                            gap: sidebarMenuExpanded ? "12px" : "0",
                            padding: "10px",
                            borderRadius: "6px",
                            background: "rgba(239, 68, 68, 0.1)",
                            color: "#ef4444",
                            border: "none",
                            cursor: "pointer",
                            width: "100%"
                        },
                        title: "ออกจากระบบ",
                        children: [_jsx(LogOut, {
                            size: 16
                        }), sidebarMenuExpanded && _jsx("span", {
                            style: {
                                fontSize: "13px"
                            },
                            children: "ออกจากระบบ"
                        })]
                    })]
                })]
            }), _jsxs("div", {
                className: "main-content-wrapper",
                style: {
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0
                },
                children: [_jsx("header", {
                    className: "app-header",
                    style: {
                        height: "64px",
                        borderBottom: "1px solid var(--border-color)",
                        display: "block"
                    },
                    children: _jsxs("div", {
                        className: "header-content",
                        style: {
                            padding: "0 24px",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                        },
                        children: [_jsxs("div", {
                            style: {
                                display: "flex",
                                alignItems: "center",
                                gap: "12px"
                            },
                            children: [_jsx("button", {
                                className: "mobile-hamburger-btn",
                                onClick: () => setMobileMenuOpen(!0),
                                style: {
                                    background: "rgba(255, 255, 255, 0.05)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "8px",
                                    color: "var(--text-primary)",
                                    cursor: "pointer",
                                    display: "none",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "8px"
                                },
                                children: _jsx(Menu, {
                                    size: 20
                                })
                            }), _jsx("h1", {
                                className: "header-title",
                                style: {
                                    fontSize: "18px",
                                    margin: 0
                                },
                                children: ub()
                            }), isDemoMode && _jsx("span", {
                                style: {
                                    color: "var(--color-warning)",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    marginLeft: "10px"
                                },
                                children: "(Demo Mode)"
                            })]
                        }), _jsxs("div", {
                            className: "header-meta",
                            style: {
                                display: "flex",
                                alignItems: "center",
                                gap: "12px"
                            },
                            children: [_jsx("span", {
                                style: {
                                    fontSize: "13px",
                                    color: "var(--text-muted)"
                                },
                                children: "GMT+7 Bangkok Time"
                            }), _jsxs("button", {
                                type: "button",
                                onClick: () => setActiveTab("settings"),
                                style: {
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    background: activeTab === "settings" ? "rgba(59, 130, 246, 0.2)" : "rgba(255, 255, 255, 0.06)",
                                    border: activeTab === "settings" ? "1px solid #3b82f6" : "1px solid var(--border-color)",
                                    color: activeTab === "settings" ? "#60a5fa" : "var(--text-primary)",
                                    borderRadius: "8px",
                                    padding: "6px 14px",
                                    cursor: "pointer",
                                    fontSize: "12.5px",
                                    fontWeight: "600",
                                    transition: "all 0.2s"
                                },
                                title: "เปิดหน้าตั้งค่าระบบ (System Settings)",
                                children: [_jsx(Settings, {
                                    size: 15
                                }), _jsx("span", {
                                    children: "ตั้งค่าระบบ"
                                })]
                            })]
                        })]
                    })
                }), _jsxs("main", {
                    className: "main-content",
                    style: {
                        padding: "24px",
                        flex: 1,
                        overflowY: "auto",
                        display: "block"
                    },
                    children: [$authLoading && dataError && _jsxs("div", {
                        className: "alert-error",
                        style: {
                            marginBottom: "24px",
                            justifyContent: "space-between"
                        },
                        children: [_jsxs("div", {
                            style: {
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            },
                            children: [_jsx(AlertTriangle, {
                                size: 18
                            }), _jsx("span", {
                                children: dataError
                            })]
                        }), _jsx("button", {
                            onClick: () => setIsDemoMode(!0),
                            className: "btn-primary",
                            style: {
                                width: "auto",
                                padding: "6px 14px",
                                fontSize: "13px"
                            },
                            children: "เปิดโหมด Demo ทันที"
                        })]
                    }), loading ? _jsxs("div", {
                        className: "loading-box glass-card",
                        children: [_jsx("div", {
                            className: "spinner"
                        }), _jsx("authError", {
                            children: "กำลังดาวน์โหลดและวิเคราะห์ข้อมูลจาก Google Sheets ของคุณ..."
                        })]
                    }) : _jsxs("div", {
                        className: "tab-content",
                        children: [activeTab === "inter_gold_analysis" && _jsx(InterGoldAnalysisView, {
                            username: currentUser == null ? void 0 : currentUser.username,
                            onNavigateTab: setActiveTab
                        }), activeTab === "gold_analysis" && _jsx(GoldAnalysisView, {
                            username: currentUser == null ? void 0 : currentUser.username
                        }), activeTab === "analysis" && _jsx(AnalysisView, {
                            username: currentUser == null ? void 0 : currentUser.username
                        }), activeTab === "thai_stock_analysis" && _jsx(ThaiStockAnalysisView, {
                            username: currentUser == null ? void 0 : currentUser.username
                        }), activeTab === "inter_stock_analysis" && _jsx(InterStockAnalysisView, {
                            username: currentUser == null ? void 0 : currentUser.username
                        }), activeTab === "oil_analysis" && _jsx(OilAnalysisView, {
                            username: currentUser == null ? void 0 : currentUser.username,
                            onNavigateTab: setActiveTab
                        }), activeTab === "admin_users" && _jsx(AdminUsersView, {
                            username: currentUser == null ? void 0 : currentUser.username
                        }), activeTab === "overview" && _jsxs(_Fragment, {
                            children: [_jsx("div", {
                                className: "glass-card sector-tabs-container",
                                style: {
                                    padding: "8px",
                                    display: "flex",
                                    gap: "8px",
                                    overflowX: "auto",
                                    background: "rgba(15, 23, 42, 0.4)",
                                    borderRadius: "10px",
                                    border: "1px solid var(--border-color)",
                                    width: "100%",
                                    justifyContent: "center",
                                    marginBottom: "20px"
                                },
                                children: [{
                                    id: "forex",
                                    label: "💱 Forex & Gold",
                                    gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(59, 130, 246, 0.15))",
                                    border: "1.5px solid #3b82f6",
                                    color: "#60a5fa"
                                }, {
                                    id: "thai_stock",
                                    label: "🇹🇭 หุ้นไทย (Thai Stocks)",
                                    gradient: "linear-gradient(135deg, rgba(234, 179, 8, 0.25), rgba(234, 179, 8, 0.15))",
                                    border: "1.5px solid #eab308",
                                    color: "#facc15"
                                }, {
                                    id: "inter_stock",
                                    label: "🌎 หุ้นต่างประเทศ (Foreign Stocks)",
                                    gradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(168, 85, 247, 0.15))",
                                    border: "1.5px solid #a855f7",
                                    color: "#c084fc"
                                }].map(b => {
                                    const D = activeMarketType === b.id;
                                    return _jsx("button", {
                                        type: "button",
                                        onClick: () => setActiveMarketType(b.id),
                                        style: {
                                            padding: "8px 16px",
                                            background: D ? b.gradient : "rgba(15, 23, 42, 0.6)",
                                            border: D ? b.border : "1px solid rgba(255, 255, 255, 0.08)",
                                            borderRadius: "20px",
                                            color: D ? "#ffffff" : "var(--text-secondary)",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                            whiteSpace: "nowrap",
                                            boxShadow: D ? "0 4px 12px rgba(0, 0, 0, 0.15)" : "none"
                                        },
                                        children: b.label
                                    }, b.id)
                                })
                            }), _jsxs("div", {
                                className: "stats-grid",
                                children: [_jsxs("div", {
                                    className: "stat-card glass-card stat-blue",
                                    children: [_jsxs("div", {
                                        className: "stat-info",
                                        children: [_jsx("span", {
                                            className: "stat-label",
                                            children: "ยอดเทรดทั้งหมด"
                                        }), _jsxs("span", {
                                            className: "stat-value",
                                            children: [(pe == null ? void 0 : pe.totalTrades) || 0, " ไม้"]
                                        })]
                                    }), _jsx("div", {
                                        className: "stat-icon",
                                        children: _jsx(Activity, {
                                            size: 24
                                        })
                                    })]
                                }), _jsxs("div", {
                                    className: "stat-card glass-card stat-green",
                                    children: [_jsxs("div", {
                                        className: "stat-info",
                                        children: [_jsx("span", {
                                            className: "stat-label",
                                            children: "อัตราชนะ (Win Rate)"
                                        }), _jsxs("span", {
                                            className: "stat-value",
                                            children: [(pe == null ? void 0 : pe.winRate) || 0, "%"]
                                        })]
                                    }), _jsx("div", {
                                        className: "stat-icon",
                                        children: _jsx(TrendingUp, {
                                            size: 24
                                        })
                                    })]
                                }), _jsxs("div", {
                                    className: "stat-card glass-card stat-warning",
                                    children: [_jsxs("div", {
                                        className: "stat-info",
                                        children: [_jsx("span", {
                                            className: "stat-label",
                                            children: "กำไรรวมสะสม"
                                        }), _jsx("span", {
                                            className: "stat-value",
                                            children: (activeMarketType === "thai_stock" || activeMarketType === "thai_gold")
                                                ? (pe != null && pe.totalProfit !== undefined
                                                    ? (pe.totalProfit >= 0 ? `+฿${pe.totalProfit.toLocaleString()}` : `-฿${Math.abs(pe.totalProfit).toLocaleString()}`)
                                                    : "฿0")
                                                : (pe != null && pe.totalProfit !== undefined && pe.totalProfit !== 0
                                                    ? `${pe.totalProfit >= 0 ? `+$${pe.totalProfit.toLocaleString()}` : `-$${Math.abs(pe.totalProfit).toLocaleString()}`} (${pe.totalPips >= 0 ? `+${pe.totalPips}` : pe.totalPips} pips)`
                                                    : `${pe != null && pe.totalPips ? pe.totalPips > 0 ? `+${pe.totalPips}` : pe.totalPips : 0} pips`)
                                        })]
                                    }), _jsx("div", {
                                        className: "stat-icon",
                                        children: _jsx(DollarSign, {
                                            size: 24
                                        })
                                    })]
                                }), _jsxs("div", {
                                    className: "stat-card glass-card stat-red",
                                    children: [_jsxs("div", {
                                        className: "stat-info",
                                        children: [_jsx("span", {
                                            className: "stat-label",
                                            children: "ชนะ / แพ้ / กันทุน"
                                        }), _jsxs("span", {
                                            className: "stat-value",
                                            style: {
                                                fontSize: "20px",
                                                marginTop: "8px"
                                            },
                                            children: [(pe == null ? void 0 : pe.wins) || 0, " W / ", (pe == null ? void 0 : pe.losses) || 0, " L / ", (pe == null ? void 0 : pe.breakEvens) || 0, " BE"]
                                        })]
                                    }), _jsx("div", {
                                        className: "stat-icon",
                                        children: _jsx(TrendingDown, {
                                            size: 24
                                        })
                                    })]
                                })]
                            }), _jsx("div", {
                                style: { display: "flex", flexDirection: "column", gap: "20px", margin: "20px 0" },
                                children: (() => {
                                    const closed = (Bo || []).filter(d => d.ผลลัพธ์ && d.ผลลัพธ์ !== "Active"),
                                        curr = (activeMarketType === "thai_stock" || activeMarketType === "thai_gold") ? "฿" : "$";
                                    let winMoney = 0, lossMoney = 0, netMoney = 0, winCount = 0, lossCount = 0, curW = 0, maxW = 0, curL = 0, maxL = 0, tpSlCount = 0;
                                    const sessionCounts = { asian: 0, london: 0, ny: 0 };
                                    closed.forEach(d => {
                                        const pips = parseFloat(d["ผลลัพธ์ (จุด)"] || 0),
                                            m = parseFloat(d["กำไร/ขาดทุน($)"] || d["ผลกำไร/ขาดทุน"] || 0),
                                            val = m !== 0 ? m : pips,
                                            isW = String(d.ผลลัพธ์ || "").toLowerCase().includes("win") || String(d.ผลลัพธ์ || "").includes("ชนะ") || val > 0,
                                            isL = String(d.ผลลัพธ์ || "").toLowerCase().includes("loss") || String(d.ผลลัพธ์ || "").includes("แพ้") || val < 0;
                                        if (isW) {
                                            winCount++;
                                            winMoney += Math.abs(val);
                                            curW++;
                                            curL = 0;
                                            if (curW > maxW) maxW = curW;
                                        } else if (isL) {
                                            lossCount++;
                                            lossMoney += Math.abs(val);
                                            curL++;
                                            curW = 0;
                                            if (curL > maxL) maxL = curL;
                                        }
                                        if (d["ราคา TP"] || d["ราคา SL"]) tpSlCount++;
                                        const timeStr = String(d.ช่วงเวลา || d.วันที่เปิด || ""),
                                            hourMatch = timeStr.match(/(\d{1,2}):/);
                                        if (hourMatch) {
                                            const h = parseInt(hourMatch[1], 10);
                                            if (h >= 6 && h < 13) sessionCounts.asian++;
                                            else if (h >= 13 && h < 19) sessionCounts.london++;
                                            else sessionCounts.ny++;
                                        }
                                    });
                                    netMoney = winMoney - lossMoney;
                                    const pf = lossMoney > 0 ? (winMoney / lossMoney).toFixed(2) : (winMoney > 0 ? "∞" : "0.00"),
                                        avgWin = winCount > 0 ? (winMoney / winCount).toFixed(1) : "0",
                                        avgLoss = lossCount > 0 ? (lossMoney / lossCount).toFixed(1) : "0",
                                        rrRatio = parseFloat(avgLoss) > 0 ? "1 : " + (parseFloat(avgWin) / parseFloat(avgLoss)).toFixed(2) : (parseFloat(avgWin) > 0 ? "1 : 2.0+" : "1 : 1"),
                                        bestPair = pe && pe.pairStats && pe.pairStats.length > 0 ? pe.pairStats[0] : null,
                                        disciplineScore = closed.length > 0 ? Math.min(100, Math.round(tpSlCount / closed.length * 100)) : 100;
                                    let bestSession = "London (13:00 - 18:00)";
                                    if (sessionCounts.ny > sessionCounts.london && sessionCounts.ny > sessionCounts.asian) bestSession = "New York (19:00 - 02:00)";
                                    else if (sessionCounts.asian > sessionCounts.london && sessionCounts.asian > sessionCounts.ny) bestSession = "Asian (06:00 - 12:00)";

                                    return _jsxs(_Fragment, {
                                        children: [
                                            _jsxs("div", {
                                                style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" },
                                                children: [
                                                    _jsxs("div", {
                                                        className: "glass-card",
                                                        style: {
                                                            padding: "16px",
                                                            borderRadius: "12px",
                                                            background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(15, 23, 42, 0.6))",
                                                            border: "1px solid rgba(34, 197, 94, 0.25)",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            gap: "6px"
                                                        },
                                                        children: [
                                                            _jsxs("div", {
                                                                style: { display: "flex", justifyContent: "space-between", alignItems: "center" },
                                                                children: [
                                                                    _jsx("span", { style: { fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }, children: "กำไรสุทธิรวม (Net PnL)" }),
                                                                    _jsx("span", { style: { fontSize: "16px" }, children: "💰" })
                                                                ]
                                                            }),
                                                            _jsxs("div", {
                                                                style: { fontSize: "22px", fontWeight: "800", color: netMoney >= 0 ? "#22c55e" : "#ef4444" },
                                                                children: [netMoney >= 0 ? "+" : "-", curr, Math.abs(netMoney).toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })]
                                                            }),
                                                            _jsxs("span", {
                                                                style: { fontSize: "11px", color: "var(--text-muted)" },
                                                                children: ["ชนะ ", curr, winMoney.toLocaleString(void 0, { maximumFractionDigits: 1 }), " / แพ้ ", curr, lossMoney.toLocaleString(void 0, { maximumFractionDigits: 1 })]
                                                            })
                                                        ]
                                                    }),
                                                    _jsxs("div", {
                                                        className: "glass-card",
                                                        style: {
                                                            padding: "16px",
                                                            borderRadius: "12px",
                                                            background: "linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(15, 23, 42, 0.6))",
                                                            border: "1px solid rgba(234, 179, 8, 0.25)",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            gap: "6px"
                                                        },
                                                        children: [
                                                            _jsxs("div", {
                                                                style: { display: "flex", justifyContent: "space-between", alignItems: "center" },
                                                                children: [
                                                                    _jsx("span", { style: { fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }, children: "Profit Factor (ดัชนีกำไร)" }),
                                                                    _jsx("span", { style: { fontSize: "16px" }, children: "⚖️" })
                                                                ]
                                                            }),
                                                            _jsx("div", {
                                                                style: { fontSize: "22px", fontWeight: "800", color: parseFloat(pf) >= 1.5 ? "#eab308" : parseFloat(pf) >= 1 ? "#38bdf8" : "#ef4444" },
                                                                children: pf
                                                            }),
                                                            _jsx("span", {
                                                                style: { fontSize: "11px", color: "var(--text-muted)" },
                                                                children: parseFloat(pf) >= 1.5 ? "🟢 ระบบได้เปรียบตลาดสูง (ยอดเยี่ยม)" : parseFloat(pf) >= 1 ? "🟡 ทำกำไรได้สม่ำเสมอ" : "🔴 ขาดทุนมากกว่ากำไร"
                                                            })
                                                        ]
                                                    }),
                                                    _jsxs("div", {
                                                        className: "glass-card",
                                                        style: {
                                                            padding: "16px",
                                                            borderRadius: "12px",
                                                            background: "linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(15, 23, 42, 0.6))",
                                                            border: "1px solid rgba(56, 189, 248, 0.25)",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            gap: "6px"
                                                        },
                                                        children: [
                                                            _jsxs("div", {
                                                                style: { display: "flex", justifyContent: "space-between", alignItems: "center" },
                                                                children: [
                                                                    _jsx("span", { style: { fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }, children: "Avg Win vs Avg Loss" }),
                                                                    _jsx("span", { style: { fontSize: "16px" }, children: "🎯" })
                                                                ]
                                                            }),
                                                            _jsx("div", {
                                                                style: { fontSize: "20px", fontWeight: "800", color: "#38bdf8" },
                                                                children: rrRatio
                                                            }),
                                                            _jsxs("span", {
                                                                style: { fontSize: "11px", color: "var(--text-muted)" },
                                                                children: ["เฉลี่ยชนะ +", curr, avgWin, " / แพ้ -", curr, avgLoss]
                                                            })
                                                        ]
                                                    }),
                                                    _jsxs("div", {
                                                        className: "glass-card",
                                                        style: {
                                                            padding: "16px",
                                                            borderRadius: "12px",
                                                            background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(15, 23, 42, 0.6))",
                                                            border: "1px solid rgba(168, 85, 247, 0.25)",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            gap: "6px"
                                                        },
                                                        children: [
                                                            _jsxs("div", {
                                                                style: { display: "flex", justifyContent: "space-between", alignItems: "center" },
                                                                children: [
                                                                    _jsx("span", { style: { fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }, children: "สถิติ Win Streak สูงสุด" }),
                                                                    _jsx("span", { style: { fontSize: "16px" }, children: "🔥" })
                                                                ]
                                                            }),
                                                            _jsxs("div", {
                                                                style: { fontSize: "22px", fontWeight: "800", color: "#a855f7" },
                                                                children: [maxW, " ไม้ติด"]
                                                            }),
                                                            _jsxs("span", {
                                                                style: { fontSize: "11px", color: "var(--text-muted)" },
                                                                children: ["แพ้ติดกันสูงสุด (Drawdown): ", maxL, " ไม้"]
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            _jsxs("div", {
                                                className: "glass-card",
                                                style: {
                                                    padding: "16px 20px",
                                                    borderRadius: "12px",
                                                    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))",
                                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: "12px"
                                                },
                                                children: [
                                                    _jsxs("div", {
                                                        style: { display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px dashed rgba(255, 255, 255, 0.1)", paddingBottom: "8px" },
                                                        children: [
                                                            _jsx("span", { style: { fontSize: "18px" }, children: "🧠" }),
                                                            _jsx("strong", { style: { fontSize: "14px", color: "#f8fafc" }, children: "บทวิเคราะห์ & จุดแข็งของพอร์ตโดย AI (AI Portfolio Insights)" }),
                                                            _jsx("span", { style: { fontSize: "11px", background: "rgba(99, 102, 241, 0.2)", color: "#818cf8", padding: "2px 8px", borderRadius: "12px", marginLeft: "auto", fontWeight: "bold" }, children: "AI Analyzer" })
                                                        ]
                                                    }),
                                                    _jsxs("div", {
                                                        style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" },
                                                        children: [
                                                            _jsxs("div", {
                                                                style: { background: "rgba(0,0,0,0.25)", padding: "12px", borderRadius: "8px", borderLeft: "3px solid #eab308" },
                                                                children: [
                                                                    _jsx("div", { style: { fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }, children: "🏆 สินทรัพย์ทำกำไรสูงสุด (Best Asset)" }),
                                                                    _jsx("div", { style: { fontSize: "14px", fontWeight: "700", color: "#f8fafc" }, children: bestPair ? `${bestPair.name} (${bestPair.trades} ไม้, ชนะ ${bestPair.wins})` : "ยังไม่มีข้อมูลคู่เงินเพียงพอ" }),
                                                                    bestPair && _jsxs("div", { style: { fontSize: "11px", color: "#22c55e", marginTop: "2px" }, children: ["อัตราชนะ: ", (bestPair.wins / (bestPair.trades || 1) * 100).toFixed(0), "%"] })
                                                                ]
                                                            }),
                                                            _jsxs("div", {
                                                                style: { background: "rgba(0,0,0,0.25)", padding: "12px", borderRadius: "8px", borderLeft: "3px solid #38bdf8" },
                                                                children: [
                                                                    _jsx("div", { style: { fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }, children: "⏰ ช่วงเวลาเทรดที่ดีที่สุด (Best Session)" }),
                                                                    _jsx("div", { style: { fontSize: "14px", fontWeight: "700", color: "#38bdf8" }, children: bestSession }),
                                                                    _jsx("div", { style: { fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }, children: "สถิติการปิดออเดอร์ทำกำไรหนาแน่นที่สุด" })
                                                                ]
                                                            }),
                                                            _jsxs("div", {
                                                                style: { background: "rgba(0,0,0,0.25)", padding: "12px", borderRadius: "8px", borderLeft: "3px solid #22c55e" },
                                                                children: [
                                                                    _jsx("div", { style: { fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }, children: "🛡️ คะแนนวินัยการคุมความเสี่ยง (Discipline)" }),
                                                                    _jsxs("div", { style: { fontSize: "14px", fontWeight: "700", color: disciplineScore >= 80 ? "#22c55e" : "#f59e0b" }, children: [disciplineScore, "% (มีแผน TP/SL ชัดเจน)"] }),
                                                                    _jsx("div", { style: { fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }, children: disciplineScore >= 80 ? "ยอดเยี่ยม! เทรดตามแผนคุมความเสี่ยงสม่ำเสมอ" : "แนะนำตั้งจุด SL/TP ทุกไม้เพื่อป้องกันพอร์ต" })
                                                                ]
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            pe && pe.monthlyStats && pe.monthlyStats.length > 0 && _jsxs("div", {
                                                className: "glass-card",
                                                style: {
                                                    padding: "16px 20px",
                                                    borderRadius: "12px",
                                                    background: "rgba(15, 23, 42, 0.5)",
                                                    border: "1px solid rgba(255, 255, 255, 0.08)",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: "12px"
                                                },
                                                children: [
                                                    _jsxs("div", {
                                                        style: { display: "flex", justifyContent: "space-between", alignItems: "center" },
                                                        children: [
                                                            _jsxs("div", {
                                                                style: { display: "flex", alignItems: "center", gap: "8px" },
                                                                children: [
                                                                    _jsx("span", { style: { fontSize: "16px" }, children: "📅" }),
                                                                    _jsx("strong", { style: { fontSize: "14px", color: "#f8fafc" }, children: "สรุปผลงานแยกรายเดือน (Monthly PnL Breakdown)" })
                                                                ]
                                                            }),
                                                            _jsx("span", { style: { fontSize: "11px", color: "var(--text-muted)" }, children: "ผลตอบแทนและ Win Rate ประจำเดือน" })
                                                        ]
                                                    }),
                                                    _jsx("div", {
                                                        style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" },
                                                        children: pe.monthlyStats.map((m, idx) => {
                                                            const wr = m.trades > 0 ? (m.wins / m.trades * 100).toFixed(0) : 0,
                                                                isProfit = m.pips >= 0;
                                                            return _jsxs("div", {
                                                                key: idx,
                                                                style: {
                                                                    background: "rgba(0,0,0,0.3)",
                                                                    border: `1px solid ${isProfit ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
                                                                    borderRadius: "8px",
                                                                    padding: "10px 14px",
                                                                    display: "flex",
                                                                    flexDirection: "column",
                                                                    gap: "4px"
                                                                },
                                                                children: [
                                                                    _jsxs("div", {
                                                                        style: { display: "flex", justifyContent: "space-between", alignItems: "center" },
                                                                        children: [
                                                                            _jsx("strong", { style: { fontSize: "13px", color: "#f8fafc" }, children: m.month }),
                                                                            _jsxs("span", {
                                                                                style: {
                                                                                    fontSize: "11px",
                                                                                    background: isProfit ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                                                                                    color: isProfit ? "#22c55e" : "#ef4444",
                                                                                    padding: "1px 6px",
                                                                                    borderRadius: "4px",
                                                                                    fontWeight: "bold"
                                                                                },
                                                                                children: [isProfit ? "+" : "", m.pips, " pips"]
                                                                            })
                                                                        ]
                                                                    }),
                                                                    _jsxs("div", {
                                                                        style: { fontSize: "11px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", marginTop: "4px" },
                                                                        children: [
                                                                            _jsxs("span", { children: [m.trades, " ไม้ (W:", m.wins, " L:", m.losses, ")"] }),
                                                                            _jsxs("span", { style: { color: parseInt(wr) >= 50 ? "#22c55e" : "#f59e0b", fontWeight: "bold" }, children: ["WR: ", wr, "%"] })
                                                                        ]
                                                                    })
                                                                ]
                                                            });
                                                        })
                                                    })
                                                ]
                                            })
                                        ]
                                    });
                                })()
                            }), _jsxs("div", {
                                className: "charts-grid",
                                children: [_jsxs("div", {
                                    className: "glass-card",
                                    children: [_jsxs("h3", {
                                        className: "chart-title",
                                        children: [_jsx(TrendingUp, {
                                            size: 18,
                                            style: {
                                                color: "var(--color-primary)"
                                            }
                                        }), _jsx("span", {
                                            children: "การเจริญเติบโตของพอร์ต (Equity Growth Curve)"
                                        })]
                                    }), _jsx("div", {
                                        className: "chart-container",
                                        children: Bo.length > 0 ? _jsx("canvas", {
                                            ref: chartRef1
                                        }) : _jsx("authError", {
                                            style: {
                                                textAlign: "center",
                                                paddingTop: "100px",
                                                color: "var(--text-muted)"
                                            },
                                            children: "ไม่พบข้อมูลการวิเคราะห์สำหรับสร้างกราฟ"
                                        })
                                    })]
                                }), _jsxs("div", {
                                    className: "glass-card",
                                    children: [_jsxs("h3", {
                                        className: "chart-title",
                                        children: [_jsx(Layers, {
                                            size: 18,
                                            style: {
                                                color: "var(--color-success)"
                                            }
                                        }), _jsx("span", {
                                            children: "คู่เงินที่นิยมเทรด (Currency Distribution)"
                                        })]
                                    }), _jsx("div", {
                                        className: "chart-container",
                                        children: Bo.length > 0 ? _jsx("canvas", {
                                            ref: $setPasswordInput
                                        }) : _jsx("authError", {
                                            style: {
                                                textAlign: "center",
                                                paddingTop: "100px",
                                                color: "var(--text-muted)"
                                            },
                                            children: "ไม่พบข้อมูลสัดส่วนคู่เงิน"
                                        })
                                    })]
                                })]
                            }), _jsx("div", {
                                className: "glass-card",
                                children: (() => {
                                    const b = Bo.filter(L => L["ผลลัพธ์"] && L["ผลลัพธ์"] !== "Active"),
                                        D = ["ALL", ...new Set(b.map(L => String(L["คู่เงิน"] || "").toUpperCase().trim()).filter(Boolean))],
                                        z = b.filter(L => {
                                            const W = String(L["คู่เงิน"] || "").toUpperCase().trim(),
                                                T = String(L["ผลลัพธ์"] || "").trim().toLowerCase(),
                                                $ = overviewPairFilter === "ALL" || W === overviewPairFilter;
                                            let Z = !0;
                                            if (overviewResultFilter !== "ALL") {
                                                const lt = parseFloat(L["ผลลัพธ์ (จุด)"] || 0);
                                                overviewResultFilter === "WIN" ? Z = T.includes("win") || T.includes("ชนะ") || T.includes("tp") || lt > 0 : overviewResultFilter === "LOSS" ? Z = T.includes("loss") || T.includes("แพ้") || T.includes("sl") || lt < 0 : overviewResultFilter === "BE" && (Z = !T.includes("win") && !T.includes("ชนะ") && !T.includes("tp") && !T.includes("loss") && !T.includes("แพ้") && !T.includes("sl") && lt === 0)
                                            }
                                            return $ && Z
                                        }),
                                        V = overviewLimitFilter === "ALL" ? z : z.slice(0, overviewLimitFilter);
                                    return _jsxs(_Fragment, {
                                        children: [_jsxs("div", {
                                            className: "controls-row",
                                            style: {
                                                marginBottom: "16px"
                                            },
                                            children: [_jsxs("div", {
                                                className: "chart-title",
                                                style: {
                                                    margin: 0
                                                },
                                                children: [_jsx(Clock, {
                                                    size: 18,
                                                    style: {
                                                        color: "var(--color-primary)"
                                                    }
                                                }), _jsxs("span", {
                                                    children: [overviewLimitFilter === "ALL" ? "ประวัติบันทึกการเทรดที่ปิดแล้วทั้งหมด" : `ประวัติการเทรด ${overviewLimitFilter} ล่าสุด`, " ", "(Closed Trades History)"]
                                                })]
                                            }), _jsxs("div", {
                                                className: "filters-group",
                                                children: [_jsxs("div", {
                                                    children: [_jsx("label", {
                                                        className: "form-label",
                                                        style: {
                                                            fontSize: "11px",
                                                            marginBottom: "4px"
                                                        },
                                                        children: "คัดกรองคู่เงิน"
                                                    }), _jsx("select", {
                                                        className: "select-filter",
                                                        value: overviewPairFilter,
                                                        onChange: L => setOverviewPairFilter(L.target.value),
                                                        style: {
                                                            padding: "6px 12px"
                                                        },
                                                        children: D.map((L, W) => _jsx("option", {
                                                            value: L,
                                                            children: L
                                                        }, W))
                                                    })]
                                                }), _jsxs("div", {
                                                    children: [_jsx("label", {
                                                        className: "form-label",
                                                        style: {
                                                            fontSize: "11px",
                                                            marginBottom: "4px"
                                                        },
                                                        children: "คัดกรองผลลัพธ์"
                                                    }), _jsxs("select", {
                                                        className: "select-filter",
                                                        value: overviewResultFilter,
                                                        onChange: L => setOverviewResultFilter(L.target.value),
                                                        style: {
                                                            padding: "6px 12px"
                                                        },
                                                        children: [_jsx("option", {
                                                            value: "ALL",
                                                            children: "แสดงผลลัพธ์ทั้งหมด"
                                                        }), _jsx("option", {
                                                            value: "WIN",
                                                            children: "ชนะ (กำไร)"
                                                        }), _jsx("option", {
                                                            value: "LOSS",
                                                            children: "แพ้ (ขาดทุน)"
                                                        }), _jsx("option", {
                                                            value: "BE",
                                                            children: "กันทุน (Break Evens)"
                                                        })]
                                                    })]
                                                }), _jsxs("div", {
                                                    children: [_jsx("label", {
                                                        className: "form-label",
                                                        style: {
                                                            fontSize: "11px",
                                                            marginBottom: "4px"
                                                        },
                                                        children: "แสดงจำนวนรายการ"
                                                    }), _jsxs("select", {
                                                        className: "select-filter",
                                                        value: overviewLimitFilter,
                                                        onChange: L => {
                                                            const W = L.target.value;
                                                            setOverviewLimitFilter(W === "ALL" ? "ALL" : parseInt(W, 10))
                                                        },
                                                        style: {
                                                            padding: "6px 12px"
                                                        },
                                                        children: [_jsx("option", {
                                                            value: 5,
                                                            children: "5 ล่าสุด"
                                                        }), _jsx("option", {
                                                            value: 10,
                                                            children: "10 ล่าสุด"
                                                        }), _jsx("option", {
                                                            value: 50,
                                                            children: "50 ล่าสุด"
                                                        }), _jsx("option", {
                                                            value: "ALL",
                                                            children: "แสดงทั้งหมด"
                                                        })]
                                                    })]
                                                }), _jsxs("div", {
                                                    style: {
                                                        display: "flex",
                                                        gap: "8px",
                                                        alignItems: "flex-end"
                                                    },
                                                    children: [hideSheetTrades && _jsx("button", {
                                                        onClick: handleResetSync,
                                                        className: "btn-quick-select",
                                                        style: {
                                                            border: "1px solid var(--color-success)",
                                                            color: "var(--color-success)",
                                                            margin: 0,
                                                            padding: "8px 12px",
                                                            height: "36px"
                                                        },
                                                        children: "🔄 เรียกคืนข้อมูลชีต"
                                                    }), _jsx("button", {
                                                        onClick: kh,
                                                        className: "btn-quick-select",
                                                        style: {
                                                            border: "1px solid rgba(239, 68, 68, 0.4)",
                                                            color: "#ef4444",
                                                            margin: 0,
                                                            padding: "8px 12px",
                                                            height: "36px"
                                                        },
                                                        children: "🧹 ล้างประวัติเพื่อเริ่มเทรดใหม่"
                                                    })]
                                                })]
                                            })]
                                        }), _jsx("div", {
                                            className: "table-wrapper",
                                            children: _jsxs("table", {
                                                className: "data-table compounding-plan-table",
                                                children: [_jsx("thead", {
                                                    children: _jsxs("tr", {
                                                        children: [_jsx("th", {
                                                            children: "วันที่เปิด"
                                                        }), _jsx("th", {
                                                            children: "ช่วงเวลา"
                                                        }), _jsx("th", {
                                                            children: "คู่เงิน / หุ้น"
                                                        }), _jsx("th", {
                                                            children: "ประเภท"
                                                        }), _jsx("th", {
                                                            children: "ผลลัพธ์"
                                                        }), _jsx("th", {
                                                            children: "ผลลัพธ์ (จุด)"
                                                        }), _jsxs("th", {
                                                            children: ["กำไร/ขาดทุน (", activeMarketType === "thai_stock" ? "฿" : "$", ")"]
                                                        }), _jsx("th", {
                                                            children: "ราคาที่เข้า"
                                                        }), _jsx("th", {
                                                            children: "ความเสี่ยง"
                                                        }), _jsx("th", {
                                                            children: "เหตุผลการเข้า"
                                                        }), _jsx("th", {
                                                            children: "หมายเหตุ / บันทึก"
                                                        })]
                                                    })
                                                }), _jsx("tbody", {
                                                    children: V.length > 0 ? V.map((L, W) => {
                                                        const T = parseFloat(L["ผลลัพธ์ (จุด)"] || 0),
                                                            $ = parseFloat(L["กำไร/ขาดทุน($)"] || L["ผลกำไร/ขาดทุน"] || 0),
                                                            Z = String(L["ผลลัพธ์"] || "").toLowerCase().includes("win") || String(L["ผลลัพธ์"] || "").includes("ชนะ") || T > 0,
                                                            lt = String(L["ผลลัพธ์"] || "").toLowerCase().includes("loss") || String(L["ผลลัพธ์"] || "").includes("แพ้") || T < 0,
                                                            Dt = activeMarketType === "thai_stock" ? "฿" : "$";
                                                        return _jsxs("tr", {
                                                            children: [_jsx("td", {
                                                                children: L["วันที่เปิด"]
                                                            }), _jsx("td", {
                                                                children: L["ช่วงเวลา"]
                                                            }), _jsx("td", {
                                                                children: _jsx("strong", {
                                                                    children: L["คู่เงิน"]
                                                                })
                                                            }), _jsx("td", {
                                                                className: String(L["ประเภทการเข้า"]).toLowerCase().includes("buy") ? "type-buy" : "type-sell",
                                                                children: L["ประเภทการเข้า"]
                                                            }), _jsx("td", {
                                                                children: _jsx("span", {
                                                                    className: `badge ${Z?"badge-win":lt?"badge-loss":"badge-be"}`,
                                                                    children: L["ผลลัพธ์"] || (T === 0 ? "BE" : T > 0 ? "Win" : "Loss")
                                                                })
                                                            }), _jsx("td", {
                                                                className: T > 0 ? "profit-text" : T < 0 ? "loss-text" : "",
                                                                children: T > 0 ? `+${T}` : T
                                                            }), _jsx("td", {
                                                                className: $ > 0 ? "profit-text" : $ < 0 ? "loss-text" : "",
                                                                children: $ !== 0 ? $ > 0 ? `+${Dt}${$.toFixed(2)}` : `${Dt}${$.toFixed(2)}` : "-"
                                                            }), _jsx("td", {
                                                                children: L["ราคาที่เข้า"]
                                                            }), _jsx("td", {
                                                                children: L["ความเสี่ยง"]
                                                            }), _jsx("td", {
                                                                style: {
                                                                    maxWidth: "160px",
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis"
                                                                },
                                                                title: L["เหตุผลซัพพอร์ตออเดอร์\\nแท่งเทียน"],
                                                                children: L["เหตุผลซัพพอร์ตออเดอร์\\nแท่งเทียน"] || L["เหตุผลซัพพอร์ตออเดอร์\\nIndicator"] || "-"
                                                            }), _jsx("td", {
                                                                style: {
                                                                    maxWidth: "200px",
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis"
                                                                },
                                                                title: L["หมายเหตุ"],
                                                                children: L["หมายเหตุ"] || "-"
                                                            })]
                                                        }, L.id || W)
                                                    }) : _jsx("tr", {
                                                        children: _jsx("td", {
                                                            colSpan: "11",
                                                            style: {
                                                                textAlign: "center",
                                                                padding: "40px"
                                                            },
                                                            children: "ไม่พบรายการบันทึกประวัติการเทรดที่ปิดแล้วตามตัวกรอง"
                                                        })
                                                    })
                                                })]
                                            })
                                        })]
                                    })
                                })()
                            })]
                        }), activeTab === "journal_plan" && (() => {
                            const b = tradesData.filter(T => (T.marketType || "forex") === activeMarketType && (T["ผลลัพธ์"] === "Active" || !T["ผลลัพธ์"])),
                                getTradeTs = t => {
                                    if (!t) return 0;
                                    const m = String(t.id || "").match(/trade-(\d+)/);
                                    if (m) return parseInt(m[1], 10);
                                    const dStr = (t["วันที่เปิด"] || "").replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1");
                                    const parsed = Date.parse(dStr);
                                    return isNaN(parsed) ? 0 : parsed;
                                },
                                sortedActiveTrades = [...b].sort((a, bTrade) => {
                                    const diff = getTradeTs(a) - getTradeTs(bTrade);
                                    return diff !== 0 ? diff : (tradesData.indexOf(bTrade) - tradesData.indexOf(a));
                                }),
                                D = tradesData.filter(T => (T.marketType || "forex") === activeMarketType && T["ผลลัพธ์"] && T["ผลลัพธ์"] !== "Active"),
                                z = D.reduce((T, $) => {
                                    const Z = parseFloat($["กำไร/ขาดทุน($)"] || $["ผลกำไร/ขาดทุน"] || 0);
                                    return T + Z
                                }, 0),
                                V = profitTarget > 0 ? (z / profitTarget * 100).toFixed(1) : "0.0",
                                L = ["ALL", ...new Set(D.map(T => String(T["คู่เงิน"] || "").toUpperCase().trim()).filter(Boolean))],
                                W = D.filter(T => {
                                    const $ = String(T["คู่เงิน"] || "").toUpperCase().trim(),
                                        Z = String(T["ผลลัพธ์"] || "").trim().toLowerCase(),
                                        lt = pairFilter === "ALL" || $ === pairFilter;
                                    let Dt = !0;
                                    if (resultFilter !== "ALL") {
                                        const Fe = parseFloat(T["ผลลัพธ์ (จุด)"] || 0);
                                        resultFilter === "WIN" ? Dt = Z.includes("win") || Z.includes("ชนะ") || Z.includes("tp") || Fe > 0 : resultFilter === "LOSS" ? Dt = Z.includes("loss") || Z.includes("แพ้") || Z.includes("sl") || Fe < 0 : resultFilter === "BE" && (Dt = !Z.includes("win") && !Z.includes("ชนะ") && !Z.includes("tp") && !Z.includes("loss") && !Z.includes("แพ้") && !Z.includes("sl") && Fe === 0)
                                    }
                                    return lt && Dt
                                });
                            return _jsxs("div", {
                                style: {
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "24px"
                                },
                                children: [_jsx("div", {
                                    className: "glass-card sector-tabs-container",
                                    style: {
                                        padding: "8px",
                                        display: "flex",
                                        gap: "8px",
                                        overflowX: "auto",
                                        background: "rgba(15, 23, 42, 0.4)",
                                        borderRadius: "10px",
                                        border: "1px solid var(--border-color)",
                                        width: "100%",
                                        justifyContent: "center"
                                    },
                                    children: [{
                                        id: "forex",
                                        label: "💱 Forex & Gold",
                                        gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(59, 130, 246, 0.15))",
                                        border: "1.5px solid #3b82f6",
                                        color: "#60a5fa"
                                    }, {
                                        id: "thai_stock",
                                        label: "🇹🇭 หุ้นไทย (Thai Stocks)",
                                        gradient: "linear-gradient(135deg, rgba(234, 179, 8, 0.25), rgba(234, 179, 8, 0.15))",
                                        border: "1.5px solid #eab308",
                                        color: "#facc15"
                                    }, {
                                        id: "inter_stock",
                                        label: "🌎 หุ้นต่างประเทศ (Foreign Stocks)",
                                        gradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(168, 85, 247, 0.15))",
                                        border: "1.5px solid #a855f7",
                                        color: "#c084fc"
                                    }].map(T => {
                                        const $ = activeMarketType === T.id;
                                        return _jsx("button", {
                                            type: "button",
                                            onClick: () => setActiveMarketType(T.id),
                                            style: {
                                                padding: "8px 16px",
                                                background: $ ? T.gradient : "rgba(15, 23, 42, 0.6)",
                                                border: $ ? T.border : "1px solid rgba(255, 255, 255, 0.08)",
                                                borderRadius: "20px",
                                                color: $ ? "#ffffff" : "var(--text-secondary)",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                                cursor: "pointer",
                                                transition: "all 0.2s ease",
                                                whiteSpace: "nowrap",
                                                boxShadow: $ ? "0 4px 12px rgba(0, 0, 0, 0.15)" : "none"
                                            },
                                            children: T.label
                                        }, T.id)
                                    })
                                }),
                                 _jsxs("div", {
                                    className: "glass-card",
                                    style: {
                                        padding: "20px 24px",
                                        background: "linear-gradient(135deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95))",
                                        border: "1px solid rgba(59, 130, 246, 0.3)",
                                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)"
                                    },
                                    children: [_jsxs("div", {
                                        style: {
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: "16px",
                                            borderBottom: "1px dashed var(--border-color)",
                                            paddingBottom: "10px",
                                            flexWrap: "wrap",
                                            gap: "8px"
                                        },
                                        children: [_jsxs("div", {
                                            style: { display: "flex", alignItems: "center", gap: "8px" },
                                            children: [_jsx(TrendingUp, {
                                                size: 18,
                                                style: { color: "var(--color-primary)" }
                                            }), _jsx("h3", {
                                                className: "chart-title",
                                                style: { fontSize: "15px", margin: 0, fontWeight: "700" },
                                                children: "📊 แผนการสะสมทุนและเป้าหมายกำไร (Compounding Plan Progress)"
                                            })]
                                        }), _jsxs("button", {
                                            type: "button",
                                            onClick: () => setShowTargetSettings(!showTargetSettings),
                                            className: "btn-secondary",
                                            style: {
                                                margin: 0,
                                                padding: "5px 12px",
                                                fontSize: "11px",
                                                background: showTargetSettings ? "rgba(59, 130, 246, 0.2)" : "rgba(255, 255, 255, 0.05)",
                                                color: showTargetSettings ? "#60a5fa" : "var(--text-secondary)",
                                                border: "1px solid var(--border-color)",
                                                borderRadius: "6px",
                                                cursor: "pointer"
                                            },
                                            children: ["⚙️ ", showTargetSettings ? "ซ่อนการตั้งค่าเป้าหมาย" : "ปรับตั้งเป้าหมายทุน"]
                                        })]
                                    }), showTargetSettings && _jsxs("div", {
                                        style: {
                                            display: "grid",
                                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                            gap: "12px",
                                            marginBottom: "16px",
                                            padding: "12px 14px",
                                            background: "rgba(15, 23, 42, 0.6)",
                                            borderRadius: "8px",
                                            border: "1px solid rgba(59, 130, 246, 0.2)"
                                        },
                                        children: [_jsxs("div", {
                                            style: { display: "flex", flexDirection: "column", gap: "4px" },
                                            children: [_jsxs("span", {
                                                style: { fontSize: "11px", color: "var(--text-secondary)", fontWeight: "600" },
                                                children: ["เงินทุนตั้งต้น (", (activeMarketType === "thai_stock" || activeMarketType === "thai_gold") ? "฿" : "$", ")"]
                                            }), _jsx("input", {
                                                type: "number",
                                                step: "any",
                                                className: "calc-input",
                                                placeholder: (activeMarketType === "thai_stock" || activeMarketType === "thai_gold") ? "10000.00" : "50.00",
                                                value: initialCapital,
                                                onChange: T => {
                                                    const $ = parseFloat(T.target.value) || 0;
                                                    setInitialCapital($);
                                                    const Z = currentUser != null && currentUser.username ? currentUser.username.toLowerCase() : "guest";
                                                    localStorage.setItem(`${Z}_${activeMarketType}_dashboard_initial_capital`, $)
                                                },
                                                style: { margin: 0, padding: "6px 10px", fontSize: "13px", background: "rgba(0,0,0,0.2)" },
                                                required: !0
                                            })]
                                        }), _jsxs("div", {
                                            style: { display: "flex", flexDirection: "column", gap: "4px" },
                                            children: [_jsxs("span", {
                                                style: { fontSize: "11px", color: "var(--text-secondary)", fontWeight: "600" },
                                                children: ["เป้าหมายกำไรปลายทาง (", (activeMarketType === "thai_stock" || activeMarketType === "thai_gold") ? "฿" : "$", ")"]
                                            }), _jsx("input", {
                                                type: "number",
                                                step: "any",
                                                className: "calc-input",
                                                placeholder: (activeMarketType === "thai_stock" || activeMarketType === "thai_gold") ? "50000.00" : "500.00",
                                                value: profitTarget,
                                                onChange: T => {
                                                    const $ = parseFloat(T.target.value) || 0;
                                                    setProfitTarget($);
                                                    const Z = currentUser != null && currentUser.username ? currentUser.username.toLowerCase() : "guest";
                                                    localStorage.setItem(`${Z}_${activeMarketType}_dashboard_profit_target`, $)
                                                },
                                                style: { margin: 0, padding: "6px 10px", fontSize: "13px", background: "rgba(0,0,0,0.2)" },
                                                required: !0
                                            })]
                                        })]
                                    }), _jsxs("div", {
                                        style: {
                                            display: "grid",
                                            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                                            gap: "14px",
                                            marginBottom: "16px"
                                        },
                                        children: [_jsxs("div", {
                                            style: {
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "4px",
                                                background: "rgba(15, 23, 42, 0.4)",
                                                padding: "12px 16px",
                                                borderRadius: "8px",
                                                border: "1px solid rgba(255,255,255,0.05)"
                                            },
                                            children: [_jsxs("span", {
                                                style: { fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" },
                                                children: ["💰 ทุนตั้งต้น (", (activeMarketType === "thai_stock" || activeMarketType === "thai_gold") ? "฿" : "$", ")"]
                                            }), _jsxs("strong", {
                                                style: { fontSize: "18px", color: "#f8fafc" },
                                                children: [(activeMarketType === "thai_stock" || activeMarketType === "thai_gold") ? "฿" : "$", (initialCapital || 0).toLocaleString()]
                                            })]
                                        }), _jsxs("div", {
                                            style: {
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "4px",
                                                background: "rgba(15, 23, 42, 0.4)",
                                                padding: "12px 16px",
                                                borderRadius: "8px",
                                                border: "1px solid rgba(255,255,255,0.05)"
                                            },
                                            children: [_jsxs("span", {
                                                style: { fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" },
                                                children: ["🎯 เป้าหมายพอร์ต (", (activeMarketType === "thai_stock" || activeMarketType === "thai_gold") ? "฿" : "$", ")"]
                                            }), _jsxs("strong", {
                                                style: { fontSize: "18px", color: "#38bdf8" },
                                                children: [(activeMarketType === "thai_stock" || activeMarketType === "thai_gold") ? "฿" : "$", (profitTarget || 0).toLocaleString()]
                                            })]
                                        }), _jsxs("div", {
                                            style: {
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "4px",
                                                background: z >= 0 ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                                                padding: "12px 16px",
                                                borderRadius: "8px",
                                                border: z >= 0 ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)"
                                            },
                                            children: [_jsxs("span", {
                                                style: { fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" },
                                                children: ["📈 กำไรสะสมในแผน (", (activeMarketType === "thai_stock" || activeMarketType === "thai_gold") ? "฿" : "$", ")"]
                                            }), _jsxs("strong", {
                                                style: { fontSize: "18px", color: z >= 0 ? "#10B981" : "#EF4444" },
                                                children: [z >= 0 ? "+" : "", (activeMarketType === "thai_stock" || activeMarketType === "thai_gold") ? "฿" : "$", z.toFixed(2)]
                                            })]
                                        }), _jsxs("div", {
                                            style: {
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "4px",
                                                background: "rgba(59, 130, 246, 0.08)",
                                                padding: "12px 16px",
                                                borderRadius: "8px",
                                                border: "1px solid rgba(59, 130, 246, 0.2)"
                                            },
                                            children: [_jsx("span", {
                                                style: { fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" },
                                                children: "🏆 ความคืบหน้าพอร์ต"
                                            }), _jsxs("strong", {
                                                style: { fontSize: "18px", color: "#60a5fa" },
                                                children: [V, "%"]
                                            })]
                                        })]
                                    }), _jsx("div", {
                                        style: {
                                            width: "100%",
                                            height: "8px",
                                            background: "rgba(255, 255, 255, 0.05)",
                                            borderRadius: "4px",
                                            overflow: "hidden"
                                        },
                                        children: _jsx("div", {
                                            style: {
                                                width: `${Math.min(100,Math.max(0,parseFloat(V)))}%`,
                                                height: "100%",
                                                background: "linear-gradient(90deg, var(--color-primary), var(--color-success))",
                                                transition: "width 0.3s ease"
                                            }
                                        })
                                    })]
                                }), _jsxs("div", {
                                    className: "form-and-active-trades-split",
                                    children: [_jsxs("div", {
                                        className: "glass-card form-left-card",
                                        style: {
                                            padding: "20px 24px",
                                            display: "flex",
                                            flexDirection: "column",
                                            height: "100%",
                                            boxSizing: "border-box"
                                        },
                                        children: [_jsxs("h3", {
                                            className: "chart-title",
                                            style: {
                                                fontSize: "15px",
                                                marginBottom: "16px",
                                                borderBottom: "1px dashed var(--border-color)",
                                                paddingBottom: "10px"
                                            },
                                            children: [_jsx(BookOpen, {
                                                size: 18,
                                                style: {
                                                    color: "var(--color-primary)"
                                                }
                                            }), _jsxs("span", {
                                                children: ["บันทึกส่งแผนออเดอร์ใหม่ (", activeMarketType === "forex" ? "เปิดไม้ Forex" : activeMarketType === "thai_stock" ? "หุ้นไทย" : "หุ้นต่างประเทศ", ")"]
                                            })]
                                        }), _jsx("form", {
                                            onSubmit: Zy,
                                            style: {
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "14px",
                                                flex: 1
                                            },
                                            children: (calculatePointsDistance(newTrade.entryPrice, newTrade.tpPrice, newTrade.pair), calculatePointsDistance(newTrade.entryPrice, newTrade.slPrice, newTrade.pair), _jsxs("div", {
                                                className: "form-grid-2-col",
                                                children: [_jsxs("div", {
                                                    children: [_jsx("label", {
                                                        className: "form-label",
                                                        style: {
                                                            fontSize: "11px",
                                                            marginBottom: "4px"
                                                        },
                                                        children: "วันที่เปิด (วัน/เดือน/ปี)"
                                                    }), _jsx("input", {
                                                        type: "date",
                                                        className: "calc-input",
                                                        value: newTrade.date,
                                                        onChange: T => setNewTrade({
                                                            ...newTrade,
                                                            date: T.target.value
                                                        }),
                                                        required: !0
                                                    })]
                                                }), _jsxs("div", {
                                                    children: [_jsx("label", {
                                                        className: "form-label",
                                                        style: {
                                                            fontSize: "11px",
                                                            marginBottom: "4px"
                                                        },
                                                        children: "เวลาที่เปิด (ชั่วโมง:นาที)"
                                                    }), _jsx("input", {
                                                        type: "time",
                                                        className: "calc-input",
                                                        value: newTrade.time,
                                                        onChange: T => setNewTrade({
                                                            ...newTrade,
                                                            time: T.target.value
                                                        }),
                                                        required: !0
                                                    })]
                                                }), _jsxs("div", {
                                                    children: [_jsx("label", {
                                                        className: "form-label",
                                                        style: {
                                                            fontSize: "11px",
                                                            marginBottom: "4px"
                                                        },
                                                        children: "คู่เงิน / หุ้น"
                                                    }), _jsxs("div", {
                                                        style: {
                                                            display: "flex",
                                                            gap: "6px"
                                                        },
                                                        children: [_jsx("select", {
                                                            className: "calc-select",
                                                            value: newTrade.pair,
                                                            onChange: T => {
                                                                const selectedPair = T.target.value;
                                                                setNewTrade({ ...newTrade, pair: selectedPair });
                                                                fetch(`/api/price?symbol=${encodeURIComponent(selectedPair)}&marketType=${encodeURIComponent(activeMarketType)}`)
                                                                    .then(res => res.json())
                                                                    .then(data => {
                                                                        if (data && typeof data.price === "number" && data.price > 0) {
                                                                            setNewTrade(prev => ({ ...prev, pair: selectedPair, entryPrice: String(data.price) }));
                                                                        }
                                                                    }).catch(() => {});
                                                            },
                                                            style: {
                                                                margin: 0,
                                                                flex: 1
                                                            },
                                                            children: assetList.map(T => _jsx("option", {
                                                                value: T,
                                                                children: T
                                                            }, T))
                                                        }), _jsx("button", {
                                                            type: "button",
                                                            onClick: () => setShowAssetModal(!0),
                                                            className: "btn-secondary",
                                                            style: {
                                                                margin: 0,
                                                                padding: "0 10px",
                                                                width: "42px",
                                                                height: "42px",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center"
                                                            },
                                                            title: "จัดการรายชื่อคู่เงิน/หุ้น",
                                                            children: "⚙️"
                                                        })]
                                                    })]
                                                }), _jsxs("div", {
                                                    children: [_jsx("label", {
                                                        className: "form-label",
                                                        style: {
                                                            fontSize: "11px",
                                                            marginBottom: "4px"
                                                        },
                                                        children: "ประเภทการเข้า"
                                                    }), _jsxs("div", {
                                                        style: {
                                                            display: "flex",
                                                            gap: "6px"
                                                        },
                                                        children: [_jsx("select", {
                                                            className: "calc-select",
                                                            value: newTrade.type,
                                                            onChange: T => setNewTrade({
                                                                ...newTrade,
                                                                type: T.target.value
                                                            }),
                                                            style: {
                                                                margin: 0,
                                                                flex: 1
                                                             },
                                                            children: entryTypeList.map(T => _jsx("option", {
                                                                value: T,
                                                                children: T
                                                            }, T))
                                                        }), _jsx("button", {
                                                            type: "button",
                                                            onClick: () => setShowEntryTypeModal(!0),
                                                            className: "btn-secondary",
                                                            style: {
                                                                margin: 0,
                                                                padding: "0 10px",
                                                                width: "42px",
                                                                height: "42px",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center"
                                                            },
                                                            title: "จัดการประเภทการเข้า",
                                                            children: "⚙️"
                                                        })]
                                                    })]
                                                }), _jsxs("div", {
                                                    style: activeMarketType !== "forex" ? { gridColumn: "span 2", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", margin: 0, padding: 0 } : {}, children: [_jsxs("div", { children: [_jsx("label", { className: "form-label", style: { fontSize: "11px", marginBottom: "4px" }, children: "ราคาที่เปิดเข้า" }), _jsx("input", { type: "number", step: "any", className: "calc-input", placeholder: "เช่น 2368.50", value: newTrade.entryPrice, onChange: T => setNewTrade({ ...newTrade, entryPrice: T.target.value }), required: !0 })] }), activeMarketType !== "forex" && _jsxs("div", { children: [_jsx("label", { className: "form-label", style: { fontSize: "11px", marginBottom: "4px" }, children: activeMarketType === "thai_gold" ? "จำนวนกรัมที่ซื้อ" : "จำนวนหุ้นที่ซื้อ" }), _jsx("input", { type: "number", step: "any", className: "calc-input", placeholder: activeMarketType === "thai_gold" ? "เช่น 15.244" : "เช่น 100", value: newTrade.risk, onChange: T => setNewTrade({ ...newTrade, risk: T.target.value }), required: !0 })] }),
                                                (activeMarketType === "thai_stock" || activeMarketType === "inter_stock" || activeMarketType === "foreign_stock" || activeMarketType === "thai_gold") && (() => {
                                                    const sym = (newTrade.pair || "").trim().toUpperCase();
                                                    const existingActive = tradesData.find(t => (t["ผลลัพธ์"] === "Active" || !t["ผลลัพธ์"]) && (t.marketType || activeMarketType) === activeMarketType && (t["คู่เงิน"] || "").trim().toUpperCase() === sym && (t["ประเภทการเข้า"] || "Buy") === newTrade.type);
                                                    if (!existingActive) return null;
                                                    const oldPrice = parseFloat(existingActive["ราคาที่เข้า"]) || 0;
                                                    const oldQty = parseFloat(existingActive["ความเสี่ยง"]) || 1;
                                                    const newPrice = parseFloat(newTrade.entryPrice) || 0;
                                                    const newQty = parseFloat(newTrade.risk) || 0;
                                                    const unitCur = activeMarketType === "thai_stock" || activeMarketType === "thai_gold" ? "บาท" : "USD";
                                                    const unitLabel = activeMarketType === "thai_gold" ? "กรัม" : "หุ้น";
                                                    if (newPrice > 0 && newQty > 0) {
                                                        const combQty = oldQty + newQty;
                                                        const newAvg = (oldPrice * oldQty + newPrice * newQty) / combQty;
                                                        return _jsxs("div", {
                                                            style: {
                                                                gridColumn: "span 2",
                                                                background: "rgba(59, 130, 246, 0.1)",
                                                                border: "1px solid rgba(59, 130, 246, 0.3)",
                                                                borderRadius: "6px",
                                                                padding: "8px 12px",
                                                                fontSize: "11.5px",
                                                                margin: "4px 0",
                                                                color: "#60A5FA"
                                                            },
                                                            children: [
                                                                _jsxs("div", {
                                                                    style: { fontWeight: "bold", marginBottom: "2px" },
                                                                    children: ["📊 มีหุ้น ", sym, " ในพอร์ตเดิม: ", oldQty.toLocaleString(), " ", unitLabel, " @ ", oldPrice.toFixed(2), " ", unitCur]
                                                                }),
                                                                _jsxs("div", {
                                                                    style: { color: "#93c5fd" },
                                                                    children: ["✨ หลังรวมไม้ใหม่: รวม ", combQty.toLocaleString(), " ", unitLabel, " | ทุนถัวเฉลี่ยใหม่: ", newAvg.toFixed(2), " ", unitCur, "/", unitLabel]
                                                                })
                                                            ]
                                                        });
                                                    } else {
                                                        return _jsxs("div", {
                                                            style: {
                                                                gridColumn: "span 2",
                                                                background: "rgba(234, 179, 8, 0.08)",
                                                                border: "1px dashed rgba(234, 179, 8, 0.3)",
                                                                borderRadius: "6px",
                                                                padding: "6px 10px",
                                                                fontSize: "11px",
                                                                margin: "2px 0",
                                                                color: "#facc15"
                                                            },
                                                            children: ["💡 มีหุ้น ", sym, " ในพอร์ตค้างอยู่แล้ว (ระบบจะรวมไม้ถัวเฉลี่ยให้อัตโนมัติเมื่อระบุจำนวนและราคา)"]
                                                        });
                                                    }
                                                })(), activeMarketType !== "forex" && _jsxs("div", { style: { gridColumn: "span 2" }, children: [_jsx("label", { className: "form-label", style: { fontSize: "11px", marginBottom: "4px" }, children: activeMarketType === "thai_stock" ? "จำนวนเงินที่ซื้อ (บาท)" : "จำนวนเงินที่ซื้อ (USD)" }), _jsx("input", { type: "text", className: "calc-input", placeholder: "คำนวณอัตโนมัติ...", value: (() => { const amt = (parseFloat(newTrade.entryPrice) || 0) * (parseFloat(newTrade.risk) || 0); return amt > 0 ? amt.toLocaleString() : ""; })(), readOnly: !0, style: { background: "rgba(255, 255, 255, 0.05)", cursor: "not-allowed", opacity: 0.8 } })] })]
                                                }), activeMarketType === "forex" && _jsxs("div", {
                                                    children: [_jsx("label", {
                                                        className: "form-label",
                                                        style: {
                                                            fontSize: "11px",
                                                            marginBottom: "4px"
                                                        },
                                                        children: "บันทึกอารมณ์/จิตวิทยา"
                                                    }), _jsx("input", {
                                                        type: "text",
                                                        className: "calc-input",
                                                        placeholder: "มั่นใจมาก / เฝ้าหน้าจอ...",
                                                        value: newTrade.feelings,
                                                        onChange: T => setNewTrade({
                                                            ...newTrade,
                                                            feelings: T.target.value
                                                        })
                                                    })]
                                                }), activeMarketType === "forex" && _jsxs("div", {
                                                    style: { gridColumn: "span 2", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: "8px", padding: "10px 12px" },
                                                    children: [
                                                        _jsxs("div", {
                                                            style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" },
                                                            children: [
                                                                _jsx("label", { className: "form-label", style: { fontSize: "12px", fontWeight: "700", color: "#34d399", margin: 0 }, children: "🎯 เป้าหมายทำกำไร (Take Profit - TP)" }),
                                                                _jsx("span", { style: { fontSize: "11px", color: "var(--text-muted)" }, children: "ระบุราคา หรือ จำนวนจุด อย่างใดอย่างหนึ่ง" })
                                                            ]
                                                        }),
                                                        _jsxs("div", {
                                                            style: { display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "10px", alignItems: "center" },
                                                            children: [
                                                                _jsxs("div", {
                                                                    style: { display: "flex", flexDirection: "column", gap: "2px" },
                                                                    children: [
                                                                        _jsx("span", { style: { fontSize: "10.5px", color: "var(--text-muted)" }, children: "ราคาเป้าหมาย TP (Price):" }),
                                                                        _jsx("input", {
                                                                            type: "number",
                                                                            step: "any",
                                                                            className: "calc-input",
                                                                            placeholder: "เช่น 2400.00",
                                                                            value: newTrade.tpPrice,
                                                                            onChange: handleTpPriceChange,
                                                                            style: { margin: 0, width: "100%", height: "38px", fontSize: "13px", color: "#34d399", fontWeight: "600" }
                                                                        })
                                                                    ]
                                                                }),
                                                                _jsxs("div", {
                                                                    style: { display: "flex", flexDirection: "column", gap: "2px" },
                                                                    children: [
                                                                        _jsx("span", { style: { fontSize: "10.5px", color: "var(--text-muted)" }, children: "ระยะเป้าหมาย (Points):" }),
                                                                        _jsxs("div", {
                                                                            style: { display: "flex", alignItems: "center", gap: "6px" },
                                                                            children: [
                                                                                _jsx("input", {
                                                                                    type: "number",
                                                                                    className: "calc-input",
                                                                                    placeholder: "300",
                                                                                    value: newTrade.tpPoints,
                                                                                    onChange: handleTpPointsChange,
                                                                                    style: { margin: 0, flex: 1, minWidth: "0", height: "38px", fontSize: "13px", color: "#34d399", fontWeight: "600" }
                                                                                }),
                                                                                _jsx("span", { style: { fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }, children: "จุด" })
                                                                            ]
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }), activeMarketType === "forex" && _jsxs("div", {
                                                    style: { gridColumn: "span 2", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.25)", borderRadius: "8px", padding: "10px 12px" },
                                                    children: [
                                                        _jsxs("div", {
                                                            style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" },
                                                            children: [
                                                                _jsx("label", { className: "form-label", style: { fontSize: "12px", fontWeight: "700", color: "#f87171", margin: 0 }, children: "🛑 ตัดขาดทุนยอมแพ้ (Stop Loss - SL)" }),
                                                                _jsx("span", { style: { fontSize: "11px", color: "var(--text-muted)" }, children: "ระบุราคา หรือ จำนวนจุด อย่างใดอย่างหนึ่ง" })
                                                            ]
                                                        }),
                                                        _jsxs("div", {
                                                            style: { display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "10px", alignItems: "center" },
                                                            children: [
                                                                _jsxs("div", {
                                                                    style: { display: "flex", flexDirection: "column", gap: "2px" },
                                                                    children: [
                                                                        _jsx("span", { style: { fontSize: "10.5px", color: "var(--text-muted)" }, children: "ราคาตัดขาดทุน SL (Price):" }),
                                                                        _jsx("input", {
                                                                            type: "number",
                                                                            step: "any",
                                                                            className: "calc-input",
                                                                            placeholder: "เช่น 2350.00",
                                                                            value: newTrade.slPrice,
                                                                            onChange: handleSlPriceChange,
                                                                            style: { margin: 0, width: "100%", height: "38px", fontSize: "13px", color: "#f87171", fontWeight: "600" }
                                                                        })
                                                                    ]
                                                                }),
                                                                _jsxs("div", {
                                                                    style: { display: "flex", flexDirection: "column", gap: "2px" },
                                                                    children: [
                                                                        _jsx("span", { style: { fontSize: "10.5px", color: "var(--text-muted)" }, children: "ระยะตัดขาดทุน (Points):" }),
                                                                        _jsxs("div", {
                                                                            style: { display: "flex", alignItems: "center", gap: "6px" },
                                                                            children: [
                                                                                _jsx("input", {
                                                                                    type: "number",
                                                                                    className: "calc-input",
                                                                                    placeholder: "150",
                                                                                    value: newTrade.slPoints,
                                                                                    onChange: handleSlPointsChange,
                                                                                    style: { margin: 0, flex: 1, minWidth: "0", height: "38px", fontSize: "13px", color: "#f87171", fontWeight: "600" }
                                                                                }),
                                                                                _jsx("span", { style: { fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }, children: "จุด" })
                                                                            ]
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }), activeMarketType === "forex" && _jsxs("div", {
                                                    style: { gridColumn: "span 2" },
                                                    children: [_jsxs("div", {
                                                        style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" },
                                                        children: [_jsx("label", { className: "form-label", style: { fontSize: "11px", margin: 0 }, children: "เหตุผลซัพพอร์ตแท่งเทียน (เลือกได้หลายข้อ)" }), _jsx("button", { type: "button", onClick: () => setShowCandleModal(!0), style: { background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "2px" }, title: "จัดการเหตุผลแท่งเทียน", children: "⚙️ ตั้งค่า" })]
                                                    }), _jsx("div", {
                                                        children: _jsxs("button", {
                                                            type: "button",
                                                            onClick: () => setReasonPickerModal({ target: "newTrade", type: "candle" }),
                                                            className: "calc-select",
                                                            style: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", height: "42px", padding: "8px 12px", background: (newTrade.candleReasons && newTrade.candleReasons.length > 0) ? "rgba(59, 130, 246, 0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${newTrade.candleReasons && newTrade.candleReasons.length > 0 ? "rgba(96, 165, 250, 0.5)" : "var(--border-color)"}`, borderRadius: "8px", color: (newTrade.candleReasons && newTrade.candleReasons.length > 0) ? "#60A5FA" : "var(--text-secondary)", textAlign: "left", cursor: "pointer", margin: 0 },
                                                            children: [
                                                                _jsx("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "90%", fontWeight: (newTrade.candleReasons && newTrade.candleReasons.length > 0) ? "600" : "normal" }, children: newTrade.candleReasons && newTrade.candleReasons.length > 0 ? `✅ เลือกแล้ว ${newTrade.candleReasons.length} รายการ (${newTrade.candleReasons.join(", ")})` : "คลิกเพื่อเลือกเหตุผลแท่งเทียน (เปิดหน้าต่างเลือก)..." }),
                                                                _jsx("span", { style: { fontSize: "12px", color: "#60A5FA" }, children: "⊞" })
                                                            ]
                                                        })
                                                    })]
                                                }), activeMarketType === "forex" && _jsxs("div", {
                                                    style: { gridColumn: "span 2" },
                                                    children: [_jsxs("div", {
                                                        style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" },
                                                        children: [_jsx("label", { className: "form-label", style: { fontSize: "11px", margin: 0 }, children: "เหตุผลซัพพอร์ต Indicator (เลือกได้หลายข้อ)" }), _jsx("button", { type: "button", onClick: () => setShowIndicatorModal(!0), style: { background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "2px" }, title: "จัดการเหตุผล Indicator", children: "⚙️ ตั้งค่า" })]
                                                    }), _jsx("div", {
                                                        children: _jsxs("button", {
                                                            type: "button",
                                                            onClick: () => setReasonPickerModal({ target: "newTrade", type: "indicator" }),
                                                            className: "calc-select",
                                                            style: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", height: "42px", padding: "8px 12px", background: (newTrade.indicatorReasons && newTrade.indicatorReasons.length > 0) ? "rgba(59, 130, 246, 0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${newTrade.indicatorReasons && newTrade.indicatorReasons.length > 0 ? "rgba(96, 165, 250, 0.5)" : "var(--border-color)"}`, borderRadius: "8px", color: (newTrade.indicatorReasons && newTrade.indicatorReasons.length > 0) ? "#60A5FA" : "var(--text-secondary)", textAlign: "left", cursor: "pointer", margin: 0 },
                                                            children: [
                                                                _jsx("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "90%", fontWeight: (newTrade.indicatorReasons && newTrade.indicatorReasons.length > 0) ? "600" : "normal" }, children: newTrade.indicatorReasons && newTrade.indicatorReasons.length > 0 ? `✅ เลือกแล้ว ${newTrade.indicatorReasons.length} รายการ (${newTrade.indicatorReasons.join(", ")})` : "คลิกเพื่อเลือกเหตุผล Indicator (เปิดหน้าต่างเลือก)..." }),
                                                                _jsx("span", { style: { fontSize: "12px", color: "#60A5FA" }, children: "⊞" })
                                                            ]
                                                        })
                                                    })]
                                                                                                }), _jsxs("div", {
                                                    style: {
                                                        gridColumn: "span 2"
                                                    },
                                                    children: [_jsx("label", {
                                                        className: "form-label",
                                                        style: {
                                                            fontSize: "11px",
                                                            marginBottom: "4px"
                                                        },
                                                        children: "บันทึกความเสี่ยงของแผนเทรด"
                                                    }), _jsx("input", {
                                                        type: "text",
                                                        className: "calc-input",
                                                        placeholder: "วิเคราะห์ปัจจัยเสี่ยงและจุดยอมแพ้ของโครงสร้าง...",
                                                        value: newTrade.setup,
                                                        onChange: T => setNewTrade({
                                                            ...newTrade,
                                                            setup: T.target.value
                                                        })
                                                    })]
                                                }), _jsxs("div", {
                                                    style: {
                                                        gridColumn: "span 2"
                                                    },
                                                    children: [_jsx("label", {
                                                        className: "form-label",
                                                        style: {
                                                            fontSize: "11px",
                                                            marginBottom: "4px"
                                                        },
                                                        children: "หมายเหตุเพิ่มเติม"
                                                    }), _jsx("input", {
                                                        type: "text",
                                                        className: "calc-input",
                                                        placeholder: "เช่น ถือรันรอบยาว...",
                                                        value: newTrade.remarks,
                                                        onChange: T => setNewTrade({
                                                            ...newTrade,
                                                            remarks: T.target.value
                                                        })
                                                    })]
                                                }), _jsx("div", {
                                                    style: {
                                                        gridColumn: "span 2",
                                                        marginTop: "4px"
                                                    },
                                                    children: _jsx("button", {
                                                        type: "submit",
                                                        className: "btn-primary",
                                                        style: {
                                                            margin: 0,
                                                            padding: "10px",
                                                            width: "100%",
                                                            height: "42px"
                                                        },
                                                        children: "🚀 เปิดไม้ / เปิดออเดอร์"
                                                    })
                                                })]
                                            }))
                                        })]
                                    }), _jsxs("div", {
                                        className: "glass-card active-trades-right-card",
                                        style: {
                                            padding: "20px 24px",
                                            display: "flex",
                                            flexDirection: "column",
                                            height: "100%",
                                            boxSizing: "border-box"
                                        },
                                        children: [_jsxs("h3", {
                                            className: "chart-title",
                                            style: {
                                                fontSize: "15px",
                                                marginBottom: "16px",
                                                borderBottom: "1px dashed var(--border-color)",
                                                paddingBottom: "10px",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                flexWrap: "wrap",
                                                gap: "10px"
                                            },
                                            children: [_jsxs("div", {
                                                style: { display: "flex", alignItems: "center", gap: "10px" },
                                                children: [
                                                    _jsx("span", { children: "📋 ออเดอร์ที่กำลังถืออยู่ (Active Trades)" }),
                                                    _jsxs("span", {
                                                        className: "badge badge-be",
                                                        style: {
                                                            background: "rgba(59, 130, 246, 0.15)",
                                                            color: "#3B82F6",
                                                            textTransform: "none"
                                                        },
                                                        children: [b.length, " ไม้ค้างอยู่"]
                                                    })
                                                ]
                                            }), _jsxs("div", {
                                                style: { display: "flex", gap: "6px", alignItems: "center" },
                                                children: [
                                                    _jsx("button", {
                                                        type: "button",
                                                        onClick: () => setActiveTradesViewMode("cards"),
                                                        style: {
                                                            padding: "4px 10px",
                                                            borderRadius: "6px",
                                                            border: "none",
                                                            fontSize: "11px",
                                                            fontWeight: "bold",
                                                            cursor: "pointer",
                                                            background: activeTradesViewMode === "cards" ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "rgba(255, 255, 255, 0.08)",
                                                            color: activeTradesViewMode === "cards" ? "#fff" : "var(--text-secondary)",
                                                            boxShadow: activeTradesViewMode === "cards" ? "0 2px 8px rgba(59,130,246,0.3)" : "none",
                                                            transition: "all 0.2s ease"
                                                        },
                                                        children: "🎴 มุมมองกรอบการ์ด (ดูง่าย)"
                                                    }),
                                                    _jsx("button", {
                                                        type: "button",
                                                        onClick: () => setActiveTradesViewMode("table"),
                                                        style: {
                                                            padding: "4px 10px",
                                                            borderRadius: "6px",
                                                            border: "none",
                                                            fontSize: "11px",
                                                            fontWeight: "bold",
                                                            cursor: "pointer",
                                                            background: activeTradesViewMode === "table" ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "rgba(255, 255, 255, 0.08)",
                                                            color: activeTradesViewMode === "table" ? "#fff" : "var(--text-secondary)",
                                                            boxShadow: activeTradesViewMode === "table" ? "0 2px 8px rgba(59,130,246,0.3)" : "none",
                                                            transition: "all 0.2s ease"
                                                        },
                                                        children: "📋 มุมมองตาราง"
                                                    })
                                                ]
                                            })]
                                        }), b.length > 0 ? (
                                            activeTradesViewMode === "cards" ? _jsx("div", {
                                                style: {
                                                    display: "grid",
                                                    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 310px), 1fr))",
                                                    gap: "12px",
                                                    width: "100%"
                                                },
                                                children: sortedActiveTrades.map((T, idx) => {
                                                    const Z = T.id || `demo-${idx}`;
                                                    const isBuy = String(T["ประเภทการเข้า"] || "").toLowerCase().includes("buy");
                                                    const lt = isBuy;
                                                    const Dt = T["ช่วงเวลา"] || "";
                                                    const Pi = `${T["วันที่เปิด"] ? T["วันที่เปิด"].split(" ")[0] : ""} ${Dt}`.trim();
                                                    const isGold = (T.marketType || activeMarketType) === "thai_gold";
                                                    const entryPrice = parseFloat(T["ราคาที่เข้า"] || 0);
                                                    const qty = parseFloat(T["ความเสี่ยง"] || 0);
                                                    const totalPurchase = isGold ? (entryPrice * (qty / 15.244)) : (entryPrice * qty);
                                                    const symKey = (T["คู่เงิน"] || T.pair || "").trim();
                                                    const currentPrice = currentPrices[Z] || currentPrices[symKey] || currentPrices[symKey.toUpperCase()] || entryPrice;
                                                    const mult = getPairMultiplier(symKey);

                                                    // TP and SL points and prices
                                                    let tpPrice = parseFloat(T["ราคา TP"] || T.tpPrice || 0);
                                                    let slPrice = parseFloat(T["ราคา SL"] || T.slPrice || 0);
                                                    let tpPts = parseInt(T["TP(จุด)\nที่ตั้งใว้"] || T["TP(จุด) ที่ตั้งใว้"] || T["TP (จุด)"] || T.tpPoints || 0);
                                                    let slPts = parseInt(T["SL(จุด)\nที่ตั้งใว้"] || T["SL(จุด) ที่ตั้งใว้"] || T["SL (จุด)"] || T.slPoints || 0);

                                                    if (!tpPts && entryPrice > 0 && tpPrice > 0) {
                                                        tpPts = Math.round(Math.abs(tpPrice - entryPrice) * mult);
                                                    }
                                                    if (!slPts && entryPrice > 0 && slPrice > 0) {
                                                        slPts = Math.round(Math.abs(slPrice - entryPrice) * mult);
                                                    }
                                                    if (!tpPrice && entryPrice > 0 && tpPts > 0) {
                                                        tpPrice = isBuy ? entryPrice + (tpPts / mult) : entryPrice - (tpPts / mult);
                                                    }
                                                    if (!slPrice && entryPrice > 0 && slPts > 0) {
                                                        slPrice = isBuy ? entryPrice - (slPts / mult) : entryPrice + (slPts / mult);
                                                    }

                                                    // Profit calculation
                                                    let currentProfit = 0;
                                                    let pointsProfit = 0;
                                                    if (activeMarketType === "forex") {
                                                        pointsProfit = isBuy ? Math.round((currentPrice - entryPrice) * mult) : Math.round((entryPrice - currentPrice) * mult);
                                                        const lotSize = qty || 0.01;
                                                        const isXAU = symKey.toUpperCase().includes("XAU");
                                                        currentProfit = isXAU 
                                                            ? (isBuy ? (currentPrice - entryPrice) : (entryPrice - currentPrice)) * (lotSize * 100)
                                                            : pointsProfit * (lotSize * 0.1);
                                                    } else {
                                                        const pnlMultiplier = isGold ? (qty / 15.244) : qty;
                                                        currentProfit = isBuy 
                                                            ? (currentPrice - entryPrice) * pnlMultiplier 
                                                            : (entryPrice - currentPrice) * pnlMultiplier;
                                                    }
                                                    if (isNaN(currentProfit)) currentProfit = 0;

                                                    const decimals = symKey.toUpperCase().includes("JPY") ? 3 : symKey.toUpperCase().includes("XAU") ? 2 : (activeMarketType === "forex" ? 5 : 2);
                                                    const currPrefix = (activeMarketType === "forex" || activeMarketType === "foreign_stock") ? "$" : "฿";

                                                    return _jsxs("div", {
                                                        key: Z,
                                                        style: {
                                                            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.85))",
                                                            border: lt ? "1.5px solid #22c55e" : "1.5px solid #ef4444",
                                                            boxShadow: lt ? "0 4px 14px rgba(0,0,0,0.35), 0 0 10px rgba(34, 197, 94, 0.2)" : "0 4px 14px rgba(0,0,0,0.35), 0 0 10px rgba(239, 68, 68, 0.2)",
                                                            borderRadius: "12px",
                                                            padding: "14px 16px",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            gap: "10px"
                                                        },
                                                        children: [
                                                            _jsxs("div", {
                                                                style: { display: "flex", justifyContent: "space-between", alignItems: "center" },
                                                                children: [
                                                                    _jsxs("div", {
                                                                        style: { display: "flex", alignItems: "center", gap: "8px" },
                                                                        children: [
                                                                            _jsx("span", { style: { fontSize: "17px", fontWeight: "800", color: "#fff" }, children: T["คู่เงิน"] }),
                                                                            _jsx("span", {
                                                                                style: {
                                                                                    fontSize: "12px",
                                                                                    background: lt ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                                                                                    color: lt ? "#22c55e" : "#ef4444",
                                                                                    padding: "2px 8px",
                                                                                    borderRadius: "6px",
                                                                                    fontWeight: "bold"
                                                                                },
                                                                                children: T["ประเภทการเข้า"] || (lt ? "Buy" : "Sell")
                                                                            })
                                                                        ]
                                                                    }),
                                                                    _jsxs("div", {
                                                                        style: { display: "flex", gap: "6px" },
                                                                        children: [
                                                                            _jsx("button", {
                                                                                onClick: () => {
                                                                                    setSelectedActiveTrade(Z);
                                                                                    setActiveClosingTrade(T);
                                                                                    setCloseDetails({
                                                                                        outcome: "Win",
                                                                                        pips: "",
                                                                                        profitUSD: "",
                                                                                        remarks: "",
                                                                                        closeMethod: "plan",
                                                                                        closePrice: activeMarketType === "forex" ? "" : (currentPrice ? currentPrice.toFixed(2) : ""),
                                                                                        lotSize: activeMarketType === "forex" ? "0.01" : "100",
                                                                                        withholdingTax: "7"
                                                                                    });
                                                                                },
                                                                                style: {
                                                                                    background: "rgba(59, 130, 246, 0.15)",
                                                                                    border: "1px solid #3b82f6",
                                                                                    color: "#60a5fa",
                                                                                    margin: 0,
                                                                                    padding: "4px 10px",
                                                                                    borderRadius: "8px",
                                                                                    fontSize: "12px",
                                                                                    fontWeight: "bold",
                                                                                    cursor: "pointer",
                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                    gap: "4px",
                                                                                    whiteSpace: "nowrap"
                                                                                },
                                                                                children: "🎯 ปิดไม้"
                                                                            }),
                                                                            _jsx("button", {
                                                                                onClick: () => handleEditActiveClick(T),
                                                                                style: {
                                                                                    background: "rgba(255, 255, 255, 0.05)",
                                                                                    border: "1px solid rgba(255, 255, 255, 0.15)",
                                                                                    margin: 0,
                                                                                    padding: "4px 8px",
                                                                                    borderRadius: "8px",
                                                                                    fontSize: "12px",
                                                                                    cursor: "pointer"
                                                                                },
                                                                                title: "แก้ไข",
                                                                                children: "✏️"
                                                                            }),
                                                                            _jsx("button", {
                                                                                onClick: () => Dh(T.id),
                                                                                style: {
                                                                                    background: "rgba(239, 68, 68, 0.1)",
                                                                                    border: "1px solid rgba(239, 68, 68, 0.4)",
                                                                                    color: "#ef4444",
                                                                                    margin: 0,
                                                                                    padding: "4px 8px",
                                                                                    borderRadius: "8px",
                                                                                    fontSize: "12px",
                                                                                    cursor: "pointer"
                                                                                },
                                                                                title: "ลบ",
                                                                                children: "✕"
                                                                            })
                                                                        ]
                                                                    })
                                                                ]
                                                            }),
                                                            _jsxs("div", {
                                                                style: {
                                                                    display: "grid",
                                                                    gridTemplateColumns: activeMarketType !== "forex" ? "1fr 1fr 1fr 1fr" : "1fr 1fr",
                                                                    gap: "8px",
                                                                    fontSize: "12px",
                                                                    background: "rgba(0,0,0,0.3)",
                                                                    padding: "10px 12px",
                                                                    borderRadius: "10px"
                                                                },
                                                                children: [
                                                                    _jsxs("div", {
                                                                        children: [
                                                                            _jsx("span", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "2px" }, children: "ราคาเปิดเข้า" }),
                                                                            _jsx("strong", { style: { color: "#fff", fontSize: "15px" }, children: entryPrice ? entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: decimals }) : "-" })
                                                                        ]
                                                                    }),
                                                                    activeMarketType === "forex" ? _jsxs("div", {
                                                                        children: [
                                                                            _jsx("span", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "2px" }, children: "ขนาด Lot" }),
                                                                            _jsx("strong", { style: { color: "#38bdf8", fontSize: "15px" }, children: `${qty || T["ความเสี่ยง"] || "0.01"} Lot` })
                                                                        ]
                                                                    }) : _jsxs(_Fragment, {
                                                                        children: [
                                                                            _jsxs("div", {
                                                                                children: [
                                                                                    _jsx("span", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "2px" }, children: "ราคาปัจจุบัน" }),
                                                                                    _jsx("strong", { style: { color: "#60a5fa", fontSize: "15px" }, children: currentPrice ? currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: Math.max(decimals, 2) }) : "-" })
                                                                                ]
                                                                            }),
                                                                            _jsxs("div", {
                                                                                children: [
                                                                                    _jsx("span", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "2px" }, children: isGold ? "น้ำหนักทอง" : "จำนวนหุ้น" }),
                                                                                    _jsx("strong", { style: { color: "#fff", fontSize: "15px" }, children: qty ? (isGold ? `${qty} กรัม` : qty.toLocaleString()) : "-" })
                                                                                ]
                                                                            }),
                                                                            _jsxs("div", {
                                                                                children: [
                                                                                    _jsx("span", { style: { fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "2px" }, children: "จำนวนเงินที่ซื้อ" }),
                                                                                    _jsx("strong", { style: { color: "#fff", fontSize: "15px" }, children: currPrefix + (totalPurchase ? totalPurchase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-") })
                                                                                ]
                                                                            })
                                                                        ]
                                                                    })
                                                                ]
                                                            }),
                                                            (tpPrice > 0 || slPrice > 0 || tpPts > 0 || slPts > 0) && _jsxs("div", {
                                                                style: {
                                                                    display: "grid",
                                                                    gridTemplateColumns: "1fr 1fr",
                                                                    gap: "8px",
                                                                    background: "rgba(0, 0, 0, 0.25)",
                                                                    padding: "10px 12px",
                                                                    borderRadius: "10px",
                                                                    border: "1px solid rgba(255, 255, 255, 0.06)"
                                                                },
                                                                children: [
                                                                    _jsxs("div", {
                                                                        style: { display: "flex", flexDirection: "column", gap: "3px" },
                                                                        children: [
                                                                            _jsxs("div", {
                                                                                style: { display: "flex", alignItems: "center", justifyContent: "space-between" },
                                                                                children: [
                                                                                    _jsx("span", { style: { fontSize: "11px", color: "#34d399", fontWeight: "700" }, children: "🎯 TP (เป้าหมาย)" }),
                                                                                    tpPts > 0 ? _jsxs("span", {
                                                                                        style: {
                                                                                            fontSize: "10px",
                                                                                            color: "#34d399",
                                                                                            background: "rgba(16, 185, 129, 0.18)",
                                                                                            padding: "1px 6px",
                                                                                            borderRadius: "4px",
                                                                                            fontWeight: "600"
                                                                                        },
                                                                                        children: [tpPts.toLocaleString(), " จุด"]
                                                                                    }) : null
                                                                                ]
                                                                            }),
                                                                            _jsx("strong", {
                                                                                style: { fontSize: "15px", color: "#34d399" },
                                                                                children: tpPrice > 0 ? tpPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: decimals }) : (tpPts > 0 ? `${tpPts} จุด` : "-")
                                                                            })
                                                                        ]
                                                                    }),
                                                                    _jsxs("div", {
                                                                        style: { display: "flex", flexDirection: "column", gap: "3px" },
                                                                        children: [
                                                                            _jsxs("div", {
                                                                                style: { display: "flex", alignItems: "center", justifyContent: "space-between" },
                                                                                children: [
                                                                                    _jsx("span", { style: { fontSize: "11px", color: "#f87171", fontWeight: "700" }, children: "🛑 SL (ตัดขาดทุน)" }),
                                                                                    slPts > 0 ? _jsxs("span", {
                                                                                        style: {
                                                                                            fontSize: "10px",
                                                                                            color: "#f87171",
                                                                                            background: "rgba(239, 68, 68, 0.18)",
                                                                                            padding: "1px 6px",
                                                                                            borderRadius: "4px",
                                                                                            fontWeight: "600"
                                                                                        },
                                                                                        children: [slPts.toLocaleString(), " จุด"]
                                                                                    }) : null
                                                                                ]
                                                                            }),
                                                                            _jsx("strong", {
                                                                                style: { fontSize: "15px", color: "#f87171" },
                                                                                children: slPrice > 0 ? slPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: decimals }) : (slPts > 0 ? `${slPts} จุด` : "-")
                                                                            })
                                                                        ]
                                                                    })
                                                                ]
                                                            }),
                                                            _jsxs("div", {
                                                                style: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed rgba(255,255,255,0.12)", paddingTop: "8px" },
                                                                children: [
                                                                    _jsxs("span", { style: { fontSize: "12px", color: "var(--text-muted)" }, children: ["🕒 ", Pi] }),
                                                                    activeMarketType !== "forex" ? _jsxs("div", {
                                                                        style: { display: "flex", alignItems: "center" },
                                                                        children: [
                                                                            _jsx("span", { style: { fontSize: "12px", color: "var(--text-muted)", marginRight: "6px" }, children: "กำไร/ขาดทุน:" }),
                                                                            _jsx("strong", {
                                                                                style: {
                                                                                    fontSize: "15px",
                                                                                    color: currentProfit > 0 ? "#22c55e" : currentProfit < 0 ? "#ef4444" : "#fff",
                                                                                    fontWeight: "700"
                                                                                },
                                                                                children: (currentProfit > 0 ? "+" : "") + currPrefix + currentProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                                            })
                                                                        ]
                                                                    }) : _jsx("span", {
                                                                        style: {
                                                                            fontSize: "11px",
                                                                            color: "#38bdf8",
                                                                            background: "rgba(56, 189, 248, 0.12)",
                                                                            border: "1px solid rgba(56, 189, 248, 0.3)",
                                                                            padding: "2px 8px",
                                                                            borderRadius: "6px",
                                                                            fontWeight: "600"
                                                                        },
                                                                        children: "สถานะ: กำลังถือครอง"
                                                                    })
                                                                ]
                                                            })
                                                        ]
                                                    });
                                                })
                                            }) : _jsx("div", {
                                            style: {
                                                overflowX: "auto",
                                                flex: 1,
                                                maxHeight: "350px"
                                            },
                                            children: _jsxs("table", {
                                                className: "journal-table active-trades-table",
                                                style: {
                                                    width: "100%",
                                                    fontSize: "12px",
                                                    borderCollapse: "collapse"
                                                },
                                                children: [_jsx("thead", {
                                                    children: _jsxs("tr", {
                                                        style: {
                                                            background: "rgba(15, 23, 42, 0.4)",
                                                            borderBottom: "1px solid var(--border-color)"
                                                        },
                                                        children: [_jsx("th", {
                                                            style: {
                                                                padding: "10px 8px",
                                                                textAlign: "left",
                                                                color: "var(--text-secondary)"
                                                            },
                                                            children: "เวลาเปิด"
                                                        }), _jsx("th", {
                                                            style: {
                                                                padding: "10px 8px",
                                                                textAlign: "left",
                                                                color: "var(--text-secondary)"
                                                            },
                                                            children: "คู่เงิน / หุ้น"
                                                        }), activeMarketType === "forex" && _jsx("th", {
                                                            style: {
                                                                padding: "10px 8px",
                                                                textAlign: "left",
                                                                color: "var(--text-secondary)"
                                                            },
                                                            children: "ประเภท"
                                                        }), _jsx("th", {
                                                            style: {
                                                                padding: "10px 8px",
                                                                textAlign: "right",
                                                                color: "var(--text-secondary)"
                                                            },
                                                            children: "ราคาเข้า"
                                                        }), activeMarketType !== "forex" ? _jsxs(_Fragment, {
                                                            children: [_jsx("th", {
                                                                style: {
                                                                    padding: "10px 8px",
                                                                    textAlign: "right",
                                                                    color: "var(--text-secondary)"
                                                                },
                                                                children: "จำนวนหุ้น"
                                                            }), _jsx("th", {
                                                                style: {
                                                                    padding: "10px 8px",
                                                                    textAlign: "right",
                                                                    color: "var(--text-secondary)"
                                                                },
                                                                children: "จำนวนเงินที่ซื้อ"
                                                            }), _jsx("th", {
                                                                style: {
                                                                    padding: "10px 8px",
                                                                    textAlign: "right",
                                                                    color: "var(--text-secondary)"
                                                                },
                                                                children: "ราคาปัจจุบัน"
                                                            }), _jsx("th", {
                                                                style: {
                                                                    padding: "10px 8px",
                                                                    textAlign: "right",
                                                                    color: "var(--text-secondary)"
                                                                },
                                                                children: "กำไร/ขาดทุน ตอนนี้"
                                                            })]
                                                        }) : _jsx("th", {
                                                            style: {
                                                                padding: "10px 8px",
                                                                textAlign: "center",
                                                                color: "var(--text-secondary)"
                                                            },
                                                            children: "TP / SL"
                                                        }), _jsx("th", {
                                                            style: {
                                                                padding: "10px 8px",
                                                                textAlign: "center",
                                                                color: "var(--text-secondary)"
                                                            },
                                                            children: "จัดการ"
                                                        })]
                                                    })
                                                }), _jsx("tbody", {
                                                    children: b.map((T, $) => {
                                                        const Z = T.id || `demo-${$}`,
                                                            lt = String(T["ประเภทการเข้า"]).includes("Buy"),
                                                            Dt = T["ช่วงเวลา"] || "",
                                                            Pi = `${T["วันที่เปิด"]?T["วันที่เปิด"].split(" ")[0]:""} ${Dt}`;
                                                        
                                                        const entryPrice = parseFloat(T["ราคาที่เข้า"] || 0);
                                                        const qty = parseFloat(T["ความเสี่ยง"] || 0);
                                                        const totalPurchase = entryPrice * qty;
                                                        const currentPrice = currentPrices[Z] || entryPrice;
                                                        const isBuy = String(T["ประเภทการเข้า"]).includes("Buy") || String(T["ประเภทการเข้า"]).includes("Limit") || true;
                                                        const currentProfit = isBuy 
                                                            ? (currentPrice - entryPrice) * qty 
                                                            : (entryPrice - currentPrice) * qty;

                                                        return _jsxs("tr", {
                                                            style: {
                                                                borderBottom: "1px solid rgba(255,255,255,0.05)"
                                                            },
                                                            children: [_jsx("td", {
                                                                style: {
                                                                    padding: "10px 8px",
                                                                    color: "var(--text-secondary)",
                                                                    whiteSpace: "nowrap"
                                                                },
                                                                children: Pi
                                                            }), _jsx("td", {
                                                                style: {
                                                                    padding: "10px 8px",
                                                                    fontWeight: "bold",
                                                                    color: "#fff"
                                                                },
                                                                children: T["คู่เงิน"]
                                                            }), activeMarketType === "forex" && _jsx("td", {
                                                                style: {
                                                                    padding: "10px 8px"
                                                                },
                                                                className: lt ? "type-buy" : "type-sell",
                                                                children: T["ประเภทการเข้า"]
                                                            }), _jsx("td", {
                                                                style: {
                                                                    padding: "10px 8px",
                                                                    textAlign: "right",
                                                                    color: "#fff"
                                                                },
                                                                children: T["ราคาที่เข้า"] ? parseFloat(T["ราคาที่เข้า"]).toLocaleString() : "-"
                                                            }), activeMarketType !== "forex" ? _jsxs(_Fragment, {
                                                                children: [_jsx("td", {
                                                                    style: {
                                                                        padding: "10px 8px",
                                                                        textAlign: "right",
                                                                        color: "#fff"
                                                                    },
                                                                    children: qty ? qty.toLocaleString() : "-"
                                                                }), _jsx("td", {
                                                                    style: {
                                                                        padding: "10px 8px",
                                                                        textAlign: "right",
                                                                        color: "#fff"
                                                                    },
                                                                    children: totalPurchase ? totalPurchase.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "-"
                                                                }), _jsx("td", {
                                                                    style: {
                                                                        padding: "10px 8px",
                                                                        textAlign: "right",
                                                                        color: "#60A5FA",
                                                                        fontWeight: "bold"
                                                                    },
                                                                    children: currentPrice ? currentPrice.toFixed(2) : "-"
                                                                }), _jsx("td", {
                                                                    style: {
                                                                        padding: "10px 8px",
                                                                        textAlign: "right",
                                                                        fontWeight: "bold",
                                                                        color: currentProfit > 0 ? "var(--color-success)" : currentProfit < 0 ? "var(--color-danger)" : "#fff"
                                                                    },
                                                                    children: (currentProfit > 0 ? "+" : "") + currentProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
                                                                })]
                                                            }) : _jsx("td", {
                                                                style: {
                                                                    padding: "10px 8px",
                                                                    textAlign: "center",
                                                                    color: "var(--text-secondary)",
                                                                    whiteSpace: "nowrap"
                                                                },
                                                                children: T["ราคา TP"] || T["ราคา SL"] ? _jsxs("span", {
                                                                    style: {
                                                                        fontSize: "11px"
                                                                    },
                                                                    children: [_jsx("span", {
                                                                        style: {
                                                                            color: "var(--color-success)"
                                                                        },
                                                                        children: T["ราคา TP"] || "-"
                                                                    }), " / ", _jsx("span", {
                                                                        style: {
                                                                            color: "var(--color-danger)"
                                                                        },
                                                                        children: T["ราคา SL"] || "-"
                                                                    })]
                                                                }) : _jsxs("span", {
                                                                    style: {
                                                                        fontSize: "11px"
                                                                    },
                                                                    children: [_jsxs("span", {
                                                                        style: {
                                                                            color: "var(--color-success)"
                                                                        },
                                                                        children: ["+", T["TP(จุด)\nที่ตั้งใว้"] || T["TP(จุด) ที่ตั้งใว้"] || T["TP (จุด)"] || T.tpPoints || "300"]
                                                                    }), " / ", _jsxs("span", {
                                                                        style: {
                                                                            color: "var(--color-danger)"
                                                                        },
                                                                        children: ["-", T["SL(จุด)\nที่ตั้งใว้"] || T["SL(จุด) ที่ตั้งใว้"] || T["SL (จุด)"] || T.slPoints || "150"]
                                                                    })]
                                                                })
                                                            }), _jsx("td", {
                                                                style: {
                                                                    padding: "10px 8px",
                                                                    textAlign: "center"
                                                                },
                                                                children: _jsxs("div", {
                                                                    style: {
                                                                        display: "flex",
                                                                        gap: "6px",
                                                                        justifyContent: "center"
                                                                    },
                                                                    children: [_jsx("button", {
                                                                        onClick: () => {
                                                                            setSelectedActiveTrade(Z), setActiveClosingTrade(T), setCloseDetails({
                                                                                outcome: "Win",
                                                                                pips: "",
                                                                                profitUSD: "",
                                                                                remarks: "",
                                                                                closeMethod: "plan",
                                                                                closePrice: activeMarketType === "forex" ? "" : (currentPrices[Z] ? currentPrices[Z].toFixed(2) : ""),
                                                                                lotSize: activeMarketType === "forex" ? "0.01" : "100",
                                                                                withholdingTax: "7"
                                                                            })
                                                                        },
                                                                        className: "btn-quick-select active",
                                                                        style: {
                                                                            margin: 0,
                                                                            padding: "4px 8px",
                                                                            fontSize: "11px",
                                                                            whiteSpace: "nowrap"
                                                                        },
                                                                        children: "🎯 ปิดไม้"
                                                                    }), _jsx("button", {
                                                                        onClick: () => handleEditActiveClick(T),
                                                                        className: "btn-quick-select",
                                                                        style: {
                                                                            margin: 0,
                                                                            padding: "4px 8px",
                                                                            fontSize: "11px"
                                                                        },
                                                                        title: "แก้ไข",
                                                                        children: "✏️"
                                                                    }), _jsx("button", {
                                                                        onClick: () => Dh(T.id),
                                                                        className: "btn-quick-select",
                                                                        style: {
                                                                            border: "1px solid rgba(239, 68, 68, 0.4)",
                                                                            color: "#ef4444",
                                                                            padding: "4px 8px",
                                                                            fontSize: "11px"
                                                                        },
                                                                        title: "ลบ",
                                                                        children: "✕"
                                                                    })]
                                                                })
                                                            })]
                                                        });
                                                    })
                                                })
                                            ]})
                                        })
                                ) : _jsxs("div", {
                                            style: {
                                                textAlign: "center",
                                                padding: "50px 20px",
                                                color: "var(--text-muted)",
                                                fontSize: "13px",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flex: 1
                                            },
                                            children: [_jsx(Info, {
                                                size: 32,
                                                style: {
                                                    marginBottom: "12px",
                                                    color: "var(--text-muted)"
                                                }
                                            }), _jsx("span", {
                                                children: "ไม่มีไม้ค้างที่ถืออยู่ ณ ขณะนี้"
                                            }), _jsx("span", {
                                                style: {
                                                    fontSize: "11px",
                                                    marginTop: "4px"
                                                },
                                                children: "ป้อนแบบฟอร์มเปิดไม้ใหม่ฝั่งซ้ายได้เลยครับ"
                                            })]
                                        })]
                                    })]
                                }), _jsxs("div", {
                                    className: "glass-card",
                                    children: [_jsxs("div", {
                                        className: "controls-row",
                                        style: {
                                            marginBottom: "16px"
                                        },
                                        children: [_jsxs("h3", {
                                            className: "chart-title",
                                            style: {
                                                margin: 0
                                            },
                                            children: [_jsx("span", {
                                                children: "📜 ประวัติบันทึกการเทรดที่ปิดแล้ว (Closed Trades History)"
                                            }), _jsxs("span", {
                                                style: {
                                                    fontSize: "14px",
                                                    color: "var(--text-secondary)",
                                                    fontWeight: "normal",
                                                    marginLeft: "8px"
                                                },
                                                children: ["(พบ ", W.length, " ออเดอร์)"]
                                            })]
                                        }), _jsxs("div", {
                                            className: "filters-group",
                                            children: [_jsxs("div", {
                                                children: [_jsx("label", {
                                                    className: "form-label",
                                                    style: {
                                                        fontSize: "11px",
                                                        marginBottom: "4px"
                                                    },
                                                    children: "คัดกรองคู่เงิน"
                                                }), _jsx("select", {
                                                    className: "select-filter",
                                                    value: pairFilter,
                                                    onChange: T => setPairFilter(T.target.value),
                                                    style: {
                                                        padding: "6px 12px"
                                                    },
                                                    children: L.map((T, $) => _jsx("option", {
                                                        value: T,
                                                        children: T
                                                    }, $))
                                                })]
                                            }), _jsxs("div", {
                                                children: [_jsx("label", {
                                                    className: "form-label",
                                                    style: {
                                                        fontSize: "11px",
                                                        marginBottom: "4px"
                                                    },
                                                    children: "คัดกรองผลลัพธ์"
                                                }), _jsxs("select", {
                                                    className: "select-filter",
                                                    value: resultFilter,
                                                    onChange: T => setResultFilter(T.target.value),
                                                    style: {
                                                        padding: "6px 12px"
                                                    },
                                                    children: [_jsx("option", {
                                                        value: "ALL",
                                                        children: "แสดงผลลัพธ์ทั้งหมด"
                                                    }), _jsx("option", {
                                                        value: "WIN",
                                                        children: "ชนะ (Wins)"
                                                    }), _jsx("option", {
                                                        value: "LOSS",
                                                        children: "แพ้ (Losses)"
                                                    }), _jsx("option", {
                                                        value: "BE",
                                                        children: "กันทุน (Break Evens)"
                                                    })]
                                                })]
                                            }), _jsxs("div", {
                                                style: {
                                                    display: "flex",
                                                    gap: "8px",
                                                    alignItems: "flex-end"
                                                },
                                                children: [hideSheetTrades && _jsx("button", {
                                                    onClick: handleResetSync,
                                                    className: "btn-quick-select",
                                                    style: {
                                                        border: "1px solid var(--color-success)",
                                                        color: "var(--color-success)",
                                                        margin: 0,
                                                        padding: "8px 12px",
                                                        height: "36px"
                                                    },
                                                    children: "🔄 เรียกคืนข้อมูลชีต"
                                                }), _jsx("button", {
                                                    onClick: kh,
                                                    className: "btn-quick-select",
                                                    style: {
                                                        border: "1px solid rgba(239, 68, 68, 0.4)",
                                                        color: "#ef4444",
                                                        margin: 0,
                                                        padding: "8px 12px",
                                                        height: "36px"
                                                    },
                                                    children: "🧹 ล้างประวัติเพื่อเริ่มเทรดใหม่"
                                                })]
                                            })]
                                        })]
                                    }), _jsx("div", {
                                        style: {
                                            overflowX: "auto"
                                        },
                                        children: _jsxs("table", {
                                            className: "data-table journal-history-table",
                                            style: {
                                                tableLayout: "fixed",
                                                width: "100%",
                                                minWidth: "unset"
                                            },
                                            children: [
                                                activeMarketType === "thai_gold" ? _jsxs("colgroup", {
                                                    children: [
                                                        _jsx("col", { style: { width: "95px" } }),
                                                        _jsx("col", { style: { width: "75px" } }),
                                                        _jsx("col", { style: { width: "105px" } }),
                                                        _jsx("col", { style: { width: "95px" } }),
                                                        _jsx("col", { style: { width: "80px" } }),
                                                        _jsx("col", { style: { width: "80px" } }),
                                                        _jsx("col", { style: { width: "95px" } }),
                                                        _jsx("col", { style: { width: "110px" } }),
                                                        _jsx("col", { style: { width: "70px" } })
                                                    ]
                                                }) : (activeMarketType === "thai_stock" || activeMarketType === "inter_stock") ? _jsxs("colgroup", {
                                                    children: [
                                                        _jsx("col", { style: { width: "95px" } }),
                                                        _jsx("col", { style: { width: "75px" } }),
                                                        _jsx("col", { style: { width: "85px" } }),
                                                        _jsx("col", { style: { width: "105px" } }),
                                                        _jsx("col", { style: { width: "80px" } }),
                                                        _jsx("col", { style: { width: "80px" } }),
                                                        _jsx("col", { style: { width: "95px" } }),
                                                        _jsx("col", { style: { width: "110px" } }),
                                                        _jsx("col", { style: { width: "70px" } })
                                                    ]
                                                }) : _jsxs("colgroup", {
                                                    children: [
                                                        _jsx("col", { style: { width: "95px" } }),
                                                        _jsx("col", { style: { width: "75px" } }),
                                                        _jsx("col", { style: { width: "65px" } }),
                                                        _jsx("col", { style: { width: "75px" } }),
                                                        _jsx("col", { style: { width: "100px" } }),
                                                        _jsx("col", { style: { width: "80px" } }),
                                                        _jsx("col", { style: { width: "80px" } }),
                                                        _jsx("col", { style: { width: "80px" } }),
                                                        _jsx("col", { style: { width: "115px" } }),
                                                        _jsx("col", { style: { width: "70px" } })
                                                    ]
                                                }),
                                                _jsx("thead", {
                                                    children: activeMarketType === "thai_gold" ? _jsxs("tr", {
                                                        children: [
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px" }, children: "เวลาเปิด" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px" }, children: "ทองคำ" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px", textAlign: "right" }, children: "จำนวนเงินที่ซื้อ" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px", textAlign: "right" }, children: "น้ำหนักทอง (กรัม)" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px", textAlign: "right" }, children: "ราคาเข้า" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px", textAlign: "right" }, children: "ราคาขาย" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px", textAlign: "right" }, children: "กำไร/ขาดทุน (฿)" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px" }, children: "หมายเหตุ" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px", textAlign: "center" }, children: "จัดการ" })
                                                        ]
                                                    }) : (activeMarketType === "thai_stock" || activeMarketType === "inter_stock") ? _jsxs("tr", {
                                                        children: [
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px" }, children: "เวลาเปิด" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px" }, children: activeMarketType === "thai_stock" ? "หุ้นไทย" : "หุ้นนอก" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px", textAlign: "right" }, children: "จำนวนหุ้น" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px", textAlign: "right" }, children: activeMarketType === "thai_stock" ? "เงินที่ซื้อ" : "เงินที่ซื้อ (USD)" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px", textAlign: "right" }, children: "ราคาเข้า" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px", textAlign: "right" }, children: "ราคาปิด" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px", textAlign: "right" }, children: activeMarketType === "thai_stock" ? "กำไร/ขาดทุน (฿)" : "กำไร/ขาดทุน ($)" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px" }, children: "หมายเหตุ" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px", textAlign: "center" }, children: "จัดการ" })
                                                        ]
                                                    }) : _jsxs("tr", {
                                                        children: [
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px" }, children: "เวลาเปิด" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px" }, children: "คู่เงิน" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px" }, children: "ประเภท" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px" }, children: "ผลลัพธ์" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px" }, children: "จุด / กำไร" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px", textAlign: "right" }, children: "ราคาเข้า" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px", textAlign: "right" }, children: "ราคาปิด" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px", textAlign: "right" }, children: "ความเสี่ยง" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px" }, children: "หมายเหตุ" }),
                                                            _jsx("th", { style: { fontSize: "11px", padding: "8px 6px", textAlign: "center" }, children: "จัดการ" })
                                                        ]
                                                    })
                                                }),
                                                _jsx("tbody", {
                                                    children: W.length > 0 ? W.map((T, $) => {
                                                        const Z = parseFloat(T["ผลลัพธ์ (จุด)"] || 0),
                                                            lt = parseFloat(T["กำไร/ขาดทุน($)"] || T["ผลกำไร/ขาดทุน"] || 0),
                                                            Dt = String(T["ผลลัพธ์"] || "").toLowerCase().includes("win") || String(T["ผลลัพธ์"] || "").includes("ชนะ") || Z > 0 || lt > 0,
                                                            Fe = String(T["ผลลัพธ์"] || "").toLowerCase().includes("loss") || String(T["ผลลัพธ์"] || "").includes("แพ้") || Z < 0 || lt < 0,
                                                            currSym = (activeMarketType === "thai_stock" || activeMarketType === "thai_gold") ? "฿" : "$";
                                                        const dateTd = _jsxs("td", {
                                                            style: { fontSize: "11px", padding: "7px 6px" },
                                                            children: [
                                                                _jsx("div", { style: { fontWeight: 600, color: "var(--text-primary)" }, children: T["วันที่เปิด"] }),
                                                                T["ช่วงเวลา"] && _jsx("div", { style: { fontSize: "10px", color: "var(--text-muted)", marginTop: "1px" }, children: T["ช่วงเวลา"] })
                                                            ]
                                                        });
                                                        const pairTd = _jsx("td", {
                                                            style: { fontSize: "12px", padding: "7px 6px", fontWeight: 700, color: "var(--text-primary)" },
                                                            children: T["คู่เงิน"]
                                                        });
                                                        const remarksTd = _jsx("td", {
                                                            style: { fontSize: "11px", padding: "7px 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
                                                            title: T["หมายเหตุ"],
                                                            children: T["หมายเหตุ"] || "-"
                                                        });
                                                        const actionsTd = _jsx("td", {
                                                            style: { padding: "7px 6px" },
                                                            children: _jsxs("div", {
                                                                style: { display: "flex", gap: "4px", justifyContent: "center" },
                                                                children: [
                                                                    _jsx("button", {
                                                                        type: "button",
                                                                        onClick: () => reopenTrade(T.id),
                                                                        title: "นำกลับไปออเดอร์ที่กำลังถืออยู่ (เผื่อกดปิดผิด)",
                                                                        style: { background: "rgba(56,189,248,0.15)", color: "#38bdf8", border: "none", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "11px" },
                                                                        children: "↩️"
                                                                    }),
                                                                    _jsx("button", {
                                                                        onClick: () => handleEditClosedClick(T),
                                                                        style: { background: "rgba(59,130,246,0.15)", color: "var(--color-primary)", border: "none", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "11px" },
                                                                        children: "✏️"
                                                                    }),
                                                                    _jsx("button", {
                                                                        onClick: () => Dh(T.id),
                                                                        style: { background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "none", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "11px" },
                                                                        children: "🗑️"
                                                                    })
                                                                ]
                                                            })
                                                        });

                                                        if (activeMarketType === "thai_gold") {
                                                            const entryP = parseFloat(T["ราคาที่เข้า"] || 0);
                                                            const closeP = parseFloat(T["ราคาที่ปิด"] || 0);
                                                            const goldRisk = parseFloat(T["ความเสี่ยง"] || 0);
                                                            const buyAmt = entryP * (goldRisk / 15.244);
                                                            return _jsxs("tr", {
                                                                children: [
                                                                    dateTd,
                                                                    pairTd,
                                                                    _jsx("td", { style: { fontSize: "11px", padding: "7px 6px", textAlign: "right" }, children: buyAmt > 0 ? (buyAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ฿") : "-" }),
                                                                    _jsx("td", { style: { fontSize: "11px", padding: "7px 6px", textAlign: "right" }, children: goldRisk ? (goldRisk.toLocaleString() + " กรัม") : "-" }),
                                                                    _jsx("td", { style: { fontSize: "11px", padding: "7px 6px", textAlign: "right" }, children: entryP ? entryP.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-" }),
                                                                    _jsx("td", { style: { fontSize: "11px", padding: "7px 6px", textAlign: "right", color: "var(--color-primary)", fontWeight: "600" }, children: closeP ? closeP.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-" }),
                                                                    _jsx("td", {
                                                                        style: { fontSize: "11px", padding: "7px 6px", textAlign: "right", fontWeight: "700" },
                                                                        className: lt > 0 ? "profit-text" : lt < 0 ? "loss-text" : "",
                                                                        children: lt !== 0 ? (lt > 0 ? `+฿${lt.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `-฿${Math.abs(lt).toLocaleString(undefined, { minimumFractionDigits: 2 })}`) : "-"
                                                                    }),
                                                                    remarksTd,
                                                                    actionsTd
                                                                ]
                                                            }, T.id || $);
                                                        }

                                                        if (activeMarketType === "thai_stock" || activeMarketType === "inter_stock") {
                                                            const entryP = parseFloat(T["ราคาที่เข้า"] || 0);
                                                            const closeP = parseFloat(T["ราคาที่ปิด"] || 0);
                                                            const shareQty = parseFloat(T["ความเสี่ยง"] || 0);
                                                            const totalBuy = entryP * shareQty;
                                                            return _jsxs("tr", {
                                                                children: [
                                                                    dateTd,
                                                                    pairTd,
                                                                    _jsx("td", { style: { fontSize: "11px", padding: "7px 6px", textAlign: "right" }, children: shareQty ? shareQty.toLocaleString() : "-" }),
                                                                    _jsx("td", { style: { fontSize: "11px", padding: "7px 6px", textAlign: "right" }, children: totalBuy > 0 ? (totalBuy.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ` ${currSym}`) : "-" }),
                                                                    _jsx("td", { style: { fontSize: "11px", padding: "7px 6px", textAlign: "right" }, children: entryP ? entryP.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-" }),
                                                                    _jsx("td", { style: { fontSize: "11px", padding: "7px 6px", textAlign: "right", color: "var(--color-primary)", fontWeight: "600" }, children: closeP ? closeP.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-" }),
                                                                    _jsx("td", {
                                                                        style: { fontSize: "11px", padding: "7px 6px", textAlign: "right", fontWeight: "700" },
                                                                        className: lt > 0 ? "profit-text" : lt < 0 ? "loss-text" : "",
                                                                        children: lt !== 0 ? (lt > 0 ? `+${currSym}${lt.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `-${currSym}${Math.abs(lt).toLocaleString(undefined, { minimumFractionDigits: 2 })}`) : "-"
                                                                    }),
                                                                    remarksTd,
                                                                    actionsTd
                                                                ]
                                                            }, T.id || $);
                                                        }

                                                        return _jsxs("tr", {
                                                            children: [
                                                                dateTd,
                                                                pairTd,
                                                                _jsx("td", {
                                                                    style: { fontSize: "11px", padding: "7px 6px" },
                                                                    className: String(T["ประเภทการเข้า"]).toLowerCase().includes("buy") ? "type-buy" : "type-sell",
                                                                    children: T["ประเภทการเข้า"]
                                                                }),
                                                                _jsx("td", {
                                                                    style: { padding: "7px 6px" },
                                                                    children: _jsx("span", {
                                                                        className: `badge ${Dt ? "badge-win" : Fe ? "badge-loss" : "badge-be"}`,
                                                                        style: { fontSize: "11px", padding: "2px 7px" },
                                                                        children: T["ผลลัพธ์"] || (Z === 0 ? "BE" : Z > 0 ? "Win" : "Loss")
                                                                    })
                                                                }),
                                                                _jsxs("td", {
                                                                    style: { fontSize: "11px", padding: "7px 6px" },
                                                                    children: [
                                                                        _jsxs("div", {
                                                                            className: Z > 0 ? "profit-text" : Z < 0 ? "loss-text" : "",
                                                                            style: { fontWeight: 600 },
                                                                            children: [Z > 0 ? `+${Z}` : Z || "-", " จุด"]
                                                                        }),
                                                                        lt !== 0 && _jsx("div", {
                                                                            className: lt > 0 ? "profit-text" : "loss-text",
                                                                            style: { fontSize: "10px", marginTop: "1px" },
                                                                            children: lt > 0 ? `+$${lt.toFixed(2)}` : `$${lt.toFixed(2)}`
                                                                        })
                                                                    ]
                                                                }),
                                                                _jsx("td", {
                                                                    style: { fontSize: "11px", padding: "7px 6px", textAlign: "right" },
                                                                    children: T["ราคาที่เข้า"]
                                                                }),
                                                                _jsx("td", {
                                                                    style: { fontSize: "11px", padding: "7px 6px", textAlign: "right", color: "var(--color-primary)", fontWeight: "600" },
                                                                    children: T["ราคาที่ปิด"] || "-"
                                                                }),
                                                                _jsx("td", {
                                                                    style: { fontSize: "11px", padding: "7px 6px", textAlign: "right" },
                                                                    children: T["ความเสี่ยง"]
                                                                }),
                                                                remarksTd,
                                                                actionsTd
                                                            ]
                                                        }, T.id || $);
                                                    }) : _jsx("tr", {
                                                        children: _jsx("td", {
                                                            colSpan: (activeMarketType === "thai_gold" || activeMarketType === "thai_stock" || activeMarketType === "inter_stock") ? "9" : "10",
                                                            style: { textAlign: "center", padding: "40px" },
                                                            children: "ไม่พบรายการบันทึกออเดอร์ประวัติการเทรดที่ปิดแล้วตามตัวกรอง"
                                                        })
                                                    })
                                                })
                                            ]
                                        })
                                    })]
                                })]
                            })
                        })(), activeTab === "settings" && _jsxs(_Fragment, {
                            children: [_jsx(TelegramSettingsCard, {}), _jsxs("div", {
                                className: "glass-card settings-box",
                                children: [_jsxs("h2", {
                                className: "chart-title",
                                children: [_jsx(Settings, {
                                    size: 20
                                }), _jsx("span", {
                                    children: "ตั้งค่าการเชื่อมโยงระบบ (System Configuration)"
                                })]
                            }), _jsxs("div", {
                                style: {
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "24px"
                                },
                                children: [_jsxs("div", {
                                    className: "form-group",
                                    style: {
                                        margin: 0
                                    },
                                    children: [_jsx("label", {
                                        className: "form-label",
                                        children: "Google Sheet ID สำหรับดึงข้อมูลการเทรด"
                                    }), _jsxs("div", {
                                        className: "input-wrapper",
                                        children: [_jsx(Link, {
                                            className: "input-icon",
                                            size: 18
                                        }), _jsx("input", {
                                            type: "text",
                                            className: "form-input",
                                            value: spreadsheetId,
                                            onChange: b => setSpreadsheetId(b.target.value)
                                        })]
                                    }), _jsx("authError", {
                                        className: "help-text",
                                        children: "* ชีต ID ดั้งเดิมของคุณคือ: `11N8winbGyNa6nm8rx_4DUj2zzVM49j5OJ1ipPo6_kd4`"
                                    })]
                                }), _jsxs("div", {
                                    className: "form-group",
                                    style: {
                                        margin: 0,
                                        borderTop: "1px solid var(--border-color)",
                                        paddingTop: "20px"
                                    },
                                    children: [_jsx("label", {
                                        className: "form-label",
                                        style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            color: "var(--color-primary)",
                                            fontSize: "13px",
                                            fontWeight: "bold"
                                        },
                                        children: "🔄 นำเข้า/ส่งออก ข้อมูลบันทึกเทรดระหว่างอุปกรณ์ (Data Sync)"
                                    }), _jsx("authError", {
                                        className: "help-text",
                                        style: {
                                            marginBottom: "12px",
                                            fontSize: "11.5px",
                                            color: "var(--text-muted)"
                                        },
                                        children: "ข้อมูลออเดอร์ที่คุณบันทึกผ่านทางฟอร์มบนเว็บจะถูกบันทึกไว้ในเบราว์เซอร์ของเครื่องนี้เท่านั้น (LocalStorage) เพื่อให้ข้อมูลบนคอมพิวเตอร์และมือถือเชื่อมโยงกัน คุณสามารถกดปุ่มส่งออกข้อมูลเพื่อรับรหัส จากนั้นนำรหัสไปวางนำเข้าในอีกเครื่องหนึ่งได้ทันทีครับ"
                                    }), _jsxs("div", {
                                        style: {
                                            display: "flex",
                                            gap: "10px",
                                            flexWrap: "wrap"
                                        },
                                        children: [_jsx("button", {
                                            type: "button",
                                            onClick: () => {
                                                try {
                                                    const b = localStorage.getItem(getUserKey("forex_dashboard_local_trades")) || "[]",
                                                        D = localStorage.getItem(getUserKey("forex_dashboard_deleted_trade_ids")) || "[]",
                                                        z = {
                                                            localTrades: JSON.parse(b),
                                                            deletedIds: JSON.parse(D)
                                                        },
                                                        V = btoa(unescape(encodeURIComponent(JSON.stringify(z))));
                                                    navigator.clipboard.writeText(V), alert("คัดลอกรหัสข้อมูลของเครื่องนี้ไปยังคลิปบอร์ดแล้ว! สามารถนำรหัสนี้ไปกด 'นำเข้าข้อมูล' ในอีกอุปกรณ์หนึ่งได้ทันทีครับ")
                                                } catch (b) {
                                                    alert("เกิดข้อผิดพลาดในการส่งออกข้อมูล: " + b.message)
                                                }
                                            },
                                            className: "btn-primary",
                                            style: {
                                                width: "auto",
                                                padding: "10px 16px",
                                                fontSize: "12px",
                                                height: "auto"
                                            },
                                            children: "📤 ส่งออกข้อมูลของเครื่องนี้ (คัดลอกรหัส)"
                                        }), _jsx("button", {
                                            type: "button",
                                            onClick: () => {
                                                const b = prompt("กรุณาวางรหัสข้อมูลที่ได้จากการกด 'ส่งออกข้อมูล' ของอุปกรณ์อื่นที่นี่:");
                                                if (b) try {
                                                    const D = JSON.parse(decodeURIComponent(escape(atob(b.trim()))));
                                                    if (D && Array.isArray(D.localTrades)) {
                                                        if (confirm("คุณต้องการนำเข้าข้อมูลและผสานข้อมูลออเดอร์จากอุปกรณ์อีกเครื่องหนึ่งเข้ามาแสดงผลร่วมกับเครื่องนี้ใช่หรือไม่?")) {
                                                            const V = [...JSON.parse(localStorage.getItem(getUserKey("forex_dashboard_local_trades")) || "[]")];
                                                            D.localTrades.forEach(T => {
                                                                V.some($ => $.id === T.id) || V.push(T)
                                                            });
                                                            const L = JSON.parse(localStorage.getItem(getUserKey("forex_dashboard_deleted_trade_ids")) || "[]"),
                                                                W = [...new Set([...L, ...D.deletedIds || []])];
                                                            localStorage.setItem(getUserKey("forex_dashboard_local_trades"), JSON.stringify(V)), localStorage.setItem(getUserKey("forex_dashboard_deleted_trade_ids"), JSON.stringify(W)), loadAllData(), alert("นำเข้าและผสานข้อมูลสำเร็จแล้ว!")
                                                        }
                                                    } else alert("รหัสข้อมูลไม่ถูกต้องหรือรูปแบบไม่ตรงตามที่กำหนด")
                                                } catch {
                                                    alert("ไม่สามารถนำเข้าข้อมูลได้: รหัสข้อมูลผิดพลาดหรือรูปแบบไม่ถูกต้อง")
                                                }
                                            },
                                            className: "btn-primary",
                                            style: {
                                                width: "auto",
                                                padding: "10px 16px",
                                                fontSize: "12px",
                                                height: "auto",
                                                background: "transparent",
                                                border: "1px solid var(--border-color)",
                                                color: "var(--text-primary)"
                                            },
                                            children: "📥 นำเข้าข้อมูลมายังเครื่องนี้ (วางรหัส)"
                                        })]
                                    })]
                                }), _jsxs("div", {
                                    style: {
                                        display: "flex",
                                        gap: "12px",
                                        marginTop: "10px",
                                        flexWrap: "wrap"
                                    },
                                    children: [_jsxs("button", {
                                        type: "button",
                                        onClick: () => {
                                            CONFIG.setAppsScriptUrl(appsScriptUrl), loadAllData(), alert("บันทึกการตั้งค่าลงเบราว์เซอร์เรียบร้อยแล้วและกำลังรีเฟรชข้อมูล!")
                                        },
                                        className: "btn-primary",
                                        style: {
                                            width: "auto",
                                            padding: "12px 24px"
                                        },
                                        children: [_jsx(CheckCircle2, {
                                            size: 18
                                        }), _jsx("span", {
                                            children: "บันทึกการตั้งค่า"
                                        })]
                                    }), _jsxs("button", {
                                        type: "button",
                                        onClick: () => {
                                            setIsDemoMode(!isDemoMode)
                                        },
                                        className: "btn-primary",
                                        style: {
                                            width: "auto",
                                            padding: "12px 24px",
                                            background: "transparent",
                                            border: "1px solid var(--border-color)",
                                            color: isDemoMode ? "var(--color-success)" : "var(--text-primary)"
                                        },
                                        children: [_jsx(RefreshCw, {
                                            size: 18
                                        }), _jsxs("span", {
                                            children: ["สลับไปเป็น ", isDemoMode ? "ดึงชีตจริง" : "โหมด Demo"]
                                        })]
                                    })]
                                })]
                            })]
                        })]
                        })]
                    })]
                })]
            }), showCandleModal && _jsx("div", {
                style: {
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(11, 15, 25, 0.75)",
                    backdropFilter: "blur(6px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1002,
                    padding: "20px"
                },
                children: _jsxs("div", {
                    className: "glass-card",
                    style: {
                        width: "100%",
                        maxWidth: "400px",
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        background: "#131A2E",
                        border: "1px solid var(--border-color)",
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)"
                    },
                    children: [_jsx("h3", {
                        className: "chart-title",
                        style: {
                            fontSize: "16px",
                            marginBottom: "8px",
                            borderBottom: "1px dashed var(--border-color)",
                            paddingBottom: "10px",
                            margin: 0
                        },
                        children: "⚙️ จัดการเหตุผลซัพพอร์ตแท่งเทียน"
                    }), _jsxs("div", {
                        style: {
                            display: "flex",
                            gap: "8px"
                        },
                        children: [_jsx("input", {
                            type: "text",
                            placeholder: "เช่น Pin Bar, Engulfing",
                            className: "calc-input",
                            value: newCandleInput,
                            onChange: b => setNewCandleInput(b.target.value),
                            style: {
                                margin: 0
                            },
                            onKeyDown: b => {
                                b.key === "Enter" && (b.preventDefault(), handleAddCandle())
                            }
                        }), _jsx("button", {
                            type: "button",
                            onClick: handleAddCandle,
                            className: "btn-primary",
                            style: {
                                margin: 0,
                                padding: "0 16px",
                                whiteSpace: "nowrap",
                                height: "42px"
                            },
                            children: "➕ เพิ่ม"
                        })]
                    }), _jsx("div", {
                        style: {
                            maxHeight: "220px",
                            overflowY: "auto",
                            border: "1px solid var(--border-color)",
                            borderRadius: "6px",
                            background: "rgba(0,0,0,0.2)"
                        },
                        children: candleList.map((b, idx) => _jsx("div", {
                            style: {
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "8px 12px",
                                borderBottom: "1px solid rgba(255,255,255,0.05)",
                                minHeight: "42px"
                            },
                            children: editingCandleIndex === idx ? _jsxs("div", {
                                style: { display: "flex", gap: "6px", width: "100%", alignItems: "center" },
                                children: [
                                    _jsx("input", {
                                        type: "text",
                                        value: editingCandleText,
                                        onChange: e => setEditingCandleText(e.target.value),
                                        onKeyDown: e => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleSaveEditCandle(idx, b);
                                            } else if (e.key === "Escape") {
                                                handleCancelEditCandle();
                                            }
                                        },
                                        autoFocus: true,
                                        style: {
                                            flex: 1,
                                            background: "rgba(0, 0, 0, 0.4)",
                                            border: "1px solid #3b82f6",
                                            borderRadius: "6px",
                                            padding: "6px 10px",
                                            color: "#fff",
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            outline: "none"
                                        }
                                    }),
                                    _jsx("button", {
                                        type: "button",
                                        onClick: () => handleSaveEditCandle(idx, b),
                                        style: {
                                            background: "linear-gradient(135deg, #10b981, #059669)",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "6px",
                                            padding: "6px 10px",
                                            fontSize: "11.5px",
                                            fontWeight: "700",
                                            cursor: "pointer",
                                            whiteSpace: "nowrap"
                                        },
                                        children: "💾 บันทึก"
                                    }),
                                    _jsx("button", {
                                        type: "button",
                                        onClick: handleCancelEditCandle,
                                        style: {
                                            background: "rgba(255, 255, 255, 0.1)",
                                            color: "var(--text-secondary)",
                                            border: "none",
                                            borderRadius: "6px",
                                            padding: "6px 8px",
                                            fontSize: "11.5px",
                                            cursor: "pointer",
                                            whiteSpace: "nowrap"
                                        },
                                        children: "❌"
                                    })
                                ]
                            }) : _jsxs("div", {
                                style: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" },
                                children: [
                                    _jsx("span", {
                                        style: {
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            color: "#fff"
                                        },
                                        children: b
                                    }),
                                    _jsxs("div", {
                                        style: { display: "flex", gap: "6px" },
                                        children: [
                                            _jsx("button", {
                                                type: "button",
                                                onClick: () => handleStartEditCandle(idx, b),
                                                style: {
                                                    background: "rgba(59, 130, 246, 0.15)",
                                                    color: "#60a5fa",
                                                    border: "1px solid rgba(59, 130, 246, 0.3)",
                                                    borderRadius: "4px",
                                                    padding: "4px 8px",
                                                    fontSize: "11px",
                                                    fontWeight: "600",
                                                    cursor: "pointer"
                                                },
                                                children: "✏️ แก้ไข"
                                            }),
                                            _jsx("button", {
                                                type: "button",
                                                onClick: () => handleRemoveCandle(b),
                                                style: {
                                                    background: "rgba(239, 68, 68, 0.15)",
                                                    color: "#EF4444",
                                                    border: "1px solid rgba(239, 68, 68, 0.3)",
                                                    borderRadius: "4px",
                                                    padding: "4px 8px",
                                                    fontSize: "11px",
                                                    fontWeight: "600",
                                                    cursor: "pointer"
                                                },
                                                children: "🗑️ ลบ"
                                            })
                                        ]
                                    })
                                ]
                            })
                        }, idx))
                    }), _jsx("div", {
                        style: {
                            display: "flex",
                            justifyContent: "flex-end",
                            marginTop: "8px"
                        },
                        children: _jsx("button", {
                            type: "button",
                            onClick: () => setShowCandleModal(!1),
                            style: {
                                padding: "8px 16px",
                                background: "rgba(255,255,255,0.05)",
                                border: "none",
                                borderRadius: "8px",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                fontSize: "13px"
                            },
                            children: "ปิดหน้าต่าง"
                        })
                    })]
                })
            }), showIndicatorModal && _jsx("div", {
                style: {
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(11, 15, 25, 0.75)",
                    backdropFilter: "blur(6px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1003,
                    padding: "20px"
                },
                children: _jsxs("div", {
                    className: "glass-card",
                    style: {
                        width: "100%",
                        maxWidth: "400px",
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        background: "#131A2E",
                        border: "1px solid var(--border-color)",
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)"
                    },
                    children: [_jsx("h3", {
                        className: "chart-title",
                        style: {
                            fontSize: "16px",
                            marginBottom: "8px",
                            borderBottom: "1px dashed var(--border-color)",
                            paddingBottom: "10px",
                            margin: 0
                        },
                        children: "⚙️ จัดการเหตุผลซัพพอร์ต Indicator"
                    }), _jsxs("div", {
                        style: {
                            display: "flex",
                            gap: "8px"
                        },
                        children: [_jsx("input", {
                            type: "text",
                            placeholder: "เช่น RSI Divergence",
                            className: "calc-input",
                            value: $isLoggedIn,
                            onChange: b => setNewIndicatorInput(b.target.value),
                            style: {
                                margin: 0
                            },
                            onKeyDown: b => {
                                b.key === "Enter" && (b.preventDefault(), handleAddIndicator())
                            }
                        }), _jsx("button", {
                            type: "button",
                            onClick: handleAddIndicator,
                            className: "btn-primary",
                            style: {
                                margin: 0,
                                padding: "0 16px",
                                whiteSpace: "nowrap",
                                height: "42px"
                            },
                            children: "➕ เพิ่ม"
                        })]
                    }), _jsx("div", {
                        style: {
                            maxHeight: "220px",
                            overflowY: "auto",
                            border: "1px solid var(--border-color)",
                            borderRadius: "6px",
                            background: "rgba(0,0,0,0.2)"
                        },
                        children: indicatorList.map((b, idx) => _jsx("div", {
                            style: {
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "8px 12px",
                                borderBottom: "1px solid rgba(255,255,255,0.05)",
                                minHeight: "42px"
                            },
                            children: editingIndicatorIndex === idx ? _jsxs("div", {
                                style: { display: "flex", gap: "6px", width: "100%", alignItems: "center" },
                                children: [
                                    _jsx("input", {
                                        type: "text",
                                        value: editingIndicatorText,
                                        onChange: e => setEditingIndicatorText(e.target.value),
                                        onKeyDown: e => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleSaveEditIndicator(idx, b);
                                            } else if (e.key === "Escape") {
                                                handleCancelEditIndicator();
                                            }
                                        },
                                        autoFocus: true,
                                        style: {
                                            flex: 1,
                                            background: "rgba(0, 0, 0, 0.4)",
                                            border: "1px solid #3b82f6",
                                            borderRadius: "6px",
                                            padding: "6px 10px",
                                            color: "#fff",
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            outline: "none"
                                        }
                                    }),
                                    _jsx("button", {
                                        type: "button",
                                        onClick: () => handleSaveEditIndicator(idx, b),
                                        style: {
                                            background: "linear-gradient(135deg, #10b981, #059669)",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "6px",
                                            padding: "6px 10px",
                                            fontSize: "11.5px",
                                            fontWeight: "700",
                                            cursor: "pointer",
                                            whiteSpace: "nowrap"
                                        },
                                        children: "💾 บันทึก"
                                    }),
                                    _jsx("button", {
                                        type: "button",
                                        onClick: handleCancelEditIndicator,
                                        style: {
                                            background: "rgba(255, 255, 255, 0.1)",
                                            color: "var(--text-secondary)",
                                            border: "none",
                                            borderRadius: "6px",
                                            padding: "6px 8px",
                                            fontSize: "11.5px",
                                            cursor: "pointer",
                                            whiteSpace: "nowrap"
                                        },
                                        children: "❌"
                                    })
                                ]
                            }) : _jsxs("div", {
                                style: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" },
                                children: [
                                    _jsx("span", {
                                        style: {
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            color: "#fff"
                                        },
                                        children: b
                                    }),
                                    _jsxs("div", {
                                        style: { display: "flex", gap: "6px" },
                                        children: [
                                            _jsx("button", {
                                                type: "button",
                                                onClick: () => handleStartEditIndicator(idx, b),
                                                style: {
                                                    background: "rgba(59, 130, 246, 0.15)",
                                                    color: "#60a5fa",
                                                    border: "1px solid rgba(59, 130, 246, 0.3)",
                                                    borderRadius: "4px",
                                                    padding: "4px 8px",
                                                    fontSize: "11px",
                                                    fontWeight: "600",
                                                    cursor: "pointer"
                                                },
                                                children: "✏️ แก้ไข"
                                            }),
                                            _jsx("button", {
                                                type: "button",
                                                onClick: () => handleRemoveIndicator(b),
                                                style: {
                                                    background: "rgba(239, 68, 68, 0.15)",
                                                    color: "#EF4444",
                                                    border: "1px solid rgba(239, 68, 68, 0.3)",
                                                    borderRadius: "4px",
                                                    padding: "4px 8px",
                                                    fontSize: "11px",
                                                    fontWeight: "600",
                                                    cursor: "pointer"
                                                },
                                                children: "🗑️ ลบ"
                                            })
                                        ]
                                    })
                                ]
                            })
                        }, idx))
                    }), _jsx("div", {
                        style: {
                            display: "flex",
                            justifyContent: "flex-end",
                            marginTop: "8px"
                        },
                        children: _jsx("button", {
                            type: "button",
                            onClick: () => setShowIndicatorModal(!1),
                            style: {
                                padding: "8px 16px",
                                background: "rgba(255,255,255,0.05)",
                                border: "none",
                                borderRadius: "8px",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                fontSize: "13px"
                            },
                            children: "ปิดหน้าต่าง"
                        })
                    })]
                })
            }), reasonPickerModal && (() => {
                const isCandle = reasonPickerModal.type === "candle";
                const target = reasonPickerModal.target;
                const allItems = isCandle ? candleList : indicatorList;
                let selectedItems = [];
                if (target === "newTrade") {
                    selectedItems = isCandle ? (newTrade.candleReasons || []) : (newTrade.indicatorReasons || []);
                } else if (target === "editTrade") {
                    selectedItems = isCandle ? (editTrade.candleReasons || []) : (editTrade.indicatorReasons || []);
                } else if (target === "closedTrade") {
                    selectedItems = isCandle ? (selectedClosedTrade?.candleReasons || []) : (selectedClosedTrade?.indicatorReasons || []);
                }

                const handleSelectAll = (items) => {
                    const toAdd = items || allItems;
                    if (target === "newTrade") {
                        setNewTrade(prev => ({ ...prev, [isCandle ? "candleReasons" : "indicatorReasons"]: Array.from(new Set([...(prev[isCandle ? "candleReasons" : "indicatorReasons"] || []), ...toAdd])) }));
                    } else if (target === "editTrade") {
                        setEditTrade(prev => ({ ...prev, [isCandle ? "candleReasons" : "indicatorReasons"]: Array.from(new Set([...(prev[isCandle ? "candleReasons" : "indicatorReasons"] || []), ...toAdd])) }));
                    } else if (target === "closedTrade") {
                        setSelectedClosedTrade(prev => ({ ...prev, [isCandle ? "candleReasons" : "indicatorReasons"]: Array.from(new Set([...(prev[isCandle ? "candleReasons" : "indicatorReasons"] || []), ...toAdd])) }));
                    }
                };

                const handleClearAll = () => {
                    if (target === "newTrade") {
                        setNewTrade(prev => ({ ...prev, [isCandle ? "candleReasons" : "indicatorReasons"]: [] }));
                    } else if (target === "editTrade") {
                        setEditTrade(prev => ({ ...prev, [isCandle ? "candleReasons" : "indicatorReasons"]: [] }));
                    } else if (target === "closedTrade") {
                        setSelectedClosedTrade(prev => ({ ...prev, [isCandle ? "candleReasons" : "indicatorReasons"]: [] }));
                    }
                };

                const handleToggleItem = (it) => {
                    const cur = selectedItems || [];
                    const updated = cur.includes(it) ? cur.filter(x => x !== it) : [...cur, it];
                    if (target === "newTrade") {
                        setNewTrade(prev => ({ ...prev, [isCandle ? "candleReasons" : "indicatorReasons"]: updated }));
                    } else if (target === "editTrade") {
                        setEditTrade(prev => ({ ...prev, [isCandle ? "candleReasons" : "indicatorReasons"]: updated }));
                    } else if (target === "closedTrade") {
                        setSelectedClosedTrade(prev => ({ ...prev, [isCandle ? "candleReasons" : "indicatorReasons"]: updated }));
                    }
                };

                const handleOpenManager = () => {
                    setReasonPickerModal(null);
                    if (isCandle) setShowCandleModal(!0);
                    else setShowIndicatorModal(!0);
                };

                const handleCloudSync = async () => {
                    try {
                        const uname = currentUser?.username || "pattarawin";
                        const res = await fetch(`/api/trades?username=${encodeURIComponent(uname)}`);
                        if (res.ok) {
                            const dt = await res.json();
                            if (isCandle && dt.candleReasons) {
                                const s = new Set([...candleList, ...dt.candleReasons]);
                                const arr = Array.from(s);
                                setCandleList(arr);
                                alert(`☁️ ซิงก์ข้อมูล Cloud สำเร็จ! มีเหตุผลแท่งเทียนทั้งหมด ${arr.length} รายการ`);
                                return;
                            } else if (!isCandle && dt.indicatorReasons) {
                                const s = new Set([...indicatorList, ...dt.indicatorReasons]);
                                const arr = Array.from(s);
                                setIndicatorList(arr);
                                alert(`☁️ ซิงก์ข้อมูล Cloud สำเร็จ! มีเหตุผล Indicator ทั้งหมด ${arr.length} รายการ`);
                                return;
                            }
                        }
                    } catch(e) {}
                    alert(`☁️ ข้อมูลซิงก์เรียบร้อยแล้ว (${allItems.length} รายการ)`);
                };

                return $reasonPicker({
                    isOpen: true,
                    onClose: () => setReasonPickerModal(null),
                    title: (target === "editTrade" ? "แก้ไข" : "เลือก") + (isCandle ? "เหตุผลซัพพอร์ตแท่งเทียน" : "เหตุผลซัพพอร์ต Indicator"),
                    icon: isCandle ? "🕯️" : "📊",
                    isCandle: isCandle,
                    allItems: allItems,
                    selectedItems: selectedItems,
                    onSelectAll: handleSelectAll,
                    onClearAll: handleClearAll,
                    onToggleItem: handleToggleItem,
                    onOpenManager: handleOpenManager,
                    onCloudSync: handleCloudSync,
                    searchVal: isCandle ? qSearch : qIndSearch,
                    setSearchVal: isCandle ? setQSearch : setQIndSearch,
                    catVal: isCandle ? qCat : qIndCat,
                    setCatVal: isCandle ? setQCat : setQIndCat,
                    accentColor: isCandle ? "#3b82f6" : "#10b981"
                });
            })(), showAssetModal && _jsx("div", {
                style: {
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(11, 15, 25, 0.75)",
                    backdropFilter: "blur(6px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1001,
                    padding: "20px"
                },
                children: _jsxs("div", {
                    className: "glass-card",
                    style: {
                        width: "100%",
                        maxWidth: "400px",
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        background: "#131A2E",
                        border: "1px solid var(--border-color)",
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)"
                    },
                    children: [_jsx("h3", {
                        className: "chart-title",
                        style: {
                            fontSize: "16px",
                            marginBottom: "8px",
                            borderBottom: "1px dashed var(--border-color)",
                            paddingBottom: "10px",
                            margin: 0
                        },
                        children: "⚙️ จัดการคู่เงิน / หุ้นสะสม"
                    }), _jsxs("div", {
                        style: {
                            display: "flex",
                            gap: "8px"
                        },
                        children: [_jsx("input", {
                            type: "text",
                            placeholder: "เช่น BTCUSD, AAPL",
                            className: "calc-input",
                            value: newAssetInput,
                            onChange: b => setNewAssetInput(b.target.value),
                            style: {
                                margin: 0,
                                textTransform: "uppercase"
                            },
                            onKeyDown: b => {
                                b.key === "Enter" && (b.preventDefault(), handleAddAsset())
                            }
                        }), _jsx("button", {
                            type: "button",
                            onClick: handleAddAsset,
                            className: "btn-primary",
                            style: {
                                margin: 0,
                                padding: "0 16px",
                                whiteSpace: "nowrap",
                                height: "42px"
                            },
                            children: "➕ เพิ่ม"
                        })]
                    }), _jsx("div", {
                        style: {
                            maxHeight: "220px",
                            overflowY: "auto",
                            border: "1px solid var(--border-color)",
                            borderRadius: "6px",
                            background: "rgba(0,0,0,0.2)"
                        },
                        children: assetList.map(b => _jsxs("div", {
                            style: {
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "8px 12px",
                                borderBottom: "1px solid rgba(255,255,255,0.05)"
                            },
                            children: [_jsx("span", {
                                style: {
                                    fontSize: "13px",
                                    fontWeight: "bold",
                                    color: "#fff"
                                },
                                children: b
                            }), _jsx("button", {
                                type: "button",
                                onClick: () => handleRemoveAsset(b),
                                style: {
                                    background: "rgba(239, 68, 68, 0.15)",
                                    color: "#EF4444",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "4px 8px",
                                    fontSize: "11px",
                                    cursor: "pointer"
                                },
                                children: "🗑️ ลบ"
                            })]
                        }, b))
                    }), _jsx("div", {
                        style: {
                            display: "flex",
                            justifyContent: "flex-end",
                            marginTop: "8px"
                        },
                        children: _jsx("button", {
                            type: "button",
                            onClick: () => setShowAssetModal(!1),
                            style: {
                                padding: "8px 16px",
                                background: "rgba(255,255,255,0.05)",
                                border: "none",
                                borderRadius: "8px",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                fontSize: "13px"
                            },
                            children: "ปิดหน้าต่าง"
                        })
                    })]
                })
            }), showEntryTypeModal && _jsx("div", {
                style: {
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(11, 15, 25, 0.75)",
                    backdropFilter: "blur(6px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1001,
                    padding: "20px"
                },
                children: _jsxs("div", {
                    className: "glass-card",
                    style: {
                        width: "100%",
                        maxWidth: "400px",
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        background: "#131A2E",
                        border: "1px solid var(--border-color)",
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)"
                    },
                    children: [_jsx("h3", {
                        className: "chart-title",
                        style: {
                            fontSize: "16px",
                            marginBottom: "8px",
                            borderBottom: "1px dashed var(--border-color)",
                            paddingBottom: "10px",
                            margin: 0
                        },
                        children: "⚙️ จัดการประเภทการเข้า"
                    }), _jsxs("div", {
                        style: {
                            display: "flex",
                            gap: "8px"
                        },
                        children: [_jsx("input", {
                            type: "text",
                            placeholder: "เช่น Buy, Sell, Buy Limit",
                            className: "calc-input",
                            value: newEntryTypeInput,
                            onChange: b => setNewEntryTypeInput(b.target.value),
                            style: {
                                margin: 0
                            },
                            onKeyDown: b => {
                                b.key === "Enter" && (b.preventDefault(), handleAddEntryType())
                            }
                        }), _jsx("button", {
                            type: "button",
                            onClick: handleAddEntryType,
                            className: "btn-primary",
                            style: {
                                margin: 0,
                                padding: "0 16px",
                                whiteSpace: "nowrap",
                                height: "42px"
                            },
                            children: "➕ เพิ่ม"
                        })]
                    }), _jsx("div", {
                        style: {
                            maxHeight: "220px",
                            overflowY: "auto",
                            border: "1px solid var(--border-color)",
                            borderRadius: "6px",
                            background: "rgba(0,0,0,0.2)"
                        },
                        children: entryTypeList.map(b => _jsxs("div", {
                            style: {
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "8px 12px",
                                borderBottom: "1px solid rgba(255,255,255,0.05)"
                            },
                            children: [_jsx("span", {
                                style: {
                                    fontSize: "13px",
                                    fontWeight: "bold",
                                    color: "#fff"
                                },
                                children: b
                            }), _jsxs("div", {
                                style: {
                                    display: "flex",
                                    gap: "6px"
                                },
                                children: [_jsx("button", {
                                    type: "button",
                                    onClick: () => handleEditEntryType(b),
                                    style: {
                                        background: "rgba(59, 130, 246, 0.15)",
                                        color: "#3B82F6",
                                        border: "none",
                                        borderRadius: "4px",
                                        padding: "4px 8px",
                                        fontSize: "11px",
                                        cursor: "pointer"
                                    },
                                    children: "✏️ แก้ไข"
                                }), _jsx("button", {
                                    type: "button",
                                    onClick: () => handleRemoveEntryType(b),
                                    style: {
                                        background: "rgba(239, 68, 68, 0.15)",
                                        color: "#EF4444",
                                        border: "none",
                                        borderRadius: "4px",
                                        padding: "4px 8px",
                                        fontSize: "11px",
                                        cursor: "pointer"
                                    },
                                    children: "🗑️ ลบ"
                                })]
                            })]
                        }, b))
                    }), _jsx("div", {
                        style: {
                            display: "flex",
                            justifyContent: "flex-end",
                            marginTop: "8px"
                        },
                        children: _jsx("button", {
                            type: "button",
                            onClick: () => setShowEntryTypeModal(!1),
                            style: {
                                padding: "8px 16px",
                                background: "rgba(255,255,255,0.05)",
                                border: "none",
                                borderRadius: "8px",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                fontSize: "13px"
                            },
                            children: "ปิดหน้าต่าง"
                        })
                    })]
                })
            }), selectedActiveTrade && _jsx("div", {
                style: {
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(11, 15, 25, 0.75)",
                    backdropFilter: "blur(6px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1010,
                    padding: "20px"
                },
                children: _jsxs("div", {
                    className: "glass-card",
                    style: {
                        width: "100%",
                        maxWidth: "450px",
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        background: "#131A2E",
                        border: "1px solid var(--border-color)",
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)"
                    },
                    children: [_jsx("h3", {
                        className: "chart-title",
                        style: {
                            fontSize: "16px",
                            marginBottom: "8px",
                            borderBottom: "1px dashed var(--border-color)",
                            paddingBottom: "10px",
                            margin: 0
                        },
                        children: "🎯 ปิดออเดอร์เพื่อย้ายเข้าประวัติการเทรด"
                    }), _jsxs("div", {
                        style: {
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px"
                        },
                        children: [_jsxs("div", {
                            style: {
                                display: "flex",
                                gap: "10px"
                            },
                            children: [activeMarketType === "forex" && _jsxs("div", {
                                style: {
                                    flex: 1.2
                                },
                                children: [_jsx("label", {
                                    className: "form-label",
                                    style: {
                                        fontSize: "11px",
                                        marginBottom: "4px"
                                    },
                                    children: "วิธีการปิดไม้"
                                }), _jsxs("select", {
                                    className: "calc-select",
                                    value: closeDetails.closeMethod,
                                    onChange: b => setCloseDetails({
                                        ...closeDetails,
                                        closeMethod: b.target.value
                                    }),
                                    children: [_jsx("option", {
                                        value: "plan",
                                        children: "ตามแผน (TP/SL)"
                                    }), _jsx("option", {
                                        value: "manual",
                                        children: "ปิดก่อน / กำหนดเอง"
                                    })]
                                })]
                            }), _jsxs("div", {
                                style: {
                                    flex: 1
                                },
                                children: [_jsx("label", {
                                    className: "form-label",
                                    style: {
                                        fontSize: "11px",
                                        marginBottom: "4px"
                                    },
                                    children: "ผลลัพธ์"
                                }), _jsxs("select", {
                                    className: "calc-select",
                                    value: closeDetails.outcome,
                                    onChange: b => setCloseDetails({
                                        ...closeDetails,
                                        outcome: b.target.value
                                    }),
                                    children: [_jsx("option", {
                                        value: "Win",
                                        children: "Win (กำไร)"
                                    }), _jsx("option", {
                                        value: "Loss",
                                        children: "Loss (ขาดทุน)"
                                    }), _jsx("option", {
                                        value: "SL หน้าทุน",
                                        children: "SL หน้าทุน (BE)"
                                    })]
                                })]
                            })]
                        }), _jsxs("div", {
                            style: {
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "10px"
                            },
                            children: [_jsxs("div", {
                                children: [_jsx("label", {
                                    className: "form-label",
                                    style: {
                                        fontSize: "11px",
                                        marginBottom: "4px"
                                    },
                                    children: activeMarketType === "forex" ? "ขนาด Lot (ล็อตที่เทรด)" : "จำนวนหุ้นที่ซื้อ"
                                }), _jsx("input", {
                                    type: "number",
                                    step: activeMarketType === "forex" ? "0.01" : "1",
                                    placeholder: activeMarketType === "forex" ? "เช่น 0.01 หรือ 0.1" : "เช่น 100",
                                    className: "calc-input",
                                    value: closeDetails.lotSize,
                                    onChange: nb,
                                    required: !0
                                })]
                            }), _jsxs("div", {
                                children: [_jsx("label", {
                                    className: "form-label",
                                    style: {
                                        fontSize: "11px",
                                        marginBottom: "4px"
                                    },
                                    children: activeMarketType === "forex" ? "กำไร/ขาดทุน (USD)" : (activeMarketType === "thai_stock" ? "กำไร/ขาดทุน (บาท)" : "กำไร/ขาดทุน (USD)")
                                }), _jsx("input", {
                                    type: "number",
                                    step: "any",
                                    placeholder: "เช่น 15.20",
                                    className: "calc-input",
                                    value: activeMarketType === "forex" ? closeDetails.profitUSD : (() => {
                                        if (!closeDetails.closePrice) return "";
                                        const entry = parseFloat(selectedActiveTrade?.["ราคาที่เข้า"] || 0);
                                        const close = parseFloat(closeDetails.closePrice);
                                        const qty = parseFloat(closeDetails.lotSize || 0);
                                        const taxPercent = parseFloat(closeDetails.withholdingTax || 0);
                                        const gross = (close - entry) * qty;
                                        const tax = gross > 0 ? gross * (taxPercent / 100) : 0;
                                        const profit = gross - tax;
                                        return isNaN(profit) ? "" : profit.toFixed(2);
                                    })(),
                                    onChange: ib,
                                    readOnly: activeMarketType !== "forex",
                                    style: activeMarketType !== "forex" ? {
                                        background: "rgba(255, 255, 255, 0.05)",
                                        cursor: "not-allowed",
                                        opacity: 0.8
                                    } : {},
                                    required: !0
                                })]
                            })]
                        }), _jsxs("div", {
                            style: {
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "10px"
                            },
                            children: [_jsxs("div", {
                                children: [_jsx("label", {
                                    className: "form-label",
                                    style: {
                                        fontSize: "11px",
                                        marginBottom: "4px"
                                    },
                                    children: "ราคาที่ปิด (Close Price)"
                                }), _jsx("input", {
                                    type: "number",
                                    step: "any",
                                    placeholder: "ป้อนราคาปิด",
                                    className: "calc-input",
                                    value: closeDetails.closePrice,
                                    onChange: eb,
                                    disabled: activeMarketType === "forex" && closeDetails.closeMethod === "plan",
                                    style: {
                                        opacity: activeMarketType === "forex" && closeDetails.closeMethod === "plan" ? .6 : 1
                                    },
                                    required: !0
                                })]
                            }), activeMarketType === "forex" ? _jsxs("div", {
                                children: [_jsx("label", {
                                    className: "form-label",
                                    style: {
                                        fontSize: "11px",
                                        marginBottom: "4px"
                                    },
                                    children: "กำไร/ขาดทุน (จุด)"
                                }), _jsx("input", {
                                    type: "number",
                                    placeholder: "ป้อนระยะจุด",
                                    className: "calc-input",
                                    value: closeDetails.pips,
                                    onChange: sb,
                                    disabled: closeDetails.closeMethod === "plan",
                                    style: {
                                        opacity: closeDetails.closeMethod === "plan" ? .6 : 1
                                    },
                                    required: !0
                                })]
                            }) : _jsxs("div", {
                                children: [_jsx("label", {
                                    className: "form-label",
                                    style: {
                                        fontSize: "11px",
                                        marginBottom: "4px"
                                    },
                                    children: "ภาษี ณ ที่จ่าย (%)"
                                }), _jsx("input", {
                                    type: "number",
                                    step: "any",
                                    placeholder: "เช่น 7",
                                    className: "calc-input",
                                    value: closeDetails.withholdingTax || "7",
                                    onChange: T => setCloseDetails({
                                        ...closeDetails,
                                        withholdingTax: T.target.value
                                    })
                                })]
                            })]
                        }), _jsxs("div", {
                            children: [_jsx("label", {
                                className: "form-label",
                                style: {
                                    fontSize: "11px",
                                    marginBottom: "4px"
                                },
                                children: "หมายเหตุปิดออเดอร์"
                            }), _jsx("input", {
                                type: "text",
                                placeholder: "เช่น ชน TP ตามแผน",
                                className: "calc-input",
                                value: closeDetails.remarks,
                                onChange: b => setCloseDetails({
                                    ...closeDetails,
                                    remarks: b.target.value
                                })
                            })]
                        })]
                    }), _jsxs("div", {
                        style: {
                            display: "flex",
                            gap: "10px",
                            justifyContent: "flex-end",
                            marginTop: "8px"
                        },
                        children: [_jsx("button", {
                            onClick: () => setSelectedActiveTrade(null),
                            style: {
                                padding: "8px 16px",
                                background: "rgba(255,255,255,0.05)",
                                border: "none",
                                borderRadius: "8px",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                fontSize: "13px"
                            },
                            children: "ยกเลิก"
                        }), _jsx("button", {
                            onClick: () => tb(selectedActiveTrade),
                            style: {
                                padding: "8px 20px",
                                background: "var(--color-success)",
                                border: "none",
                                borderRadius: "8px",
                                color: "#fff",
                                fontWeight: "bold",
                                cursor: "pointer",
                                fontSize: "13px"
                            },
                            children: "💾 ย้ายเข้าประวัติการเทรด"
                        })]
                    })]
                })
            }), editingActiveTradeId && _jsx("div", {
                style: {
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(11, 15, 25, 0.75)",
                    backdropFilter: "blur(6px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1011,
                    padding: "20px"
                },
                children: _jsxs("div", {
                    className: "glass-card",
                    style: {
                        width: "100%",
                        maxWidth: "560px",
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        background: "#131A2E",
                        border: "1px solid var(--border-color)",
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)",
                        maxHeight: "90vh",
                        overflowY: "auto"
                    },
                    children: [_jsx("h3", {
                        className: "chart-title",
                        style: {
                            fontSize: "16px",
                            marginBottom: "8px",
                            borderBottom: "1px dashed var(--border-color)",
                            paddingBottom: "10px",
                            margin: 0
                        },
                        children: "✏️ แก้ไขออเดอร์ที่กำลังถืออยู่"
                    }), _jsxs("div", {
                        style: {
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "12px"
                        },
                        children: [_jsxs("div", {
                            children: [_jsx("label", {
                                className: "form-label",
                                style: {
                                    fontSize: "11px",
                                    marginBottom: "4px"
                                },
                                children: "วันที่เปิด"
                            }), _jsx("input", {
                                type: "date",
                                className: "calc-input",
                                value: editTrade.date,
                                onChange: b => setEditTrade({
                                    ...editTrade,
                                    date: b.target.value
                                })
                            })]
                        }), _jsxs("div", {
                            children: [_jsx("label", {
                                className: "form-label",
                                style: {
                                    fontSize: "11px",
                                    marginBottom: "4px"
                                },
                                children: "เวลาที่เปิด"
                            }), _jsx("input", {
                                type: "time",
                                className: "calc-input",
                                value: editTrade.time,
                                onChange: b => setEditTrade({
                                    ...editTrade,
                                    time: b.target.value
                                })
                            })]
                        }), _jsxs("div", {
                            children: [_jsx("label", {
                                className: "form-label",
                                style: {
                                    fontSize: "11px",
                                    marginBottom: "4px"
                                },
                                children: "คู่เงิน / หุ้น"
                            }), _jsx("select", {
                                className: "calc-select",
                                value: editTrade.pair,
                                onChange: b => setEditTrade({
                                    ...editTrade,
                                    pair: b.target.value
                                }),
                                children: assetList.map(b => _jsx("option", {
                                    value: b,
                                    children: b
                                }, b))
                            })]
                        }), _jsxs("div", {
                            children: [_jsx("label", {
                                className: "form-label",
                                style: {
                                    fontSize: "11px",
                                    marginBottom: "4px"
                                },
                                children: "ประเภทการเข้า"
                            }), _jsxs("select", {
                                className: "calc-select",
                                value: editTrade.type,
                                onChange: b => setEditTrade({
                                    ...editTrade,
                                    type: b.target.value
                                }),
                                children: [_jsx("option", {
                                    value: "Buy",
                                    children: "BUY"
                                }), _jsx("option", {
                                    value: "Sell",
                                    children: "SELL"
                                }), _jsx("option", {
                                    value: "Buy Limit",
                                    children: "BUY LIMIT"
                                }), _jsx("option", {
                                    value: "Sell Limit",
                                    children: "SELL LIMIT"
                                })]
                            })]
                        }), _jsxs("div", {
                            children: [_jsx("label", {
                                className: "form-label",
                                style: {
                                    fontSize: "11px",
                                    marginBottom: "4px"
                                },
                                children: "ราคาที่เข้า"
                            }), _jsx("input", {
                                type: "number",
                                step: "any",
                                className: "calc-input",
                                value: editTrade.entryPrice,
                                onChange: b => setEditTrade({
                                    ...editTrade,
                                    entryPrice: b.target.value
                                })
                            })]
                        }), _jsxs("div", {
                            children: [_jsx("label", {
                                className: "form-label",
                                style: {
                                    fontSize: "11px",
                                    marginBottom: "4px"
                                },
                                children: "บันทึกอารมณ์"
                            }), _jsx("input", {
                                type: "text",
                                className: "calc-input",
                                value: editTrade.feelings,
                                onChange: b => setEditTrade({
                                    ...editTrade,
                                    feelings: b.target.value
                                })
                            })]
                        }), _jsxs("div", {
                            style: {
                                gridColumn: "span 2"
                            },
                            children: [_jsx("label", {
                                className: "form-label",
                                style: {
                                    fontSize: "11px",
                                    marginBottom: "4px"
                                },
                                children: "เป้าหมาย TP (ราคา หรือ จุด)"
                            }), _jsxs("div", {
                                style: {
                                    display: "flex",
                                    gap: "6px"
                                },
                                children: [_jsx("input", {
                                    type: "number",
                                    step: "any",
                                    className: "calc-input",
                                    placeholder: "ราคา TP",
                                    value: editTrade.tpPrice,
                                    onChange: b => {
                                        const D = b.target.value,
                                            z = parseFloat(editTrade.entryPrice),
                                            V = parseFloat(D);
                                        let L = editTrade.tpPoints;
                                        if (!isNaN(z) && !isNaN(V) && z > 0 && V > 0) {
                                            const W = getPairMultiplier(editTrade.pair);
                                            L = String(Math.round(Math.abs(V - z) * W))
                                        }
                                        setEditTrade({
                                            ...editTrade,
                                            tpPrice: D,
                                            tpPoints: L
                                        })
                                    },
                                    style: {
                                        margin: 0,
                                        flex: 1,
                                        minWidth: "0"
                                    }
                                }), _jsx("input", {
                                    type: "number",
                                    className: "calc-input",
                                    placeholder: "จำนวนจุด",
                                    value: editTrade.tpPoints,
                                    onChange: b => setEditTrade({
                                        ...editTrade,
                                        tpPoints: b.target.value
                                    }),
                                    style: {
                                        margin: 0,
                                        flex: 1,
                                        minWidth: "0"
                                    }
                                }), _jsx("span", {
                                    style: {
                                        display: "flex",
                                        alignItems: "center",
                                        fontSize: "11px",
                                        color: "var(--text-muted)",
                                        whiteSpace: "nowrap"
                                    },
                                    children: "จุด"
                                })]
                            })]
                        }), _jsxs("div", {
                            style: {
                                gridColumn: "span 2"
                            },
                            children: [_jsx("label", {
                                className: "form-label",
                                style: {
                                    fontSize: "11px",
                                    marginBottom: "4px"
                                },
                                children: "ตัดขาดทุน SL (ราคา หรือ จุด)"
                            }), _jsxs("div", {
                                style: {
                                    display: "flex",
                                    gap: "6px"
                                },
                                children: [_jsx("input", {
                                    type: "number",
                                    step: "any",
                                    className: "calc-input",
                                    placeholder: "ราคา SL",
                                    value: editTrade.slPrice,
                                    onChange: b => {
                                        const D = b.target.value,
                                            z = parseFloat(editTrade.entryPrice),
                                            V = parseFloat(D);
                                        let L = editTrade.slPoints;
                                        if (!isNaN(z) && !isNaN(V) && z > 0 && V > 0) {
                                            const W = getPairMultiplier(editTrade.pair);
                                            L = String(Math.round(Math.abs(V - z) * W))
                                        }
                                        setEditTrade({
                                            ...editTrade,
                                            slPrice: D,
                                            slPoints: L
                                        })
                                    },
                                    style: {
                                        margin: 0,
                                        flex: 1,
                                        minWidth: "0"
                                    }
                                }), _jsx("input", {
                                    type: "number",
                                    className: "calc-input",
                                    placeholder: "จำนวนจุด",
                                    value: editTrade.slPoints,
                                    onChange: b => setEditTrade({
                                        ...editTrade,
                                        slPoints: b.target.value
                                    }),
                                    style: {
                                        margin: 0,
                                        flex: 1,
                                        minWidth: "0"
                                    }
                                }), _jsx("span", {
                                    style: {
                                        display: "flex",
                                        alignItems: "center",
                                        fontSize: "11px",
                                        color: "var(--text-muted)",
                                        whiteSpace: "nowrap"
                                    },
                                    children: "จุด"
                                })]
                            })]
                        }), _jsxs("div", {
                            style: {
                                gridColumn: "span 2"
                            },
                            children: [_jsxs("div", {
                                style: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "4px"
                                },
                                children: [_jsx("label", {
                                    className: "form-label",
                                    style: {
                                        fontSize: "11px",
                                        margin: 0
                                    },
                                    children: "เหตุผลซัพพอร์ตแท่งเทียน (เลือกได้หลายข้อ)"
                                }), _jsx("button", {
                                    type: "button",
                                    onClick: () => setShowCandleModal(!0),
                                    style: {
                                        background: "transparent",
                                        border: "none",
                                        color: "var(--text-muted)",
                                        cursor: "pointer",
                                        fontSize: "11px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "2px"
                                    },
                                    title: "จัดการเหตุผลแท่งเทียน",
                                    children: "⚙️ ตั้งค่า"
                                })]
                            }), _jsxs("div", {
                                style: {
                                    position: "relative"
                                },
                                children: [_jsxs("button", {
                                    type: "button",
                                    className: "calc-select",
                                    style: {
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        width: "100%",
                                        height: "42px",
                                        padding: "8px 12px",
                                        background: (editTrade.candleReasons && editTrade.candleReasons.length > 0) ? "rgba(59, 130, 246, 0.08)" : "rgba(255,255,255,0.03)",
                                        border: `1px solid ${editTrade.candleReasons && editTrade.candleReasons.length > 0 ? "rgba(96, 165, 250, 0.5)" : "var(--border-color)"}`,
                                        borderRadius: "8px",
                                        color: (editTrade.candleReasons && editTrade.candleReasons.length > 0) ? "#60A5FA" : "var(--text-secondary)",
                                        textAlign: "left",
                                        cursor: "pointer",
                                        margin: 0
                                    },
                                    onClick: () => setReasonPickerModal({ target: 'editTrade', type: 'candle' }),
                                    children: [_jsx("span", {
                                        style: {
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            maxWidth: "90%",
                                            fontWeight: (editTrade.candleReasons && editTrade.candleReasons.length > 0) ? "600" : "normal"
                                        },
                                        children: editTrade.candleReasons && editTrade.candleReasons.length > 0 ? `✅ เลือกแล้ว ${editTrade.candleReasons.length} รายการ (${editTrade.candleReasons.join(", ")})` : "คลิกเพื่อเลือกเหตุผลแท่งเทียน..."
                                    }), _jsx("span", {
                                        style: {
                                            fontSize: "12px",
                                            color: "#60A5FA"
                                        },
                                        children: "⊞"
                                    })]
                                })]
                            })]
                        }), _jsxs("div", {
                            style: {
                                gridColumn: "span 2"
                            },
                            children: [_jsxs("div", {
                                style: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "4px"
                                },
                                children: [_jsx("label", {
                                    className: "form-label",
                                    style: {
                                        fontSize: "11px",
                                        margin: 0
                                    },
                                    children: "เหตุผลซัพพอร์ต Indicator (เลือกได้หลายข้อ)"
                                }), _jsx("button", {
                                    type: "button",
                                    onClick: () => setShowIndicatorModal(!0),
                                    style: {
                                        background: "transparent",
                                        border: "none",
                                        color: "var(--text-muted)",
                                        cursor: "pointer",
                                        fontSize: "11px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "2px"
                                    },
                                    title: "จัดการเหตุผล Indicator",
                                    children: "⚙️ ตั้งค่า"
                                })]
                            }), _jsxs("div", {
                                style: {
                                    position: "relative"
                                },
                                children: [_jsxs("button", {
                                    type: "button",
                                    className: "calc-select",
                                    style: {
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        width: "100%",
                                        height: "42px",
                                        padding: "8px 12px",
                                        background: (editTrade.indicatorReasons && editTrade.indicatorReasons.length > 0) ? "rgba(59, 130, 246, 0.08)" : "rgba(255,255,255,0.03)",
                                        border: `1px solid ${editTrade.indicatorReasons && editTrade.indicatorReasons.length > 0 ? "rgba(96, 165, 250, 0.5)" : "var(--border-color)"}`,
                                        borderRadius: "8px",
                                        color: (editTrade.indicatorReasons && editTrade.indicatorReasons.length > 0) ? "#60A5FA" : "var(--text-secondary)",
                                        textAlign: "left",
                                        cursor: "pointer",
                                        margin: 0
                                    },
                                    onClick: () => setReasonPickerModal({ target: 'editTrade', type: 'indicator' }),
                                    children: [_jsx("span", {
                                        style: {
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            maxWidth: "90%",
                                            fontWeight: (editTrade.indicatorReasons && editTrade.indicatorReasons.length > 0) ? "600" : "normal"
                                        },
                                        children: editTrade.indicatorReasons && editTrade.indicatorReasons.length > 0 ? `✅ เลือกแล้ว ${editTrade.indicatorReasons.length} รายการ (${editTrade.indicatorReasons.join(", ")})` : "คลิกเพื่อเลือกเหตุผล Indicator..."
                                    }), _jsx("span", {
                                        style: {
                                            fontSize: "12px",
                                            color: "#60A5FA"
                                        },
                                        children: "⊞"
                                    })]
                                })]
                            })]
                        })]
                    }), _jsxs("div", {
                        children: [_jsx("label", {
                            className: "form-label",
                            style: {
                                fontSize: "11px",
                                marginBottom: "4px"
                            },
                            children: "บันทึกความเสี่ยงของแผนเทรด"
                        }), _jsx("input", {
                            type: "text",
                            className: "calc-input",
                            value: editTrade.setup,
                            onChange: b => setEditTrade({
                                ...editTrade,
                                setup: b.target.value
                            })
                        })]
                    }), _jsxs("div", {
                        children: [_jsx("label", {
                            className: "form-label",
                            style: {
                                fontSize: "11px",
                                marginBottom: "4px"
                            },
                            children: "หมายเหตุ"
                        }), _jsx("input", {
                            type: "text",
                            className: "calc-input",
                            value: editTrade.remarks,
                            onChange: b => setEditTrade({
                                ...editTrade,
                                remarks: b.target.value
                            })
                        })]
                    }), _jsxs("div", {
                        style: {
                            display: "flex",
                            gap: "10px",
                            justifyContent: "flex-end",
                            marginTop: "8px"
                        },
                        children: [_jsx("button", {
                            onClick: () => setEditingActiveTradeId(null),
                            style: {
                                padding: "8px 16px",
                                background: "rgba(255,255,255,0.05)",
                                border: "none",
                                borderRadius: "8px",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                fontSize: "13px"
                            },
                            children: "ยกเลิก"
                        }), _jsx("button", {
                            onClick: () => saveActiveEdit(editingActiveTradeId),
                            style: {
                                padding: "8px 20px",
                                background: "var(--color-primary)",
                                border: "none",
                                borderRadius: "8px",
                                color: "#fff",
                                fontWeight: "bold",
                                cursor: "pointer",
                                fontSize: "13px"
                            },
                            children: "💾 บันทึกแก้ไข"
                        })]
                    })]
                })
            }), selectedClosedTrade && _jsx("div", {
                style: {
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(11, 15, 25, 0.8)",
                    backdropFilter: "blur(8px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1e3,
                    padding: "20px"
                },
                children: _jsxs("div", {
                    className: "glass-card",
                    style: {
                        width: "100%",
                        maxWidth: "700px",
                        padding: "28px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        background: "#0E1424",
                        border: "1px solid rgba(99,102,241,0.25)",
                        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.7)",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        borderRadius: "16px"
                    },
                    children: [_jsxs("div", {
                        style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            paddingBottom: "16px",
                            borderBottom: "1px solid rgba(255,255,255,0.07)"
                        },
                        children: [_jsx("div", {
                            style: {
                                width: "40px",
                                height: "40px",
                                borderRadius: "12px",
                                background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "20px",
                                flexShrink: 0
                            },
                            children: "✏️"
                        }), _jsxs("div", {
                            children: [_jsx("h3", {
                                style: {
                                    margin: 0,
                                    fontSize: "16px",
                                    fontWeight: 700,
                                    color: "var(--text-primary)"
                                },
                                children: "แก้ไขข้อมูลออเดอร์ประวัติการเทรด"
                            }), _jsx("authError", {
                                style: {
                                    margin: 0,
                                    fontSize: "12px",
                                    color: "var(--text-muted)",
                                    marginTop: "2px"
                                },
                                children: "แก้ไขรายละเอียดออเดอร์ที่ปิดแล้ว"
                            })]
                        })]
                    }), _jsxs("div", {
                        children: [_jsx("authError", {
                            style: {
                                margin: "0 0 10px 0",
                                fontSize: "11px",
                                fontWeight: 600,
                                color: "var(--text-muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em"
                            },
                            children: "📅 วันที่ & สินทรัพย์"
                        }), _jsxs("div", {
                            style: {
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                                gap: "10px"
                            },
                            children: [_jsxs("div", {
                                children: [_jsx("label", {
                                    className: "form-label",
                                    style: {
                                        fontSize: "11px",
                                        marginBottom: "4px"
                                    },
                                    children: "วันที่เปิด"
                                }), _jsx("input", {
                                    type: "date",
                                    className: "calc-input",
                                    value: selectedClosedTrade.dateField,
                                    onChange: b => setSelectedClosedTrade({
                                        ...selectedClosedTrade,
                                        dateField: b.target.value
                                    })
                                })]
                            }), _jsxs("div", {
                                children: [_jsx("label", {
                                    className: "form-label",
                                    style: {
                                        fontSize: "11px",
                                        marginBottom: "4px"
                                    },
                                    children: "เวลาที่เปิด"
                                }), _jsx("input", {
                                    type: "time",
                                    className: "calc-input",
                                    value: selectedClosedTrade.timeField,
                                    onChange: b => setSelectedClosedTrade({
                                        ...selectedClosedTrade,
                                        timeField: b.target.value
                                    })
                                })]
                            }), _jsxs("div", {
                                children: [_jsx("label", {
                                    className: "form-label",
                                    style: {
                                        fontSize: "11px",
                                        marginBottom: "4px"
                                    },
                                    children: "คู่เงิน / หุ้น"
                                }), _jsx("input", {
                                    type: "text",
                                    className: "calc-input",
                                    value: selectedClosedTrade["คู่เงิน"],
                                    onChange: b => setSelectedClosedTrade({
                                        ...selectedClosedTrade,
                                        "คู่เงิน": b.target.value
                                    })
                                })]
                            }), _jsxs("div", {
                                children: [_jsx("label", {
                                    className: "form-label",
                                    style: {
                                        fontSize: "11px",
                                        marginBottom: "4px"
                                    },
                                    children: "ประเภท"
                                }), _jsxs("select", {
                                    className: "calc-select",
                                    value: selectedClosedTrade["ประเภทการเข้า"],
                                    onChange: b => setSelectedClosedTrade({
                                        ...selectedClosedTrade,
                                        "ประเภทการเข้า": b.target.value
                                    }),
                                    children: [_jsx("option", {
                                        value: "Buy",
                                        children: "Buy"
                                    }), _jsx("option", {
                                        value: "Sell",
                                        children: "Sell"
                                    }), _jsx("option", {
                                        value: "Buy Limit",
                                        children: "Buy Limit"
                                    }), _jsx("option", {
                                        value: "Sell Limit",
                                        children: "Sell Limit"
                                    })]
                                })]
                            })]
                        })]
                    }), _jsxs("div", {
                        children: [_jsx("authError", {
                            style: {
                                margin: "0 0 10px 0",
                                fontSize: "11px",
                                fontWeight: 600,
                                color: "var(--text-muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em"
                            },
                            children: "📊 ผลการเทรด"
                        }), _jsxs("div", {
                            style: {
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                                gap: "10px",
                                marginBottom: "10px"
                            },
                            children: [_jsxs("div", {
                                children: [_jsx("label", {
                                    className: "form-label",
                                    style: {
                                        fontSize: "11px",
                                        marginBottom: "4px"
                                    },
                                    children: "ราคาที่เข้า"
                                }), _jsx("input", {
                                    type: "number",
                                    step: "any",
                                    className: "calc-input",
                                    value: selectedClosedTrade["ราคาที่เข้า"],
                                    onChange: b => setSelectedClosedTrade({
                                        ...selectedClosedTrade,
                                        "ราคาที่เข้า": b.target.value
                                    })
                                })]
                            }), _jsxs("div", {
                                children: [_jsx("label", {
                                    className: "form-label",
                                    style: {
                                        fontSize: "11px",
                                        marginBottom: "4px"
                                    },
                                    children: "ความเสี่ยง (%)"
                                }), _jsx("input", {
                                    type: "text",
                                    className: "calc-input",
                                    value: selectedClosedTrade["ความเสี่ยง"],
                                    onChange: b => setSelectedClosedTrade({
                                        ...selectedClosedTrade,
                                        "ความเสี่ยง": b.target.value
                                    })
                                })]
                            }), _jsxs("div", {
                                children: [_jsx("label", {
                                    className: "form-label",
                                    style: {
                                        fontSize: "11px",
                                        marginBottom: "4px"
                                    },
                                    children: "ผลลัพธ์ (จุด)"
                                }), _jsx("input", {
                                    type: "number",
                                    className: "calc-input",
                                    value: selectedClosedTrade.pipsField,
                                    onChange: b => setSelectedClosedTrade({
                                        ...selectedClosedTrade,
                                        pipsField: b.target.value
                                    })
                                })]
                            }), _jsxs("div", {
                                children: [_jsx("label", {
                                    className: "form-label",
                                    style: {
                                        fontSize: "11px",
                                        marginBottom: "4px"
                                    },
                                    children: "กำไร ($)"
                                }), _jsx("input", {
                                    type: "number",
                                    step: "any",
                                    className: "calc-input",
                                    value: selectedClosedTrade.profitField,
                                    onChange: b => setSelectedClosedTrade({
                                        ...selectedClosedTrade,
                                        profitField: b.target.value
                                    })
                                })]
                            })]
                        }), _jsxs("div", {
                            children: [_jsx("label", {
                                className: "form-label",
                                style: {
                                    fontSize: "11px",
                                    marginBottom: "4px"
                                },
                                children: "ผลลัพธ์"
                            }), _jsxs("select", {
                                className: "calc-select",
                                value: selectedClosedTrade["ผลลัพธ์"],
                                onChange: b => setSelectedClosedTrade({
                                    ...selectedClosedTrade,
                                    "ผลลัพธ์": b.target.value
                                }),
                                children: [_jsx("option", {
                                    value: "Win",
                                    children: "✅ Win (ชนะ)"
                                }), _jsx("option", {
                                    value: "Loss",
                                    children: "❌ Loss (แพ้)"
                                }), _jsx("option", {
                                    value: "SL หน้าทุน",
                                    children: "⚖️ SL หน้าทุน"
                                })]
                            })]
                        })]
                    }), _jsxs("div", {
                        children: [_jsx("authError", {
                            style: {
                                margin: "0 0 10px 0",
                                fontSize: "11px",
                                fontWeight: 600,
                                color: "var(--text-muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em"
                            },
                            children: "🧠 เหตุผลการเข้าเทรด"
                        }), _jsxs("div", {
                            style: {
                                marginBottom: "10px"
                            },
                            children: [_jsxs("div", {
                                style: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "6px"
                                },
                                children: [_jsx("label", {
                                    className: "form-label",
                                    style: {
                                        fontSize: "11px",
                                        margin: 0
                                    },
                                    children: "🕯️ เหตุผลซัพพอร์ตแท่งเทียน"
                                }), _jsx("button", {
                                    type: "button",
                                    onClick: () => setShowCandleModal(!0),
                                    style: {
                                        background: "rgba(96,165,250,0.1)",
                                        border: "1px solid rgba(96,165,250,0.3)",
                                        color: "#93c5fd",
                                        cursor: "pointer",
                                        fontSize: "11px",
                                        padding: "3px 8px",
                                        borderRadius: "6px"
                                    },
                                    children: "⚙️ จัดการ"
                                })]
                            }), _jsx("div", {
                                children: _jsxs("button", {
                                    type: "button",
                                    onClick: () => setReasonPickerModal({ target: "closedTrade", type: "candle" }),
                                    style: {
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        width: "100%",
                                        minHeight: "40px",
                                        padding: "8px 14px",
                                        background: selectedClosedTrade.candleReasons && selectedClosedTrade.candleReasons.length > 0 ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.03)",
                                        border: `1px solid ${selectedClosedTrade.candleReasons && selectedClosedTrade.candleReasons.length > 0 ? "rgba(96,165,250,0.5)" : "var(--border-color)"}`,
                                        borderRadius: "8px",
                                        color: selectedClosedTrade.candleReasons && selectedClosedTrade.candleReasons.length > 0 ? "#60A5FA" : "var(--text-secondary)",
                                        textAlign: "left",
                                        cursor: "pointer",
                                        boxSizing: "border-box",
                                        fontSize: "12px"
                                    },
                                    children: [_jsx("span", {
                                        style: {
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            flex: 1,
                                            fontWeight: selectedClosedTrade.candleReasons && selectedClosedTrade.candleReasons.length > 0 ? "600" : "normal"
                                        },
                                        children: selectedClosedTrade.candleReasons && selectedClosedTrade.candleReasons.length > 0 ? `✅ เลือกแล้ว ${selectedClosedTrade.candleReasons.length} รายการ — ${selectedClosedTrade.candleReasons.join(", ")}` : "คลิกเพื่อเลือกเหตุผลแท่งเทียน (เปิดหน้าต่างเลือก)..."
                                    }), _jsx("span", {
                                        style: {
                                            fontSize: "12px",
                                            color: "#60A5FA"
                                        },
                                        children: "⊞"
                                    })]
                                })
                            })]
                        }), _jsxs("div", {
                            children: [_jsxs("div", {
                                style: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "6px"
                                },
                                children: [_jsx("label", {
                                    className: "form-label",
                                    style: {
                                        fontSize: "11px",
                                        margin: 0
                                    },
                                    children: "📈 เหตุผลซัพพอร์ต Indicator"
                                }), _jsx("button", {
                                    type: "button",
                                    onClick: () => setShowIndicatorModal(!0),
                                    style: {
                                        background: "rgba(52,211,153,0.1)",
                                        border: "1px solid rgba(52,211,153,0.3)",
                                        color: "#6ee7b7",
                                        cursor: "pointer",
                                        fontSize: "11px",
                                        padding: "3px 8px",
                                        borderRadius: "6px"
                                    },
                                    children: "⚙️ จัดการ"
                                })]
                            }), _jsx("div", {
                                children: _jsxs("button", {
                                    type: "button",
                                    onClick: () => setReasonPickerModal({ target: "closedTrade", type: "indicator" }),
                                    style: {
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        width: "100%",
                                        minHeight: "40px",
                                        padding: "8px 14px",
                                        background: selectedClosedTrade.indicatorReasons && selectedClosedTrade.indicatorReasons.length > 0 ? "rgba(52,211,153,0.08)" : "rgba(255,255,255,0.03)",
                                        border: `1px solid ${selectedClosedTrade.indicatorReasons && selectedClosedTrade.indicatorReasons.length > 0 ? "rgba(52,211,153,0.5)" : "var(--border-color)"}`,
                                        borderRadius: "8px",
                                        color: selectedClosedTrade.indicatorReasons && selectedClosedTrade.indicatorReasons.length > 0 ? "#34D399" : "var(--text-secondary)",
                                        textAlign: "left",
                                        cursor: "pointer",
                                        boxSizing: "border-box",
                                        fontSize: "12px"
                                    },
                                    children: [_jsx("span", {
                                        style: {
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            flex: 1,
                                            fontWeight: selectedClosedTrade.indicatorReasons && selectedClosedTrade.indicatorReasons.length > 0 ? "600" : "normal"
                                        },
                                        children: selectedClosedTrade.indicatorReasons && selectedClosedTrade.indicatorReasons.length > 0 ? `✅ เลือกแล้ว ${selectedClosedTrade.indicatorReasons.length} รายการ — ${selectedClosedTrade.indicatorReasons.join(", ")}` : "คลิกเพื่อเลือกเหตุผล Indicator (เปิดหน้าต่างเลือก)..."
                                    }), _jsx("span", {
                                        style: {
                                            fontSize: "12px",
                                            color: "#34D399"
                                        },
                                        children: "⊞"
                                    })]
                                })
                            })]
                        })]
                    }), _jsxs("div", {
                        children: [_jsx("authError", {
                            style: {
                                margin: "0 0 10px 0",
                                fontSize: "11px",
                                fontWeight: 600,
                                color: "var(--text-muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em"
                            },
                            children: "📝 บันทึก"
                        }), _jsxs("div", {
                            style: {
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "12px"
                            },
                            children: [_jsxs("div", {
                                children: [_jsx("label", {
                                    className: "form-label",
                                    style: {
                                        fontSize: "11px",
                                        marginBottom: "4px"
                                    },
                                    children: "😌 บันทึกอารมณ์"
                                }), _jsx("input", {
                                    type: "text",
                                    className: "calc-input",
                                    placeholder: "อารมณ์ขณะเทรด...",
                                    value: selectedClosedTrade["บันทึกความรู้สึก"] || "",
                                    onChange: b => setSelectedClosedTrade({
                                        ...selectedClosedTrade,
                                        "บันทึกความรู้สึก": b.target.value
                                    })
                                })]
                            }), _jsxs("div", {
                                children: [_jsx("label", {
                                    className: "form-label",
                                    style: {
                                        fontSize: "11px",
                                        marginBottom: "4px"
                                    },
                                    children: "📋 หมายเหตุ"
                                }), _jsx("input", {
                                    type: "text",
                                    className: "calc-input",
                                    placeholder: "หมายเหตุเพิ่มเติม...",
                                    value: selectedClosedTrade["หมายเหตุ"] || "",
                                    onChange: b => setSelectedClosedTrade({
                                        ...selectedClosedTrade,
                                        "หมายเหตุ": b.target.value
                                    })
                                })]
                            })]
                        })]
                    }), _jsxs("div", {
                        style: {
                            display: "flex",
                            gap: "10px",
                            justifyContent: "flex-end",
                            paddingTop: "8px",
                            borderTop: "1px solid rgba(255,255,255,0.06)"
                        },
                        children: [_jsx("button", {
                            type: "button",
                            onClick: () => {
                                const trId = selectedClosedTrade.uniqueId || selectedClosedTrade.id;
                                setSelectedClosedTrade(null);
                                reopenTrade(trId);
                            },
                            style: {
                                padding: "10px 16px",
                                background: "rgba(56,189,248,0.15)",
                                border: "1px solid rgba(56,189,248,0.4)",
                                borderRadius: "10px",
                                color: "#38bdf8",
                                fontWeight: "bold",
                                cursor: "pointer",
                                fontSize: "13px",
                                marginRight: "auto"
                            },
                            children: "↩️ ย้ายกลับไปออเดอร์ที่กำลังถืออยู่"
                        }), _jsx("button", {
                            onClick: () => setSelectedClosedTrade(null),
                            style: {
                                padding: "10px 22px",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "10px",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                fontSize: "13px"
                            },
                            children: "ยกเลิก"
                        }), _jsx("button", {
                            onClick: saveClosedEdit,
                            style: {
                                padding: "10px 28px",
                                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                border: "none",
                                borderRadius: "10px",
                                color: "#fff",
                                fontWeight: "bold",
                                cursor: "pointer",
                                fontSize: "13px",
                                boxShadow: "0 4px 15px rgba(99,102,241,0.4)"
                            },
                            children: "💾 บันทึกการแก้ไข"
                        })]
                    })]
                })
            })
        ]}) : _jsx("div", {
            className: "login-screen",
            children: _jsxs("div", {
                className: "login-card glass-card",
                children: [_jsxs("div", {
                    className: "brand-header",
                    children: [_jsx("img", {
                        src: logoSvg,
                        alt: "OniCorn Logo",
                        style: {
                            width: "68px",
                            height: "68px",
                            marginBottom: "12px",
                            filter: "drop-shadow(0 0 12px rgba(59, 130, 246, 0.4))"
                        }
                    }), _jsx("h1", {
                        className: "brand-name",
                        children: "OniCorn Trading"
                    }), _jsx("authError", {
                        className: "brand-tagline",
                        children: "วิเคราะห์เหตุผลการเข้าเทรด & จดบันทึกการเทรดพร้อมสรุปผล"
                    })]
                }), authError && _jsxs("div", {
                    className: "alert-error",
                    children: [_jsx(AlertTriangle, {
                        size: 18
                    }), _jsx("span", {
                        children: authError
                    })]
                }), _jsxs("form", {
                    onSubmit: handleLogin,
                    children: [_jsxs("div", {
                        className: "form-group",
                        children: [_jsx("label", {
                            className: "form-label",
                            children: "ชื่อผู้ใช้งาน (Username)"
                        }), _jsxs("div", {
                            className: "input-wrapper",
                            children: [_jsx(User, {
                                className: "input-icon",
                                size: 18
                            }), _jsx("input", {
                                type: "text",
                                className: "form-input",
                                placeholder: "ระบุชื่อบัญชีใน Google Sheets",
                                value: usernameInput,
                                onChange: b => setUsernameInput(b.target.value),
                                required: !0
                            })]
                        })]
                    }), _jsxs("div", {
                        className: "form-group",
                        children: [_jsx("label", {
                            className: "form-label",
                            children: "รหัสผ่าน (Password)"
                        }), _jsxs("div", {
                            className: "input-wrapper",
                            children: [_jsx(Lock, {
                                className: "input-icon",
                                size: 18
                            }), _jsx("input", {
                                type: "password",
                                className: "form-input",
                                placeholder: "ระบุรหัสผ่านของคุณ",
                                value: passwordInput,
                                onChange: b => setPasswordInput(b.target.value),
                                required: !0
                            })]
                        })]
                    }), _jsxs("div", {
                        style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            margin: "-4px 0 12px"
                        },
                        children: [_jsx("input", {
                            type: "checkbox",
                            id: "rememberMe",
                            checked: rememberMe,
                            onChange: b => setRememberMe(b.target.checked),
                            style: {
                                width: "16px",
                                height: "16px",
                                accentColor: "var(--color-primary)",
                                cursor: "pointer",
                                flexShrink: 0
                            }
                        }), _jsx("label", {
                            htmlFor: "rememberMe",
                            style: {
                                color: "var(--text-secondary)",
                                fontSize: "14px",
                                cursor: "pointer",
                                userSelect: "none"
                            },
                            children: "จดจำรหัสผ่านในเครื่องนี้"
                        })]
                    }), _jsx("button", {
                        type: "submit",
                        className: "btn-primary",
                        disabled: authLoading,
                        children: authLoading ? _jsxs(_Fragment, {
                            children: [_jsx(RefreshCw, {
                                className: "spinner",
                                size: 18
                            }), _jsx("span", {
                                children: "กำลังตรวจสอบสิทธิ์..."
                            })]
                        }) : _jsxs(_Fragment, {
                            children: [_jsx(Lock, {
                                size: 18
                            }), _jsx("span", {
                                children: "ลงชื่อเข้าใช้งาน"
                            })]
                        })
                    }), _jsxs("div", {
                        style: {
                            marginTop: "24px"
                        },
                        children: [_jsx("authError", {
                            style: {
                                color: "var(--text-muted)",
                                fontSize: "14px",
                                marginBottom: "12px"
                            },
                            children: "หรือทดลองใช้งานโดยไม่ใช้ระบบเซิร์ฟเวอร์"
                        }), _jsxs("button", {
                            type: "button",
                            onClick: handleDemoLogin,
                            className: "btn-primary",
                            style: {
                                background: "transparent",
                                border: "1px solid var(--border-color)",
                                color: "var(--text-primary)"
                            },
                            children: [_jsx(Activity, {
                                size: 18
                            }), _jsx("span", {
                                children: "เข้าใช้งานโหมดสาธิต (Demo Mode)"
                            })]
                        })]
                    })]
                })]
            })
        })
    })

}
