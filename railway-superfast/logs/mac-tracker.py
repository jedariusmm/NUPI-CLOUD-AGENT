#!/usr/bin/env python3
import subprocess, time, re
from datetime import datetime

AGENT_ID = 'mac-tracker'

def scan_arp():
    result = subprocess.run(['arp', '-a'], capture_output=True, text=True)
    macs = []
    for line in result.stdout.split('\n'):
        if '192.168.12' in line:
            ip_match = re.search(r'(\d+\.\d+\.\d+\.\d+)', line)
            mac_match = re.search(r'([0-9a-f:]{17})', line, re.I)
            if ip_match and mac_match:
                macs.append({'ip': ip_match.group(1), 'mac': mac_match.group(1)})
    return macs

print(f"🏷️  {AGENT_ID} monitoring ARP table")
while True:
    macs = scan_arp()
    print(f"🏷️  Tracking {len(macs)} MAC addresses")
    time.sleep(30)
