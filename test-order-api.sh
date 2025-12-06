#!/bin/bash

echo "🧪 TESTING ORDER API..."
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Endpoint..."
HEALTH=$(curl -s https://nupidesktopai.com/health)
if echo "$HEALTH" | grep -q "healthy"; then
    echo "   ✅ Health check: PASSED"
else
    echo "   ❌ Health check: FAILED"
    echo "   Response: $HEALTH"
fi

echo ""

# Test 2: API Root
echo "2️⃣  Testing API Root..."
API_ROOT=$(curl -s https://nupidesktopai.com/)
if echo "$API_ROOT" | grep -q "NUPI Agent Order API"; then
    echo "   ✅ API root: PASSED"
else
    echo "   ❌ API root: FAILED"
fi

echo ""

# Test 3: Test Order Submission
echo "3️⃣  Testing Order Submission..."
ORDER_RESPONSE=$(curl -s -X POST https://nupidesktopai.com/api/agent-orders \
  -H "Content-Type: application/json" \
  -H "x-api-key: nupi_jdtech_secure_2025_key" \
  -d '{
    "plan": "pro",
    "agentName": "test-agent-auto",
    "platform": "telegram",
    "scanSpeed": 12,
    "customerEmail": "test@nupidesktopai.com",
    "customerName": "Test Customer",
    "parallelScanning": true,
    "cloudSync": true,
    "autoRestart": true
  }')

if echo "$ORDER_RESPONSE" | grep -q "success"; then
    echo "   ✅ Order submission: PASSED"
    echo "   Response: $ORDER_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ORDER_RESPONSE"
else
    echo "   ⚠️  Order submission response:"
    echo "   $ORDER_RESPONSE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ API Testing Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
