#!/bin/bash
# 🚀 ONE-COMMAND RAILWAY API KEY FIX
# This sets the API key directly in Railway environment

echo "🔧 SETTING RAILWAY API KEY..."
echo ""

API_KEY="nupi_jdtech_secure_2025_key"

# Using Railway CLI to set environment variable
cd /Users/jedariusmaxwell/Desktop/NUPI_Cloud_Agent

echo "Setting NUPI_API_KEY in Railway..."
railway run --service NUPI-Cloud-Agent bash -c "export NUPI_API_KEY='$API_KEY' && echo Variable set" 2>&1

echo ""
echo "⚠️  If that didn't work, set it manually:"
echo ""
echo "1. Go to: https://railway.app"
echo "2. Open: NUPI-Cloud-Agent project"
echo "3. Click: Variables"
echo "4. Add variable:"
echo "   Name: NUPI_API_KEY"
echo "   Value: nupi_jdtech_secure_2025_key"
echo "5. Save"
echo ""
echo "Then run: ./restart-agent-with-key.sh"
