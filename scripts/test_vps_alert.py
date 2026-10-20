#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Onicorn Trade - VPS Telegram Alert Test Script
Tests connectivity to Telegram Bot and sends an immediate test notification.
"""

import sys
import os
import json
import ssl
import urllib.request
from datetime import datetime, timezone, timedelta

BKK_TZ = timezone(timedelta(hours=7))

def get_bkk_now():
    return datetime.now(BKK_TZ)

def main():
    print("=" * 60)
    print("🔔 Onicorn Trade - Telegram Alert Connection Test")
    print(f"⏰ Server Bangkok Time: {get_bkk_now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # 1. Fetch credentials
    print("\n[1/3] 📡 Fetching Telegram credentials from Onicorn Trade Web API...")
    token = ""
    chat_id = ""

    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        url = "https://onicorn-trade.pages.dev/api/settings"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 Onicorn-AlertTest/1.0"})
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                settings = data.get("settings", {})
                token = str(settings.get("telegram_bot_token", "")).strip()
                chat_id = str(settings.get("telegram_chat_id", "")).strip()
    except Exception as e:
        print(f"   ⚠️ Could not fetch from Web API ({e})")

    if not token or not chat_id:
        token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
        chat_id = os.environ.get("TELEGRAM_CHAT_ID", "").strip()

    if not token or not chat_id:
        print("\n❌ ERROR: Telegram Bot Token หรือ Chat ID ยังไม่ได้ตั้งค่า!")
        print("   กรุณาไปที่เว็บ onicorn-trade.pages.dev > 'ตั้งค่าระบบ' เพื่อระบุ Token และ Chat ID")
        return False

    print(f"   ✅ Credentials found! (Chat ID: {chat_id})")

    # 2. Test getMe
    print("\n[2/3] 🤖 Connecting to Telegram Bot API...")
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    try:
        me_url = f"https://api.telegram.org/bot{token}/getMe"
        req = urllib.request.Request(me_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            me_data = json.loads(resp.read().decode("utf-8"))
            if me_data.get("ok"):
                bot_user = me_data["result"]
                print(f"   ✅ Connected as: {bot_user.get('first_name')} (@{bot_user.get('username')})")
            else:
                print(f"   ❌ Telegram API returned error: {me_data}")
                return False
    except Exception as e:
        print(f"   ❌ Failed to connect to Telegram Bot API: {e}")
        return False

    # 3. Send test message
    print("\n[3/3] 📤 Sending test message to Telegram...")
    now_str = get_bkk_now().strftime("%Y-%m-%d %H:%M:%S")
    test_msg = (
        f"🔔 <b>[Onicorn Trade] ทดสอบระบบแจ้งเตือนสำเร็จ!</b>\n"
        f"━━━━━━━━━━━━━━━━━━━━━\n"
        f"✅ <b>สถานะ VPS:</b> ทำงานปกติ (Task Scheduler และ Script พร้อมใช้งาน)\n"
        f"⏰ <b>เวลาทดสอบ:</b> {now_str} น. (เวลาไทย)\n\n"
        f"📅 <b>กำหนดการแจ้งเตือนอัตโนมัติประจำวัน:</b>\n"
        f"• 🌅 <b>07:45 น.</b> สรุปตลาดรอบเช้า (Morning Briefing)\n"
        f"• 🛢️ <b>08:00 น.</b> กราฟบทวิเคราะห์น้ำมันดิบ (ทุกวันอังคาร)\n"
        f"• ⚡ <b>14:35 น.</b> Intraday Breakout & Volume Alert (รอบบ่าย)\n"
        f"• 📊 <b>17:20 น.</b> สรุปตลาดรอบเย็น (Market Wrap)\n"
        f"━━━━━━━━━━━━━━━━━━━━━\n"
        f"🔗 <i>ส่งจากระบบ Onicorn Alert Engine บนเครื่อง VPS</i>"
    )

    try:
        send_url = f"https://api.telegram.org/bot{token}/sendMessage"
        payload = json.dumps({
            "chat_id": chat_id,
            "text": test_msg,
            "parse_mode": "HTML",
            "disable_web_page_preview": True
        }).encode("utf-8")

        req = urllib.request.Request(send_url, data=payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, context=ctx, timeout=12) as resp:
            send_res = json.loads(resp.read().decode("utf-8"))
            if send_res.get("ok"):
                print("\n" + "=" * 60)
                print("🎉 SUCCESS! ข้อความทดสอบถูกส่งเข้า Telegram เรียบร้อยแล้ว!")
                print("   เปิดแอป Telegram เพื่อตรวจสอบข้อความได้เลยครับ")
                print("=" * 60)
                return True
            else:
                print(f"\n❌ Send failed: {send_res}")
                return False
    except Exception as e:
        print(f"\n❌ Failed to send message: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
