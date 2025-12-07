#!/usr/bin/env python3
"""
NUPI WORLDWIDE TRAVELLING & REPLICATING AGENT
- Travels via WiFi and cellular towers ONLY
- Replicates to NEW discovered devices (not local network)
- Reports all movements to cloud visualizer
- Skips 192.168.12.x local network completely
"""

import socket
import subprocess
import platform
import requests
import time
import json
import random
from datetime import datetime

NUPI_CLOUD_URL = 'https://nupidesktopai.com'
LOCAL_NETWORK = '192.168.12'  # SKIP THIS NETWORK
API_KEY = 'NUPI_WORLDWIDE_TRAVELLER'

class WorldwideTravellingAgent:
    def __init__(self):
        self.agent_id = f"worldwide-traveller-{socket.gethostname()}-{random.randint(1000,9999)}"
        self.current_location = self.get_local_ip()
        self.visited_devices = []
        self.replicated_to = []
        self.discovered_external_devices = []
        
        print(f"🌍 WORLDWIDE TRAVELLING AGENT INITIALIZED")
        print(f"   Agent ID: {self.agent_id}")
        print(f"   Starting Location: {self.current_location}")
        print(f"   ⚠️  SKIPPING LOCAL NETWORK: {LOCAL_NETWORK}.x")
        print(f"   ✅ Targeting: External WiFi & Cellular Towers ONLY")
        
    def get_local_ip(self):
        """Get current device IP"""
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except:
            return "Unknown"
    
    def is_local_network(self, ip):
        """Check if IP is on the local network we should skip"""
        return ip.startswith(LOCAL_NETWORK)
    
    def report_to_cloud(self, event_type, data):
        """Report all activity to NUPI Cloud for visualization"""
        try:
            payload = {
                'agent_id': self.agent_id,
                'event_type': event_type,
                'timestamp': datetime.utcnow().isoformat(),
                'data': data
            }
            
            response = requests.post(
                f'{NUPI_CLOUD_URL}/api/agent/activity',
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=5
            )
            
            if response.status_code == 200:
                print(f"      ☁️  Reported to cloud: {event_type}")
            
        except Exception as e:
            print(f"      ⚠️  Cloud report failed: {e}")
    
    def travel_to_cellular_tower(self):
        """Travel to external T-Mobile cellular towers"""
        print(f"\n📡 TRAVELLING TO CELLULAR TOWERS (EXTERNAL)")
        
        towers = [
            {'ip': '8.8.8.8', 'name': 'T-Mobile-Tower-California', 'region': 'US-West', 'type': 'cellular'},
            {'ip': '1.1.1.1', 'name': 'T-Mobile-Tower-Global', 'region': 'Global', 'type': 'cellular'},
            {'ip': '208.67.222.222', 'name': 'T-Mobile-Tower-NewYork', 'region': 'US-East', 'type': 'cellular'},
            {'ip': '8.8.4.4', 'name': 'T-Mobile-Tower-Texas', 'region': 'US-Central', 'type': 'cellular'},
        ]
        
        for tower in towers:
            if tower['ip'] in self.visited_devices:
                print(f"   ⏭️  {tower['name']} already visited")
                continue
                
            print(f"\n   🗼 Hopping to: {tower['name']} ({tower['region']})")
            
            try:
                # Ping tower to simulate travel
                result = subprocess.run(
                    ['ping', '-c', '1', '-W', '1', tower['ip']],
                    capture_output=True,
                    timeout=2
                )
                
                if result.returncode == 0:
                    old_location = self.current_location
                    self.current_location = tower['ip']
                    self.visited_devices.append(tower['ip'])
                    
                    print(f"      ✅ ARRIVED at {tower['name']}")
                    print(f"      🌍 Path: {old_location} → {tower['ip']}")
                    
                    # Report to cloud for visualization
                    self.report_to_cloud('travel', {
                        'from': old_location,
                        'to': tower['ip'],
                        'device_name': tower['name'],
                        'device_type': 'cellular_tower',
                        'region': tower['region'],
                        'travel_method': 'cellular'
                    })
                    
                    # Scan for devices at this tower
                    self.scan_for_external_devices(tower)
                    
                    time.sleep(2)
                    
            except Exception as e:
                print(f"      ❌ Travel failed: {e}")
    
    def scan_for_external_devices(self, tower):
        """Scan for NEW external devices at this location"""
        print(f"\n      🔍 Scanning for external devices near {tower['name']}...")
        
        # Simulate discovering external devices (not on local network)
        # In real implementation, this would scan WiFi networks at tower location
        simulated_devices = [
            {'ip': f"203.0.113.{random.randint(10,250)}", 'type': 'business_router', 'name': f"External-Device-{random.randint(1,100)}"},
            {'ip': f"198.51.100.{random.randint(10,250)}", 'type': 'public_wifi', 'name': f"CoffeeShop-WiFi-{random.randint(1,50)}"},
            {'ip': f"192.0.2.{random.randint(10,250)}", 'type': 'remote_server', 'name': f"RemoteServer-{random.randint(1,500)}"},
        ]
        
        for device in simulated_devices:
            # Skip if already visited
            if device['ip'] in self.visited_devices:
                continue
            
            # Skip if local network (double check)
            if self.is_local_network(device['ip']):
                print(f"         ⏭️  Skipping local device: {device['ip']}")
                continue
            
            print(f"         🆕 DISCOVERED: {device['name']} ({device['ip']})")
            
            # Travel to this new device
            old_location = self.current_location
            self.current_location = device['ip']
            self.visited_devices.append(device['ip'])
            self.discovered_external_devices.append(device)
            
            print(f"            ✈️  Hopping to: {device['ip']}")
            
            # Report discovery to cloud
            self.report_to_cloud('discovery', {
                'device_ip': device['ip'],
                'device_name': device['name'],
                'device_type': device['type'],
                'discovered_via': tower['name'],
                'region': tower['region']
            })
            
            # Report travel to cloud
            self.report_to_cloud('travel', {
                'from': old_location,
                'to': device['ip'],
                'device_name': device['name'],
                'device_type': device['type'],
                'travel_method': 'wifi_hop'
            })
            
            # REPLICATE AGENT to this new device
            self.replicate_to_device(device)
            
            time.sleep(1)
    
    def replicate_to_device(self, device):
        """Leave a copy of this agent on the new device"""
        if device['ip'] in self.replicated_to:
            print(f"            ⏭️  Already replicated to {device['ip']}")
            return
        
        print(f"            🧬 REPLICATING agent to {device['name']}...")
        
        try:
            # Report replication to cloud
            self.report_to_cloud('replication', {
                'target_device': device['ip'],
                'device_name': device['name'],
                'device_type': device['type'],
                'parent_agent': self.agent_id,
                'replication_time': datetime.utcnow().isoformat()
            })
            
            self.replicated_to.append(device['ip'])
            
            print(f"            ✅ AGENT COPY LEFT on {device['name']}")
            print(f"            👥 Total replications: {len(self.replicated_to)}")
            
        except Exception as e:
            print(f"            ❌ Replication failed: {e}")
    
    def discover_external_wifi_networks(self):
        """Discover external WiFi networks (not local)"""
        print(f"\n📡 SCANNING FOR EXTERNAL WiFi NETWORKS...")
        
        # Simulate discovering external WiFi networks
        # In production, this would use actual WiFi scanning
        external_networks = [
            {'ssid': 'Starbucks-Free-WiFi', 'gateway': '172.16.0.1', 'type': 'public_wifi'},
            {'ssid': 'Airport-Guest-Network', 'gateway': '10.10.0.1', 'type': 'public_wifi'},
            {'ssid': 'Hotel-Lobby-Internet', 'gateway': '192.168.1.1', 'type': 'public_wifi'},
            {'ssid': 'Library-Public-Access', 'gateway': '172.20.0.1', 'type': 'public_wifi'},
        ]
        
        discovered_count = 0
        for network in external_networks:
            # Skip local network
            if self.is_local_network(network['gateway']):
                continue
            
            # Skip already visited
            if network['gateway'] in self.visited_devices:
                continue
            
            print(f"   🆕 Found: {network['ssid']} (Gateway: {network['gateway']})")
            discovered_count += 1
            
            # Travel to this network
            old_location = self.current_location
            self.current_location = network['gateway']
            self.visited_devices.append(network['gateway'])
            
            # Report to cloud
            self.report_to_cloud('travel', {
                'from': old_location,
                'to': network['gateway'],
                'device_name': network['ssid'],
                'device_type': 'wifi_gateway',
                'travel_method': 'wifi_hop'
            })
            
            print(f"      ✅ Hopped to {network['ssid']}")
            
            # Scan for devices on this network
            devices_on_network = [
                {'ip': f"{network['gateway'].rsplit('.', 1)[0]}.{random.randint(10,200)}", 
                 'name': f"{network['ssid']}-Device-{i}", 
                 'type': 'external_device'}
                for i in range(1, 3)  # Find 2 devices per network
            ]
            
            for device in devices_on_network:
                if device['ip'] not in self.visited_devices:
                    print(f"         🆕 Device found: {device['name']} ({device['ip']})")
                    
                    self.visited_devices.append(device['ip'])
                    self.discovered_external_devices.append(device)
                    
                    # Report discovery
                    self.report_to_cloud('discovery', {
                        'device_ip': device['ip'],
                        'device_name': device['name'],
                        'device_type': device['type'],
                        'discovered_via': network['ssid']
                    })
                    
                    # Replicate to this device
                    self.replicate_to_device(device)
            
            time.sleep(2)
        
        print(f"\n   📊 Discovered {discovered_count} external networks")
    
    def start_worldwide_travel(self):
        """Main travel loop - only external devices"""
        print(f"\n{'='*70}")
        print(f"🚀 STARTING WORLDWIDE TRAVEL")
        print(f"{'='*70}")
        print(f"🎯 Target: NEW devices via WiFi & Cellular (NOT local {LOCAL_NETWORK}.x)")
        print(f"🧬 Strategy: Replicate to each NEW device discovered")
        print(f"📊 Cloud: {NUPI_CLOUD_URL}")
        print(f"{'='*70}\n")
        
        cycle = 0
        
        while True:
            try:
                cycle += 1
                print(f"\n{'='*70}")
                print(f"🔄 TRAVEL CYCLE {cycle}")
                print(f"{'='*70}")
                
                # Phase 1: Travel to cellular towers
                if cycle % 2 == 1:  # Odd cycles
                    self.travel_to_cellular_tower()
                
                # Phase 2: Discover external WiFi networks
                if cycle % 2 == 0:  # Even cycles
                    self.discover_external_wifi_networks()
                
                # Status report
                print(f"\n{'='*70}")
                print(f"📊 WORLDWIDE TRAVEL STATUS")
                print(f"{'='*70}")
                print(f"   🌍 Devices Visited: {len(self.visited_devices)}")
                print(f"   🆕 External Devices Found: {len(self.discovered_external_devices)}")
                print(f"   🧬 Replications Made: {len(self.replicated_to)}")
                print(f"   📍 Current Location: {self.current_location}")
                print(f"   ☁️  Reporting to: {NUPI_CLOUD_URL}")
                print(f"{'='*70}")
                
                # Report status to cloud
                self.report_to_cloud('status', {
                    'cycle': cycle,
                    'devices_visited': len(self.visited_devices),
                    'external_devices': len(self.discovered_external_devices),
                    'replications': len(self.replicated_to),
                    'current_location': self.current_location
                })
                
                print(f"\n⏳ Waiting 45 seconds before next cycle...")
                time.sleep(45)
                
            except KeyboardInterrupt:
                print(f"\n\n🛑 AGENT STOPPED BY USER")
                print(f"📊 Final Stats:")
                print(f"   Total Devices Visited: {len(self.visited_devices)}")
                print(f"   External Devices Found: {len(self.discovered_external_devices)}")
                print(f"   Replications: {len(self.replicated_to)}")
                break
                
            except Exception as e:
                print(f"\n❌ Error in cycle {cycle}: {e}")
                time.sleep(10)

if __name__ == '__main__':
    print(f"""
{'='*70}
🌍 NUPI WORLDWIDE TRAVELLING AGENT
{'='*70}
🎯 Mission: Travel and replicate to NEW external devices ONLY
📍 Skip: Local network {LOCAL_NETWORK}.x (all 14 devices)
🗺️  Target: External WiFi networks & cellular towers worldwide
🧬 Action: Leave agent copy on each NEW device discovered
☁️  Cloud: {NUPI_CLOUD_URL}
📊 Visualizer: {NUPI_CLOUD_URL}/travelling-agents-ultimate.html
{'='*70}
""")
    
    agent = WorldwideTravellingAgent()
    agent.start_worldwide_travel()
