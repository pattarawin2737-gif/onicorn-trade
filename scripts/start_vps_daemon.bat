@echo off
chcp 65001 >nul
title Onicorn Trade - VPS Alert Daemon (24/7)
cd /d "%~dp0"

echo ============================================================
echo [Onicorn Trade] Starting Standalone VPS Alert Daemon...
echo Keep this window open or minimized to run alerts 24/7.
echo ============================================================
echo.

where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    python vps_daemon.py
) else (
    py vps_daemon.py
)

pause
