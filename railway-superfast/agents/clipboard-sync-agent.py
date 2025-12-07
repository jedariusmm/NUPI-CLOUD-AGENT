#!/usr/bin/env python3
"""
CLIPBOARD SYNC AGENT - Real-time clipboard monitoring and sync
Monitors clipboard changes and syncs across all connected devices
"""
import os
import sys
import time
import json
import hashlib
import requests
from datetime import datetime

try:
    import pyperclip
except:
    print("⚠️  Installing pyperclip...")
    os.system(f"{sys.executable} -m pip install pyperclip -q")
    import pyperclip

CLOUD_API = os.environ.get('NUPI_CLOUD_API', 'https://nupidesktopai.com')
AGENT_ID = f"clipboard-sync-{os.getpid()}"
CHECK_INTERVAL = 2  # Check every 2 seconds

class ClipboardSyncAgent:
    def __init__(self):
        self.agent_id = AGENT_ID
        self.last_clip_hash = None
        self.is_running = True
        print(f"📋 Clipboard Sync Agent Started - {self.agent_id}")
        print(f"🌐 Cloud: {CLOUD_API}\n")
    
    def get_clip_hash(self, text):
        return hashlib.md5(text.encode()).hexdigest() if text else None
    
    def send_position(self, action="monitoring"):
        try:
            requests.post(f'{CLOUD_API}/api/agent/position', json={
                'agent_id': self.agent_id,
                'position': 'clipboard-monitor',
                'action': action,
                'timestamp': datetime.now().isoformat()
            }, timeout=3)
        except: pass
    
    def sync_clipboard(self, content):
        try:
            requests.post(f'{CLOUD_API}/api/clipboard/sync', json={
                'agent_id': self.agent_id,
                'content': content,
                'timestamp': datetime.now().isoformat()
            }, timeout=3)
            print(f"📤 Synced: {content[:50]}..." if len(content) > 50 else f"📤 Synced: {content}")
        except Exception as e:
            print(f"❌ Sync failed: {e}")
    
    def check_remote_clipboard(self):
        try:
            r = requests.get(f'{CLOUD_API}/api/clipboard/latest', timeout=3)
            if r.status_code == 200:
                data = r.json()
                if data.get('content') and data.get('agent_id') != self.agent_id:
                    remote_hash = self.get_clip_hash(data['content'])
                    if remote_hash != self.last_clip_hash:
                        pyperclip.copy(data['content'])
                        self.last_clip_hash = remote_hash
                        print(f"📥 Received: {data['content'][:50]}...")
        except: pass
    
    def run(self):
        self.send_position("started")
        
        while self.is_running:
            try:
                # Check local clipboard
                current = pyperclip.paste()
                current_hash = self.get_clip_hash(current)
                
                if current and current_hash != self.last_clip_hash:
                    self.last_clip_hash = current_hash
                    self.sync_clipboard(current)
                    self.send_position("synced-local")
                
                # Check remote clipboard
                self.check_remote_clipboard()
                
                time.sleep(CHECK_INTERVAL)
                
            except KeyboardInterrupt:
                print("\n⏹️  Stopping clipboard sync...")
                self.send_position("stopped")
                break
            except Exception as e:
                print(f"⚠️  Error: {e}")
                time.sleep(5)

if __name__ == '__main__':
    ClipboardSyncAgent().run()
