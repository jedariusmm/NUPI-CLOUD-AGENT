# 🔧 API KEY SYNC FIX - COMPLETE GUIDE

**Problem:** Local agent and Railway using different API keys  
**Impact:** Agent can't sync data to cloud (gets 401)  
**Solution:** 3 automated scripts created

---

## 🚀 QUICK FIX (Choose One Method):

### **METHOD 1: Manual Railway Setup (EASIEST - 2 minutes)**

1. **Go to Railway Dashboard:**
   - URL: https://railway.app
   - Open project: `NUPI-Cloud-Agent`

2. **Set Environment Variable:**
   - Click: `Variables` tab
   - Click: `+ New Variable`
   - Name: `NUPI_API_KEY`
   - Value: `nupi_jdtech_secure_2025_key`
   - Click: `Add`

3. **Wait for Restart:**
   - Railway auto-restarts (30 seconds)
   - Check logs for "Server running"

4. **Restart Local Agent:**
   ```bash
   cd /Users/jedariusmaxwell/Desktop/NUPI_Cloud_Agent
   ./restart-agent-with-key.sh
   ```

5. **DONE!** ✅

---

### **METHOD 2: Run Automated Script (FASTEST)**

```bash
cd /Users/jedariusmaxwell/Desktop/NUPI_Cloud_Agent
./fix-api-sync.sh
```

**What it does:**
1. ✅ Guides you through Railway setup
2. ✅ Waits for Railway restart
3. ✅ Restarts local agent with matching key
4. ✅ Tests connection
5. ✅ Confirms everything works

---

### **METHOD 3: Step-by-Step Manual**

**Step 1: Set Railway Variable**
```bash
./set-railway-key.sh
```

**Step 2: Wait 30 seconds** (Railway restart)

**Step 3: Restart Local Agent**
```bash
./restart-agent-with-key.sh
```

**Step 4: Verify**
```bash
tail -f security-scan.log
```

---

## 🧪 TEST IF IT'S WORKING:

### **Test 1: API Authentication**
```bash
curl -H "x-api-key: nupi_jdtech_secure_2025_key" \
  "https://nupidesktopai.com/api/travelling-agents" | python3 -m json.tool
```

**Expected:** `"success": true` with agent data

---

### **Test 2: Check Agent Logs**
```bash
tail -20 /Users/jedariusmaxwell/Desktop/NUPI_Cloud_Agent/security-scan.log
```

**Expected:** See "✅ Registered visit" instead of "401" errors

---

### **Test 3: Telegram Bot**
1. Open Telegram → @jdtechsupportbot
2. Type: `/agents`
3. **Expected:** See your agent listed

---

## 📁 SCRIPTS CREATED:

| Script | Purpose |
|--------|---------|
| `fix-api-sync.sh` | Complete automated fix (recommended) |
| `set-railway-key.sh` | Just set Railway variable |
| `restart-agent-with-key.sh` | Just restart local agent |

All scripts are in: `/Users/jedariusmaxwell/Desktop/NUPI_Cloud_Agent/`

---

## 🔐 API KEY BEING USED:

```
nupi_jdtech_secure_2025_key
```

**This key will be set in:**
- ✅ Railway environment (NUPI_API_KEY)
- ✅ Local agent (via export)
- ✅ Telegram bot (via environment)

---

## ✅ AFTER FIX - YOU'LL SEE:

**In Agent Logs:**
```
✅ Registered visit on iMac.lan
🔍 SCANNING WIFI NETWORK FOR DEVICES...
✅ Found: 192.168.12.105 (galaxy-tab-a9-5g.lan)
🌐 ═══ NETWORK HOP INITIATED ═══
  ✅ Exposure report sent to cloud
☁️  Successfully travelled to cloud!
```

**In Telegram Bot:**
```
/agents
🌍 TRAVELLING AGENTS (1)
1. Agent c2a9e834
   📍 Location: iMac.lan
   🔄 Visits: 5
   ☁️  In Cloud: Yes
```

**In Dashboard:**
- Real-time agent tracking
- Network exposure data
- Security vulnerabilities
- Device list

---

## 🚨 IF IT STILL DOESN'T WORK:

### **Check 1: Railway Logs**
```bash
railway logs | grep "API Key"
```
Should show: `🔐 Master API Key: nupi_jdtech...`

### **Check 2: Local Agent**
```bash
ps aux | grep travelling-agent
```
Should be running

### **Check 3: Environment Variable**
```bash
echo $NUPI_API_KEY
```
Should show: `nupi_jdtech_secure_2025_key`

### **Check 4: Test Without Script**
```bash
export NUPI_API_KEY="nupi_jdtech_secure_2025_key"
curl -H "x-api-key: $NUPI_API_KEY" https://nupidesktopai.com/api/travelling-agents
```

---

## 🎯 QUICKEST PATH TO 100% WORKING:

1. **Set Railway variable** (2 min) - Go to Railway dashboard
2. **Run this:** `./restart-agent-with-key.sh` (10 sec)
3. **Wait 2 minutes** for first scan cycle
4. **Check Telegram:** `/agents` should show your agent
5. **DONE!** 🎉

---

## 📝 WHAT HAPPENS AUTOMATICALLY:

Once keys match:
1. ✅ Local agent scans network every 2 minutes
2. ✅ Sends exposure data to cloud
3. ✅ Cloud stores in database
4. ✅ Telegram bot can retrieve via `/exposure`
5. ✅ Dashboard shows real-time data
6. ✅ All agents visible worldwide

**FULL SYSTEM OPERATIONAL!** 🚀

---

**Ready to run?** Choose your method above and follow the steps!
