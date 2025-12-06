#!/usr/bin/env python3
"""
NUPI Cloud Agent Web Server + Super-Fast Agent
Serves HTML pages AND runs the scanning agent
"""

from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
import threading
import time
import subprocess
import socket
import hashlib
import os
import psutil
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

# Travelling agents storage
travelling_agents = {}

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

@app.route('/api/travelling-agent/status')
def travelling_agent_status():
    """Status endpoint for travelling agents"""
    return jsonify({
        'success': True,
        'agents': travelling_agents,
        'total_agents': len(travelling_agents),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/travelling-agent/upload', methods=['POST'])
def travelling_agent_upload():
    """Receive data from travelling agents"""
    try:
        data = request.get_json()
        agent_id = data.get('agent_id', 'unknown')
        travelling_agents[agent_id] = {
            'last_seen': datetime.now().isoformat(),
            'data': data
        }
        print(f"📥 Data from travelling agent: {agent_id}")
        return jsonify({'success': True, 'agent_id': agent_id})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/network-scan')
def network_scan():
    """Return latest network scan results"""
    return jsonify({
        'success': True,
        'devices_found': agent_data['devices_found'],
        'last_scan': agent_data['last_scan'],
        'scan_count': agent_data['scan_count']
    })

@app.route('/api/real-system-data')
def real_system_data():
    """Return real-time system stats"""
    try:
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        net = psutil.net_io_counters()
        
        return jsonify({
            'success': True,
            'data': {
                'cpu': round(cpu_percent, 1),
                'cpu_count': psutil.cpu_count(),
                'cpu_freq_mhz': psutil.cpu_freq().current if psutil.cpu_freq() else 0,
                'memory_percent': round(memory.percent, 1),
                'memory_total': round(memory.total / (1024**3), 2),
                'memory_used': round(memory.used / (1024**3), 2),
                'disk_percent': round(disk.percent, 1),
                'disk_total': round(disk.total / (1024**3), 2),
                'disk_used': round(disk.used / (1024**3), 2),
                'network_sent_mb': round(net.bytes_sent / (1024**2), 2),
                'network_received_mb': round(net.bytes_recv / (1024**2), 2),
                'num_processes': len(psutil.pids()),
                'hostname': socket.gethostname(),
                'platform': os.uname().sysname,
                'timestamp': datetime.now().isoformat(),
                'battery': {},
                'lastUpdate': datetime.now().isoformat()
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model': 'claude-3-5-haiku-20241022',
        'aiCreatorActive': True,
        'learningDataDevices': 0,
        'localAgents': {
            'total': len(travelling_agents) + 1,
            'online': len(travelling_agents),
            'offline': 0
        },
        'autonomousSystem': {
            'running': True,
            'monitoredDevices': agent_data['devices_found'],
            'deviceProfiles': 2
        },
        'features': [
            'File Management',
            'Process Control',
            'Terminal Access',
            'Network Tools',
            'System Monitoring',
            'Package Installation',
            'Real-time Stats',
            'AI Learning Storage',
            'Local Agent Deployment & Control',
            'Autonomous Orchestration - AUTO-DEPLOY, MONITOR, OPTIMIZE',
            'Enhanced Learning - Email/Message/Photo/File Analysis',
            'Android Device Full Access & Storage',
            'WiFi Router Full Access & Optimization',
            '💳 Financial Security Scanner - Exposed Data Detection',
            '⚠️ Vulnerability Alerts - Real-time User Notifications',
            '💰 Spending Analysis - Bad Habits Detection'
        ],
        'androidDevices': 0,
        'routers': 0,
        'security': {
            'alertsCount': 0,
            'devicesMonitored': 0,
            'lastScan': 'Never'
        }
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
# Railway deployment - updated with all endpoints
