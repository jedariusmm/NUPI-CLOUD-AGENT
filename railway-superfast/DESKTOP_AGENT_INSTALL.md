# 🖥️ NUPI Desktop Agent - Installation Guide

Control your computer remotely via **nupidesktopai.com**

## Quick Install

### Option 1: Direct Download
```bash
curl -O https://nupidesktopai.com/agents/nupi-desktop-agent.py
python3 nupi-desktop-agent.py
```

### Option 2: One-Liner Install & Run
```bash
curl -s https://nupidesktopai.com/agents/nupi-desktop-agent.py | python3
```

## What It Does

✅ **Remote Shell Access** - Execute commands from your phone  
✅ **System Monitoring** - View your computer's status  
✅ **Mobile Control** - Full control from nupidesktopai.com/control.html  
✅ **Secure Connection** - Direct connection to your NUPI cloud  

## Usage

1. **Install** the agent on your computer (Mac/Linux/Windows)
2. **Open** https://nupidesktopai.com/control.html on your phone
3. **Control** your computer from anywhere!

## Features

- 🔐 Secure heartbeat connection every 30 seconds
- 📊 Real-time system information
- 💻 Execute shell commands remotely
- 📱 Mobile-optimized control panel
- ⚡ Instant command execution (5-second check interval)

## Environment Variables (Optional)

```bash
export NUPI_CLOUD_API=https://nupidesktopai.com
python3 nupi-desktop-agent.py
```

## Troubleshooting

**Agent won't connect?**
- Check your internet connection
- Verify nupidesktopai.com is accessible
- Check firewall settings

**Commands not executing?**
- Wait 5 seconds for agent to check for new commands
- Check the agent terminal for error messages

## Advanced Usage

### Run as Background Service (Linux/Mac)

```bash
# Using nohup
nohup python3 nupi-desktop-agent.py > nupi-agent.log 2>&1 &

# Using screen
screen -dmS nupi python3 nupi-desktop-agent.py

# Check status
ps aux | grep nupi-desktop-agent
```

### Auto-start on Boot (Mac)

Create `~/Library/LaunchAgents/com.nupi.desktop-agent.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.nupi.desktop-agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>/path/to/nupi-desktop-agent.py</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Then: `launchctl load ~/Library/LaunchAgents/com.nupi.desktop-agent.plist`

## Security Notes

⚠️ **IMPORTANT**: This agent allows remote command execution on your computer. Only use on computers you own and trust.

- Commands are executed with your user permissions
- No authentication required (uses computer hostname as ID)
- All commands logged in terminal output
- Agent runs with your user privileges

## Uninstall

Simply kill the process:

```bash
pkill -f nupi-desktop-agent
```

---

Need help? Visit https://nupidesktopai.com or check the chat interface!
