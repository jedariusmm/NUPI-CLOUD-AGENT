#!/usr/bin/env python3
"""
🤖 AUTONOMOUS AGENT GENERATOR & DEPLOYER
Automatically creates, configures, and deploys agents to Railway Cloud
"""

import json
import os
import subprocess
import time
from datetime import datetime
import hashlib

class AutonomousAgentGenerator:
    def __init__(self):
        self.base_path = os.path.dirname(os.path.abspath(__file__))
        self.config_file = os.path.join(self.base_path, "agent-config.json")
        
    def generate_agent_id(self, agent_type):
        """Generate unique agent ID"""
        timestamp = str(time.time())
        unique_string = f"{agent_type}_{timestamp}"
        return hashlib.md5(unique_string.encode()).hexdigest()[:16]
    
    def create_agent_config(self, agent_name, agent_type="fast", scan_interval=12, network_range="auto"):
        """Create agent configuration"""
        config = {
            "agent_name": agent_name,
            "agent_id": self.generate_agent_id(agent_type),
            "agent_type": agent_type,
            "scan_interval": scan_interval,
            "network_range": network_range,
            "created_at": datetime.now().isoformat(),
            "deployment": {
                "platform": "railway",
                "auto_deploy": True,
                "environment": "production"
            },
            "capabilities": {
                "network_scanning": True,
                "cloud_sync": True,
                "device_hopping": True,
                "parallel_execution": True,
                "auto_recovery": True
            }
        }
        return config
    
    def generate_agent_code(self, config):
        """Generate autonomous agent Python code"""
        agent_id = config["agent_id"]
        agent_name = config["agent_name"]
        scan_interval = config["scan_interval"]
        
        agent_code = f'''#!/usr/bin/env python3
"""
🤖 {agent_name} - Autonomous Travelling Agent
Agent ID: {agent_id}
Auto-generated: {datetime.now().isoformat()}
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
from datetime import datetime
from threading import Thread
from concurrent.futures import ThreadPoolExecutor, as_completed

class {agent_name.replace("-", "_").replace(" ", "_")}:
    def __init__(self):
        self.agent_id = "{agent_id}"
        self.agent_name = "{agent_name}"
        self.scan_interval = {scan_interval}
        self.api_key = os.getenv("NUPI_API_KEY", "nupi_jdtech_secure_2025_key")
        self.cloud_url = "https://nupidesktopai.com/api/travelling-agents"
        self.device_id = self.get_device_id()
        self.running = True
        
        print(f"🤖 {{self.agent_name}} - INITIALIZING...")
        print(f"━" * 80)
        print(f"⚡ AUTONOMOUS MODE ACTIVATED")
        print(f"🆔 Agent ID: {{self.agent_id}}")
        print(f"📱 Device: {{self.device_id}}")
        print(f"🔄 Scan Interval: {{self.scan_interval}}s")
        print(f"━" * 80)
    
    def get_device_id(self):
        """Get unique device identifier"""
        try:
            hostname = socket.gethostname()
            return hashlib.md5(hostname.encode()).hexdigest()[:12]
        except:
            return "unknown_device"
    
    def get_network_range(self):
        """Auto-detect network range"""
        try:
            hostname = socket.gethostname()
            local_ip = socket.gethostbyname(hostname)
            network_prefix = '.'.join(local_ip.split('.')[:-1])
            return f"{{network_prefix}}.1-254"
        except:
            return "10.0.0.1-254"
    
    def scan_device(self, ip):
        """Quick device scan"""
        try:
            result = subprocess.run(
                ['ping', '-c', '1', '-W', '1', ip],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                timeout=2
            )
            if result.returncode == 0:
                return {{"ip": ip, "status": "online", "scanned_at": datetime.now().isoformat()}}
        except:
            pass
        return None
    
    def parallel_scan(self, ip_range):
        """Parallel network scanning"""
        devices = []
        network_prefix = ip_range.split('-')[0].rsplit('.', 1)[0]
        
        with ThreadPoolExecutor(max_workers=50) as executor:
            futures = [executor.submit(self.scan_device, f"{{network_prefix}}.{{i}}") 
                      for i in range(1, 255)]
            
            for future in as_completed(futures):
                result = future.result()
                if result:
                    devices.append(result)
        
        return devices
    
    def sync_to_cloud(self, data):
        """Sync data to cloud"""
        try:
            headers = {{"x-api-key": self.api_key}}
            payload = {{
                "agent_id": self.agent_id,
                "device_id": self.device_id,
                "data": data,
                "timestamp": datetime.now().isoformat()
            }}
            response = requests.post(
                f"{{self.cloud_url}}/sync",
                json=payload,
                headers=headers,
                timeout=5
            )
            return response.status_code == 200
        except Exception as e:
            print(f"⚠️  Cloud sync error: {{e}}")
            return False
    
    def run_scan_cycle(self):
        """Execute one scan cycle"""
        print(f"\\n{{'=' * 80}}")
        print(f"⚡ AUTONOMOUS SCAN CYCLE - {{datetime.now().strftime('%H:%M:%S')}}")
        print(f"{{'=' * 80}}")
        
        # Get network range
        network_range = self.get_network_range()
        print(f"🌐 Scanning: {{network_range}}")
        
        # Parallel scan
        start_time = time.time()
        devices = self.parallel_scan(network_range)
        scan_time = time.time() - start_time
        
        print(f"✅ Scan complete: {{len(devices)}} devices in {{scan_time:.2f}}s")
        
        # Sync to cloud
        if devices:
            print(f"☁️  Syncing to cloud...")
            self.sync_to_cloud({{"devices": devices, "scan_time": scan_time}})
        
        print(f"⏰ Next scan in {{self.scan_interval}}s...")
    
    def start(self):
        """Start autonomous agent"""
        print(f"\\n🚀 STARTING AUTONOMOUS AGENT...")
        print(f"━" * 80)
        
        # Register with cloud
        self.sync_to_cloud({{"status": "initialized", "device_id": self.device_id}})
        
        # Main loop
        while self.running:
            try:
                self.run_scan_cycle()
                time.sleep(self.scan_interval)
            except KeyboardInterrupt:
                print(f"\\n🛑 Shutting down...")
                self.running = False
            except Exception as e:
                print(f"❌ Error: {{e}}")
                time.sleep(5)

if __name__ == "__main__":
    agent = {agent_name.replace("-", "_").replace(" ", "_")}()
    agent.start()
'''
        return agent_code
    
    def create_deployment_files(self, config):
        """Create Dockerfile and requirements for agent"""
        
        # Dockerfile
        dockerfile = f'''FROM python:3.11-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \\
    iputils-ping \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY {config["agent_name"]}.py .

ENV PYTHONUNBUFFERED=1
ENV PORT=8080

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD python -c "print('healthy')" || exit 1

CMD ["python", "{config["agent_name"]}.py"]
'''
        
        # Requirements
        requirements = '''psutil
requests
'''
        
        return dockerfile, requirements
    
    def save_agent(self, config, agent_code, dockerfile, requirements):
        """Save agent files to disk"""
        agent_dir = os.path.join(self.base_path, "autonomous-agents", config["agent_name"])
        os.makedirs(agent_dir, exist_ok=True)
        
        # Save agent code
        agent_file = os.path.join(agent_dir, f"{config['agent_name']}.py")
        with open(agent_file, 'w') as f:
            f.write(agent_code)
        os.chmod(agent_file, 0o755)
        
        # Save Dockerfile
        with open(os.path.join(agent_dir, "Dockerfile"), 'w') as f:
            f.write(dockerfile)
        
        # Save requirements
        with open(os.path.join(agent_dir, "requirements.txt"), 'w') as f:
            f.write(requirements)
        
        # Save config
        with open(os.path.join(agent_dir, "config.json"), 'w') as f:
            json.dump(config, f, indent=2)
        
        return agent_dir
    
    def deploy_to_railway(self, agent_dir, config):
        """Automatically deploy agent to Railway"""
        print(f"\n🚀 DEPLOYING TO RAILWAY CLOUD...")
        print(f"━" * 80)
        
        original_dir = os.getcwd()
        
        try:
            os.chdir(agent_dir)
            
            # Initialize Railway project
            print("1️⃣  Initializing Railway project...")
            subprocess.run(["railway", "init"], check=False)
            
            # Set environment variables
            print("2️⃣  Setting environment variables...")
            subprocess.run([
                "railway", "variables", "set",
                "NUPI_API_KEY=nupi_jdtech_secure_2025_key"
            ], check=False)
            
            # Deploy
            print("3️⃣  Deploying to Railway...")
            result = subprocess.run(["railway", "up"], capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ DEPLOYMENT SUCCESSFUL!")
                
                # Get domain
                domain_result = subprocess.run(
                    ["railway", "domain"],
                    capture_output=True,
                    text=True
                )
                
                print(f"\n🌐 Agent deployed!")
                print(domain_result.stdout)
                
                return True
            else:
                print(f"❌ Deployment failed: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Deployment error: {e}")
            return False
        finally:
            os.chdir(original_dir)
    
    def create_and_deploy_agent(self, agent_name, agent_type="fast", scan_interval=12, auto_deploy=True):
        """Complete autonomous agent creation and deployment"""
        print(f"\n{'=' * 80}")
        print(f"🤖 AUTONOMOUS AGENT GENERATOR")
        print(f"{'=' * 80}")
        print(f"\n📝 Creating agent: {agent_name}")
        
        # Step 1: Generate config
        print(f"\n1️⃣  Generating configuration...")
        config = self.create_agent_config(agent_name, agent_type, scan_interval)
        print(f"   ✅ Agent ID: {config['agent_id']}")
        
        # Step 2: Generate code
        print(f"\n2️⃣  Generating agent code...")
        agent_code = self.generate_agent_code(config)
        print(f"   ✅ Code generated")
        
        # Step 3: Create deployment files
        print(f"\n3️⃣  Creating deployment files...")
        dockerfile, requirements = self.create_deployment_files(config)
        print(f"   ✅ Dockerfile and requirements created")
        
        # Step 4: Save files
        print(f"\n4️⃣  Saving agent files...")
        agent_dir = self.save_agent(config, agent_code, dockerfile, requirements)
        print(f"   ✅ Saved to: {agent_dir}")
        
        # Step 5: Deploy
        if auto_deploy:
            print(f"\n5️⃣  Deploying to Railway...")
            success = self.deploy_to_railway(agent_dir, config)
            if success:
                print(f"\n{'=' * 80}")
                print(f"✅ ✅ ✅  AUTONOMOUS DEPLOYMENT COMPLETE!")
                print(f"{'=' * 80}")
                print(f"\nAgent: {agent_name}")
                print(f"ID: {config['agent_id']}")
                print(f"Status: LIVE on Railway Cloud")
                print(f"Location: {agent_dir}")
            else:
                print(f"\n⚠️  Agent created but deployment failed. Deploy manually:")
                print(f"   cd {agent_dir} && railway up")
        else:
            print(f"\n⏸️  Auto-deploy disabled. To deploy manually:")
            print(f"   cd {agent_dir} && railway up")
        
        return config

def main():
    print("""
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║            🤖 AUTONOMOUS AGENT GENERATOR & DEPLOYER 🤖                         ║
║                                                                                ║
║     Automatically create, configure, and deploy agents to Railway Cloud       ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
    """)
    
    generator = AutonomousAgentGenerator()
    
    # Interactive mode
    print("\n📋 Agent Configuration:")
    agent_name = input("Agent Name (e.g., 'fast-scanner-01'): ").strip()
    if not agent_name:
        agent_name = f"auto-agent-{int(time.time())}"
    
    agent_type = input("Agent Type [fast/ultra/standard] (default: fast): ").strip() or "fast"
    
    scan_interval_input = input("Scan Interval in seconds (default: 12): ").strip()
    scan_interval = int(scan_interval_input) if scan_interval_input else 12
    
    auto_deploy_input = input("Auto-deploy to Railway? [Y/n]: ").strip().lower()
    auto_deploy = auto_deploy_input != 'n'
    
    # Generate and deploy
    config = generator.create_and_deploy_agent(
        agent_name=agent_name,
        agent_type=agent_type,
        scan_interval=scan_interval,
        auto_deploy=auto_deploy
    )
    
    print(f"\n✅ Process complete!")

if __name__ == "__main__":
    main()
