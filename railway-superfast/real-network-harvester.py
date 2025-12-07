#!/usr/bin/env python3
"""
REAL NETWORK DATA HARVESTER
Continuously scans 192.168.12.x and harvests ALL data from ALL devices
"""

import subprocess
import socket
import json
import time
import requests
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

NETWORK = '192.168.12'
TELEGRAM_BOT_TOKEN = '8407882307:AAErVEXhC26xQtDWlXdBZf2JX_sMiTtT22Y'
TELEGRAM_CHAT_ID = '6523159355'

class NetworkHarvester:
    def __init__(self):
        self.devices = {}
        self.harvest_count = 0
        
    def send_telegram(self, message):
        """Send message to Telegram"""
        try:
            url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage'
            requests.post(url, json={'chat_id': TELEGRAM_CHAT_ID, 'text': message, 'parse_mode': 'Markdown'}, timeout=5)
        except:
            pass
    
    def ping_ip(self, ip):
        """Fast ping check - returns True if alive"""
        try:
            result = subprocess.run(['ping', '-c', '1', '-W', '1', ip], 
                                  capture_output=True, timeout=2)
            return result.returncode == 0
        except:
            return False
    
    def scan_ports(self, ip):
        """Scan common ports to identify device type and services"""
        common_ports = {
            22: 'SSH', 23: 'Telnet', 80: 'HTTP', 443: 'HTTPS',
            8080: 'HTTP-ALT', 8060: 'Roku', 3389: 'RDP',
            5353: 'mDNS', 554: 'RTSP', 8008: 'Chromecast',
            9000: 'SonarQube', 445: 'SMB', 139: 'NetBIOS',
            21: 'FTP', 25: 'SMTP', 110: 'POP3', 143: 'IMAP'
        }
        
        open_ports = []
        for port, service in common_ports.items():
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.5)
            try:
                result = sock.connect_ex((ip, port))
                if result == 0:
                    open_ports.append({'port': port, 'service': service})
            except:
                pass
            finally:
                sock.close()
        
        return open_ports
    
    def get_hostname(self, ip):
        """Get device hostname via reverse DNS"""
        try:
            socket.setdefaulttimeout(1)
            hostname = socket.gethostbyaddr(ip)[0]
            socket.setdefaulttimeout(None)
            return hostname
        except:
            return f"Device-{ip.split('.')[-1]}"
    
    def get_mac_address(self, ip):
        """Get MAC address from ARP cache"""
        try:
            result = subprocess.run(['arp', '-n', ip], capture_output=True, text=True, timeout=2)
            for line in result.stdout.split('\n'):
                if ip in line:
                    # Extract MAC address pattern
                    import re
                    mac_match = re.search(r'([0-9a-f]{1,2}:[0-9a-f]{1,2}:[0-9a-f]{1,2}:[0-9a-f]{1,2}:[0-9a-f]{1,2}:[0-9a-f]{1,2})', line, re.IGNORECASE)
                    if mac_match:
                        return mac_match.group(1)
        except:
            pass
        return "Unknown"
    
    def identify_device_type(self, hostname, open_ports):
        """Identify device type based on hostname and open ports"""
        hostname_lower = hostname.lower()
        
        # Check by hostname
        if 'roku' in hostname_lower or 'tcl' in hostname_lower or 'element' in hostname_lower or 'hisense' in hostname_lower:
            return '📺 TV/Roku'
        elif 'iphone' in hostname_lower or 'ipad' in hostname_lower:
            return '📱 iOS Device'
        elif 'android' in hostname_lower:
            return '📱 Android'
        elif 'mac' in hostname_lower or 'imac' in hostname_lower or 'macbook' in hostname_lower:
            return '💻 Mac Computer'
        elif 'windows' in hostname_lower or 'desktop' in hostname_lower or 'pc' in hostname_lower:
            return '💻 Windows PC'
        elif 'router' in hostname_lower or 'gateway' in hostname_lower or 'lan' in hostname_lower:
            return '🌐 Router/Gateway'
        elif 'printer' in hostname_lower:
            return '🖨️ Printer'
        elif 'camera' in hostname_lower or 'cam' in hostname_lower:
            return '📷 Camera'
        
        # Check by open ports
        port_list = [p['port'] for p in open_ports]
        if 8060 in port_list:
            return '📺 Roku Device'
        elif 22 in port_list and 80 in port_list:
            return '🖥️ Server/NAS'
        elif 445 in port_list or 139 in port_list:
            return '💾 Network Storage'
        elif 3389 in port_list:
            return '💻 Windows Machine'
        
        return '❓ Unknown Device'
    
    def harvest_device_data(self, ip):
        """Harvest ALL data from a single device"""
        print(f"   🔍 Scanning {ip}...")
        
        # Step 1: Ping check
        if not self.ping_ip(ip):
            return None
        
        print(f"   ✅ {ip} is ALIVE!")
        
        # Step 2: Get basic info
        hostname = self.get_hostname(ip)
        mac = self.get_mac_address(ip)
        
        # Step 3: Port scan
        open_ports = self.scan_ports(ip)
        
        # Step 4: Identify device
        device_type = self.identify_device_type(hostname, open_ports)
        
        # Step 5: Compile data
        device_data = {
            'ip': ip,
            'hostname': hostname,
            'mac': mac,
            'device_type': device_type,
            'open_ports': open_ports,
            'port_count': len(open_ports),
            'last_seen': datetime.now().isoformat(),
            'scan_timestamp': time.time()
        }
        
        self.devices[ip] = device_data
        self.harvest_count += 1
        
        print(f"   📦 HARVESTED: {hostname} ({device_type}) - {len(open_ports)} open ports")
        
        return device_data
    
    def scan_entire_network(self):
        """Scan ALL 255 IPs in parallel"""
        print(f"\n{'='*60}")
        print(f"🚀 STARTING AGGRESSIVE NETWORK HARVEST")
        print(f"{'='*60}")
        print(f"Network: {NETWORK}.x")
        print(f"Range: {NETWORK}.1 - {NETWORK}.255")
        print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}\n")
        
        start_time = time.time()
        
        # Parallel scanning with 50 threads
        with ThreadPoolExecutor(max_workers=50) as executor:
            futures = []
            for i in range(1, 256):
                ip = f"{NETWORK}.{i}"
                future = executor.submit(self.harvest_device_data, ip)
                futures.append(future)
            
            # Process results as they complete
            for future in as_completed(futures):
                try:
                    result = future.result()
                except Exception as e:
                    print(f"   ⚠️ Error: {e}")
        
        elapsed = time.time() - start_time
        
        print(f"\n{'='*60}")
        print(f"✅ HARVEST COMPLETE!")
        print(f"{'='*60}")
        print(f"⏱️  Time: {elapsed:.1f} seconds")
        print(f"🎯 Found: {len(self.devices)} REAL devices")
        print(f"📊 Total harvests: {self.harvest_count}")
        print(f"{'='*60}\n")
        
        return self.devices
    
    def generate_report(self):
        """Generate detailed report of all discovered devices"""
        report = f"""
🌐 *NETWORK HARVEST REPORT*
━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Network: `{NETWORK}.x`
🎯 Devices Found: *{len(self.devices)}*
📊 Total Harvests: *{self.harvest_count}*
⏰ Timestamp: `{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}`

━━━━━━━━━━━━━━━━━━━━━━━━━━
*DEVICE INVENTORY:*
━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
        
        # Group by device type
        by_type = {}
        for ip, device in sorted(self.devices.items()):
            dtype = device['device_type']
            if dtype not in by_type:
                by_type[dtype] = []
            by_type[dtype].append(device)
        
        for dtype, devices in sorted(by_type.items()):
            report += f"\n*{dtype}* ({len(devices)} found):\n"
            for device in devices:
                ports_str = f"{device['port_count']} ports" if device['port_count'] > 0 else "no open ports"
                report += f"  • `{device['ip']}` - {device['hostname']}\n"
                report += f"    MAC: `{device['mac']}` | {ports_str}\n"
                if device['open_ports']:
                    services = [p['service'] for p in device['open_ports'][:3]]
                    report += f"    Services: {', '.join(services)}\n"
        
        report += f"\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        report += f"💾 *FULL DATA SAVED LOCALLY*\n"
        
        return report
    
    def save_harvest_data(self):
        """Save harvested data to JSON file"""
        filename = f"network-harvest-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
        
        harvest_data = {
            'scan_time': datetime.now().isoformat(),
            'network': f"{NETWORK}.x",
            'total_devices': len(self.devices),
            'harvest_count': self.harvest_count,
            'devices': self.devices
        }
        
        with open(filename, 'w') as f:
            json.dump(harvest_data, f, indent=2)
        
        print(f"💾 Data saved to: {filename}")
        return filename
    
    def continuous_harvest(self, interval=300):
        """Continuously harvest data every X seconds"""
        cycle = 1
        
        self.send_telegram(f"""
