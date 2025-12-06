#!/bin/bash

# 🚀 NUPI LOCAL DESKTOP AGENT - START SCRIPT
# Automatically starts the autonomous desktop agent on your Mac

echo "🤖 NUPI LOCAL DESKTOP AGENT - LAUNCHER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed!"
    echo "📦 Install it with: brew install python3"
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Check if psutil is installed
if ! python3 -c "import psutil" 2>/dev/null; then
    echo "📦 Installing required package: psutil..."
    pip3 install psutil requests
fi

# Check if requests is installed
if ! python3 -c "import requests" 2>/dev/null; then
    echo "📦 Installing required package: requests..."
    pip3 install requests
fi

echo "✅ All dependencies installed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Make the Python script executable
chmod +x local-desktop-agent.py

# Start the agent
echo "🚀 Starting NUPI Local Desktop Agent..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
python3 local-desktop-agent.py
