#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Automated Telegram Alert: Gold News Digest & Market Impact (XAU/USD)
Runs every Monday - Friday at 08:00 AM Bangkok Time (UTC+7)
Fetches all economic events from the dashboard API / Investing.com,
analyzes directional impact on Gold (XAU/USD), and sends formatted HTML to Telegram.
"""

import os
import sys
import re
import json
import urllib.request
import urllib.parse
import ssl
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

def fetch_economic_calendar():
    """Fetch calendar HTML from Onicorn Trade API or directly from Investing.com"""
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    # 1. Try Onicorn Trade API
    urls = [
        "https://onicorn-trade.pages.dev/api/news?tab=today",
    ]

    for url in urls:
        try:
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
                }
            )
            with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
                if resp.status == 200:
                    html_content = resp.read().decode("utf-8", errors="ignore")
                    if "eventRowId_" in html_content or "time" in html_content:
                        print(f"Successfully fetched calendar from {url} ({len(html_content)} bytes)")
                        return html_content
        except Exception as e:
            print(f"Warning: Failed to fetch from {url}: {e}")

    # 2. Fallback direct to Investing.com
    try:
        investing_url = "https://th.investing.com/economic-calendar/Service/getCalendarFilteredData"
        body_data = b"importance[]=2&importance[]=3&timeZone=27&lang_id=18&timeFilter=timeOnly&currentTab=today&limit_from=0"

        req = urllib.request.Request(
            investing_url,
            data=body_data,
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "X-Requested-With": "XMLHttpRequest",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://th.investing.com/economic-calendar/"
            }
        )
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
            json_data = json.loads(resp.read().decode("utf-8", errors="ignore"))
            return json_data.get("data", "")
    except Exception as e:
        print(f"Warning: Direct investing.com fetch failed: {e}")

    return ""

def parse_news_rows(html_content):
    """Parse HTML rows into structured economic event dictionaries"""
    if not html_content:
        return []

    rows = re.findall(r'<tr[^>]*id=\"eventRowId_[^\"]*\"[^>]*>(.*?)</tr>', html_content, re.DOTALL)
    events = []

    for r in rows:
        # Time
        t_match = re.search(r'class=\"[^\"]*time[^\"]*\"[^>]*>(.*?)</td>', r, re.DOTALL)
        time_str = re.sub(r'<[^>]+>', '', t_match.group(1)).strip() if t_match else ''

        # Currency
        c_match = re.search(r'class=\"[^\"]*flagCur[^\"]*\"[^>]*>(.*?)</td>', r, re.DOTALL)
        cur_str = re.sub(r'<[^>]+>', '', c_match.group(1)).replace('&nbsp;', '').strip() if c_match else ''

        # Stars (Importance)
        sentiment_match = re.search(r'class=\"[^\"]*sentiment[^\"]*\"[^>]*>(.*?)</td>', r, re.DOTALL)
        stars = len(re.findall(r'grayFullBullishIcon', sentiment_match.group(1))) if sentiment_match else 0

        # Event title
        ev_match = re.search(r'class=\"[^\"]*event[^\"]*\"[^>]*>(.*?)</td>', r, re.DOTALL)
        event_str = re.sub(r'<[^>]+>', '', ev_match.group(1)).replace('&nbsp;', '').strip() if ev_match else ''
        event_str = re.sub(r'\s+', ' ', event_str)

        # Actual
        act_match = re.search(r'class=\"[^\"]*act[^\"]*\"[^>]*>(.*?)</td>', r, re.DOTALL)
        act_str = re.sub(r'<[^>]+>', '', act_match.group(1)).replace('&nbsp;', '').strip() if act_match else '-'
        if not act_str: act_str = '-'

        # Forecast
        fore_match = re.search(r'class=\"[^\"]*fore[^\"]*\"[^>]*>(.*?)</td>', r, re.DOTALL)
        fore_str = re.sub(r'<[^>]+>', '', fore_match.group(1)).replace('&nbsp;', '').strip() if fore_match else '-'
        if not fore_str: fore_str = '-'

        # Previous
        prev_match = re.search(r'class=\"[^\"]*prev[^\"]*\"[^>]*>(.*?)</td>', r, re.DOTALL)
        prev_str = re.sub(r'<[^>]+>', '', prev_match.group(1)).replace('&nbsp;', '').strip() if prev_match else '-'
        if not prev_str: prev_str = '-'

        if cur_str and event_str and time_str:
            events.append({
                'time': time_str,
                'currency': cur_str,
                'importance': stars,
                'event': event_str,
                'actual': act_str,
                'forecast': fore_str,
                'previous': prev_str
            })

    return events

def analyze_gold_impact(event):
    """
    Generate tailored market impact analysis on XAU/USD for the event.
    """
    ev_lower = event['event'].lower()
    cur = event['currency']

    # 1. Inflation indicators: CPI, PPI, PCE
    if any(k in ev_lower for k in ['cpi', 'ppi', 'pce', 'ดัชนีราคาผู้บริโภค', 'ดัชนีราคาผู้ผลิต']):
        return (
            "• ตัวเลข สูงกว่า คาดการณ์ ➔ บ่งชี้เงินเฟ้อยังสูง ➔ ดอลลาร์แข็งค่า ➔ <b>กดดันทองคำ Spot ย่อตัวลง</b> 🔻\n"
            "• ตัวเลข ต่ำกว่า คาดการณ์ ➔ เงินเฟ้อชะลอตัว ➔ ดอลลาร์อ่อนค่า ➔ <b>หนุนทองคำดีดตัวขึ้นแรง</b> 🟢"
        )

    # 2. Employment: Non-Farm, ADP, Employment Change
    if any(k in ev_lower for k in ['non-farm', 'nfp', 'การจ้างงานนอกภาค', 'adp', 'ตำแหน่งงาน']):
        return (
            "• ตัวเลข สูงกว่า คาดการณ์ ➔ ตลาดแรงงานสหรัฐฯ แข็งแกร่ง ➔ ดอลลาร์แข็ง ➔ <b>ทองคำย่อตัวลง</b> 🔻\n"
            "• ตัวเลข ต่ำกว่า คาดการณ์ ➔ ตลาดแรงงานชะลอตัว ➔ ดอลลาร์อ่อนค่า ➔ <b>หนุนราคาทองคำพุ่งขึ้น</b> 🟢"
        )

    # 3. Jobless Claims / Unemployment Rate
    if any(k in ev_lower for k in ['ว่างงาน', 'jobless', 'สวัสดิการว่างงาน', 'unemployment']):
        return (
            "• ผู้ขอสวัสดิการ สูงกว่า คาดการณ์ ➔ คนตกงานเพิ่มขึ้น ➔ ดอลลาร์อ่อน ➔ <b>หนุนทองคำดีดขึ้น</b> 🟢\n"
            "• ผู้ขอสวัสดิการ ต่ำกว่า คาดการณ์ ➔ ตลาดแรงงานแข็งแกร่ง ➔ ดอลลาร์แข็ง ➔ <b>กดดันทองคำพักฐาน</b> 🔻"
        )

    # 4. Central Bank & Rates: Fed, FOMC, Powell, Lagarde, Interest Rate
    if any(k in ev_lower for k in ['fed', 'fomc', 'powell', 'ดอกเบี้ย', 'rate', 'พาวเวลล์', 'lagarde']):
        return (
            "• ส่งสัญญาณ Hawkish (คง/ตรึงดอกเบี้ยสูง) ➔ ดอลลาร์แข็ง ➔ <b>ทองคำมีโอกาสร่วงลงทดสอบแนวรับ</b> 🔻\n"
            "• ส่งสัญญาณ Dovish (มีโอกาสลดดอกเบี้ย) ➔ ดอลลาร์อ่อน ➔ <b>หนุนทองคำพุ่งทดสอบแนวต้าน</b> 🟢"
        )

    # 5. GDP, Retail Sales, Consumer Confidence, PMI, ISM
    if any(k in ev_lower for k in ['gdp', 'ยอดค้าปลีก', 'retail', 'ism', 'pmi', 'ความเชื่อมั่น', 'existing home']):
        return (
            "• ตัวเลข สูงกว่า คาดการณ์ ➔ เศรษฐกิจสหรัฐฯ ทรงตัวแกร่ง ➔ ดอลลาร์แข็ง ➔ <b>ทองคำปรับฐาน</b> 🔻\n"
            "• ตัวเลข ต่ำกว่า คาดการณ์ ➔ เศรษฐกิจมีสัญญาณชะลอ ➔ ดอลลาร์อ่อน ➔ <b>หนุนทองคำรีบาวด์</b> 🟢"
        )

    # 6. Crude Oil & Energy
    if any(k in ev_lower for k in ['น้ำมัน', 'crude', 'oil', 'opec', 'eia']):
        return (
            "• ส่งผลกระทบต่อราคาน้ำมันโลกและต้นทุนเงินเฟ้อ อาจส่งผลต่อทิศทางค่าเงินดอลลาร์ในระยะสั้น"
        )

    # Default fallback for USD / FX
    if cur == "USD":
        return (
            "• ตัวเลขจริงสูงกว่าคาดการณ์ ➔ หนุนดอลลาร์แข็งค่า ➔ <b>กดดันราคาทองคำ Spot ย่อตัว</b> 🔻\n"
            "• ตัวเลขจริงต่ำกว่าคาดการณ์ ➔ ดอลลาร์อ่อนค่า ➔ <b>หนุนราคาทองคำปรับตัวขึ้น</b> 🟢"
        )

    return "• ส่งผลต่อความผันผวนของค่าเงินและตลาดการเงินโลกในกรอบระยะสั้น"

def build_telegram_messages(events):
    """
    Format events into clean, readable HTML message(s) for Telegram.
    Ensures message length stays within Telegram's 4096 character limit.
    """
    # Filter for Gold (XAU/USD) relevant events (importance >= 2)
    relevant = [
        e for e in events
        if e['importance'] >= 2 and (
            e['currency'] in ['USD', 'USDTHB'] or
            any(k in e['event'].lower() for k in ['fed', 'cpi', 'ppi', 'nfp', 'employment', 'rate', 'ดอกเบี้ย', 'ว่างงาน', 'fomc'])
        )
    ]

    # Sort chronologically by time
    def time_sort_key(ev):
        t = ev['time']
        parts = t.split(':')
        if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
            return int(parts[0]) * 60 + int(parts[1])
        return 9999

    relevant.sort(key=time_sort_key)

    date_title = get_thai_weekday_and_date()
    high_count = sum(1 for e in relevant if e['importance'] == 3)
    med_count = sum(1 for e in relevant if e['importance'] == 2)

    # Header section
    header = (
        f"🌟 <b>สรุปผลวิเคราะห์อิมแพ็คข่าวสารเศรษฐกิจ (AI News Digest)</b>\n"
        f"🏆 <b>ตลาดทองคำโลก (XAU/USD) ประจำ{date_title}</b>\n"
        f"──────────────────────────\n"
    )

    if high_count > 0:
        volatility_box = (
            f"⚠️ <b>แจ้งเตือนความผันผวน (Volatility Warning):</b>\n"
            f"ระวังความผันผวนรุนแรงในตลาดทองคำโลก (XAU/USD)! วันนี้มีข่าวเศรษฐกิจสำคัญระดับ <b>High Impact (★★★) จำนวน {high_count} ข่าว</b> "
            f"และ Medium Impact จำนวน {med_count} ข่าว แนะนำระมัดระวังช่วงเวลาข่าวออกและตั้ง Stop Loss ทุกออเดอร์ 🛡️\n\n"
        )
    else:
        volatility_box = (
            f"ℹ️ <b>สภาวะความผันผวน:</b>\n"
            f"วันนี้ไม่มีข่าวระดับ High Impact ความผันผวนอยู่ในเกณฑ์ปกติ มีข่าวระดับ Medium Impact (★★☆) จำนวน {med_count} ข่าว ตลาดเคลื่อนไหวตามกรอบเทคนิคและแนวรับแนวต้าน\n\n"
        )

    summary_box = (
        f"💡 <b>สรุปภาพรวม (AI Overview):</b>\n"
        f"จากการวิเคราะห์ตารางข่าวสารล่าสุด วันนี้มีเหตุการณ์สำคัญทั้งหมด <b>{len(relevant)} ข่าว</b> ที่ต้องจับตา "
        f"โดยทิศทางค่าเงินดอลลาร์สหรัฐฯ (USD) และตัวเลขเศรษฐกิจช่วงค่ำจะเป็นปัจจัยชี้นำราคาทองคำ Spot โลก\n"
        f"━━━━━━━━━━━━━━━━━━\n"
        f"📋 <b>ตารางวิเคราะห์ข่าวสำคัญ (เรียงตามลำดับเวลา):</b>\n\n"
    )

    import html as html_module

    # Build event cards
    event_blocks = []
    for i, ev in enumerate(relevant, 1):
        star_badge = "🔴 <b>High Impact (★★★)</b>" if ev['importance'] == 3 else "🟡 <b>Medium Impact (★★☆)</b>"
        impact_analysis = analyze_gold_impact(ev)
        safe_event = html_module.escape(str(ev['event'] or ''))
        safe_actual = html_module.escape(str(ev['actual'] or '-'))
        safe_forecast = html_module.escape(str(ev['forecast'] or '-'))
        safe_prev = html_module.escape(str(ev['previous'] or '-'))

        block = (
            f"⏰ <b>{ev['time']} น. | {safe_event}</b>\n"
            f"⚡ {star_badge} | สกุลเงิน: <code>{ev['currency']}</code>\n"
            f"📊 <b>ตัวเลข:</b> จริง <code>{safe_actual}</code> | คาดการณ์ <code>{safe_forecast}</code> | ก่อนหน้า <code>{safe_prev}</code>\n"
            f"🎯 <b>บทวิเคราะห์กระทบทองคำ (XAU/USD):</b>\n"
            f"{impact_analysis}\n"
            f"──────────────────────────\n"
        )
        event_blocks.append(block)

    footer = (
        f"\n🤖 <i>ระบบวิเคราะห์และแจ้งเตือนอัตโนมัติ Onicorn Trade Dashboard</i>\n"
        f"🌐 <a href='https://onicorn-trade.pages.dev'>ดูข้อมูลกราฟสดและบทวิเคราะห์เต็ม</a>"
    )

    # If no relevant events
    if not event_blocks:
        empty_msg = (
            header +
            "ℹ️ <b>วันนี้ไม่มีข่าวเศรษฐกิจสำคัญระดับ Medium / High Impact ที่ส่งผลต่อราคาทองคำโลก</b>\n"
            "ตลาดเคลื่อนไหวตามปัจจัยโครงสร้างเทคนิค (SMC & Price Action) และกรอบราคาปกติ\n" +
            footer
        )
        return [empty_msg]

    # Combine into messages with <= 3800 characters per message
    messages = []
    current_msg = header + volatility_box + summary_box

    for block in event_blocks:
        if len(current_msg) + len(block) + len(footer) > 3800:
            current_msg += footer
            messages.append(current_msg)
            current_msg = (
                f"📋 <b>ตารางวิเคราะห์ข่าวสำคัญ (ต่อ):</b>\n"
                f"──────────────────────────\n"
            ) + block
        else:
            current_msg += block

    current_msg += footer
    messages.append(current_msg)

    # Add Part index if multi-part
    if len(messages) > 1:
        for idx in range(len(messages)):
            messages[idx] = f"<b>[ตอนที่ {idx+1}/{len(messages)}]</b>\n" + messages[idx]

    return messages

def send_telegram_message(token, chat_id, text):
    """Send HTML message to Telegram via Bot API"""
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
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
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

    # 1. Fetch from Onicorn Trade Dashboard Settings API
    try:
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

    # 2. Fallback to Environment Variables
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    chat_id = os.environ.get("TELEGRAM_CHAT_ID", "").strip()

    return token, chat_id

def main():
    print("=" * 60)
    print("🚀 Starting Automated Gold News Digest Telegram Alert")
    print(f"⏰ Execution Time (BKK): {datetime.now(BKK_TZ).strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    token, chat_id = get_telegram_credentials()

    html_content = fetch_economic_calendar()
    if not html_content:
        print("❌ Error: Could not fetch economic calendar data.")
        sys.exit(1)

    events = parse_news_rows(html_content)
    print(f"✅ Total calendar rows parsed: {len(events)}")

    messages = build_telegram_messages(events)
    print(f"📝 Generated {len(messages)} Telegram message part(s).")

    if not token or not chat_id:
        print("\n⚠️ TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set. Printing message preview:\n")
        for i, m in enumerate(messages, 1):
            print(f"--- [MESSAGE PART {i}] ---")
            print(m)
            print()
        print("✅ Preview complete (dry-run mode).")
        return

    # Send messages to Telegram
    for i, m in enumerate(messages, 1):
        try:
            res = send_telegram_message(token, chat_id, m)
            if res.get("ok"):
                print(f"✅ Successfully sent message part {i}/{len(messages)} to Telegram!")
            else:
                print(f"❌ Telegram API returned error: {res}")
        except Exception as e:
            print(f"❌ Failed to send part {i}: {e}")
            sys.exit(1)

    print("🎉 All Gold News alerts successfully sent!")

if __name__ == "__main__":
    main()
