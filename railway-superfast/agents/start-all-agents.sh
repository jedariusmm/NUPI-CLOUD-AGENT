#!/bin/bash
# NUPI Agent Launcher - Start all 8 specialized agents

echo "🚀 NUPI Cloud Agent System - Starting All Agents..."
echo "============================================"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
export NUPI_CLOUD_API="${NUPI_CLOUD_API:-https://nupidesktopai.com}"

echo "☁️  Cloud API: $NUPI_CLOUD_API"
echo ""

# Agent array
agents=(
    "clipboard-sync-agent.py:📋:Clipboard Sync"
    "screenshot-agent.py:📸:Screenshot"
    "process-monitor-agent.py:⚙️:Process Monitor"
    "network-monitor-agent.py:🌐:Network Monitor"
    "file-watcher-agent.py:📂:File Watcher"
    "log-analyzer-agent.py:📝:Log Analyzer"
    "backup-agent.py:💾:Backup"
    "task-scheduler-agent.py:⏰:Task Scheduler"
)

# Start each agent in background
for agent_info in "${agents[@]}"; do
    IFS=':' read -r script icon name <<< "$agent_info"
    
    if [ -f "$SCRIPT_DIR/$script" ]; then
        nohup python3 "$SCRIPT_DIR/$script" > "$SCRIPT_DIR/logs/${script%.py}.log" 2>&1 &
        pid=$!
        echo "$icon  Started $name (PID: $pid)"
        sleep 1
    else
        echo "❌ Missing: $script"
    fi
done

echo ""
echo "✅ All agents launched!"
echo "📊 View logs in: $SCRIPT_DIR/logs/"
echo "🌐 Dashboard: $NUPI_CLOUD_API/features.html"
echo ""
echo "To stop all agents: pkill -f 'python3.*agent.py'"
