#!/usr/bin/env python3
"""
CONTINUOUS AUTONOMOUS DATA HARVESTER WITH REAL-TIME POSITION REPORTING
Runs forever, harvests all devices every 5 minutes, reports position to API
"""

import subprocess
import socket
import json
import time
import requests
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

NETWORK = '192.168.12'
CLOUD_API = 'https://nupidesktopai.com/api/devices'
AGENT_API = 'https://nupidesktopai.com/api/agent/position'
TELEGRAM_BOT_TOKEN = '8407882307:AAErVEXhC26xQtDWlXdBZf2JX_sMiTtT22Y'
TELEGRAM_CHAT_ID = '6523159355'
HARVEST_INTERVAL = 300  # 5 minutes

class ContinuousHarvester:
    def __init__(self):
        self.devices = {}
        self.harvest_count = 0
        self.cycle = 0
        self.agent_id = f"harvester-{int(time.time())}"
        self.current_action = "Initializing"
        self.current_target = None
        self.is_running = True
        
        # Start position reporting thread
        self.position_thread = threading.Thread(target=self.report_position_loop, daemon=True)
        self.position_thread.start()
        print(f"🤖 Agent ID: {self.agent_id}")
        print(f"📡 Position reporting: ACTIVE")
        
    def report_position(self, action="Idle", target_ip=None, position=None):
        """Report current position/action to API"""
        try:
            if position is None:
                # Calculate position based on target IP (for visualization)
                if target_ip:
                    last_octet = int(target_ip.split('.')[-1])
                    x = 100 + (last_octet * 3) % 600
                    y = 100 + (last_octet * 7) % 400
                    position = {"x": x, "y": y}
                else:
                    position = {"x": 400, "y": 300}  # Center when idle
            
            data = {
                "agent_id": self.agent_id,
                "agent_type": "Data Harvester",
                "position": position,
                "action": action,
                "target_ip": target_ip,
                "status": "active"
            }
            
            requests.post(AGENT_API, json=data, timeout=2)
        except:
            pass  # Silent fail, don't interrupt harvesting
    
    def report_position_loop(self):
        """Background thread that reports position every 10 seconds"""
        while self.is_running:
            self.report_position(self.current_action, self.current_target)
            time.sleep(10)
    
    def send_telegram(self, message):
        """Send to Telegram"""
        try:
            url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage'
            requests.post(url, json={'chat_id': TELEGRAM_CHAT_ID, 'text': message}, timeout=5)
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
    
    def get_roku_info(self, ip):
        """Get Roku device info"""
        try:
            response = requests.get(f'http://{ip}:8060/query/device-info', timeout=2)
            if response.status_code == 200:
                text = response.text
                info = {}
                
                for field in ['model-name', 'serial-number', 'software-version']:
                    start = text.find(f'<{field}>')
                    end = text.find(f'</{field}>')
                    if start != -1 and end != -1:
                        info[field] = text[start+len(field)+2:end]
                
                # Get apps
                try:
                    apps_response = requests.get(f'http://{ip}:8060/query/apps', timeout=2)
                    app_count = apps_response.text.count('<app')
                    info['app_count'] = app_count
                except:
                    info['app_count'] = 0
                
                return info
        except:
            return {}
    
    def harvest_device(self, ip):
        """Harvest single device with position reporting"""
        # Report scanning this IP
        self.current_action = f"Scanning {ip}"
        self.current_target = ip
        
        if not self.ping_ip(ip):
            return None
        
        hostname = self.get_hostname(ip)
        open_ports = self.scan_ports(ip)
        
        # Get MAC from ARP
        mac = None
        vendor = 'Unknown'
        try:
            result = subprocess.run(['arp', '-a'], capture_output=True, text=True, timeout=60)
            for line in result.stdout.split('\n'):
                if ip in line:
                    parts = line.split()
                    for part in parts:
                        if ':' in part and len(part) == 17:
                            mac = part
                            vendor = self.get_mac_vendor(mac)
                            break
        except:
            pass
        
        # Device type detection
        device_type = 'Unknown'
        if any(p['service'] == 'Roku-API' for p in open_ports):
            device_type = 'Roku'
        elif 'imac' in hostname.lower() or 'mac' in hostname.lower():
            device_type = 'Mac'
        elif 'iphone' in hostname.lower():
            device_type = 'iOS'
        elif 'galaxy' in hostname.lower() or 'android' in hostname.lower():
            device_type = 'Android'
        elif 'router' in hostname.lower() or 'gateway' in hostname.lower() or any(p['service'] == 'HTTP-Proxy' for p in open_ports):
            device_type = 'Router'
        
        device_info = {
            'ip': ip,
            'hostname': hostname,
            'mac': mac,
            'vendor': vendor,
            'device_type': device_type,
            'open_ports': open_ports,
            'online': True,
            'last_seen': datetime.now().isoformat()
        }
        
        # Get Roku-specific info
        if device_type == 'Roku':
            self.current_action = f"Probing Roku at {ip}"
            roku_info = self.get_roku_info(ip)
            device_info.update(roku_info)
        
        self.devices[ip] = device_info
        return device_info
    
    def scan_network(self):
        """Scan entire network with position reporting"""
        print(f"\n{'='*70}")
        print(f"🔄 HARVEST CYCLE #{self.cycle}")
        print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*70}\n")
        
        self.current_action = "Starting network scan"
        self.report_position()
        
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
        
        self.current_action = "Scan complete"
        self.report_position()
        
        return self.devices
    
    def upload_to_api(self):
        """Upload data to cloud API"""
        try:
            self.current_action = "Uploading to API"
            self.report_position()
            
            data = {
                'scan_time': datetime.now().isoformat(),
                'network': f'{NETWORK}.x',
                'total_devices': len(self.devices),
                'devices': list(self.devices.values()),
                'cycle': self.cycle,
                'agent_id': self.agent_id
            }
            
            response = requests.post(CLOUD_API, json=data, timeout=10)
            if response.status_code == 200:
                print(f"✅ Data uploaded to cloud API")
            else:
                print(f"⚠️  API upload failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Failed to upload: {e}")
    
    def save_local(self):
        """Save to local JSON file"""
        try:
            filename = f"harvest-cycle-{self.cycle}.json"
            data = {
                'scan_time': datetime.now().isoformat(),
                'network': f'{NETWORK}.x',
                'total_devices': len(self.devices),
                'devices': list(self.devices.values()),
                'cycle': self.cycle,
                'agent_id': self.agent_id
            }
            
            with open(filename, 'w') as f:
                json.dump(data, f, indent=2)
            
            print(f"💾 Saved to {filename}")
        except Exception as e:
            print(f"❌ Failed to save: {e}")
    
    def send_summary(self):
        """Send Telegram summary"""
        devices_by_type = {}
        for device in self.devices.values():
            dtype = device['device_type']
            devices_by_type[dtype] = devices_by_type.get(dtype, 0) + 1
        
        summary = f"🔄 CYCLE {self.cycle} COMPLETE\n\n"
        summary += f"📊 Total Devices: {len(self.devices)}\n"
        summary += f"🌐 Network: {NETWORK}.x\n\n"
        summary += "Device Types:\n"
        for dtype, count in devices_by_type.items():
            summary += f"  • {dtype}: {count}\n"
        
        self.send_telegram(summary)
    
    def run_forever(self):
        """Main loop - runs forever"""
        print(f"""
╔════════════════════════════════════════════════════════════╗
║     �� CONTINUOUS AUTONOMOUS HARVESTER WITH POSITIONS     ║
╚════════════════════════════════════════════════════════════╝

✅ Agent ID: {self.agent_id}
✅ Network: {NETWORK}.x
✅ API: {CLOUD_API}
✅ Position Reporting: Every 10 seconds
✅ Scan Interval: {HARVEST_INTERVAL} seconds ({HARVEST_INTERVAL//60} minutes)
✅ Telegram: Enabled

Starting continuous harvesting...
""")
        
        try:
            while True:
                self.cycle += 1
                
                # Scan network
                self.scan_network()
                
                # Upload to API
                self.upload_to_api()
                
                # Save locally
                self.save_local()
                
                # Send Telegram summary
                self.send_summary()
                
                # Wait for next cycle
                self.current_action = f"Waiting for next cycle ({HARVEST_INTERVAL}s)"
                self.current_target = None
                print(f"\n⏳ Waiting {HARVEST_INTERVAL} seconds until next cycle...\n")
                time.sleep(HARVEST_INTERVAL)
                
        except KeyboardInterrupt:
            print("\n\n🛑 Stopping harvester...")
            self.is_running = False
            self.current_action = "Offline"
            self.report_position()
            print("✅ Harvester stopped")

if __name__ == '__main__':
    harvester = ContinuousHarvester()
    harvester.run_forever()
