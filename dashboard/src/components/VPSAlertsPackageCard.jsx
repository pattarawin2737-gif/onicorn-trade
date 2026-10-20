import React, { useState } from "react";
import { Server, Download, Copy, Check, Terminal, Clock, ShieldCheck, FileText, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

export default function VPSAlertsPackageCard({ currentUser }) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [showCrontabDetails, setShowCrontabDetails] = useState(false);
  const [showFileList, setShowFileList] = useState(false);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const crontabText = `CRON_TZ=Asia/Bangkok

# 1. รอบเช้า 07:45 น. (จันทร์ - ศุกร์): สรุปข่าวทองคำ XAU/USD, หุ้นไทยเด่น, Sector Rotation
45 7 * * 1-5 /bin/bash /root/onicorn-vps-alerts/run_vps_alert.sh morning >> /var/log/onicorn_alerts.log 2>&1

# 2. กราฟสดน้ำมัน WTI 08:00 น. (ทุกวันอังคาร): แคปเจอร์กราฟ TradingView + ราคาน้ำมันขายปลีกไทย
0 8 * * 2 /bin/bash /root/onicorn-vps-alerts/run_vps_alert.sh oil_chart >> /var/log/onicorn_alerts.log 2>&1

# 3. หุ้นทะลุกรอบ & วอลุ่มพุ่ง 14:35 น. (จันทร์ - ศุกร์): ตรวจจับหุ้นเบรกเอาท์ (ไม่ส่งหากไม่มีหุ้นเข้าเกณฑ์)
35 14 * * 1-5 /bin/bash /root/onicorn-vps-alerts/run_vps_alert.sh intraday >> /var/log/onicorn_alerts.log 2>&1

# 4. สรุปตลาดสิ้นวัน 17:20 น. (จันทร์ - ศุกร์): สรุปดัชนี SET และมูลค่าซื้อขายแยกกลุ่มนักลงทุน
20 17 * * 1-5 /bin/bash /root/onicorn-vps-alerts/run_vps_alert.sh market_wrap >> /var/log/onicorn_alerts.log 2>&1`;

  const filesInPackage = [
    { name: "run_vps_alert.sh", desc: "สคริปต์หลักสั่งรันงานแจ้งเตือนแต่ละรอบ (morning, oil_chart, intraday, market_wrap, test, status)", type: "Bash Script" },
    { name: "vps_setup.sh", desc: "สคริปต์ติดตั้งระบบอัตโนมัติ 1-Click (ตั้งเวลาไทย, ติดตั้ง Python, Playwright Chromium)", type: "Installer" },
    { name: "vps_daemon.py", desc: "ทางเลือกเสริมรันเป็น Background Daemon (ผ่าน PM2 / Systemd) โดยไม่ต้องตั้ง Crontab", type: "Python Service" },
    { name: "alert_utils.py", desc: "โมดูลกลางสำหรับ Gatekeeper: ดักจับ Stale Run และป้องกันข้อความซ้ำ (Deduplication) ผ่าน Cloudflare D1", type: "Engine" },
    { name: "send_gold_news.py", desc: "ส่งสรุปข่าวทองคำและผลกระทบต่อ XAU/USD เข้า Telegram", type: "Python Script" },
    { name: "send_thai_stock_alerts.py", desc: "ส่งสรุปหุ้นไทยเด่น, หุ้นทะลุกรอบระหว่างวัน, และสรุปตลาดสิ้นวัน (Market Wrap)", type: "Python Script" },
    { name: "send_oil_chart.py", desc: "จับภาพหน้าจอกราฟสด WTI Crude Oil จาก TradingView ส่งเข้า Telegram", type: "Python Script" },
    { name: "crontab.txt", desc: "ตารางเวลา Crontab สำเร็จรูป พร้อมคัดลอกใส่ crontab -e บน VPS", type: "Config" },
    { name: "requirements.txt", desc: "รายการ Python dependencies (playwright)", type: "Config" },
    { name: "README.md", desc: "คู่มือการติดตั้งและการใช้งานอย่างละเอียดฉบับภาษาไทย", type: "Documentation" }
  ];

  return (
    <div className="glass-card" style={{
      padding: "24px",
      borderRadius: "16px",
      marginBottom: "24px",
      border: "1px solid rgba(59, 130, 246, 0.35)",
      background: "linear-gradient(135deg, rgba(15, 23, 42, 0.75), rgba(30, 41, 59, 0.7))",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 15px rgba(59, 130, 246, 0.15)"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              padding: "8px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 10px rgba(59, 130, 246, 0.3)"
            }}>
              <Server size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "700", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
                ชุดไฟล์ติดตั้งระบบแจ้งเตือนบน VPS (VPS Alert Package)
                <span style={{
                  fontSize: "11px",
                  background: "rgba(239, 68, 68, 0.2)",
                  color: "#f87171",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  fontWeight: "600"
                }}>
                  🔒 เฉพาะ Admin เท่านั้น
                </span>
              </h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "var(--text-muted)" }}>
                ดาวน์โหลดชุดไฟล์สำเร็จรูปนำไปรันบน VPS ส่วนตัวของคุณเพื่อการแจ้งเตือนตรงเวลา 100% พร้อมระบบสำรองและป้องกันข้อความซ้ำ
              </p>
            </div>
          </div>
        </div>

        {/* Big Download Button */}
        <a
          href="/onicorn-vps-alerts.zip"
          download="onicorn-vps-alerts.zip"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "#ffffff",
            padding: "10px 18px",
            borderRadius: "10px",
            fontSize: "13.5px",
            fontWeight: "700",
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.35)",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          <Download size={17} />
          <span>ดาวน์โหลดชุดติดตั้ง VPS (ZIP)</span>
          <span style={{
            fontSize: "11px",
            background: "rgba(0, 0, 0, 0.2)",
            padding: "2px 6px",
            borderRadius: "6px",
            fontWeight: "500"
          }}>
            ~117 KB
          </span>
        </a>
      </div>

      {/* Feature Badges */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: "10px",
        marginBottom: "20px"
      }}>
        <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "10px 12px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Clock size={16} color="#38bdf8" />
          <span style={{ fontSize: "12px", color: "#e2e8f0" }}>ตรงเวลา 100% (0s Delay บน VPS)</span>
        </div>
        <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "10px 12px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
          <ShieldCheck size={16} color="#4ade80" />
          <span style={{ fontSize: "12px", color: "#e2e8f0" }}>GitHub Actions สำรองอัตโนมัติ</span>
        </div>
        <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "10px 12px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Server size={16} color="#a78bfa" />
          <span style={{ fontSize: "12px", color: "#e2e8f0" }}>กันข้อความซ้ำผ่าน Cloudflare D1</span>
        </div>
        <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "10px 12px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertTriangle size={16} color="#fbbf24" />
          <span style={{ fontSize: "12px", color: "#e2e8f0" }}>Stale Guard ป้องกันส่งรอบดึก</span>
        </div>
      </div>

      {/* 3-Step Setup Instructions */}
      <div style={{
        background: "rgba(15, 23, 42, 0.6)",
        border: "1px solid rgba(59, 130, 246, 0.25)",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "16px"
      }}>
        <h4 style={{ margin: "0 0 14px 0", fontSize: "14px", fontWeight: "700", color: "#f8fafc", display: "flex", alignItems: "center", gap: "6px" }}>
          <Terminal size={16} color="#60a5fa" />
          <span>ขั้นตอนติดตั้งบน VPS ผ่าน SSH Terminal (3 ขั้นตอนง่ายๆ)</span>
        </h4>

        {/* Step 1 */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "600", color: "#93c5fd" }}>
              1. โหลดและแตกไฟล์บน VPS (หรืออัปโหลดไฟล์ ZIP ขึ้น VPS):
            </span>
            <button
              onClick={() => copyToClipboard("curl -O https://onicorn-trade.pages.dev/onicorn-vps-alerts.zip && unzip onicorn-vps-alerts.zip && cd onicorn-vps-alerts", "step1")}
              style={{
                background: copiedKey === "step1" ? "#10b981" : "rgba(59, 130, 246, 0.2)",
                border: "1px solid rgba(59, 130, 246, 0.4)",
                borderRadius: "6px",
                padding: "3px 8px",
                fontSize: "11px",
                color: "#ffffff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              {copiedKey === "step1" ? <Check size={12} /> : <Copy size={12} />}
              {copiedKey === "step1" ? "คัดลอกแล้ว!" : "คัดลอกคำสั่ง"}
            </button>
          </div>
          <div style={{
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "8px",
            padding: "8px 12px",
            fontFamily: "monospace",
            fontSize: "12px",
            color: "#38bdf8",
            overflowX: "auto"
          }}>
            curl -O https://onicorn-trade.pages.dev/onicorn-vps-alerts.zip && unzip onicorn-vps-alerts.zip && cd onicorn-vps-alerts
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "600", color: "#93c5fd" }}>
              2. รันคำสั่งติดตั้งระบบอัตโนมัติ (ตั้งเวลาไทย + Python + Playwright):
            </span>
            <button
              onClick={() => copyToClipboard("sudo bash vps_setup.sh", "step2")}
              style={{
                background: copiedKey === "step2" ? "#10b981" : "rgba(59, 130, 246, 0.2)",
                border: "1px solid rgba(59, 130, 246, 0.4)",
                borderRadius: "6px",
                padding: "3px 8px",
                fontSize: "11px",
                color: "#ffffff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              {copiedKey === "step2" ? <Check size={12} /> : <Copy size={12} />}
              {copiedKey === "step2" ? "คัดลอกแล้ว!" : "คัดลอกคำสั่ง"}
            </button>
          </div>
          <div style={{
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "8px",
            padding: "8px 12px",
            fontFamily: "monospace",
            fontSize: "12px",
            color: "#4ade80",
            overflowX: "auto"
          }}>
            sudo bash vps_setup.sh
          </div>
        </div>

        {/* Step 3 */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "600", color: "#93c5fd" }}>
              3. ตั้งเวลาอัตโนมัติใน Crontab (พิมพ์คำสั่ง crontab -e):
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => copyToClipboard(crontabText, "crontab")}
                style={{
                  background: copiedKey === "crontab" ? "#10b981" : "rgba(59, 130, 246, 0.2)",
                  border: "1px solid rgba(59, 130, 246, 0.4)",
                  borderRadius: "6px",
                  padding: "3px 8px",
                  fontSize: "11px",
                  color: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                {copiedKey === "crontab" ? <Check size={12} /> : <Copy size={12} />}
                {copiedKey === "crontab" ? "คัดลอก Crontab แล้ว!" : "คัดลอกตาราง Crontab"}
              </button>
              <button
                onClick={() => setShowCrontabDetails(!showCrontabDetails)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "6px",
                  padding: "3px 8px",
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                {showCrontabDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {showCrontabDetails ? "ซ่อน" : "ดูตารางเวลา"}
              </button>
            </div>
          </div>

          {showCrontabDetails && (
            <div style={{
              background: "rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "8px",
              padding: "10px 12px",
              fontFamily: "monospace",
              fontSize: "11.5px",
              color: "#f1f5f9",
              whiteSpace: "pre-wrap",
              lineHeight: "1.5",
              marginBottom: "10px"
            }}>
              {crontabText}
            </div>
          )}
        </div>
      </div>

      {/* Quick Test Command Box */}
      <div style={{
        background: "rgba(30, 41, 59, 0.4)",
        border: "1px dashed rgba(59, 130, 246, 0.3)",
        borderRadius: "10px",
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "10px",
        marginBottom: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>⚡</span>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#e2e8f0" }}>
              คำสั่งทดสอบการส่งข้อความเข้า Telegram จาก VPS ทันที:
            </div>
            <code style={{ fontSize: "11.5px", color: "#fbbf24", background: "rgba(0, 0, 0, 0.3)", padding: "2px 6px", borderRadius: "4px" }}>
              ./run_vps_alert.sh test
            </code>
          </div>
        </div>
        <button
          onClick={() => copyToClipboard("./run_vps_alert.sh test", "testCmd")}
          style={{
            background: copiedKey === "testCmd" ? "#10b981" : "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "6px",
            padding: "5px 10px",
            fontSize: "11.5px",
            color: "#ffffff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          {copiedKey === "testCmd" ? <Check size={12} /> : <Copy size={12} />}
          {copiedKey === "testCmd" ? "คัดลอกแล้ว" : "คัดลอกคำสั่งทดสอบ"}
        </button>
      </div>

      {/* Collapsible: List of Files inside the Package */}
      <div>
        <button
          onClick={() => setShowFileList(!showFileList)}
          style={{
            background: "none",
            border: "none",
            color: "#60a5fa",
            fontSize: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 0",
            fontWeight: "500"
          }}
        >
          <FileText size={14} />
          <span>{showFileList ? "ซ่อนรายละเอียดไฟล์ในแพ็กเกจ (10 ไฟล์)" : "ดูรายละเอียดไฟล์ทั้งหมดที่บรรจุในไฟล์ ZIP (10 ไฟล์)"}</span>
          {showFileList ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {showFileList && (
          <div style={{
            marginTop: "10px",
            background: "rgba(15, 23, 42, 0.7)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "10px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}>
            {filesInPackage.map((file, idx) => (
              <div key={idx} style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "10px",
                borderBottom: idx < filesInPackage.length - 1 ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
                paddingBottom: idx < filesInPackage.length - 1 ? "8px" : "0"
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <code style={{ fontSize: "12px", color: "#38bdf8", fontWeight: "700" }}>{file.name}</code>
                    <span style={{ fontSize: "10px", background: "rgba(59, 130, 246, 0.15)", color: "#93c5fd", padding: "1px 6px", borderRadius: "4px" }}>
                      {file.type}
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {file.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
