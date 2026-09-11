#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Automated Telegram Alert: Oil Analysis Chart Screenshot (WTI Crude Oil)
Runs every Tuesday at 08:00 AM Bangkok Time (UTC+7)
Captures screenshot of "กราฟสด investing.com: 🛢️ WTI Crude Oil" and sends to Telegram.
"""

import os
import sys
import json
import urllib.request
import urllib.parse
from datetime import datetime, timezone, timedelta

# Bangkok Timezone (UTC+7)
BKK_TZ = timezone(timedelta(hours=7))

def get_thai_weekday_and_date():
    now = datetime.now(BKK_TZ)
    th_days = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"]
    th_months = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ]
    day_name = th_days[now.weekday()]
    date_str = f"{now.day} {th_months[now.month - 1]} {now.year + 543}"
    return f"วัน{day_name}ที่ {date_str}"

def capture_oil_chart_screenshot(output_path="oil_wti_chart.png"):
    """
    Use Playwright to capture the WTI Crude Oil chart.
    Tries the live Onicorn Trade dashboard first; falls back to direct Investing chart if needed.
    """
    from playwright.sync_api import sync_playwright

    print("🌐 Launching Playwright browser...")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu"
            ]
        )
        context = browser.new_context(
            viewport={"width": 1400, "height": 900},
            device_scale_factor=2, # Crisp Retina screenshot
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        # Inject session storage for demo login before page loads
        page.add_init_script("""
            sessionStorage.setItem('trader_user', JSON.stringify({username: 'DemoTrader', role: 'Demo Viewer'}));
            sessionStorage.setItem('trader_token', 'demo-token');
        """)

        dashboard_url = "https://onicorn-trade.pages.dev/?tab=oil_analysis"
        captured = False

        try:
            print(f"📡 Navigating to dashboard: {dashboard_url}")
            page.goto(dashboard_url, wait_until="domcontentloaded", timeout=30000)

            # Wait for the oil chart card to appear
            print("⏳ Waiting for oil chart element...")
            page.wait_for_selector("#oil-wti-chart-card", timeout=15000)

            # Wait an additional 5 seconds for chart iframe and candles to render
            page.wait_for_timeout(6000)

            card = page.locator("#oil-wti-chart-card")
            card.screenshot(path=output_path)
            print(f"✅ Successfully captured #oil-wti-chart-card to {output_path}")
            captured = True
        except Exception as e:
            print(f"⚠️ Failed to capture from dashboard ({e}). Trying direct fallback chart...")

        # Fallback: Capture direct investing chart iframe
        if not captured:
            try:
                direct_url = "https://ssltvc.investing.com/?pair_ID=8849&height=650&width=1100&interval=1440&plotStyle=candles&domain_ID=53&lang_ID=53&timezone_ID=7"
                print(f"📡 Navigating to direct chart: {direct_url}")
                page.goto(
                    direct_url,
                    wait_until="networkidle",
                    timeout=30000,
                    referer="https://th.investing.com/"
                )
                page.wait_for_timeout(5000)
                page.screenshot(path=output_path)
                print(f"✅ Successfully captured direct chart to {output_path}")
                captured = True
            except Exception as e2:
                print(f"❌ Fallback capture failed: {e2}")

        browser.close()
        return captured

def send_telegram_photo(token, chat_id, photo_path, caption):
    """
    Send photo with caption to Telegram using multipart/form-data.
    Uses standard library urllib.
    """
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    url = f"https://api.telegram.org/bot{token}/sendPhoto"

    with open(photo_path, "rb") as f:
        photo_bytes = f.read()

    body = bytearray()

    # chat_id field
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(b'Content-Disposition: form-data; name="chat_id"\r\n\r\n')
    body.extend(f"{chat_id}\r\n".encode("utf-8"))

    # parse_mode field
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(b'Content-Disposition: form-data; name="parse_mode"\r\n\r\n')
    body.extend(b"HTML\r\n")

    # caption field
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(b'Content-Disposition: form-data; name="caption"\r\n\r\n')
    body.extend(f"{caption}\r\n".encode("utf-8"))

    # photo file field
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(b'Content-Disposition: form-data; name="photo"; filename="oil_chart.png"\r\n')
    body.extend(b"Content-Type: image/png\r\n\r\n")
    body.extend(photo_bytes)
    body.extend(b"\r\n")

    # end boundary
    body.extend(f"--{boundary}--\r\n".encode("utf-8"))

    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Content-Length": str(len(body))
        }
    )

    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))

def get_telegram_credentials():
    """
    Retrieve Telegram Bot Token and Chat ID.
    Priority:
    1. Dynamic Settings from Web Dashboard API (https://onicorn-trade.pages.dev/api/settings)
    2. Environment Variables / GitHub Secrets (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)
    """
    token = None
    chat_id = None

    try:
        import ssl
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        url = "https://onicorn-trade.pages.dev/api/settings"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        )
        with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                settings = data.get("settings", {})
                api_token = str(settings.get("telegram_bot_token", "")).strip()
                api_chat = str(settings.get("telegram_chat_id", "")).strip()
                if api_token and api_chat:
                    print("✅ Successfully retrieved Telegram credentials dynamically from Web Settings!")
                    return api_token, api_chat
    except Exception as e:
        print(f"Notice: Could not fetch settings from Web API ({e}), will check environment variables...")

    token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    chat_id = os.environ.get("TELEGRAM_CHAT_ID", "").strip()

    return token, chat_id

def main():
    print("=" * 60)
    print("🚀 Starting Automated Oil Analysis Chart Telegram Alert")
    print(f"⏰ Execution Time (BKK): {datetime.now(BKK_TZ).strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    token, chat_id = get_telegram_credentials()

    date_title = get_thai_weekday_and_date()
    caption = (
        f"🛢️ <b>วิเคราะห์ราคาน้ำมันดิบโลก: WTI Crude Oil</b>\n"
        f"📅 <b>ประจำ{date_title}</b> (รายงานทุกวันอังคาร 08:00 น.)\n"
        f"──────────────────────────\n"
        f"📊 <b>ภาพรวมกราฟสด investing.com: 🛢️ WTI Crude Oil</b>\n"
        f"• แสดงโครงสร้างแท่งเทียนราคาน้ำมันดิบโลกแบบ Daily (D1)\n"
        f"• พร้อมตารางเปรียบเทียบราคาน้ำมันขายปลีกในประเทศไทย (ปั๊ม ปตท. / บางจาก)\n"
        f"──────────────────────────\n"
        f"🤖 <i>ระบบวิเคราะห์และส่งรายงานอัตโนมัติ Onicorn Trade Dashboard</i>\n"
        f"🌐 <a href='https://onicorn-trade.pages.dev/?tab=oil_analysis'>คลิกเพื่อดูกราฟสดและบทวิเคราะห์เต็ม</a>"
    )

    output_path = "oil_wti_chart.png"
    success = capture_oil_chart_screenshot(output_path)

    if not success or not os.path.exists(output_path):
        print("❌ Error: Failed to capture chart screenshot.")
        sys.exit(1)

    print(f"📸 Screenshot saved successfully ({os.path.getsize(output_path)} bytes)")

    if not token or not chat_id:
        print("\n⚠️ TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set. Screenshot generated (dry-run mode).")
        print(f"Caption:\n{caption}")
        return

    print("📤 Sending photo to Telegram...")
    try:
        res = send_telegram_photo(token, chat_id, output_path, caption)
        if res.get("ok"):
            print("🎉 WTI Crude Oil chart screenshot successfully sent to Telegram!")
        else:
            print(f"❌ Telegram API returned error: {res}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Failed to send photo: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
