#!/bin/bash

echo "🌍 TESTING CLOUD AGENT CONNECTIVITY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "1️⃣ Testing Cloud Agent Status..."
CLOUD_STATUS=$(curl -s -H "x-api-key: nupi_jdtech_secure_2025_key" \
  "https://nupidesktopai.com/api/travelling-agents/cloud/status")

if echo "$CLOUD_STATUS" | grep -q "Unauthorized"; then
    echo "   ❌ CANNOT CONNECT - 401 Unauthorized"
    echo "   🔑 Railway API key NOT set or wrong"
else
    echo "   ✅ CONNECTED!"
    echo "$CLOUD_STATUS" | python3 -m json.tool | head -15
fi

echo ""
echo "2️⃣ Testing All Travelling Agents..."
ALL_AGENTS=$(curl -s -H "x-api-key: nupi_jdtech_secure_2025_key" \
  "https://nupidesktopai.com/api/travelling-agents")

if echo "$ALL_AGENTS" | grep -q "Unauthorized"; then
    echo "   ❌ CANNOT ACCESS - 401 Unauthorized"
else
    AGENT_COUNT=$(echo "$ALL_AGENTS" | grep -o '"total_agents":[0-9]*' | cut -d: -f2)
    echo "   ✅ Connected! Found $AGENT_COUNT agents"
fi

echo ""
echo "3️⃣ Local Agent Status..."
if ps aux | grep -q "[t]ravelling-agent.py"; then
    echo "   ✅ Local agent RUNNING (PID: $(ps aux | grep '[t]ravelling-agent.py' | awk '{print $2}'))"
    echo "   📊 Last activity:"
    tail -5 security-scan.log 2>/dev/null | sed 's/^/      /'
else
    echo "   ❌ Local agent NOT running"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
if echo "$CLOUD_STATUS" | grep -q "Unauthorized"; then
    echo "🚨 ACTION REQUIRED:"
    echo "   Set NUPI_API_KEY in Railway dashboard"
    echo "   Value: nupi_jdtech_secure_2025_key"
    echo ""
    echo "   Dashboard: https://railway.app/project/96aba77f-9f7e-4976-9902-21cff81b33ea"
else
    echo "✅ ALL SYSTEMS OPERATIONAL!"
fi
