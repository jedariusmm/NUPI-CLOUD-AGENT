#!/usr/bin/env python3
"""
SCREENSHOT AGENT - Automated screen capture and upload
Takes periodic screenshots and uploads to cloud for remote viewing
"""
import os
import sys
import time
import json
import base64
import requests
from datetime import datetime
from io import BytesIO

try:
    from PIL import ImageGrab
except:
    print("⚠️  Installing Pillow...")
    os.system(f"{sys.executable} -m pip install Pillow -q")
    from PIL import ImageGrab

CLOUD_API = os.environ.get('NUPI_CLOUD_API', 'https://nupidesktopai.com')
AGENT_ID = f"screenshot-{os.getpid()}"
CAPTURE_INTERVAL = 30  # Capture every 30 seconds

class ScreenshotAgent:
    def __init__(self):
        self.agent_id = AGENT_ID
        self.is_running = True
        self.screenshot_count = 0
        print(f"📸 Screenshot Agent Started - {self.agent_id}")
        print(f"🌐 Cloud: {CLOUD_API}")
        print(f"⏱️  Capturing every {CAPTURE_INTERVAL}s\n")
    
    def send_position(self, action="capturing"):
        try:
            requests.post(f'{CLOUD_API}/api/agent/position', json={
                'agent_id': self.agent_id,
                'position': 'screen-capture',
                'action': action,
                'timestamp': datetime.now().isoformat()
            }, timeout=3)
        except: pass
    
    def capture_and_upload(self):
        try:
            # Capture screenshot
            screenshot = ImageGrab.grab()
            
            # Resize for upload (max 1280px wide)
            if screenshot.width > 1280:
                ratio = 1280 / screenshot.width
                new_size = (1280, int(screenshot.height * ratio))
                screenshot = screenshot.resize(new_size)
            
            # Convert to base64
            buffer = BytesIO()
            screenshot.save(buffer, format='JPEG', quality=75)
            img_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            # Upload to cloud
            requests.post(f'{CLOUD_API}/api/screenshots/upload', json={
                'agent_id': self.agent_id,
                'image': img_base64,
                'resolution': f"{screenshot.width}x{screenshot.height}",
                'timestamp': datetime.now().isoformat()
            }, timeout=10)
            
            self.screenshot_count += 1
            print(f"📸 Screenshot #{self.screenshot_count} uploaded ({screenshot.width}x{screenshot.height})")
            
        except Exception as e:
            print(f"❌ Capture failed: {e}")
    
    def run(self):
        self.send_position("started")
        
        while self.is_running:
            try:
                self.capture_and_upload()
                self.send_position(f"captured-{self.screenshot_count}")
                time.sleep(CAPTURE_INTERVAL)
                
            except KeyboardInterrupt:
                print("\n⏹️  Stopping screenshot agent...")
                self.send_position("stopped")
                break
            except Exception as e:
                print(f"⚠️  Error: {e}")
                time.sleep(10)

if __name__ == '__main__':
    ScreenshotAgent().run()
