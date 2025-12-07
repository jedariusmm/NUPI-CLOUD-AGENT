#!/usr/bin/env python3
"""
CONTINUOUS AUTONOMOUS DATA HARVESTER
Runs forever, harvests all devices every 5 minutes, sends to API
"""

import subprocess
import socket
import json
import time
import requests
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

NETWORK = '192.168.12'
CLOUD_API = 'http://nupidesktopai.com/api/devices'
TELEGRAM_BOT_TOKEN = '8407882307:AAErVEXhC26xQtDWlXdBZf2JX_sMiTtT22Y'
TELEGRAM_CHAT_ID = '6523159355'
HARVEST_INTERVAL = 300  # 5 minutes

class ContinuousHarvester:
    def __init__(self):
        self.devices = {}
        self.harvest_count = 0
        self.cycle = 0
        self.agent_id = f"harvester-{int(time.time())}"
        
    def send_telegram(self, message):
        """Send to Telegram"""
        try:
            url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage'
            requests.post(url, json={'chat_id': TELEGRAM_CHAT_ID, 'text': message, 'parse_mode': 'Markdown'}, timeout=5)
        except:
            pass
    
    def ping_ip(self, ip):
        """Fast ping"""
        try:
            result = subprocess.run(['ping', '-c', '1', '-W', '1', ip], 
                                  capture_output=True, timeout=2)
            return result.returncode == 0
        except:
            return False
    
    def get_hostname(self, ip):
        """Get hostname"""
        try:
            socket.setdefaulttimeout(0.5)
            hostname = socket.gethostbyaddr(ip)[0]
            socket.setdefaulttimeout(None)
            return hostname
        except:
            return f"Device-{ip.split('.')[-1]}"
    
    def get_mac_vendor(self, mac):
        """Get vendor from MAC"""
        try:
            mac_prefix = mac.replace(':', '').upper()[:6]
            vendors = {
                '38E7C0': 'Roku Inc', '20EFBD': 'Roku Inc', '94B3F7': 'TCL',
                '386407': 'Hisense', '30671A': 'Sagemcom', 'E86E3A': 'Wireless',
            }
            return vendors.get(mac_prefix, 'Unknown')
        except:
            return 'Unknown'
    
    def scan_ports(self, ip):
        """Scan common ports"""
        ports = {
            80: 'HTTP', 443: 'HTTPS', 8060: 'Roku-API', 8080: 'HTTP-Proxy',
            22: 'SSH', 445: 'SMB', 3389: 'RDP', 5353: 'mDNS'
        }
        
        open_ports = []
        for port, service in ports.items():
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.3)
            try:
                if sock.connect_ex((ip, port)) == 0:
                    open_ports.append({'port': port, 'service': service})
            except:
                pass
            finally:
                sock.close()
        
        return open_ports
    
    def probe_roku(self, ip):
        """Get Roku device data"""
        try:
            response = requests.get(f'http://{ip}:8060/query/device-info', timeout=2)
            if response.status_code == 200:
                import xml.etree.ElementTree as ET
                root = ET.fromstring(response.text)
                return {
                    'model': root.findtext('model-name', 'Unknown'),
                    'serial': root.findtext('serial-number', 'Unknown'),
                    'version': root.findtext('software-version', 'Unknown'),
                    'friendly_name': root.findtext('user-device-name', 'Unknown'),
                }
        except:
            pass
        return None
    
    def get_arp_mac(self, ip):
        """Get MAC from ARP"""
        try:
            result = subprocess.run(['arp', '-a', ip], capture_output=True, text=True, timeout=1)
            import re
            mac_match = re.search(r'([0-9a-f]{1,2}:[0-9a-f]{1,2}:[0-9a-f]{1,2}:[0-9a-f]{1,2}:[0-9a-f]{1,2}:[0-9a-f]{1,2})', 
                                result.stdout, re.IGNORECASE)
            if mac_match:
                return mac_match.group(1)
        except:
            pass
        return 'Unknown'
    
    def harvest_device(self, ip):
        """Harvest single device"""
        if not self.ping_ip(ip):
            return None
        
        hostname = self.get_hostname(ip)
        mac = self.get_arp_mac(ip)
        vendor = self.get_mac_vendor(mac)
        open_ports = self.scan_ports(ip)
        
        device = {
            'ip': ip,
            'hostname': hostname,
            'mac': mac,
            'vendor': vendor,
            'open_ports': len(open_ports),
            'services': [p['service'] for p in open_ports],
            'last_seen': datetime.now().isoformat(),
            'agent_id': self.agent_id
        }
        
        # Check device type
        hostname_lower = hostname.lower()
        if 'roku' in hostname_lower or any(p['port'] == 8060 for p in open_ports):
            device['device_type'] = '📺 Roku Device'
            roku_data = self.probe_roku(ip)
            if roku_data:
                device['roku'] = roku_data
        elif 'iphone' in hostname_lower or 'ipad' in hostname_lower:
            device['device_type'] = '📱 iOS Device'
        elif 'android' in hostname_lower or 'galaxy' in hostname_lower:
            device['device_type'] = '📱 Android Device'
        elif 'mac' in hostname_lower or 'imac' in hostname_lower:
            device['device_type'] = '💻 Mac Computer'
        elif 'router' in hostname_lower or 'gateway' in hostname_lower:
            device['device_type'] = '🌐 Router/Gateway'
        else:
            device['device_type'] = '❓ Unknown Device'
        
        self.devices[ip] = device
        return device
    
    def scan_network(self):
        """Scan entire network"""
        print(f"\n{'='*70}")
        print(f"🔄 HARVEST CYCLE #{self.cycle}")
        print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*70}\n")
        
        self.devices = {}
        start_time = time.time()
        
        # Parallel scanning
        with ThreadPoolExecutor(max_workers=50) as executor:
            futures = [executor.submit(self.harvest_device, f"{NETWORK}.{i}") 
                      for i in range(1, 256)]
            
            for future in as_completed(futures):
                try:
                    device = future.result()
                    if device:
                        print(f"✅ {device['ip']} - {device['hostname']} ({device['device_type']})")
                except:
                    pass
        
        elapsed = time.time() - start_time
        print(f"\n{'='*70}")
        print(f"✅ Cycle #{self.cycle} complete: {len(self.devices)} devices in {elapsed:.1f}s")
        print(f"{'='*70}\n")
        
        return self.devices
    
    def upload_to_api(self):
        """Upload data to API"""
        payload = {
            'agent_id': self.agent_id,
            'scan_time': datetime.now().isoformat(),
            'network': f"{NETWORK}.x",
            'total_devices': len(self.devices),
            'cycle': self.cycle,
            'devices': list(self.devices.values())
        }
        
        try:
            # Try local API first
            response = requests.post(CLOUD_API, json=payload, timeout=5)
            if response.ok:
                print(f"📤 Uploaded to API: {response.status_code}")
                return True
        except:
            print(f"⚠️  Local API unavailable, saving to file")
        
        # Save to file as backup
        filename = f"harvest-cycle-{self.cycle}.json"
        with open(filename, 'w') as f:
            json.dump(payload, f, indent=2)
        print(f"💾 Saved to {filename}")
        return False
    
    def generate_summary(self):
        """Generate harvest summary"""
        rokus = sum(1 for d in self.devices.values() if '📺' in d['device_type'])
        computers = sum(1 for d in self.devices.values() if '💻' in d['device_type'] or '📱' in d['device_type'])
        
        summary = f"""
🔄 *Cycle #{self.cycle} Complete*

🎯 Found: *{len(self.devices)} devices*
📺 Roku TVs: *{rokus}*
💻 Computers: *{computers}*
⏰ Time: {datetime.now().strftime('%H:%M:%S')}

*Top Devices:*
"""
        
        for ip, device in list(self.devices.items())[:5]:
            summary += f"• {device['hostname']} ({ip})\n"
        
        summary += f"\n⏳ Next scan in {HARVEST_INTERVAL}s"
        
        return summary
    
    def run_forever(self):
        """Main loop - run forever"""
        print(f"""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     🤖 CONTINUOUS AUTONOMOUS HARVESTER STARTED 🤖           ║
║                                                              ║
║  Network: {NETWORK}.x                                       ║
║  Interval: Every {HARVEST_INTERVAL}s ({HARVEST_INTERVAL//60} minutes)                  ║
║  Mode: AUTONOMOUS & CONTINUOUS                               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
""")
        
        self.send_telegram(f"""
🤖 *AUTONOMOUS HARVESTER ONLINE*

Network: `{NETWORK}.x`
Interval: Every {HARVEST_INTERVAL//60} minutes
Mode: *CONTINUOUS & AUTONOMOUS*

Starting first harvest...
""")
        
        while True:
            try:
                self.cycle += 1
                
                # Scan network
                self.scan_network()
                
                # Upload to API
                self.upload_to_api()
                
                # Send summary to Telegram
                summary = self.generate_summary()
                self.send_telegram(summary)
                
                # Wait for next cycle
                print(f"\n⏳ Sleeping {HARVEST_INTERVAL}s until next harvest...\n")
                time.sleep(HARVEST_INTERVAL)
                
            except KeyboardInterrupt:
                print("\n\n⏹️  Harvester stopped by user")
                self.send_telegram(f"⏹️ Autonomous harvester stopped after {self.cycle} cycles")
                break
            except Exception as e:
                print(f"❌ Error in cycle {self.cycle}: {e}")
                time.sleep(60)  # Wait 1 minute on error

if __name__ == '__main__':
    harvester = ContinuousHarvester()
    harvester.run_forever()
