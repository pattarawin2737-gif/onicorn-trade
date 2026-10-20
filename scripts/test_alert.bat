@echo off
setlocal
chcp 65001 >nul
title Onicorn Trade - Telegram Alert Test

echo ============================================================
echo [Onicorn Trade] Testing Telegram Alert (Windows)
echo ============================================================
echo.

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM Locate Python executable
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "PYTHON_BIN=python"
    goto run_test
)
where py >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "PYTHON_BIN=py"
    goto run_test
)
if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
    set "PYTHON_BIN=%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
    goto run_test
)
if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
    set "PYTHON_BIN=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
    goto run_test
)
if exist "C:\Python311\python.exe" (
    set "PYTHON_BIN=C:\Python311\python.exe"
    goto run_test
)
if exist "C:\Python312\python.exe" (
    set "PYTHON_BIN=C:\Python312\python.exe"
    goto run_test
)

echo [ERROR] Python not found!
echo Please run vps_setup.bat first to install Python.
goto finish

:run_test
echo [*] Python: %PYTHON_BIN%
echo.
"%PYTHON_BIN%" "%SCRIPT_DIR%test_vps_alert.py"

:finish
echo.
echo ============================================================
echo Press any key to close this window...
echo ============================================================
pause >nul
