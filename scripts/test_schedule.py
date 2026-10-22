#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Automated Schedule Verification Test Suite
Validates all calendar rules, time windows, SET holidays, and period-based
deduplication logic in alert_utils.py without sending any Telegram messages.
"""

import os
import sys
from datetime import datetime, timezone, timedelta

# Ensure scripts dir is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from alert_utils import (
    BKK_TZ,
    can_execute_alert,
    is_scheduled_day,
    is_set_holiday,
    is_trading_day,
    first_trading_day_of_week,
    first_trading_day_of_month,
    get_period_key,
    get_next_send_date,
    format_thai_short_date,
)

def bkk_dt(year, month, day, hour=7, minute=45):
    return datetime(year, month, day, hour, minute, tzinfo=BKK_TZ)

def run_tests():
    total = 0
    passed = 0

    def assert_eq(actual, expected, msg):
        nonlocal total, passed
        total += 1
        if actual == expected:
            passed += 1
            print(f"  ✅ [PASS] {msg}")
        else:
            print(f"  ❌ [FAIL] {msg} -> Expected: {expected}, Got: {actual}")

    print("=" * 60)
    print("🧪 Running Onicorn Alert Schedule Automated Tests")
    print("=" * 60)

    # ----------------------------------------------------
    print("\n[Test 1: SET Holiday Detection]")
    # ----------------------------------------------------
    assert_eq(is_set_holiday(bkk_dt(2026, 10, 23)), True, "23 Oct 2026 is King Chulalongkorn Day (Holiday)")
    assert_eq(is_set_holiday(bkk_dt(2026, 10, 22)), False, "22 Oct 2026 is a normal trading day")
    assert_eq(is_trading_day(bkk_dt(2026, 10, 23)), False, "23 Oct 2026 is NOT a trading day")
    assert_eq(is_trading_day(bkk_dt(2026, 10, 24)), False, "24 Oct 2026 (Saturday) is NOT a trading day")

    # ----------------------------------------------------
    print("\n[Test 2: First Trading Day of Week Calculation]")
    # ----------------------------------------------------
    # Mon 19 Oct is normal Monday
    assert_eq(str(first_trading_day_of_week(bkk_dt(2026, 10, 19))), "2026-10-19", "First trading day of week 43 is Mon 19 Oct")
    assert_eq(str(first_trading_day_of_week(bkk_dt(2026, 10, 22))), "2026-10-19", "On Thursday 22 Oct, first trading day of this week was Mon 19 Oct")
    # Songkran 2026: Mon 13, Tue 14, Wed 15 are holidays -> First trading day is Thu 16 Apr
    assert_eq(str(first_trading_day_of_week(bkk_dt(2026, 4, 13))), "2026-04-16", "Songkran 2026 week: first trading day rolls to Thu 16 Apr")

    # ----------------------------------------------------
    print("\n[Test 3: First Trading Day of Month Calculation]")
    # ----------------------------------------------------
    # 1 Nov 2026 is Sunday -> First trading day is Mon 2 Nov
    assert_eq(str(first_trading_day_of_month(bkk_dt(2026, 11, 15))), "2026-11-02", "Nov 2026 first trading day is Mon 2 Nov (1 Nov is Sun)")
    # 1 May 2026 is Labor Day (SET holiday), 2 May Sat, 3 May Sun, 4 May Mon Coronation Day -> First trading day is Tue 5 May!
    assert_eq(str(first_trading_day_of_month(bkk_dt(2026, 5, 20))), "2026-05-05", "May 2026 first trading day is Tue 5 May (after holidays)")

    # ----------------------------------------------------
    print("\n[Test 4: Calendar Rule Validation]")
    # ----------------------------------------------------
    # Mon 19 Oct 2026 07:45 AM
    dt_mon = bkk_dt(2026, 10, 19, 7, 45)
    ok, _ = is_scheduled_day("gold_news", dt_mon)
    assert_eq(ok, True, "Mon 19 Oct: gold_news is scheduled")
    ok, _ = is_scheduled_day("daily_stocks", dt_mon)
    assert_eq(ok, True, "Mon 19 Oct: daily_stocks is scheduled")
    ok, _ = is_scheduled_day("weekly_sector", dt_mon)
    assert_eq(ok, True, "Mon 19 Oct: weekly_sector is scheduled")
    ok, _ = is_scheduled_day("monthly_sector", dt_mon)
    assert_eq(ok, False, "Mon 19 Oct: monthly_sector is NOT scheduled (not 1st trading day)")
    ok, _ = is_scheduled_day("oil_chart", dt_mon)
    assert_eq(ok, False, "Mon 19 Oct: oil_chart is NOT scheduled (Tuesday only)")

    # Tue 20 Oct 2026 08:00 AM
    dt_tue = bkk_dt(2026, 10, 20, 8, 0)
    ok, _ = is_scheduled_day("oil_chart", dt_tue)
    assert_eq(ok, True, "Tue 20 Oct: oil_chart IS scheduled")
    ok, _ = is_scheduled_day("weekly_sector", dt_tue)
    assert_eq(ok, False, "Tue 20 Oct: weekly_sector is NOT scheduled")

    # Thu 22 Oct 2026 07:45 AM (Today's simulated time)
    dt_thu = bkk_dt(2026, 10, 22, 7, 45)
    ok, _ = is_scheduled_day("weekly_sector", dt_thu)
    assert_eq(ok, False, "Thu 22 Oct: weekly_sector is NOT scheduled")
    ok, _ = is_scheduled_day("monthly_sector", dt_thu)
    assert_eq(ok, False, "Thu 22 Oct: monthly_sector is NOT scheduled")

    # Fri 23 Oct 2026 (Chulalongkorn Day)
    dt_fri_hol = bkk_dt(2026, 10, 23, 7, 45)
    ok, _ = is_scheduled_day("gold_news", dt_fri_hol)
    assert_eq(ok, True, "Fri 23 Oct: gold_news STILL scheduled (world markets open)")
    ok, _ = is_scheduled_day("daily_stocks", dt_fri_hol)
    assert_eq(ok, False, "Fri 23 Oct: daily_stocks NOT scheduled (SET Holiday)")
    ok, _ = is_scheduled_day("intraday_alert", bkk_dt(2026, 10, 23, 14, 35))
    assert_eq(ok, False, "Fri 23 Oct: intraday_alert NOT scheduled (SET Holiday)")
    ok, _ = is_scheduled_day("market_wrap", bkk_dt(2026, 10, 23, 17, 20))
    assert_eq(ok, False, "Fri 23 Oct: market_wrap NOT scheduled (SET Holiday)")

    # Mon 2 Nov 2026 07:45 AM (First trading day of month AND week!)
    dt_nov2 = bkk_dt(2026, 11, 2, 7, 45)
    ok, _ = is_scheduled_day("monthly_sector", dt_nov2)
    assert_eq(ok, True, "Mon 2 Nov: monthly_sector IS scheduled (first trading day of Nov)")
    ok, _ = is_scheduled_day("weekly_sector", dt_nov2)
    assert_eq(ok, True, "Mon 2 Nov: weekly_sector IS scheduled (first trading day of week)")

    # ----------------------------------------------------
    print("\n[Test 5: Period Dedup Keys]")
    # ----------------------------------------------------
    assert_eq(get_period_key("daily_stocks", bkk_dt(2026, 10, 22)), "2026-10-22", "Daily stocks key is YYYY-MM-DD")
    assert_eq(get_period_key("weekly_sector", bkk_dt(2026, 10, 22)), "2026-W43", "Weekly sector key is YYYY-Www")
    assert_eq(get_period_key("monthly_sector", bkk_dt(2026, 10, 22)), "2026-10", "Monthly sector key is YYYY-MM")

    # ----------------------------------------------------
    print("\n[Test 6: Gatekeeper can_execute_alert Layer Testing]")
    # ----------------------------------------------------
    # Layer 1: Calendar rejection
    can, msg = can_execute_alert("weekly_sector", force=False, dt=bkk_dt(2026, 10, 22, 7, 45))
    assert_eq(can, False, "Thursday 07:45 weekly_sector rejected by calendar")

    # Layer 2: Stale window rejection
    can, msg = can_execute_alert("daily_stocks", force=False, dt=bkk_dt(2026, 10, 22, 11, 45))
    assert_eq(can, False, "Thursday 11:45 daily_stocks rejected by stale window")

    # Force override: bypasses all
    can, msg = can_execute_alert("weekly_sector", force=True, dt=bkk_dt(2026, 10, 22, 11, 45))
    assert_eq(can, True, "Force mode overrides calendar and stale windows")

    print("\n" + "=" * 60)
    print(f"📊 Results: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    print("=" * 60)

    return passed == total

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
