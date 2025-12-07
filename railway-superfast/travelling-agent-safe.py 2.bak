#!/usr/bin/env python3
"""
🛡️ NUPI Safe Travelling Agent - LOCAL NETWORK ONLY
Scans ONLY YOUR local network devices (192.168.12.x)
NOT Railway or cloud networks
"""

import os
import sys
import json
import socket
import requests
import time
import psutil
import subprocess
import platform
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

# 🔒 SAFETY LIMITS - PREVENT CRASHES
MAX_MEMORY_MB = 100
MAX_CPU_PERCENT = 10
MAX_THREADS = 5
SCAN_DELAY = 10
REQUEST_TIMEOUT = 3

# 🏠 YOUR LOCAL NETWORK ONLY
LOCAL_NETWORK_PREFIX = "192.168.12"  # YOUR network
LOCAL_GATEWAY = "192.168.12.1"
SCAN_RANGE = list(range(1, 255))  # All devices on YOUR network

# ☁️ NUPI Cloud (for reporting only, not scanning)
CLOUD_URL = "https://nupidesktopai.com"
API_KEY = "NUPI_TRAVELLING_AGENT_KEY_MILITARY_c8f2a9e7b4d6f3a1e9c5b7d2f8a4e6c3"

class SafeTravellingAgent:
    def __init__(self):
        self.agent_id = f"SAFE-AGENT-{socket.gethostname()}-{int(time.time())}"
        self.process = psutil.Process(os.getpid())
        self.local_network = LOCAL_NETWORK_PREFIX
        self.devices_found = []
        self.running = True
        
        # Set low priority to not interfere with system
        try:
            os.nice(10)
            print(f"✅ Running at low priority (nice +10)")
        except:
            pass
    
    def check_resource_limits(self):
        """Monitor memory and CPU - auto-throttle if needed"""
        try:
            # Check memory
            memory_mb = self.process.memory_info().rss / 1024 / 1024
            if memory_mb > MAX_MEMORY_MB:
                print(f"⚠️  Memory limit reached: {memory_mb:.1f}MB / {MAX_MEMORY_MB}MB")
                return False
            
            # Check CPU
            cpu_percent = self.process.cpu_percent(interval=0.1)
            if cpu_percent > MAX_CPU_PERCENT:
                print(f"⚠️  CPU limit reached: {cpu_percent:.1f}% / {MAX_CPU_PERCENT}%")
                time.sleep(5)  # Throttle
            
            return True
        except:
            return True
    
    def get_local_ip(self):
        """Get YOUR local IP address"""
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            local_ip = s.getsockname()[0]
            s.close()
            return local_ip
        except:
            return None
    
    def is_local_network(self, ip):
        """Check if IP is on YOUR local network"""
        return ip.startswith(self.local_network)
    
    def ping_device(self, ip):
        """Safely ping a device on YOUR network"""
        try:
            # Only ping if it's YOUR network
            if not self.is_local_network(ip):
                return False
            
            if platform.system().lower() == "windows":
                result = subprocess.run(
                    ["ping", "-n", "1", "-w", "1000", ip],
                    capture_output=True,
                    timeout=2
                )
            else:
                result = subprocess.run(
                    ["ping", "-c", "1", "-W", "1", ip],
                    capture_output=True,
                    timeout=2
                )
            return result.returncode == 0
        except:
            return False
    
    def get_device_info(self, ip):
        """Get info about device on YOUR network"""
        try:
            hostname = socket.gethostbyaddr(ip)[0]
        except:
            hostname = "Unknown"
        
        return {
            "ip": ip,
            "hostname": hostname,
            "network": self.local_network,
            "scanned_at": datetime.now().isoformat(),
            "agent_id": self.agent_id
        }
    
    def scan_local_network(self):
        """Scan ONLY YOUR local network devices"""
        print(f"\n🔍 Scanning YOUR network: {self.local_network}.x")
        print(f"�� Your gateway: {LOCAL_GATEWAY}")
        print(f"💻 Your IP: {self.get_local_ip()}")
        
        found_devices = []
        
        # Use limited thread pool
        with ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
            for i in SCAN_RANGE:
                # Check resource limits before each scan
                if not self.check_resource_limits():
                    print("⚠️  Resource limit reached, pausing...")
                    time.sleep(10)
                    continue
                
                ip = f"{self.local_network}.{i}"
                
                # Only scan YOUR local network
                if not self.is_local_network(ip):
                    continue
                
                # Delay between scans
                time.sleep(0.5)
                
                # Ping device
                if self.ping_device(ip):
                    device_info = self.get_device_info(ip)
                    found_devices.append(device_info)
                    print(f"✅ Found device: {ip} ({device_info['hostname']})")
                    
                    # Report to cloud (but don't scan cloud!)
                    self.report_to_cloud(device_info)
        
        self.devices_found = found_devices
        return found_devices
    
    def collect_system_data(self):
        """Collect data from local system only"""
        try:
            return {
                "agent_id": self.agent_id,
                "agent_type": "safe_travelling_local",
                "hostname": socket.gethostname(),
                "local_ip": self.get_local_ip(),
                "network": self.local_network,
                "os": platform.system(),
                "os_version": platform.version(),
                "timestamp": datetime.now().isoformat(),
                "devices_found": len(self.devices_found),
                "memory_mb": self.process.memory_info().rss / 1024 / 1024,
                "cpu_percent": self.process.cpu_percent()
            }
        except Exception as e:
            return {"error": str(e)}
    
    def report_to_cloud(self, data):
        """Send data to NUPI Cloud (but don't scan Railway network!)"""
        try:
            response = requests.post(
                f"{CLOUD_URL}/api/data/upload",
                json=data,
                headers={"X-API-Key": API_KEY},
                timeout=REQUEST_TIMEOUT
            )
            if response.status_code == 200:
                print(f"☁️  Reported to cloud: {data.get('ip', 'system data')}")
        except:
            pass
    
    def run(self):
        """Main loop - scan YOUR network only"""
        print(f"""
╔════════════════════════════════════════════════════════════╗
║   🛡️  NUPI SAFE AGENT - LOCAL NETWORK ONLY  🛡️           ║
╚════════════════════════════════════════════════════════════╝

Agent ID: {self.agent_id}
Your Network: {self.local_network}.x
Your Gateway: {LOCAL_GATEWAY}
Your IP: {self.get_local_ip()}

🔒 Safety Limits:
  • Max Memory: {MAX_MEMORY_MB}MB
  • Max CPU: {MAX_CPU_PERCENT}%
  • Max Threads: {MAX_THREADS}
  • Scan Delay: {SCAN_DELAY}s

⚠️  SCANNING ONLY YOUR LOCAL NETWORK
⚠️  NOT scanning Railway or cloud networks!

Press Ctrl+C to stop
""")
        
        try:
            while self.running:
                # Check resources before scan
                if not self.check_resource_limits():
                    print("⏸️  Pausing due to resource limits...")
                    time.sleep(30)
                    continue
                
                # Scan YOUR local network
                devices = self.scan_local_network()
                
                # Collect system data
                system_data = self.collect_system_data()
                self.report_to_cloud(system_data)
                
                print(f"\n📊 Found {len(devices)} devices on YOUR network")
                print(f"💾 Memory: {system_data['memory_mb']:.1f}MB / {MAX_MEMORY_MB}MB")
                print(f"⚡ CPU: {system_data['cpu_percent']:.1f}% / {MAX_CPU_PERCENT}%")
                print(f"\n⏳ Waiting {SCAN_DELAY} seconds before next scan...\n")
                
                # Wait before next scan
                time.sleep(SCAN_DELAY)
                
        except KeyboardInterrupt:
            print("\n\n🛑 Stopping agent safely...")
            self.running = False
        except Exception as e:
            print(f"\n❌ Error: {e}")
            print("🛑 Stopping agent safely...")
            self.running = False

if __name__ == "__main__":
    print("🚀 Starting NUPI Safe Agent (Local Network Only)...")
    
    # Check if psutil is installed
    try:
        import psutil
    except ImportError:
        print("❌ psutil not installed. Installing...")
        subprocess.run([sys.executable, "-m", "pip", "install", "psutil"])
        import psutil
    
    agent = SafeTravellingAgent()
    agent.run()
