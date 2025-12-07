#!/usr/bin/env python3
import subprocess, socket, time, requests, json
from datetime import datetime

NETWORK = '192.168.12'
START = 1
END = 42
API_URL = 'http://localhost:3000/api/devices'
AGENT_ID = 'deep-scanner-2'

def scan_device(ip):
    try:
        # Ping check
        if subprocess.run(['ping', '-c', '1', '-W', '1', ip], 
                         capture_output=True, timeout=2).returncode != 0:
            return None
        
        # Get hostname
        try:
            hostname = socket.gethostbyaddr(ip)[0]
        except:
            hostname = f"Device-{ip.split('.')[-1]}"
        
        # Get MAC from ARP
        result = subprocess.run(['arp', '-a', ip], capture_output=True, text=True, timeout=1)
        import re
        mac_match = re.search(r'([0-9a-f:]{17})', result.stdout, re.I)
        mac = mac_match.group(1) if mac_match else 'Unknown'
        
        return {
            'ip': ip,
            'hostname': hostname,
            'mac': mac,
            'agent_id': AGENT_ID,
            'scan_time': datetime.now().isoformat()
        }
    except:
        return None

print(f"🔍 {AGENT_ID} scanning {NETWORK}.{START}-{END}")
while True:
    devices = []
    for i in range(START, END + 1):
        ip = f"{NETWORK}.{i}"
        device = scan_device(ip)
        if device:
            devices.append(device)
            print(f"✅ Found: {ip}")
    
    # Upload to API
    try:
        requests.post(API_URL, json={'agent_id': AGENT_ID, 'devices': devices}, timeout=5)
        print(f"📤 Uploaded {len(devices)} devices")
    except:
        pass
    
    time.sleep(300)  # 5 minutes
