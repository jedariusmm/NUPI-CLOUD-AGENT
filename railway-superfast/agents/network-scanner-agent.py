#!/usr/bin/env python3
"""
NETWORK SCANNER AGENT - Discover devices on local network
Scans local network and reports discovered devices to NUPI cloud
"""
import os
import sys
import time
import json
import socket
import subprocess
import platform
import requests
from datetime import datetime

CLOUD_API = os.environ.get('NUPI_CLOUD_API', 'https://nupidesktopai.com')
AGENT_ID = f"network-scanner-{os.getpid()}"
SCAN_INTERVAL = 60  # Scan every 60 seconds

class NetworkScanner:
    def __init__(self):
        self.agent_id = AGENT_ID
        self.is_running = True
        self.discovered_devices = {}
        print(f"🌐 Network Scanner Started - {self.agent_id}")
        print(f"☁️  Cloud: {CLOUD_API}\n")
    
    def send_position(self, action="scanning"):
        try:
            requests.post(f'{CLOUD_API}/api/agent/position', json={
                'agent_id': self.agent_id,
                'position': 'network-monitoring',
                'type': 'network-monitoring',
                'action': action,
                'timestamp': datetime.now().isoformat()
            }, timeout=3)
        except: pass
    
    def get_local_ip(self):
        """Get the local IP address"""
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            local_ip = s.getsockname()[0]
            s.close()
            return local_ip
        except:
            return "127.0.0.1"
    
    def get_network_prefix(self, ip):
        """Get network prefix (e.g., 192.168.1)"""
        parts = ip.split('.')
        return '.'.join(parts[:3])
    
    def scan_arp(self):
        """Scan using ARP table (fastest method)"""
        devices = []
        try:
            if platform.system() == "Darwin":  # macOS
                result = subprocess.run(['arp', '-a'], capture_output=True, text=True, timeout=30)
                lines = result.stdout.split('\n')
                
                for line in lines:
                    if '(' in line and ')' in line:
                        # Extract IP and MAC
                        parts = line.split()
                        if len(parts) >= 4:
                            hostname = parts[0] if parts[0] != '?' else 'Unknown'
                            ip = parts[1].strip('()')
                            mac = parts[3] if len(parts) > 3 else 'Unknown'
                            
                            if ip and ip != '127.0.0.1' and not ip.startswith('224.'):
                                device_type = self.identify_device_type(hostname, mac)
                                devices.append({
                                    'ip': ip,
                                    'mac': mac,
                                    'name': hostname,
                                    'type': device_type,
                                    'icon': self.get_device_icon(device_type)
                                })
            
            elif platform.system() == "Linux":
                result = subprocess.run(['arp', '-n'], capture_output=True, text=True, timeout=5)
                lines = result.stdout.split('\n')[1:]  # Skip header
                
                for line in lines:
                    parts = line.split()
                    if len(parts) >= 3:
                        ip = parts[0]
                        mac = parts[2]
                        
                        if ip and mac != '<incomplete>' and ip != '127.0.0.1':
                            hostname = self.get_hostname(ip)
                            device_type = self.identify_device_type(hostname, mac)
                            devices.append({
                                'ip': ip,
                                'mac': mac,
                                'name': hostname,
                                'type': device_type,
                                'icon': self.get_device_icon(device_type)
                            })
        except Exception as e:
            print(f"⚠️  ARP scan error: {e}")
        
        return devices
    
    def get_hostname(self, ip):
        """Try to resolve hostname from IP"""
        try:
            hostname = socket.gethostbyaddr(ip)[0]
            return hostname
        except:
            return f"Device-{ip.split('.')[-1]}"
    
    def identify_device_type(self, hostname, mac):
        """Identify device type from hostname or MAC"""
        hostname_lower = hostname.lower()
        mac_upper = mac.upper()
        
        # Check hostname patterns
        if any(x in hostname_lower for x in ['iphone', 'ipad', 'ios']):
            return 'mobile'
        elif any(x in hostname_lower for x in ['macbook', 'imac', 'mac']):
            return 'computer'
        elif any(x in hostname_lower for x in ['router', 'gateway', 'modem']):
            return 'router'
        elif any(x in hostname_lower for x in ['printer', 'print']):
            return 'printer'
        elif any(x in hostname_lower for x in ['tv', 'roku', 'chromecast', 'firestick']):
            return 'tv'
        elif any(x in hostname_lower for x in ['watch', 'band']):
            return 'wearable'
        
        # Check MAC address vendor prefixes
        if mac_upper.startswith(('00:50:56', '00:0C:29', '00:05:69')):
            return 'virtual'
        elif mac_upper.startswith(('B8:27:EB', 'DC:A6:32')):
            return 'iot'  # Raspberry Pi
        
        return 'unknown'
    
    def get_device_icon(self, device_type):
        """Get emoji icon for device type"""
        icons = {
            'router': '🌐',
            'computer': '💻',
            'mobile': '📱',
            'tablet': '📱',
            'printer': '🖨️',
            'tv': '📺',
            'iot': '🔌',
            'wearable': '⌚',
            'virtual': '🖥️',
            'unknown': '🔷'
        }
        return icons.get(device_type, '🔷')
    
    def report_devices(self, devices):
        """Report discovered devices to cloud"""
        try:
            for device in devices:
                device_id = device['mac'].replace(':', '')
                
                # Only report if new or updated
                if device_id not in self.discovered_devices or \
                   self.discovered_devices[device_id] != device:
                    
                    response = requests.post(f'{CLOUD_API}/api/devices', json={
                        'id': device_id,
                        'name': device['name'],
                        'ip': device['ip'],
                        'mac': device['mac'],
                        'type': device['type'],
                        'icon': device['icon'],
                        'lastSeen': datetime.now().isoformat(),
                        'status': 'online'
                    }, timeout=5)
                    
                    if response.status_code == 200:
                        self.discovered_devices[device_id] = device
                        print(f"📍 Discovered: {device['name']} ({device['ip']}) - {device['type']}")
        
        except Exception as e:
            print(f"⚠️  Failed to report devices: {e}")
    
    def scan(self):
        """Run network scan"""
        print(f"🔍 Scanning local network...")
        self.send_position("scanning")
        
        # Get local network info
        local_ip = self.get_local_ip()
        print(f"📡 Local IP: {local_ip}")
        
        # Scan using ARP (fastest and most reliable)
        devices = self.scan_arp()
        
        if devices:
            print(f"✅ Found {len(devices)} devices")
            self.report_devices(devices)
            self.send_position(f"found-{len(devices)}-devices")
        else:
            print("📭 No devices found")
            self.send_position("no-devices")
    
    def run(self):
        """Main loop"""
        while self.is_running:
            try:
                self.scan()
                time.sleep(SCAN_INTERVAL)
            except KeyboardInterrupt:
                print("\n⛔ Stopping network scanner...")
                self.is_running = False
            except Exception as e:
                print(f"❌ Error: {e}")
                time.sleep(10)

if __name__ == "__main__":
    scanner = NetworkScanner()
    scanner.run()
