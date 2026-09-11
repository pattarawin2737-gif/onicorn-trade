# คู่มือการติดตั้ง (Deploy) เว็บแอปขึ้น Cloudflare Pages & D1 Database

เมื่อเตรียม Google Sheets และติดตั้ง Apps Script เรียบร้อยตามคู่มือแรกแล้ว ขั้นตอนต่อไปนี้คือการติดตั้งตัวเว็บแอปพลิเคชันและฐานข้อมูล D1 ขึ้นบนเซิร์ฟเวอร์ของ Cloudflare ครับ

---

## ขั้นตอนที่ 1: เข้าสู่ระบบ Cloudflare ในเครื่องของคุณ
เปิด Terminal ในโฟลเดอร์โปรเจกต์ `dashboard` และพิมพ์คำสั่งนี้เพื่อล็อกอินเข้าบัญชี Cloudflare ของคุณ:
```bash
npx wrangler@3 login
```
*เบราว์เซอร์จะเปิดขึ้นมาเพื่อให้คุณกดยืนยันการอนุญาตเข้าใช้งานบัญชี*

---

## ขั้นตอนที่ 2: สร้างฐานข้อมูล D1 บน Cloudflare Cloud
หลังจากล็อกอินแล้ว ให้รันคำสั่งนี้เพื่อสร้างฐานข้อมูลจริงบนเซิร์ฟเวอร์ Cloudflare:
```bash
npx wrangler@3 d1 create forex_trade_db
```
เมื่อสร้างเสร็จ ระบบจะแสดงข้อความในลักษณะนี้บนหน้าจอ:
```toml
[[d1_databases]]
binding = "DB"
database_name = "forex_trade_db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```
### อัปเดตไฟล์ตั้งค่า:
1. เปิดไฟล์ `wrangler.toml` ในโฟลเดอร์ `dashboard`
2. นำรหัส `database_id` ที่ได้ (แทนที่ `xxxxxxxx-...`) ไปใส่ในช่อง `database_id` ในไฟล์แทนรหัสเดิม

---

## ขั้นตอนที่ 3: อัปโหลดโครงสร้างตารางข้อมูล (Schema) ไปยังฐานข้อมูล Cloud
รันคำสั่งนี้เพื่อให้ระบบอัปโหลดและสร้างตารางต่างๆ (`user_sessions`, `app_settings`) บนคลาวด์ D1 ของคุณ:
```bash
npx wrangler@3 d1 execute forex_trade_db --remote --file=schema.sql
```
*พิมพ์ `y` ยืนยันหากระบบถามคำถามเพื่อรันสคริปต์*

---

## ขั้นตอนที่ 4: สร้างไฟล์ Build และสั่ง Deploy เว็บไซต์
1. ทำการ Build โปรเจกต์ให้เป็นไฟล์พร้อมใช้งาน:
   ```bash
   npm run build
   ```
2. ทำการ Deploy โฟลเดอร์ `dist` ขึ้น Cloudflare Pages:
   ```bash
   npx wrangler@3 pages deploy dist --project-name=forex-trade-dashboard
   ```
   *หมายเหตุ: หากเป็นการ Deploy ครั้งแรก ระบบจะถามว่าจะสร้างโปรเจกต์ใหม่หรือไม่ ให้กดตกลงสร้างโปรเจกต์ได้เลยครับ*
   *เมื่อการ Deploy เสร็จสิ้น ระบบจะให้ URL สำหรับเข้าใช้งานเว็บไซต์ของคุณ (เช่น `https://forex-trade-dashboard.pages.dev`)*

---

## ขั้นตอนที่ 5: ผูก (Bind) ฐานข้อมูล D1 เข้ากับเว็บไซต์บน Dashboard ของ Cloudflare
เพื่อให้ระบบหลังบ้าน Pages Functions ดึงประวัติล็อกอินจาก D1 ได้ คุณต้องไปเชื่อมต่อ D1 บนหน้าเว็บ Cloudflare:
1. เข้าเว็บไซต์ [dash.cloudflare.com](https://dash.cloudflare.com)
2. ไปที่เมนู **Workers & Pages** -> เลือกโปรเจกต์ของคุณชื่อ **`forex-trade-dashboard`**
3. ไปที่แท็บ **Settings (การตั้งค่า)** -> เลือกหัวข้อ **Functions**
4. เลื่อนลงมาที่หัวข้อ **D1 database bindings (การเชื่อมต่อฐานข้อมูล D1)** -> คลิกปุ่ม **Add binding (เพิ่มการเชื่อมต่อ)**
5. กรอกข้อมูลดังนี้:
   - **Variable name (ชื่อตัวแปร)**: กรอกคำว่า **`DB`** (ต้องสะกดตัวพิมพ์ใหญ่ตรงเป๊ะ เพื่อให้โค้ดหลังบ้านรู้จัก)
   - **D1 database (ฐานข้อมูล D1)**: เลือก **`forex_trade_db`** ที่สร้างขึ้นในขั้นตอนที่ 2
6. กดปุ่ม **Save (บันทึก)**
7. ทำการ Deploy อีกครั้ง หรือกด Deploy ใหม่จากในหน้าแดชบอร์ดเพื่อให้การตั้งค่ามีผล

---

## การเปิดเซิร์ฟเวอร์ทดสอบในเครื่องคอมพิวเตอร์ของคุณ (Local Testing)
คุณสามารถรันและจำลองระบบเว็บไซต์ทั้งหมด (ทั้งหน้าบ้านและระบบ D1 Database จำลองในเครื่อง) ก่อนที่จะติดตั้งจริง โดยรันคำสั่ง:
```bash
npx wrangler@3 pages dev dist --d1=DB --port=8788
```
และเข้าใช้งานที่ลิงก์ [http://localhost:8788](http://localhost:8788) ครับ
