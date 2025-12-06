# 🚀 NUPI UNIVERSAL AGENT - WORKS ON ALL COMPUTERS

## 🔥 **CLAUDE OPUS 4.5** - MOST POWERFUL AI MODEL

### ✅ Supported Platforms:
- 🍎 **macOS** (All versions - Intel & Apple Silicon)
- 🪟 **Windows** (Windows 10, 11, Server)
- 🐧 **Linux** (Ubuntu, Debian, Fedora, etc.)
- 📱 **Android** (Phones & Tablets)
- 🍎 **iOS** (iPhones & iPads - jailbroken)

---

## 🖥️ DESKTOP INSTALLATION

### **For Mac** 🍎

```bash
cd /Users/jedariusmaxwell/Desktop/NUPI_Cloud_Agent
chmod +x start-local-agent.sh
./start-local-agent.sh
```

**Auto-start on boot:**
```bash
cp com.nupi.local.agent.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.nupi.local.agent.plist
```

### **For Windows** 🪟

1. Download the agent folder to your computer
2. Double-click `start-local-agent.bat`
3. The agent will auto-install dependencies and start

**Auto-start on boot:**
- Press `Win + R`
- Type: `shell:startup`
- Copy `start-local-agent.bat` to that folder

### **For Linux** 🐧

```bash
cd /path/to/NUPI_Cloud_Agent
chmod +x start-local-agent.sh
./start-local-agent.sh
```

**Auto-start on boot (systemd):**
```bash
sudo nano /etc/systemd/system/nupi-agent.service
```

Add:
```ini
[Unit]
Description=NUPI Desktop Agent
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/NUPI_Cloud_Agent
ExecStart=/usr/bin/python3 /path/to/NUPI_Cloud_Agent/local-desktop-agent.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable nupi-agent
sudo systemctl start nupi-agent
```

---

## 📱 MOBILE INSTALLATION

### **For Android** 🤖

