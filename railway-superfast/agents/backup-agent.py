#!/usr/bin/env python3
"""
BACKUP AGENT - Automated file backup to cloud
Monitors and backs up important files to NUPI cloud storage
"""
import os
import sys
import time
import json
import hashlib
import base64
import requests
from datetime import datetime
from pathlib import Path

CLOUD_API = os.environ.get('NUPI_CLOUD_API', 'https://nupidesktopai.com')
AGENT_ID = f"backup-{os.getpid()}"
BACKUP_DIRS = [
    os.path.expanduser('~/Documents'),
    os.path.expanduser('~/Desktop'),
]
BACKUP_INTERVAL = 300  # 5 minutes
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

class BackupAgent:
    def __init__(self):
        self.agent_id = AGENT_ID
        self.is_running = True
        self.backed_up_hashes = {}
        self.backup_count = 0
        print(f"💾 Backup Agent Started - {self.agent_id}")
        print(f"🌐 Cloud: {CLOUD_API}")
        print(f"📁 Backing up: {', '.join(BACKUP_DIRS)}\n")
    
    def send_position(self, action="scanning"):
        try:
            requests.post(f'{CLOUD_API}/api/agent/position', json={
                'agent_id': self.agent_id,
                'position': 'backup',
                'action': action,
                'timestamp': datetime.now().isoformat()
            }, timeout=3)
        except: pass
    
    def get_file_hash(self, filepath):
        try:
            with open(filepath, 'rb') as f:
                return hashlib.md5(f.read()).hexdigest()
        except:
            return None
    
    def backup_file(self, filepath):
        try:
            file_size = os.path.getsize(filepath)
            if file_size > MAX_FILE_SIZE:
                return False
            
            file_hash = self.get_file_hash(filepath)
            if not file_hash or self.backed_up_hashes.get(filepath) == file_hash:
                return False
            
            with open(filepath, 'rb') as f:
                content = base64.b64encode(f.read()).decode()
            
            requests.post(f'{CLOUD_API}/api/backup/upload', json={
                'agent_id': self.agent_id,
                'filepath': str(filepath),
                'filename': Path(filepath).name,
                'content': content,
                'size': file_size,
                'hash': file_hash,
                'timestamp': datetime.now().isoformat()
            }, timeout=30)
            
            self.backed_up_hashes[filepath] = file_hash
            self.backup_count += 1
            print(f"💾 Backed up: {Path(filepath).name} ({file_size:,} bytes)")
            return True
            
        except Exception as e:
            print(f"❌ Backup failed for {filepath}: {e}")
            return False
    
    def scan_and_backup(self):
        print(f"\n🔍 Scanning for new/modified files...")
        backed_up = 0
        
        for backup_dir in BACKUP_DIRS:
            if not os.path.exists(backup_dir):
                continue
            
            for root, dirs, files in os.walk(backup_dir):
                for file in files:
                    filepath = os.path.join(root, file)
                    if self.backup_file(filepath):
                        backed_up += 1
                        self.send_position(f"backed-up-{self.backup_count}")
        
        print(f"✅ Backup cycle complete. {backed_up} files backed up.\n")
    
    def run(self):
        self.send_position("started")
        
        while self.is_running:
            try:
                self.scan_and_backup()
                time.sleep(BACKUP_INTERVAL)
                
            except KeyboardInterrupt:
                print("\n⏹️  Stopping backup agent...")
                self.send_position("stopped")
                break
            except Exception as e:
                print(f"⚠️  Error: {e}")
                time.sleep(30)

if __name__ == '__main__':
    BackupAgent().run()
