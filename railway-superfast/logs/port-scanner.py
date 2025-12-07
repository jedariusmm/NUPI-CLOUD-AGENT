#!/usr/bin/env python3
import socket, time, requests, json
from datetime import datetime

AGENT_ID = 'port-scanner'
API_URL = 'http://nupidesktopai.com/api/devices'

COMMON_PORTS = {
    22: 'SSH', 80: 'HTTP', 443: 'HTTPS', 8060: 'Roku',
    445: 'SMB', 3389: 'RDP', 5353: 'mDNS', 8080: 'HTTP-Alt'
}

def scan_ports(ip):
    open_ports = []
    for port, service in COMMON_PORTS.items():
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(0.3)
        try:
            if sock.connect_ex((ip, port)) == 0:
                open_ports.append({'port': port, 'service': service})
        except:
            pass
        finally:
            sock.close()
    return open_ports

print(f"🔌 {AGENT_ID} active")
while True:
    try:
        # Get device list from API
        response = requests.get(API_URL, timeout=5)
        data = response.json()
        
        if data and data.get('devices'):
            for device in data['devices']:
                ip = device['ip']
                ports = scan_ports(ip)
                if ports:
                    print(f"🔌 {ip}: {len(ports)} open ports")
                    # Would update API with port data
    except:
        pass
    
    time.sleep(60)  # Scan every minute
