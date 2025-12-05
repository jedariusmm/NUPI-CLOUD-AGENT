#!/bin/bash

echo "🚀 DEPLOYING NUPI CLOUD AGENT - AUTO-DEPLOY PAGES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# The files are in GitHub, Railway just needs to pull them
# Let's verify they're there and provide deployment options

echo "✅ FILES IN GITHUB:"
curl -s https://api.github.com/repos/jedariusmm/NUPI-CLOUD-AGENT/contents/public | grep -o '"name": "[^"]*html"' | head -5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 DEPLOYMENT OPTIONS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Option 1: Railway Web Dashboard (RECOMMENDED - 1 minute)"
echo "  1. Visit: https://railway.app/project/96aba77f-9f7e-4976-9902-21cff81b33ea"
echo "  2. Click: Settings → Deploy"
echo "  3. Click: 'Deploy Now' or 'Redeploy'"
echo ""
echo "Option 2: Railway CLI (if connection works)"
echo "  $ railway link"
echo "  $ railway up"
echo ""
echo "Option 3: GitHub Integration (PERMANENT SOLUTION)"
echo "  1. Visit: https://railway.app/project/96aba77f-9f7e-4976-9902-21cff81b33ea/settings"
echo "  2. Go to: Source/Deployments"
echo "  3. Connect: jedariusmm/NUPI-CLOUD-AGENT"
echo "  4. Branch: main"
echo "  5. Auto-deploy: ON"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 CURRENT STATUS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if auto-deploy page is live
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://nupidesktopai.com/auto-deploy.html)

if [ "$STATUS" = "200" ]; then
    echo "✅ AUTO-DEPLOY PAGE: LIVE!"
    echo "✅ Visit: https://nupidesktopai.com"
    echo ""
    echo "🎉 DEPLOYMENT COMPLETE!"
else
    echo "⏳ AUTO-DEPLOY PAGE: Not yet deployed (Status: $STATUS)"
    echo "📝 Action needed: Deploy via Railway dashboard"
    echo ""
    echo "Quick link: https://railway.app/project/96aba77f-9f7e-4976-9902-21cff81b33ea"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
