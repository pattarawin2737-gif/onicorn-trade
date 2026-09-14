// Utility สำหรับดึงข้อมูลจาก Google Sheets (gviz API)

/**
 * Fetch ข้อมูลจากแผ่นงาน Google Sheets และแปลงเป็น JSON Object
 * @param {string} spreadsheetId ID ของ Google Sheets
 * @param {string} sheetName ชื่อแผ่นงาน (Tab Name)
 * @returns {Promise<{cols: string[], rows: any[]}>}
 */
export async function fetchSheetData(spreadsheetId, sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`การดึงข้อมูลล้มเหลว: HTTP ${response.status}`);
    }
    
    const text = await response.text();
    // ดึงเฉพาะส่วน JSON ที่อยู่ในวงเล็บ google.visualization.Query.setResponse(...)
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("รูปแบบข้อมูลที่ส่งกลับจาก Google Sheets ไม่ถูกต้อง");
    }
    
    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    const data = JSON.parse(jsonString);
    
    if (data.status === "error") {
      throw new Error(data.errors[0]?.detailed_message || "เกิดข้อผิดพลาดในการอ่านข้อมูลจากชีต");
    }
    
    const table = data.table;
    
    // ดึงชื่อหัวตาราง (Columns) โดยล้างค่าช่องว่าง / รหัสขึ้นบรรทัดใหม่
    const cols = table.cols.map((c, i) => {
      if (c && c.label) {
        return c.label.replace(/\r?\n|\r/g, " ").trim();
      }
      return `col_${i}`;
    });
    
    // แปลงแถวข้อมูล (Rows) เป็น Object
    const rows = table.rows
      .map(row => {
        const obj = {};
        let hasData = false;
        
        row.c.forEach((cell, index) => {
          const colLabel = cols[index] || `col_${index}`;
          // ดึงค่าจริง (value)
          obj[colLabel] = cell ? cell.v : null;
          
          // เก็บค่าที่จัดฟอร์แมตแล้ว (formatted value) เช่น ยอดเงิน หรือ % ด้วย
          if (cell && cell.f !== undefined) {
            obj[colLabel + "_formatted"] = cell.f;
          }
          
          if (cell && cell.v !== null && cell.v !== "") {
            hasData = true;
          }
        });
        
        return hasData ? obj : null;
      })
      .filter(row => row !== null); // กรองแถวที่เป็นค่าว่างออก
      
    return { cols, rows };
  } catch (error) {
    console.error(`ข้อผิดพลาดในการ Fetch Sheet "${sheetName}":`, error);
    throw error;
  }
}

/**
 * จัดกลุ่มข้อมูล DayTrader เพื่อคำนวณสถิติ
 * @param {any[]} trades 
 */
export function calculateTradingStats(trades) {
  if (!trades || trades.length === 0) return null;
  
  // กรองเฉพาะแถวที่ระบุวันที่เข้า และคู่เงิน
  const validTrades = trades.filter(t => t["วันที่เปิด"] && t["คู่เงิน"]);
  
  let totalTrades = validTrades.length;
  let wins = 0;
  let losses = 0;
  let breakEvens = 0; // SL หน้าทุน
  let totalPips = 0;
  let totalProfit = 0;
  
  const winLossRatioHistory = [];
  const monthlyStats = {};
  const pairStats = {};
  
  validTrades.forEach(trade => {
    const result = String(trade["ผลลัพธ์"] || "").trim().toLowerCase();
    const pips = parseFloat(trade["ผลลัพธ์ (จุด)"] || trade["ผลลัพธ์\n(จุด)"] || 0);
    const profitVal = parseFloat(trade["กำไร/ขาดทุน($)"] || trade["ผลกำไร/ขาดทุน"] || trade["กำไร/ขาดทุน"] || 0);
    const dateStr = String(trade["วันที่เปิด"] || "");
    const pair = String(trade["คู่เงิน"] || "").toUpperCase().trim();
    
    totalPips += pips;
    if (!isNaN(profitVal)) totalProfit += profitVal;
    
    // นับสถิติแพ้ชนะ
    if (result.includes("win") || result.includes("ชนะ") || result.includes("tp") || pips > 0) {
      wins++;
    } else if (result.includes("loss") || result.includes("แพ้") || result.includes("sl") || pips < 0) {
      losses++;
    } else {
      breakEvens++;
    }
    
    // สถิติแยกตามคู่เงิน
    if (pair) {
      if (!pairStats[pair]) {
        pairStats[pair] = { name: pair, trades: 0, wins: 0, losses: 0, pips: 0 };
      }
      pairStats[pair].trades++;
      if (result.includes("win") || result.includes("ชนะ") || result.includes("tp") || pips > 0) {
        pairStats[pair].wins++;
      } else if (result.includes("loss") || result.includes("แพ้") || result.includes("sl") || pips < 0) {
        pairStats[pair].losses++;
      }
      pairStats[pair].pips += pips;
    }
    
    // สถิติแยกตามรายเดือน (ดึงชื่อเดือนจาก 'วันที่เปิด' เช่น Date(2026,5,29) หรือ String '2026-06-29')
    let monthKey = "ไม่ระบุเดือน";
    if (dateStr.includes("Date(")) {
      const match = dateStr.match(/Date\((\d+),(\d+),(\d+)\)/);
      if (match) {
        const year = match[1];
        const month = parseInt(match[2]) + 1; // Apps Script return month is 0-indexed
        monthKey = `${year}-${String(month).padStart(2, "0")}`;
      }
    } else {
      const dateParts = dateStr.split(/[-/]/);
      if (dateParts.length >= 2) {
        monthKey = `${dateParts[0]}-${String(dateParts[1]).padStart(2, "0")}`;
      }
    }
    
    if (monthKey) {
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { month: monthKey, trades: 0, wins: 0, losses: 0, pips: 0 };
      }
      monthlyStats[monthKey].trades++;
      if (result.includes("win") || result.includes("ชนะ") || result.includes("tp") || pips > 0) {
        monthlyStats[monthKey].wins++;
      } else if (result.includes("loss") || result.includes("แพ้") || result.includes("sl") || pips < 0) {
        monthlyStats[monthKey].losses++;
      }
      monthlyStats[monthKey].pips += pips;
    }
  });
  
  const winRate = totalTrades > 0 ? ((wins / (wins + losses || 1)) * 100).toFixed(1) : 0;
  
  return {
    totalTrades,
    wins,
    losses,
    breakEvens,
    totalPips,
    totalProfit: Math.round(totalProfit * 100) / 100,
    winRate,
    monthlyStats: Object.values(monthlyStats).sort((a, b) => a.month.localeCompare(b.month)),
    pairStats: Object.values(pairStats).sort((a, b) => b.trades - a.trades)
  };
}

