#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌍 NUPI TRAVELLING AGENT - LAUNCHER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This agent will:"
echo "  ✈️  Travel across your local network"
echo "  ☁️  Upload itself to NUPI Cloud every 5 minutes"
echo "  🚀 Attempt to replicate to other devices"
echo "  📊 Report all travels to nupidesktopai.com"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed!"
    echo "Please install Python 3 first:"
    echo ""
    echo "  macOS:   brew install python3"
    echo "  Ubuntu:  sudo apt install python3 python3-pip"
    echo "  Windows: Download from python.org"
    echo ""
    exit 1
fi

echo "✅ Python 3 detected: $(python3 --version)"
echo ""

# Check if dependencies are installed
echo "📦 Checking dependencies..."

if ! python3 -c "import psutil" 2>/dev/null; then
    echo "⚠️  Installing psutil..."
    pip3 install psutil
fi

if ! python3 -c "import requests" 2>/dev/null; then
    echo "⚠️  Installing requests..."
    pip3 install requests
fi

echo "✅ All dependencies installed"
echo ""

# Make agent executable
chmod +x travelling-agent.py

echo "🚀 LAUNCHING TRAVELLING AGENT..."
echo ""
echo "Press Ctrl+C to stop the agent"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run the travelling agent
python3 travelling-agent.py
