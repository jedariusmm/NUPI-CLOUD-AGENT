#!/usr/bin/env python3
"""
🤖 NUPI LOCAL DESKTOP AGENT - FULLY AUTONOMOUS
Runs completely autonomously on your Mac, syncing with NUPI Cloud Agent
Built for: Jedarius Maxwell
"""

import psutil
import platform
import socket
import time
import requests
import json
import subprocess
import os
from datetime import datetime
from threading import Thread
import signal
import sys

class NUPILocalAgent:
    def __init__(self):
        self.cloud_url = "https://nupidesktopai.com"
        self.local_url = "http://localhost:3000"
        self.running = True
        self.update_interval = 5  # Send data every 5 seconds
        self.hostname = socket.gethostname()
        self.platform = platform.system()
        
        print("🤖 NUPI LOCAL DESKTOP AGENT - STARTING...")
        print(f"📱 Hostname: {self.hostname}")
        print(f"💻 Platform: {self.platform}")
        print(f"🌐 Cloud URL: {self.cloud_url}")
        print(f"🔄 Update Interval: {self.update_interval}s")
        print("━" * 60)
        
    def get_system_data(self):
        """Get REAL system metrics from Mac"""
        try:
            # CPU Usage
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_count = psutil.cpu_count()
            cpu_freq = psutil.cpu_freq()
            
            # Memory Usage
            memory = psutil.virtual_memory()
            memory_total_gb = round(memory.total / (1024**3), 2)
            memory_used_gb = round(memory.used / (1024**3), 2)
            memory_percent = memory.percent
            
            # Disk Usage
            disk = psutil.disk_usage('/')
            disk_total_gb = round(disk.total / (1024**3), 2)
            disk_used_gb = round(disk.used / (1024**3), 2)
            disk_percent = disk.percent
            
            # Network Stats
            net_io = psutil.net_io_counters()
            network_sent_mb = round(net_io.bytes_sent / (1024**2), 2)
            network_received_mb = round(net_io.bytes_recv / (1024**2), 2)
            
            # Process Count
            num_processes = len(psutil.pids())
            
            # Battery (if laptop)
            battery_info = {}
            if hasattr(psutil, "sensors_battery"):
                battery = psutil.sensors_battery()
                if battery:
                    battery_info = {
                        'percent': battery.percent,
                        'plugged': battery.power_plugged,
                        'time_left': battery.secsleft if battery.secsleft != psutil.POWER_TIME_UNLIMITED else None
                    }
            
            data = {
                'cpu': cpu_percent,
                'cpu_count': cpu_count,
                'cpu_freq_mhz': cpu_freq.current if cpu_freq else None,
                'memory_percent': memory_percent,
                'memory_total': memory_total_gb,
                'memory_used': memory_used_gb,
                'disk_percent': disk_percent,
                'disk_total': disk_total_gb,
                'disk_used': disk_used_gb,
                'network_sent_mb': network_sent_mb,
                'network_received_mb': network_received_mb,
                'num_processes': num_processes,
                'hostname': self.hostname,
                'platform': self.platform,
                'timestamp': datetime.now().isoformat(),
                'battery': battery_info
            }
            
            return data
        except Exception as e:
            print(f"❌ Error getting system data: {e}")
            return None
    
    def send_to_cloud(self, data):
        """Send system data to NUPI Cloud Agent"""
        try:
            # Try cloud first
            response = requests.post(
                f"{self.cloud_url}/api/real-system-data",
                json=data,
                timeout=5
            )
            
            if response.status_code == 200:
                print(f"✅ Sent to CLOUD: CPU {data['cpu']}% | RAM {data['memory_percent']}% | Disk {data['disk_percent']}%")
                return True
        except Exception as e:
            print(f"⚠️  Cloud connection failed: {str(e)[:50]}")
            
        # Fallback to local server
        try:
            response = requests.post(
                f"{self.local_url}/api/real-system-data",
                json=data,
                timeout=2
            )
            if response.status_code == 200:
                print(f"✅ Sent to LOCAL: CPU {data['cpu']}% | RAM {data['memory_percent']}% | Disk {data['disk_percent']}%")
                return True
        except Exception as e:
            print(f"⚠️  Local connection failed: {str(e)[:50]}")
            
        return False
    
    def autonomous_monitor(self):
        """Main autonomous monitoring loop"""
        print("🚀 AUTONOMOUS MONITORING STARTED")
        print("🔄 Sending real-time system data to NUPI Cloud Agent...")
        print("━" * 60)
        
        consecutive_failures = 0
        
        while self.running:
            try:
                # Get system data
                data = self.get_system_data()
                
                if data:
                    # Send to cloud
                    success = self.send_to_cloud(data)
                    
                    if success:
                        consecutive_failures = 0
                    else:
                        consecutive_failures += 1
                        
                    # Alert if connection problems
                    if consecutive_failures >= 5:
                        print(f"⚠️  WARNING: {consecutive_failures} consecutive connection failures")
                        consecutive_failures = 0
                
                # Wait before next update
                time.sleep(self.update_interval)
                
            except KeyboardInterrupt:
                print("\n🛑 Stopping agent...")
                self.running = False
                break
            except Exception as e:
                print(f"❌ Error in monitor loop: {e}")
                time.sleep(self.update_interval)
    
    def autonomous_optimizer(self):
        """Autonomous system optimization (runs in background)"""
        print("⚡ AUTONOMOUS OPTIMIZER STARTED")
        
        while self.running:
            try:
                time.sleep(300)  # Check every 5 minutes
                
                # Get current stats
                data = self.get_system_data()
                if not data:
                    continue
                
                # Auto-optimize if needed
                if data['memory_percent'] > 85:
                    print("🧹 HIGH MEMORY USAGE DETECTED - Running cleanup...")
                    self.cleanup_memory()
                
                if data['disk_percent'] > 90:
                    print("🧹 HIGH DISK USAGE DETECTED - Running disk cleanup...")
                    self.cleanup_disk()
                    
            except Exception as e:
                print(f"❌ Error in optimizer: {e}")
    
    def cleanup_memory(self):
        """Clean up memory (safe operations)"""
        try:
            if self.platform == "Darwin":  # macOS
                # Purge inactive memory
                subprocess.run(['sudo', 'purge'], check=False, capture_output=True)
                print("✅ Memory purged")
        except Exception as e:
            print(f"⚠️  Memory cleanup error: {e}")
    
    def cleanup_disk(self):
        """Clean up disk space (safe operations)"""
        try:
            if self.platform == "Darwin":  # macOS
                # Clear system cache (safe)
                subprocess.run(['rm', '-rf', '~/Library/Caches/*'], shell=True, check=False)
                print("✅ Cache cleared")
        except Exception as e:
            print(f"⚠️  Disk cleanup error: {e}")
    
    def health_check(self):
        """Periodic health check and status report"""
        print("💚 HEALTH CHECK STARTED")
        
        while self.running:
            try:
                time.sleep(60)  # Check every minute
                
                # Test cloud connection
                try:
                    response = requests.get(f"{self.cloud_url}/api/health", timeout=5)
                    cloud_status = "✅ ONLINE" if response.status_code == 200 else "⚠️  DEGRADED"
                except:
                    cloud_status = "❌ OFFLINE"
                
                # System health
                data = self.get_system_data()
                if data:
                    health = "✅ HEALTHY"
                    if data['cpu'] > 90 or data['memory_percent'] > 95 or data['disk_percent'] > 95:
                        health = "⚠️  CRITICAL"
                    elif data['cpu'] > 70 or data['memory_percent'] > 85 or data['disk_percent'] > 90:
                        health = "⚠️  WARNING"
                    
                    print(f"💚 Health: {health} | Cloud: {cloud_status} | CPU: {data['cpu']}% | RAM: {data['memory_percent']}% | Disk: {data['disk_percent']}%")
                
            except Exception as e:
                print(f"❌ Health check error: {e}")
    
    def run(self):
        """Start all autonomous systems"""
        print("🔥 STARTING ALL AUTONOMOUS SYSTEMS...")
        print("━" * 60)
        
        # Start monitoring thread
        monitor_thread = Thread(target=self.autonomous_monitor, daemon=True)
        monitor_thread.start()
        
        # Start optimizer thread
        optimizer_thread = Thread(target=self.autonomous_optimizer, daemon=True)
        optimizer_thread.start()
        
        # Start health check thread
        health_thread = Thread(target=self.health_check, daemon=True)
        health_thread.start()
        
        print("✅ ALL SYSTEMS OPERATIONAL")
        print("━" * 60)
        print("🤖 NUPI LOCAL DESKTOP AGENT IS NOW FULLY AUTONOMOUS!")
        print("📊 Monitoring your Mac in real-time...")
        print("🌐 Syncing with NUPI Cloud Agent at nupidesktopai.com...")
        print("💡 Press Ctrl+C to stop the agent")
        print("━" * 60)
        
        # Keep main thread alive
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Shutting down NUPI Local Desktop Agent...")
            self.running = False
            time.sleep(2)
            print("✅ Agent stopped successfully")

def signal_handler(sig, frame):
    print('\n🛑 Received shutdown signal...')
    sys.exit(0)

if __name__ == "__main__":
    # Handle Ctrl+C gracefully
    signal.signal(signal.SIGINT, signal_handler)
    
    # Create and run agent
    agent = NUPILocalAgent()
    agent.run()
