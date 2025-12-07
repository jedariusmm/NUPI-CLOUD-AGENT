#!/usr/bin/env python3
"""
Connect Local Desktop Agent to NUPI Cloud
This script connects your local DESKTOP-8LT2D20 agent to the cloud
"""

import socket
import requests
import time
import platform
from datetime import datetime

CLOUD_URL = 'https://nupidesktopai.com'

def get_local_ip():
    """Get local IP address"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "Unknown"

def connect_to_cloud():
    """Connect local agent to cloud"""
    agent_id = f"desktop-agent-{socket.gethostname()}"
    location = get_local_ip()
    
    print(f"\n{'='*60}")
    print(f"🖥️  Connecting Local Desktop Agent to NUPI Cloud")
    print(f"{'='*60}")
    print(f"Agent ID: {agent_id}")
    print(f"Location: {location}")
    print(f"Cloud: {CLOUD_URL}")
    print(f"{'='*60}\n")
    
    try:
        # Connect to cloud
        response = requests.post(
            f'{CLOUD_URL}/api/traveling-agent',
            json={
                'agent_id': agent_id,
                'type': 'desktop',
                'location': location,
                'hostname': socket.gethostname(),
                'platform': platform.system(),
                'timestamp': datetime.utcnow().isoformat()
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ Successfully connected to NUPI Cloud!")
                print(f"   Agent registered: {agent_id}")
                print(f"   Status: Connected\n")
                return True
            else:
                print(f"❌ Connection failed: {data.get('error', 'Unknown error')}\n")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}\n")
            return False
            
    except Exception as e:
        print(f"❌ Connection error: {e}\n")
        return False

def send_heartbeat():
    """Send heartbeat to cloud"""
    agent_id = f"desktop-agent-{socket.gethostname()}"
    location = get_local_ip()
    
    try:
        response = requests.post(
            f'{CLOUD_URL}/api/agent/location',
            json={
                'agent_id': agent_id,
                'location': location,
                'device': socket.gethostname(),
                'status': 'active',
                'timestamp': datetime.utcnow().isoformat()
            },
            timeout=5
        )
        
        if response.status_code == 200:
            print(f"💓 Heartbeat sent: {location}")
            return True
        else:
            print(f"⚠️  Heartbeat failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"⚠️  Heartbeat error: {e}")
        return False

def main():
    """Main connection loop"""
    # Initial connection
    if not connect_to_cloud():
        print("❌ Failed to connect. Retrying in 10 seconds...")
        time.sleep(10)
        if not connect_to_cloud():
            print("❌ Connection failed. Exiting.")
            return
    
    # Keep connection alive with heartbeats
    print(f"🔄 Maintaining connection with heartbeats every 30 seconds...")
    print(f"   Press Ctrl+C to stop\n")
    
    cycle = 0
    try:
        while True:
            time.sleep(30)
            cycle += 1
            print(f"\n[Cycle {cycle}] ", end='')
            send_heartbeat()
            
    except KeyboardInterrupt:
        print(f"\n\n🛑 Agent disconnected by user")

if __name__ == '__main__':
    main()
