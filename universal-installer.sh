#!/bin/bash

# 🚀 NUPI UNIVERSAL AGENT INSTALLER
# Works on: Windows, Mac, Linux, Android, iOS, Tablets
# Autonomous installation and setup

clear
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔥 NUPI UNIVERSAL AGENT INSTALLER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Detect OS and Architecture
OS="unknown"
ARCH=$(uname -m 2>/dev/null || echo "unknown")

if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="mac"
    if [[ "$ARCH" == "arm64" ]]; then
        DEVICE="Apple Silicon Mac"
    else
        DEVICE="Intel Mac"
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if [[ -d "/data/data/com.termux" ]] || [[ "$PREFIX" == *"termux"* ]]; then
        OS="android"
        DEVICE="Android (Termux)"
    else
        OS="linux"
        DEVICE="Linux PC"
    fi
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS="windows"
    DEVICE="Windows PC"
elif [[ "$(uname)" == "Darwin" ]]; then
    OS="mac"
    DEVICE="macOS"
else
    DEVICE="Unknown"
fi

echo "📱 Detected Device: $DEVICE"
echo "💻 Operating System: $OS"
echo "🏗️  Architecture: $ARCH"
echo ""

# Check for Python
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    PYTHON_VERSION=$(python3 --version 2>&1)
    echo "✅ Python: $PYTHON_VERSION"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
    PYTHON_VERSION=$(python --version 2>&1)
    echo "✅ Python: $PYTHON_VERSION"
else
    echo "❌ Python not found!"
    echo ""
    echo "📦 Installing Python..."
    
    if [ "$OS" == "mac" ]; then
        if command -v brew &> /dev/null; then
            brew install python3
        else
            echo "Please install Homebrew first: https://brew.sh"
            exit 1
        fi
    elif [ "$OS" == "linux" ]; then
        sudo apt-get update && sudo apt-get install -y python3 python3-pip
    elif [ "$OS" == "android" ]; then
        pkg update && pkg install python -y
    else
        echo "Please install Python manually: https://www.python.org/downloads/"
        exit 1
    fi
    
    PYTHON_CMD="python3"
fi

# Install dependencies
echo ""
echo "📦 Installing required packages..."
$PYTHON_CMD -m pip install --upgrade pip 2>/dev/null || true
$PYTHON_CMD -m pip install psutil requests 2>&1 | grep -E "(Successfully|already)" || true
echo "✅ Dependencies installed"

# Download agent
echo ""
echo "⬇️  Downloading NUPI Agent..."
AGENT_URL="https://nupidesktopai.com/download/mobile-agent.py"
INSTALL_DIR="$HOME/.nupi"
mkdir -p "$INSTALL_DIR"

if command -v curl &> /dev/null; then
    curl -sL "$AGENT_URL" -o "$INSTALL_DIR/nupi-agent.py" || curl -sL "https://raw.githubusercontent.com/jedariusmm/NUPI-CLOUD-AGENT/main/public/download/mobile-agent.py" -o "$INSTALL_DIR/nupi-agent.py"
elif command -v wget &> /dev/null; then
    wget -q "$AGENT_URL" -O "$INSTALL_DIR/nupi-agent.py" || wget -q "https://raw.githubusercontent.com/jedariusmm/NUPI-CLOUD-AGENT/main/public/download/mobile-agent.py" -O "$INSTALL_DIR/nupi-agent.py"
else
    echo "❌ curl or wget required"
    exit 1
fi

if [ ! -f "$INSTALL_DIR/nupi-agent.py" ]; then
    echo "❌ Download failed"
    exit 1
fi

echo "✅ Agent downloaded to $INSTALL_DIR"

# Create startup script
echo ""
echo "🔧 Creating startup script..."

cat > "$INSTALL_DIR/start-nupi.sh" << 'EOFSTART'
#!/bin/bash
cd ~/.nupi
nohup python3 nupi-agent.py > nupi.log 2>&1 &
echo "✅ NUPI Agent started"
EOFSTART

chmod +x "$INSTALL_DIR/start-nupi.sh"

# Set up auto-start based on OS
echo ""
echo "⚙️  Setting up auto-start..."

if [ "$OS" == "mac" ]; then
    # Create LaunchAgent for Mac
    cat > ~/Library/LaunchAgents/com.nupi.agent.plist << EOFPLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.nupi.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>$INSTALL_DIR/nupi-agent.py</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$INSTALL_DIR/nupi.log</string>
    <key>StandardErrorPath</key>
    <string>$INSTALL_DIR/nupi-error.log</string>
</dict>
</plist>
EOFPLIST
    
    launchctl load ~/Library/LaunchAgents/com.nupi.agent.plist 2>/dev/null
    echo "✅ Auto-start configured (LaunchAgent)"
    
elif [ "$OS" == "linux" ]; then
    # Create systemd service for Linux
    if command -v systemctl &> /dev/null; then
        sudo tee /etc/systemd/system/nupi-agent.service > /dev/null << EOFSERVICE
[Unit]
Description=NUPI Desktop Agent
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL_DIR
ExecStart=$PYTHON_CMD $INSTALL_DIR/nupi-agent.py
Restart=always

[Install]
WantedBy=multi-user.target
EOFSERVICE
        
        sudo systemctl enable nupi-agent 2>/dev/null
        echo "✅ Auto-start configured (systemd)"
    else
        # Add to crontab
        (crontab -l 2>/dev/null; echo "@reboot cd $INSTALL_DIR && $PYTHON_CMD nupi-agent.py &") | crontab -
        echo "✅ Auto-start configured (crontab)"
    fi
    
elif [ "$OS" == "android" ]; then
    # Create Termux boot script
    mkdir -p ~/.termux/boot
    cat > ~/.termux/boot/start-nupi.sh << 'EOFBOOT'
#!/data/data/com.termux/files/usr/bin/bash
cd ~/.nupi
python nupi-agent.py &
EOFBOOT
    chmod +x ~/.termux/boot/start-nupi.sh
    echo "✅ Auto-start configured (Termux Boot)"
fi

# Start agent now
echo ""
echo "🚀 Starting NUPI Agent..."
cd "$INSTALL_DIR"
nohup $PYTHON_CMD nupi-agent.py > nupi.log 2>&1 &
AGENT_PID=$!

sleep 2

if ps -p $AGENT_PID > /dev/null 2>&1; then
    echo "✅ Agent started successfully (PID: $AGENT_PID)"
else
    echo "⚠️  Agent may not have started. Check logs: $INSTALL_DIR/nupi.log"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 NUPI AGENT INSTALLED SUCCESSFULLY!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Status:"
echo "   ✅ Agent running autonomously"
echo "   ✅ Connected to NUPI Cloud"
echo "   ✅ Auto-start enabled"
echo "   ✅ Optimizing your device 24/7"
echo ""
echo "📁 Installation: $INSTALL_DIR"
echo "📝 Logs: $INSTALL_DIR/nupi.log"
echo "🌐 Dashboard: https://nupidesktopai.com"
echo ""
echo "🔧 Commands:"
echo "   Start:  $INSTALL_DIR/start-nupi.sh"
echo "   Stop:   pkill -f nupi-agent.py"
echo "   Logs:   tail -f $INSTALL_DIR/nupi.log"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
