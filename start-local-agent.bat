@echo off
REM 🚀 NUPI LOCAL DESKTOP AGENT - WINDOWS LAUNCHER
REM Works on all Windows computers - Windows 10, 11, etc.

echo 🤖 NUPI LOCAL DESKTOP AGENT - WINDOWS LAUNCHER
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed!
    echo 📦 Download Python from: https://www.python.org/downloads/
    echo    Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo ✅ Python found: 
python --version

REM Check if psutil is installed
python -c "import psutil" 2>nul
if errorlevel 1 (
    echo 📦 Installing required package: psutil...
    pip install psutil requests
)

REM Check if requests is installed
python -c "import requests" 2>nul
if errorlevel 1 (
    echo 📦 Installing required package: requests...
    pip install requests
)

echo ✅ All dependencies installed
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REM Make sure we're in the right directory
cd /d "%~dp0"

REM Start the agent
echo 🚀 Starting NUPI Local Desktop Agent...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
python local-desktop-agent.py

pause
