#!/bin/bash
# 🔄 RESTART LOCAL AGENT WITH CORRECT API KEY

echo "🔄 RESTARTING TRAVELLING AGENT..."
echo ""

API_KEY="nupi_jdtech_secure_2025_key"

# Stop existing agent
echo "Stopping existing agent..."
pkill -f "travelling-agent.py" 2>/dev/null
sleep 2

# Start with correct API key
cd /Users/jedariusmaxwell/Desktop/NUPI_Cloud_Agent
export NUPI_API_KEY="$API_KEY"

echo "Starting agent with API key: ${API_KEY:0:20}..."
python3 -u travelling-agent.py > security-scan.log 2>&1 &
AGENT_PID=$!

echo "✅ Agent started (PID: $AGENT_PID)"
echo ""

# Wait a moment
sleep 5

# Check if agent is running
if ps -p $AGENT_PID > /dev/null 2>&1; then
    echo "✅ Agent is RUNNING"
    echo ""
    echo "📊 Watch live activity:"
    echo "   tail -f security-scan.log"
    echo ""
    echo "🧪 Test connection in 2 minutes when first scan completes"
else
    echo "❌ Agent failed to start"
    echo ""
    echo "Check logs:"
    echo "   cat security-scan.log"
fi

echo ""
echo "🔍 Recent activity:"
tail -10 security-scan.log
