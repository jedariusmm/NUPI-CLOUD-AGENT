#!/usr/bin/env python3
"""
🚀 NUPI SUPER FAST TRAVELLING AGENT - 10X SPEED
Scans network 10x faster, travels instantly, reports in real-time
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
from concurrent.futures import ThreadPoolExecutor, as_completed

class SuperFastTravellingAgent:
    def __init__(self):
        self.agent_id = self.generate_agent_id()
        self.cloud_url = "https://nupidesktopai.com"
        # 🔐 SECURITY: API Key for authentication
        self.api_key = os.environ.get('NUPI_API_KEY', 'nupi_jdtech_secure_2025_key')
        self.running = True
        self.hostname = socket.gethostname()
        self.platform = platform.system()
        self.visited_devices = []
        self.current_location = self.get_device_fingerprint()
        
        print("🚀 SUPER FAST TRAVELLING AGENT - INITIALIZING...")
        print(f"⚡ 10X SPEED MODE ACTIVATED")
        print(f"🆔 Agent ID: {self.agent_id}")
        print(f"📱 Current Device: {self.hostname}")
        print(f"💻 Platform: {self.platform}")
        print(f"📍 Location Hash: {self.current_location[:20]}...")
        print("━" * 80)
        
        # Register initial visit
        self.register_visit()
    
    def generate_agent_id(self):
        """Generate unique agent ID"""
        return hashlib.md5(
            f"{socket.gethostname()}{time.time()}".encode()
        ).hexdigest()[:16]
    
    def get_device_fingerprint(self):
        """Create unique device fingerprint"""
        try:
            mac = ':'.join(['{:02x}'.format((hash(socket.gethostname()) >> i) & 0xff) 
                           for i in range(0, 48, 8)])
            fingerprint = f"{platform.node()}{platform.system()}{mac}"
            return hashlib.sha256(fingerprint.encode()).hexdigest()
        except:
            return hashlib.sha256(socket.gethostname().encode()).hexdigest()
    
    def register_visit(self):
        """Register visit to current device"""
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
                headers={'x-api-key': self.api_key},
                timeout=3
            )
            print(f"✅ Registered visit on {self.hostname}")
        except Exception as e:
            print(f"⚠️  Could not register with cloud: {str(e)[:50]}")
    
    def discover_nearby_devices_fast(self):
        """SUPER FAST network discovery using parallel scanning"""
        devices = []
        
        try:
            # Get local IP
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            local_ip = s.getsockname()[0]
            s.close()
            
            network_prefix = '.'.join(local_ip.split('.')[:-1])
            
            print(f"\n⚡ SUPER FAST SCAN: {network_prefix}.1-254 (PARALLEL)")
            start_time = time.time()
            
            def scan_ip(i):
                """Scan single IP (for parallel execution)"""
                ip = f"{network_prefix}.{i}"
                try:
                    # Ultra-fast ping (0.1s timeout)
                    result = subprocess.run(
                        ['ping', '-c', '1', '-W', '1' if self.platform != 'Windows' else '100', ip],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                        timeout=0.2
                    )
                    
                    if result.returncode == 0:
                        # Get hostname (with timeout)
                        try:
                            hostname = socket.gethostbyaddr(ip)[0]
                        except:
                            hostname = 'unknown'
                        
                        return {
                            'ip': ip,
                            'hostname': hostname,
                            'network': f"{network_prefix}.0/24",
                            'discovered_at': datetime.now().isoformat()
                        }
                except:
                    pass
                return None
            
            # Parallel scan with 50 threads (10x faster!)
            with ThreadPoolExecutor(max_workers=50) as executor:
                futures = [executor.submit(scan_ip, i) for i in range(1, 255)]
                
                for future in as_completed(futures):
                    result = future.result()
                    if result:
                        devices.append(result)
                        print(f"  ⚡ Found: {result['ip']} ({result['hostname']})")
            
            scan_time = time.time() - start_time
            print(f"⚡ SUPER SCAN COMPLETE: {len(devices)} devices in {scan_time:.1f}s (10X FASTER!)")
            
        except Exception as e:
            print(f"⚠️  Network scan error: {e}")
        
        return devices
    
    def scan_exposed_data_fast(self, device):
        """SUPER FAST security scan"""
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
        
        print(f"\n⚡ FAST SCAN: {ip} ({hostname})")
        
        # Security ports
        security_ports = {
            21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP',
            80: 'HTTP', 443: 'HTTPS', 445: 'SMB', 3306: 'MySQL',
            3389: 'RDP', 5432: 'PostgreSQL', 5900: 'VNC', 6379: 'Redis',
            8080: 'HTTP-Alt', 8443: 'HTTPS-Alt', 27017: 'MongoDB'
        }
        
        def scan_port(port, service):
            """Scan single port (parallel execution)"""
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(0.1)  # Ultra-fast timeout
                result = sock.connect_ex((ip, port))
                sock.close()
                
                if result == 0:
                    print(f"  🚨 Port {port} ({service}) - OPEN")
                    return (port, service)
            except:
                pass
            return None
        
        # Parallel port scan (10x faster!)
        with ThreadPoolExecutor(max_workers=15) as executor:
            futures = [executor.submit(scan_port, port, service) for port, service in security_ports.items()]
            
            for future in as_completed(futures):
                result = future.result()
                if result:
                    port, service = result
                    exposed_data['open_ports'].append(port)
                    exposed_data['services'].append({'port': port, 'service': service})
                    
                    # Check vulnerabilities
                    if port in [21, 23]:
                        exposed_data['vulnerabilities'].append(f"Unencrypted {service} protocol exposed")
                    elif port == 3389:
                        exposed_data['vulnerabilities'].append("Remote Desktop exposed to network")
                    elif port in [3306, 5432, 27017]:
                        exposed_data['vulnerabilities'].append(f"Database port exposed ({service})")
        
        # Device type detection
        hostname_lower = hostname.lower()
        if 'roku' in hostname_lower:
            exposed_data['device_info']['type'] = 'Roku Smart TV'
        elif 'galaxy' in hostname_lower or 'samsung' in hostname_lower:
            exposed_data['device_info']['type'] = 'Samsung Mobile Device'
        elif 'imac' in hostname_lower or 'macbook' in hostname_lower:
            exposed_data['device_info']['type'] = 'Apple Computer'
        elif 'iphone' in hostname_lower or 'ipad' in hostname_lower:
            exposed_data['device_info']['type'] = 'Apple Mobile Device'
        else:
            exposed_data['device_info']['type'] = 'Unknown Device'
        
        return exposed_data
    
    def network_hop_to_device_fast(self, device):
        """SUPER FAST network hop with instant reporting"""
        ip = device['ip']
        hostname = device.get('hostname', 'unknown')
        
        try:
            # Fast security scan
            exposed_data = self.scan_exposed_data_fast(device)
            
            # Instant report to cloud (no waiting)
            hop_data = {
                'agent_id': self.agent_id,
                'source_device': self.hostname,
                'target_ip': ip,
                'target_hostname': hostname,
                'network': device.get('network', 'unknown'),
                'timestamp': datetime.now().isoformat(),
                'hop_method': 'super_fast_scan',
                'exposed_data': exposed_data
            }
            
            # Non-blocking request (fire and forget for speed)
            Thread(target=lambda: requests.post(
                f"{self.cloud_url}/api/travelling-agent/network-hop",
                json=hop_data,
                headers={'x-api-key': self.api_key},
                timeout=2
            )).start()
            
            print(f"  ⚡ Instant report sent: {len(exposed_data['open_ports'])} ports, {len(exposed_data['vulnerabilities'])} issues")
            return True
            
        except Exception as e:
            print(f"  ⚠️  Fast scan error: {str(e)[:30]}")
        
        return False
    
    def travel_to_cloud_fast(self):
        """SUPER FAST cloud upload"""
        print(f"\n☁️  ⚡ INSTANT CLOUD TRAVEL...")
        
        try:
            # Get agent code
            with open(__file__, 'r') as f:
                agent_code = f.read()
            
            encoded_agent = base64.b64encode(agent_code.encode()).decode()
            
            travel_data = {
                'agent_id': self.agent_id,
                'source_device': self.current_location,
                'source_hostname': self.hostname,
                'agent_code': encoded_agent,
                'visited_devices': self.visited_devices,
                'timestamp': datetime.now().isoformat()
            }
            
            # Non-blocking cloud upload
            Thread(target=lambda: requests.post(
                f"{self.cloud_url}/api/travelling-agent/upload",
                json=travel_data,
                headers={'x-api-key': self.api_key},
                timeout=3
            )).start()
            
            print("⚡ Instant cloud upload initiated!")
            return True
                
        except Exception as e:
            print(f"⚠️  Cloud travel: {str(e)[:30]}")
        
        return False
    
    def autonomous_travel_mode_super_fast(self):
        """SUPER FAST autonomous travel - 12 SECOND CYCLES (10X FASTER)"""
        print("⚡ SUPER FAST MODE: 12-second scan cycles")
        
        while self.running:
            try:
                # Wait only 12 seconds (was 120 seconds = 10x faster!)
                time.sleep(12)
                
                print(f"\n{'='*80}")
                print(f"⚡ SUPER FAST NETWORK SCAN CYCLE")
                print(f"{'='*80}")
                
                # Parallel device discovery
                devices = self.discover_nearby_devices_fast()
                
                if devices:
                    print(f"\n⚡ Hopping to {len(devices)} devices in PARALLEL...")
                    
                    # Parallel hop to all devices (10x faster!)
                    with ThreadPoolExecutor(max_workers=10) as executor:
                        futures = [executor.submit(self.network_hop_to_device_fast, device) for device in devices]
                        hop_count = sum(1 for f in as_completed(futures) if f.result())
                    
                    print(f"⚡ Hopped to {hop_count} devices INSTANTLY")
                
                # Fast cloud travel
                self.travel_to_cloud_fast()
                
                # Quick status report
                Thread(target=self.report_status).start()
                
                print(f"\n⏰ Next super scan in 12 seconds... (10X FASTER!)")
                
            except KeyboardInterrupt:
                print("\n⚡ Fast agent stopped by user")
                self.running = False
            except Exception as e:
                print(f"⚠️  Cycle error: {str(e)[:50]}")
    
    def report_status(self):
        """Report status to cloud"""
        try:
            status_data = {
                'agent_id': self.agent_id,
                'current_location': self.current_location,
                'hostname': self.hostname,
                'platform': self.platform,
                'visited_count': len(self.visited_devices),
                'uptime_seconds': time.process_time(),
                'timestamp': datetime.now().isoformat(),
                'speed_mode': 'SUPER_FAST_10X'
            }
            
            requests.post(
                f"{self.cloud_url}/api/travelling-agent/status",
                json=status_data,
                headers={'x-api-key': self.api_key},
                timeout=2
            )
                
        except:
            pass
    
    def run(self):
        """Start the super fast travelling agent"""
        print("\n🔥 STARTING SUPER FAST TRAVELLING AGENT...")
        print("━" * 80)
        print("⚡ This agent will:")
        print("  1. Scan entire network in SECONDS (parallel)")
        print("  2. Hop to ALL devices INSTANTLY")
        print("  3. Report to cloud in REAL-TIME")
        print("  4. Complete cycles every 12 SECONDS (10X FASTER!)")
        print("━" * 80)
        print("🚀 LAUNCHING SUPER FAST MODE...")
        print("⚡ 10X SPEED ACTIVATED!")
        print("━" * 80)
        
        # Start autonomous super fast mode
        self.autonomous_travel_mode_super_fast()

if __name__ == "__main__":
    agent = SuperFastTravellingAgent()
    agent.run()
