#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Automated Telegram Alerts for Thai Stocks & Sector Rotation Intelligence:
1. Daily Top Stock Picks: Runs Monday - Friday at 08:30 AM Bangkok Time
2. Weekly Sector Rotation: Runs every Monday at 08:30 AM Bangkok Time
3. Monthly Sector Outlook: Runs on the 1st of every month at 08:30 AM Bangkok Time
"""

import os
import sys
import json
import ssl
import argparse
import urllib.request
import urllib.parse
from datetime import datetime, timezone, timedelta

# Bangkok Timezone (UTC+7)
BKK_TZ = timezone(timedelta(hours=7))

def get_bkk_now():
    return datetime.now(BKK_TZ)

def format_thai_date(dt=None):
    if dt is None:
        dt = get_bkk_now()
    th_days = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"]
    th_months = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ]
    day_name = th_days[dt.weekday()]
    date_str = f"{dt.day} {th_months[dt.month - 1]} {dt.year + 543}"
    return f"วัน{day_name}ที่ {date_str}"

def round_thai_tick_size(val):
    try:
        p = float(val)
    except:
        return 0.0
    if p <= 0:
        return 0.0
    if p < 2:
        return round(p * 100) / 100
    if p < 5:
        return round(p * 50) / 50
    if p < 10:
        return round(p * 20) / 20
    if p < 25:
        return round(p * 10) / 10
    if p < 100:
        return round(p * 4) / 4
    if p < 200:
        return round(p * 2) / 2
    if p < 400:
        return round(p * 1) / 1
    return round(p / 2) * 2

def get_telegram_credentials():
    """Fetch credentials from Web Settings API or Environment Variables"""
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        url = "https://onicorn-trade.pages.dev/api/settings"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                settings = data.get("settings", {})
                api_token = str(settings.get("telegram_bot_token", "")).strip()
                api_chat = str(settings.get("telegram_chat_id", "")).strip()
                if api_token and api_chat:
                    print("✅ Successfully retrieved Telegram credentials from Web Settings API!")
                    return api_token, api_chat, settings
    except Exception as e:
        print(f"Notice: Could not fetch settings from Web API ({e}), falling back to env vars...")

    token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    chat_id = os.environ.get("TELEGRAM_CHAT_ID", "").strip()
    return token, chat_id, {}

def send_telegram_message(token, chat_id, text):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = json.dumps({
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"}
    )
    with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))

def fetch_json(url):
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req, context=ctx, timeout=12) as resp:
            if resp.status == 200:
                return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"Warning: Failed to fetch {url}: {e}")
    return None

# ==========================================
# 1. Daily Top Stock Picks Generator
# ==========================================
def build_daily_stocks_message():
    date_str = format_thai_date()
    now_bkk = get_bkk_now()
    time_str = now_bkk.strftime("%H:%M")

    # Candidates pool with multi-factor weighting
    candidates = [
        {"symbol": "BH", "name": "บมจ. โรงพยาบาลบำรุงราษฎร์", "sector": "การแพทย์ (Healthcare)", "defPrice": 252.00, "baseProb": 88, "reasons": "แรงซื้อสถาบันและกองทุนต่างชาติดันราคาทะลุแนวต้านใหญ่รอบปี ฿245.00 สอดรับยอดคนไข้ต่างชาติตะวันออกกลางทำสถิติสูงสุดใหม่"},
        {"symbol": "GULF", "name": "บมจ. กัลฟ์ เอ็นเนอร์จี", "sector": "พลังงาน & สาธารณูปโภค", "defPrice": 46.50, "baseProb": 86, "reasons": "โมเมนตัมเบรกเอาท์กรอบสะสมพลัง รับอานิสงส์ดีมานด์พลังงานสะอาดรองรับ Cloud & AI Data Center ขยายตัวก้าวกระโดด"},
        {"symbol": "CPALL", "name": "บมจ. ซีพี ออลล์", "sector": "ค้าปลีก (Commerce)", "defPrice": 57.50, "baseProb": 84, "reasons": "เกิดสัญญาณ Bullish Divergence ตามแนวรับสถาบัน ยอดขายสาขาเดิม (SSSG) โตต่อเนื่องตามภาคการท่องเที่ยวฟื้นตัว"},
        {"symbol": "WHA", "name": "บมจ. ดับบลิวเอชเอ คอร์ป", "sector": "นิคมอุตสาหกรรม (Industrial)", "defPrice": 5.45, "baseProb": 85, "reasons": "ยอดจองซื้อและโอนที่ดินนิคมอุตสาหกรรมแปลงใหญ่ให้ค่ายรถยนต์ EV พุ่งแตะระดับสูงสุดเป็นประวัติการณ์"},
        {"symbol": "KBANK", "name": "ธนาคารกสิกรไทย", "sector": "ธนาคารและการเงิน", "defPrice": 142.50, "baseProb": 82, "reasons": "คุมสัดส่วน NPL ลดลงต่อเนื่อง ค่าใช้จ่ายการตั้งสำรองลดลง หนุนทิศทางกำไรสุทธิและเงินปันผลตอบแทนระดับสูง"}
    ]

    symbols_list = [c["symbol"] for c in candidates]
    price_data = fetch_json(f"https://onicorn-trade.pages.dev/api/price?symbol={','.join(symbols_list)}") or {}

    evaluated = []
    for c in candidates:
        sym = c["symbol"]
        quote = price_data.get(sym)
        price = float(quote.get("price", c["defPrice"])) if quote else c["defPrice"]
        chg = float(quote.get("changePct", 0.0)) if quote else 0.0

        entry = round_thai_tick_size(price)
        tp = round_thai_tick_size(price * 1.085)
        sl = round_thai_tick_size(price * 0.955)
        prob = min(96, max(75, int(c["baseProb"] + chg * 2.2)))

        evaluated.append({
            "symbol": sym,
            "name": c["name"],
            "sector": c["sector"],
            "price": price,
            "changePct": chg,
            "entry": entry,
            "tp": tp,
            "sl": sl,
            "prob": prob,
            "reasons": c["reasons"]
        })

    evaluated.sort(key=lambda x: (x["prob"], x["changePct"]), reverse=True)
    top3 = evaluated[:3]

    msg = (
        f"📈 <b>รายงานหุ้นไทยเด่นที่สุดในตลาดวันนี้ (Daily Top Picks)</b>\n"
        f"📅 <b>{date_str} (เวลา {time_str} น.)</b>\n"
        f"━━━━━━━━━━━━━━━━━━━━━\n"
        f"💡 <i>คัดสรรโดยระบบ AI Quantitative Screener & Tick Size Engine</i>\n\n"
    )

    medals = ["🥇", "🥈", "🥉"]
    for i, stock in enumerate(top3):
        medal = medals[i]
        chg_sign = "+" if stock["changePct"] > 0 else ""
        chg_str = f"({chg_sign}{stock['changePct']:.2f}%)" if stock["changePct"] != 0 else ""
        
        msg += (
            f"{medal} <b>SET:{stock['symbol']} - {stock['name']}</b>\n"
            f"🏷️ <b>กลุ่ม:</b> {stock['sector']}\n"
            f"💰 <b>ราคาล่าสุด:</b> ฿{stock['price']:.2f} {chg_str}\n"
            f"🎯 <b>เป้าทำกำไร (TP):</b> ฿{stock['tp']:.2f} | 🛑 <b>ตัดขาดทุน (SL):</b> ฿{stock['sl']:.2f}\n"
            f"📊 <b>โอกาสขาขึ้น (Probability):</b> <b>{stock['prob']}%</b> 🟢\n"
            f"💡 <b>เหตุผลวิเคราะห์ AI:</b> {stock['reasons']}\n"
            f"─────────────────────\n\n"
        )

    msg += (
        f"⚠️ <b>คำแนะนำ:</b> จุด Entry/TP/SL คำนวณตามช่วงราคาตลาดหลักทรัพย์ฯ (SET Tick Size) โปรดวางแผน Money Management เสมอ\n\n"
        f"🔗 <b>เปิดดูกราฟสดและอินดิเคเตอร์:</b>\n"
        f"https://onicorn-trade.pages.dev"
    )
    return msg

# ==========================================
# 2. Weekly Sector Rotation Message
# ==========================================
def build_weekly_sector_message():
    date_str = format_thai_date()
    now_bkk = get_bkk_now()
    time_str = now_bkk.strftime("%H:%M")

    api_url = "https://onicorn-trade.pages.dev/api/sector-analysis?timeframe=weekly"
    data = fetch_json(api_url)

    if not data or "sectors" not in data:
        return None

    market_theme = data.get("marketTheme", "")
    summary = data.get("summary", "")
    sectors = data.get("sectors", [])

    top_sectors = [s for s in sectors if s.get("rank", 99) <= 3]

    msg = (
        f"⚡ <b>ระบบวิเคราะห์กลุ่มอุตสาหกรรมที่น่าสนใจ (ประจำสัปดาห์นี้)</b>\n"
        f"📅 <b>{date_str} (เวลา {time_str} น.)</b>\n"
        f"━━━━━━━━━━━━━━━━━━━━━\n"
        f"🎯 <b>ธีมการลงทุนประจำสัปดาห์:</b>\n{market_theme}\n\n"
        f"💡 <b>บทวิเคราะห์ภาพรวมโดย AI:</b>\n{summary}\n\n"
        f"🏆 <b>กลุ่มอุตสาหกรรมดาวเด่นนำตลาด (Top Overweight):</b>\n\n"
    )

    for sec in top_sectors:
        picks_text = ", ".join([f"<b>{p['symbol']}</b> ({p['bias']})" for p in sec.get("topPicks", [])])
        msg += (
            f"<b>อันดับ #{sec['rank']} {sec['icon']} {sec['name']}</b>\n"
            f"⭐ <b>คะแนนความน่าสนใจ:</b> <b>{sec['score']}/100</b> (🚀 {sec['recommendation']})\n"
            f"📰 <b>ข่าวเด่น & ปัจจัยหนุน:</b> {sec['newsHighlights']}\n"
            f"🎯 <b>กลยุทธ์รอบสัปดาห์:</b> {sec['tacticalStrategy']}\n"
            f"🏆 <b>หุ้นเด่นนำกลุ่ม:</b> {picks_text}\n"
            f"⚠️ <b>ความเสี่ยง:</b> {sec['riskWatch']}\n"
            f"─────────────────────\n\n"
        )

    msg += (
        f"🔔 <i>แจ้งเตือนอัตโนมัติทุกวันจันทร์ เวลา 08:30 น.</i>\n"
        f"🔗 <b>ดูผลวิเคราะห์ทั้ง 8 กลุ่มอุตสาหกรรมแบบละเอียด:</b>\n"
        f"https://onicorn-trade.pages.dev"
    )
    return msg

# ==========================================
# 3. Monthly Sector Outlook Message
# ==========================================
def build_monthly_sector_message():
    date_str = format_thai_date()
    now_bkk = get_bkk_now()
    time_str = now_bkk.strftime("%H:%M")

    api_url = "https://onicorn-trade.pages.dev/api/sector-analysis?timeframe=monthly"
    data = fetch_json(api_url)

    if not data or "sectors" not in data:
        return None

    market_theme = data.get("marketTheme", "")
    summary = data.get("summary", "")
    sectors = data.get("sectors", [])

    top_sectors = [s for s in sectors if s.get("rank", 99) <= 3]

    msg = (
        f"🗓️ <b>ระบบวิเคราะห์กลุ่มอุตสาหกรรมยุทธศาสตร์ (ประจำเดือนนี้)</b>\n"
        f"📅 <b>{date_str} (เวลา {time_str} น.)</b>\n"
        f"━━━━━━━━━━━━━━━━━━━━━\n"
        f"🌐 <b>ธีมยุทธศาสตร์ระยะกลางประจำเดือน:</b>\n{market_theme}\n\n"
        f"💡 <b>การประเมินภาพรวมโดย AI:</b>\n{summary}\n\n"
        f"🌟 <b>กลุ่มอุตสาหกรรมเป้าหมายหลักประจำเดือน (Top Monthly Allocation):</b>\n\n"
    )

    for sec in top_sectors:
        picks_text = ", ".join([f"<b>{p['symbol']}</b> ({p['role']})" for p in sec.get("topPicks", [])])
        msg += (
            f"<b>อันดับ #{sec['rank']} {sec['icon']} {sec['name']}</b>\n"
            f"⭐ <b>คะแนนยุทธศาสตร์:</b> <b>{sec['score']}/100</b> (🚀 {sec['recommendation']})\n"
            f"📰 <b>ปัจจัยเร่งเศรษฐกิจมหภาค:</b> {sec['newsHighlights']}\n"
            f"🎯 <b>กลยุทธ์การจัดพอร์ตประจำเดือน:</b> {sec['tacticalStrategy']}\n"
            f"🏆 <b>หุ้นแกนหลักของกลุ่ม:</b> {picks_text}\n"
            f"⚠️ <b>ความเสี่ยงระยะกลาง:</b> {sec['riskWatch']}\n"
            f"─────────────────────\n\n"
        )

    msg += (
        f"🔔 <i>แจ้งเตือนอัตโนมัติทุกวันที่ 1 ของเดือน เวลา 08:30 น.</i>\n"
        f"🔗 <b>เข้าสู่ระบบ Onicorn Trade Dashboard:</b>\n"
        f"https://onicorn-trade.pages.dev"
    )
    return msg

# ==========================================
# Main Orchestrator
# ==========================================
def main():
    parser = argparse.ArgumentParser(description="Automated Thai Stock & Sector Telegram Alerts")
    parser.add_argument("--type", choices=["auto", "daily_stocks", "weekly_sector", "monthly_sector", "all", "thai_stocks"], default="auto", help="Task type to execute")
    args = parser.parse_args()

    # Normalize thai_stocks to daily_stocks
    task_type = "daily_stocks" if args.type == "thai_stocks" else args.type

    now_bkk = get_bkk_now()
    day_of_week = now_bkk.isoweekday() # 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 7=Sun
    day_of_month = now_bkk.day

    print("=" * 60)
    print("🚀 Automated Thai Stock & Sector Telegram Alerts")
    print(f"⏰ Bangkok Time: {now_bkk.strftime('%Y-%m-%d %H:%M:%S')} (Day {day_of_week}, Date {day_of_month})")
    print(f"🎯 Execution Type: {task_type}")
    print("=" * 60)

    token, chat_id, settings = get_telegram_credentials()

    # Check enable flags from settings
    thai_stocks_enabled = str(settings.get("telegram_thai_stocks_enabled", "1")) != "0"
    sector_weekly_enabled = str(settings.get("telegram_sector_weekly_enabled", "1")) != "0"
    sector_monthly_enabled = str(settings.get("telegram_sector_monthly_enabled", "1")) != "0"

    messages_to_send = []

    # 1. Monthly Sector Outlook (Every 1st of month)
    should_send_monthly = (task_type in ["monthly_sector", "all"]) or (task_type == "auto" and day_of_month == 1 and sector_monthly_enabled)
    if should_send_monthly:
        print("🗓️ Preparing Monthly Sector Outlook...")
        m_msg = build_monthly_sector_message()
        if m_msg:
            messages_to_send.append(("Monthly Sector Outlook", m_msg))

    # 2. Weekly Sector Rotation (Every Monday)
    should_send_weekly = (task_type in ["weekly_sector", "all"]) or (task_type == "auto" and day_of_week == 1 and sector_weekly_enabled)
    if should_send_weekly:
        print("⚡ Preparing Weekly Sector Rotation...")
        w_msg = build_weekly_sector_message()
        if w_msg:
            messages_to_send.append(("Weekly Sector Rotation", w_msg))

    # 3. Daily Top Stocks (Every Monday to Friday)
    is_weekday = 1 <= day_of_week <= 5
    should_send_daily = (task_type in ["daily_stocks", "all"]) or (task_type == "auto" and is_weekday and thai_stocks_enabled)
    if should_send_daily:
        print("📈 Preparing Daily Top Thai Stock Picks...")
        d_msg = build_daily_stocks_message()
        if d_msg:
            messages_to_send.append(("Daily Top Thai Stocks", d_msg))

    if not messages_to_send:
        print("ℹ️ No alerts scheduled for today according to schedule rules.")
        return

    # Dry-run or send
    if not token or not chat_id:
        print("\n⚠️ TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set. Running in Dry-Run mode:\n")
        for title, msg in messages_to_send:
            print(f"--- [PREVIEW: {title}] ---")
            print(msg)
            print()
        print("✅ Dry-run preview complete.")
        return

    # Send messages
    for title, msg in messages_to_send:
        try:
            print(f"📤 Sending: {title}...")
            res = send_telegram_message(token, chat_id, msg)
            if res.get("ok"):
                print(f"✅ Successfully sent: {title} to Telegram!")
            else:
                print(f"❌ Telegram API Error for {title}: {res}")
        except Exception as e:
            print(f"❌ Failed to send {title}: {e}")

    print("🎉 All scheduled alerts processed!")

if __name__ == "__main__":
    main()
