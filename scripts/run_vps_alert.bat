@echo off
setlocal
chcp 65001 >nul

set "RUNNER_ENV=vps"
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM Locate Python executable
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "PYTHON_BIN=python"
    goto got_python
)
where py >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "PYTHON_BIN=py"
    goto got_python
)
if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
    set "PYTHON_BIN=%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
    goto got_python
)
if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
    set "PYTHON_BIN=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
    goto got_python
)
if exist "C:\Python311\python.exe" (
    set "PYTHON_BIN=C:\Python311\python.exe"
    goto got_python
)
if exist "C:\Python312\python.exe" (
    set "PYTHON_BIN=C:\Python312\python.exe"
    goto got_python
)
if exist "%SCRIPT_DIR%venv\Scripts\python.exe" (
    set "PYTHON_BIN=%SCRIPT_DIR%venv\Scripts\python.exe"
    goto got_python
)

echo [ERROR] Python is not found!
exit /b 1

:got_python
set "TASK=%~1"
set "EXTRA=%~2"
if "%TASK%"=="" set "TASK=all"

echo ============================================================
echo [Onicorn Trade] VPS Alert Runner (Windows Mode)
echo Time: %date% %time%
echo Task: %TASK% %EXTRA%
echo Python: %PYTHON_BIN%
echo ============================================================

REM Check for cloud script updates (Auto-updater)
if exist "%SCRIPT_DIR%self_update.py" (
    "%PYTHON_BIN%" "%SCRIPT_DIR%self_update.py"
)

if /i "%TASK%"=="morning" goto do_morning
if /i "%TASK%"=="gold_news" goto do_gold_news
if /i "%TASK%"=="oil_chart" goto do_oil_chart
if /i "%TASK%"=="daily_stocks" goto do_daily_stocks
if /i "%TASK%"=="weekly_sector" goto do_weekly_sector
if /i "%TASK%"=="monthly_sector" goto do_monthly_sector
if /i "%TASK%"=="intraday" goto do_intraday
if /i "%TASK%"=="market_wrap" goto do_market_wrap
if /i "%TASK%"=="test" goto do_test
goto finish

:do_morning
echo [1/2] Running Gold News Digest...
"%PYTHON_BIN%" "%SCRIPT_DIR%send_gold_news.py" %EXTRA%
echo [2/2] Running Thai Stock Morning Alerts (Daily Stocks, Weekly Sector on Mon, Monthly Sector on 1st)...
"%PYTHON_BIN%" "%SCRIPT_DIR%send_thai_stock_alerts.py" --type morning_alerts %EXTRA%
goto finish

:do_gold_news
"%PYTHON_BIN%" "%SCRIPT_DIR%send_gold_news.py" %EXTRA%
goto finish

:do_oil_chart
echo Running WTI Crude Oil Chart...
"%PYTHON_BIN%" "%SCRIPT_DIR%send_oil_chart.py" %EXTRA%
goto finish

:do_daily_stocks
"%PYTHON_BIN%" "%SCRIPT_DIR%send_thai_stock_alerts.py" --type daily_stocks %EXTRA%
goto finish

:do_weekly_sector
"%PYTHON_BIN%" "%SCRIPT_DIR%send_thai_stock_alerts.py" --type weekly_sector %EXTRA%
goto finish

:do_monthly_sector
"%PYTHON_BIN%" "%SCRIPT_DIR%send_thai_stock_alerts.py" --type monthly_sector %EXTRA%
goto finish

:do_intraday
echo Running Intraday Breakout Alert...
"%PYTHON_BIN%" "%SCRIPT_DIR%send_thai_stock_alerts.py" --type intraday_alert %EXTRA%
goto finish

:do_market_wrap
echo Running End-of-Day Market Wrap...
"%PYTHON_BIN%" "%SCRIPT_DIR%send_thai_stock_alerts.py" --type market_wrap %EXTRA%
goto finish

:do_test
"%PYTHON_BIN%" "%SCRIPT_DIR%test_vps_alert.py"
goto finish

:finish
echo.
echo [Task finished]
