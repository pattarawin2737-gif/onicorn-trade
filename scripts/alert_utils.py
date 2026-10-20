#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Onicorn Trade - Centralized Alert Utilities & Deduplication Engine
Features:
1. Strict Stale Run Guard (rejects delayed runner executions e.g. midnight runs)
2. Dual-Runner Deduplication (synchronizes VPS Primary & GitHub Actions Backup via Cloudflare D1)
3. Local file locking fallback when offline
"""

import os
import sys
import json
import ssl
import urllib.request
import urllib.parse
from datetime import datetime, timezone, timedelta

# Bangkok Timezone (UTC+7)
BKK_TZ = timezone(timedelta(hours=7))

ALERT_STATUS_API = "https://onicorn-trade.pages.dev/api/alert-status"

def get_bkk_now():
    """Return current datetime in Asia/Bangkok (UTC+7)"""
    return datetime.now(BKK_TZ)

def get_bkk_date_str(dt=None):
    """Return current Bangkok date as YYYY-MM-DD"""
    if dt is None:
        dt = get_bkk_now()
    return dt.strftime("%Y-%m-%d")

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

def is_stale_run(task_name, dt=None):
    """
    Check if the current run is stale (delayed beyond its acceptable window).
    Returns (is_stale: bool, reason: str)
    """
    if dt is None:
        dt = get_bkk_now()

    hour = dt.hour
    minute = dt.minute
    cur_min = hour * 60 + minute
    time_str = dt.strftime("%H:%M")

    # Group 1: Morning tasks (Scheduled 07:45 - 08:00 AM BKK)
    morning_tasks = [
        "morning", "morning_alerts", "gold_news", "daily_stocks",
        "oil_chart", "weekly_sector", "monthly_sector"
    ]
    if task_name in morning_tasks:
        # Cut-off: 10:00 AM (600 mins)
        if cur_min >= 600:
            return True, f"เวลาปัจจุบัน {time_str} น. เกินกำหนดเวลาส่งรอบเช้า (Cut-off 10:00 น.) - ยกเลิกการส่งเพื่อป้องกันข้อมูลล้าสมัย"
        return False, "OK"

    # Group 2: Intraday Breakout (Scheduled 14:35 PM BKK)
    if task_name in ["intraday", "intraday_alert"]:
        # Valid window: 14:00 (840) to 16:30 (990)
        if cur_min < 840:
            return True, f"เวลาปัจจุบัน {time_str} น. ยังไม่ถึงช่วงเวลาตรวจจับภาคบ่าย (เปิด 14:00 - 16:30 น.)"
        if cur_min > 990:
            return True, f"เวลาปัจจุบัน {time_str} น. ตลาดปิดทำการแล้ว (Cut-off 16:30 น.) - ยกเลิกการส่งเตือนระหว่างวัน"
        return False, "OK"

    # Group 3: Market Wrap (Scheduled 17:20 PM BKK)
    if task_name in ["market_wrap", "evening"]:
        # Must be after 16:40 (1000) and before 19:30 (1170)
        if cur_min < 1000:
            return True, f"เวลาปัจจุบัน {time_str} น. ตลาดยังไม่ปิดทำการ (Cut-off ต้องหลัง 16:40 น.)"
        if cur_min >= 1170:
            return True, f"เวลาปัจจุบัน {time_str} น. เกินกำหนดเวลาส่งสรุปตลาดสิ้นวัน (Cut-off 19:30 น.) - ตัดทิ้งเพื่อไม่ให้รบกวนตอนดึก"
        return False, "OK"

    return False, "OK"

def _get_local_lock_path(task_name, date_str):
    import tempfile
    clean_task = task_name.replace("/", "_").replace(" ", "_")
    return os.path.join(tempfile.gettempdir(), f"onicorn_{clean_task}_{date_str}.lock")

def check_already_sent_today(task_name, date_str=None):
    """
    Check if the task has already been sent today.
    Checks remote Cloudflare API first, then falls back to local lockfile.
    Returns (already_sent: bool, details: dict)
    """
    if date_str is None:
        date_str = get_bkk_date_str()

    # 1. Check local file lock first (fastest)
    lock_file = _get_local_lock_path(task_name, date_str)
    if os.path.exists(lock_file):
        try:
            with open(lock_file, "r", encoding="utf-8") as f:
                content = json.load(f)
                return True, content
        except Exception:
            return True, {"runner": "local_lock", "date": date_str}

    # 2. Check remote Cloudflare API
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        params = urllib.parse.urlencode({"task": task_name, "date": date_str})
        url = f"{ALERT_STATUS_API}?{params}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 Onicorn-AlertEngine/1.0"})

        with urllib.request.urlopen(req, context=ctx, timeout=6) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                if data.get("already_sent"):
                    rec = data.get("record") or {}
                    # Sync to local lockfile so next check is instant
                    try:
                        with open(lock_file, "w", encoding="utf-8") as f:
                            json.dump(rec, f)
                    except Exception:
                        pass
                    return True, rec
    except Exception as e:
        print(f"Notice: Deduplication API check skipped ({e}), relying on local lock.")

    return False, {}

def record_alert_sent(task_name, date_str=None, runner=None):
    """
    Mark task as sent today in both Cloudflare D1 and local lockfile.
    """
    if date_str is None:
        date_str = get_bkk_date_str()
    if runner is None:
        runner = get_runner_name()

    timestamp = get_bkk_now().isoformat()
    record_data = {
        "task": task_name,
        "date": date_str,
        "runner": runner,
        "sent_at": timestamp,
        "status": "success"
    }

    # 1. Save to local lockfile
    lock_file = _get_local_lock_path(task_name, date_str)
    try:
        with open(lock_file, "w", encoding="utf-8") as f:
            json.dump(record_data, f)
    except Exception as e:
        print(f"Warning: Could not write local lockfile: {e}")

    # 2. Save to Cloudflare API
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        payload = json.dumps(record_data).encode("utf-8")
        req = urllib.request.Request(
            ALERT_STATUS_API,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 Onicorn-AlertEngine/1.0"
            }
        )
        with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
            if resp.status in (200, 201):
                print(f"✅ [Deduplication] Registered completion of '{task_name}' ({date_str}) to Central Cloudflare API (Runner: {runner})")
                return True
    except Exception as e:
        print(f"Notice: Could not post status to Cloudflare API ({e}), local lock remains active.")

    return False

def can_execute_alert(task_name, force=False):
    """
    Master gatekeeper function:
    1. If force: always allows execution.
    2. Check Stale Guard: drops delayed runs.
    3. Check Deduplication: drops duplicate runs across VPS / GitHub Actions.
    Returns (can_run: bool, message: str)
    """
    if force:
        return True, "⚡ [Force Mode] Bypassing stale and deduplication checks."

    # Check Stale Guard
    is_stale, stale_reason = is_stale_run(task_name)
    if is_stale:
        return False, f"🛑 [Stale Guard] {stale_reason}"

    # Check Deduplication
    already_sent, info = check_already_sent_today(task_name)
    if already_sent:
        r_name = info.get("runner", "unknown runner")
        sent_time = info.get("sent_at", "earlier today")
        return False, (
            f"🛑 [Deduplication] Task '{task_name}' was already sent today ({get_bkk_date_str()}) "
            f"by [{r_name}] at {sent_time}. Skipping duplicate execution!"
        )

    return True, "✅ [Ready] Pre-flight checks passed."
