// การตั้งค่าหลักของแอปพลิเคชัน

export const CONFIG = {
  // ID ของ Google Sheets สำหรับข้อมูลประวัติการเทรดและแผนการเทรด
  SPREADSHEET_ID: "11N8winbGyNa6nm8rx_4DUj2zzVM49j5OJ1ipPo6_kd4",
  
  // โหลดหรือบันทึก Apps Script Web App URL จาก localStorage
  getAppsScriptUrl: () => {
    return localStorage.getItem("apps_script_url") || "https://script.google.com/macros/s/AKfycbypnohmPzNWzy5LFEExpTvxvKIdJLtnOuatxME0YrfJL5_r6-TLIaqXI6-3KpSctHmHhg/exec";
  },
  
  setAppsScriptUrl: (url) => {
    if (url) {
      localStorage.setItem("apps_script_url", url.trim());
    } else {
      localStorage.removeItem("apps_script_url");
    }
  }
};
