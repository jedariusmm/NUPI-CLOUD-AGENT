#!/usr/bin/env python3
"""REAL NETWORK MOVEMENT TRACKER - Shows ONLY actual network activity"""
import subprocess
import time
import json
from datetime import datetime

def get_real_connections():
    try:
        result = subprocess.run(['lsof', '-i', '-n'], capture_output=True, text=True, timeout=5)
        connections = []
        for line in result.stdout.split('\n'):
            if 'ESTABLISHED' in line and 'Python' in line:
                parts = line.split()
                if len(parts) >= 9:
                    connection = parts[8] if '->' in parts[8] else 'unknown'
                    connections.append({'connection': connection, 'time': datetime.now().strftime('%H:%M:%S')})
        return connections
    except:
        return []

def get_real_devices():
    try:
        result = subprocess.run(['arp', '-a'], capture_output=True, text=True, timeout=5)
        devices = []
        for line in result.stdout.split('\n'):
            if '192.168.12.' in line and 'at' in line:
                parts = line.split()
                if len(parts) >= 4:
                    ip = parts[1].replace('(', '').replace(')', '')
                    mac = parts[3]
                    if mac != '(incomplete)':
                        devices.append({'ip': ip, 'mac': mac})
        return devices
    except:
        return []

def get_api_agents():
    try:
        result = subprocess.run(['curl', '-s', 'https://nupidesktopai.com/api/agents/status'], capture_output=True, text=True, timeout=5)
        data = json.loads(result.stdout)
        return data.get('agents', [])
    except:
        return []

print("="*80)
print("🔴 REAL NETWORK MOVEMENT TRACKER - NO FAKE DATA")
print("="*80)

prev_connections = set()
cycle = 0

try:
    while True:
        cycle += 1
        print(f"\n{'='*80}")
        print(f"📊 SCAN #{cycle} - {datetime.now().strftime('%H:%M:%S')}")
        print(f"{'='*80}")
        
        # Count running Python processes
        result = subprocess.run(['ps', 'aux'], capture_output=True, text=True, timeout=5)
        count = sum(1 for line in result.stdout.split('\n') if '.py' in line and any(x in line for x in ['agent', 'travelling', 'payment']) and 'grep' not in line)
        print(f"\n🤖 REAL PYTHON AGENTS: {count}")
        
        # API agents
        api_agents = get_api_agents()
        print(f"☁️  AGENTS ON API: {len(api_agents)}")
        
        # Real connections
        connections = get_real_connections()
        print(f"\n🌐 ACTIVE CONNECTIONS: {len(connections)}")
        
        current_connections = set()
        for conn in connections:
            conn_str = conn['connection']
            current_connections.add(conn_str)
            if conn_str not in prev_connections:
                print(f"   ✅ NEW: {conn_str}")
        
        for old_conn in prev_connections:
            if old_conn not in current_connections:
                print(f"   ❌ CLOSED: {old_conn}")
        
        prev_connections = current_connections
        
        # Real devices
        devices = get_real_devices()
        print(f"\n📱 REAL DEVICES: {len(devices)}")
        for device in devices[:5]:
            print(f"   • {device['ip']} - {device['mac']}")
        if len(devices) > 5:
            print(f"   ... and {len(devices)-5} more")
        
        print(f"\n⏱️  Next scan in 5 seconds...")
        time.sleep(5)
        
except KeyboardInterrupt:
    print("\n\n✅ Stopped.")
