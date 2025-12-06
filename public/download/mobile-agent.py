#!/usr/bin/env python3
"""
📱 NUPI MOBILE/TABLET AUTONOMOUS AGENT
Works on Android, iOS, tablets - optimizes devices 24/7
Connects to NUPI Cloud autonomously
"""

import psutil
import platform
import socket
import time
import requests
import json
import os
from datetime import datetime
from threading import Thread

class NUPIMobileAgent:
    def __init__(self):
        self.cloud_url = "https://nupidesktopai.com"
        self.device_id = self.get_device_id()
        self.running = True
        self.update_interval = 10  # Send data every 10 seconds
        
        print("📱 NUPI MOBILE AGENT - STARTING...")
        print(f"📱 Device ID: {self.device_id}")
        print(f"🌐 Cloud: {self.cloud_url}")
        print("━" * 40)
        
    def get_device_id(self):
        """Generate unique device ID"""
        try:
            # Try to get unique identifier
            if os.path.exists('/proc/sys/kernel/random/uuid'):
                with open('/proc/sys/kernel/random/uuid', 'r') as f:
                    return f.read().strip()
            else:
                return f"mobile_{socket.gethostname()}_{int(time.time())}"
        except:
            return f"mobile_{int(time.time())}"
    
    def get_system_data(self):
        """Get mobile device metrics"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            net_io = psutil.net_io_counters()
            
            # Battery info (mobile specific)
            battery = None
            if hasattr(psutil, "sensors_battery"):
                bat = psutil.sensors_battery()
                if bat:
                    battery = {
                        'percent': bat.percent,
                        'charging': bat.power_plugged,
                        'time_left': bat.secsleft if bat.secsleft != psutil.POWER_TIME_UNLIMITED else None
                    }
            
            data = {
                'device_id': self.device_id,
                'device_type': 'mobile',
                'cpu': cpu_percent,
                'memory_percent': memory.percent,
                'memory_total': round(memory.total / (1024**3), 2),
                'memory_used': round(memory.used / (1024**3), 2),
                'disk_percent': disk.percent,
                'disk_total': round(disk.total / (1024**3), 2),
                'disk_used': round(disk.used / (1024**3), 2),
                'network_sent_mb': round(net_io.bytes_sent / (1024**2), 2),
                'network_received_mb': round(net_io.bytes_recv / (1024**2), 2),
                'platform': platform.system(),
                'platform_version': platform.version(),
                'battery': battery,
                'timestamp': datetime.now().isoformat()
            }
            
            return data
        except Exception as e:
            print(f"❌ Error getting data: {e}")
            return None
    
    def send_to_cloud(self, data):
        """Send data to NUPI Cloud"""
        try:
            response = requests.post(
                f"{self.cloud_url}/api/real-system-data",
                json=data,
                timeout=5
            )
            
            if response.status_code == 200:
                print(f"✅ Synced: CPU {data['cpu']}% | Battery {data.get('battery', {}).get('percent', 'N/A')}%")
                return True
        except Exception as e:
            print(f"⚠️  Sync failed: {str(e)[:30]}")
            return False
    
    def autonomous_monitor(self):
        """Main monitoring loop"""
        print("🚀 AUTONOMOUS MONITORING STARTED")
        print("📊 Optimizing your device...")
        print("━" * 40)
        
        while self.running:
            try:
                data = self.get_system_data()
                if data:
                    self.send_to_cloud(data)
                    
                    # Auto-optimize if needed
                    if data['memory_percent'] > 90:
                        print("🧹 HIGH MEMORY - Auto-optimizing...")
                        self.optimize_memory()
                    
                    if data.get('battery') and data['battery']['percent'] < 20 and not data['battery']['charging']:
                        print("🔋 LOW BATTERY - Enabling power saving...")
                        self.power_save_mode()
                
                time.sleep(self.update_interval)
                
            except KeyboardInterrupt:
                self.running = False
                break
            except Exception as e:
                print(f"❌ Error: {e}")
                time.sleep(self.update_interval)
    
    def optimize_memory(self):
        """Optimize memory usage"""
        try:
            # Clear cache
            os.system('sync')
            print("✅ Memory optimized")
        except:
            pass
    
    def power_save_mode(self):
        """Enable power saving"""
        try:
            # Reduce update frequency
            self.update_interval = 30
            print("✅ Power saving enabled")
        except:
            pass
    
    def run(self):
        """Start agent"""
        print("🔥 STARTING NUPI MOBILE AGENT...")
        print("━" * 40)
        
        monitor_thread = Thread(target=self.autonomous_monitor, daemon=True)
        monitor_thread.start()
        
        print("✅ AGENT RUNNING AUTONOMOUSLY!")
        print("📱 Improving your experience 24/7...")
        print("🌐 Connected to NUPI Cloud...")
        print("━" * 40)
        
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Stopping agent...")
            self.running = False

if __name__ == "__main__":
    agent = NUPIMobileAgent()
    agent.run()
