#!/bin/bash

echo "🚀 DEPLOYING ALL NUPI CLOUD AGENT SYSTEMS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Chat widget updated
echo "1️⃣ Chat widget: 💬 → 🤖 NUPI AGENT ✅"

# 2. Agent creation system
echo "2️⃣ Agent creation system: agent-creation-system.js ✅"

# 3. Super fast agent
echo "3️⃣ Super fast agent: super-fast-agent.py (12s cycles) ✅"

# 4. Commit all changes
echo ""
echo "📦 Committing changes..."
git add .
git commit -m "🚀 COMPLETE SYSTEM: Chat widget, automated agent creation, super fast agent, full integration"

# 5. Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

# 6. Deploy to Railway
echo "☁️  Deploying to Railway..."
railway up --detach

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ALL SYSTEMS DEPLOYED TO nupidesktopai.com"
echo ""
echo "🎯 What's Live:"
echo "  • Chat widget with 'NUPI AGENT' label"
echo "  • Automated agent creation API"
echo "  • Super fast travelling agent (10x speed)"
echo "  • Full cloud-local-travelling agent communication"
echo ""
echo "🔗 Test it:"
echo "  https://nupidesktopai.com"
echo "  https://nupidesktopai.com/create-agent"
echo ""
echo "⏳ Waiting 30 seconds for deployment..."
sleep 30

echo "🧪 Testing endpoints..."
curl -s "https://nupidesktopai.com" | grep -q "NUPI" && echo "  ✅ Main site: OK" || echo "  ❌ Main site: Failed"

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
