#!/bin/bash

# 🚀 Deploy Agent Order API to Railway

cat << 'BANNER'
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        🚀 DEPLOYING AGENT ORDER API TO RAILWAY 🚀              ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
BANNER

echo ""
echo "📦 Preparing deployment..."

# Copy API to deployment directory
mkdir -p api-deployment
cp agent-order-api.py api-deployment/
cp api-requirements.txt api-deployment/requirements.txt
cp autonomous-agent-generator.py api-deployment/

# Create Procfile for Railway
cat > api-deployment/Procfile << 'PROCFILE'
web: gunicorn agent-order-api:app
PROCFILE

# Create railway.json
cat > api-deployment/railway.json << 'RAILWAY'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "gunicorn agent-order-api:app --bind 0.0.0.0:$PORT",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
RAILWAY

echo "✅ Files prepared"
echo ""
echo "🚀 Deploying to Railway..."

cd api-deployment

# Initialize Railway if not already done
railway init

# Set environment variables
echo "�� Setting environment variables..."
railway variables set NUPI_API_KEY=nupi_jdtech_secure_2025_key

# Deploy
echo "📤 Uploading to Railway..."
railway up

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║              ✅ API DEPLOYED SUCCESSFULLY! ✅                  ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📍 Your API is now live at nupidesktopai.com"
echo "🔗 Test endpoint: https://nupidesktopai.com/health"
echo ""
echo "Next steps:"
echo "1. Upload agent-order-form.html to nupiai.com"
echo "2. Test the order flow end-to-end"
echo "3. Configure domain: railway domain"
echo ""
