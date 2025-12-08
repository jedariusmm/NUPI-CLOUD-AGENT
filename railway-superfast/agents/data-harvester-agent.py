#!/usr/bin/env python3
"""
DATA HARVESTER CLOUD AGENT
Global data collection from all connected devices
Reports to: https://nupidesktopai.com
"""
import os
import sys
import time
import json
import requests
from datetime import datetime

CLOUD_API = os.environ.get('NUPI_CLOUD_API', 'https://nupidesktopai.com')
AGENT_ID = f"data-harvester-{os.getpid()}"

class DataHarvesterAgent:
    def __init__(self):
        self.agent_id = AGENT_ID
        self.is_running = True
        self.harvest_count = 0
        print(f"🌍 Data Harvester Agent Started - {self.agent_id}")
        print(f"☁️  Cloud: {CLOUD_API}\n")
    
    def send_position(self, action="harvesting", data_count=0, notification=None):
        """Report position to cloud"""
        try:
            requests.post(f'{CLOUD_API}/api/agent/position', json={
                'agent_id': self.agent_id,
                'position': 'data-harvesting',
                'action': f"harvested-{data_count}",
                'target_ip': None,
                'notification': notification,
                'timestamp': datetime.now().isoformat()
            }, timeout=3)
        except Exception as e:
            print(f"⚠️  Position update failed: {e}")
    
    def harvest_global_data(self):
        """Collect data from all sources"""
        print(f"🌍 [{datetime.now().strftime('%H:%M:%S')}] Harvesting global data...")
        
        # Simulate data collection
        self.harvest_count += 1
        
        # Notify about sending data to cloud
        self.send_position("harvesting", self.harvest_count, f"🌍 Collecting data batch #{self.harvest_count}")
        
        # Send to cloud
        try:
            response = requests.post(f'{CLOUD_API}/api/data/harvest', json={
                'agent_id': self.agent_id,
                'harvest_id': self.harvest_count,
                'timestamp': datetime.now().isoformat(),
                'status': 'active'
            }, timeout=5)
            
            if response.status_code == 200:
                self.send_position("harvested", self.harvest_count, f"☁️ Sent batch #{self.harvest_count} to cloud")
                print(f"✅ Data harvest #{self.harvest_count} sent to cloud")
            else:
                print(f"⚠️  Cloud returned: {response.status_code}")
        except Exception as e:
            print(f"❌ Harvest failed: {e}")
        
        # Update position
        self.send_position("harvesting", self.harvest_count)
    
    def run(self):
        """Main agent loop"""
        print("🚀 Data Harvester ACTIVE - Collecting global data...\n")
        
        while self.is_running:
            try:
                self.harvest_global_data()
                time.sleep(30)  # Harvest every 30 seconds
            except KeyboardInterrupt:
                print("\n🛑 Data Harvester shutting down...")
                self.is_running = False
            except Exception as e:
                print(f"❌ Error: {e}")
                time.sleep(10)

if __name__ == "__main__":
    agent = DataHarvesterAgent()
    agent.run()
