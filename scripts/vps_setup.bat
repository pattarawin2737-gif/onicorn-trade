@echo off
setlocal
chcp 65001 >nul

echo ============================================================
echo [Onicorn Trade] Windows VPS Setup
echo ============================================================

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    where py >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [!] Python is NOT installed on this Windows server!
        echo.
        echo Please install Python for Windows:
        echo 1. Download Python 3.11 or 3.12 installer from:
        echo    https://www.python.org/downloads/
        echo 2. IMPORTANT: Check the box "Add Python to PATH" during installation!
        echo 3. Run this script again after installation.
        echo.
        pause
        exit /b 1
    )
    set "PYTHON_CMD=py"
) else (
    set "PYTHON_CMD=python"
)

echo [*] Python detected:
%PYTHON_CMD% --version

echo [*] Upgrading pip and installing requirements...
%PYTHON_CMD% -m pip install --upgrade pip
if exist requirements.txt (
    %PYTHON_CMD% -m pip install -r requirements.txt
) else (
    %PYTHON_CMD% -m pip install playwright>=1.40.0
)

echo [*] Installing Playwright Chromium browser (for Oil Chart)...
%PYTHON_CMD% -m playwright install chromium

echo.
echo ============================================================
echo [SUCCESS] Windows VPS Setup Completed!
echo ============================================================
echo.
echo Next steps:
echo 1. Double-click "test_alert.bat" to verify Telegram alerts
echo 2. Right-click "install_windows_scheduler.bat" and select "Run as administrator"
echo    to automatically install all 4 daily tasks into Windows Task Scheduler!
echo.
pause
