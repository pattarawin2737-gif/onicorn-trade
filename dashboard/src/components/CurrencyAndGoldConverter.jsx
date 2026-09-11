import React, { useState, useEffect } from "react";
import { ArrowRightLeft, DollarSign, Calculator, RefreshCw, X, Sparkles, TrendingUp, Info } from "lucide-react";

export default function CurrencyAndGoldConverter({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("currency"); // currency, gold, oil
  const [rates, setRates] = useState({
    USDTHB: 32.96,
    EURTHB: 38.35,
    GBPTHB: 44.75,
    JPYTHB: 0.2064,
    SGDTHB: 25.92,
    XAUUSD: 4465.00,
    BRENT: 78.40
  });
  const [loading, setLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("");

  // Tab 1: Currency Converter States
  const [curFrom, setCurFrom] = useState("USD");
  const [curTo, setCurTo] = useState("THB");
  const [amount, setAmount] = useState("100");

  // Tab 2: Gold Arbitrage Calculator States
  const [goldSpotInput, setGoldSpotInput] = useState("4465.00");
  const [goldUsdThbInput, setGoldUsdThbInput] = useState("32.96");
  const [goldPremiumInput, setGoldPremiumInput] = useState("150");

  // Tab 3: Oil Estimate Calculator States
  const [oilBrentInput, setOilBrentInput] = useState("78.40");
  const [oilUsdThbInput, setOilUsdThbInput] = useState("32.96");

  // Fetch live rates
  const fetchLiveRates = async () => {
    try {
      setLoading(true);
      const [batchRes, goldRes, fxRes] = await Promise.all([
        fetch("/api/price?symbol=USDTHB=X,EURTHB=X,GBPTHB=X,JPYTHB=X,SGDTHB=X,BZ=F"),
        fetch("/api/price?symbol=XAUUSD"),
        fetch("/api/price?symbol=USDTHB")
      ]);

      let liveSpot = 4465.00;
      let liveUsdThb = 32.96;

      if (goldRes.ok) {
        const gData = await goldRes.json();
        if (gData.price && gData.price > 1000) {
          liveSpot = gData.price;
          setGoldSpotInput(String(gData.price.toFixed(2)));
        }
      }

      if (fxRes.ok) {
        const fxData = await fxRes.json();
        if (fxData.price && fxData.price > 20) {
          liveUsdThb = fxData.price;
          setGoldUsdThbInput(String(fxData.price.toFixed(2)));
          setOilUsdThbInput(String(fxData.price.toFixed(2)));
        }
      }

      if (batchRes.ok) {
        const json = await batchRes.json();
        const r = json.results || json || {};
        setRates(prev => {
          const next = { ...prev, XAUUSD: liveSpot, USDTHB: liveUsdThb };
          if (r["USDTHB=X"]?.price) next.USDTHB = r["USDTHB=X"].price;
          if (r["EURTHB=X"]?.price) next.EURTHB = r["EURTHB=X"].price;
          if (r["GBPTHB=X"]?.price) next.GBPTHB = r["GBPTHB=X"].price;
          if (r["JPYTHB=X"]?.price) next.JPYTHB = r["JPYTHB=X"].price;
          if (r["SGDTHB=X"]?.price) next.SGDTHB = r["SGDTHB=X"].price;
          if (r["BZ=F"]?.price) {
            next.BRENT = r["BZ=F"].price;
            setOilBrentInput(String(r["BZ=F"].price.toFixed(2)));
          }
          return next;
        });
      }

      const now = new Date();
      setLastSyncTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")} น.`);
    } catch (e) {
      console.warn("Failed fetching converter rates:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLiveRates();
    }
  }, [isOpen]);

  // Compute Currency Result
  const computeCurrencyExchange = () => {
    const amt = parseFloat(amount) || 0;
    if (amt <= 0) return "0.00";

    // Standard rate table to THB
    const toThbRate = {
      THB: 1.0,
      USD: rates.USDTHB,
      EUR: rates.EURTHB,
      GBP: rates.GBPTHB,
      JPY: rates.JPYTHB,
      SGD: rates.SGDTHB
    };

    const fromRate = toThbRate[curFrom] || 1.0;
    const toRate = toThbRate[curTo] || 1.0;

    // Convert from -> THB -> to
    const inThb = amt * fromRate;
    const result = inThb / toRate;

    return result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: curTo === "JPY" ? 2 : 4 });
  };

  const handleSwapCurrencies = () => {
    const temp = curFrom;
    setCurFrom(curTo);
    setCurTo(temp);
  };

  // Compute Thai Gold from Spot
  // 1 บาททองหนัก = 15.244 กรัม, 1 troy oz = 31.1035 กรัม, ความบริสุทธิ์ทองคำแท่งไทย = 96.5%
  const spotNum = parseFloat(goldSpotInput) || 4465.00;
  const rateNum = parseFloat(goldUsdThbInput) || 32.96;
  const premNum = parseFloat(goldPremiumInput) || 150;

  const baseThaiGoldRaw = (spotNum * rateNum) * (15.244 / 31.1035) * 0.965;
  const thaiGoldSellPrice = Math.round(baseThaiGoldRaw + premNum);
  const thaiGoldBuyPrice = Math.round(baseThaiGoldRaw - premNum);
  const thaiGoldOrnamentalSell = Math.round(thaiGoldSellPrice + 500);
  const pricePerGram = (thaiGoldSellPrice / 15.244).toFixed(2);

  // Compute Oil Estimate
  const brentNum = parseFloat(oilBrentInput) || 78.40;
  const oilRateNum = parseFloat(oilUsdThbInput) || 32.96;
  // 1 Barrel = 158.987 Liters
  const crudePerLiterThb = (brentNum * oilRateNum) / 158.987;
  const estGas95 = (crudePerLiterThb + 20.8).toFixed(2);
  const estDiesel = (crudePerLiterThb * 0.9 + 17.5).toFixed(2);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: 540,
          background: "linear-gradient(180deg, #1e293b, #0f172a)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: 14,
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          padding: "20px 24px",
          color: "#fff",
          position: "relative"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)", padding: 6, borderRadius: 8, color: "#fff" }}>
              <ArrowRightLeft size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                💱 เครื่องคำนวณ & แปลงค่าเงิน/ทอง/น้ำมันแบบสด
              </h3>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {lastSyncTime ? `ซิงค์ราคาตลาดสดล่าสุด: ${lastSyncTime}` : "อ้างอิงอัตราแลกเปลี่ยนและสูตรมาตรฐานสากลแบบ Real-Time"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={fetchLiveRates}
              disabled={loading}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#60a5fa",
                borderRadius: 6,
                padding: "4px 8px",
                cursor: loading ? "wait" : "pointer",
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                gap: 4
              }}
              title="ดึงราคาตลาดสดใหม่"
            >
              <RefreshCw size={12} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
              <span>รีเฟรช</span>
            </button>
            <button
              onClick={onClose}
              style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 6, background: "rgba(0,0,0,0.3)", padding: 4, borderRadius: 8, marginBottom: 16 }}>
          <button
            onClick={() => setActiveTab("currency")}
            style={{
              flex: 1,
              padding: "7px 10px",
              borderRadius: 6,
              border: "none",
              background: activeTab === "currency" ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "transparent",
              color: activeTab === "currency" ? "#fff" : "var(--text-secondary)",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer"
            }}
          >
            💵 แปลงสกุลเงินสด
          </button>
          <button
            onClick={() => setActiveTab("gold")}
            style={{
              flex: 1,
              padding: "7px 10px",
              borderRadius: 6,
              border: "none",
              background: activeTab === "gold" ? "linear-gradient(135deg, #f59e0b, #d97706)" : "transparent",
              color: activeTab === "gold" ? "#fff" : "var(--text-secondary)",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer"
            }}
          >
            🥇 ทองโลก ↔ ทองไทย
          </button>
          <button
            onClick={() => setActiveTab("oil")}
            style={{
              flex: 1,
              padding: "7px 10px",
              borderRadius: 6,
              border: "none",
              background: activeTab === "oil" ? "linear-gradient(135deg, #ef4444, #dc2626)" : "transparent",
              color: activeTab === "oil" ? "#fff" : "var(--text-secondary)",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer"
            }}
          >
            🛢️ Brent ↔ ปั๊มไทย
          </button>
        </div>

        {/* TAB 1: CURRENCY CONVERTER */}
        {activeTab === "currency" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Input row */}
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                จำนวนเงินที่ต้องการแปลง (Amount):
              </label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 700,
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* Currency Selectors */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>จากสกุล:</label>
                <select
                  value={curFrom}
                  onChange={e => setCurFrom(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, color: "#fff", fontSize: 13, fontWeight: 600 }}
                >
                  <option value="USD">🇺🇸 USD (ดอลลาร์สหรัฐฯ)</option>
                  <option value="THB">🇹🇭 THB (บาทไทย)</option>
                  <option value="EUR">🇪🇺 EUR (ยูโร)</option>
                  <option value="GBP">🇬🇧 GBP (ปอนด์อังกฤษ)</option>
                  <option value="JPY">🇯🇵 JPY (เยนญี่ปุ่น)</option>
                  <option value="SGD">🇸🇬 SGD (ดอลลาร์สิงคโปร์)</option>
                </select>
              </div>

              <button
                onClick={handleSwapCurrencies}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#60a5fa",
                  borderRadius: 8,
                  padding: 8,
                  cursor: "pointer",
                  marginTop: 16
                }}
                title="สลับสกุลเงิน"
              >
                <ArrowRightLeft size={16} />
              </button>

              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>ไปยังสกุล:</label>
                <select
                  value={curTo}
                  onChange={e => setCurTo(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, color: "#fff", fontSize: 13, fontWeight: 600 }}
                >
                  <option value="THB">🇹🇭 THB (บาทไทย)</option>
                  <option value="USD">🇺🇸 USD (ดอลลาร์สหรัฐฯ)</option>
                  <option value="EUR">🇪🇺 EUR (ยูโร)</option>
                  <option value="GBP">🇬🇧 GBP (ปอนด์อังกฤษ)</option>
                  <option value="JPY">🇯🇵 JPY (เยนญี่ปุ่น)</option>
                  <option value="SGD">🇸🇬 SGD (ดอลลาร์สิงคโปร์)</option>
                </select>
              </div>
            </div>

            {/* Result Box */}
            <div style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                ผลลัพธ์การแปลง: {amount} {curFrom} =
              </span>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#60a5fa", marginTop: 4 }}>
                {computeCurrencyExchange()} {curTo}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, fontSize: 10.5, color: "var(--text-secondary)", marginTop: 8 }}>
                <span>1 USD = ฿{rates.USDTHB.toFixed(2)}</span> • 
                <span>1 EUR = ฿{rates.EURTHB.toFixed(2)}</span> • 
                <span>1 GBP = ฿{rates.GBPTHB.toFixed(2)}</span> • 
                <span>100 JPY = ฿{(rates.JPYTHB * 100).toFixed(2)}</span> • 
                <span>1 SGD = ฿{rates.SGDTHB.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GOLD ARBITRAGE CALCULATOR */}
        {activeTab === "gold" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>
                  Spot Gold ($/oz):
                </label>
                <input
                  type="number"
                  value={goldSpotInput}
                  onChange={e => setGoldSpotInput(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, color: "#fff", fontSize: 13, fontWeight: 700, boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>
                  อัตรา USD/THB (฿):
                </label>
                <input
                  type="number"
                  value={goldUsdThbInput}
                  onChange={e => setGoldUsdThbInput(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, color: "#fff", fontSize: 13, fontWeight: 700, boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
              <span style={{ color: "var(--text-muted)" }}>
                💡 ปรับตัวเลขด้านบนเพื่อคำนวณราคาจำลองตามต้องการได้ทันที
              </span>
              <button
                type="button"
                onClick={fetchLiveRates}
                disabled={loading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  background: "rgba(245, 158, 11, 0.15)",
                  border: "1px solid rgba(245, 158, 11, 0.4)",
                  color: "#fbbf24",
                  padding: "3px 8px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: loading ? "wait" : "pointer"
                }}
              >
                <RefreshCw size={11} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
                {loading ? "กำลังดึงราคาสด..." : "🔄 ซิงค์ราคา Spot Gold & บาทสด"}
              </button>
            </div>

            {/* Gold Calculation Cards */}
            <div style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, borderBottom: "1px dashed rgba(255,255,255,0.1)", paddingBottom: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>ราคารับซื้อทองคำแท่ง (96.5%):</span>
                <strong style={{ fontSize: 16, color: "#22c55e" }}>฿{thaiGoldBuyPrice.toLocaleString()}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, borderBottom: "1px dashed rgba(255,255,255,0.1)", paddingBottom: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>ราคาขายออกทองคำแท่ง (96.5%):</span>
                <strong style={{ fontSize: 16, color: "#facc15" }}>฿{thaiGoldSellPrice.toLocaleString()}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, borderBottom: "1px dashed rgba(255,255,255,0.1)", paddingBottom: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>ราคาขายออกทองรูปพรรณ (ประมาณการ):</span>
                <strong style={{ fontSize: 15, color: "#fb923c" }}>฿{thaiGoldOrnamentalSell.toLocaleString()}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>เฉลี่ยต่อน้ำหนักกรัม:</span>
                <span style={{ fontSize: 12, color: "#fff" }}>฿{pricePerGram} / กรัม</span>
              </div>
            </div>

            <div style={{ fontSize: 10.5, color: "var(--text-muted)", lineHeight: 1.4 }}>
              📌 <strong>สูตรคำนวณสมาคมค้าทองคำ:</strong> (Spot Gold × USD/THB) × (15.244 / 31.1035) × 96.5% + Premium ฿{premNum}
            </div>
          </div>
        )}

        {/* TAB 3: OIL ESTIMATE CALCULATOR */}
        {activeTab === "oil" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>
                  Brent Crude ($/bbl):
                </label>
                <input
                  type="number"
                  value={oilBrentInput}
                  onChange={e => setOilBrentInput(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, color: "#fff", fontSize: 13, fontWeight: 700, boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>
                  อัตรา USD/THB (฿):
                </label>
                <input
                  type="number"
                  value={oilUsdThbInput}
                  onChange={e => setOilUsdThbInput(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, color: "#fff", fontSize: 13, fontWeight: 700, boxSizing: "border-box" }}
                />
              </div>
            </div>

            {/* Oil Estimate Results */}
            <div style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, borderBottom: "1px dashed rgba(255,255,255,0.1)", paddingBottom: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>ต้นทุนเนื้อน้ำมันดิบนำเข้า:</span>
                <strong style={{ fontSize: 14, color: "#60a5fa" }}>฿{crudePerLiterThb.toFixed(2)} / ลิตร</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, borderBottom: "1px dashed rgba(255,255,255,0.1)", paddingBottom: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>ประมาณการขายปลีก แก๊สโซฮอล์ 95:</span>
                <strong style={{ fontSize: 15, color: "#22c55e" }}>฿{estGas95} / ลิตร</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>ประมาณการขายปลีก ดีเซล B7:</span>
                <strong style={{ fontSize: 14, color: "#facc15" }}>฿{estDiesel} / ลิตร</strong>
              </div>
            </div>

            <div style={{ fontSize: 10.5, color: "var(--text-muted)", lineHeight: 1.4 }}>
              📌 <strong>สูตรคำนวณ:</strong> 1 บาร์เรล = 158.987 ลิตร + ภาษีสรรพสามิต/กองทุนน้ำมัน/ค่าการตลาดเฉลี่ย
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
