#!/bin/bash
# Test nupidesktopai.com for all features

echo "🧪 Testing nupidesktopai.com..."
echo ""

# Test 1: Health Check
echo "1️⃣ Testing /health endpoint..."
HEALTH=$(curl -s https://nupidesktopai.com/health)
echo "$HEALTH" | python3 -m json.tool

# Check for new features
if echo "$HEALTH" | grep -q "Financial Security Scanner"; then
    echo "✅ Financial Security Scanner: FOUND"
else
    echo "❌ Financial Security Scanner: MISSING (needs deployment)"
fi

if echo "$HEALTH" | grep -q "Android Device Full Access"; then
    echo "✅ Android Agent: FOUND"
else
    echo "❌ Android Agent: MISSING (needs deployment)"
fi

if echo "$HEALTH" | grep -q "WiFi Router Full Access"; then
    echo "✅ Router Agent: FOUND"
else
    echo "❌ Router Agent: MISSING (needs deployment)"
fi

echo ""
echo "2️⃣ Testing /api/security/dashboard endpoint..."
SECURITY=$(curl -s https://nupidesktopai.com/api/security/dashboard)
if echo "$SECURITY" | grep -q "success"; then
    echo "✅ Security Dashboard: WORKING"
    echo "$SECURITY" | python3 -m json.tool
else
    echo "❌ Security Dashboard: NOT FOUND (needs deployment)"
    echo "Response: $SECURITY"
fi

echo ""
echo "3️⃣ Testing /api/android endpoint..."
ANDROID=$(curl -s https://nupidesktopai.com/api/android)
if echo "$ANDROID" | grep -q "success"; then
    echo "✅ Android Endpoint: WORKING"
    echo "$ANDROID" | python3 -m json.tool
else
    echo "❌ Android Endpoint: NOT FOUND (needs deployment)"
    echo "Response: $ANDROID"
fi

echo ""
echo "4️⃣ Testing /api/routers endpoint..."
ROUTER=$(curl -s https://nupidesktopai.com/api/routers)
if echo "$ROUTER" | grep -q "success"; then
    echo "✅ Router Endpoint: WORKING"
    echo "$ROUTER" | python3 -m json.tool
else
    echo "❌ Router Endpoint: NOT FOUND (needs deployment)"
    echo "Response: $ROUTER"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 TEST SUMMARY:"
echo ""
echo "Server Status: $(echo "$HEALTH" | grep -q "healthy" && echo "✅ RUNNING" || echo "❌ DOWN")"
echo ""
echo "Deployed Features:"
OLD_FEATURES=$(echo "$HEALTH" | grep -o '"features":.*' | wc -l)
echo "  Total features in response: $OLD_FEATURES"
echo ""
echo "⚠️  MISSING FEATURES (need to deploy):"
echo "  - Enhanced Local Agents (emails, messages, photos)"
echo "  - Android Agent (full device access)"
echo "  - WiFi Router Agent (network access)"
echo "  - Financial Security Scanner (vulnerability detection)"
echo "  - 7 new security endpoints"
echo ""
echo "📦 Local commits ready to deploy: 5"
echo "   - 040d6ca: Enhanced local agents"
echo "   - 2d33c92: Android + Router agents"
echo "   - f486004: Financial Security Scanner"
echo "   - a5ca9c9: Documentation"
echo "   - 9f9e010: Deployment guide"
echo ""
echo "🚀 TO DEPLOY:"
echo "   1. Go to https://railway.app/project/96aba77f-9f7e-4976-9902-21cff81b33ea"
echo "   2. Click 'Deployments' tab"
echo "   3. Click 'Redeploy' or push code to trigger auto-deploy"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
