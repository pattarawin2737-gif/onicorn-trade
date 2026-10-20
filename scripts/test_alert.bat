@echo off
chcp 65001 >nul
echo ============================================================
echo [Onicorn Trade] Testing Telegram Alert (Windows)
echo ============================================================
echo.
call "%~dp0run_vps_alert.bat" test
echo.
pause
