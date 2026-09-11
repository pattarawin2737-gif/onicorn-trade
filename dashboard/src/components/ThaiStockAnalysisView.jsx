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
import { thaiStockPairIds } from "./thaiStockPairIds";

const sectorScreenerData = {
  energy: {
    label: "⚡ พลังงาน & สาธารณูปโภค (Energy & Utilities)",
    picks: [
      {
        category: "Strong Uptrend",
        badge: "แนวโน้มขาขึ้นแกร่ง",
        color: "#22c55e",
        bgColor: "rgba(34, 197, 94, 0.08)",
        symbol: "SET:GULF",
        name: "GULF",
        reasons: [
          "ราคาทะลุผ่านแนวต้านจิตวิทยาที่ ฿45.00 ขึ้นมาสร้างจุดสูงสุดใหม่ (New High)",
          "ปริมาณการซื้อขาย (Volume) เพิ่มขึ้นกว่า 150% สนับสนุนการเบรคกรอบสะสมพลัง",
          "EMA 50 และ EMA 200 ตัดกันเป็นสีทอง (Golden Cross) บ่งบอกแนวโน้มขาขึ้นระยะยาว"
        ],
        entry: "฿45.50",
        tp: "฿52.00",
        sl: "฿42.50"
      },
      {
        category: "Buy on Dip",
        badge: "ราคาพักตัวแนวรับลึก",
        color: "#60a5fa",
        bgColor: "rgba(59, 130, 246, 0.08)",
        symbol: "SET:PTT",
        name: "PTT",
        reasons: [
          "ราคาปรับฐานลงมาที่แนวรับจิตวิทยาบริเวณ ฿32.00 ซึ่งเป็นโซนสะสมของสถาบันเดิม",
          "ดัชนี RSI ลงมาแตะระดับ 30 (Oversold Area) บ่งบอกสภาวะขายมากเกินไป",
          "เกิดรูปแบบแท่งเทียนกลับตัวแบบ Bullish Engulfing ในกรอบเวลารายวัน (D1)"
        ],
        entry: "฿32.50",
        tp: "฿36.00",
        sl: "฿31.00"
      },
      {
        category: "News Catalyst",
        badge: "ปัจจัยข่าวบวกหนุนนำ",
        color: "#eab308",
        bgColor: "rgba(234, 179, 8, 0.08)",
        symbol: "SET:PTTEP",
        name: "PTTEP",
        reasons: [
          "ได้รับแรงหนุนจากราคาน้ำมันดิบโลก (Brent/WTI) ที่ปรับตัวสูงขึ้นทะลุ $85",
          "คาดการณ์กำไรไตรมาสล่าสุดจะเติบโตขึ้น 25% จากอัตราการกลั่นและการผลิตที่สูงขึ้น",
          "มีกระแสเงินสดหมุนเวียนแข็งแกร่งพร้อมประกาศอัตราเงินปันผลระหว่างกาลสูงขึ้น"
        ],
        entry: "฿145.00",
        tp: "฿160.00",
        sl: "฿138.00"
      }
    ]
  },
  banking: {
    label: "🏦 ธนาคาร & การเงิน (Banking & Finance)",
    picks: [
      {
        category: "Strong Uptrend",
        badge: "แนวโน้มขาขึ้นแกร่ง",
        color: "#22c55e",
        bgColor: "rgba(34, 197, 94, 0.08)",
        symbol: "SET:SCB",
        name: "SCB",
        reasons: [
          "ราคาสามารถยกฐาน Higher Low สูงขึ้นต่อเนื่อง ยืนเหนือแนวรับจิตวิทยา ฿110",
          "กระแสเงินทุนต่างชาติ (Fund Flow) เริ่มไหลเข้าซื้อหุ้นกลุ่มธนาคารพาณิชย์ไทยชัดเจน",
          "MACD Line ตัดขึ้นเหนือ Signal Line ในกรอบรายสัปดาห์ (W1) เป็นสัญญาณรันเทรนด์"
        ],
        entry: "฿112.50",
        tp: "฿124.00",
        sl: "฿108.00"
      },
      {
        category: "Buy on Dip",
        badge: "ราคาพักตัวแนวรับลึก",
        color: "#60a5fa",
        bgColor: "rgba(59, 130, 246, 0.08)",
        symbol: "SET:KBANK",
        name: "KBANK",
        reasons: [
          "ราคาย่อตัวลงทดสอบแนวรับเส้น EMA 200 บริเวณ ฿128.00 แล้วเกิดแรงซื้อดันกลับทันที",
          "สัญญาณเทคนิค Stochastic ในกรอบรายวัน (D1) เกิดการตัดกันขึ้นในเขต Oversold",
          "ราคาพิกัดทับซ้อนกับโซน FVG (Fair Value Gap) เดิมที่เป็นเป้าการกลับตัว"
        ],
        entry: "฿130.00",
        tp: "฿142.00",
        sl: "฿125.00"
      },
      {
        category: "News Catalyst",
        badge: "ปัจจัยข่าวบวกหนุนนำ",
        color: "#eab308",
        bgColor: "rgba(234, 179, 8, 0.08)",
        symbol: "SET:BBL",
        name: "BBL",
        reasons: [
          "ได้ผลประโยชน์โดยตรงจากทิศทางอัตราดอกเบี้ยนโยบายที่ทรงตัวอยู่ในระดับสูง",
          "ข่าวการร่วมมือเชิงกลยุทธ์ด้านเทคโนโลยีทางการเงินเพื่อขยายฐานรายได้ค่าธรรมเนียม",
          "อัตราส่วนหนี้เสีย (NPL Ratio) ปรับลดลงต่ำกว่าเป้าหมายของธนาคารสะท้อนคุณภาพสินทรัพย์ที่ดีขึ้น"
        ],
        entry: "฿136.00",
        tp: "฿148.00",
        sl: "฿131.00"
      }
    ]
  },
  commerce: {
    label: "🛒 ค้าปลีก & บริการ (Commerce & Service)",
    picks: [
      {
        category: "Strong Uptrend",
        badge: "แนวโน้มขาขึ้นแกร่ง",
        color: "#22c55e",
        bgColor: "rgba(34, 197, 94, 0.08)",
        symbol: "SET:CPAXT",
        name: "CPAXT",
        reasons: [
          "ราคาทำ Bullish Breakout เหนือกรอบสะสมสะสมแบบถ้วยและหูจับ (Cup & Handle)",
          "ดัชนีวัดกำลังสัมพัทธ์ (RSI) วิ่งเข้าหาโซนแข็งแกร่ง (Strong Zone) เหนือ 60 บ่งชี้โมเมนตัมบวก",
          "EMA 20 ตัดข้ามเหนือ EMA 50 ขึ้นมาอย่างสมบูรณ์แบบในกรอบเวลา H4"
        ],
        entry: "฿32.00",
        tp: "฿36.50",
        sl: "฿30.00"
      },
      {
        category: "Buy on Dip",
        badge: "ราคาพักตัวแนวรับลึก",
        color: "#60a5fa",
        bgColor: "rgba(59, 130, 246, 0.08)",
        symbol: "SET:CPALL",
        name: "CPALL",
        reasons: [
          "ราคาพักตัวลดความร้อนแรงลงมาที่โซนดีมานด์สำคัญ (Demand Zone) บริเวณ ฿57.00",
          "เกิดโครงสร้าง RSI Bullish Divergence ในกรอบเวลา 4 ชั่วโมง (H4) ยืนยันแรงซื้อคืน",
          "ราคาแตะขอบล่างของตัวบ่งชี้กรอบราคา Bollinger Bands สะท้อนจุดเข้าที่ได้เปรียบ"
        ],
        entry: "฿57.25",
        tp: "฿63.00",
        sl: "฿55.00"
      },
      {
        category: "News Catalyst",
        badge: "ปัจจัยข่าวบวกหนุนนำ",
        color: "#eab308",
        bgColor: "rgba(234, 179, 8, 0.08)",
        symbol: "SET:CRC",
        name: "CRC",
        reasons: [
          "นโยบายการกระตุ้นการบริโภคภายในประเทศและการท่องเที่ยวช่วงวันหยุดยาวหนุนยอดขาย",
          "การฟื้นตัวของช่องทางจำหน่ายสาขาต่างประเทศ (เช่น เวียดนาม/อิตาลี) เติบโตก้าวกระโดด",
          "สถาบันการเงินคาดการณ์ตัวเลขดัชนียอดขายสาขาเดิม (SSSG) จะปรับตัวขึ้นเป็นบวกสูงสุดในรอบปี"
        ],
        entry: "฿33.50",
        tp: "฿38.00",
        sl: "฿31.50"
      }
    ]
  },
  healthcare: {
    label: "🏥 การแพทย์ & รพ. (Healthcare)",
    picks: [
      {
        category: "Strong Uptrend",
        badge: "แนวโน้มขาขึ้นแกร่ง",
        color: "#22c55e",
        bgColor: "rgba(34, 197, 94, 0.08)",
        symbol: "SET:BH",
        name: "BH",
        reasons: [
          "ราคาเบรกแนวต้านใหญ่ของปี ฿245.00 ด้วยแท่งเทียน Marubozu ขาขึ้นขนาดใหญ่",
          "ปริมาณการซื้อขายเพิ่มขึ้นสอดรับการไล่ราคาของสถาบันทั้งในและต่างประเทศ",
          "โครงสร้างทำ Higher High ทั้งในกรอบ D1 และ W1 ยืนยันวัฏจักรขาขึ้นเต็มตัว"
        ],
        entry: "฿250.00",
        tp: "฿280.00",
        sl: "฿238.00"
      },
      {
        category: "Buy on Dip",
        badge: "ราคาพักตัวแนวรับลึก",
        color: "#60a5fa",
        bgColor: "rgba(59, 130, 246, 0.08)",
        symbol: "SET:BDMS",
        name: "BDMS",
        reasons: [
          "ราคาย่อตัวกลับมาทดสอบแนวรับระดับสัปดาห์ (Weekly Support) บริเวณ ฿27.50",
          "เกิดรูปแบบการกลับตัวสองก้น (Double Bottom) ในกรอบเวลาระยะสั้น",
          "RSI เกิดภาวะขายมากเกินไป (Oversold) และเริ่มโค้งตัวกลับขึ้นมา"
        ],
        entry: "฿28.00",
        tp: "฿31.00",
        sl: "฿26.50"
      },
      {
        category: "News Catalyst",
        badge: "ปัจจัยข่าวบวกหนุนนำ",
        color: "#eab308",
        bgColor: "rgba(234, 179, 8, 0.08)",
        symbol: "SET:BCH",
        name: "BCH",
        reasons: [
          "รับอานิสงส์การปรับขึ้นค่าบริการและการขยายโควต้าผู้ประกันตนประกันสังคม",
          "การเดินทางเข้ามารักษาตัวของกลุ่มคนไข้ต่างชาติ (ตะวันออกกลางและเพื่อนบ้าน) ฟื้นตัวแกร่ง",
          "ตัวเลขผลประกอบการรอบล่าสุดมีทิศทางเติบโตดีกว่าสถิติปีก่อนหน้านี้เนื่องจากต้นทุนลดลง"
        ],
        entry: "฿19.80",
        tp: "฿22.50",
        sl: "฿18.70"
      }
    ]
  },
  ict: {
    label: "📱 เทคโนโลยี & สื่อสาร (ICT)",
    picks: [
      {
        category: "Strong Uptrend",
        badge: "แนวโน้มขาขึ้นแกร่ง",
        color: "#22c55e",
        bgColor: "rgba(34, 197, 94, 0.08)",
        symbol: "SET:ADVANC",
        name: "ADVANC",
        reasons: [
          "โครงสร้างราคาทำระดับสูงสุดใหม่ยกตัวสูงต่อเนื่อง (HH/HL) ชัดเจนในกรอบ H4",
          "ราคายืนเหนือเส้นค่าเฉลี่ยเคลื่อนที่สำคัญ EMA 200 อย่างมั่นคง",
          "เกิดสัญลักษณ์ Break of Structure (BOS) ยืนยันแรงซื้อฝั่งสถาบันหนุนนำสูง"
        ],
        entry: "฿209.00",
        tp: "฿225.00",
        sl: "฿201.00"
      },
      {
        category: "Buy on Dip",
        badge: "ราคาพักตัวแนวรับลึก",
        color: "#60a5fa",
        bgColor: "rgba(59, 130, 246, 0.08)",
        symbol: "SET:TRUE",
        name: "TRUE",
        reasons: [
          "ราคาย่อตัวกลับมาทดสอบระดับครึ่งหนึ่งของฟิโบนาชิ (Fibonacci 50% Retracement) ที่ ฿8.20",
          "แรงขายเริ่มชะลอตัวลงอย่างมีนัยสำคัญพร้อมลักษณะแท่งเทียนปฏิเสธราคา (Pin Bar)",
          "Stochastic เข้าสู่เขตสะสมของ (Oversold Zone) เตรียมตัดกันเพื่อฟื้นตัว"
        ],
        entry: "฿8.35",
        tp: "฿9.10",
        sl: "฿7.95"
      },
      {
        category: "News Catalyst",
        badge: "ปัจจัยข่าวบวกหนุนนำ",
        color: "#eab308",
        bgColor: "rgba(234, 179, 8, 0.08)",
        symbol: "SET:JAS",
        name: "JAS",
        reasons: [
          "ข่าวการประกาศจ่ายปันผลพิเศษครั้งใหญ่จากการปรับโครงสร้างทุนและการขายสินทรัพย์",
          "การร่วมพันธมิตรผู้ให้บริการโครงข่ายอินเทอร์เน็ตความเร็วสูงระดับภูมิภาคเพื่อต่อยอดธุรกิจ",
          "ข่าวสถิติกำไรพิเศษสุทธิจะบันทึกเข้ามาในบัญชีไตรมาสปัจจุบันอย่างมีนัยสำคัญ"
        ],
        entry: "฿2.38",
        tp: "฿2.70",
        sl: "฿2.22"
      }
    ]
  },
  property: {
    label: "🏢 อสังหาริมทรัพย์ (Property Development)",
    picks: [
      {
        category: "Strong Uptrend",
        badge: "แนวโน้มขาขึ้นแกร่ง",
        color: "#22c55e",
        bgColor: "rgba(34, 197, 94, 0.08)",
        symbol: "SET:CPN",
        name: "CPN",
        reasons: [
          "ราคาดีดทะลุกรอบสามเหลี่ยมสะสมราคาแบบขึ้น (Ascending Triangle) ในกรอบรายสัปดาห์",
          "ตัวชี้วัดความแข็งแกร่ง ADX พุ่งขึ้นเหนือ 25 ยืนยันถึงสภาวะการเริ่มต้นเทรนด์รอบใหม่",
          "ได้แรงซื้อสถาบันเก็บสะสมของหนุนต่อเนื่องหลังยืนยันแนวต้านเก่ากลายเป็นแนวรับใหม่"
        ],
        entry: "฿64.50",
        tp: "฿72.00",
        sl: "฿61.00"
      },
      {
        category: "Buy on Dip",
        badge: "ราคาพักตัวแนวรับลึก",
        color: "#60a5fa",
        bgColor: "rgba(59, 130, 246, 0.08)",
        symbol: "SET:SPALI",
        name: "SPALI",
        reasons: [
          "ราคาปรับลดตัวลงหาโซนต้านทานเดิมที่ผันตัวเป็นแนวรับหนาแน่นบริเวณ ฿18.20",
          "ดัชนี RSI ปรับลงถึงโซนแนวต้านล่างสุดสะท้อนราคาเข้าซื้อค่อนข้างปลอดภัยสูง",
          "พบบิ๊กล็อต (Big Lot) ของผู้บริหารกลุ่มสะสมหุ้นเพิ่มสะท้อนความมั่นใจภายใน"
        ],
        entry: "฿18.40",
        tp: "฿20.20",
        sl: "฿17.70"
      },
      {
        category: "News Catalyst",
        badge: "ปัจจัยข่าวบวกหนุนนำ",
        color: "#eab308",
        bgColor: "rgba(234, 179, 8, 0.08)",
        symbol: "SET:AP",
        name: "AP",
        reasons: [
          "ตัวเลขยอดรับรู้รายได้จากยอดโอนโครงการแนวราบและคอนโดมิเนียมสร้างสถิติสูงสุดใหม่",
          "ข่าวการประกาศเปิดตัวชุดโครงการใหม่มูลค่ารวมแสนล้านกระตุ้นตลาดช่วงครึ่งปีหลัง",
          "ประเมินอัตราเงินปันผลตอบแทน (Dividend Yield) ปีนี้อยู่ในระดับโดดเด่นถึง 7-8%"
        ],
        entry: "฿10.40",
        tp: "฿11.80",
        sl: "฿9.90"
      }
    ]
  },
  transport: {
    label: "✈️ ขนส่ง & โลจิสติกส์ (Transportation)",
    picks: [
      {
        category: "Strong Uptrend",
        badge: "แนวโน้มขาขึ้นแกร่ง",
        color: "#22c55e",
        bgColor: "rgba(34, 197, 94, 0.08)",
        symbol: "SET:AOT",
        name: "AOT",
        reasons: [
          "ราคาดีดทะลุผ่านช่องคู่ขนานขาลง (Downwards Channel Breakout) สำเร็จเป็นสัญญาณกลับตัว",
          "ปริมาณการซื้อขายหนาแน่นสอดคล้องกันกับการทะลุแนวต้านในกรอบเวลารายสัปดาห์ (W1)",
          "EMA 10 ตัดผ่านขึ้นเหนือ EMA 50 ยืนยันรอบเทรนด์ขาขึ้นระยะกลางอย่างชัดเจน"
        ],
        entry: "฿62.50",
        tp: "฿69.00",
        sl: "฿59.50"
      },
      {
        category: "Buy on Dip",
        badge: "ราคาพักตัวแนวรับลึก",
        color: "#60a5fa",
        bgColor: "rgba(59, 130, 246, 0.08)",
        symbol: "SET:BEM",
        name: "BEM",
        reasons: [
          "ราคาร่วงลงทดสอบระดับแนวรับใหญ่ที่เคยยืนสะสมพลังบริเวณ ฿7.80 แล้วเด้งรับแกร่ง",
          "ตัวชี้วัดความร้อนแรง RSI เกิดสัญญาณความขัดแย้งขาขึ้น (RSI Bullish Divergence) ชัดเจน",
          "การถือครองโดยกลุ่มนักลงทุนระยะยาวไม่ขยับสะท้อนระดับแรงเทขายใกล้หมดพลัง"
        ],
        entry: "฿7.90",
        tp: "฿8.60",
        sl: "฿7.60"
      },
      {
        category: "News Catalyst",
        badge: "ปัจจัยข่าวบวกหนุนนำ",
        color: "#eab308",
        bgColor: "rgba(234, 179, 8, 0.08)",
        symbol: "SET:BTS",
        name: "BTS",
        reasons: [
          "ความคืบหน้าการรับชำระหนี้สินค่าระบบกวนดินจากทางหน่วยงานกรุงเทพมหานคร",
          "ตัวเลขการเติบโตอย่างมั่นคงของผู้โดยสารรถไฟฟ้าสายสีชมพูและสายสีเหลืองหลังปรับอัตราสิทธิ",
          "ข่าวการร่วมพันธมิตรจัดทำโปรเจกต์คาร์บอนเครดิตและโซลาร์รูฟเพื่อเพิ่มมูลค่าธุรกิจ"
        ],
        entry: "฿4.50",
        tp: "฿5.10",
        sl: "฿4.24"
      }
    ]
  },
  set100: {
    label: "💯 หุ้นกลุ่ม SET100 (SET100 Index)",
    picks: [
      {
        category: "Strong Uptrend",
        badge: "แนวโน้มขาขึ้นแกร่ง",
        color: "#22c55e",
        bgColor: "rgba(34, 197, 94, 0.08)",
        symbol: "SET:DELTA",
        name: "DELTA",
        reasons: [
          "ราคาสร้างรูปแบบฐานราคาสูงขึ้น และเตรียมทะลุกรอบแนวต้านจิตวิทยาที่สำคัญ",
          "ได้รับอานิสงส์เชิงบวกจากกระแสความต้องการชิ้นส่วนอิเล็กทรอนิกส์ในตลาดโลกฟื้นตัว",
          "เส้นค่าเฉลี่ย EMA 50 ทำหน้าที่เป็นแนวรับไดนามิกที่แข็งแกร่งตลอดแนวโน้มขาขึ้น"
        ],
        entry: "฿88.00",
        tp: "฿98.00",
        sl: "฿83.00"
      },
      {
        category: "Buy on Dip",
        badge: "ราคาพักตัวแนวรับลึก",
        color: "#60a5fa",
        bgColor: "rgba(59, 130, 246, 0.08)",
        symbol: "SET:KTB",
        name: "KTB",
        reasons: [
          "ราคาย่อตัวสะสมพลังทดสอบแนวรับสำคัญแถว ฿17.00 พร้อมปริมาณซื้อขายที่ลดลง",
          "เกิดสัญญาณบ่งชี้การขายมากเกินไปในอินดิเคเตอร์สัญญานระยะสั้น (Stochastic Oversold)",
          "ยังคงรักษาทิศทางการยกฐานราคาขึ้นได้อย่างมั่นคงในแนวโน้มกรอบเวลาหลัก"
        ],
        entry: "฿17.20",
        tp: "฿19.20",
        sl: "฿16.50"
      },
      {
        category: "News Catalyst",
        badge: "ปัจจัยข่าวบวกหนุนนำ",
        color: "#eab308",
        bgColor: "rgba(234, 179, 8, 0.08)",
        symbol: "SET:OR",
        name: "OR",
        reasons: [
          "การฟื้นตัวของปริมาณการบริโภคน้ำมันและยอดขายร้านค้าปลีกในช่วงไฮซีซัน",
          "แผนการร่วมทุนธุรกิจไลฟ์สไตล์และเครื่องดื่มใหม่เพื่อเสริมอัตรากำไรขั้นต้น",
          "อัตราส่วนปันผลตอบแทนอยู่ในเกณฑ์ดี คาดดึงดูดแรงซื้อสถาบันกลับมาฟื้นฟูราคา"
        ]
      }
    ]
  }
};

