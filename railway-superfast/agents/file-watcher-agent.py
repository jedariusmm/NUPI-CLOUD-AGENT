#!/usr/bin/env python3
"""
FILE WATCHER AGENT - Monitor file system changes
Watches specified directories for file creation, modification, deletion
"""
import os
import sys
import time
import json
import hashlib
import requests
from datetime import datetime
from pathlib import Path

try:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
except:
    print("⚠️  Installing watchdog...")
    os.system(f"{sys.executable} -m pip install watchdog -q")
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler

CLOUD_API = os.environ.get('NUPI_CLOUD_API', 'https://nupidesktopai.com')
AGENT_ID = f"file-watcher-{os.getpid()}"
WATCH_DIRS = [os.path.expanduser('~/Documents'), os.path.expanduser('~/Downloads')]

class FileWatchHandler(FileSystemEventHandler):
    def __init__(self, agent_id):
        self.agent_id = agent_id
    
    def send_event(self, event_type, path):
        try:
            requests.post(f'{CLOUD_API}/api/files/event', json={
                'agent_id': self.agent_id,
                'event_type': event_type,
                'path': path,
                'timestamp': datetime.now().isoformat()
            }, timeout=3)
            print(f"📁 {event_type}: {Path(path).name}")
        except: pass
    
    def on_created(self, event):
        if not event.is_directory:
            self.send_event('created', event.src_path)
    
    def on_modified(self, event):
        if not event.is_directory:
            self.send_event('modified', event.src_path)
    
    def on_deleted(self, event):
        if not event.is_directory:
            self.send_event('deleted', event.src_path)

class FileWatcherAgent:
    def __init__(self):
        self.agent_id = AGENT_ID
        self.is_running = True
        self.observers = []
        print(f"📂 File Watcher Agent Started - {self.agent_id}")
        print(f"🌐 Cloud: {CLOUD_API}")
        print(f"👀 Watching: {', '.join(WATCH_DIRS)}\n")
    
    def send_position(self, action="watching"):
        try:
            requests.post(f'{CLOUD_API}/api/agent/position', json={
                'agent_id': self.agent_id,
                'position': 'file-watching',
                'action': action,
                'timestamp': datetime.now().isoformat()
            }, timeout=3)
        except: pass
    
    def run(self):
        self.send_position("started")
        event_handler = FileWatchHandler(self.agent_id)
        
        # Start observers for each directory
        for watch_dir in WATCH_DIRS:
            if os.path.exists(watch_dir):
                observer = Observer()
                observer.schedule(event_handler, watch_dir, recursive=True)
                observer.start()
                self.observers.append(observer)
                print(f"✅ Watching: {watch_dir}")
        
        try:
            while self.is_running:
                time.sleep(10)
                self.send_position("active")
                
        except KeyboardInterrupt:
            print("\n⏹️  Stopping file watcher...")
            self.send_position("stopped")
            
        finally:
            for observer in self.observers:
                observer.stop()
                observer.join()

if __name__ == '__main__':
    FileWatcherAgent().run()
