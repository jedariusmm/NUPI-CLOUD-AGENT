#!/usr/bin/env python3
"""
NUPI Cloud Agent - Telegram Bot Handler
Concurrent notifications + Data retrieval commands
Connects to @jdtechsupport (Iosservicesbot)
"""

import os
import requests
import threading
import time
from datetime import datetime

# Bot Configuration
BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '8318301013:AAGCCSdgWcWR-4tM6dT39MHmU3oCs1BacpQ')
CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID', '6523159355')
CLOUD_URL = "https://nupidesktopai.com"

# Last update ID for polling
last_update_id = 0

def send_notification(message, silent=False):
    """Send notification to Telegram"""
    try:
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": CHAT_ID,
            "text": f"🤖 *NUPI CLOUD AGENT*\n\n{message}",
            "parse_mode": "Markdown",
            "disable_notification": silent
        }
        response = requests.post(url, json=payload, timeout=5)
        return response.json().get('ok', False)
    except Exception as e:
        print(f"❌ Telegram send error: {e}")
        return False

def get_system_data(endpoint):
    """Retrieve data from NUPI Cloud API"""
    try:
        response = requests.get(f"{CLOUD_URL}{endpoint}", timeout=10)
        if response.status_code == 200:
            return response.json()
        return {"error": f"HTTP {response.status_code}"}
    except Exception as e:
        return {"error": str(e)}

def format_agents_status():
    """Format agent status for Telegram"""
    data = get_system_data("/api/agents/status")
    if "error" in data:
        return f"❌ Error: {data['error']}"
    
    online = data.get('online', 0)
    warning = data.get('warning', 0)
    offline = data.get('offline', 0)
    agents = data.get('agents', [])
    
    msg = f"*📊 AGENT STATUS*\n\n"
    msg += f"🟢 Online: {online}\n"
    msg += f"🟡 Warning: {warning}\n"
    msg += f"🔴 Offline: {offline}\n\n"
    
    if agents:
        msg += "*Agents:*\n"
        for agent in agents[:10]:  # Show first 10
            status_icon = {"online": "🟢", "warning": "🟡", "offline": "🔴"}.get(
                agent.get('connection_status', 'offline'), "⚪"
            )
            msg += f"{status_icon} `{agent.get('agent_id', 'unknown')}`\n"
            msg += f"   Last seen: {agent.get('seconds_since_last_seen', 'N/A')}s ago\n"
    
    return msg

def format_devices_list():
    """Format device list for Telegram"""
    data = get_system_data("/api/devices/all")
    if "error" in data:
        return f"❌ Error: {data['error']}"
    
    devices = data.get('devices', [])
    count = data.get('count', 0)
    
    msg = f"*📱 DEVICES TRACKED*\n\n"
    msg += f"Total: {count}\n\n"
    
    if devices:
        for device in devices[:15]:  # Show first 15
            ip = device.get('ip', 'N/A')
            hostname = device.get('hostname', 'Unknown')
            discovered_by = device.get('discovered_by', 'N/A')
            msg += f"• `{ip}`\n"
            msg += f"  Name: {hostname}\n"
            msg += f"  Found by: {discovered_by}\n\n"
    
    return msg

def format_system_health():
    """Format system health for Telegram"""
    data = get_system_data("/health")
    if "error" in data:
        return f"❌ Error: {data['error']}"
    
    status = data.get('status', 'unknown')
    agents = data.get('active_agents', 0)
    devices = data.get('total_devices', 0)
    visitors = data.get('visitors_tracked', 0)
    version = data.get('version', 'N/A')
    
    status_icon = "✅" if status == "healthy" else "⚠️"
    
    msg = f"*{status_icon} SYSTEM HEALTH*\n\n"
    msg += f"Status: `{status}`\n"
    msg += f"Version: `{version}`\n"
    msg += f"Active Agents: {agents}\n"
    msg += f"Devices: {devices}\n"
    msg += f"Visitors: {visitors}\n"
    msg += f"Cloud: {data.get('cloud', 'N/A')}\n"
    
    return msg

def format_system_status():
    """Format autonomous system status"""
    data = get_system_data("/api/system/status")
    if "error" in data:
        return f"❌ Error: {data['error']}"
    
    mode = data.get('autonomous_mode', 'N/A')
    healing = data.get('self_healing', 'N/A')
    telegram = data.get('telegram_notifications', 'N/A')
    claude = data.get('claude_ai', 'N/A')
    
    monitoring = data.get('monitoring', {})
    
    msg = f"*🚀 AUTONOMOUS SYSTEM*\n\n"
    msg += f"Mode: {mode}\n"
    msg += f"Self-Healing: {healing}\n"
    msg += f"Telegram: {telegram}\n"
    msg += f"Claude AI: {claude}\n\n"
    msg += f"*Monitoring:*\n"
    msg += f"Active Agents: {monitoring.get('active_agents', 0)}\n"
    msg += f"Total Errors: {monitoring.get('total_errors', 0)}\n"
    msg += f"Auto-Fixed: {monitoring.get('auto_fixed_errors', 0)}\n"
    msg += f"Improvements: {monitoring.get('improvements_made', 0)}\n"
    
    return msg