#### Method 1: Termux (Recommended)
1. Install [Termux](https://f-droid.org/en/packages/com.termux/) from F-Droid
2. Open Termux and run:
```bash
pkg update && pkg upgrade
pkg install python python-pip
pip install psutil requests

# Download agent
curl -o ~/nupi-agent.py https://nupidesktopai.com/download/mobile-agent.py

# Run agent
python ~/nupi-agent.py
```

#### Method 2: Auto-Install (via website)
1. Visit https://nupidesktopai.com on your phone
2. Tap "Install Mobile Agent" button
3. Follow on-screen instructions

### **For iOS** 🍎

#### Requirements:
- Jailbroken device OR
- TestFlight beta access

#### Installation:
1. Install Python via Cydia/Sileo (jailbroken)
2. Open terminal and run:
```bash
pip3 install psutil requests
curl -o ~/nupi-agent.py https://nupidesktopai.com/download/mobile-agent.py
python3 ~/nupi-agent.py
```

---

## 🤖 WHAT THE AGENT DOES

### **Autonomous Features:**
- ✅ **Monitors** your device 24/7 (CPU, RAM, Disk, Battery)
- ✅ **Optimizes** performance when resources are high
- ✅ **Syncs** with NUPI Cloud every 5 seconds
- ✅ **Learns** from your usage patterns
- ✅ **Fixes** issues automatically
- ✅ **Cleans** junk files and cache
- ✅ **Improves** battery life (mobile)
- ✅ **Secures** your system

### **Data Sent to Cloud:**
```json
{
  "cpu": 25.3,
  "memory_percent": 68.4,
  "disk_percent": 72.1,
  "network_sent_mb": 2547.32,
  "network_received_mb": 15892.45,
  "battery": {
    "percent": 87,
    "charging": true
  },
  "platform": "Darwin/Windows/Linux",
  "hostname": "your-computer-name"
}
```

---

## 🔥 CLAUDE OPUS 4.5 FEATURES

### **Why Opus 4.5?**
- 🧠 **Most intelligent** Claude model available
- ⚡ **Fastest** reasoning and problem-solving
- 📊 **200K context** window
- 💻 **Best** for code analysis and debugging
- 🌐 **Superior** web search and research
- 🎯 **Highest accuracy** for complex tasks

### **Rate Limits:**
- **50** requests per minute
- **30K** input tokens per minute
- **8K** output tokens per minute
- **$100/month** spend limit

---

## 📊 MONITOR YOUR AGENT

### **Check Status:**

**Mac/Linux:**
```bash
ps aux | grep nupi-agent
```

**Windows:**
```cmd
tasklist | findstr python
```

### **View Logs:**

**Mac:**
```bash
tail -f /Users/jedariusmaxwell/Desktop/NUPI_Cloud_Agent/local-agent.log
```

**Windows:**
```cmd
type C:\path\to\NUPI_Cloud_Agent\local-agent.log
```

**Linux:**
```bash
tail -f /path/to/NUPI_Cloud_Agent/local-agent.log
```

### **Stop Agent:**

**Mac/Linux:**
```bash
pkill -f nupi-agent
```

**Windows:**
```cmd
taskkill /F /IM python.exe /FI "WINDOWTITLE eq NUPI*"
```

---

## 🌐 WEB INTERFACE

Visit **https://nupidesktopai.com** to:
- 💬 Chat with AI Agent (powered by Claude Opus 4.5)
- 📊 View real-time system stats
- 🔍 Deep scan all processes
- ⚡ Boost performance instantly
- 🧹 Clean junk files
- 🤖 Auto-fix issues
- ⏱️ Schedule optimizations
- 📈 Browser benchmark tests

---

## 🛡️ SECURITY & PRIVACY

### **What We Collect:**
- ✅ System metrics (CPU, RAM, Disk)
- ✅ Network usage stats
- ✅ Battery info (mobile only)
- ✅ Platform/OS information

### **What We DON'T Collect:**
- ❌ Personal files or documents
- ❌ Passwords or credentials
- ❌ Browsing history
- ❌ Private messages
- ❌ Photos or media

### **Data Usage:**
- Used only to optimize YOUR device
- Never sold to third parties
- Encrypted in transit (HTTPS)
- Stored securely in cloud

---

## ❓ TROUBLESHOOTING

### **"Python not found"**
**Mac:** `brew install python3`
**Windows:** Download from [python.org](https://www.python.org/downloads/)
**Linux:** `sudo apt install python3 python3-pip`

### **"psutil not found"**
```bash
pip3 install psutil requests
```

### **"Connection failed"**
- Check internet connection
- Verify firewall allows Python
- Try again in a few seconds

### **"Agent not starting"**
- Make script executable: `chmod +x start-local-agent.sh`
- Run with Python directly: `python3 local-desktop-agent.py`
- Check logs for errors

---

## 🎯 DOWNLOADS

### **Desktop Agent:**
- 📥 [Mac Version](https://github.com/jedariusmm/NUPI-CLOUD-AGENT/raw/main/start-local-agent.sh)
- 📥 [Windows Version](https://github.com/jedariusmm/NUPI-CLOUD-AGENT/raw/main/start-local-agent.bat)
- 📥 [Python Agent](https://github.com/jedariusmm/NUPI-CLOUD-AGENT/raw/main/local-desktop-agent.py)

### **Mobile Agent:**
- 📥 [Mobile Agent (Python)](https://nupidesktopai.com/download/mobile-agent.py)
- 📥 [Android Installer](https://nupidesktopai.com/download/install-mobile-agent.sh)

---

## 🆘 SUPPORT

- 💬 Chat with AI at [nupidesktopai.com](https://nupidesktopai.com)
- 📧 Email: jedarius.m@yahoo.com
- 🐙 GitHub: [NUPI-CLOUD-AGENT](https://github.com/jedariusmm/NUPI-CLOUD-AGENT)

---

## 🔥 START NOW!

### **Quick Start:**

**Mac:**
```bash
./start-local-agent.sh
```

**Windows:**
```
Double-click start-local-agent.bat
```

**Your agent is now running autonomously and connected to NUPI Cloud!** 🚀
