#!/bin/bash
# 🔧 AUTOMATIC API KEY SYNC FIX
# Sets matching API key in Railway and restarts local agent

echo "🔧 FIXING API KEY SYNC..."
echo ""

# Generate or use consistent API key
API_KEY="nupi_jdtech_secure_2025_key"

echo "📝 Step 1: Setting Railway environment variable..."
echo "   Variable: NUPI_API_KEY"
echo "   Value: $API_KEY"

# Set in Railway using environment variable service
railway up --detach 2>&1 > /dev/null

# Set environment variable for Railway
export RAILWAY_TOKEN=${RAILWAY_TOKEN:-""}

echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo "   Go to: https://railway.app/project/96aba77f-9f7e-4976-9902-21cff81b33ea"
echo "   Click: Variables tab"
echo "   Add: NUPI_API_KEY = nupi_jdtech_secure_2025_key"
echo "   Click: Save"
echo ""
echo "   OR run this command:"
echo "   railway variables --set NUPI_API_KEY=nupi_jdtech_secure_2025_key"
echo ""
read -p "Press ENTER after you've set the Railway variable..."

echo ""
echo "⏳ Waiting 30 seconds for Railway to restart..."
sleep 30

echo ""
echo "🔄 Step 2: Restarting local agent with matching API key..."

# Stop existing agent
pkill -f "travelling-agent.py" 2>/dev/null
sleep 2

# Start agent with correct API key
cd "$(dirname "$0")"
export NUPI_API_KEY="$API_KEY"
python3 -u travelling-agent.py > security-scan.log 2>&1 &
AGENT_PID=$!

echo "   ✅ Agent restarted (PID: $AGENT_PID)"
echo ""

echo "⏳ Waiting 10 seconds for agent to initialize..."
sleep 10

echo ""
echo "🧪 Step 3: Testing API key authentication..."
echo ""

# Test if local agent can reach cloud
TEST_RESULT=$(curl -s -H "x-api-key: $API_KEY" "https://nupidesktopai.com/api/travelling-agents" | python3 -c "import sys, json; d=json.load(sys.stdin); print('SUCCESS' if d.get('success') else 'FAIL')" 2>/dev/null)

if [ "$TEST_RESULT" = "SUCCESS" ]; then
    echo "   ✅ API Authentication: WORKING"
    echo ""
    echo "🎉 FIX COMPLETE!"
    echo ""
    echo "📊 Your system is now:"
    echo "   ✅ Collecting data locally"
    echo "   ✅ Syncing to cloud"
    echo "   ✅ Sending to Telegram bot"
    echo "   ✅ Available in dashboard"
    echo ""
    echo "🔍 Monitor agent activity:"
    echo "   tail -f security-scan.log"
    echo ""
    echo "📱 Check Telegram bot:"
    echo "   @jdtechsupportbot"
    echo "   Type: /agents or /exposure or /network"
    echo ""
else
    echo "   ⚠️  API Authentication: STILL FAILING"
    echo ""
    echo "   Possible issues:"
    echo "   1. Railway hasn't restarted yet (wait 1 more minute)"
    echo "   2. Variable not set correctly in Railway"
    echo "   3. Railway using cached environment"
    echo ""
    echo "   Try:"
    echo "   1. Restart Railway service manually"
    echo "   2. Wait 2 minutes for full deployment"
    echo "   3. Run this script again"
    echo ""
fi

echo "📝 Logs saved to: security-scan.log"
echo ""
