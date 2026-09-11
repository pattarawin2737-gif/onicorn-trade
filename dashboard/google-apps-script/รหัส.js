/**
 * Google Apps Script for Login Authentication via Google Sheets
 * 
 * ID: 1TjKh5CnXTW59xegOYNZbAGnkMsvQYE00Qz_T_nmwrDruXEvMsZBmL_xl
 */

// ใส่ Google Spreadsheet ID ของคุณที่ต้องการใช้เก็บข้อมูลบัญชีผู้ใช้และข้อมูลการเทรดที่นี่
const SPREADSHEET_ID = "11N8winbGyNa6nm8rx_4DUj2zzVM49j5OJ1ipPo6_kd4";

/**
 * ฟังก์ชันสำหรับสร้างชีตผู้ใช้งานหากยังไม่มีอยู่ใน Spreadsheet
 */
function initializeUsersSheet(ss) {
  if (!ss) {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  let sheet = ss.getSheetByName("Users");
  if (!sheet) {
    sheet = ss.insertSheet("Users");
    
    // ตั้งค่าหัวตาราง (Headers)
    sheet.appendRow(["Username", "Password", "Role"]);
    
    // เพิ่มบัญชีผู้ใช้จำลองเริ่มต้น
    sheet.appendRow(["admin", "admin1234", "administrator"]);
    sheet.appendRow(["trader", "trader1234", "trader"]);
    
    // จัดรูปแบบตารางหัวข้อ
    sheet.getRange("A1:C1").setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, 3);
  }
  return sheet;
}

/**
 * Handle POST request for Login authentication
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const username = (postData.username || "").toString().trim();
    const password = (postData.password || "").toString().trim();

    if (!username || !password) {
      return makeJsonResponse({
        success: false,
        message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน"
      });
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = initializeUsersSheet(ss);
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    // เริ่มต้นค้นหาจากแถวที่ 2 (เว้นแถวหัวตาราง)
    for (let i = 1; i < values.length; i++) {
      const sheetUser = values[i][0].toString().trim();
      const sheetPass = values[i][1].toString().trim();
      const sheetRole = values[i][2] ? values[i][2].toString().trim() : "user";

      // หากผู้ใช้งานและรหัสผ่านตรงกัน
      if (sheetUser.toLowerCase() === username.toLowerCase() && sheetPass === password) {
        // สร้าง Session Token แบบจำลองอย่างง่าย
        const token = Utilities.base64Encode(username + ":" + new Date().getTime());
        
        return makeJsonResponse({
          success: true,
          username: sheetUser,
          role: sheetRole,
          token: token
        });
      }
    }

    // หากไม่พบชื่อผู้ใช้หรือรหัสผ่านไม่ตรงกัน
    return makeJsonResponse({
      success: false,
      message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
    });

  } catch (error) {
    return makeJsonResponse({
      success: false,
      message: "เกิดข้อผิดพลาดในการตรวจสอบบัญชี: " + error.toString()
    });
  }
}

/**
 * Handle GET request (Health Check)
 */
function doGet(e) {
  return makeJsonResponse({
    status: "online",
    message: "Google Apps Script Login Endpoint is working! Use POST method to authenticate."
  });
}

/**
 * Helper to build JSON responses to avoid CORS issues
 */
function makeJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
