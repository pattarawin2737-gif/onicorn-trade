# คู่มือการตั้งค่า Google Sheets และ Google Apps Script สำหรับระบบ Login

กรุณาทำตามขั้นตอนด้านล่างนี้เพื่อเปิดใช้งานระบบการตรวจสอบสิทธิ์ (Login) ของเว็บไซต์คุณครับ

---

## ขั้นตอนที่ 1: เตรียมแผ่นงาน Google Sheets
1. เปิดไฟล์ Google Sheets ของคุณ: [11N8winbGyNa6nm8rx_4DUj2zzVM49j5OJ1ipPo6_kd4](https://docs.google.com/spreadsheets/d/11N8winbGyNa6nm8rx_4DUj2zzVM49j5OJ1ipPo6_kd4/)
2. สร้างชีต (Sheet tab) ใหม่ด้านล่างของไฟล์ ตั้งชื่อว่า **`Users`**
3. เขียนหัวคอลัมน์ในแถวแรก (Row 1) ดังนี้:
   - **คอลัมน์ A**: `username`
   - **คอลัมน์ B**: `password`
   - **คอลัมน์ C**: `role`
4. กรอกข้อมูลล็อกอินสำหรับใช้งานในแถวถัดไป (Row 2, 3, ...) เช่น:
   - `admin` | `password123` | `Administrator`
   - `trader` | `trade2026` | `Trader`

---

## ขั้นตอนที่ 2: ติดตั้งและ Deploy Google Apps Script
1. ไปที่เว็บไซต์ [Google Apps Script (script.google.com)](https://script.google.com) และเปิดโครงการของคุณที่มี ID: `1TjKh5CnXTW59xegOYNZbAGnkMsvQYE00Qz_T_nmwrDruXEvMsZBmL_xl`
2. ลบโค้ดเดิมทั้งหมดในไฟล์ `รหัส.gs` (หรือ `Code.gs`) และวางโค้ดชุดนี้ลงไปแทน:

```javascript
function doPost(e) {
  // ID ของ Google Sheets ของคุณ
  var sheetId = "11N8winbGyNa6nm8rx_4DUj2zzVM49j5OJ1ipPo6_kd4";
  
  var responseHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  
  var requestData;
  try {
    requestData = JSON.parse(e.postData.contents);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      message: "รูปแบบข้อมูล JSON ไม่ถูกต้อง" 
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(responseHeaders);
  }
  
  var reqUsername = requestData.username;
  var reqPassword = requestData.password;
  
  if (!reqUsername || !reqPassword) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      message: "กรุณากรอก Username และ Password" 
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(responseHeaders);
  }
  
  var sheet = SpreadsheetApp.openById(sheetId).getSheetByName("Users");
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      message: "ไม่พบชีตชื่อ 'Users' ใน Google Sheets กรุณาสร้างชีตนี้ก่อน" 
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(responseHeaders);
  }
  
  var data = sheet.getDataRange().getValues();
  
  // ค้นหา username และ password ในตาราง
  for (var i = 1; i < data.length; i++) {
    var dbUsername = String(data[i][0]).trim();
    var dbPassword = String(data[i][1]).trim();
    var dbRole = String(data[i][2]).trim();
    
    if (dbUsername === reqUsername && dbPassword === reqPassword) {
      // สร้าง token สุ่มสำหรับใช้ยืนยันเซสชันชั่วคราว
      var token = Utilities.base64Encode(Utilities.computeDigest(
        Utilities.DigestAlgorithm.SHA_256, 
        dbUsername + Date.now().toString()
      ));
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        username: dbUsername,
        role: dbRole || "User",
        token: token
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(responseHeaders);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ 
    success: false, 
    message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" 
  }))
  .setMimeType(ContentService.MimeType.JSON)
  .setHeaders(responseHeaders);
}

// เพิ่มการตอบกลับแบบ OPTIONS สำหรับหลีกเลี่ยงข้อผิดพลาด CORS (Cross-Origin Resource Sharing)
function doOptions(e) {
  var responseHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(responseHeaders);
}

function doGet(e) {
  var responseHeaders = {
    "Access-Control-Allow-Origin": "*"
  };
  return ContentService.createTextOutput(JSON.stringify({ 
    status: "active", 
    message: "Google Apps Script Auth API พร้อมใช้งานแล้ว" 
  }))
  .setMimeType(ContentService.MimeType.JSON)
  .setHeaders(responseHeaders);
}
```

3. กดปุ่ม **บันทึกโครงการ (รูปแผ่นดิสก์)** 💾
4. ทำการเผยแพร่แอป (Deploy):
   - คลิกปุ่ม **ทำให้ใช้งานได้ (Deploy)** ที่แถบเมนูด้านบน -> เลือก **การจัดการการทำให้ใช้งานได้ใหม่... (New Deployment)**
   - คลิกไอคอนฟันเฟือง ⚙️ ข้างคำว่า "เลือกประเภท" -> เลือก **เว็บแอป (Web App)**
   - ตั้งค่าตามนี้:
     - **คำอธิบาย (Description)**: `Auth API v1`
     - **เรียกใช้งานในฐานะ (Execute as)**: เลือก **ฉัน (Me - อีเมล Google ของคุณ)**
     - **ผู้ที่เข้าถึงได้ (Who has access)**: เลือก **ทุกคน (Anyone)** (สำคัญมาก: หากไม่เลือกทุกคน ระบบ Cloudflare จะไม่สามารถเชื่อมเข้ามาได้)
   - คลิกปุ่ม **ทำให้ใช้งานได้ (Deploy)**
   - หลังจากโหลดเสร็จ ระบบจะแสดง **URL เว็บแอป (Web App URL)** ที่ลงท้ายด้วย `/exec`
   - **กรุณาคัดลอก URL นั้นเก็บไว้** เพื่อใช้นำไปเชื่อมต่อในไฟล์ตั้งค่าของเว็บแดชบอร์ดครับ
