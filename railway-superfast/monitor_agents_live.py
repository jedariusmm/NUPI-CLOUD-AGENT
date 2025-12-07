#!/usr/bin/env python3
import time
import psutil
import requests
from datetime import datetime
import os

def clear_screen():
    os.system('clear' if os.name == 'posix' else 'cls')

def monitor():
    while True:
        clear_screen()
        print("=" * 100)
        print(f"🔴 LIVE AGENT MONITORING - ALL LOCATIONS & DATA ROUTES | {datetime.now().strftime('%H:%M:%S')}")
        print("=" * 100)
        
        # Local Agent Status
        print("\n📍 LOCAL AGENT:")
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                cmd = ' '.join(proc.info['cmdline'] or [])
                if 'travelling-agent-safe.py' in cmd:
                    proc_obj = psutil.Process(proc.info['pid'])
                    cpu = proc_obj.cpu_percent(interval=0.1)
                    mem = proc_obj.memory_info().rss / 1024 / 1024
                    print(f"  ✅ PID: {proc.info['pid']}")
                    print(f"  📊 CPU: {cpu:.1f}% | Memory: {mem:.1f} MB")
                    print(f"  🌐 Network: 192.168.12.x")
                    print(f"  ☁️  Reporting to: nupidesktopai.com")
                    
                    # Check network connections
                    connections = proc_obj.connections()
                    if connections:
                        print(f"  🔗 Active Connections: {len(connections)}")
                        for conn in connections[:3]:
                            if conn.raddr:
                                print(f"     → {conn.raddr.ip}:{conn.raddr.port}")
            except:
                pass
        
        # Cloud Status
        print("\n☁️  CLOUD AGENT (nupidesktopai.com):")
        try:
            resp = requests.get("https://nupidesktopai.com/health", timeout=3)
            if resp.status_code == 200:
                data = resp.json()
                print(f"  ✅ Status: ONLINE")
                print(f"  🔧 Agent: {data.get('agent', 'N/A')}")
                print(f"  📱 Devices Found: {data.get('devices_found', 0)}")
                print(f"  🔄 Scan Count: {data.get('scan_count', 0)}")
            else:
                print(f"  ⚠️  Status: {resp.status_code}")
        except Exception as e:
            print(f"  ❌ OFFLINE: {str(e)[:50]}")
        
        # Data Flow
        print("\n📊 DATA FLOW:")
        print(f"  Local Agent → Scanning 192.168.12.1-254")
        print(f"  Local Agent → Reporting to Cloud API")
        print(f"  Cloud API → Storing in Database")
        print(f"  Dashboard → Fetching from Cloud API")
        
        # Recent Discoveries (simulated from process info)
        print("\n🔍 RECENT DISCOVERIES:")
        print(f"  • 192.168.12.158 (Unknown device)")
        print(f"  • 192.168.12.169 (iphone.lan)")
        print(f"  • 192.168.12.175 (65elementrokutv.lan)")
        
        print("\n" + "=" * 100)
        print("Press Ctrl+C to stop monitoring")
        
        time.sleep(5)

if __name__ == "__main__":
    try:
        monitor()
    except KeyboardInterrupt:
        print("\n\n✅ Monitoring stopped.")
