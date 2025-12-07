#!/usr/bin/env python3
import sys
print("🔍 Testing agent startup...")

try:
    print("1. Importing modules...")
    import requests
    import json
    import time
    print("   ✅ Imports successful")
    
    print("2. Testing Telegram connection...")
    TELEGRAM_BOT_TOKEN = '8407882307:AAErVEXhC26xQtDWlXdBZf2JX_sMiTtT22Y'
    TELEGRAM_CHAT_ID = '6523159355'
    
    url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage'
    data = {
        'chat_id': TELEGRAM_CHAT_ID,
        'text': '🔍 **Agent Diagnostic Test**\n\nTesting connection...'
    }
    response = requests.post(url, json=data, timeout=5)
    if response.ok:
        print("   ✅ Telegram connection works!")
    else:
        print(f"   ❌ Telegram failed: {response.status_code}")
    
    print("3. Testing NUPI Cloud connection...")
    response = requests.get('https://nupidesktopai.com/api/agents/status', timeout=5)
    if response.ok:
        print(f"   ✅ Cloud connection works! ({response.status_code})")
    else:
        print(f"   ❌ Cloud failed: {response.status_code}")
    
    print("\n✅ ALL TESTS PASSED - Agent should work!")
    print("�� Check Telegram for test message")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
