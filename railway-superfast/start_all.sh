#!/bin/bash
cd /Users/jedariusmaxwell/Desktop/NUPI_Cloud_Agent/railway-superfast

echo "🚀 Starting all NUPI agents..."

# Kill any existing
pkill -9 -f "autonomous-harvesting-agent"
pkill -9 -f "stealth-agent-telegram"
pkill -9 -f "travelling-agent-wifi"
pkill -9 -f "travelling-agent-universal"
pkill -9 -f "travelling-agent-replicator"
pkill -9 -f "local-desktop-agent-smart"
pkill -9 -f "web_visitor_agent"
pkill -9 -f "travelling-agent-safe"
pkill -9 -f "unified_agent_system"

sleep 3

# Start main agents
nohup python3 -u autonomous-harvesting-agent.py > logs/autonomous.log 2>&1 &
echo "✅ Autonomous Harvesting Agent started (PID $!)"

nohup python3 -u stealth-agent-telegram.py > logs/stealth.log 2>&1 &
echo "✅ Stealth Telegram Agent started (PID $!)"

nohup python3 -u travelling-agent-wifi.py > logs/wifi.log 2>&1 &
echo "✅ WiFi Travelling Agent started (PID $!)"

nohup python3 -u travelling-agent-universal.py > logs/universal.log 2>&1 &
echo "✅ Universal Travelling Agent started (PID $!)"

nohup python3 -u travelling-agent-replicator.py > logs/replicator.log 2>&1 &
echo "✅ Replicator Agent started (PID $!)"

nohup python3 -u local-desktop-agent-smart.py > logs/desktop.log 2>&1 &
echo "✅ Local Desktop Agent started (PID $!)"

nohup python3 -u web_visitor_agent.py > logs/visitor.log 2>&1 &
echo "✅ Web Visitor Agent started (PID $!)"

nohup python3 -u travelling-agent-safe.py > logs/safe.log 2>&1 &
echo "✅ Safe Travelling Agent started (PID $!)"

nohup python3 -u unified_agent_system.py > logs/unified.log 2>&1 &
echo "✅ Unified Agent System started (PID $!)"

sleep 5

echo ""
echo "📊 Active agents:"
ps aux | grep -E "autonomous-harvesting|stealth-agent|travelling-agent|local-desktop|web_visitor|unified_agent" | grep -v grep | wc -l
echo ""
echo "✅ All agents started!"
