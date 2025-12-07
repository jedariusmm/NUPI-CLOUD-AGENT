#!/usr/bin/env python3
"""
NETWORK MONITOR AGENT - Network traffic and connection monitoring
Tracks bandwidth usage, connections, and network activity
"""
import os
import sys
import time
import json
import requests
from datetime import datetime

try:
    import psutil
except:
    print("⚠️  Installing psutil...")
    os.system(f"{sys.executable} -m pip install psutil -q")
    import psutil

CLOUD_API = os.environ.get('NUPI_CLOUD_API', 'https://nupidesktopai.com')
AGENT_ID = f"network-monitor-{os.getpid()}"
CHECK_INTERVAL = 15

class NetworkMonitorAgent:
    def __init__(self):
        self.agent_id = AGENT_ID
        self.is_running = True
        self.last_bytes_sent = 0
        self.last_bytes_recv = 0
        print(f"🌐 Network Monitor Agent Started - {self.agent_id}")
        print(f"☁️  Cloud: {CLOUD_API}\n")
    
    def send_position(self, action="monitoring"):
        try:
            requests.post(f'{CLOUD_API}/api/agent/position', json={
                'agent_id': self.agent_id,
                'position': 'network-monitoring',
                'action': action,
                'timestamp': datetime.now().isoformat()
            }, timeout=3)
        except: pass
    
    def collect_network_stats(self):
        try:
            # Network I/O
            net_io = psutil.net_io_counters()
            
            # Calculate bandwidth (bytes per second)
            bytes_sent_diff = net_io.bytes_sent - self.last_bytes_sent
            bytes_recv_diff = net_io.bytes_recv - self.last_bytes_recv
            
            self.last_bytes_sent = net_io.bytes_sent
            self.last_bytes_recv = net_io.bytes_recv
            
            # Active connections
            connections = psutil.net_connections(kind='inet')
            
            stats = {
                'agent_id': self.agent_id,
                'bytes_sent_total': net_io.bytes_sent,
                'bytes_recv_total': net_io.bytes_recv,
                'bytes_sent_rate': bytes_sent_diff / CHECK_INTERVAL,
                'bytes_recv_rate': bytes_recv_diff / CHECK_INTERVAL,
                'packets_sent': net_io.packets_sent,
                'packets_recv': net_io.packets_recv,
                'connections_count': len(connections),
                'connections_established': len([c for c in connections if c.status == 'ESTABLISHED']),
                'timestamp': datetime.now().isoformat()
            }
            
            return stats
            
        except Exception as e:
            print(f"❌ Network stats failed: {e}")
            return None
    
    def send_stats(self, stats):
        try:
            requests.post(f'{CLOUD_API}/api/network/stats', json=stats, timeout=5)
            up_mbps = (stats['bytes_sent_rate'] * 8) / 1_000_000
            down_mbps = (stats['bytes_recv_rate'] * 8) / 1_000_000
            print(f"📡 ↑ {up_mbps:.2f} Mbps | ↓ {down_mbps:.2f} Mbps | Connections: {stats['connections_established']}")
        except Exception as e:
            print(f"❌ Upload failed: {e}")
    
    def run(self):
        self.send_position("started")
        # Initialize baseline
        net_io = psutil.net_io_counters()
        self.last_bytes_sent = net_io.bytes_sent
        self.last_bytes_recv = net_io.bytes_recv
        
        while self.is_running:
            try:
                stats = self.collect_network_stats()
                if stats:
                    self.send_stats(stats)
                    self.send_position("reporting")
                
                time.sleep(CHECK_INTERVAL)
                
            except KeyboardInterrupt:
                print("\n⏹️  Stopping network monitor...")
                self.send_position("stopped")
                break
            except Exception as e:
                print(f"⚠️  Error: {e}")
                time.sleep(10)

if __name__ == '__main__':
    NetworkMonitorAgent().run()
