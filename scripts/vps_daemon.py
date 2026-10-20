#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Onicorn Trade - VPS Standalone Daemon Scheduler
Alternative to Linux crontab: Runs as a persistent background daemon (PM2, Systemd, or Screen).
Monitors Bangkok time and triggers alerts at the exact minute with 0s latency.
"""

import os
import sys
import time
import subprocess
from datetime import datetime, timezone, timedelta

# Bangkok Timezone (UTC+7)
BKK_TZ = timezone(timedelta(hours=7))

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, SCRIPT_DIR)

from alert_utils import get_bkk_now, get_bkk_date_str, check_already_sent_today

def log(msg):
    now_str = get_bkk_now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{now_str}] {msg}", flush=True)

def run_task(task_type):
    runner_script = os.path.join(SCRIPT_DIR, "run_vps_alert.sh")
    cmd = ["/bin/bash", runner_script, task_type]
    log(f"🚀 Executing task '{task_type}' via: {' '.join(cmd)}")
    try:
        res = subprocess.run(cmd, cwd=PROJECT_ROOT, capture_output=True, text=True)
        print(res.stdout, flush=True)
        if res.stderr:
            print(res.stderr, file=sys.stderr, flush=True)
        log(f"🏁 Task '{task_type}' finished with exit code {res.returncode}")
    except Exception as e:
        log(f"❌ Error executing task '{task_type}': {e}")

def main():
    log("=" * 60)
    log("🚀 Onicorn Trade - VPS Alert Daemon Started")
    log("🕒 Monitoring Bangkok Time (UTC+7) 24/7...")
    log("=" * 60)

    last_checked_minute = -1

    while True:
        try:
            now = get_bkk_now()
            cur_minute_key = now.day * 1440 + now.hour * 60 + now.minute

            if cur_minute_key != last_checked_minute:
                last_checked_minute = cur_minute_key
                hour = now.hour
                minute = now.minute
                weekday = now.isoweekday() # 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 7=Sun
                is_weekday = 1 <= weekday <= 5

                # 1. 07:45 AM (Mon - Fri) -> Morning Alerts (Gold News, Daily Stocks, Sector Rotation)
                if is_weekday and hour == 7 and minute == 45:
                    log("⏰ Trigger: 07:45 AM Morning Alerts")
                    run_task("morning")

                # 2. 08:00 AM (Tuesday) -> WTI Oil Chart Screenshot
                if weekday == 2 and hour == 8 and minute == 0:
                    log("⏰ Trigger: 08:00 AM Tuesday WTI Oil Chart")
                    run_task("oil_chart")

                # 3. 14:35 PM (Mon - Fri) -> Intraday Breakout & Volume Spikes
                if is_weekday and hour == 14 and minute == 35:
                    log("⏰ Trigger: 14:35 PM Intraday Breakout Alert")
                    run_task("intraday")

                # 4. 17:20 PM (Mon - Fri) -> End-of-Day Market Wrap
                if is_weekday and hour == 17 and minute == 20:
                    log("⏰ Trigger: 17:20 PM End-of-Day Market Wrap")
                    run_task("market_wrap")

            time.sleep(20)

        except KeyboardInterrupt:
            log("🛑 Daemon stopped by user.")
            break
        except Exception as e:
            log(f"⚠️ Unexpected error in daemon loop: {e}")
            time.sleep(30)

if __name__ == "__main__":
    main()
