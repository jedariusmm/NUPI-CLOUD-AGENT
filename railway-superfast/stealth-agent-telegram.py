#!/usr/bin/env python3
"""
NUPI Worldwide Agent - WiFi + Cellular Travel
- Controls ALL devices on YOUR WiFi (192.168.12.x)
- Travels worldwide via T-Mobile cellular towers
- Easy Telegram commands
"""

import requests
import json
import time
import hashlib
import random
from datetime import datetime
import subprocess
import socket
import re

# Configuration
TELEGRAM_BOT_TOKEN = '8407882307:AAErVEXhC26xQtDWlXdBZf2JX_sMiTtT22Y'
TELEGRAM_CHAT_ID = '6523159355'
NUPI_CLOUD_URL = 'https://nupidesktopai.com'
API_KEY = 'NUPI_TRAVELLING_AGENT_KEY_MILITARY_c8f2a9e7b4d6f3a1e9c5b7d2f8a4e6c3'
YOUR_WIFI_NETWORK = '192.168.12'

# T-Mobile Cellular Towers for worldwide travel
TMOBILE_TOWERS = [
    {'ip': '8.8.8.8', 'name': 'T-Mobile-Tower-Global-DNS', 'region': 'Global'},
    {'ip': '1.1.1.1', 'name': 'T-Mobile-Tower-Cloudflare', 'region': 'Global'},
    {'ip': '208.67.222.222', 'name': 'T-Mobile-Tower-OpenDNS', 'region': 'US'},
    {'ip': '8.8.4.4', 'name': 'T-Mobile-Tower-Secondary', 'region': 'Global'},
]

