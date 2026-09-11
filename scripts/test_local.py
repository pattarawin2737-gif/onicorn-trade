#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Local Test Helper: Verify Telegram Bot Token & Chat ID
Usage:
    python scripts/test_local.py <BOT_TOKEN> <CHAT_ID>
"""

import sys
import os
import json
import urllib.request

def test_telegram_connection(token, chat_id):
    print("=" * 60)
    print("🔍 Testing Telegram Bot Connection...")
    print("=" * 60)

    # 1. Test getMe
    get_me_url = f"https://api.telegram.org/bot{token}/getMe"
    try:
        req = urllib.request.Request(get_me_url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("ok"):
                bot_user = data["result"]
                print(f"✅ Bot Connected Successfully!")
                print(f"   Name: {bot_user.get('first_name')}")
                print(f"   Username: @{bot_user.get('username')}")
            else:
                print(f"❌ Error: {data}")
                return False
    except Exception as e:
        print(f"❌ Failed to connect to bot: {e}")
        return False

    # 2. Test sending a message
    send_url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = json.dumps({
        "chat_id": chat_id,
        "text": (
            "🔔 <b>ทดสอบการเชื่อมต่อ Telegram Bot สำเร็จ!</b>\n\n"
            "ระบบแจ้งเตือน <b>Onicorn Trade Alert System</b> พร้อมทำงานแล้วครับ\n"
            "• 🌟 สรุปข่าวทองคำ (XAU/USD): ทุกวันจันทร์ - ศุกร์ เวลา 08:00 น.\n"
            "• 🛢️ แคปจอกราฟน้ำมัน WTI: ทุกวันอังคาร เวลา 08:00 น."
        ),
        "parse_mode": "HTML"
    }).encode("utf-8")

    try:
        req = urllib.request.Request(send_url, data=payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("ok"):
                print(f"✅ Test message sent successfully to Chat ID: {chat_id}")
                return True
            else:
                print(f"❌ Send message failed: {data}")
                return False
    except Exception as e:
        print(f"❌ Error sending test message: {e}")
        return False

if __name__ == "__main__":
    token = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = sys.argv[2] if len(sys.argv) > 2 else os.environ.get("TELEGRAM_CHAT_ID")

    if not token or not chat_id:
        print("วิธีใช้งาน:")
        print("  python scripts/test_local.py <TELEGRAM_BOT_TOKEN> <TELEGRAM_CHAT_ID>")
        print("หรือตั้งค่า Environment Variables:")
        print("  export TELEGRAM_BOT_TOKEN='your_token'")
        print("  export TELEGRAM_CHAT_ID='your_chat_id'")
        print("  python scripts/test_local.py")
        sys.exit(1)

    test_telegram_connection(token, chat_id)
