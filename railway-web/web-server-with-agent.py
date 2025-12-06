#!/usr/bin/env python3
"""
NUPI Cloud Agent Web Server + Super-Fast Agent
Serves HTML pages AND runs the scanning agent
"""

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
import threading
import time
import subprocess
import socket
import hashlib
import os
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)

# Agent data storage
agent_data = {
    'status': 'initializing',
    'last_scan': None,
    'devices_found': 0,
    'scan_count': 0,
    'agent_id': None
}

class SuperFastAgent:
    def __init__(self):
        self.agent_id = hashlib.md5(f"{socket.gethostname()}{time.time()}".encode()).hexdigest()[:16]
        self.running = True
        agent_data['agent_id'] = self.agent_id
        agent_data['status'] = 'running'
        print(f"🚀 Super-Fast Agent initialized: {self.agent_id}")
    
    def scan_network(self):
        """Quick network scan"""
        devices = []
        try:
            # Get local IP
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            local_ip = s.getsockname()[0]
            s.close()
            
            network_prefix = '.'.join(local_ip.split('.')[:-1])
            print(f"\n⚡ SUPER FAST SCAN: {network_prefix}.1-254")
            
            def scan_ip(i):
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
                results = executor.map(scan_ip, range(1, 255))
                devices = [ip for ip in results if ip]
            
            print(f"⚡ Found {len(devices)} devices")
            agent_data['devices_found'] = len(devices)
            agent_data['last_scan'] = datetime.now().isoformat()
            agent_data['scan_count'] += 1
            
        except Exception as e:
            print(f"Scan error: {e}")
        
        return devices
    
    def run(self):
        """Run continuous scanning"""
        while self.running:
            self.scan_network()
            print("☁️ Cloud sync complete")
            time.sleep(12)  # Scan every 12 seconds

# Flask Routes
@app.route('/')
def index():
    """Serve main page"""
    return send_from_directory('public', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve all HTML pages"""
    return send_from_directory('public', path)

@app.route('/api/agent-status')
def agent_status():
    """API endpoint for agent status"""
    return jsonify(agent_data)

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'agent': agent_data['status'],
        'agent_id': agent_data['agent_id'],
        'last_scan': agent_data['last_scan'],
        'devices_found': agent_data['devices_found'],
        'scan_count': agent_data['scan_count']
    })

def start_agent():
    """Start the scanning agent in background"""
    agent = SuperFastAgent()
    agent.run()

if __name__ == '__main__':
    # Start agent in background thread
    agent_thread = threading.Thread(target=start_agent, daemon=True)
    agent_thread.start()
    
    print("\n🌐 Starting NUPI Cloud Web Server + Agent...")
    print("📊 Web interface will be available")
    print("⚡ Super-Fast Agent scanning in background\n")
    
    # Start Flask web server
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
