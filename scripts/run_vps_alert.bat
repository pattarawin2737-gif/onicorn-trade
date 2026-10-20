@echo off
setlocal
chcp 65001 >nul

set "RUNNER_ENV=vps"
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

:: Locate python3 executable
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "PYTHON_BIN=python"
) else (
    where py >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        set "PYTHON_BIN=py"
    ) else (
        if exist "%SCRIPT_DIR%venv\Scripts\python.exe" (
            set "PYTHON_BIN=%SCRIPT_DIR%venv\Scripts\python.exe"
        ) else (
            echo [ERROR] Python is not found in PATH!
            echo Please install Python 3 from https://www.python.org/downloads/
            echo Make sure to check 'Add Python to PATH' during installation.
            pause
            exit /b 1
        )
    )
)

set "TASK=%~1"
set "EXTRA=%~2"
if "%TASK%"=="" set "TASK=all"

echo ============================================================
echo [Onicorn Trade] VPS Alert Runner (Windows Mode)
echo Time: %date% %time%
echo Task: %TASK% %EXTRA%
echo Python: %PYTHON_BIN%
echo ============================================================

if /i "%TASK%"=="morning" (
    echo [1/4] Running Gold News Digest...
    "%PYTHON_BIN%" "%SCRIPT_DIR%send_gold_news.py" %EXTRA%
    echo [2/4] Running Daily Top Thai Stocks...
    "%PYTHON_BIN%" "%SCRIPT_DIR%send_thai_stock_alerts.py" --type daily_stocks %EXTRA%
    echo [3/4] Running Weekly Sector Rotation...
    "%PYTHON_BIN%" "%SCRIPT_DIR%send_thai_stock_alerts.py" --type weekly_sector %EXTRA%
    echo [4/4] Running Monthly Sector Outlook...
    "%PYTHON_BIN%" "%SCRIPT_DIR%send_thai_stock_alerts.py" --type monthly_sector %EXTRA%
    goto end
)

if /i "%TASK%"=="gold_news" (
    "%PYTHON_BIN%" "%SCRIPT_DIR%send_gold_news.py" %EXTRA%
    goto end
)

if /i "%TASK%"=="oil_chart" (
    echo Running WTI Crude Oil Chart...
    "%PYTHON_BIN%" "%SCRIPT_DIR%send_oil_chart.py" %EXTRA%
    goto end
)

if /i "%TASK%"=="daily_stocks" (
    "%PYTHON_BIN%" "%SCRIPT_DIR%send_thai_stock_alerts.py" --type daily_stocks %EXTRA%
    goto end
)

if /i "%TASK%"=="weekly_sector" (
    "%PYTHON_BIN%" "%SCRIPT_DIR%send_thai_stock_alerts.py" --type weekly_sector %EXTRA%
    goto end
)

if /i "%TASK%"=="monthly_sector" (
    "%PYTHON_BIN%" "%SCRIPT_DIR%send_thai_stock_alerts.py" --type monthly_sector %EXTRA%
    goto end
)

if /i "%TASK%"=="intraday" (
    echo Running Intraday Breakout Alert...
    "%PYTHON_BIN%" "%SCRIPT_DIR%send_thai_stock_alerts.py" --type intraday_alert %EXTRA%
    goto end
)

if /i "%TASK%"=="market_wrap" (
    echo Running End-of-Day Market Wrap...
    "%PYTHON_BIN%" "%SCRIPT_DIR%send_thai_stock_alerts.py" --type market_wrap %EXTRA%
    goto end
)

if /i "%TASK%"=="test" (
    echo Testing Telegram Connection (Force mode)...
    "%PYTHON_BIN%" "%SCRIPT_DIR%send_thai_stock_alerts.py" --type daily_stocks --force
    goto end
)

echo Usage: %~nx0 {morning^|gold_news^|oil_chart^|daily_stocks^|weekly_sector^|monthly_sector^|intraday^|market_wrap^|test} [--force]

:end
echo Task finished.
