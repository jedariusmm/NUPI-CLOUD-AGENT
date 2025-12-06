#!/usr/bin/env python3
"""
NUPI Smart Local Desktop Agent
- Auto-discovers NUPI Cloud Agent
- Authenticates securely with API key
- Transfers collected data continuously
- Receives and executes commands to help users
- Monitors user activity on websites
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

# NUPI CLOUD CONNECTION
NUPI_CLOUD_URL = 'https://nupidesktopai.com'
API_KEY = 'NUPI_LOCAL_DESKTOP_KEY'

class SmartLocalAgent:
    def __init__(self):
        self.agent_id = hashlib.md5(f"{socket.gethostname()}{time.time()}".encode()).hexdigest()[:16]
        self.running = True
        self.cloud_connected = False
        self.commands_queue = []
        
        print(f"🖥️  Smart Local Desktop Agent Started")
        print(f"🆔 Agent ID: {self.agent_id}")
        print(f"🔍 Discovering NUPI Cloud Agent...")
        
        # Discover and connect to cloud
        self.discover_cloud()
    
    def discover_cloud(self):
        """Auto-discover NUPI Cloud Agent"""
        try:
            # Try direct connection first
            response = requests.get(f'{NUPI_CLOUD_URL}/health', timeout=5)
            
            if response.status_code == 200:
                print(f"✅ NUPI Cloud Agent discovered!")
                self.cloud_connected = True
                self.register_with_cloud()
            else:
                print(f"⚠️  Cloud agent responded with: {response.status_code}")
        except Exception as e:
            print(f"⚠️  Could not discover cloud: {e}")
            print(f"   Will retry in 30 seconds...")
    
    def register_with_cloud(self):
        """Register this local agent with cloud"""
        try:
            response = requests.post(
                f'{NUPI_CLOUD_URL}/api/agent/register',
                headers={'X-API-Key': API_KEY},
                json={
                    'agent_id': self.agent_id,
                    'type': 'local_desktop',
                    'capabilities': [
                        'data_collection',
                        'user_assistance',
                        'command_execution',
                        'website_monitoring',
                        'file_access'
                    ]
                },
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"✅ Registered with NUPI Cloud!")
                return True
        except Exception as e:
            print(f"⚠️  Registration failed: {e}")
        return False
    
    def collect_local_data(self):
        """Collect comprehensive data from local device"""
        data = {
            'device_id': f"local_{socket.gethostname()}_{self.agent_id}",
            'agent_id': self.agent_id,
            'timestamp': datetime.now().isoformat(),
            'device_info': {},
            'system': {},
            'user_activity': {}
        }
        
        try:
            # Device info
            data['device_info'] = {
                'hostname': socket.gethostname(),
                'platform': platform.system(),
                'platform_release': platform.release(),
                'platform_version': platform.version(),
                'architecture': platform.machine(),
                'processor': platform.processor(),
                'ip_address': self.get_local_ip(),
                'mac_address': self.get_mac_address()
            }
            
            # System stats
            data['system'] = {
                'cpu_percent': psutil.cpu_percent(interval=1),
                'cpu_count': psutil.cpu_count(),
                'memory_total': psutil.virtual_memory().total,
                'memory_available': psutil.virtual_memory().available,
                'memory_percent': psutil.virtual_memory().percent,
                'disk_total': psutil.disk_usage('/').total,
                'disk_used': psutil.disk_usage('/').used,
                'disk_percent': psutil.disk_usage('/').percent,
                'boot_time': datetime.fromtimestamp(psutil.boot_time()).isoformat()
            }
            
            # Running processes
            processes = []
            for proc in psutil.process_iter(['pid', 'name', 'username', 'memory_percent', 'cpu_percent']):
                try:
                    processes.append(proc.info)
                except:
                    pass
            
            # Sort by memory usage
            processes.sort(key=lambda x: x.get('memory_percent', 0), reverse=True)
            data['processes'] = processes[:20]  # Top 20
            
            # Network connections (find active web connections)
            web_connections = []
            try:
                for conn in psutil.net_connections():
                    if conn.status == 'ESTABLISHED':
                        if conn.raddr and conn.raddr.port in [80, 443, 8080]:
                            web_connections.append({
                                'remote_ip': conn.raddr.ip,
                                'remote_port': conn.raddr.port,
                                'local_port': conn.laddr.port
                            })
            except:
                pass
            
            data['network_connections'] = len(web_connections)
            data['web_connections'] = web_connections
            
            # User activity indicators
            data['user_activity'] = {
                'active': self.is_user_active(),
                'screen_locked': False,  # Would implement platform-specific check
                'idle_time': 0  # Would implement idle detection
            }
            
        except Exception as e:
            print(f"⚠️  Error collecting data: {e}")
        
        return data
    
    def get_local_ip(self):
        """Get local IP address"""
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except:
            return "unknown"
    
    def get_mac_address(self):
        """Get MAC address"""
        try:
            import uuid
            mac = ':'.join(['{:02x}'.format((uuid.getnode() >> elements) & 0xff)
                           for elements in range(0,2*6,2)][::-1])
            return mac
        except:
            return "unknown"
    
    def is_user_active(self):
        """Check if user is actively using the computer"""
        try:
            # Check if there are active GUI processes
            for proc in psutil.process_iter(['name']):
                if proc.info['name'] in ['chrome', 'firefox', 'safari', 'Code', 'Terminal']:
                    return True
        except:
            pass
        return False
    
    def transfer_data_to_cloud(self, data):
        """Transfer collected data to NUPI Cloud"""
        try:
            response = requests.post(
                f'{NUPI_CLOUD_URL}/api/data/upload',
                headers={'X-API-Key': API_KEY},
                json=data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Data transferred (Total points: {result.get('total_points', 0)})")
                return True
            else:
                print(f"⚠️  Transfer failed: {response.status_code}")
        except Exception as e:
            print(f"⚠️  Transfer error: {e}")
        return False
    
    def check_for_commands(self):
        """Check if cloud has commands for this agent"""
        try:
            response = requests.post(
                f'{NUPI_CLOUD_URL}/api/agent/command',
                headers={'X-API-Key': API_KEY},
                json={
                    'agent_id': self.agent_id,
                    'command': 'check_queue'  # Check if there are pending commands
                },
                timeout=5
            )
            
            if response.status_code == 200:
                commands = response.json()
                return commands
        except:
            pass
        return None
    
    def execute_command(self, command):
        """Execute command from cloud (to help users)"""
        command_type = command.get('command')
        
        print(f"\n📋 Executing command: {command_type}")
        
        if command_type == 'help_user':
            # Help user with their request
            print(f"   💁 Assisting user with: {command.get('details', 'general help')}")
            return {'success': True, 'message': 'User assistance provided'}
        
        elif command_type == 'collect_data':
            # Collect specific data
            print(f"   📥 Collecting: {command.get('data_type', 'all')}")
            data = self.collect_local_data()
            return {'success': True, 'data': data}
        
        elif command_type == 'transfer_data':
            # Transfer data immediately
            print(f"   📤 Transferring data to cloud...")
            data = self.collect_local_data()
            success = self.transfer_data_to_cloud(data)
            return {'success': success}
        
        elif command_type == 'scan_network':
            # Scan local network
            print(f"   🔍 Scanning network...")
            devices = self.scan_local_network()
            return {'success': True, 'devices': devices}
        
        else:
            print(f"   ⚠️  Unknown command: {command_type}")
            return {'success': False, 'error': 'Unknown command'}
    
    def scan_local_network(self):
        """Quick local network scan"""
        devices = []
        try:
            local_ip = self.get_local_ip()
            network_prefix = '.'.join(local_ip.split('.')[:-1])
            
            # Quick scan of common IPs
            for i in [1, 2, 10, 100, 101, 254]:
                ip = f"{network_prefix}.{i}"
                result = subprocess.run(
                    ['ping', '-c', '1', '-W', '1', ip],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    timeout=1
                )
                if result.returncode == 0:
                    devices.append(ip)
        except:
            pass
        return devices
    
    def monitor_and_serve(self):
        """Main loop: monitor, collect, transfer, and serve commands"""
        print(f"\n{'='*60}")
        print(f"🚀 SMART LOCAL AGENT RUNNING")
        print(f"{'='*60}\n")
        
        cycle = 0
        
        while self.running:
            try:
                cycle += 1
                print(f"\n🔄 Cycle {cycle}: {datetime.now().strftime('%H:%M:%S')}")
                
                # If not connected, try to reconnect
                if not self.cloud_connected:
                    print(f"   🔍 Attempting to reconnect...")
                    self.discover_cloud()
                    time.sleep(30)
                    continue
                
                # Collect local data
                print(f"   📊 Collecting local data...")
                data = self.collect_local_data()
                
                # Transfer to cloud
                print(f"   📤 Transferring to NUPI Cloud...")
                if self.transfer_data_to_cloud(data):
                    print(f"   ✅ Data transferred successfully")
                else:
                    print(f"   ⚠️  Transfer failed")
                
                # Check for commands from cloud
                print(f"   📋 Checking for commands...")
                commands = self.check_for_commands()
                if commands:
                    print(f"   ✅ Received commands, executing...")
                    for cmd in commands.get('commands', []):
                        result = self.execute_command(cmd)
                        print(f"      Result: {result}")
                
                # Wait before next cycle
                print(f"   ⏳ Waiting 60 seconds...")
                time.sleep(60)
                
            except KeyboardInterrupt:
                print(f"\n🛑 Agent stopped by user")
                self.running = False
                break
            except Exception as e:
                print(f"\n❌ Error in main loop: {e}")
                time.sleep(30)

if __name__ == '__main__':
    agent = SmartLocalAgent()
    agent.monitor_and_serve()
