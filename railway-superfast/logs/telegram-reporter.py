#!/usr/bin/env python3
import time, requests
from datetime import datetime

AGENT_ID = 'telegram-reporter'
BOT_TOKEN = '8407882307:AAErVEXhC26xQtDWlXdBZf2JX_sMiTtT22Y'
CHAT_ID = '6523159355'
API_URL = 'http://localhost:3000/api/devices'

def send_report():
    try:
        response = requests.get(API_URL, timeout=5)
        data = response.json()
        
        if data:
            message = f"""📊 *Network Report*

🎯 Total Devices: {data.get('total_devices', 0)}
⏰ {datetime.now().strftime('%H:%M:%S')}

All agents operational"""
            
            url = f'https://api.telegram.org/bot{BOT_TOKEN}/sendMessage'
            requests.post(url, json={
                'chat_id': CHAT_ID,
                'text': message,
                'parse_mode': 'Markdown'
            }, timeout=5)
            print(f"📱 Report sent to Telegram")
    except Exception as e:
        print(f"❌ Error: {e}")

print(f"📱 {AGENT_ID} active")
while True:
    send_report()
    time.sleep(600)  # Every 10 minutes
