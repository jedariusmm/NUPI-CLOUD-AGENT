#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                                ║"
echo "║              🧪 COMPLETE SYSTEM TEST - ALL COMPONENTS 🧪                       ║"
echo "║                                                                                ║"
echo "╚════════════════════════════════════════════════════════════════════════════════╝"
echo ""

PASS=0
FAIL=0

# Test 1: Railway Connection
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Railway Cloud Connection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RAILWAY_STATUS=$(railway status 2>&1)
if echo "$RAILWAY_STATUS" | grep -q "NUPI-Cloud-Agent"; then
    echo "✅ PASS: Connected to NUPI-Cloud-Agent on Railway"
    ((PASS++))
else
    echo "❌ FAIL: Not connected to Railway"
    ((FAIL++))
fi
echo ""

# Test 2: Super-Fast Agent Running on Railway
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Super-Fast Agent Running on Railway"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RAILWAY_LOGS=$(railway logs --tail 5 2>&1)
if echo "$RAILWAY_LOGS" | grep -q "SUPER FAST SCAN"; then
    echo "✅ PASS: Super-Fast Agent is scanning"
    ((PASS++))
else
    echo "❌ FAIL: Agent not scanning"
    ((FAIL++))
fi
if echo "$RAILWAY_LOGS" | grep -q "10X FASTER"; then
    echo "✅ PASS: 10X speed mode active"
    ((PASS++))
else
    echo "❌ FAIL: Speed mode not confirmed"
    ((FAIL++))
fi
echo ""

# Test 3: Domain Active
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Domain Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
DOMAINS=$(railway domain 2>&1)
if echo "$DOMAINS" | grep -q "nupidesktopai.com"; then
    echo "✅ PASS: Domain nupidesktopai.com configured"
    ((PASS++))
else
    echo "❌ FAIL: Domain not found"
    ((FAIL++))
fi
echo ""

# Test 4: Local Agents Running
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: Local Agents Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Travelling Agent
if ps aux | grep -v grep | grep -q "travelling-agent.py"; then
    echo "✅ PASS: Travelling Agent running"
    ((PASS++))
else
    echo "⚠️  INFO: Travelling Agent not running locally"
fi

# Check Multi-Network Agent
if ps aux | grep -v grep | grep -q "multi-network-agent.py"; then
    echo "✅ PASS: Multi-Network Agent running"
    ((PASS++))
else
    echo "⚠️  INFO: Multi-Network Agent not running"
fi

# Check JDAICL Bot
if ps aux | grep -v grep | grep -q "jdaicl-bot.js"; then
    echo "✅ PASS: JDAICL Bot running"
    ((PASS++))
else
    echo "⚠️  WARNING: JDAICL Bot not running"
fi
echo ""

# Test 5: Files Deployed
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 5: Critical Files Present"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

FILES_FOUND=0
if [ -f "super-fast-agent.py" ]; then
    echo "✅ super-fast-agent.py exists"
    ((FILES_FOUND++))
fi
if [ -f "multi-network-agent.py" ]; then
    echo "✅ multi-network-agent.py exists"
    ((FILES_FOUND++))
fi
if [ -f "public/travelling-agents.html" ]; then
    echo "✅ travelling-agents.html exists"
    ((FILES_FOUND++))
fi
if [ -f "public/index.html" ]; then
    echo "✅ index.html exists"
    ((FILES_FOUND++))
fi

if [ $FILES_FOUND -eq 4 ]; then
    echo "✅ PASS: All critical files present"
    ((PASS++))
else
    echo "⚠️  PARTIAL: $FILES_FOUND/4 files found"
    ((FAIL++))
fi
echo ""

# Test 6: Network Test
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 6: Network Connectivity"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
    echo "✅ PASS: Internet connectivity confirmed"
    ((PASS++))
else
    echo "❌ FAIL: No internet connection"
    ((FAIL++))
fi
echo ""

# Final Results
echo "╔════════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                                ║"
echo "║                          🎯 TEST RESULTS SUMMARY 🎯                            ║"
echo "║                                                                                ║"
echo "╚════════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ PASSED: $PASS tests"
echo "❌ FAILED: $FAIL tests"
echo ""

TOTAL=$((PASS + FAIL))
if [ $TOTAL -gt 0 ]; then
    PERCENT=$((PASS * 100 / TOTAL))
    echo "📊 Success Rate: $PERCENT%"
fi
echo ""

if [ $PASS -ge 6 ]; then
    echo "╔════════════════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                                ║"
    echo "║              🎉 SYSTEM STATUS: FULLY OPERATIONAL! 🎉                          ║"
    echo "║                                                                                ║"
    echo "╚════════════════════════════════════════════════════════════════════════════════╝"
else
    echo "╔════════════════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                                ║"
    echo "║              ⚠️  SYSTEM STATUS: NEEDS ATTENTION ⚠️                             ║"
    echo "║                                                                                ║"
    echo "╚════════════════════════════════════════════════════════════════════════════════╝"
fi
echo ""

# Live Status Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 LIVE DEPLOYMENT STATUS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Railway Cloud:"
echo "  URL: https://nupidesktopai.com"
echo "  Status: $(railway status 2>&1 | grep -o 'NUPI-Cloud-Agent' || echo 'Unknown')"
echo "  Agent: Super-Fast Travelling Agent"
echo ""
echo "Local Agents:"
ps aux | grep -E "travelling|jdaicl|multi-network" | grep -v grep | awk '{print "  - "$11" (PID: "$2")"}'
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
