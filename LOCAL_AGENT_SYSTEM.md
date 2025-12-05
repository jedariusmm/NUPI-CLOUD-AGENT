# 🤖 NUPI LOCAL AGENT DEPLOYMENT SYSTEM

## Overview
NUPI Cloud Agent can now deploy and control LOCAL AGENTS on user devices (phones, tablets, desktops, servers) from the cloud. These local agents work directly with user devices to optimize, monitor, and manage them automatically.

---

## 🎯 **HOW IT WORKS**

```
┌─────────────────────────────────────────┐
│      NUPI CLOUD AGENT (Railway)         │
│  - Deploys agents                       │
│  - Sends commands                       │
│  - Receives data                        │
│  - Controls all devices                 │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────┐          ┌────▼────┐
│ Phone  │          │ Desktop │
│ Agent  │          │ Agent   │
│   📱   │          │   💻    │
└────────┘          └─────────┘
```

---

## 🚀 **DEPLOYMENT APIs**

### 1. Deploy New Agent
```bash
POST /api/agents/deploy
{
  "userId": "user123",
  "deviceId": "my-laptop",
  "deviceType": "desktop",  // mobile, desktop, tablet, server
  "deviceInfo": {
    "os": "macOS",
    "version": "14.0",
    "hostname": "MacBook-Pro"
  },
  "customConfig": {
    "autoOptimize": true,
    "reportingInterval": 30000
  }
}
```

**Response:**
```json
{
  "success": true,
  "agentId": "abc123...",
  "deploymentKey": "xyz789...",
  "deploymentPackage": {
    "code": "...",
    "config": {...},
    "instructions": "..."
  },
  "downloadUrl": "/api/agents/download/abc123",
  "quickInstall": "curl -sSL https://nupi.../install/abc123 | sh"
}
```

### 2. List All Agents
```bash
GET /api/agents/list?userId=user123&onlineOnly=true
```

### 3. Get Agent Status
```bash
GET /api/agents/status/my-laptop
```

### 4. Send Command to Agent
```bash
POST /api/agents/command
{
  "deviceId": "my-laptop",
  "command": {
    "type": "scan",
    "params": {}
  }
}
```

### 5. Get Agent Statistics
```bash
GET /api/agents/stats
```

---

## 📱 **AGENT TYPES & CAPABILITIES**

### **MOBILE AGENT** (iOS/Android)
**Capabilities:**
- ✅ Battery monitoring
- ✅ Storage analysis
- ✅ App optimization
- ✅ Network speed test
- ✅ Photo organization
- ✅ Cache cleanup
- ✅ Memory boost

**Auto Actions:**
- Cleans cache daily
- Organizes photos automatically
- Frees memory when low
- Reports battery health

---

### **DESKTOP AGENT** (Windows/Mac/Linux)
**Capabilities:**
- ✅ Full file system access
- ✅ Process management
- ✅ System optimization
- ✅ Disk cleanup
- ✅ Performance monitoring
- ✅ Automatic updates
- ✅ Backup management
- ✅ Security scanning

**Auto Actions:**
- Optimizes system twice daily
- Cleans temp files automatically
- Monitors CPU/RAM usage
- Alerts on high resource usage
- Executes cloud commands

---

### **TABLET AGENT**
**Capabilities:**
- ✅ Storage optimization
- ✅ App management
- ✅ Battery saver
- ✅ Performance boost
- ✅ Smart cleanup

**Auto Actions:**
- Daily cleanup
- App optimization
- Battery monitoring

---

### **SERVER AGENT** (VPS/Cloud Servers)
**Capabilities:**
- ✅ Log rotation
- ✅ Database optimization
- ✅ Cache management
- ✅ Security monitoring
- ✅ Resource scaling
- ✅ Automated backups

**Auto Actions:**
- Real-time monitoring (every 5 min)
- Auto-scaling based on load
- Critical alerts
- Automated backups

---

## 🎮 **COMMAND TYPES**

Agents support these commands from the cloud:

### **scan** - Full device scan
```json
{
  "type": "scan",
  "params": {}
}
```
Returns: system info, CPU, memory, disk, processes

### **clean** - Clean and optimize
```json
{
  "type": "clean",
  "params": {
    "deep": true
  }
}
```
Returns: freed space, files deleted, performance improvement