/**
 * ดึงข้อมูลสรุปหัวตารางและรายละเอียดรายวันของแผนการเทรดสะสมทุน
 * @param {any[]} planRows แถวข้อมูลจาก PLAN 2569 / 2570
 */
export function parseCompoundingPlan(planRows) {
  if (!planRows || planRows.length < 5) return null;
  
  // แถวที่ 1 และ 2 จะบรรจุข้อมูลพารามิเตอร์เริ่มต้น
  // เงินทุนตั้งต้น (Initial Capital): แถวที่ 0 คอลัมน์ที่ 1 (ดัชนี 1)
  // กำไรรวมทั้งหมด: แถวที่ 0 คอลัมน์ที่ 5
  // ตั้งเป้าเก็บกำไร: แถวที่ 1 คอลัมน์ที่ 1
  
  const headerInfo = {
    initialCapital: planRows[0]?.["เงินทุนตั้งต้น"] || 0,
    totalProfit: planRows[0]?.["กำไรรวม\nทั้งหมด"] || planRows[0]?.["กำไรรวม ทั้งหมด"] || 0,
    profitTarget: planRows[1]?.["เงินทุนตั้งต้น"] || 0, // สัมพันธ์ตามการจัดวาง
  };
  
  // ค้นหาแถวที่เป็นจุดเริ่มต้นของข้อมูลตารางจริง (หัวข้อตาราง 'Day')
  let tableHeaderIndex = -1;
  for (let i = 0; i < planRows.length; i++) {
    if (planRows[i]["Day"] !== undefined || planRows[i]["col_0"] === "Day") {
      tableHeaderIndex = i;
      break;
    }
  }
  
  if (tableHeaderIndex === -1) return null;
  
  // รายการวันในตารางสะสมทุน
  const days = [];
  for (let i = tableHeaderIndex + 1; i < planRows.length; i++) {
    const row = planRows[i];
    if (row["Day"] === null || row["Day"] === undefined || row["Day"] === "") continue;
    
    // เก็บข้อมูลรายละเอียดรายวัน
    days.push({
      day: row["Day"],
      lotSize: row["Lot Size"] || 0,
      targetPct: row["Target (%)"] || 0,
      risk: row["รับความเสี่ยง"] || 0,
      lossStreak: row["แพ้ติดกัน(ไม้)"] || 0,
      maxLossPoints: row["แพ้สูงสุด(จุด)"] || 0,
      tpPerDay: row["TP / วัน"] || 0,
      slPerDay: row["SL / วัน"] || 0,
      targetObtainedPct: row["Target obtained (%)"] || 0,
      profitOrLoss: row["กำไร/ขาดทุน"] || 0,
      withdrawal: row["ถอน"] || 0,
      balance: row["Balance"] || 0,
    });
  }
  
  return {
    headerInfo,
    days
  };
}