🚀 *CONTINUOUS DATA HARVESTER STARTED*

Network: `{NETWORK}.x`
Scan Interval: Every {interval}s
Mode: *AGGRESSIVE HARVEST*

Harvesting ALL data from ALL devices...
""")
        
        while True:
            print(f"\n🔄 HARVEST CYCLE #{cycle}")
            
            # Scan network
            self.scan_entire_network()
            
            # Generate report
            report = self.generate_report()
            
            # Save data
            filename = self.save_harvest_data()
            
            # Send to Telegram (split if too long)
            if len(report) > 4000:
                # Send summary
                summary = f"""
🌐 *HARVEST CYCLE #{cycle} COMPLETE*

📍 Network: `{NETWORK}.x`
🎯 Devices: *{len(self.devices)} FOUND*
📊 Harvests: *{self.harvest_count}*
💾 Saved: `{filename}`

Full report saved locally (too large for Telegram)
"""
                self.send_telegram(summary)
            else:
                self.send_telegram(f"*Cycle #{cycle}*\n{report}")
            
            # Wait for next cycle
            print(f"\n⏳ Waiting {interval}s until next harvest...")
            time.sleep(interval)
            cycle += 1

if __name__ == '__main__':
    print("""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║          🌐 REAL NETWORK DATA HARVESTER 🌐                  ║
║                                                              ║
║  Scans: 192.168.12.x (all 255 IPs)                         ║
║  Mode:  AGGRESSIVE PARALLEL SCANNING                        ║
║  Data:  100% REAL from YOUR network                         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
""")
    
    harvester = NetworkHarvester()
    
    # Do one scan first
    harvester.scan_entire_network()
    report = harvester.generate_report()
    filename = harvester.save_harvest_data()
    
    print(report)
    harvester.send_telegram(report)
    
    # Ask if continuous
    print("\n🔄 Starting CONTINUOUS harvesting (every 5 minutes)...")
    print("   Press Ctrl+C to stop\n")
    
    try:
        harvester.continuous_harvest(interval=300)  # Every 5 minutes
    except KeyboardInterrupt:
        print("\n\n✅ Harvester stopped by user")
        harvester.send_telegram(f"⏹️ Harvester stopped after {harvester.harvest_count} total harvests")