def handle_command(text):
    """Handle incoming commands from Telegram"""
    text = text.strip().lower()
    
    if text in ['/start', '/help']:
        return (
            "*🤖 NUPI Cloud Agent Bot*\n\n"
            "*Commands:*\n"
            "/status - System status\n"
            "/agents - Agent list & status\n"
            "/devices - Device list\n"
            "/health - Health check\n"
            "/errors - Recent errors\n"
            "/improvements - System improvements\n"
            "/live - Live monitoring data\n"
            "/help - This message\n\n"
            "_Bot running concurrently with cloud agent_"
        )
    
    elif text == '/status':
        return format_system_status()
    
    elif text == '/agents':
        return format_agents_status()
    
    elif text == '/devices':
        return format_devices_list()
    
    elif text == '/health':
        return format_system_health()
    
    elif text == '/errors':
        data = get_system_data("/api/system/errors")
        if "error" in data:
            return f"❌ Error: {data['error']}"
        errors = data.get('errors', [])
        count = data.get('count', 0)
        msg = f"*⚠️ RECENT ERRORS*\n\nTotal: {count}\n\n"
        for err in errors[:5]:
            msg += f"• {err.get('type', 'N/A')}\n"
            msg += f"  {err.get('message', 'N/A')}\n"
            msg += f"  Fixed: {err.get('auto_fixed', False)}\n\n"
        return msg if errors else "*✅ No recent errors!*"
    
    elif text == '/improvements':
        data = get_system_data("/api/system/improvements")
        if "error" in data:
            return f"❌ Error: {data['error']}"
        improvements = data.get('improvements', [])
        count = data.get('count', 0)
        msg = f"*🔧 SYSTEM IMPROVEMENTS*\n\nTotal: {count}\n\n"
        for imp in improvements[:5]:
            msg += f"• {imp.get('type', 'N/A')}\n"
            msg += f"  {imp.get('description', 'N/A')}\n\n"
        return msg if improvements else "*⚪ No improvements logged yet*"
    
    elif text == '/live':
        msg = format_system_health() + "\n\n"
        msg += format_agents_status()
        return msg
    
    else:
        return "❓ Unknown command. Type /help for available commands."

def poll_telegram_updates():
    """Poll for incoming Telegram messages"""
    global last_update_id
    
    while True:
        try:
            url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates"
            params = {
                "offset": last_update_id + 1,
                "timeout": 30,
                "allowed_updates": ["message"]
            }
            
            response = requests.get(url, params=params, timeout=35)
            if response.status_code == 200:
                result = response.json()
                updates = result.get('result', [])
                
                for update in updates:
                    last_update_id = update.get('update_id', last_update_id)
                    message = update.get('message', {})
                    text = message.get('text', '')
                    
                    if text.startswith('/'):
                        print(f"📱 Command received: {text}")
                        reply = handle_command(text)
                        send_notification(reply, silent=True)
            
            time.sleep(1)
            
        except Exception as e:
            print(f"❌ Polling error: {e}")
            time.sleep(5)

def monitor_agent_changes():
    """Monitor for agent status changes and send notifications"""
    previous_agents = {}
    
    while True:
        try:
            data = get_system_data("/api/agents/status")
            if "error" not in data:
                agents = data.get('agents', [])
                
                for agent in agents:
                    agent_id = agent.get('agent_id')
                    status = agent.get('connection_status')
                    
                    # Check for status changes
                    if agent_id in previous_agents:
                        old_status = previous_agents[agent_id]
                        if old_status != status:
                            if status == 'online':
                                send_notification(f"🟢 *Agent Online*\n`{agent_id}` connected")
                            elif status == 'offline':
                                send_notification(f"🔴 *Agent Offline*\n`{agent_id}` disconnected")
                            elif status == 'warning':
                                send_notification(f"🟡 *Agent Warning*\n`{agent_id}` slow response")
                    else:
                        # New agent detected
                        if status == 'online':
                            send_notification(f"🆕 *New Agent*\n`{agent_id}` registered")
                    
                    previous_agents[agent_id] = status
            
            time.sleep(30)  # Check every 30 seconds
            
        except Exception as e:
            print(f"❌ Monitor error: {e}")
            time.sleep(60)

def start_bot():
    """Start the Telegram bot with concurrent threads"""
    print("🚀 Starting NUPI Telegram Bot...")
    print(f"📱 Bot: @Iosservicesbot (JDTECHSUPPORT)")
    print(f"🌐 Cloud: {CLOUD_URL}")
    
    # Send startup notification
    send_notification(
        "*🚀 BOT STARTED*\n\n"
        "✅ Notifications: Active\n"
        "✅ Commands: Ready\n"
        "✅ Monitoring: Enabled\n\n"
        f"Cloud: `{CLOUD_URL}`\n"
        "Type /help for commands"
    )
    
    # Start threads
    polling_thread = threading.Thread(target=poll_telegram_updates, daemon=True)
    monitor_thread = threading.Thread(target=monitor_agent_changes, daemon=True)
    
    polling_thread.start()
    monitor_thread.start()
    
    print("✅ Bot threads started!")
    print("   - Polling for commands")
    print("   - Monitoring agent changes")
    print("   - Sending real-time notifications")
    
    # Keep main thread alive
    try:
        while True:
            time.sleep(60)
            print(f"💚 Bot alive - {datetime.now().strftime('%H:%M:%S')}")
    except KeyboardInterrupt:
        print("\n👋 Bot stopped")

if __name__ == "__main__":
    start_bot()
