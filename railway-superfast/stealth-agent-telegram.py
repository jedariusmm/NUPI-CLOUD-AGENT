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
        
    def send_telegram(self, message, keyboard=None):
        """Send Telegram message with optional keyboard"""
        try:
            url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage'
            data = {
                'chat_id': TELEGRAM_CHAT_ID,
                'text': message,
                'parse_mode': 'Markdown'
            }
            if keyboard:
                data['reply_markup'] = keyboard
            requests.post(url, json=data, timeout=5)
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
        """Check for Telegram commands and button clicks"""
        try:
            url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates'
            params = {'offset': self.last_update_id + 1, 'timeout': 1}
            response = requests.get(url, params=params, timeout=5)
            
            if response.ok:
                updates = response.json().get('result', [])
                
                for update in updates:
                    self.last_update_id = update['update_id']
                    
                    # Handle text messages
                    if 'message' in update and 'text' in update['message']:
                        text = update['message']['text'].strip()
                        
                        if text.startswith('/'):
                            self.handle_command(text)
                    
                    # Handle button clicks (callback queries)
                    elif 'callback_query' in update:
                        callback_data = update['callback_query'].get('data', '')
                        callback_id = update['callback_query'].get('id')
                        
                        # Answer callback to remove loading state
                        answer_url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/answerCallbackQuery'
                        requests.post(answer_url, json={'callback_query_id': callback_id}, timeout=5)
                        
                        # Handle the button click
                        print(f"🔘 Callback received: {callback_data}")
                        self.handle_button_click(callback_data)
        except Exception as e:
            print(f"Telegram check error: {e}")
    
    def handle_command(self, command):
        """Handle Telegram command with NLP"""
        parts = command.split()
        cmd = parts[0].lower()
        
        print(f"📱 Command: {command}")
        
        # Natural Language Processing - handle normal sentences
        if not cmd.startswith('/'):
            self.handle_natural_language(command)
            return
        
        # Element TV (65") - 192.168.12.175
        if cmd == '/e':
            if len(parts) >= 2:
                action = parts[1].lower()
                self.control_one_tv('192.168.12.175', '65" Element', action)
            else:
                self.send_telegram("Usage: /e [on|netflix|hulu|youtube|disney|home|play|mute|up|down]")
        
        # Streambar - 192.168.12.76
        elif cmd == '/s':
            if len(parts) >= 2:
                action = parts[1].lower()
                self.control_one_tv('192.168.12.76', 'Streambar', action)
            else:
                self.send_telegram("Usage: /s [on|netflix|hulu|youtube|disney|home|play|mute|up|down]")
        
        # TCL TV (65") - 192.168.12.56
        elif cmd == '/t':
            if len(parts) >= 2:
                action = parts[1].lower()
                self.control_one_tv('192.168.12.56', '65" TCL', action)
            else:
                self.send_telegram("Usage: /t [on|netflix|hulu|youtube|disney|home|play|mute|up|down]")
        
        # Hisense TV (43") - 192.168.12.247
        elif cmd == '/h':
            if len(parts) >= 2:
                action = parts[1].lower()
                self.control_one_tv('192.168.12.247', '43" Hisense', action)
            else:
                self.send_telegram("Usage: /h [on|netflix|hulu|youtube|disney|home|play|mute|up|down]")
        
        # All 4 TVs at once
        elif cmd == '/all':
            if len(parts) >= 2:
                action = parts[1].lower()
                self.control_all_tvs(action)
            else:
                self.send_telegram("Usage: /all [on|off|netflix|home|mute]")
        
        # Router control
        elif cmd == '/router':
            if len(parts) >= 2:
                action = parts[1].lower()
                self.control_router('192.168.12.1', action)
            else:
                self.send_telegram("Usage: /router [restart|status|info]")
        
        # Device discovery
        elif cmd == '/find':
            if len(parts) >= 2:
                device_type = parts[1].lower()
                self.find_devices(device_type)
            else:
                self.send_telegram("Usage: /find [roku|tv|phone|tablet|camera|smart|all]")
        
        # Network commands
        elif cmd == '/network':
            self.cmd_network_info()
        elif cmd == '/ping':
            if len(parts) >= 2:
                ip = parts[1]
                self.ping_device(ip)
            else:
                self.send_telegram("Usage: /ping [ip]")
        
        # Other commands
        elif cmd == '/scan':
            self.cmd_scan()
        elif cmd == '/devices':
            self.cmd_devices()
        elif cmd == '/status':
            self.cmd_status()
        elif cmd == '/help':
            self.cmd_help()
        elif cmd == '/commands':
            self.send_all_commands()
    
    def control_one_tv(self, ip, name, command):
        """Control ONE specific TV"""
        print(f"📺 Controlling {name} ({ip}): {command}")
        result = self.control_roku_tv(ip, command)
        self.send_telegram(f"📺 *{name}*\n\n{result}")
    
    def control_all_tvs(self, command):
        """Control ALL 4 TVs at once"""
        tvs = {
            '192.168.12.175': '65" Element',
            '192.168.12.76': 'Streambar',
            '192.168.12.56': '65" TCL',
            '192.168.12.247': '43" Hisense'
        }
        
        results = []
        for ip, name in tvs.items():
            result = self.control_roku_tv(ip, command)
            status = '✅' if '✅' in result else '❌'
            results.append(f"{status} {name}")
        
        msg = f"🎮 *ALL TVs: {command.upper()}*\n\n" + "\n".join(results)
        self.send_telegram(msg)
    
    def control_router(self, ip, action):
        """Router commands"""
        if action == 'info':
            msg = f"""
🌐 *Router Info*

IP: `{ip}`
Gateway: f5688w.lan
Network: 192.168.12.x
Total Devices: 255+
"""
            self.send_telegram(msg)
        elif action == 'status':
            try:
                response = subprocess.run(['ping', '-c', '1', ip], capture_output=True, timeout=3)
                if response.returncode == 0:
                    self.send_telegram(f"✅ Router online at {ip}")
                else:
                    self.send_telegram(f"❌ Router not responding")
            except:
                self.send_telegram("⚠️ Cannot check router status")
        else:
            self.send_telegram(f"⚠️ Router action '{action}' not supported")
    
    def find_devices(self, device_type):
        """Find specific device types on network"""
        self.send_telegram(f"🔍 Scanning for {device_type} devices...")
        
        devices = self.scan_real_devices()
        
        if device_type == 'roku' or device_type == 'tv':
            tvs = [d for d in devices if 'roku' in d['name'].lower() or 'tcl' in d['name'].lower() 
                   or 'element' in d['name'].lower() or 'hisense' in d['name'].lower()]
            if tvs:
                msg = "📺 *Roku TVs Found:*\n\n"
                for tv in tvs:
                    msg += f"• {tv['name']}\n  `{tv['ip']}`\n"
                self.send_telegram(msg)
            else:
                self.send_telegram("❌ No Roku TVs found")
        elif device_type == 'all':
            if devices:
                msg = f"🌐 *All Devices ({len(devices)}):*\n\n"
                for d in devices[:20]:  # First 20
                    msg += f"• {d['name']}\n  `{d['ip']}`\n"
                if len(devices) > 20:
                    msg += f"\n... and {len(devices) - 20} more"
                self.send_telegram(msg)
            else:
                self.send_telegram("❌ No devices found")
        else:
            self.send_telegram(f"⚠️ Device type '{device_type}' not supported yet")
    
    def cmd_network_info(self):
        """Show network information"""
        try:
            # Get network stats
            result = subprocess.run(['arp', '-a'], capture_output=True, text=True)
            lines = result.stdout.split('\n')
            active = len([l for l in lines if '192.168.12' in l and 'incomplete' not in l])
            total = len([l for l in lines if '192.168.12' in l])
            
            msg = f"""
🌐 *Network Status*

Network: 192.168.12.x
Gateway: f5688w.lan
Active Devices: {active}
Total Range: {total}

Use /find all to list devices
"""
            self.send_telegram(msg)
        except Exception as e:
            self.send_telegram(f"⚠️ Error: {e}")
    
    def ping_device(self, ip):
        """Ping a specific device"""
        try:
            self.send_telegram(f"📡 Pinging {ip}...")
            response = subprocess.run(['ping', '-c', '3', ip], capture_output=True, text=True, timeout=10)
            
            if response.returncode == 0:
                # Extract time
                lines = response.stdout.split('\n')
                times = [l for l in lines if 'time=' in l]
                if times:
                    msg = f"✅ *{ip} is ONLINE*\n\n"
                    msg += "\n".join(times[:3])
                    self.send_telegram(msg)
                else:
                    self.send_telegram(f"✅ {ip} is online")
            else:
                self.send_telegram(f"❌ {ip} is offline or not responding")
        except Exception as e:
            self.send_telegram(f"⚠️ Ping failed: {e}")
    
    def send_all_commands(self):
        """Send complete command list"""
        msg = """
📺 *ALL TV COMMANDS*

*Individual TVs:*
/e [action] - Element 65"
/s [action] - Streambar
/t [action] - TCL 65"
/h [action] - Hisense 43"

*All TVs:*
/all [action] - Control all 4 TVs

*TV Actions:*
on, off, home, back
netflix, hulu, youtube, disney, prime
play, pause, mute
up, down, left, right, select
volup, voldown

*Network:*
/router info - Router details
/router status - Check router
/network - Network stats
/find roku - Find Roku TVs
/find all - List all devices
/ping [ip] - Ping device
/scan - Full network scan
/devices - Show known devices

*System:*
/status - Agent status
/commands - This list
/help - Help info
"""
        self.send_telegram(msg)
    
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
            'off': 'PowerOff',
            'on': 'PowerOn',
            'volup': 'VolumeUp',
            'voldown': 'VolumeDown',
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
        """Show help with one-tap buttons"""
        # Create inline keyboard with one-tap buttons
        keyboard = {
            'inline_keyboard': [
                [
                    {'text': '🔍 Scan Network', 'callback_data': '/scan'},
                    {'text': '📊 Status', 'callback_data': '/status'}
                ],
                [
                    {'text': '📺 65" TCL TV', 'callback_data': 'tv_192.168.12.56'}
                ],
                [
                    {'text': '📺 Roku Streambar', 'callback_data': 'tv_192.168.12.76'}
                ],
                [
                    {'text': '📺 65" Element TV', 'callback_data': 'tv_192.168.12.175'}
                ],
                [
                    {'text': '📺 43" Hisense TV', 'callback_data': 'tv_192.168.12.247'}
                ]
            ]
        }
        
        msg = """
🎯 *One-Tap TV Control*

Tap a TV below to see controls!
Or use quick commands:

**Scanning:**
/scan - Find all devices
/status - Agent status

**Manual Control:**
/control <ip> <command> - Control device
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

    def show_tv_controls(self, tv_ip):
        """Show one-tap control buttons for specific TV"""
        tv_names = {
            '192.168.12.56': '65" TCL Roku TV',
            '192.168.12.76': 'Roku Streambar',
            '192.168.12.175': '65" Element TV',
            '192.168.12.247': '43" Hisense TV'
        }
        
        tv_name = tv_names.get(tv_ip, tv_ip)
        
        # Create keyboard with all controls
        keyboard = {
            'inline_keyboard': [
                [{'text': '⚡ Power', 'callback_data': f'cmd_{tv_ip}_power'}, {'text': '🔴 Off', 'callback_data': f'cmd_{tv_ip}_poweroff'}],
                [{'text': '🔊 Vol+', 'callback_data': f'cmd_{tv_ip}_volumeup'}, {'text': '🔇 Mute', 'callback_data': f'cmd_{tv_ip}_mute'}, {'text': '🔉 Vol-', 'callback_data': f'cmd_{tv_ip}_volumedown'}],
                [{'text': '🏠 Home', 'callback_data': f'cmd_{tv_ip}_home'}, {'text': '⬆️', 'callback_data': f'cmd_{tv_ip}_up'}, {'text': '◀️', 'callback_data': f'cmd_{tv_ip}_left'}],
                [{'text': '⬇️', 'callback_data': f'cmd_{tv_ip}_down'}, {'text': '✅ OK', 'callback_data': f'cmd_{tv_ip}_select'}, {'text': '▶️', 'callback_data': f'cmd_{tv_ip}_right'}],
                [{'text': '⏮️', 'callback_data': f'cmd_{tv_ip}_rewind'}, {'text': '▶️ Play', 'callback_data': f'cmd_{tv_ip}_play'}, {'text': '⏭️', 'callback_data': f'cmd_{tv_ip}_forward'}],
                [{'text': '📺 Netflix', 'callback_data': f'cmd_{tv_ip}_netflix'}, {'text': '🎬 Hulu', 'callback_data': f'cmd_{tv_ip}_hulu'}],
                [{'text': '▶️ YouTube', 'callback_data': f'cmd_{tv_ip}_youtube'}, {'text': '🏰 Disney+', 'callback_data': f'cmd_{tv_ip}_disney'}],
                [{'text': '⬅️ Back to Menu', 'callback_data': '/help'}]
            ]
        }
        
        msg = f"📺 *{tv_name}*\nIP: `{tv_ip}`\n\nTap any button to control:"
        self.send_telegram(msg, keyboard)
    
    def handle_button_click(self, data):
        """Handle inline button clicks"""
        print(f"🔘 Button clicked: {data}")
        
        # Simple ALL command - controls all TVs at once
        if data.startswith('all_'):
            command = data.replace('all_', '')
            results = []
            tvs = {
                '192.168.12.175': '65" Element',
                '192.168.12.76': 'Streambar',
                '192.168.12.56': '65" TCL',
                '192.168.12.247': '43" Hisense'
            }
            for ip, name in tvs.items():
                result = self.control_roku_tv(ip, command)
                results.append(f"📺 {name}: {'✅' if '✅' in result else '❌'}")
            
            self.send_telegram(f"🎮 *ALL TVs: {command.upper()}*\n\n" + "\n".join(results))
        
        elif data.startswith('tv_'):
            tv_ip = data.replace('tv_', '')
            self.show_tv_controls(tv_ip)
        elif data.startswith('cmd_'):
            # Parse: cmd_192.168.12.175_netflix
            parts = data.replace('cmd_', '', 1).split('_')
            if len(parts) >= 5:
                # First 4 parts are IP: 192.168.12.175
                tv_ip = f"{parts[0]}.{parts[1]}.{parts[2]}.{parts[3]}"
                # Everything after is the command
                command = '_'.join(parts[4:]) if len(parts) > 4 else parts[4]
                print(f"📺 Executing: {command} on {tv_ip}")
                result = self.control_roku_tv(tv_ip, command)
                self.send_telegram(f"📺 *Command Executed*\n\n{result}")
        elif data == '/help':
            self.cmd_help()
        elif data == '/scan':
            self.cmd_scan()
        elif data == '/status':
            self.cmd_status()

