#!/usr/bin/env python3
"""
NUPI UNIFIED AGENT SYSTEM
ALL local agents report to ONE cloud agent
Registers and reports ALL devices and data
"""
import subprocess
import requests
import json
import time
import socket
import os
import sys
from datetime import datetime

CLOUD_URL = "https://nupidesktopai.com"
API_KEY = "NUPI_TRAVELLING_AGENT_KEY_MILITARY_c8f2a9e7b4d6f3a1e9c5b7d2f8a4e6c3"
LOCAL_IP = socket.gethostbyname(socket.gethostname())

class UnifiedAgentSystem:
    """Manages ALL agents in unified system"""
    
    def __init__(self):
        self.agents = {}
        self.cloud_url = CLOUD_URL
        self.local_ip = LOCAL_IP
        
    def register_with_cloud(self, agent_id, agent_type, network):
        """Register ANY agent with NUPI Cloud"""
        try:
            response = requests.post(
                f"{self.cloud_url}/api/agent/register",
                headers={'Content-Type': 'application/json'},
                json={
                    "agent_id": agent_id,
                    "location": self.local_ip,
                    "network": network,
                    "type": agent_type,
                    "timestamp": datetime.utcnow().isoformat()
                },
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"✅ Registered: {agent_id} ({agent_type})")
                return True
            else:
                print(f"⚠️  Registration failed for {agent_id}: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error registering {agent_id}: {e}")
            return False
    
    def report_devices(self, agent_id, devices, network):
        """Report discovered devices to NUPI Cloud"""
        try:
            response = requests.post(
                f"{self.cloud_url}/api/agent/report",
                headers={'Content-Type': 'application/json'},
                json={
                    "agent_id": agent_id,
                    "network": network,
                    "devices": devices,
                    "timestamp": datetime.utcnow().isoformat()
                },
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"✅ Reported {len(devices)} devices from {agent_id}")
                return True
            else:
                print(f"⚠️  Report failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error reporting: {e}")
            return False
    
    def scan_local_network(self):
        """Scan local network and return devices"""
        devices = []
        network_prefix = ".".join(LOCAL_IP.split('.')[:-1])
        
        print(f"🔍 Scanning {network_prefix}.x network...")
        
        # Quick scan of common IPs
        for i in [1, 2, 100, 101, 102, 150, 158, 169, 175, 247, 254]:
            ip = f"{network_prefix}.{i}"
            # Quick ping check
            result = os.system(f"ping -c 1 -W 1 {ip} > /dev/null 2>&1")
            if result == 0:
                # Try to get hostname
                try:
                    hostname = socket.gethostbyaddr(ip)[0]
                except:
                    hostname = "Unknown"
                
                devices.append({
                    "ip": ip,
                    "hostname": hostname
                })
                print(f"  ✅ Found: {ip} ({hostname})")
        
        return devices
    
    def start_agent(self, agent_file, agent_id, agent_type):
        """Start a local agent process"""
        try:
            if not os.path.exists(agent_file):
                print(f"⚠️  Agent file not found: {agent_file}")
                return None
            
            # Start agent in background
            process = subprocess.Popen(
                [sys.executable, agent_file],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            self.agents[agent_id] = {
                "process": process,
                "type": agent_type,
                "pid": process.pid,
                "started": datetime.utcnow().isoformat()
            }
            
            print(f"🚀 Started: {agent_id} (PID {process.pid})")
            return process.pid
        except Exception as e:
            print(f"❌ Failed to start {agent_id}: {e}")
            return None
    
    def launch_all_agents(self):
        """Launch ALL agents in unified system"""
        print("=" * 80)
        print("🚀 LAUNCHING UNIFIED AGENT SYSTEM")
        print("=" * 80)
        
        # Define all agents
        agent_configs = [
            {
                "file": "travelling-agent-safe.py",
                "id": "safe-scanner",
                "type": "Local Network Scanner",
                "network": "192.168.12.x"
            },
            {
                "file": "travelling-agent-universal.py",
                "id": "universal-hopper",
                "type": "Network Hopper",
                "network": "multi-hop"
            },
            {
                "file": "local-desktop-agent-smart.py",
                "id": "desktop-monitor",
                "type": "Desktop Agent",
                "network": "local-system"
            }
        ]
        
        registered_count = 0
        
        # Register THIS unified system first
        if self.register_with_cloud("unified-system", "Master Controller", "all-networks"):
            registered_count += 1
        
        # Scan and report local network immediately
        devices = self.scan_local_network()
        if devices:
            self.report_devices("unified-system", devices, "192.168.12.x")
        
        # Launch and register each agent
        for config in agent_configs:
            agent_id = config["id"]
            
            # Register with cloud
            if self.register_with_cloud(agent_id, config["type"], config["network"]):
                registered_count += 1
                
                # Start the agent (if file exists)
                self.start_agent(config["file"], agent_id, config["type"])
        
        print("\n" + "=" * 80)
        print(f"✅ UNIFIED SYSTEM LAUNCHED")
        print(f"   Registered Agents: {registered_count}")
        print(f"   Running Processes: {len(self.agents)}")
        print(f"   Devices Found: {len(devices)}")
        print("=" * 80)
        
        return registered_count
    
    def check_cloud_status(self):
        """Check NUPI Cloud Agent status"""
        try:
            response = requests.get(f"{self.cloud_url}/api/agents/locations", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"\n☁️  CLOUD STATUS:")
                print(f"   Total Agents: {data.get('count', 0)}")
                for agent in data.get('agents', []):
                    print(f"   - {agent.get('agent_id')} ({agent.get('type', 'Unknown')})")
                return True
            return False
        except Exception as e:
            print(f"❌ Cloud unreachable: {e}")
            return False

def main():
    print("\n" + "=" * 80)
    print("🌍 NUPI UNIFIED AGENT SYSTEM")
    print("   ALL agents → ONE cloud")
    print("=" * 80 + "\n")
    
    system = UnifiedAgentSystem()
    
    # Launch everything
    system.launch_all_agents()
    
    # Give agents time to start
    print("\n⏳ Waiting for agents to initialize...")
    time.sleep(5)
    
    # Check cloud status
    system.check_cloud_status()
    
    print("\n✅ Unified system is running!")
    print("   Dashboard: https://nupidesktopai.com/travelling-agents-ultimate.html")
    print("   Password: Jedariusm")
    print("\nPress Ctrl+C to stop all agents...")
    
    # Keep running
    try:
        while True:
            time.sleep(60)
            # Periodic health check
            system.check_cloud_status()
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping all agents...")
        for agent_id, agent_info in system.agents.items():
            try:
                agent_info['process'].terminate()
                print(f"   Stopped: {agent_id}")
            except:
                pass
        print("✅ All agents stopped.")

if __name__ == "__main__":
    main()
