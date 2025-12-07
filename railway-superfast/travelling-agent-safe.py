#!/usr/bin/env python3
"""
NUPI SAFE TRAVELLING AGENT
- Resource-limited to prevent system crashes
- Memory and CPU throttling
- Graceful error handling
- No aggressive scanning
"""

import socket
import subprocess
import platform
import psutil
import json
import time
import hashlib
import requests
from datetime import datetime
import threading
import os
import sys

# Safety limits
MAX_MEMORY_MB = 100  # Maximum 100MB memory usage
MAX_CPU_PERCENT = 10  # Maximum 10% CPU usage
MAX_THREADS = 5  # Maximum 5 concurrent threads
SCAN_DELAY = 10  # 10 second delay between scans
REQUEST_TIMEOUT = 3  # 3 second timeout for requests

NUPI_CLOUD_URL = 'https://nupidesktopai.com'
API_KEY = 'NUPI_TRAVELLING_AGENT_KEY_MILITARY'

class SafeTravellingAgent:
    def __init__(self):
        self.agent_id = hashlib.md5(f"{socket.gethostname()}{time.time()}".encode()).hexdigest()[:16]
        self.current_device = socket.gethostname()
        self.running = True
        self.process = psutil.Process()
        
        print(f"🛡️  SAFE Travelling Agent: {self.agent_id}")
        print(f"📍 Device: {self.current_device}")
        print(f"⚠️  Resource limits: {MAX_MEMORY_MB}MB RAM, {MAX_CPU_PERCENT}% CPU")
        
        # Set nice level to low priority
        try:
            os.nice(10)  # Lower priority
        except:
            pass
        
        self.register_with_cloud()
    
    def check_resource_limits(self):
        """Check if agent is within resource limits"""
        try:
            # Check memory
            memory_mb = self.process.memory_info().rss / 1024 / 1024
            if memory_mb > MAX_MEMORY_MB:
                print(f"⚠️  Memory limit exceeded ({memory_mb:.1f}MB > {MAX_MEMORY_MB}MB)")
                return False
            
            # Check CPU
            cpu_percent = self.process.cpu_percent(interval=0.1)
            if cpu_percent > MAX_CPU_PERCENT:
                print(f"⚠️  CPU limit exceeded ({cpu_percent:.1f}% > {MAX_CPU_PERCENT}%)")
                time.sleep(5)  # Throttle
            
            return True
        except:
            return True
    
    def register_with_cloud(self):
        """Register with NUPI Cloud"""
        try:
            response = requests.post(
                f'{NUPI_CLOUD_URL}/api/agent/register',
                headers={'X-API-Key': API_KEY},
                json={
                    'agent_id': self.agent_id,
                    'type': 'safe_travelling',
                    'capabilities': ['safe_scanning', 'resource_limited'],
                    'resource_limits': {
                        'max_memory_mb': MAX_MEMORY_MB,
                        'max_cpu_percent': MAX_CPU_PERCENT
                    }
                },
                timeout=REQUEST_TIMEOUT
            )
            
            if response.status_code == 200:
                print(f"✅ Registered with NUPI Cloud")
        except Exception as e:
            print(f"⚠️  Registration failed: {e}")
    
    def update_location(self, device_name):
        """Update location in cloud"""
        try:
            requests.post(
                f'{NUPI_CLOUD_URL}/api/agent/location',
                headers={'X-API-Key': API_KEY},
                json={
                    'agent_id': self.agent_id,
                    'current_device': device_name,
                    'timestamp': datetime.now().isoformat()
                },
                timeout=REQUEST_TIMEOUT
            )
        except:
            pass
    
    def extract_safe_data(self):
        """Extract minimal safe data"""
        data = {
            'device_id': f"device_{self.current_device}",
            'agent_id': self.agent_id,
            'timestamp': datetime.now().isoformat(),
            'device_info': {},
            'system': {}
        }
        
        try:
            # Basic device info only
            data['device_info'] = {
                'hostname': socket.gethostname(),
                'platform': platform.system()
            }
            
            # Light system stats
            data['system'] = {
                'cpu_percent': psutil.cpu_percent(interval=0.1),
                'memory_percent': psutil.virtual_memory().percent
            }
            
        except Exception as e:
            print(f"⚠️  Data extraction error: {e}")
        
        return data
    
    def get_local_ip(self):
        """Get local IP safely"""
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.settimeout(1)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except:
            return "unknown"
    
    def safe_network_scan(self):
        """Safe, limited network scan"""
        devices = []
        try:
            local_ip = self.get_local_ip()
            if local_ip == "unknown":
                return devices
            
            network_prefix = '.'.join(local_ip.split('.')[:-1])
            
            print(f"\n🔍 Safe scan: {network_prefix}.1, .2, .254 (limited)")
            
            # Only scan gateway and broadcast addresses
            safe_ips = [1, 2, 254]
            
            for i in safe_ips:
                if not self.check_resource_limits():
                    print("⚠️  Resource limit reached, stopping scan")
                    break
                
                ip = f"{network_prefix}.{i}"
                try:
                    result = subprocess.run(
                        ['ping', '-c', '1', '-W', '1', ip],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                        timeout=2
                    )
                    if result.returncode == 0:
                        devices.append(ip)
                except:
                    pass
                
                time.sleep(1)  # Delay between pings
            
            print(f"✅ Found {len(devices)} devices (safe mode)")
            
        except Exception as e:
            print(f"⚠️  Scan error: {e}")
        
        return devices
    
    def send_to_cloud(self, data):
        """Send data safely"""
        try:
            response = requests.post(
                f'{NUPI_CLOUD_URL}/api/data/upload',
                headers={'X-API-Key': API_KEY},
                json=data,
                timeout=REQUEST_TIMEOUT
            )
            if response.status_code == 200:
                print(f"✅ Data sent")
                return True
        except Exception as e:
            print(f"⚠️  Upload failed: {e}")
        return False
    
    def safe_travel(self):
        """Main safe loop"""
        print(f"\n{'='*60}")
        print(f"🛡️  SAFE TRAVELLING AGENT ACTIVE")
        print(f"{'='*60}\n")
        
        cycle = 0
        
        while self.running:
            try:
                cycle += 1
                print(f"\n🔄 Cycle {cycle}")
                
                # Check resource limits
                if not self.check_resource_limits():
                    print("⚠️  Resource limits exceeded, throttling...")
                    time.sleep(30)
                    continue
                
                # Extract safe data
                data = self.extract_safe_data()
                
                # Update location
                self.update_location(self.current_device)
                
                # Send data
                self.send_to_cloud(data)
                
                # Safe network scan (minimal)
                devices = self.safe_network_scan()
                
                # Long delay between cycles
                print(f"\n⏳ Waiting {SCAN_DELAY} seconds...")
                time.sleep(SCAN_DELAY)
                
            except KeyboardInterrupt:
                print(f"\n🛑 Agent stopped")
                self.running = False
                break
            except Exception as e:
                print(f"\n❌ Error: {e}")
                time.sleep(30)

if __name__ == '__main__':
    agent = SafeTravellingAgent()
    agent.safe_travel()