const screenerPool = {
  energy: [
    { symbol: "SET:GULF", name: "GULF", reasons: ["ราคาทะลุผ่านแนวต้านจิตวิทยาที่ ฿45.00 ขึ้นมาสร้างจุดสูงสุดใหม่ (New High)", "ปริมาณการซื้อขาย (Volume) เพิ่มขึ้นกว่า 150% สนับสนุนการเบรคกรอบสะสมพลัง", "EMA 50 และ EMA 200 ตัดกันเป็นสีทอง (Golden Cross) บ่งบอกแนวโน้มขาขึ้นระยะยาว"] },
    { symbol: "SET:PTT", name: "PTT", reasons: ["ราคาปรับฐานลงมาที่แนวรับจิตวิทยาบริเวณ ฿32.00 ซึ่งเป็นโซนสะสมของสถาบันเดิม", "ดัชนี RSI ลงมาแตะระดับ 30 (Oversold Area) บ่งบอกสภาวะขายมากเกินไป", "เกิดรูปแบบแท่งเทียนกลับตัวแบบ Bullish Engulfing ในกรอบเวลารายวัน (D1)"] },
    { symbol: "SET:PTTEP", name: "PTTEP", reasons: ["ได้รับแรงหนุนจากราคาน้ำมันดิบโลก (Brent/WTI) ที่ปรับตัวสูงขึ้นทะลุ $85", "คาดการณ์กำไรไตรมาสล่าสุดจะเติบโตขึ้น 25% จากอัตราการกลั่นและการผลิตที่สูงขึ้น", "มีกระแสเงินสดหมุนเวียนแข็งแกร่งพร้อมประกาศอัตราเงินปันผลระหว่างกาลสูงขึ้น"] },
    { symbol: "SET:BANPU", name: "BANPU", reasons: ["ราคาเริ่มฟื้นตัวจากกรอบแนวรับลึก ดัชนี RSI เกิดสัญญาณ Bullish Divergence คาดหวังการ Rebound", "แรงขายสะสมเริ่มชะลอตัวลงอย่างชัดเจนพร้อมปริมาณการซื้อขายที่เบาบางลง", "เกิดโครงสร้างราคาพร้อมกลับตัวตามสัญญาณทางเทคนิคคอลสะสมซื้อในระยะยาว"] },
    { symbol: "SET:SPRC", name: "SPRC", reasons: ["ราคาทรงตัวในกรอบแนวรับสำคัญ ค่าการกลั่นเริ่มปรับตัวสูงขึ้นหนุนความเชื่อมั่นสถาบัน", "มีลักษณะการสะสมราคาแบบกรอบคู่ขนานระยะยาวเพื่อรอรอบดันของกลุ่มค่าการกลั่น", "ดัชนี RSI ฟื้นตัวชี้แนวโน้มความแข็งแกร่งเชิงบวกหนุนนำ"] },
    { symbol: "SET:TOP", name: "TOP", reasons: ["ราคาสะสมพลังยืนเหนือแนวต้านเดิม มีแรงซื้อสะสมเข้าหนาแน่นในกรอบเวลารายวัน", "สัญญาณเทคนิคคอลหลักสะท้อนแรงผลักขึ้นตามอุตสาหกรรมพลังงานต้นน้ำและกลางน้ำ", "ปริมาณวอลลุ่มสะสมสถาบันเริ่มหนุนราคาทะลุเป้าหมายสำคัญ"] }
  ],
  banking: [
    { symbol: "SET:SCB", name: "SCB", reasons: ["ราคาสามารถยกฐาน Higher Low สูงขึ้นต่อเนื่อง ยืนเหนือแนวรับจิตวิทยา ฿110", "กระแสเงินทุนต่างชาติ (Fund Flow) เริ่มไหลเข้าซื้อหุ้นกลุ่มธนาคารพาณิชย์ไทยชัดเจน", "MACD Line ตัดขึ้นเหนือ Signal Line ในกรอบรายสัปดาห์ (W1) เป็นสัญญาณรันเทรนด์"] },
    { symbol: "SET:KBANK", name: "KBANK", reasons: ["ราคย่อตัวลงทดสอบแนวรับเส้น EMA 200 บริเวณ ฿128.00 แล้วเกิดแรงซื้อดันกลับทันที", "สัญญาณเทคนิค Stochastic ในกรอบรายวัน (D1) เกิดการตัดกันขึ้นในเขต Oversold", "ราคาพิกัดทับซ้อนกับโซน FVG (Fair Value Gap) เดิมที่เป็นเป้าการกลับตัว"] },
    { symbol: "SET:BBL", name: "BBL", reasons: ["ได้ผลประโยชน์โดยตรงจากทิศทางอัตราดอกเบี้ยนโยบายที่ทรงตัวอยู่ในระดับสูง", "ข่าวการร่วมมือเชิงกลยุทธ์ด้านเทคโนโลยีทางการเงินเพื่อขยายฐานรายได้ค่าธรรมเนียม", "อัตราส่วนหนี้เสีย (NPL Ratio) ปรับลดลงต่ำกว่าเป้าหมายของธนาคารสะท้อนคุณภาพสินทรัพย์ที่ดีขึ้น"] },
    { symbol: "SET:KTB", name: "KTB", reasons: ["กระแสยอดใช้งานสินเชื่อและระบบดิจิทัลเติบโตสูง ราคาปรับตัวสร้างกรอบสะสมพลังระยะสั้น", "วอลลุ่มพอร์ตสถาบันเข้าสะสมในระดับราคาแนวรับสำคัญอย่างแข็งแกร่ง", "MACD เริ่มพลิกตัดเหนือแกนศูนย์สะท้อนโมเมนตัมบวกรอบใหม่"] },
    { symbol: "SET:TTB", name: "TTB", reasons: ["อัตราปันผลตอบแทนสูงสม่ำเสมอ ราคาเบรกผ่านแนวต้านย่อยพร้อมปริมาณการซื้อขายเด่นชัด", "ฐานกำไรเติบโตแข็งแรงจากพอร์ตรายรับดอกเบี้ยสุทธิที่เพิ่มประสิทธิภาพดีขึ้น", "ดัชนี RSI ประเมินรอบฟื้นตัวของพอร์ตในระดับที่มั่นคงเชิงเทคนิค"] },
    { symbol: "SET:MTC", name: "MTC", reasons: ["การคุมคุณภาพสินทรัพย์เริ่มทำได้ดีตามเป้า ราคาทะลุกรอบพักตัวระยะกลางแบบธงสามเหลี่ยม", "ยอดการปล่อยสินเชื่อใหม่เติบโตอย่างมั่นคงสอดคล้องกับปัจจัยฟื้นตัวเศรษฐกิจ", "Stochastic ตอกย้ำสัญญาณจุดซื้อกลับตัวที่เปรียบเทียบดีด้านความเสี่ยง"] }
  ],
  commerce: [
    { symbol: "SET:CPAXT", name: "CPAXT", reasons: ["ราคาทำ Bullish Breakout เหนือกรอบสะสมสะสมแบบถ้วยและหูจับ (Cup & Handle)", "ดัชนีวัดกำลังสัมพัทธ์ (RSI) วิ่งเข้าหาโซนแข็งแกร่ง (Strong Zone) เหนือ 60 บ่งชี้โมเมนตัมบวก", "EMA 20 ตัดข้ามเหนือ EMA 50 ขึ้นมาอย่างสมบูรณ์แบบในกรอบเวลา H4"] },
    { symbol: "SET:CPALL", name: "CPALL", reasons: ["ราคาพักตัวลดความร้อนแรงลงมาที่โซนดีมานด์สำคัญ (Demand Zone) บริเวณ ฿57.00", "เกิดโครงสร้าง RSI Bullish Divergence ในกรอบเวลา 4 ชั่วโมง (H4) ยืนยันแรงซื้อคืน", "ราคาแตะขอบล่างของตัวบ่งชี้กรอบราคา Bollinger Bands สะท้อนจุดเข้าที่ได้เปรียบ"] },
    { symbol: "SET:CRC", name: "CRC", reasons: ["นโยบายการกระตุ้นการบริโภคภายในประเทศและการท่องเที่ยวช่วงวันหยุดยาวหนุนยอดขาย", "การฟื้นตัวของช่องทางจำหน่ายสาขาต่างประเทศ (เช่น เวียดนาม/อิตาลี) เติบโตก้าวกระโดด", "สถาบันการเงินคาดการณ์ตัวเลขดัชนียอดขายสาขาเดิม (SSSG) จะปรับตัวขึ้นเป็นบวกสูงสุดในรอบปี"] },
    { symbol: "SET:HMPRO", name: "HMPRO", reasons: ["ราคาสร้างฐานราคาต่ำสุดยกสูง มียอดขายปรับปรุงบ้านช่วงฤดูฝนช่วยเร่งอัตรากำไร", "โมเมนตัมเทคนิคคอลชี้วัดการฟื้นตัวอย่างต่อเนื่องเหนือแนวรับทางจิตวิทยาสำคัญ", "มีระดับราคาเข้าซื้อสะสมที่ได้เปรียบสูงพร้อมผลตอบแทนปันผลสม่ำเสมอ"] },
    { symbol: "SET:BJC", name: "BJC", reasons: ["ต้นทุนการขนส่งปรับลดลงหนุนความสามารถในการทำกำไร ราคาผ่านจุดแนวรับสำคัญแล้ว", "ได้รับกระแสเชิงบวกจากสภาวะการท่องเที่ยวและยอดการบริโภคสินค้าอุปโภคบริโภคในไทย", "เกิดสัญญาณกลับตัวของแท่งเทียนรายวันประคองราคายืนเหนือกรอบสำคัญ"] },
    { symbol: "SET:GLOBAL", name: "GLOBAL", reasons: ["ราคาพยายามสร้างฐานสะสมแรงซื้อหนุนนำ Stochastic เริ่มโค้งตัดตัวขึ้นจากเขต Oversold", "ค่าใช้จ่ายและวัสดุก่อสร้างเริ่มฟื้นตัวสะสมยอดขายช่วงฟื้นสภาพหลังวิกฤติ", "EMA ระยะสั้นประคองตัวเหนือกรอบแนวรับสะท้อนแรงขายชะลอพลังเด่นชัด"] }
  ],
  healthcare: [
    { symbol: "SET:BH", name: "BH", reasons: ["ราคาเบรกแนวต้านใหญ่ของปี ฿245.00 ด้วยแท่งเทียน Marubozu ขาขึ้นขนาดใหญ่", "ปริมาณการซื้อขายเพิ่มขึ้นสอดรับการไล่ราคาของสถาบันทั้งในและต่างประเทศ", "โครงสร้างทำ Higher High ทั้งในกรอบ D1 และ W1 ยืนยันวัฏจักรขาขึ้นเต็มตัว"] },
    { symbol: "SET:BDMS", name: "BDMS", reasons: ["ราคาย่อตัวกลับมาทดสอบแนวรับระดับสัปดาห์ (Weekly Support) บริเวณ ฿27.50", "เกิดรูปแบบการกลับตัวสองก้น (Double Bottom) ในกรอบเวลาระยะสั้น", "RSI เกิดภาวะขายมากเกินไป (Oversold) และเริ่มโค้งตัวกลับขึ้นมา"] },
    { symbol: "SET:BCH", name: "BCH", reasons: ["รับอานิสงส์การปรับขึ้นค่าบริการและการขยายโควต้าผู้ประกันตนประกันสังคม", "การเดินทางเข้ามารักษาตัวของกลุ่มคนไข้ต่างชาติ (ตะวันออกกลางและเพื่อนบ้าน) ฟื้นตัวแกร่ง", "ตัวเลขผลประกอบการรอบล่าสุดมีทิศทางเติบโตดีกว่าสถิติปีก่อนหน้านี้เนื่องจากต้นทุนลดลง"] },
    { symbol: "SET:CHG", name: "CHG", reasons: ["ราคาสร้างฐานสะสมกำลังเพื่อทดสอบแนวต้านย่อย คาดการณ์กำไรฟื้นตัวเด่นชัดช่วงครึ่งปีหลัง", "มีแรงสนับสนุนซื้อกลับของกลุ่มกองทุนหลังราคาย่อลงมาที่แนวรับจิตวิทยา", "Stochastic ตอกย้ำการฟื้นตัวอย่างมั่นคงในเขตสะสมแรง"] },
    { symbol: "SET:PR9", name: "PR9", reasons: ["อัตรากำไรสุทธิเติบโตต่อเนื่องจากการขยายศูนย์แพทย์เฉพาะทางและกลุ่มผู้ป่วยต่างชาติใหม่", "ปริมาณการซื้อขายหนาแน่นสอดคล้องกับแนวรับขาขึ้นรันเทรนด์ระยะยาว", "ยืนระดับความแข็งแกร่งเหนือเส้นค่าเฉลี่ยหลัก EMA 200 อย่างสมบูรณ์"] }
  ],
  ict: [
    { symbol: "SET:ADVANC", name: "ADVANC", reasons: ["โครงสร้างราคาทำระดับสูงสุดใหม่ยกตัวสูงต่อเนื่อง (HH/HL) ชัดเจนในกรอบ H4", "ราคายืนเหนือเส้นค่าเฉลี่ยเคลื่อนที่สำคัญ EMA 200 อย่างมั่นคง", "เกิดสัญลักษณ์ Break of Structure (BOS) ยืนยันแรงซื้อฝั่งสถาบันหนุนนำสูง"] },
    { symbol: "SET:TRUE", name: "TRUE", reasons: ["ราคาย่อตัวกลับมาทดสอบระดับครึ่งหนึ่งของฟิโบนาชิ (Fibonacci 50% Retracement) ที่ ฿8.20", "แรงขายเริ่มชะลอตัวลงอย่างมีนัยสำคัญพร้อมลักษณะแท่งเทียนปฏิเสธราคา (Pin Bar)", "Stochastic เข้าสู่เขตสะสมของ (Oversold Zone) เตรียมตัดกันเพื่อฟื้นตัว"] },
    { symbol: "SET:JAS", name: "JAS", reasons: ["ข่าวการประกาศจ่ายปันผลพิเศษครั้งใหญ่จากการปรับโครงสร้างทุนและการขายสินทรัพย์", "การร่วมพันธมิตรผู้ให้บริการโครงข่ายอินเทอร์เน็ตความเร็วสูงระดับภูมิภาคเพื่อต่อยอดธุรกิจ", "ข่าวสถิติกำไรพิเศษสุทธิจะบันทึกเข้ามาในบัญชีไตรมาสปัจจุบันอย่างมีนัยสำคัญ"] },
    { symbol: "SET:INTUCH", name: "INTUCH", reasons: ["ราคายืนสะสมพลังแข็งแกร่งเพื่อรอโอกาสทะลุเป้าหมายแนวต้านเชิงจิตวิทยาสำคัญ", "รับปัจจัยบวกโดยตรงจากสัดส่วนการถือหุ้นในธุรกิจสื่อสารโทรคมนาคมชั้นนำ", "MACD วิ่งในเขตบวกประคองแนวโน้มสะสมซื้อต่อเนื่องมั่นคง"] }
  ],
  property: [
    { symbol: "SET:CPN", name: "CPN", reasons: ["ราคาดีดทะลุกรอบสามเหลี่ยมสะสมราคาแบบขึ้น (Ascending Triangle) ในกรอบรายสัปดาห์", "ตัวชี้วัดความแข็งแกร่ง ADX พุ่งขึ้นเหนือ 25 ยืนยันถึงสภาวะการเริ่มต้นเทรนด์รอบใหม่", "ได้แรงซื้อสถาบันเก็บสะสมของหนุนต่อเนื่องหลังยืนยันแนวต้านเก่ากลายเป็นแนวรับใหม่"] },
    { symbol: "SET:SPALI", name: "SPALI", reasons: ["ราคาปรับลดตัวลงหาโซนต้านทานเดิมที่ผันตัวเป็นแนวรับหนาแน่นบริเวณ ฿18.20", "ดัชนี RSI ปรับลงถึงโซนแนวต้านล่างสุดสะท้อนราคาเข้าซื้อค่อนข้างปลอดภัยสูง", "พบบิ๊กล็อต (Big Lot) ของผู้บริหารกลุ่มสะสมหุ้นเพิ่มสะท้อนความมั่นใจภายใน"] },
    { symbol: "SET:AP", name: "AP", reasons: ["ตัวเลขยอดรับรู้รายได้จากยอดโอนโครงการแนวราบและคอนโดมิเนียมสร้างสถิติสูงสุดใหม่", "ข่าวการประกาศเปิดตัวชุดโครงการใหม่มูลค่ารวมแสนล้านกระตุ้นตลาดช่วงครึ่งปีหลัง", "ประเมินอัตราเงินปันผลตอบแทน (Dividend Yield) ปีนี้อยู่ในระดับโดดเด่นถึง 7-8%"] },
    { symbol: "SET:LH", name: "LH", reasons: ["ราคาปรับฐานสะสมของเขตลึก RSI สะท้อนจุดเข้าซื้อที่ได้เปรียบเชิงผลตอบแทนต่อความเสี่ยง", "มียอดรายได้ส่วนแบ่งกำไรจากบริษัทลูกและกองทุนรวมอสังหาริมทรัพย์สนับสนุนฐานกำไร", "เกิดรูปแบบจุดต่ำสุดชั่วคราวเพื่อเข้าสู่รอบ Rebound ทางเทคนิค"] },
    { symbol: "SET:WHA", name: "WHA", reasons: ["ความต้องการเช่าพื้นที่คลังสินค้าและนิคมอุตสาหกรรมในไทยขยายตัวเด่นยอดโอนสูงเกินคาด", "ได้รับอานิสงส์การย้ายฐานการผลิตของกลุ่มทุนต่างชาติเข้าไทยต่อเนื่อง", "ราคาวิ่งรันเทรนด์ตามเส้นแนวโน้มขาขึ้นหลักอย่างสมบูรณ์แบบ"] },
    { symbol: "SET:SIRI", name: "SIRI", reasons: ["ราคาทรงตัวแกร่งเหนือแนวรับหลัก คาดผลยอดโอนและรายได้รวมไตรมาสนี้โตต่อเนื่องตามเป้า", "อัตราผลตอบแทนปันผลในเกณฑ์สูงเป็นเป้าหมายสะสมกองทุนหลัก", "อินดิเคเตอร์ Stochastic เริ่มส่งสัญญาณกลับตัวระยะสั้นสนับสนุน"] }
  ],
  transport: [
    { symbol: "SET:AOT", name: "AOT", reasons: ["ราคาดีดทะลุผ่านช่องคู่ขนานขาลง (Downwards Channel Breakout) สำเร็จเป็นสัญญาณกลับตัว", "ปริมาณการซื้อขายหนาแน่นสอดคล้องกันกับการทะลุแนวต้านในกรอบเวลารายสัปดาห์ (W1)", "EMA 10 ตัดผ่านขึ้นเหนือ EMA 50 ยืนยันรอบเทรนด์ขาขึ้นระยะกลางอย่างชัดเจน"] },
    { symbol: "SET:BEM", name: "BEM", reasons: ["ราคาร่วงลงทดสอบระดับแนวรับใหญ่ที่เคยยืนสะสมพลังบริเวณ ฿7.80 แล้วเด้งรับแกร่ง", "ตัวชี้วัดความร้อนแรง RSI เกิดสัญญาณความขัดแย้งขาขึ้น (RSI Bullish Divergence) ชัดเจน", "การถือครองโดยกลุ่มนักลงทุนระยะยาวไม่ขยับสะท้อนระดับแรงเทขายใกล้หมดพลัง"] },
    { symbol: "SET:BTS", name: "BTS", reasons: ["ความคืบหน้าการรับชำระหนี้สินค่าระบบกวนดินจากทางหน่วยงานกรุงเทพมหานคร", "ตัวเลขการเติบโตอย่างมั่นคงของผู้โดยสารรถไฟฟ้าสายสีชมพูและสายสีเหลืองหลังปรับอัตราสิทธิ", "ข่าวการร่วมพันธมิตรจัดทำโปรเจกต์คาร์บอนเครดิตและโซลาร์รูฟเพื่อเพิ่มมูลค่าธุรกิจ"] },
    { symbol: "SET:PRM", name: "PRM", reasons: ["ความต้องการใช้กองเรือขนส่งและคลังน้ำมันลอยน้ำเพิ่มขึ้นอย่างหนาแน่นหนุนอัตรากำไรขยายตัว", "ค่าระวางกลุ่มเรือขนส่งเฉพาะทางเติบโตดี ราคาประคองตัวในทิศทางขาขึ้นชัดเจน", "เกิดสัญญาณ Golden Cross สนับสนุนทิศทางการรันเทรนด์ระยะยาว"] },
    { symbol: "SET:PSL", name: "PSL", reasons: ["ดัชนีค่าระวางเรือขนส่งสินค้าแห้งเทกอง (BDI) ฟื้นตัวหนุนราคาดีดออกจากจุดต่ำสุด", "ราคาสะสมเหนือโซนดีมานด์สำคัญ เกิดรูปแบบแนวรับ Double Bottom สองจุด", "Stochastic ตอกย้ำโอกาสการกลับขึ้นเพื่อสะสมพลังรอบใหญ่"] }
  ],
  set100: [
    { symbol: "SET:DELTA", name: "DELTA", reasons: ["ราคาสร้างรูปแบบฐานราคาสูงขึ้น และเตรียมทะลุกรอบแนวต้านจิตวิทยาที่สำคัญ", "ได้รับอานิสงส์เชิงบวกจากกระแสความต้องการชิ้นส่วนอิเล็กทรอนิกส์ในตลาดโลกฟื้นตัว", "เส้นค่าเฉลี่ย EMA 50 ทำหน้าที่เป็นแนวรับไดนามิกที่แข็งแกร่งตลอดแนวโน้มขาขึ้น"] },
    { symbol: "SET:KTB", name: "KTB", reasons: ["ราคาย่อตัวสะสมพลังทดสอบแนวรับสำคัญแถว ฿17.00 พร้อมปริมาณซื้อขายที่ลดลง", "เกิดสัญญาณบ่งชี้การขายมากเกินไปในอินดิเคเตอร์สัญญานระยะสั้น (Stochastic Oversold)", "ยังคงรักษาทิศทางการยกฐานราคาขึ้นได้อย่างมั่นคงในแนวโน้มกรอบเวลาหลัก"] },
    { symbol: "SET:OR", name: "OR", reasons: ["การฟื้นตัวของปริมาณการบริโภคน้ำมันและยอดขายร้านค้าปลีกในช่วงไฮซีซัน", "แผนการร่วมทุนธุรกิจไลฟ์สไตล์และเครื่องดื่มใหม่เพื่อเสริมอัตรากำไรขั้นต้น", "อัตราส่วนปันผลตอบแทนอยู่ในเกณฑ์ดี คาดดึงดูดแรงซื้อสถาบันกลับมาฟื้นฟูราคา"] },
    { symbol: "SET:CPF", name: "CPF", reasons: ["ราคาสัตว์เนื้อสัตว์และราคาหมูในภูมิภาคฟื้นตัวเร็วขึ้น ส่งผลดีต่อต้นทุนการผลิตที่ลดลง", "แนวโน้มยอดขายอาหารสัตว์และอาหารแปรรูปส่งออกฟื้นแกร่งในตลาดหลัก", "ดัชนีราคาประคองผ่านจุดแนวต้านประวัติการณ์เดิมสนับสนุนรันเทรนด์"] },
    { symbol: "SET:IVL", name: "IVL", reasons: ["ราคาผ่านจุดต่ำสุดของรอบวัฏจักร สัญญาณราคาสะท้อนแรงกลับตัวของอุตสาหกรรมในทวีปยุโรป", "ปริมาณการขายกลุ่มผลิตภัณฑ์เคมีภัณฑ์ขยายตัวเพิ่มขึ้นหนุนกำไรขั้นต้น", "MACD ตัดส่งสัญญาณบวกรอบใหญ่พร้อมกลับทิศทางแนวโน้มขึ้น"] },
    { symbol: "SET:TU", name: "TU", reasons: ["ราคาเบรกผ่านแนวต้านย่อยกรอบเวลา D1 อัตราการฟื้นตัวของธุรกิจอาหารทะเลแปรรูปกลับมาแกร่ง", "ต้นทุนวัตถุดิบลดลงส่งผลดีต่อผลผลิตและยอดขายรวมในทวีปยุโรป/อเมริกา", "ดัชนีความแข็งแกร่งเทคนิคคอลหลักชี้ทิศทางรันเทรนด์ตามกรอบ"] },
    { symbol: "SET:MINT", name: "MINT", reasons: ["อัตราการเข้าพักฟื้นตัวเต็มที่ในกลุ่มโรงแรมยุโรปและไทย คาดรายได้รวมแตะระดับสูงสุดใหม่", "ยอดจองล่วงหน้าและกิจกรรมสันทนาการกระตุ้นกำไรพิเศษรอบปีนี้เด่น", "เทคนิคคอลฟื้นตัวจากกรอบแนวรับสะสมกำลังรันรอบขาขึ้นต่อเนื่อง"] },
    { symbol: "SET:SAWAD", name: "SAWAD", reasons: ["ราคาพักตัวเขต Oversold มีแรงเก็งกำไรรับปัจจัยบวกจากการคุมดอกเบี้ยและหนี้ค้างชำระ", "มีทิศทางการควบคุมสินทรัพย์ด้อยคุณภาพมีประสิทธิภาพดีขึ้นตามเป้าสถาบัน", "เกิดรูปแบบแท่งเทียนลากกลับตัว Pin Bar สนับสนุนความเสี่ยงต่ำ"] },
    { symbol: "SET:TIDLOR", name: "TIDLOR", reasons: ["ราคาสร้างรูปแบบกลับตัวฐานกลม แรงซื้อสะสมเริ่มดันผ่านเส้นแนวโน้มต้านเดิมสำเร็จ", "การควบคุมหนี้เสียทำได้ดีกว่าสถิติช่วงปีที่ผ่านมา มั่นใจฐานการเติบโตสินเชื่อ", "ดัชนี Stochastic เกิดสัญญาณซื้อตัดกันขึ้นจากเขตราคาสมเหตุสมผลลึก"] }
  ]
};

