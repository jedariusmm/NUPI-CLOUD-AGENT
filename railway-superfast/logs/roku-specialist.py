#!/usr/bin/env python3
import requests, time, json
from datetime import datetime

AGENT_ID = 'roku-specialist'
API_URL = 'http://nupidesktopai.com/api/devices'

def probe_roku(ip):
    try:
        response = requests.get(f'http://{ip}:8060/query/device-info', timeout=2)
        if response.status_code == 200:
            import xml.etree.ElementTree as ET
            root = ET.fromstring(response.text)
            return {
                'model': root.findtext('model-name'),
                'serial': root.findtext('serial-number'),
                'version': root.findtext('software-version'),
                'friendly_name': root.findtext('user-device-name')
            }
    except:
        pass
    return None

print(f"📺 {AGENT_ID} active - monitoring Roku devices")
while True:
    try:
        response = requests.get(API_URL, timeout=5)
        data = response.json()
        
        if data and data.get('devices'):
            for device in data['devices']:
                if 'roku' in device.get('hostname', '').lower() or device.get('open_ports', 0) > 0:
                    roku_data = probe_roku(device['ip'])
                    if roku_data:
                        print(f"📺 {device['ip']}: {roku_data['friendly_name']}")
    except:
        pass
    
    time.sleep(120)  # Check every 2 minutes
