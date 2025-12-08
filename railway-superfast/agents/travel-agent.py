#!/usr/bin/env python3
"""
TRAVEL AGENT - Moves between devices, networks, and cloud
Demonstrates real agent movement with notifications
"""
import os
import time
import requests
from datetime import datetime
import random

CLOUD_API = os.environ.get('NUPI_CLOUD_API', 'http://localhost:3001')
AGENT_ID = f"travel-agent-{os.getpid()}"

class TravelAgent:
    def __init__(self):
        self.agent_id = AGENT_ID
        self.is_running = True
        self.current_location = 'local'
        self.trip_count = 0
        
        # Define locations to visit
        self.locations = ['local', 'cloud', 'device-router', 'device-ipad', 'device-iphone', 'device-imac']
        
        print(f"✈️  Travel Agent Started - {self.agent_id}")
        print(f"🌐 Cloud: {CLOUD_API}\n")
    
    def send_position(self, location, action, notification):
        try:
            requests.post(f'{CLOUD_API}/api/agent/position', json={
                'agent_id': self.agent_id,
                'type': 'network-monitoring',
                'name': f'Travel Agent {self.agent_id[-5:]}',
                'location': location,
                'action': action,
                'notification': notification,
                'timestamp': datetime.now().isoformat()
            }, timeout=3)
        except Exception as e:
            print(f"⚠️  Position update failed: {e}")
    
    def travel_to(self, destination):
        """Travel from current location to destination"""
        print(f"🚀 [{datetime.now().strftime('%H:%M:%S')}] Traveling {self.current_location} → {destination}")
        
        # Announce departure
        self.send_position(
            self.current_location,
            'departing',
            f"🚀 Leaving {self.current_location}, heading to {destination}"
        )
        time.sleep(2)
        
        # Traveling state
        self.send_position(
            'traveling',
            'in-transit',
            f"✈️  Traveling to {destination}..."
        )
        time.sleep(3)
        
        # Arrive at destination
        self.current_location = destination
        self.send_position(
            destination,
            'arrived',
            f"📍 Arrived at {destination}"
        )
        time.sleep(2)
        
        # Perform activity at location
        if destination == 'cloud':
            data_size = random.randint(100, 5000)
            self.send_position(
                'cloud',
                'uploading',
                f"☁️  Uploading {data_size}KB to cloud"
            )
            time.sleep(4)
            self.send_position(
                'cloud',
                'uploaded',
                f"✅ Upload complete - {data_size}KB"
            )
        elif destination.startswith('device-'):
            device_name = destination.replace('device-', '').capitalize()
            self.send_position(
                destination,
                'scanning',
                f"🔍 Scanning {device_name}..."
            )
            time.sleep(3)
            files_found = random.randint(10, 50)
            self.send_position(
                destination,
                'scanned',
                f"📊 Found {files_found} files on {device_name}"
            )
        else:
            self.send_position(
                'local',
                'monitoring',
                f"👀 Monitoring local system"
            )
        
        time.sleep(2)
        self.trip_count += 1
    
    def run(self):
        self.send_position('local', 'started', '🚀 Travel agent online - ready to explore')
        time.sleep(3)
        
        while self.is_running:
            try:
                # Pick a random destination different from current location
                destinations = [loc for loc in self.locations if loc != self.current_location]
                destination = random.choice(destinations)
                
                # Travel to destination
                self.travel_to(destination)
                
                # Wait before next trip
                wait_time = random.randint(5, 10)
                print(f"⏳ Waiting {wait_time}s before next trip...\n")
                time.sleep(wait_time)
                
            except KeyboardInterrupt:
                print("\n⏹️  Stopping travel agent...")
                self.send_position(self.current_location, 'stopped', '🛑 Travel agent offline')
                break
            except Exception as e:
                print(f"⚠️  Error: {e}")
                time.sleep(10)

if __name__ == '__main__':
    TravelAgent().run()
