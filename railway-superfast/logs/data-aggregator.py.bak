#!/usr/bin/env python3
import time, json, requests
from datetime import datetime

AGENT_ID = 'data-aggregator'
API_URL = 'http://localhost:3000/api/devices'

print(f"💾 {AGENT_ID} aggregating data")
cycle = 0
while True:
    cycle += 1
    try:
        response = requests.get(API_URL, timeout=5)
        data = response.json()
        
        if data:
            # Save aggregated data
            filename = f"logs/aggregate-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
            with open(filename, 'w') as f:
                json.dump(data, f, indent=2)
            print(f"💾 Cycle {cycle}: Saved {filename}")
    except:
        pass
    
    time.sleep(300)  # Every 5 minutes
