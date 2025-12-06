#!/usr/bin/env python3
import psutil
import time
import requests
import json
import uuid
import platform

CLOUD_URL = "https://nupidesktopai.com/api/real-system-data"
DEVICE_ID = str(uuid.uuid4())

print(f"🚀 NUPI Local Agent Started - Device ID: {DEVICE_ID}")
print("📡 Pushing real system data to cloud...")

def get_system_data():
    cpu = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    return {
        'device_id': DEVICE_ID,
        'timestamp': int(time.time()),
        'cpu': f"{cpu:.1f}",
        'memory_used': f"{memory.used / 1024**3:.2f}",
        'memory_total': f"{memory.total / 1024**3:.2f}",
        'memory_percent': f"{memory.percent:.1f}",
        'disk_used': f"{disk.used / 1024**3:.1f}",
        'disk_total': f"{disk.total / 1024**3:.1f}",
        'disk_percent': f"{disk.percent:.1f}",
        'processes': len(psutil.pids()),
        'system': platform.system(),
        'platform': platform.platform()
    }

while True:
    try:
        data = get_system_data()
        response = requests.post(CLOUD_URL, json=data, timeout=5)
        print(f"✅ Data pushed: CPU {data['cpu']}%")
    except Exception as e:
        print(f"⚠️ Push failed: {e}")
    time.sleep(5)
