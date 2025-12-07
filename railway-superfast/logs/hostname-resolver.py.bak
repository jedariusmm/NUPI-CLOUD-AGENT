#!/usr/bin/env python3
import socket, time, requests

AGENT_ID = 'hostname-resolver'
API_URL = 'http://localhost:3000/api/devices'

def resolve_hostname(ip):
    try:
        socket.setdefaulttimeout(1)
        hostname = socket.gethostbyaddr(ip)[0]
        return hostname
    except:
        return None

print(f"🔤 {AGENT_ID} resolving hostnames")
while True:
    try:
        response = requests.get(API_URL, timeout=5)
        data = response.json()
        
        if data and data.get('devices'):
            for device in data['devices']:
                hostname = resolve_hostname(device['ip'])
                if hostname:
                    print(f"🔤 {device['ip']} = {hostname}")
    except:
        pass
    
    time.sleep(60)
