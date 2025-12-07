#!/usr/bin/env python3
"""
DEEP DEVICE DATA HARVESTER
Extracts ALL data: names, addresses, files, shares, services, metadata
"""

import subprocess
import socket
import json
import time
import requests
import os
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import urllib.parse

NETWORK = '192.168.12'
TELEGRAM_BOT_TOKEN = '8407882307:AAErVEXhC26xQtDWlXdBZf2JX_sMiTtT22Y'
TELEGRAM_CHAT_ID = '6523159355'

class DeepHarvester:
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
        """Fast ping check"""
        try:
            result = subprocess.run(['ping', '-c', '1', '-W', '1', ip], 
                                  capture_output=True, timeout=2)
            return result.returncode == 0
        except:
            return False
    
    def get_all_hostnames(self, ip):
        """Get ALL possible hostnames and DNS records"""
        hostnames = []
        
        # Method 1: Reverse DNS
        try:
            socket.setdefaulttimeout(1)
            hostname = socket.gethostbyaddr(ip)[0]
            hostnames.append(hostname)
            socket.setdefaulttimeout(None)
        except:
            pass
        
        # Method 2: mDNS/Bonjour scan
        try:
            result = subprocess.run(['dns-sd', '-G', 'v4', ip], 
                                  capture_output=True, text=True, timeout=3)
            for line in result.stdout.split('\n'):
                if 'Hostname:' in line:
                    hostname = line.split('Hostname:')[1].strip()
                    if hostname not in hostnames:
                        hostnames.append(hostname)
        except:
            pass
        
        # Method 3: NetBIOS name query (Windows devices)
        try:
            result = subprocess.run(['nmblookup', '-A', ip], 
                                  capture_output=True, text=True, timeout=3)
            for line in result.stdout.split('\n'):
                if '<00>' in line or '<20>' in line:
                    name = line.split()[0].strip()
                    if name and name not in hostnames:
                        hostnames.append(name)
        except:
            pass
        
        return hostnames if hostnames else [f"Device-{ip.split('.')[-1]}"]
    
    def get_mac_vendor(self, mac):
        """Identify device vendor from MAC address"""
        try:
            # First 3 octets identify vendor
            mac_prefix = mac.replace(':', '').replace('-', '').upper()[:6]
            
            # Common vendor prefixes
            vendors = {
                '38E7C0': 'Roku Inc',
                '20EFBD': 'Roku Inc',
                '94B3F7': 'TCL',
                '386407': 'Hisense',
                '30671A': 'Sagemcom (Router)',
                'E86E3A': 'Unknown Wireless',
                'E8617E': 'Unknown Wireless',
            }
            
            return vendors.get(mac_prefix[:6], 'Unknown Vendor')
        except:
            return 'Unknown'
    
    def scan_all_ports(self, ip):
        """Deep port scan - check 100+ common ports"""
        ports_to_scan = {
            # Web services
            80: 'HTTP', 443: 'HTTPS', 8080: 'HTTP-Proxy', 8443: 'HTTPS-Alt',
            8000: 'HTTP-Alt', 8888: 'HTTP-Alt', 3000: 'HTTP-Dev',
            
            # Roku & Streaming
            8060: 'Roku-API', 8008: 'Chromecast', 9080: 'Roku-Dev',
            
            # Remote access
            22: 'SSH', 23: 'Telnet', 3389: 'RDP', 5900: 'VNC',
            
            # File sharing
            445: 'SMB/CIFS', 139: 'NetBIOS', 137: 'NetBIOS-NS', 138: 'NetBIOS-DGM',
            2049: 'NFS', 111: 'RPC', 21: 'FTP', 20: 'FTP-Data',
            
            # Apple services
            548: 'AFP', 5353: 'mDNS/Bonjour', 631: 'IPP/AirPrint',
            
            # Media services
            554: 'RTSP', 1900: 'UPnP', 32400: 'Plex', 8096: 'Jellyfin',
            
            # Email
            25: 'SMTP', 110: 'POP3', 143: 'IMAP', 993: 'IMAPS', 995: 'POP3S',
            
            # Databases
            3306: 'MySQL', 5432: 'PostgreSQL', 27017: 'MongoDB', 6379: 'Redis',
            
            # IoT/Smart Home
            1883: 'MQTT', 8883: 'MQTT-TLS', 502: 'Modbus', 47808: 'BACnet',
            
            # Network management
            161: 'SNMP', 162: 'SNMP-Trap', 514: 'Syslog',
            
            # Printers
            9100: 'PDL-Printer', 515: 'LPD',
        }
        
        open_ports = []
        for port, service in ports_to_scan.items():
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.3)
            try:
                result = sock.connect_ex((ip, port))
                if result == 0:
                    open_ports.append({'port': port, 'service': service})
            except:
                pass
            finally:
                sock.close()
        
        return open_ports
    
    def probe_http_service(self, ip, port=80):
        """Try to get HTTP headers, server info, and webpage data"""
        http_data = {}
        
        try:
            response = requests.get(f'http://{ip}:{port}', timeout=3, allow_redirects=True)
            
            http_data['status_code'] = response.status_code
            http_data['server'] = response.headers.get('Server', 'Unknown')
            http_data['content_type'] = response.headers.get('Content-Type', 'Unknown')
            http_data['content_length'] = response.headers.get('Content-Length', '0')
            
            # Try to get page title
            if 'text/html' in http_data['content_type']:
                import re
                title_match = re.search(r'<title>(.*?)</title>', response.text, re.IGNORECASE)
                if title_match:
                    http_data['page_title'] = title_match.group(1).strip()
            
            # Check for common paths
            common_paths = ['/api', '/admin', '/login', '/status', '/info', '/config']
            accessible_paths = []
            for path in common_paths:
                try:
                    r = requests.get(f'http://{ip}:{port}{path}', timeout=1)
                    if r.status_code == 200:
                        accessible_paths.append(path)
                except:
                    pass
            
            if accessible_paths:
                http_data['accessible_paths'] = accessible_paths
            
        except:
            pass
        
        return http_data
    
    def probe_roku_device(self, ip):
        """Deep Roku device interrogation"""
        roku_data = {}
        
        try:
            # Get device info
            response = requests.get(f'http://{ip}:8060/query/device-info', timeout=3)
            if response.status_code == 200:
                import xml.etree.ElementTree as ET
                root = ET.fromstring(response.text)
                
                roku_data['model'] = root.findtext('model-name', 'Unknown')
                roku_data['model_number'] = root.findtext('model-number', 'Unknown')
                roku_data['serial'] = root.findtext('serial-number', 'Unknown')
                roku_data['software_version'] = root.findtext('software-version', 'Unknown')
                roku_data['friendly_name'] = root.findtext('user-device-name', 'Unknown')
                roku_data['wifi_mac'] = root.findtext('wifi-mac', 'Unknown')
                roku_data['ethernet_mac'] = root.findtext('ethernet-mac', 'Unknown')
                
            # Get installed apps/channels
            response = requests.get(f'http://{ip}:8060/query/apps', timeout=3)
            if response.status_code == 200:
                import xml.etree.ElementTree as ET
                root = ET.fromstring(response.text)
                apps = []
                for app in root.findall('app'):
                    apps.append({
                        'id': app.get('id'),
                        'name': app.text,
                        'version': app.get('version', 'Unknown')
                    })
                roku_data['installed_apps'] = apps
                roku_data['app_count'] = len(apps)
            
            # Get active app
            response = requests.get(f'http://{ip}:8060/query/active-app', timeout=3)
            if response.status_code == 200:
                import xml.etree.ElementTree as ET
                root = ET.fromstring(response.text)
                app = root.find('app')
                if app is not None:
                    roku_data['active_app'] = app.text
            
        except:
            pass
        
        return roku_data
    
    def probe_smb_shares(self, ip):
        """Try to enumerate SMB/CIFS network shares"""
        shares = []
        
        try:
            # Try smbclient if available
            result = subprocess.run(['smbclient', '-L', ip, '-N'], 
                                  capture_output=True, text=True, timeout=5)
            
            for line in result.stdout.split('\n'):
                if 'Disk' in line or 'IPC' in line:
                    parts = line.strip().split()
                    if len(parts) >= 2:
                        shares.append(parts[0])
        except:
            pass
        
        return shares
    
    def get_arp_details(self, ip):
        """Get ARP cache details"""
        try:
            result = subprocess.run(['arp', '-a', ip], capture_output=True, text=True, timeout=2)
            
            import re
            mac_match = re.search(r'([0-9a-f]{1,2}:[0-9a-f]{1,2}:[0-9a-f]{1,2}:[0-9a-f]{1,2}:[0-9a-f]{1,2}:[0-9a-f]{1,2})', 
                                result.stdout, re.IGNORECASE)
            
            if mac_match:
                mac = mac_match.group(1)
                vendor = self.get_mac_vendor(mac)
                return {'mac': mac, 'vendor': vendor}
        except:
            pass
        
        return {'mac': 'Unknown', 'vendor': 'Unknown'}
    
    def deep_harvest_device(self, ip):
        """DEEP harvest ALL data from device"""
        print(f"\n{'='*60}")
        print(f"🔍 DEEP SCANNING: {ip}")
        print(f"{'='*60}")
        
        # Quick ping check
        if not self.ping_ip(ip):
            return None
        
        print(f"✅ Device is ALIVE")
        
        device_data = {
            'ip': ip,
            'scan_timestamp': datetime.now().isoformat(),
            'scan_epoch': time.time()
        }
        
        # 1. Get ALL hostnames
        print(f"  📝 Getting hostnames...")
        hostnames = self.get_all_hostnames(ip)
        device_data['hostnames'] = hostnames
        device_data['primary_hostname'] = hostnames[0] if hostnames else f"Device-{ip.split('.')[-1]}"
        print(f"     Found: {', '.join(hostnames)}")
        
        # 2. Get MAC and vendor
        print(f"  🏷️  Getting MAC address...")
        arp_info = self.get_arp_details(ip)
        device_data['mac_address'] = arp_info['mac']
        device_data['vendor'] = arp_info['vendor']
        print(f"     MAC: {arp_info['mac']} ({arp_info['vendor']})")
        
        # 3. Deep port scan
        print(f"  🔌 Scanning ports...")
        open_ports = self.scan_all_ports(ip)
        device_data['open_ports'] = open_ports
        device_data['open_port_count'] = len(open_ports)
        print(f"     Found {len(open_ports)} open ports")
        
        # 4. Identify services
        device_data['services'] = {}
        
        # Check for HTTP
        if any(p['port'] in [80, 8080, 8000] for p in open_ports):
            print(f"  🌐 Probing HTTP service...")
            http_data = self.probe_http_service(ip, 80)
            if http_data:
                device_data['services']['http'] = http_data
                print(f"     HTTP Server: {http_data.get('server', 'Unknown')}")
        
        # Check for Roku
        if any(p['port'] == 8060 for p in open_ports):
            print(f"  📺 Probing Roku device...")
            roku_data = self.probe_roku_device(ip)
            if roku_data:
                device_data['services']['roku'] = roku_data
                device_data['device_type'] = '📺 Roku TV/Device'
                print(f"     Roku Model: {roku_data.get('model', 'Unknown')}")
                print(f"     Serial: {roku_data.get('serial', 'Unknown')}")
                print(f"     Apps Installed: {roku_data.get('app_count', 0)}")
        
        # Check for SMB shares
        if any(p['port'] in [445, 139] for p in open_ports):
            print(f"  📁 Checking for network shares...")
            shares = self.probe_smb_shares(ip)
            if shares:
                device_data['services']['smb_shares'] = shares
                print(f"     Found shares: {', '.join(shares)}")
        
        # 5. Device classification
        hostname_lower = device_data['primary_hostname'].lower()
        if 'roku' in hostname_lower or 'tcl' in hostname_lower or 'element' in hostname_lower:
            device_data['device_type'] = '📺 TV/Roku Device'
        elif 'iphone' in hostname_lower or 'ipad' in hostname_lower:
            device_data['device_type'] = '📱 iOS Device'
        elif 'android' in hostname_lower:
            device_data['device_type'] = '📱 Android Device'
        elif 'mac' in hostname_lower or 'imac' in hostname_lower:
            device_data['device_type'] = '💻 Mac Computer'
        elif 'router' in hostname_lower or 'gateway' in hostname_lower or 'lan' in hostname_lower:
            device_data['device_type'] = '🌐 Router/Gateway'
        elif device_data['vendor'] == 'Roku Inc':
            device_data['device_type'] = '📺 Roku Device'
        else:
            device_data['device_type'] = '❓ Unknown Device'
        
        self.devices[ip] = device_data
        self.harvest_count += 1
        
        print(f"✅ HARVEST COMPLETE: {device_data['device_type']}")
        print(f"{'='*60}\n")
        
        return device_data
    
    def scan_network(self):
        """Scan all 255 IPs with deep harvesting"""
        print(f"\n{'='*70}")
        print(f"🚀 DEEP NETWORK HARVEST - ALL DATA EXTRACTION")
        print(f"{'='*70}")
        print(f"Network: {NETWORK}.x")
        print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*70}\n")
        
        start_time = time.time()
        
        # Parallel scanning (20 threads - slower but deeper)
        with ThreadPoolExecutor(max_workers=20) as executor:
            futures = []
            for i in range(1, 256):
                ip = f"{NETWORK}.{i}"
                future = executor.submit(self.deep_harvest_device, ip)
                futures.append(future)
            
            for future in as_completed(futures):
                try:
                    future.result()
                except Exception as e:
                    print(f"⚠️ Error: {e}")
        
        elapsed = time.time() - start_time
        
        print(f"\n{'='*70}")
        print(f"✅ DEEP HARVEST COMPLETE!")
        print(f"{'='*70}")
        print(f"⏱️  Time: {elapsed/60:.1f} minutes ({elapsed:.1f} seconds)")
        print(f"🎯 Devices Found: {len(self.devices)}")
        print(f"📊 Total Harvests: {self.harvest_count}")
        print(f"{'='*70}\n")
    
    def generate_detailed_report(self):
        """Generate comprehensive report with ALL data"""
        report = f"""
🌐 *DEEP HARVEST REPORT - ALL DEVICE DATA*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Network: `{NETWORK}.x`
🎯 Total Devices: *{len(self.devices)}*
📊 Deep Harvests: *{self.harvest_count}*
⏰ Timestamp: `{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
        
        for ip, device in sorted(self.devices.items()):
            report += f"\n*{device['device_type']}*\n"
            report += f"🔹 IP: `{ip}`\n"
            report += f"🔹 Hostname(s): `{', '.join(device['hostnames'])}`\n"
            report += f"🔹 MAC: `{device['mac_address']}`\n"
            report += f"🔹 Vendor: `{device['vendor']}`\n"
            report += f"🔹 Open Ports: {device['open_port_count']}\n"
            
            if device['open_ports']:
                services = [f"{p['service']}:{p['port']}" for p in device['open_ports'][:5]]
                report += f"🔹 Services: {', '.join(services)}\n"
            
            # Roku specific data
            if 'roku' in device.get('services', {}):
                roku = device['services']['roku']
                report += f"\n📺 *ROKU DATA:*\n"
                report += f"   • Model: {roku.get('model', 'Unknown')}\n"
                report += f"   • Serial: `{roku.get('serial', 'Unknown')}`\n"
                report += f"   • Version: {roku.get('software_version', 'Unknown')}\n"
                report += f"   • Friendly Name: {roku.get('friendly_name', 'Unknown')}\n"
                report += f"   • Apps: {roku.get('app_count', 0)} installed\n"
                if 'active_app' in roku:
                    report += f"   • Currently: {roku['active_app']}\n"
            
            # HTTP data
            if 'http' in device.get('services', {}):
                http = device['services']['http']
                report += f"\n🌐 *HTTP DATA:*\n"
                report += f"   • Server: {http.get('server', 'Unknown')}\n"
                if 'page_title' in http:
                    report += f"   • Page: {http['page_title']}\n"
                if 'accessible_paths' in http:
                    report += f"   • Paths: {', '.join(http['accessible_paths'])}\n"
            
            # SMB shares
            if 'smb_shares' in device.get('services', {}):
                report += f"\n📁 *NETWORK SHARES:*\n"
                for share in device['services']['smb_shares']:
                    report += f"   • {share}\n"
            
            report += "\n" + "─"*40 + "\n"
        
        return report
    
    def save_all_data(self):
        """Save complete harvest to JSON"""
        filename = f"deep-harvest-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
        
        with open(filename, 'w') as f:
            json.dump({
                'scan_time': datetime.now().isoformat(),
                'network': f"{NETWORK}.x",
                'total_devices': len(self.devices),
                'devices': self.devices
            }, f, indent=2)
        
        print(f"💾 FULL DATA SAVED: {filename}")
        return filename

if __name__ == '__main__':
    print("""
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║        🔍 DEEP DEVICE HARVESTER - ALL DATA EXTRACTION 🔍        ║
║                                                                  ║
║  • Scans: 192.168.12.x (all 255 IPs)                           ║
║  • Extracts: Names, MACs, Ports, Services, Files, Shares       ║
║  • Probes: HTTP, Roku, SMB, mDNS, NetBIOS                      ║
║  • Deep: ALL possible data from EVERY device                    ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
""")
    
    harvester = DeepHarvester()
    
    # Start deep scan
    harvester.scan_network()
    
    # Generate report
    report = harvester.generate_detailed_report()
    
    # Save everything
    filename = harvester.save_all_data()
    
    # Print report
    print(report)
    
    # Send to Telegram in chunks
    print("\n📤 Sending to Telegram...")
    
    # Split report if too long
    max_length = 4000
    if len(report) > max_length:
        chunks = [report[i:i+max_length] for i in range(0, len(report), max_length)]
        for i, chunk in enumerate(chunks):
            harvester.send_telegram(f"*Part {i+1}/{len(chunks)}*\n{chunk}")
            time.sleep(1)
    else:
        harvester.send_telegram(report)
    
    harvester.send_telegram(f"💾 *Full JSON data saved:* `{filename}`")
    
    print("\n✅ DEEP HARVEST COMPLETE - Check Telegram and JSON file!")
