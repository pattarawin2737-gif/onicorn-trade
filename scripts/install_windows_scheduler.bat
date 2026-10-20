@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul

echo ============================================================
echo [Onicorn Trade] Installing Windows Task Scheduler Alerts
echo ============================================================
echo.

:: Check for Administrator privileges
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] ERROR: Administrator privileges required!
    echo.
    echo Please right-click this file and select:
    echo "Run as administrator" (เรียกใช้ในฐานะผู้ดูแล)
    echo.
    pause
    exit /b 1
)

set "SCRIPT_DIR=%~dp0"
set "RUNNER=%SCRIPT_DIR%run_vps_alert.bat"

echo Target Runner: %RUNNER%
echo.

:: 1. Morning Alerts: Mon-Fri at 07:45 AM
echo [*] Creating Task: Onicorn_Morning_Alert (07:45 Mon-Fri)...
schtasks /create /tn "Onicorn_Morning_Alert" /tr "\"%RUNNER%\" morning" /sc weekly /d MON,TUE,WED,THU,FRI /st 07:45 /f /rl HIGHEST

:: 2. WTI Oil Chart: Every Tuesday at 08:00 AM
echo [*] Creating Task: Onicorn_Oil_Chart (08:00 Tue)...
schtasks /create /tn "Onicorn_Oil_Chart" /tr "\"%RUNNER%\" oil_chart" /sc weekly /d TUE /st 08:00 /f /rl HIGHEST

:: 3. Intraday Breakout: Mon-Fri at 14:35 PM
echo [*] Creating Task: Onicorn_Intraday_Alert (14:35 Mon-Fri)...
schtasks /create /tn "Onicorn_Intraday_Alert" /tr "\"%RUNNER%\" intraday" /sc weekly /d MON,TUE,WED,THU,FRI /st 14:35 /f /rl HIGHEST

:: 4. Market Wrap: Mon-Fri at 17:20 PM
echo [*] Creating Task: Onicorn_Market_Wrap (17:20 Mon-Fri)...
schtasks /create /tn "Onicorn_Market_Wrap" /tr "\"%RUNNER%\" market_wrap" /sc weekly /d MON,TUE,WED,THU,FRI /st 17:20 /f /rl HIGHEST

echo.
echo ============================================================
echo [SUCCESS] All 4 Windows Scheduled Tasks created successfully!
echo.
echo View and manage tasks anytime in "Task Scheduler" (taskschd.msc)
echo ============================================================
echo.
pause