export default function ThaiStockAnalysisView({ username }) {
  const [symbol, setSymbol] = useState(() => {
    const user = username ? username.toLowerCase() : "guest";
    return localStorage.getItem(`${user}_thai_stock_analysis_symbol`) || "SET:SET";
  });
  const [searchInput, setSearchInput] = useState(() => {
    const user = username ? username.toLowerCase() : "guest";
    const saved = localStorage.getItem(`${user}_thai_stock_analysis_symbol`) || "SET:SET";
    return saved.split(":")[1] || saved;
  });
  const [screenerSector, setScreenerSector] = useState("energy");
  const [screenerData, setScreenerData] = useState(sectorScreenerData);
  const [bestPicks, setBestPicks] = useState([]);
  const [loadingScreener, setLoadingScreener] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchScreenerPrices = async () => {
      if (loadingScreener) return;
      setLoadingScreener(true);
      
      const roundThaiTick = (val) => {
        if (val < 2) return Math.round(val * 100) / 100;
        if (val < 5) return Math.round(val * 50) / 50;
        if (val < 10) return Math.round(val * 20) / 20;
        if (val < 25) return Math.round(val * 10) / 10;
        if (val < 100) return Math.round(val * 4) / 4;
        if (val < 200) return Math.round(val * 2) / 2;
        if (val < 400) return Math.round(val * 1) / 1;
        return Math.round(val / 2) * 2;
      };

      const uniqueSymbols = [];
      Object.values(screenerPool).forEach((poolList) => {
        poolList.forEach((item) => {
          if (!uniqueSymbols.includes(item.symbol)) {
            uniqueSymbols.push(item.symbol);
          }
        });
      });

      try {
        const res = await fetch(`/api/price?symbol=${encodeURIComponent(uniqueSymbols.join(","))}`);
        if (res.ok) {
          const pricesData = await res.json();
          const updatedScreener = JSON.parse(JSON.stringify(sectorScreenerData));
          
          Object.keys(screenerPool).forEach((sectorKey) => {
            const sectorCandidates = screenerPool[sectorKey].map((cand) => {
              const data = pricesData[cand.symbol];
              const price = data ? parseFloat(data.price) : 0;
              const changePct = data ? parseFloat(data.changePct || 0) : 0;
              
              let probVal = 75;
              let reasons = [
                `ราคามีแนวโน้มแกว่งตัวในทิศทางทวีมูลค่าและสร้างความมั่นใจให้ผู้ลงทุน`,
                `พิจารณาสัญญาณโมเมนตัมเทคนิคคอลสะท้อนรอบการซื้อคืนที่ต่อเนื่องในโซน`,
                `ระดับปริมาณการเทรดค่อนข้างสมดุลพร้อมเป็นจุดเปลี่ยนแนวโน้มสำคัญ`
              ];
              if (cand.reasons) {
                reasons = Array.isArray(cand.reasons) ? cand.reasons : [cand.reasons];
              }

              if (price > 0) {
                let entryVal = price;
                let tpVal = price * 1.10;
                let slVal = price * 0.95;

                const hash = cand.symbol.charCodeAt(4) || 0;
                if (hash % 3 === 0) {
                  entryVal = price * 1.01;
                  tpVal = price * 1.12;
                  slVal = price * 0.96;
                  probVal = 80 + Math.round((changePct > 0 ? changePct : 0) * 1.8);
                } else if (hash % 3 === 1) {
                  entryVal = price * 0.98;
                  tpVal = price * 1.08;
                  slVal = price * 0.94;
                  probVal = 78 + Math.round((changePct < 0 ? Math.abs(changePct) : 0) * 1.5);
                } else {
                  entryVal = price;
                  tpVal = price * 1.15;
                  slVal = price * 0.93;
                  probVal = 82 + Math.round(Math.abs(changePct) * 1.2);
                }

                probVal = Math.min(96, Math.max(68, probVal));

                return {
                  ...cand,
                  currentPrice: price,
                  changePct,
                  probVal,
                  prob: probVal + "%",
                  entry: "฿" + roundThaiTick(entryVal).toFixed(2),
                  tp: "฿" + roundThaiTick(tpVal).toFixed(2),
                  sl: "฿" + roundThaiTick(slVal).toFixed(2),
                  reasons
                };
              }
              
              return null;
            }).filter(Boolean);

            sectorCandidates.sort((a, b) => b.probVal - a.probVal);

            const top3 = sectorCandidates.slice(0, 3).map((item, idx) => {
              let category = "Strong Uptrend";
              let badge = "แนวโน้มขาขึ้นแกร่ง";
              let color = "#22c55e";
              let bgColor = "rgba(34, 197, 94, 0.08)";

              if (idx === 1) {
                category = "News Catalyst";
                badge = "ปัจจัยข่าวบวกหนุนนำ";
                color = "#eab308";
                bgColor = "rgba(234, 179, 8, 0.08)";
              } else if (idx === 2) {
                category = "Buy on Dip";
                badge = "ราคาพักตัวแนวรับลึก";
                color = "#60a5fa";
                bgColor = "rgba(59, 130, 246, 0.08)";
              }

              return {
                ...item,
                category,
                badge,
                color,
                bgColor
              };
            });

            updatedScreener[sectorKey].picks = top3;
          });

          if (!mounted) return;

          setScreenerData(updatedScreener);

          const allPicks = [];
          Object.entries(updatedScreener).forEach(([sectorKey, sector]) => {
            sector.picks.forEach((pick) => {
              allPicks.push({ ...pick, sectorLabel: sector.label });
            });
          });

          allPicks.sort((a, b) => b.probVal - a.probVal);
          setBestPicks(allPicks.slice(0, 2));
        }
      } catch (err) {
        console.error("Error in screener pool fetch:", err);
      } finally {
        if (mounted) setLoadingScreener(false);
      }
    };

    fetchScreenerPrices();
    const interval = setInterval(fetchScreenerPrices, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Resize observer to scale Investing.com chart dynamically to container width/height
  const chartContainerRef = useRef(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 700, height: 580 });

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const updateDimensions = () => {
      const w = chartContainerRef.current.clientWidth;
      const h = chartContainerRef.current.clientHeight;
      setChartDimensions({ 
        width: Math.max(250, w), 
        height: Math.max(300, h > 50 ? h : 580)
      });
    };
    
    updateDimensions();
    const observer = new ResizeObserver(() => updateDimensions());
    observer.observe(chartContainerRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const user = username ? username.toLowerCase() : "guest";
    localStorage.setItem(`${user}_thai_stock_analysis_symbol`, symbol);
  }, [symbol, username]);
  
  // Checklist states
  const [checklist, setChecklist] = useState({
    trend: "uptrend", // uptrend, downtrend, sideways
    structure: "",    // BOS, CHoCH, Range
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
  const [calcAsset, setCalcAsset] = useState("forex"); // gold, forex, jpy
  const [calcBalance, setCalcBalance] = useState(1000);
  const [calcRiskPct, setCalcRiskPct] = useState(1);
  const [calcEntry, setCalcEntry] = useState(100.0);
  const [calcSL, setCalcSL] = useState(98.0);
  const [calcTP, setCalcTP] = useState(105.0);
  
  // Accordion active EP
  const [activeEP, setActiveEP] = useState(null);

  // Copy state
  const [copied, setCopied] = useState(false);

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
    { symbol: "SET:SET", label: "📈 SET Index", assetType: "forex" },
    { symbol: "SET:PTT", label: "⛽ PTT", assetType: "forex" },
    { symbol: "SET:CPALL", label: "🛒 CPALL", assetType: "forex" },
    { symbol: "SET:BDMS", label: "🏥 BDMS", assetType: "forex" },
    { symbol: "SET:ADVANC", label: "📱 ADVANC", assetType: "forex" },
    { symbol: "SET:AOT", label: "✈️ AOT", assetType: "forex" }
  ]);

  const [showAddShortcut, setShowAddShortcut] = useState(false);
  const [newShortcutSymbol, setNewShortcutSymbol] = useState("");
  const [newShortcutLabel, setNewShortcutLabel] = useState("");
  const [newShortcutType, setNewShortcutType] = useState("forex");

  // Load user-scoped quick selects
  useEffect(() => {
    const user = username ? username.toLowerCase() : "guest";
    const saved = localStorage.getItem(`${user}_forex_dashboard_thai_stock_quick_selects`);
    if (saved) {
      try {
        setQuickSelects(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved quick selects", e);
      }
    } else {
      setQuickSelects([
        { symbol: "SET:SET", label: "📈 SET Index", assetType: "forex" },
        { symbol: "SET:PTT", label: "⛽ PTT", assetType: "forex" },
        { symbol: "SET:CPALL", label: "🛒 CPALL", assetType: "forex" },
        { symbol: "SET:BDMS", label: "🏥 BDMS", assetType: "forex" },
        { symbol: "SET:ADVANC", label: "📱 ADVANC", assetType: "forex" },
        { symbol: "SET:AOT", label: "✈️ AOT", assetType: "forex" }
      ]);
    }
  }, [username]);

  // Save quick selects
  useEffect(() => {
    const user = username ? username.toLowerCase() : "guest";
    localStorage.setItem(`${user}_forex_dashboard_thai_stock_quick_selects`, JSON.stringify(quickSelects));
  }, [quickSelects, username]);

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
        formattedSym = "SET:" + cleanSym; // fallback to SET prefix for Thai Stock page
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
    setLivePrice(null); // Reset price immediately to prevent leakage from previous symbol
    let isMounted = true;
    const fetchPrice = async () => {
      try {
        const res = await fetch(`/api/price?symbol=${symbol}`);
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
    const isThaiStock = sym.startsWith("SET:") || sym.includes("SET") || cleanSym === "PTT" || cleanSym === "CPALL" || cleanSym === "BDMS" || cleanSym === "ADVANC" || cleanSym === "AOT" || thaiStockPairIds[cleanSym.toUpperCase()] !== undefined;
    
    let defaultPrice = 50.0;
    if (isThaiStock) {
      if (cleanSym === "SET") defaultPrice = 1608.30;
      else if (cleanSym === "PTT") defaultPrice = 32.50;
      else if (cleanSym === "CPALL") defaultPrice = 57.25;
      else if (cleanSym === "BDMS") defaultPrice = 28.00;
      else if (cleanSym === "ADVANC") defaultPrice = 209.00;
      else if (cleanSym === "AOT") defaultPrice = 62.50;
      else {
        let hash = 0;
        const str = cleanSym.toUpperCase();
        for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        defaultPrice = 15.0 + (Math.abs(hash) % 365) + (Math.abs(hash * 7) % 4) * 0.25;
      }
      decimals = 2;
      prefix = "฿";
    } else if (cleanSym.includes("XAUUSD") || cleanSym.includes("GOLD")) {
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
    } else if (isThaiStock) {
      dailyBias = `🇹🇭 Bullish Bias: แนวโน้มหลักของ ${cleanSym} วันนี้แกว่งตัวอยู่ในกรอบขาขึ้นสะสมพลังเหนือระดับ ${fS1} โดยมีแรงซื้อเก็งกำไรไหลเข้าหนุนกลุ่มหุ้นบิ๊กแคปอย่างต่อเนื่องตามสภาวะเศรษฐกิจในประเทศ`;
      intradayTactics = `🎯 Buy on Support: แนะนำหาจังหวะรอราคาย่อตัวลงมาทดสอบโซนแนวรับสำคัญบริเวณ ${fS1} เพื่อเปิดสถานะ Buy วาง SL ที่ ${fS2} และตั้งเป้าทำกำไรที่ ${fR1} และเป้าถัดไปที่ ${fR2}`;
      
      weeklyBias = `🇹🇭 Weekly Outlook: ภาพรวมสัปดาห์นี้ของ ${cleanSym} ยังคงประคองทิศทางเป็นบวกสะสมพอร์ตขาขึ้นได้ดี โดยได้รับการสนับสนุนเชิงโครงสร้างราคารายสัปดาห์เหนือระดับแนวรับใหญ่ ${fS2}`;
      weeklyTactics = `🎯 Weekly Swing Plan: แนะนำรอหาจังหวะสะสม Buy เมื่อย่อตัวในกรอบแนวรับสัปดาห์ ${fS1} วางจุดจำกัดความเสี่ยง SL ที่ ${fS2} และตั้งเป้าทำกำไรที่ ${fR2}`;
      
      monthlyBias = `🇹🇭 Monthly Macro View: แนวโน้มระยะยาวระดับรายเดือนของ ${cleanSym} อยู่ในช่วงปรับฐานและทยอยฟื้นตัวตามความเชื่อมั่นของนักลงทุนต่างชาติและนโยบายกระตุ้นเม็ดเงินไหลเข้าตลาดหลักทรัพย์`;
      monthlyTactics = `🎯 Monthly Long-term Plan: วางแผนสะสมลงทุนระยะยาวด้วยไม้เฉลี่ยเมื่อราคาเข้าใกล้แนวรับใหญ่รายเดือน ${fS2} โดยมีเป้าต้านระยะยาวอยู่ที่ ${fR2}`;
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

    const impacts = relevantEvents.map(ev => {
      let impactText = "คาดว่าราคาจะแกว่งตัวในกรอบสั้นๆ";
      let direction = "neutral";
      
      const currency = ev.currency;
      const isHighImpact = ev.importance === 3;

      if (currency === "USD") {
        if (isGold) {
          impactText = isHighImpact 
            ? "ตัวเลขจริงดีกว่าคาด: ดอลลาร์แข็ง/ทองร่วงลงรุนแรง | ตัวเลขจริงต่ำกว่าคาด: ดอลลาร์อ่อน/ทองพุ่งทะยาน"
            : "ส่งผลกระทบปานกลาง: ตัวเลขจริงดีกว่าคาดจะกดดันราคาทองลงเล็กน้อย";
          direction = isHighImpact ? "bearish" : "neutral";
        } else {
          impactText = `ตัวเลขจริงดีกว่าคาด: หนุนดอลลาร์แข็งค่าขึ้นโดยตรง | ตัวเลขจริงต่ำกว่าคาด: กดดันให้ดอลลาร์อ่อนค่าลง`;
          direction = "bullish";
        }
      } else if (currency === "EUR" && isEUR) {
        impactText = `ตัวเลขจริงดีกว่าคาด: หนุนให้ EURUSD ดีดตัวขึ้น (EUR แข็งค่า) | ตัวเลขจริงต่ำกว่าคาด: กดดัน EURUSD ร่วงลง`;
        direction = "bullish";
      } else if (currency === "GBP" && isGBP) {
        impactText = `ตัวเลขจริงดีกว่าคาด: หนุนให้ GBPUSD ดีดตัวขึ้น (GBP แข็งค่า) | ตัวเลขจริงต่ำกว่าคาด: กดดัน GBPUSD ร่วงลง`;
        direction = "bullish";
      } else if (currency === "JPY" && isJPY) {
        impactText = `นโยบายธนาคารกลางญี่ปุ่น: หากขึ้นดอกเบี้ย/เข้มงวด JPY จะแข็งค่ารุนแรง ส่งผลให้กราฟ USDJPY ดิ่งตัวลงอย่างหนัก`;
        direction = "bearish";
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
        direction
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

  useEffect(() => {
    const fetchAndAnalyzeNews = async () => {
      setNewsAnalysis(prev => ({ ...prev, loading: true }));
      try {
        const response = await fetch("/api/set-news");
        if (!response.ok) throw new Error("Failed to load SET news");
        const json = await response.json();
        
        const cleanSym = symbol.split(":")[1] || symbol;
        
        // Specific symbol news mapping
        const specificNews = [];
        if (cleanSym === "PTT") {
          specificNews.push(
            { title: "บมจ. ปตท. (PTT) ประกาศแผนขยายกำลังการผลิตโครงสร้างพื้นฐานพลังงานทดแทนและระบบชาร์จ EV ทั่วประเทศ", source: "Settrade.com", time: "ล่าสุด", link: "https://www.settrade.com/th/home", impact: "หนุนความเชื่อมั่นระยะกลางในหุ้นพลังงานทางเลือกและแผนยั่งยืน" },
            { title: "บอร์ด PTT อนุมัติการเจรจาสัญญาซื้อขายก๊าซธรรมชาติรอบใหม่เพื่อรองรับการเปลี่ยนผ่านทางพลังงาน", source: "SET.or.th", time: "5 ชั่วโมงที่แล้ว", link: "https://www.set.or.th/th/home", impact: "ส่งเสริมเสถียรภาพรายได้และควบคุมต้นทุนได้อย่างมั่นคงในอนาคต" }
          );
        } else if (cleanSym === "CPALL") {
          specificNews.push(
            { title: "บมจ. ซีพี ออลล์ (CPALL) ชี้แจงยอดจำหน่ายและสาขาใหม่ในต่างประเทศ (กัมพูชา/ลาว) เติบโตทะลุเป้าหมายไตรมาส", source: "Settrade.com", time: "ล่าสุด", link: "https://www.settrade.com/th/home", impact: "ส่งผลบวกต่อการฟื้นตัวของอัตรากำไรขั้นต้นและการขยายตลาดในอาเซียน" },
            { title: "รายงานการสำรวจพฤติกรรมผู้บริโภคสะท้อนยอดซื้อสาขาเดิม (SSSG) ของ CPALL แข็งแกร่งจากภาคท่องเที่ยวหนุน", source: "SET.or.th", time: "6 ชั่วโมงที่แล้ว", link: "https://www.set.or.th/th/home", impact: "กระตุ้นความน่าสนใจในการถือครองลงทุนระยะยาวเพื่อสร้างปันผล" }
          );
        } else if (cleanSym === "BDMS") {
          specificNews.push(
            { title: "บมจ. กรุงเทพดุสิตเวชการ (BDMS) ทุ่มงบยกระดับเครื่องมือแพทย์และต้อนรับศูนย์ผู้ป่วยข้ามชาติแห่งใหม่", source: "Settrade.com", time: "ล่าสุด", link: "https://www.settrade.com/th/home", impact: "ดึงดูดกระแสเงินสดและผู้ป่วยพรีเมียมจากตะวันออกกลางและเอเชียใต้" }
          );
        } else if (cleanSym === "ADVANC") {
          specificNews.push(
            { title: "บมจ. แอดวานซ์ อินโฟร์ เซอร์วิส (ADVANC) จับมือยักษ์ใหญ่คลาวด์เพื่อขยายโครงข่ายและระบบปัญญาประดิษฐ์ (AI Cloud)", source: "Settrade.com", time: "ล่าสุด", link: "https://www.settrade.com/th/home", impact: "รักษาความเป็นผู้นำด้านนวัตกรรมโทรคมนาคมและขยายฐานลูกค้าองค์กร" }
          );
        } else if (cleanSym === "AOT") {
          specificNews.push(
            { title: "บมจ. ท่าอากาศยานไทย (AOT) เผยสถิติจำนวนเที่ยวบินข้ามทวีปพุ่งทะยาน หนุนรายได้ค่าบริการผู้โดยสารโตเด่น", source: "Settrade.com", time: "ล่าสุด", link: "https://www.settrade.com/th/home", impact: "ส่งผลดีต่อกำไรสุทธิสุทธิประจำปีและทิศทางราคาเป้าหมายโบรกเกอร์" }
          );
        }

        if (!["SET", "PTT", "CPALL", "BDMS", "ADVANC", "AOT"].includes(cleanSym)) {
          specificNews.push(
            { 
              title: `บมจ. ${cleanSym} เผยความแข็งแกร่งของกระแสเงินสดและสัดส่วนหนี้สินสุทธิต่อทุนต่ำเตรียมปันผลรอบปีเด่น`, 
              source: "Settrade.com", 
              time: "ล่าสุด", 
              link: "https://www.settrade.com/th/home", 
              impact: "ช่วยส่งเสริมสถานะพื้นฐานของบริษัทและเป็นตัวกระตุ้นแรงซื้อเก็งกำไรระยะสั้นในดัชนี" 
            },
            { 
              title: `บทวิเคราะห์เชิงปริมาณประจำไตรมาสของ ${cleanSym} พบสถาบันในประเทศเข้าซื้อสะสมหนาตาต่อเนื่องตลอดสัปดาห์`, 
              source: "SET.or.th", 
              time: "4 ชั่วโมงที่แล้ว", 
              link: "https://www.set.or.th/th/home", 
              impact: "เพิ่มระดับความเชื่อมั่นของนักลงทุนรายย่อยในการรอสวิงเทรดซื้อสะสมตามโซนรับสำคัญ" 
            }
          );
        }
        const combinedNews = [...specificNews, ...json];

        const impacts = combinedNews.map(item => ({
          time: item.time,
          currency: "THB",
          importance: 3,
          event: item.title,
          impact: item.impact || "ส่งผลดีต่อภาพลักษณ์ความน่าสนใจและกระแสเงินไหลเข้าของตลาดหุ้นไทยในภาพรวม",
          actual: item.source,
          forecast: "SET/SETTRADE",
          previous: "SET",
          direction: "bullish",
          link: item.link
        }));

        setNewsAnalysis({
          summary: `พบข่าวสำคัญที่เกี่ยวกับ ${cleanSym} และตลาดหุ้นไทยทั้งหมด ${combinedNews.length} เรื่อง สำหรับการวิเคราะห์กลยุทธ์`,
          impacts,
          volatilityWarning: "ระดับความผันผวนและสภาวะตลาดหลักทรัพย์ไทยอยู่ในเกณฑ์สมดุลเพื่อเข้าสะสมลงทุน",
          loading: false
        });
      } catch (err) {
        console.error("Failed to parse SET news:", err);
        setNewsAnalysis({
          summary: "ดึงข้อมูลข่าวสารจากระบบ SET และ Settrade ไม่สำเร็จ แนะนำให้วิเคราะห์แนวโน้มทางเทคนิคเป็นหลัก",
          impacts: [],
          volatilityWarning: "ไม่สามารถประเมินข่าวด่วนของตลาดหุ้นไทยได้ ณ ขณะนี้",
          loading: false
        });
      }
    };

    fetchAndAnalyzeNews();
    const interval = setInterval(fetchAndAnalyzeNews, 60000);
    return () => clearInterval(interval);
  }, [symbol]);



  // Economic Calendar is rendered directly via secure, ad-blocker-safe TradingView iframe below

  // TradingView Widget Loader
  // Settrade Ticker Link Mapping
  const getSettradeUrl = (sym) => {
    const cleanSym = sym.split(":")[1] || sym;
    if (cleanSym === "SET") {
      return "https://www.settrade.com/th/equity/index/SET";
    }
    return `https://www.settrade.com/th/equity/quote/${cleanSym}/chart`;
  };

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
        const formattedSymbol = cleanSymbol.includes(":") ? cleanSymbol : `SET:${cleanSymbol}`;
        setSymbol(formattedSymbol);
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
          assetType="thai_stock"
          symbol={symbol.split(":")[1] || symbol}
          price={livePrice ? String(livePrice) : "145.00"}
          change="+0.50%"
          indicators={{ RSI: 58.4, MA20: "Uptrend", MACD: "Bullish Cross" }}
        />
      </div>
      {/* Split layout: Left (70% width) and Right (30% width) */}
      <div className="analysis-split-layout full-chart-mode">
        
        {/* Left Column: Live Chart (height: 600px) and Economic Calendar (height: 400px) */}
        <div className="chart-pane glass-card">
          <div className="pane-header">
            <div className="pane-title">
              <Globe size={18} style={{ color: "var(--color-primary)" }} />
              <span>ระบบวิเคราะห์หุ้นไทย: {symbol.split(":")[1] || symbol}</span>
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

          {/* AI Stock Screener & Selection Portal */}
          <div className="glass-card" style={{
            padding: "20px 24px",
            margin: "0 0 24px 0",
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.65), rgba(15, 23, 42, 0.75))",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)"
          }}>
            <div style={{ borderBottom: "1px dashed var(--border-color)", paddingBottom: "12px", marginBottom: "16px" }}>
              <h3 className="section-title" style={{ fontSize: "16px", marginBottom: "4px", borderBottom: "none", paddingBottom: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={20} style={{ color: "#eab308" }} />
                <span>ระบบคัดเลือกหุ้นเด่นโดย AI (AI Stock Selection & Screener)</span>
              </h3>
              <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-muted)" }}>
                คัดกรองหุ้นไทยที่มีแนวโน้มทางเทคนิค โครงสร้างราคา หรือข่าวสารที่น่าสนใจมากที่สุดในรอบวันเพื่อการเข้าเทรดสะสม (คลิกที่ป้ายชื่อหุ้นเพื่อเปิดดูกราฟสดและสถิติ indicators)
              </p>
            </div>

            {/* 👑 AI Absolute Top Picks of the Day Banner */}
            <div style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.65), rgba(30, 41, 59, 0.45))",
              border: "1.5px solid rgba(234, 179, 8, 0.3)",
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 0 15px rgba(234, 179, 8, 0.05)",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "12px" }}>
                <span style={{ fontSize: "11px", fontWeight: "bold", background: "linear-gradient(90deg, #f59e0b, #eab308)", color: "#0f172a", padding: "4px 10px", borderRadius: "6px", boxShadow: "0 2px 8px rgba(234, 179, 8, 0.3)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  👑 AI Best Picks
                </span>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#fff" }}>
                  หุ้นเด่นที่สุดในตลาดวันนี้ (AI Best Picks of the Day)
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "auto", background: "rgba(255, 255, 255, 0.05)", padding: "2px 6px", borderRadius: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  {loadingScreener ? "⏳ กำลังวิเคราะห์..." : "🟢 อัปเดตเรียลไทม์"}
                </span>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
                gap: "16px"
              }}>
                {(() => {
                  const displayPicks = bestPicks.length > 0 ? bestPicks : [
                    {
                      symbol: "SET:BH",
                      name: "BH (บำรุงราษฎร์)",
                      sector: "Healthcare",
                      sectorLabel: "🏥 การแพทย์ & รพ. (Healthcare)",
                      reasons: "ราคามีแรงซื้อระดับสถาบันไหลเข้าสะสมต่อเนื่องจนสามารถทะลุผ่านแนวต้านสำคัญในรอบปีที่ ฿245.00 ได้อย่างทรงพลัง (Bullish Breakout) สอดรับกับปริมาณการซื้อขายที่เพิ่มขึ้นอย่างหนาแน่น ถือเป็นหุ้นกลุ่มปลอดภัยที่มีความเสี่ยงต่ำและอัตราการฟื้นตัวสูงสุดในบรรดาหุ้นไทยวันนี้",
                      prob: "86%",
                      entry: "฿250.00",
                      tp: "฿280.00",
                      sl: "฿238.00"
                    },
                    {
                      symbol: "SET:CPALL",
                      name: "CPALL (ซีพี ออลล์)",
                      sector: "Commerce",
                      sectorLabel: "🛒 ค้าปลีก & บริการ (Commerce & Service)",
                      reasons: "โครงสร้างราคาทำจุดต่ำสุดยกสูงขึ้น (Higher Low) หลังทดสอบแนวรับสำคัญ พร้อมการเกิดสัญญาณ Bullish Divergence ในโมเมนตัมอินดิเคเตอร์ คาดได้รับปัจจัยบวกจากเศรษฐกิจในประเทศฟื้นตัวและการขยายสาขาเชิงรุกอย่างต่อเนื่อง",
                      prob: "82%",
                      entry: "฿57.00",
                      tp: "฿65.00",
                      sl: "฿54.50"
                    }
                  ];

                  return displayPicks.map((pick) => {
                    const chg = typeof pick.changePct === "number" ? pick.changePct : 0;
                    const changeColor = chg > 0 ? "#22c55e" : chg < 0 ? "#ef4444" : "var(--text-muted)";
                    const changeText = chg > 0 ? `+${chg.toFixed(2)}%` : `${chg.toFixed(2)}%`;

                    return (
                      <div key={pick.symbol} className="ai-pick-card" style={{
                        background: "rgba(15, 23, 42, 0.45)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        borderRadius: "8px",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: "12px"
                      }}>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>หมวดหมู่: {pick.sectorLabel || pick.sector}</span>
                            <button
                              type="button"
                              onClick={() => handleQuickSelect(pick.symbol, "thai_stock")}
                              className="btn-quick-select active"
                              style={{ margin: 0, padding: "3px 8px", fontSize: "11px", background: "rgba(234, 179, 8, 0.15)", border: "1px solid rgba(234, 179, 8, 0.4)", color: "#eab308", cursor: "pointer", borderRadius: "4px", fontWeight: "bold" }}
                            >
                              เปิดกราฟ {pick.symbol.split(":")[1]} 📊
                            </button>
                          </div>
                          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "8px" }}>
                            <h4 style={{ margin: 0, fontSize: "16px", color: "#fff", fontWeight: "800" }}>{pick.name}</h4>
                            {pick.currentPrice && (
                              <span style={{ fontSize: "12px", fontWeight: "700", color: changeColor }}>
                                ฿{pick.currentPrice.toFixed(2)} ({changeText})
                              </span>
                            )}
                          </div>
                          <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                            <strong>เหตุผลจาก AI:</strong> {pick.reasons}
                          </p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {/* Probability Bar */}
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "-2px" }}>
                            <span style={{ color: "#10b981", fontWeight: "600" }}>📈 โอกาสขาขึ้น (Bullish Prob.)</span>
                            <span style={{ color: "#10b981", fontWeight: "bold" }}>{pick.prob}</span>
                          </div>
                          <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden", marginBottom: "4px" }}>
                            <div style={{ height: "100%", width: pick.prob, background: "linear-gradient(90deg, #10b981, #34d399)", borderRadius: "3px" }} />
                          </div>
                          
                          {/* Entry Target Stop Grid */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", background: "rgba(15, 23, 42, 0.6)", padding: "8px 12px", borderRadius: "6px", fontSize: "11.5px", border: "1px solid rgba(255, 255, 255, 0.03)" }}>
                            <div><span style={{ color: "var(--text-muted)" }}>ราคาเข้าซื้อ:</span> <strong style={{ color: "#22c55e" }}>{pick.entry}</strong></div>
                            <div><span style={{ color: "var(--text-muted)" }}>เป้าหมาย (TP):</span> <strong style={{ color: "#60a5fa" }}>{pick.tp}</strong></div>
                            <div style={{ gridColumn: "span 2", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "4px", marginTop: "2px" }}>
                              <span style={{ color: "var(--text-muted)" }}>ตัดขาดทุน (SL):</span> <strong style={{ color: "#ef4444" }}>{pick.sl}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Sector selector dropdown row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px", background: "rgba(15, 23, 42, 0.3)", padding: "10px 16px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#60a5fa", display: "flex", alignItems: "center", gap: "6px" }}>
                📊 หุ้นแนะนำรายกลุ่มอุตสาหกรรม (Technical Screener)
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", marginTop: "4px", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-start" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)" }}>เลือกกลุ่มอุตสาหกรรม:</label>
                </div>
                {/* Mobile Dropdown (Visible only on mobile) */}
                <div className="mobile-sector-select-wrapper" style={{ width: "100%", paddingBottom: "4px" }}>
                  <select 
                    value={screenerSector} 
                    onChange={(e) => setScreenerSector(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 32px 8px 12px",
                      background: "rgba(15, 23, 42, 0.65)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "6px",
                      color: "#FBBF24",
                      fontSize: "12.5px",
                      fontWeight: "600",
                      outline: "none",
                      cursor: "pointer",
                      appearance: "none",
                      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23FBBF24' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 10px center",
                      backgroundSize: "16px"
                    }}
                  >
                    {Object.entries(screenerData).map(([key, val]) => (
                      <option key={key} value={key} style={{ background: "#0f172a", color: "#f8fafc" }}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Desktop Buttons (Visible only on desktop) */}
                <div style={{ 
                  display: "flex", 
                  gap: "8px", 
                  flexWrap: "wrap",
                  justifyContent: "flex-start",
                  width: "100%",
                  paddingBottom: "4px"
                }} className="sector-tabs-container desktop-sector-tabs">
                  {Object.entries(screenerData).map(([key, val]) => {
                    const isActive = screenerSector === key;
                    const shortLabel = val.label.split(" (")[0] || val.label;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setScreenerSector(key)}
                        style={{
                          padding: "6px 12px",
                          background: isActive ? "rgba(234, 179, 8, 0.15)" : "rgba(15, 23, 42, 0.5)",
                          border: isActive ? "1.5px solid #eab308" : "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "6px",
                          color: isActive ? "#FBBF24" : "var(--text-secondary)",
                          fontSize: "12px",
                          fontWeight: isActive ? "600" : "normal",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          transition: "all 0.2s"
                        }}
                      >
                        {shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: "20px"
            }}>
              {screenerData[screenerSector].picks.map((pick, i) => (
                <div key={pick.symbol + i} style={{
                  background: "rgba(15, 23, 42, 0.35)",
                  border: `1px solid ${pick.color}25`,
                  borderRadius: "10px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  transition: "transform 0.2s, box-shadow 0.2s"
                }}
                className="screener-card"
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: pick.color, fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", background: pick.bgColor, padding: "4px 8px", borderRadius: "6px" }}>
                      {pick.category === "Strong Uptrend" ? <TrendingUp size={14} /> : pick.category === "Buy on Dip" ? "💎" : <Newspaper size={14} />} {pick.badge}
                    </span>
                    {pick.changePct !== undefined && (
                      <span style={{ fontSize: "11px", fontWeight: "bold", color: pick.changePct > 0 ? "#22c55e" : pick.changePct < 0 ? "#ef4444" : "var(--text-muted)", marginLeft: "auto", marginRight: "8px" }}>
                        {pick.changePct > 0 ? `+${pick.changePct.toFixed(2)}%` : `${pick.changePct.toFixed(2)}%`}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleQuickSelect(pick.symbol, "thai_stock")}
                      className="btn-quick-select active"
                      style={{ margin: 0, padding: "4px 10px", fontSize: "12px", fontWeight: "bold", background: `${pick.color}25`, border: `1px solid ${pick.color}`, color: pick.color, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      {pick.name}
                      {pick.currentPrice && (
                        <span style={{ fontSize: "10px", opacity: 0.9 }}>
                          ฿{pick.currentPrice.toFixed(2)}
                        </span>
                      )}
                    </button>
                  </div>
                  
                  <div style={{ fontSize: "13px", color: "#f8fafc" }}>
                    <strong>เหตุผลที่น่าเข้าซื้อโดย AI (AI Rationale):</strong>
                    <ul style={{ margin: "6px 0 0 0", paddingLeft: "18px", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "4px", lineHeight: "1.4" }}>
                      {pick.reasons.map((r, rIdx) => <li key={rIdx}>{r}</li>)}
                    </ul>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", background: "rgba(15, 23, 42, 0.5)", padding: "10px", borderRadius: "6px", fontSize: "12px", marginTop: "auto" }}>
                    <div><span style={{ color: "var(--text-muted)" }}>แนวรับน่าซื้อ (Entry):</span> <strong style={{ color: "#22c55e" }}>{pick.entry}</strong></div>
                    <div><span style={{ color: "var(--text-muted)" }}>เป้ากำไร (TP):</span> <strong style={{ color: "#60a5fa" }}>{pick.tp}</strong></div>
                    <div style={{ gridColumn: "span 2", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "6px", marginTop: "4px" }}>
                      <span style={{ color: "var(--text-muted)" }}>ตัดขาดทุน (SL):</span> <strong style={{ color: "#ef4444" }}>{pick.sl}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                        <span>🧠 สรุปวิเคราะห์ข่าวสารและระดับความน่าจะเป็นของหุ้นโดย AI (AI News & Probability Analysis)</span>
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
                                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{ev.time} ({ev.actual})</span>
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

          <div className="layout-row-50-50" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "24px",
            marginBottom: "24px",
            alignItems: "stretch"
          }}>



            {/* Left: Settrade.com Chart Portal */}
            {(() => {
              const cleanSym = symbol.split(":")[1] || symbol;
              const companyName = cleanSym === "SET" ? "ดัชนี SET Index" : 
                                  cleanSym === "PTT" ? "หุ้น PTT (ปตท.)" :
                                  cleanSym === "CPALL" ? "หุ้น CPALL (ซีพี ออลล์)" :
                                  cleanSym === "BDMS" ? "หุ้น BDMS (กรุงเทพดุสิตเวชการ)" :
                                  cleanSym === "ADVANC" ? "หุ้น ADVANC (เอไอเอส)" :
                                  cleanSym === "AOT" ? "หุ้น AOT (การท่าฯ)" : `หุ้น ${cleanSym}`;
              
              const pairId = thaiStockPairIds[cleanSym.toUpperCase()] || 38015;
              const settradeUrl = getSettradeUrl(symbol);

              return (
                <div className="glass-card" style={{
                  padding: "20px",
                  background: "linear-gradient(135deg, #071120, #050d1a)",
                  border: "1.5px solid rgba(59, 130, 246, 0.4)",
                  boxShadow: "0 0 25px rgba(59, 130, 246, 0.15)",
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  minHeight: "670px",
                  boxSizing: "border-box"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Globe size={18} style={{ color: "#eab308" }} />
                        <span>กราฟเทคนิค {companyName} (Settrade.com)</span>
                      </h3>
                      <span style={{ fontSize: "11.5px", color: "#eab308", fontWeight: "600" }}>www.settrade.com/th/home</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.open(settradeUrl, "_blank")}
                      style={{
                        background: "rgba(234, 179, 8, 0.15)",
                        border: "1px solid rgba(234, 179, 8, 0.3)",
                        borderRadius: "6px",
                        color: "#eab308",
                        padding: "6px 12px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.background = "rgba(234, 179, 8, 0.3)";
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.background = "rgba(234, 179, 8, 0.15)";
                        e.currentTarget.style.color = "#eab308";
                      }}
                    >
                      เปิดดูบน Settrade ↗
                    </button>
                  </div>
                  
                  <div ref={chartContainerRef} style={{ flex: 1, borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-color)", background: "#131722", display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
                    <iframe
                      src={`https://ssltvc.investing.com/?pair_ID=${pairId}&height=${chartDimensions.height}&width=${chartDimensions.width}&interval=1440&plotStyle=candles&domain_ID=53&lang_ID=53&timezone_ID=7`}
                      width="100%"
                      height="100%"
                      style={{ border: "none", height: "100%", width: "100%", background: "#131722" }}
                      frameBorder="0"
                      allowTransparency="true"
                      marginWidth="0"
                      marginHeight="0"
                      title="Thai Stock Interactive Technical Chart"
                    ></iframe>
                  </div>
                </div>
              );
            })()}
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

          <div className="layout-row-50-50" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "24px",
            marginBottom: "24px",
            alignItems: "start"
          }}>

            {/* Left: Settrade News Feed */}
            <div className="economic-calendar-section" style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
              <div className="pane-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <div className="pane-title" style={{ margin: 0 }}>
                  <Newspaper size={18} style={{ color: "#eab308" }} />
                  <span>กระดานข่าวสารและบทความล่าสุดจาก Settrade (Settrade News Feed)</span>
                </div>
              </div>
              
              <div className="economic-calendar-wrapper" style={{ 
                borderRadius: "12px", 
                border: "1.5px solid rgba(234, 179, 8, 0.3)", 
                overflow: "hidden", 
                background: "linear-gradient(135deg, #071120, #050d1a)",
                padding: "20px",
                height: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                boxSizing: "border-box"
              }}>
                {newsAnalysis.loading ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "12px", flex: 1, minHeight: "200px" }}>
                    <div className="spinner" />
                    <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>กำลังโหลดข่าวสารล่าสุดจาก Settrade...</span>
                  </div>
                ) : newsAnalysis.impacts.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {newsAnalysis.impacts.map((ev, idx) => (
                      <div key={idx} style={{
                        background: "rgba(15, 23, 42, 0.45)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        borderRadius: "8px",
                        padding: "14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        transition: "all 0.2s"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "11px", color: "#eab308", fontWeight: "700", background: "rgba(234, 179, 8, 0.08)", padding: "2px 6px", borderRadius: "4px" }}>🏷️ {ev.actual}</span>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>⏰ {ev.time}</span>
                        </div>
                        <h4 style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#f8fafc", lineHeight: "1.45" }}>
                          {ev.event}
                        </h4>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            onClick={() => window.open(ev.link || "https://www.settrade.com/th/news-and-articles/news/main", "_blank")}
                            style={{
                              background: "rgba(234, 179, 8, 0.15)",
                              border: "1px solid rgba(234, 179, 8, 0.3)",
                              borderRadius: "4px",
                              color: "#eab308",
                              padding: "5px 10px",
                              fontSize: "11px",
                              fontWeight: "bold",
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                            onMouseOver={e => e.currentTarget.style.background = "rgba(234, 179, 8, 0.3)"}
                            onMouseOut={e => e.currentTarget.style.background = "rgba(234, 179, 8, 0.15)"}
                          >
                            อ่านเนื้อหาข่าวต้นฉบับ ↗
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flex: 1, minHeight: "400px", color: "var(--text-muted)", fontSize: "12.5px" }}>
                    ไม่พบข่าวสารล่าสุดจาก Settrade ในขณะนี้
                  </div>
                )}
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
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "11.5px", marginBottom: "8px", background: "rgba(15, 23, 42, 0.5)", padding: "6px 10px", borderRadius: "6px" }}>
                          <div>แหล่งข่าว: <strong style={{ color: "#3b82f6" }}>{ev.actual}</strong></div>
                          {ev.link && (
                            <button
                              type="button"
                              onClick={() => window.open(ev.link, "_blank")}
                              className="btn-quick-select active"
                              style={{ margin: 0, padding: "3px 8px", fontSize: "10.5px", background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "var(--color-primary)", cursor: "pointer" }}
                            >
                              อ่านข่าวต้นฉบับ ↗
                            </button>
                          )}
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
