#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Onicorn Trade - Centralized Alert Schedule, Utilities & Deduplication Engine

Single source of truth for WHEN each Telegram alert is allowed to be sent.
Every runner (Windows VPS, Linux VPS, GitHub Actions, daemon) calls the same
gatekeeper `can_execute_alert()`, so a misconfigured runner can never send a
weekly/monthly report more than once per week/month.

Gatekeeper layers:
1. Calendar rule   - right day? (weekday / trading day / first trading day of week or month / Tuesday)
2. Time window     - inside the allowed window? (rejects delayed runs e.g. midnight)
3. Period dedup    - already sent in this period? (daily / weekly / monthly, shared via Cloudflare D1)
4. Settings toggle - enabled in the dashboard? (checked with `is_alert_enabled()`)
`--force` bypasses layers 1-3 for manual testing.
"""

import os
import sys
import json
import ssl
import tempfile
import urllib.request
import urllib.parse
from datetime import datetime, timezone, timedelta, date

# Bangkok Timezone (UTC+7)
BKK_TZ = timezone(timedelta(hours=7))

ALERT_STATUS_API = "https://onicorn-trade.pages.dev/api/alert-status"

TH_DAYS_SHORT = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."]
TH_DAYS = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"]
TH_MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
                   "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]

# ==========================================
# Stock Exchange of Thailand (SET) holidays
# Source: set.or.th - update this list every year.
# ==========================================
SET_HOLIDAYS = {
    # 2026
    "2026-01-01", "2026-01-02", "2026-03-03", "2026-04-06",
    "2026-04-13", "2026-04-14", "2026-04-15", "2026-05-01",
    "2026-05-04", "2026-06-01", "2026-06-03", "2026-07-28",
    "2026-07-29", "2026-08-12", "2026-10-13", "2026-10-16",
    "2026-10-23", "2026-12-07", "2026-12-10", "2026-12-31",
    # 2027 (partial - confirm when SET publishes the official calendar)
    "2027-01-01",
}

# ==========================================
# Alert Schedule Registry (single source of truth)
# ==========================================
# rule:
#   "weekdays"              -> Mon-Fri (global markets, ignores SET holidays)
#   "trading_days"          -> Mon-Fri excluding SET holidays
#   "first_trading_of_week" -> first SET trading day of the ISO week
#   "first_trading_of_month"-> first SET trading day of the month
#   "tuesday"               -> every Tuesday
# period: dedup scope -> "daily" | "weekly" | "monthly"
# window: (start_minute, end_minute) Bangkok time, inclusive
ALERT_SCHEDULE = {
    "gold_news": {
        "name": "สรุปข่าวทองคำ & ปฏิทินเศรษฐกิจ",
        "icon": "🟡",
        "rule": "weekdays",
        "period": "daily",
        "time": "07:45",
        "window": (7 * 60, 10 * 60),
        "toggles": ["telegram_gold_enabled", "telegram_gold_news_enabled"],
    },
    "daily_stocks": {
        "name": "3 หุ้นเด่นประจำวัน",
        "icon": "📈",
        "rule": "trading_days",
        "period": "daily",
        "time": "07:45",
        "window": (7 * 60, 10 * 60),
        "toggles": ["telegram_thai_stocks_enabled"],
    },
    "weekly_sector": {
        "name": "กลุ่มอุตสาหกรรมน่าสนใจประจำสัปดาห์",
        "icon": "⚡",
        "rule": "first_trading_of_week",
        "period": "weekly",
        "time": "07:45",
        "window": (7 * 60, 10 * 60),
        "toggles": ["telegram_sector_weekly_enabled"],
    },
    "monthly_sector": {
        "name": "กลุ่มอุตสาหกรรมยุทธศาสตร์ประจำเดือน",
        "icon": "🗓️",
        "rule": "first_trading_of_month",
        "period": "monthly",
        "time": "07:45",
        "window": (7 * 60, 10 * 60),
        "toggles": ["telegram_sector_monthly_enabled"],
    },
    "oil_chart": {
        "name": "กราฟน้ำมันดิบ WTI & ราคาน้ำมันไทย",
        "icon": "🛢️",
        "rule": "tuesday",
        "period": "weekly",
        "time": "08:00",
        "window": (7 * 60, 10 * 60),
        "toggles": ["telegram_oil_enabled", "telegram_oil_chart_enabled"],
    },
    "intraday_alert": {
        "name": "Intraday Breakout & Volume Alert",
        "icon": "🚀",
        "rule": "trading_days",
        "period": "daily",
        "time": "14:35",
        "window": (14 * 60, 16 * 60 + 30),
        "toggles": ["telegram_intraday_alerts_enabled"],
    },
    "market_wrap": {
        "name": "สรุปตลาดหุ้นไทยสิ้นวัน (Market Wrap)",
        "icon": "📊",
        "rule": "trading_days",
        "period": "daily",
        "time": "17:20",
        "window": (16 * 60 + 40, 19 * 60 + 30),
        "toggles": ["telegram_market_wrap_enabled"],
    },
}

TASK_ALIASES = {
    "intraday": "intraday_alert",
    "evening": "market_wrap",
    "thai_stocks": "daily_stocks",
}

RULE_LABELS = {
    "weekdays": "ทุกวันจันทร์ - ศุกร์",
    "trading_days": "ทุกวันทำการตลาดหุ้นไทย (จ. - ศ.)",
    "first_trading_of_week": "วันทำการแรกของสัปดาห์ (ปกติคือวันจันทร์)",
    "first_trading_of_month": "วันทำการแรกของเดือน",
    "tuesday": "ทุกวันอังคาร",
}

PERIOD_LABELS = {"daily": "รายวัน", "weekly": "รายสัปดาห์", "monthly": "รายเดือน"}


# ==========================================
# Time helpers
# ==========================================
def get_bkk_now():
    """Return current datetime in Asia/Bangkok (UTC+7)"""
    return datetime.now(BKK_TZ)


def _as_date(d):
    if d is None:
        return get_bkk_now().date()
    if isinstance(d, datetime):
        return d.date()
    return d


def get_bkk_date_str(dt=None):
    """Return Bangkok date as YYYY-MM-DD"""
    return _as_date(dt).strftime("%Y-%m-%d")


def format_thai_short_date(d):
    d = _as_date(d)
    return f"{TH_DAYS_SHORT[d.weekday()]} {d.day} {TH_MONTHS_SHORT[d.month - 1]}"


def normalize_task(task_name):
    return TASK_ALIASES.get(task_name, task_name)


def get_runner_name():
    """Detect current execution environment"""
    env_runner = os.environ.get("RUNNER_ENV", "").strip().lower()
    if env_runner:
        return env_runner
    if os.path.exists("/etc/onicorn_vps"):
        return "vps"
    if os.environ.get("GITHUB_ACTIONS"):
        return "github_actions"
    return "local"


def is_force_mode(args=None):
    """Check if manual force override is active"""
    if os.environ.get("FORCE_SEND", "").strip() in ("1", "true", "True", "yes", "YES"):
        return True
    if args and getattr(args, "force", False):
        return True
    return False


# ==========================================
# Trading calendar
# ==========================================
def is_set_holiday(d):
    return _as_date(d).strftime("%Y-%m-%d") in SET_HOLIDAYS


def is_trading_day(d):
    d = _as_date(d)
    return d.weekday() < 5 and not is_set_holiday(d)


def first_trading_day_of_week(d):
    d = _as_date(d)
    monday = d - timedelta(days=d.weekday())
    for i in range(5):
        cand = monday + timedelta(days=i)
        if is_trading_day(cand):
            return cand
    return None


def first_trading_day_of_month(d):
    d = _as_date(d)
    cand = d.replace(day=1)
    while cand.month == d.month:
        if is_trading_day(cand):
            return cand
        cand += timedelta(days=1)
    return None


def is_scheduled_day(task_name, d=None):
    """Layer 1: is this alert supposed to go out on this calendar day?
    Returns (ok: bool, reason: str)"""
    task = normalize_task(task_name)
    cfg = ALERT_SCHEDULE.get(task)
    if not cfg:
        return True, "OK"
    d = _as_date(d)
    day_txt = f"วัน{TH_DAYS[d.weekday()]}ที่ {d.day} {TH_MONTHS_SHORT[d.month - 1]}"
    rule = cfg["rule"]

    if rule == "weekdays":
        if d.weekday() >= 5:
            return False, f"{day_txt} เป็นวันหยุดสุดสัปดาห์"
        return True, "OK"

    if rule == "tuesday":
        if d.weekday() != 1:
            return False, f"{day_txt} — รายงานนี้ส่งเฉพาะวันอังคาร"
        return True, "OK"

    if not is_trading_day(d):
        why = "วันหยุดตลาดหุ้นไทย (SET Holiday)" if d.weekday() < 5 else "วันหยุดสุดสัปดาห์"
        return False, f"{day_txt} เป็น{why}"

    if rule == "trading_days":
        return True, "OK"

    if rule == "first_trading_of_week":
        first = first_trading_day_of_week(d)
        if d != first:
            when = f"สัปดาห์นี้กำหนดส่งวัน {format_thai_short_date(first)}" if first else "สัปดาห์นี้ไม่มีวันทำการ"
            return False, f"{day_txt} ไม่ใช่วันทำการแรกของสัปดาห์ ({when})"
        return True, "OK"

    if rule == "first_trading_of_month":
        first = first_trading_day_of_month(d)
        if d != first:
            when = f"เดือนนี้กำหนดส่งวัน {format_thai_short_date(first)}" if first else "เดือนนี้ไม่มีวันทำการ"
            return False, f"{day_txt} ไม่ใช่วันทำการแรกของเดือน ({when})"
        return True, "OK"

    return True, "OK"


def get_next_send_date(task_name, after=None):
    """Return the next calendar date (strictly after `after`) on which this alert is scheduled."""
    after = _as_date(after)
    for i in range(1, 70):
        cand = after + timedelta(days=i)
        ok, _ = is_scheduled_day(task_name, cand)
        if ok:
            return cand
    return None


def get_period_key(task_name, d=None):
    """Dedup key: daily -> YYYY-MM-DD, weekly -> YYYY-Www, monthly -> YYYY-MM"""
    task = normalize_task(task_name)
    d = _as_date(d)
    period = ALERT_SCHEDULE.get(task, {}).get("period", "daily")
    if period == "weekly":
        iso = d.isocalendar()
        return f"{iso[0]}-W{iso[1]:02d}"
    if period == "monthly":
        return d.strftime("%Y-%m")
    return d.strftime("%Y-%m-%d")


def get_period(task_name):
    return ALERT_SCHEDULE.get(normalize_task(task_name), {}).get("period", "daily")


# ==========================================
# Layer 2: time window (stale guard)
# ==========================================
def is_stale_run(task_name, dt=None):
    """Returns (is_stale: bool, reason: str)"""
    if dt is None:
        dt = get_bkk_now()
    task = normalize_task(task_name)
    if task == "morning" or task == "morning_alerts":
        task = "daily_stocks"
    cfg = ALERT_SCHEDULE.get(task)
    if not cfg:
        return False, "OK"
    cur_min = dt.hour * 60 + dt.minute
    start, end = cfg["window"]
    time_str = dt.strftime("%H:%M")
    win_txt = f"{start // 60:02d}:{start % 60:02d} - {end // 60:02d}:{end % 60:02d} น."
    if cur_min < start:
        return True, f"เวลาปัจจุบัน {time_str} น. ยังไม่ถึงช่วงเวลาส่ง ({win_txt})"
    if cur_min > end:
        return True, f"เวลาปัจจุบัน {time_str} น. เลยช่วงเวลาส่งแล้ว ({win_txt}) - ยกเลิกเพื่อป้องกันข้อมูลล้าสมัย"
    return False, "OK"


# ==========================================
# Layer 3: period-based deduplication
# ==========================================
def _ssl_ctx():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx


def _get_local_lock_path(task_name, period_key):
    clean_task = task_name.replace("/", "_").replace(" ", "_")
    return os.path.join(tempfile.gettempdir(), f"onicorn_{clean_task}_{period_key}.lock")


def _remote_enabled():
    return os.environ.get("ONICORN_OFFLINE_DEDUP", "").strip() not in ("1", "true", "yes")


def check_already_sent(task_name, dt=None):
    """Check if this alert was already sent in its current period (day/week/month).
    Returns (already_sent: bool, details: dict)"""
    task = normalize_task(task_name)
    d = _as_date(dt)
    period_key = get_period_key(task, d)

    lock_file = _get_local_lock_path(task, period_key)
    if os.path.exists(lock_file):
        try:
            with open(lock_file, "r", encoding="utf-8") as f:
                return True, json.load(f)
        except Exception:
            return True, {"runner": "local_lock", "date": period_key}

    if not _remote_enabled():
        return False, {}

    try:
        params = urllib.parse.urlencode({
            "task": task,
            "date": d.strftime("%Y-%m-%d"),
            "period": get_period(task),
        })
        req = urllib.request.Request(
            f"{ALERT_STATUS_API}?{params}",
            headers={"User-Agent": "Mozilla/5.0 Onicorn-AlertEngine/2.0"},
        )
        with urllib.request.urlopen(req, context=_ssl_ctx(), timeout=6) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                if data.get("already_sent"):
                    rec = data.get("record") or {}
                    try:
                        with open(lock_file, "w", encoding="utf-8") as f:
                            json.dump(rec, f)
                    except Exception:
                        pass
                    return True, rec
    except Exception as e:
        print(f"Notice: Deduplication API check skipped ({e}), relying on local lock.")

    return False, {}


def check_already_sent_today(task_name, date_str=None):
    """Backward-compatible wrapper (now period-aware)."""
    d = datetime.strptime(date_str, "%Y-%m-%d").date() if date_str else None
    return check_already_sent(task_name, d)


def record_alert_sent(task_name, date_str=None, runner=None):
    """Mark task as sent for its current period in both local lockfile and Cloudflare D1."""
    task = normalize_task(task_name)
    if date_str is None:
        date_str = get_bkk_date_str()
    if runner is None:
        runner = get_runner_name()
    d = datetime.strptime(date_str, "%Y-%m-%d").date()
    period_key = get_period_key(task, d)

    record_data = {
        "task": task,
        "date": date_str,
        "period": get_period(task),
        "period_key": period_key,
        "runner": runner,
        "sent_at": get_bkk_now().isoformat(),
        "status": "success",
    }

    lock_file = _get_local_lock_path(task, period_key)
    try:
        with open(lock_file, "w", encoding="utf-8") as f:
            json.dump(record_data, f)
    except Exception as e:
        print(f"Warning: Could not write local lockfile: {e}")

    if not _remote_enabled():
        return False

    try:
        req = urllib.request.Request(
            ALERT_STATUS_API,
            data=json.dumps(record_data).encode("utf-8"),
            headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0 Onicorn-AlertEngine/2.0"},
        )
        with urllib.request.urlopen(req, context=_ssl_ctx(), timeout=8) as resp:
            if resp.status in (200, 201):
                print(f"✅ [Dedup] บันทึกการส่ง '{task}' รอบ {period_key} ({PERIOD_LABELS[get_period(task)]}) แล้ว (Runner: {runner})")
                return True
    except Exception as e:
        print(f"Notice: Could not post status to Cloudflare API ({e}), local lock remains active.")
    return False


# ==========================================
# Layer 4: dashboard toggle
# ==========================================
def is_alert_enabled(task_name, settings):
    """Returns True unless the alert is explicitly switched off in dashboard settings."""
    task = normalize_task(task_name)
    cfg = ALERT_SCHEDULE.get(task)
    if not cfg or not settings:
        return True
    for key in cfg["toggles"]:
        if key in settings and str(settings.get(key)).strip() == "0":
            return False
    return True


# ==========================================
# Master gatekeeper
# ==========================================
def can_execute_alert(task_name, force=False, dt=None):
    """Returns (can_run: bool, message: str). Layers 1-3; use is_alert_enabled() for layer 4."""
    task = normalize_task(task_name)
    name = ALERT_SCHEDULE.get(task, {}).get("name", task)

    if force:
        return True, f"⚡ [Force Mode] {name}: ข้ามการตรวจสอบวัน/เวลา/การส่งซ้ำ"

    if dt is None:
        dt = get_bkk_now()

    ok, reason = is_scheduled_day(task, dt)
    if not ok:
        nxt = get_next_send_date(task, dt)
        nxt_txt = f" — ฉบับถัดไป: {format_thai_short_date(nxt)}" if nxt else ""
        return False, f"⏩ [ไม่ใช่วันส่ง] {name}: {reason}{nxt_txt}"

    is_stale, stale_reason = is_stale_run(task, dt)
    if is_stale:
        return False, f"🛑 [นอกช่วงเวลา] {name}: {stale_reason}"

    already_sent, info = check_already_sent(task, dt)
    if already_sent:
        period = get_period(task)
        r_name = info.get("runner", "unknown")
        sent_time = info.get("sent_at", "")
        return False, (f"🛑 [ส่งแล้ว] {name}: ส่งไปแล้วในรอบ{PERIOD_LABELS[period]}นี้ "
                       f"({get_period_key(task, dt)}) โดย [{r_name}] {sent_time}")

    return True, f"✅ [พร้อมส่ง] {name}"


# ==========================================
# Message footer helper
# ==========================================
def schedule_footer(task_name, dt=None):
    """Standard footer: schedule description + next issue date."""
    task = normalize_task(task_name)
    cfg = ALERT_SCHEDULE.get(task)
    if not cfg:
        return ""
    if dt is None:
        dt = get_bkk_now()
    period_label = PERIOD_LABELS[cfg["period"]]
    line = f"🔔 <i>รายงาน{period_label} • {RULE_LABELS[cfg['rule']]} เวลา {cfg['time']} น.</i>"
    nxt = get_next_send_date(task, dt)
    if nxt:
        line += f"\n⏭️ <i>ฉบับถัดไป: {format_thai_short_date(nxt)} {cfg['time']} น.</i>"
    return line


def period_badge(task_name):
    cfg = ALERT_SCHEDULE.get(normalize_task(task_name))
    if not cfg:
        return ""
    return {"daily": "🔵 รายวัน", "weekly": "🟣 รายสัปดาห์", "monthly": "🟠 รายเดือน"}[cfg["period"]]
