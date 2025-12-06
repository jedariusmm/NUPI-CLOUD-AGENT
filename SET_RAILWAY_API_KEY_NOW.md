# 🚨 URGENT: SET RAILWAY API KEY FOR FULL CLOUD CONNECTIVITY

## Current Status:
- ✅ Local travelling agent running (PID: 59257)
- ✅ Cloud agent code deployed to nupidesktopai.com
- ❌ API key mismatch causing 401 errors
- ❌ Local agent CANNOT sync data to cloud

## The Problem:
```
☁️  TRAVELLING TO CLOUD...
⚠️  Cloud upload status: 401
```

Local agent has API key: `nupi_jdtech_secure_2025_key`
Railway server has: Random/different API key

## 🔥 SOLUTION - 3 MINUTES TO FIX:

### Option 1: Set via Railway Dashboard (RECOMMENDED)
1. Go to: https://railway.app/project/96aba77f-9f7e-4976-9902-21cff81b33ea
2. Click: **Variables** tab
3. Click: **+ New Variable**
4. Add:
   - Name: `NUPI_API_KEY`
   - Value: `nupi_jdtech_secure_2025_key`
5. Click: **Add**
6. Railway auto-restarts (30 seconds)
7. Done! ✅

### Option 2: Set via Terminal
```bash
cd /Users/jedariusmaxwell/Desktop/NUPI_Cloud_Agent
railway variables --set NUPI_API_KEY=nupi_jdtech_secure_2025_key
```

## After Setting:

Wait 2 minutes, then check:

```bash
# Check if cloud is connected
curl -H "x-api-key: nupi_jdtech_secure_2025_key" \
  "https://nupidesktopai.com/api/travelling-agents/cloud/status"

# Should see:
# {"success": true, "agent_id": "...", "connected_devices": [...]}
```

## What This Enables:

Once API key is set on Railway:

1. ✅ Local agent → Cloud sync works
2. ✅ All devices visible in cloud dashboard
3. ✅ Exposure reports stored centrally
4. ✅ Telegram bot shows live data
5. ✅ Web dashboard shows all agents
6. ✅ Network scanning data collected 24/7

## Current Local Agent Activity:

The local agent IS working and scanning:
- ✅ Scanning WiFi network (192.168.12.x)
- ✅ Finding exposed ports (Port 445 SMB found)
- ✅ Detecting devices (9wxpzf2.lan, etc.)
- ❌ Just can't upload to cloud (401 errors)

## After You Set The Key:

Within 2 minutes you'll see:
- ✅ "Registered visit to cloud" (instead of 401)
- ✅ Dashboard shows your local agent
- ✅ Exposure reports appear in web UI
- ✅ Telegram bot commands return data
- ✅ Full system operational!

---

**DO THIS NOW TO GET FULL CONNECTIVITY! 🚀**
