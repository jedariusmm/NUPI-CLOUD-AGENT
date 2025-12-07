#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║         🚀 STARTING NUPI AGENTS - FULL SYSTEM                   ║"
echo "╚══════════════════════════════════════════════════════════════════╝"

cd /Users/jedariusmaxwell/Desktop/NUPI_Cloud_Agent/railway-superfast

# Kill any existing agents
echo "🧹 Cleaning up old agents..."
pkill -f "stealth-agent-telegram.py" 2>/dev/null
pkill -f "unified_agent_system.py" 2>/dev/null
sleep 2

# Start stealth agent (Telegram controlled)
echo ""
echo "1️⃣  Starting Stealth Agent (Telegram Control)..."
python3 stealth-agent-telegram.py > stealth_agent.log 2>&1 &
STEALTH_PID=$!
sleep 3

if ps -p $STEALTH_PID > /dev/null 2>&1; then
    echo "   ✅ Stealth Agent running (PID: $STEALTH_PID)"
    echo "   📱 Telegram: @JDTechSupportbot"
else
    echo "   ❌ Stealth Agent failed"
    echo "   📋 Log:"
    tail -10 stealth_agent.log
fi

# Start unified system (local desktop agent)
echo ""
echo "2️⃣  Starting Unified Agent System (Local Desktop Agent)..."
python3 unified_agent_system.py > unified_agent.log 2>&1 &
UNIFIED_PID=$!
sleep 3

if ps -p $UNIFIED_PID > /dev/null 2>&1; then
    echo "   ✅ Unified System running (PID: $UNIFIED_PID)"
else
    echo "   ❌ Unified System failed"
    echo "   📋 Log:"
    tail -10 unified_agent.log
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 AGENT STATUS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ps aux | grep -E "python.*agent" | grep -v grep | awk '{print "   🟢 PID " $2 ": " $11}'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 TELEGRAM COMMANDS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  /status  - Check agent status"
echo "  /scan    - Scan WiFi network"
echo "  /devices - List all devices on WiFi"
echo "  /control - Control specific device"
echo "  /travel  - Start traveling on WiFi"
echo "  /help    - Show all commands"
echo ""
echo "📱 Bot: @JDTechSupportbot"
echo "☁️  Cloud: https://nupidesktopai.com"
echo ""
echo "✅ AGENTS STARTED!"
