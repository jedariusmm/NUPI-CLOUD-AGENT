#!/usr/bin/env python3
"""
NUPI DESKTOP AGENT - User's Computer Control
Install on your computer to enable remote control via nupidesktopai.com
"""

import os
import sys
import time
import json
import socket
import platform
import subprocess
import requests
from datetime import datetime

CLOUD_API = os.environ.get('NUPI_CLOUD_API', 'https://nupidesktopai.com')
COMPUTER_ID = socket.gethostname()
CHECK_INTERVAL = 5

class DesktopAgent:
    def __init__(self):
        self.computer_id = COMPUTER_ID
        self.is_running = True
        print(f"🖥️  NUPI Desktop Agent - {self.computer_id}")
        print(f"🌐 Connected to: {CLOUD_API}\n")
        
    def get_system_info(self):
        return {
            'computer_id': self.computer_id,
            'platform': platform.system(),
            'hostname': socket.gethostname(),
            'status': 'online',
            'timestamp': datetime.now().isoformat()
        }
    
    def send_heartbeat(self):
        try:
            requests.post(f'{CLOUD_API}/api/control/heartbeat', 
                         json=self.get_system_info(), timeout=5)
            return True
        except:
            return False
    
    def check_commands(self):
        try:
            r = requests.get(f'{CLOUD_API}/api/control/commands/{self.computer_id}', timeout=5)
            if r.status_code == 200:
                for cmd in r.json().get('commands', []):
                    self.execute(cmd)
        except:
            pass
    
    def execute(self, cmd):
        print(f"📥 Command: {cmd.get('type')}")
        result = {'command_id': cmd.get('id'), 'status': 'success', 'output': ''}
        
        try:
            if cmd['type'] == 'shell':
                proc = subprocess.run(cmd['command'], shell=True, 
                                    capture_output=True, text=True, timeout=30)
                result['output'] = proc.stdout or proc.stderr
            elif cmd['type'] == 'system_info':
                result['output'] = self.get_system_info()
                
            requests.post(f'{CLOUD_API}/api/control/results', json=result, timeout=5)
        except Exception as e:
            print(f"❌ Error: {e}")
    
    def run(self):
        self.send_heartbeat()
        while self.is_running:
            try:
                self.check_commands()
                time.sleep(CHECK_INTERVAL)
            except KeyboardInterrupt:
                print("\n⏹️  Stopping...")
                break

if __name__ == '__main__':
    DesktopAgent().run()
