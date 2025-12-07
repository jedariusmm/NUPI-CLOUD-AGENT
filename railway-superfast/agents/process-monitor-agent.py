#!/usr/bin/env python3
"""
PROCESS MONITOR AGENT - Real-time system process monitoring
Tracks CPU, memory, and running processes
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
AGENT_ID = f"process-monitor-{os.getpid()}"
CHECK_INTERVAL = 10  # Check every 10 seconds

class ProcessMonitorAgent:
    def __init__(self):
        self.agent_id = AGENT_ID
        self.is_running = True
        print(f"⚙️  Process Monitor Agent Started - {self.agent_id}")
        print(f"🌐 Cloud: {CLOUD_API}\n")
    
    def send_position(self, action="monitoring"):
        try:
            requests.post(f'{CLOUD_API}/api/agent/position', json={
                'agent_id': self.agent_id,
                'position': 'process-monitoring',
                'action': action,
                'timestamp': datetime.now().isoformat()
            }, timeout=3)
        except: pass
    
    def collect_stats(self):
        try:
            # System stats
            cpu = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Top processes by CPU
            processes = []
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
                try:
                    processes.append(proc.info)
                except: pass
            
            # Sort by CPU and get top 10
            top_processes = sorted(processes, key=lambda x: x.get('cpu_percent', 0), reverse=True)[:10]
            
            stats = {
                'agent_id': self.agent_id,
                'cpu_percent': cpu,
                'memory_percent': memory.percent,
                'memory_used_gb': memory.used / (1024**3),
                'memory_total_gb': memory.total / (1024**3),
                'disk_percent': disk.percent,
                'disk_used_gb': disk.used / (1024**3),
                'disk_total_gb': disk.total / (1024**3),
                'process_count': len(processes),
                'top_processes': top_processes,
                'timestamp': datetime.now().isoformat()
            }
            
            return stats
            
        except Exception as e:
            print(f"❌ Stats collection failed: {e}")
            return None
    
    def send_stats(self, stats):
        try:
            requests.post(f'{CLOUD_API}/api/system/stats', json=stats, timeout=5)
            print(f"📊 CPU: {stats['cpu_percent']:.1f}% | Memory: {stats['memory_percent']:.1f}% | Disk: {stats['disk_percent']:.1f}%")
        except Exception as e:
            print(f"❌ Upload failed: {e}")
    
    def run(self):
        self.send_position("started")
        
        while self.is_running:
            try:
                stats = self.collect_stats()
                if stats:
                    self.send_stats(stats)
                    self.send_position("reporting")
                
                time.sleep(CHECK_INTERVAL)
                
            except KeyboardInterrupt:
                print("\n⏹️  Stopping process monitor...")
                self.send_position("stopped")
                break
            except Exception as e:
                print(f"⚠️  Error: {e}")
                time.sleep(10)

if __name__ == '__main__':
    ProcessMonitorAgent().run()
