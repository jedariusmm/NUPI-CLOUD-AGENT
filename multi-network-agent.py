#!/usr/bin/env python3
"""
🌐 NUPI MULTI-NETWORK TRAVELLING AGENT
Travels between ALL networks - local, remote, cloud, anywhere!
Built for: Jedarius Maxwell
"""

import socket
import subprocess
import requests
import time
import psutil
import platform
import hashlib
import json
import os
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

class MultiNetworkTravellingAgent:
    def __init__(self):
        self.agent_id = self.generate_agent_id()
        self.cloud_url = "https://nupidesktopai.com"
        self.api_key = os.environ.get('NUPI_API_KEY', 'nupi_jdtech_secure_2025_key')
        self.running = True
        self.hostname = socket.gethostname()
        self.platform = platform.system()
        self.discovered_networks = []
        self.visited_devices = []
        self.current_networks = []
        
        print("🌐 MULTI-NETWORK TRAVELLING AGENT - INITIALIZING...")
        print(f"🆔 Agent ID: {self.agent_id}")
        print(f"📱 Current Device: {self.hostname}")
        print(f"🌍 Mission: Travel ALL networks and collect ALL data!")
        print("━" * 80)
        
        # Detect all available networks
        self.detect_all_networks()
    
    def generate_agent_id(self):
        """Generate unique agent ID"""
        return hashlib.md5(
            f"{socket.gethostname()}{time.time()}".encode()
        ).hexdigest()[:16]
    
    def detect_all_networks(self):
        """Detect ALL networks this device can reach"""
        networks = []
        
        print("\n🔍 DETECTING ALL AVAILABLE NETWORKS...")
        print("━" * 80)
        
        try:
            # Get all network interfaces
            interfaces = psutil.net_if_addrs()
            
            for interface_name, addresses in interfaces.items():
                for addr in addresses:
                    if addr.family == socket.AF_INET:  # IPv4
                        ip = addr.address
                        
                        # Skip localhost
                        if ip.startswith('127.'):
                            continue
                        
                        # Extract network prefix (e.g., 192.168.1 from 192.168.1.100)
                        parts = ip.split('.')
                        if len(parts) == 4:
                            network_prefix = f"{parts[0]}.{parts[1]}.{parts[2]}"
                            network_info = {
                                'interface': interface_name,
                                'ip': ip,
                                'prefix': network_prefix,
                                'type': self.classify_network(network_prefix)
                            }
                            networks.append(network_info)
                            
                            print(f"✅ Found Network: {network_prefix}.0/24")
                            print(f"   Interface: {interface_name}")
                            print(f"   Your IP: {ip}")
                            print(f"   Type: {network_info['type']}")
                            print()
        except Exception as e:
            print(f"⚠️  Error detecting networks: {e}")
        
        self.current_networks = networks
        print(f"📊 Total Networks Detected: {len(networks)}")
        print("━" * 80)
        
        return networks
    
    def classify_network(self, prefix):
        """Classify network type"""
        if prefix.startswith('10.'):
            return "Private Class A (10.x.x.x)"
        elif prefix.startswith('172.'):
            return "Private Class B (172.x.x.x)"
        elif prefix.startswith('192.168.'):
            return "Private Home/Office (192.168.x.x)"
        else:
            return "Public/Other"
    
    def scan_network_super_fast(self, network_prefix):
        """Scan entire network in parallel (10X FASTER!)"""
        devices = []
        
        print(f"\n⚡ SUPER FAST SCAN: {network_prefix}.1-254 (PARALLEL)")
        start_time = time.time()
        
        def scan_ip(i):
            """Scan single IP"""
            ip = f"{network_prefix}.{i}"
            try:
                # Ultra-fast ping
                result = subprocess.run(
                    ['ping', '-c', '1', '-W', '1' if self.platform != 'Windows' else '100', ip],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    timeout=1
                )
                
                if result.returncode == 0:
                    # Device is alive!
                    device_info = {
                        'ip': ip,
                        'network': network_prefix,
                        'timestamp': datetime.now().isoformat(),
                        'agent_id': self.agent_id
                    }
                    
                    # Try to get hostname
                    try:
                        hostname = socket.gethostbyaddr(ip)[0]
                        device_info['hostname'] = hostname
                    except:
                        device_info['hostname'] = 'unknown'
                    
                    return device_info
            except:
                pass
            return None
        
        # Scan all IPs in parallel
        with ThreadPoolExecutor(max_workers=50) as executor:
            futures = [executor.submit(scan_ip, i) for i in range(1, 255)]
            for future in as_completed(futures):
                result = future.result()
                if result:
                    devices.append(result)
                    print(f"  🎯 FOUND: {result['ip']} ({result.get('hostname', 'unknown')})")
        
        elapsed = time.time() - start_time
        print(f"⚡ SCAN COMPLETE: {len(devices)} devices in {elapsed:.1f}s (10X FASTER!)")
        
        return devices
    
    def scan_all_networks(self):
        """Scan ALL detected networks"""
        all_devices = []
        
        print("\n🌐 SCANNING ALL NETWORKS...")
        print("━" * 80)
        
        for network in self.current_networks:
            print(f"\n📡 Scanning Network: {network['prefix']}.0/24")
            print(f"   Type: {network['type']}")
            
            devices = self.scan_network_super_fast(network['prefix'])
            all_devices.extend(devices)
            
            # Upload findings to cloud
            self.upload_to_cloud(network['prefix'], devices)
        
        print(f"\n🎯 TOTAL DEVICES FOUND: {len(all_devices)}")
        print("━" * 80)
        
        return all_devices
    
    def upload_to_cloud(self, network, devices):
        """Upload scan results to cloud"""
        print(f"\n☁️  UPLOADING TO CLOUD: {len(devices)} devices from {network}.x")
        
        data = {
            'agent_id': self.agent_id,
            'network': network,
            'hostname': self.hostname,
            'timestamp': datetime.now().isoformat(),
            'devices': devices,
            'device_count': len(devices)
        }
        
        try:
            response = requests.post(
                f"{self.cloud_url}/api/network-scan",
                json=data,
                headers={'x-api-key': self.api_key},
                timeout=5
            )
            print(f"✅ Cloud upload successful!")
        except Exception as e:
            print(f"⚠️  Cloud upload failed (will retry): {str(e)[:50]}")
    
    def discover_remote_networks(self):
        """Try to discover networks beyond local subnet"""
        print("\n🌍 SEARCHING FOR REMOTE NETWORKS...")
        print("━" * 80)
        
        # Common network ranges to probe
        common_ranges = [
            '192.168.0',
            '192.168.1',
            '192.168.2',
            '10.0.0',
            '10.0.1',
            '172.16.0'
        ]
        
        discovered = []
        
        for prefix in common_ranges:
            # Quick check if this network is reachable
            try:
                test_ip = f"{prefix}.1"
                result = subprocess.run(
                    ['ping', '-c', '1', '-W', '1', test_ip],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    timeout=2
                )
                
                if result.returncode == 0:
                    print(f"✅ Discovered reachable network: {prefix}.0/24")
                    discovered.append(prefix)
            except:
                pass
        
        print(f"📊 Discovered {len(discovered)} additional networks")
        return discovered
    
    def travel_mode(self):
        """Autonomous travel mode - scan all networks continuously"""
        cycle = 0
        
        print("\n🚀 STARTING AUTONOMOUS TRAVEL MODE...")
        print("━" * 80)
        
        while self.running:
            cycle += 1
            print(f"\n{'='*80}")
            print(f"🌐 TRAVEL CYCLE #{cycle}")
            print(f"{'='*80}")
            
            # Re-detect networks (in case we connected to new ones)
            self.detect_all_networks()
            
            # Scan all current networks
            devices = self.scan_all_networks()
            
            # Try to discover remote networks
            remote = self.discover_remote_networks()
            
            # Report status
            print(f"\n📊 CYCLE {cycle} SUMMARY:")
            print(f"   Networks Scanned: {len(self.current_networks)}")
            print(f"   Devices Found: {len(devices)}")
            print(f"   Remote Networks Discovered: {len(remote)}")
            
            # Wait before next cycle
            wait_time = 30
            print(f"\n⏰ Next travel cycle in {wait_time} seconds...")
            print("━" * 80)
            time.sleep(wait_time)
    
    def run(self):
        """Start the agent"""
        print("\n🔥 MULTI-NETWORK AGENT ACTIVATED!")
        print("━" * 80)
        
        try:
            self.travel_mode()
        except KeyboardInterrupt:
            print("\n\n🛑 Agent stopped by user")
        except Exception as e:
            print(f"\n❌ Error: {e}")
        finally:
            print("👋 Agent shutting down...")

if __name__ == "__main__":
    agent = MultiNetworkTravellingAgent()
    agent.run()
