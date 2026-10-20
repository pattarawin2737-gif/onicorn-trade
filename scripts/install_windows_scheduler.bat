@echo off
setlocal
chcp 65001 >nul

echo ============================================================
echo [Onicorn Trade] Installing Windows Task Scheduler Alerts
echo ============================================================
echo.

REM Check for Administrator privileges
net session >nul 2>&1
if %ERRORLEVEL% EQU 0 goto is_admin

echo [!] ERROR: Administrator privileges required!
echo.
echo Please right-click install_windows_scheduler.bat and select:
echo "Run as administrator"
echo.
pause
exit /b 1

:is_admin
set "SCRIPT_DIR=%~dp0"
set "RUNNER=%SCRIPT_DIR%run_vps_alert.bat"

echo Target Runner: %RUNNER%
echo.

echo [*] Creating Task: Onicorn_Morning_Alert (07:45 Mon-Fri)...
schtasks /create /tn "Onicorn_Morning_Alert" /tr "\"%RUNNER%\" morning" /sc weekly /d MON,TUE,WED,THU,FRI /st 07:45 /f /rl HIGHEST

echo [*] Creating Task: Onicorn_Oil_Chart (08:00 Tue)...
schtasks /create /tn "Onicorn_Oil_Chart" /tr "\"%RUNNER%\" oil_chart" /sc weekly /d TUE /st 08:00 /f /rl HIGHEST

echo [*] Creating Task: Onicorn_Intraday_Alert (14:35 Mon-Fri)...
schtasks /create /tn "Onicorn_Intraday_Alert" /tr "\"%RUNNER%\" intraday" /sc weekly /d MON,TUE,WED,THU,FRI /st 14:35 /f /rl HIGHEST

echo [*] Creating Task: Onicorn_Market_Wrap (17:20 Mon-Fri)...
schtasks /create /tn "Onicorn_Market_Wrap" /tr "\"%RUNNER%\" market_wrap" /sc weekly /d MON,TUE,WED,THU,FRI /st 17:20 /f /rl HIGHEST

echo.
echo ============================================================
echo [SUCCESS] All 4 Windows Scheduled Tasks created successfully!
echo View and manage tasks anytime in "Task Scheduler" (taskschd.msc)
echo ============================================================
echo.
pause
