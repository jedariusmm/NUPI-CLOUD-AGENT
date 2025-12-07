#!/usr/bin/env python3
import subprocess, time, psutil
from datetime import datetime

AGENT_ID = 'network-monitor'

print(f"📊 {AGENT_ID} monitoring network statistics")
while True:
    try:
        # Network stats
        net = psutil.net_io_counters()
        print(f"📊 Bytes sent: {net.bytes_sent}, Bytes recv: {net.bytes_recv}")
        
        # Active connections
        result = subprocess.run(['netstat', '-an'], capture_output=True, text=True, timeout=5)
        connections = len([l for l in result.stdout.split('\n') if '192.168.12' in l])
        print(f"📊 Active connections: {connections}")
    except:
        pass
    
    time.sleep(30)
