-- สคริปต์สร้างตารางสำหรับ Cloudflare D1 SQL Database

-- ตารางเก็บบันทึกประวัติการล็อกอิน (Session Log Audit)
CREATE TABLE IF NOT EXISTS user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  login_time TEXT DEFAULT (datetime('now', 'localtime')),
  ip_address TEXT,
  user_agent TEXT
);

-- ตารางเก็บค่าการตั้งค่าต่างๆ ของเว็บแอป (เช่น โหมดมืด โหมดสว่าง หรือชีต ID เพิ่มเติม)
CREATE TABLE IF NOT EXISTS app_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT
);

-- เพิ่มค่าเริ่มต้น
INSERT OR IGNORE INTO app_settings (setting_key, setting_value) 
VALUES ('default_sheet_id', '11N8winbGyNa6nm8rx_4DUj2zzVM49j5OJ1ipPo6_kd4');

-- ตารางบันทึกการเทรดของผู้ใช้แต่ละคน (User Trade Logs)
CREATE TABLE IF NOT EXISTS user_trades (
  id TEXT NOT NULL,
  username TEXT NOT NULL,
  trade_data TEXT NOT NULL, -- เก็บ JSON string ของออเดอร์
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  PRIMARY KEY (id, username)
);

-- ตารางบันทึก ID ออเดอร์ของชีตที่ถูกผู้ใช้ลบ (Deleted Sheet Trades)
CREATE TABLE IF NOT EXISTS user_deleted_trades (
  trade_id TEXT NOT NULL,
  username TEXT NOT NULL,
  deleted_at TEXT DEFAULT (datetime('now', 'localtime')),
  PRIMARY KEY (trade_id, username)
);
