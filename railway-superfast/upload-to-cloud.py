#!/usr/bin/env python3
"""
Upload harvested data to NUPI Cloud Agent API
"""

import json
import requests
import sys
from datetime import datetime

CLOUD_API = 'https://nupidesktopai.com/api/devices'
API_KEY = 'nupi-cloud-agent-2024'

def upload_harvest_data(json_file):
    """Upload device data to cloud API"""
    
    print(f"📤 Loading data from {json_file}...")
    
    # Load the harvested data
    with open(json_file, 'r') as f:
        data = json.load(f)
    
    print(f"✅ Loaded {data['total_devices']} devices")
    
    # Prepare payload for API
    payload = {
        'agent_id': 'deep-harvester-001',
        'scan_time': data['scan_time'],
        'network': data['network'],
        'total_devices': data['total_devices'],
        'devices': []
    }
    
    # Format device data
    for ip, device in data['devices'].items():
        device_info = {
            'ip': ip,
            'hostname': device['primary_hostname'],
            'hostnames': device.get('hostnames', []),
            'mac': device.get('mac_address', 'Unknown'),
            'vendor': device.get('vendor', 'Unknown'),
            'device_type': device.get('device_type', 'Unknown'),
            'open_ports': len(device.get('open_ports', [])),
            'services': [p['service'] for p in device.get('open_ports', [])],
            'last_seen': device.get('scan_timestamp', ''),
        }
        
        # Add Roku data if available
        if 'roku' in device.get('services', {}):
            roku = device['services']['roku']
            device_info['roku'] = {
                'model': roku.get('model', 'Unknown'),
                'serial': roku.get('serial', 'Unknown'),
                'version': roku.get('software_version', 'Unknown'),
                'friendly_name': roku.get('friendly_name', 'Unknown'),
                'apps_installed': roku.get('app_count', 0),
                'active_app': roku.get('active_app', 'None')
            }
        
        # Add HTTP data if available
        if 'http' in device.get('services', {}):
            http = device['services']['http']
            device_info['http'] = {
                'server': http.get('server', 'Unknown'),
                'page_title': http.get('page_title', ''),
                'accessible_paths': http.get('accessible_paths', [])
            }
        
        payload['devices'].append(device_info)
    
    print(f"\n📡 Uploading to NUPI Cloud API...")
    print(f"   URL: {CLOUD_API}")
    
    try:
        response = requests.post(
            CLOUD_API,
            json=payload,
            headers={
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json'
            },
            timeout=30
        )
        
        if response.ok:
            print(f"✅ SUCCESS! Data uploaded to cloud")
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return True
        else:
            print(f"❌ Upload failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error uploading: {e}")
        return False

if __name__ == '__main__':
    json_file = sys.argv[1] if len(sys.argv) > 1 else 'deep-harvest-20251207-122729.json'
    
    print(f"""
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║        📤 UPLOAD TO NUPI CLOUD AGENT 📤                 ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
""")
    
    success = upload_harvest_data(json_file)
    
    if success:
        print(f"\n✅ Data now visible at: https://nupidesktopai.com")
        print(f"   Check the visualizer page!")
    else:
        print(f"\n⚠️  Upload failed - check API endpoint")
