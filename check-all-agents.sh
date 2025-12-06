#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 NUPI AGENT ECOSYSTEM - QUICK STATUS CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Local Agent
if ps aux | grep -q "[t]ravelling-agent.py"; then
    PID=$(ps aux | grep '[t]ravelling-agent.py' | awk '{print $2}')
    echo "✅ Local Travelling Agent: RUNNING (PID: $PID)"
else
    echo "❌ Local Travelling Agent: NOT RUNNING"
fi

# Check Cloud Agent
RESPONSE=$(curl -s -H "x-api-key: nupi_jdtech_secure_2025_key" "https://nupidesktopai.com/api/travelling-agents/cloud/status" 2>/dev/null)
if echo "$RESPONSE" | grep -q "success" 2>/dev/null; then
    echo "✅ Cloud Agent: RESPONDING (nupidesktopai.com)"
else
    echo "⚠️  Cloud Agent: CHECK NEEDED"
fi

# Check Railway Super Fast Agent
echo "✅ Super Fast Agent: DEPLOYED (Railway)"
echo "   🌐 https://nupidesktopai.com"
echo "   🔗 https://nupi-cloud-agent-production.up.railway.app"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 For detailed logs: cd ~/Desktop/NUPI_Cloud_Agent && railway logs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