### **optimize** - Performance optimization
```json
{
  "type": "optimize",
  "params": {}
}
```
Returns: optimization results

### **read_file** - Read any file
```json
{
  "type": "read_file",
  "params": {
    "path": "/path/to/file"
  }
}
```

### **list_dir** - List directory
```json
{
  "type": "list_dir",
  "params": {
    "path": "/path/to/directory"
  }
}
```

### **execute** - Run shell command
```json
{
  "type": "execute",
  "params": {
    "command": "df -h"
  }
}
```

---

## 📊 **HEARTBEAT & MONITORING**

Agents automatically send heartbeats to cloud:
- **Desktop/Server**: Every 1 minute
- **Mobile/Tablet**: Every 1 minute

**Each heartbeat includes:**
```json
{
  "agentId": "abc123",
  "deviceId": "my-laptop",
  "status": "online",
  "metrics": {
    "cpu": { "usage": 0.45, "cores": 8 },
    "memory": { "used": 8000000000, "total": 16000000000 },
    "disk": { "used": "50%", "available": "500GB" },
    "timestamp": "2025-12-04T..."
  }
}
```

If agent doesn't check in for 10 minutes → marked **offline**

---

## 💻 **INSTALLATION METHODS**

### **Method 1: Quick Install (Desktop/Server)**
```bash
curl -sSL https://nupi-cloud-agent.up.railway.app/api/agents/install/[AGENT_ID] | sh
```

### **Method 2: Manual Install**
1. Download agent code:
   ```bash
   curl -sSL https://nupi.../api/agents/download/[AGENT_ID] -o nupi-agent.js
   ```

2. Install dependencies:
   ```bash
   npm install node-fetch
   ```

3. Run agent:
   ```bash
   node nupi-agent.js
   ```

### **Method 3: Mobile App**
1. Download NUPI app from App Store/Google Play
2. Enter deployment key
3. Grant permissions
4. Agent starts automatically

---

## 🔐 **SECURITY**

- ✅ Deployment key required for all agent actions
- ✅ Commands validated before execution
- ✅ Dangerous commands blocked (rm -rf /, fork bombs, etc.)
- ✅ File access limited to user space
- ✅ Secure HTTPS communication
- ✅ Agent authentication on every heartbeat

---

## 📈 **USE CASES**

### **1. Device Fleet Management**
Deploy agents on 100 devices, monitor all from cloud dashboard

### **2. Auto-Optimization**
Agents automatically clean, optimize, and maintain devices

### **3. Remote Administration**
Execute commands on any device from anywhere

### **4. Performance Monitoring**
Real-time metrics from all devices in one place

### **5. Automated Backups**
Schedule and monitor backups across all devices

---

## 🔥 **EXAMPLE WORKFLOW**

```javascript
// 1. Deploy agent to user's desktop
const deployment = await fetch('https://nupi.../api/agents/deploy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'jedarius',
    deviceId: 'macbook-pro',
    deviceType: 'desktop',
    deviceInfo: {
      os: 'macOS',
      hostname: 'Jedarius-MacBook'
    }
  })
});

// 2. User installs agent on their device
// curl -sSL [quickInstall URL] | sh

// 3. Agent starts, sends heartbeat
// Every minute: "I'm online, here's my status"

// 4. Send command from cloud
await fetch('https://nupi.../api/agents/command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deviceId: 'macbook-pro',
    command: {
      type: 'scan',
      params: {}
    }
  })
});

// 5. Agent receives command on next heartbeat
// 6. Agent executes scan
// 7. Agent sends results back to cloud
// 8. Cloud stores results and shows in dashboard
```

---

## 🌐 **LIVE API ENDPOINTS**

All endpoints available at:
```
https://nupi-cloud-agent.up.railway.app/api/agents/...
```

Test the system:
```bash
curl https://nupi-cloud-agent.up.railway.app/api/agents/stats
```

---

## 🎯 **NEXT STEPS**

1. **Test deployment** - Deploy first agent to your device
2. **Monitor dashboard** - Check agent status and metrics
3. **Send commands** - Test remote control
4. **Auto-optimize** - Let agents clean your devices
5. **Scale up** - Deploy to multiple devices

**Built by Jedarius Maxwell**
**Powered by NUPI Cloud Agent**