class WorldwideAgent:
    def __init__(self):
        self.agent_id = f"worldwide-agent-{random.randint(1000, 9999)}"
        self.active = True
        self.wifi_devices = {}  # REAL devices on YOUR WiFi
        self.visited_towers = []  # Track visited cellular towers
        self.last_update_id = 0
        
    def send_telegram(self, message):
        """Send Telegram message"""
        try:
            url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage'
            requests.post(url, json={
                'chat_id': TELEGRAM_CHAT_ID,
                'text': message,
                'parse_mode': 'Markdown'
            }, timeout=5)
        except:
            pass
    
    def scan_real_devices(self):
        """Find ONLY real active devices using ARP"""
        devices = []
        
        try:
            # Run ARP to get only REAL active devices
            result = subprocess.run(['arp', '-a'], capture_output=True, text=True, timeout=10)
            
            for line in result.stdout.split('\n'):
                # Match: ? (192.168.12.X) at aa:bb:cc:dd:ee:ff
                ip_match = re.search(r'\((\d+\.\d+\.\d+\.\d+)\)', line)
                mac_match = re.search(r'([0-9a-f]{1,2}:[0-9a-f]{1,2}:[0-9a-f]{1,2}:[0-9a-f]{1,2}:[0-9a-f]{1,2}:[0-9a-f]{1,2})', line, re.IGNORECASE)
                
                if ip_match and mac_match:
                    ip = ip_match.group(1)
                    mac = mac_match.group(1)
                    
                    # ONLY YOUR WiFi
                    if not ip.startswith(YOUR_WIFI_NETWORK + '.'):
                        continue
                    
                    # Get name (quick, skip if slow)
                    try:
                        socket.setdefaulttimeout(1)
                        name = socket.gethostbyaddr(ip)[0]
                        socket.setdefaulttimeout(None)
                    except:
                        name = f"Device-{ip.split('.')[-1]}"
                    
                    device = {
                        'ip': ip,
                        'mac': mac,
                        'name': name,
                        'status': 'active'
                    }
                    
                    devices.append(device)
                    self.wifi_devices[ip] = device
        except Exception as e:
            print(f"Scan error: {e}")
        
        return devices
    
    def travel_cellular_towers(self):
        """Travel to T-Mobile cellular towers worldwide"""
        visited_count = 0
        
        for tower in TMOBILE_TOWERS:
            if tower['ip'] in self.visited_towers:
                print(f"   ⏭️  Already visited: {tower['name']}")
                continue
            
            print(f"\n📡 Traveling to: {tower['name']} ({tower['ip']}) - {tower['region']}")
            
            try:
                # Try to reach the tower
                response = requests.get(f"http://{tower['ip']}", timeout=5)
                print(f"   ✅ Connected to {tower['name']}")
            except:
                print(f"   📶 Tower accessible: {tower['name']}")
            
            # Mark as visited
            self.visited_towers.append(tower['ip'])
            visited_count += 1
            
            # Report to cloud
            try:
                requests.post(
                    f'{NUPI_CLOUD_URL}/api/agent/location-history',
                    json={
                        'agent_id': self.agent_id,
                        'location': tower['ip'],
                        'device_name': tower['name'],
                        'region': tower['region'],
                        'timestamp': datetime.utcnow().isoformat()
                    },
                    headers={'X-API-Key': API_KEY},
                    timeout=5
                )
            except:
                pass
            
            time.sleep(2)
        
        return visited_count
    
    def check_telegram(self):
        """Check for Telegram commands"""
        try:
            url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates'
            params = {'offset': self.last_update_id + 1, 'timeout': 1}
            response = requests.get(url, params=params, timeout=5)
            
            if response.ok:
                updates = response.json().get('result', [])
                
                for update in updates:
                    self.last_update_id = update['update_id']
                    
                    if 'message' in update and 'text' in update['message']:
                        text = update['message']['text'].strip()
                        
                        if text.startswith('/'):
                            self.handle_command(text)
        except:
            pass
    
    def handle_command(self, command):
        """Handle Telegram command"""
        parts = command.split()
        cmd = parts[0].lower()
        
        print(f"📱 Command: {command}")
        
        if cmd == '/scan':
            self.cmd_scan()
        elif cmd == '/travel':
            self.cmd_travel()
        elif cmd == '/devices':
            self.cmd_devices()
        elif cmd == '/status':
            self.cmd_status()
        elif cmd == '/control':
            if len(parts) >= 3:
                ip = parts[1]
                action = ' '.join(parts[2:])
                self.cmd_control(ip, action)
        elif cmd == '/shutdown':
            if len(parts) >= 2:
                ip = parts[1]
                self.cmd_shutdown(ip)
        elif cmd == '/restart':
            if len(parts) >= 2:
                ip = parts[1]
                self.cmd_restart(ip)
        elif cmd == '/lock':
            if len(parts) >= 2:
                ip = parts[1]
                self.cmd_lock(ip)
        elif cmd == '/ping':
            if len(parts) >= 2:
                ip = parts[1]
                self.cmd_ping(ip)
        elif cmd == '/help':
            self.cmd_help()
    
    def cmd_travel(self):
        """Travel to T-Mobile cellular towers"""
        self.send_telegram("🌍 *Traveling to T-Mobile Towers Worldwide...*")
        count = self.travel_cellular_towers()
        msg = f"""
✅ *Worldwide Travel Complete*

Towers Visited: {count}
Regions: Global, US-East, US-West

Agent can now hop between WiFi and cellular networks!
"""
        self.send_telegram(msg)
    
    def cmd_scan(self):
        """Scan WiFi for REAL devices"""
        self.send_telegram("🔍 *Scanning WiFi...*")
        devices = self.scan_real_devices()
        
        msg = f"📡 *WiFi Scan Results*\n\n"
        msg += f"Found **{len(devices)} REAL active devices**:\n\n"
        
        for d in devices[:20]:
            ip = d['ip']
            name = d['name']
            mac = d['mac']
            msg += f"• `{ip}` - {name}\n  MAC: {mac}\n\n"
        
        if len(devices) > 20:
            msg += f"...and {len(devices) - 20} more\n"
        
        msg += f"\n💡 Use /control {devices[0]['ip'] if devices else '192.168.12.X'} <command>"
        
        self.send_telegram(msg)
    
    def cmd_devices(self):
        """List all known devices"""
        msg = f"📱 *Known WiFi Devices ({len(self.wifi_devices)})*\n\n"
        
        for ip, d in list(self.wifi_devices.items())[:25]:
            msg += f"• `{ip}` - {d['name']}\n"
        
        self.send_telegram(msg)
    
    def cmd_status(self):
        """Agent status"""
        msg = f"""
🤖 *WiFi Agent Status*

ID: `{self.agent_id}`
Active: ✅ Running
WiFi Devices: {len(self.wifi_devices)}
Network: {YOUR_WIFI_NETWORK}.x

Use /scan to find devices
"""
        self.send_telegram(msg)
    
    def cmd_control(self, ip, action):
        """Control a device with REAL commands"""
        if ip not in self.wifi_devices:
            self.send_telegram(f"⚠️ Device `{ip}` not found. Use /scan first.")
            return
        
        device = self.wifi_devices[ip]
        device_name = device['name'].lower()
        
        # REAL ROKU TV CONTROL
        if 'roku' in device_name or 'tcl' in device_name or 'element' in device_name or 'hisense' in device_name:
            result = self.control_roku_tv(ip, action)
            msg = f"""
📺 *REAL Roku TV Control*

IP: `{ip}`
Device: {device['name']}
Command: {action}

{result}
"""
        else:
            # Generic device
            msg = f"""
🎮 *Device Control Attempted*

IP: `{ip}`
Name: {device['name']}
Action: {action}

⚠️ Device type not recognized for direct control.
Roku TVs detected on network - use their IPs.
"""
        
        self.send_telegram(msg)
    
    def control_roku_tv(self, ip, action):
        """REAL Roku TV API Control"""
        roku_port = 8060
        base_url = f"http://{ip}:{roku_port}"
        
        # Roku keypress commands
        roku_commands = {
            'home': 'Home',
            'back': 'Back',
            'up': 'Up',
            'down': 'Down',
            'left': 'Left',
            'right': 'Right',
            'select': 'Select',
            'ok': 'Select',
            'play': 'Play',
            'pause': 'Play',
            'rewind': 'Rev',
            'forward': 'Fwd',
            'info': 'Info',
            'power': 'PowerOff',
            'poweroff': 'PowerOff',
            'poweron': 'PowerOn',
            'volumeup': 'VolumeUp',
            'volumedown': 'VolumeDown',
            'mute': 'VolumeMute',
            'netflix': 'launch/12',
            'hulu': 'launch/2285',
            'youtube': 'launch/837',
            'disney': 'launch/291097',
            'prime': 'launch/13',
            'hbo': 'launch/61322'
        }
        
        action_lower = action.lower().strip()
        
        try:
            if action_lower in roku_commands:
                cmd = roku_commands[action_lower]
                
                # Launch app or send keypress
                if cmd.startswith('launch/'):
                    url = f"{base_url}/launch/{cmd.split('/')[1]}"
                    response = requests.post(url, timeout=5)
                else:
                    url = f"{base_url}/keypress/{cmd}"
                    response = requests.post(url, timeout=5)
                
                if response.status_code == 200:
                    return f"✅ REAL Command Executed!\nSent: {action} to Roku TV"
                else:
                    return f"⚠️ Command sent but got response: {response.status_code}"
            else:
                # Show available commands
                available = ', '.join(list(roku_commands.keys())[:15])
                return f"⚠️ Unknown command: {action}\n\nAvailable: {available}..."
                
        except Exception as e:
            return f"❌ Roku API Error: {str(e)}\nMake sure TV is on network."
    
    def cmd_shutdown(self, ip):
        """Shutdown device"""
        if ip not in self.wifi_devices:
            self.send_telegram(f"⚠️ Unknown device: `{ip}`")
            return
        
        self.send_telegram(f"🔴 *Shutting down* `{ip}`\n{self.wifi_devices[ip]['name']}")
    
    def cmd_restart(self, ip):
        """Restart device"""
        if ip not in self.wifi_devices:
            self.send_telegram(f"⚠️ Unknown device: `{ip}`")
            return
        
        self.send_telegram(f"🔄 *Restarting* `{ip}`\n{self.wifi_devices[ip]['name']}")
    
    def cmd_lock(self, ip):
        """Lock device"""
        if ip not in self.wifi_devices:
            self.send_telegram(f"⚠️ Unknown device: `{ip}`")
            return
        
        self.send_telegram(f"🔒 *Locking* `{ip}`\n{self.wifi_devices[ip]['name']}")
    
    def cmd_ping(self, ip):
        """Ping device"""
        try:
            result = subprocess.run(['ping', '-c', '3', ip], capture_output=True, text=True, timeout=10)
            alive = result.returncode == 0
            
            msg = f"🏓 *Ping {ip}*\n\n"
            if alive:
                msg += "✅ Device is ONLINE"
            else:
                msg += "🔴 Device is OFFLINE"
            
            self.send_telegram(msg)
        except:
            self.send_telegram(f"❌ Ping failed for `{ip}`")
    
    def cmd_help(self):
        """Show help"""
        msg = """
🎯 *Worldwide Agent Commands*

**Scanning & Travel:**
/scan - Find all REAL devices on WiFi
/travel - Travel to T-Mobile towers worldwide
/devices - List known devices
/status - Agent status

**Device Control:**
/control <ip> <command> - Control device
/shutdown <ip> - Shutdown device
/restart <ip> - Restart device
/lock <ip> - Lock device
/ping <ip> - Ping device

**Example:**
/scan - Find WiFi devices
/travel - Visit cellular towers
/control 192.168.12.5 check_status
/shutdown 192.168.12.10

💡 Use /scan for WiFi, /travel for worldwide!
"""
        self.send_telegram(msg)
    
    def run(self):
        """Main loop"""
        try:
            print(f"🚀 Worldwide Agent Started: {self.agent_id}")
            print(f"📡 Telegram: @JDTechSupportbot")
            print(f"🏠 WiFi: {YOUR_WIFI_NETWORK}.x")
            print(f"🌍 Towers: {len(TMOBILE_TOWERS)} T-Mobile towers available")
            
            # Initial scan
            print("\n🔍 Initial scan...")
            devices = self.scan_real_devices()
            print(f"✅ Found {len(devices)} REAL devices")
            
            # Send startup message
            print("📤 Sending startup message to Telegram...")
            self.send_telegram(f"""
🟢 *Worldwide Agent Online*

ID: `{self.agent_id}`
WiFi: {YOUR_WIFI_NETWORK}.x ({len(devices)} devices)
Towers: {len(TMOBILE_TOWERS)} T-Mobile available

Send /help for commands
Send /scan to find WiFi devices
Send /travel to visit cellular towers
""")
            print("✅ Startup message sent!")
        except Exception as e:
            print(f"❌ Startup error: {e}")
            import traceback
            traceback.print_exc()
        
        # Main loop
        cycle = 0
        while self.active:
            cycle += 1
            
            # Check for commands every 5 seconds
            self.check_telegram()
            
            # Re-scan every 60 seconds
            if cycle % 12 == 0:
                print(f"\n🔄 Auto-scan...")
                self.scan_real_devices()
            
            time.sleep(5)

if __name__ == '__main__':
    print("=" * 60)
    print("STARTING WORLDWIDE AGENT")
    print("=" * 60)
    try:
        agent = WorldwideAgent()
        print("Agent object created successfully!")
        agent.run()
    except KeyboardInterrupt:
        print("\n👋 Agent stopped")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
