#!/usr/bin/env python3
"""
# Version: 2025-12-06-21:03 - Route fix deployed
NUPI CLOUD AGENT - REAL DATA ONLY
Shows actual running agents and real harvested data
"""
from flask import Flask, request, jsonify, send_from_directory, render_template_string
from flask_cors import CORS
from datetime import datetime
import os
import json
from collections import defaultdict


from datetime import datetime, timedelta
import threading
import time

# Ghost agent cleanup configuration
GHOST_AGENT_TIMEOUT = 300  # 5 minutes - agents not seen for this long are considered ghosts
CLEANUP_INTERVAL = 60  # Check every 60 seconds

def cleanup_ghost_agents():
    """Background thread to automatically remove ghost agents"""
    while True:
        try:
            time.sleep(CLEANUP_INTERVAL)
            now = datetime.utcnow()
            ghosts_removed = []
            
            for agent_id, agent_data in list(agents_registry.items()):
                last_seen_str = agent_data.get('last_seen')
                if last_seen_str:
                    try:
                        last_seen = datetime.fromisoformat(last_seen_str.replace('Z', '+00:00'))
                        time_diff = (now - last_seen.replace(tzinfo=None)).total_seconds()
                        
                        # Remove agents not seen for GHOST_AGENT_TIMEOUT seconds
                        if time_diff > GHOST_AGENT_TIMEOUT:
                            # Check if it's a hex-ID orphaned agent (no location)
                            location = agent_data.get('location')
                            network = agent_data.get('network', 'Unknown')
                            
                            if not location and network == 'Unknown':
                                # Orphaned ghost - remove completely
                                del agents_registry[agent_id]
                                ghosts_removed.append(agent_id)
                                print(f"🗑️  Removed ghost agent: {agent_id} (orphaned, not seen for {int(time_diff)}s)")
                            else:
                                # Named agent - mark inactive but keep for history
                                agents_registry[agent_id]['status'] = 'inactive'
                                print(f"⚠️  Marked agent inactive: {agent_id} (not seen for {int(time_diff)}s)")
                    except:
                        pass
            
            if ghosts_removed:
                print(f"✅ Cleanup complete: Removed {len(ghosts_removed)} ghost agent(s)")
                
        except Exception as e:
            print(f"❌ Ghost cleanup error: {e}")

app = Flask(__name__)

# REAL DATA STORAGE - No fake simulations
agents_registry = {}  # agent_id -> agent_data
collected_data = []   # All harvested data
visitor_data = []     # Worldwide visitor tracking

# Configure CORS for nupiai.com and nupidesktopai.com
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://nupiai.com",
            "https://www.nupiai.com",
            "https://nupidesktopai.com",
            "https://www.nupidesktopai.com",
            "http://localhost:*"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
device_discoveries = []  # Local network discoveries

@app.before_request
def track_visitor():
    """Track real visitors - no simulation"""
    if request.path not in ['/health', '/favicon.ico', '/robots.txt']:
        visitor = {
            "ip": request.headers.get('X-Forwarded-For', request.remote_addr),
            "path": request.path,
            "user_agent": request.headers.get('User-Agent', 'Unknown'),
            "timestamp": datetime.utcnow().isoformat(),
            "method": request.method
        }
        visitor_data.append(visitor)
        if len(visitor_data) > 1000:  # Keep last 1000
            visitor_data.pop(0)

@app.route('/')
def home():
    return render_template_string(HOME_HTML)

@app.route('/health')
def health():
    """Health check with REAL agent count"""
    active_agents = len([a for a in agents_registry.values() if a.get('status') == 'active'])
    return jsonify({
        "status": "healthy",
        "cloud": "nupidesktopai.com",
        "version": "2025-12-06-ROUTE-FIX",
        "timestamp": datetime.utcnow().isoformat(),
        "active_agents": active_agents,
        "total_devices": len(device_discoveries),
        "visitors_tracked": len(visitor_data),
        "data_points": len(collected_data),
        "services": {
            "web_server": "online",
            "api": "online",
            "data_storage": "online",
            "agent_communication": "online"
        }
    })

@app.route('/api/test')
def test_endpoint():
    """Test endpoint to verify correct file is running"""
    return jsonify({
        "message": "CORRECT FILE RUNNING",
        "file": "app.py",
        "version": "2025-12-06-ROUTE-FIX",
        "routes_working": True
    })

# REAL AGENT REGISTRATION
@app.route('/api/agent/register', methods=['POST'])
def register_agent():
    """Register a REAL agent - no fake data"""
    try:
        data = request.get_json()
        agent_id = data.get('agent_id')
        
        agents_registry[agent_id] = {
            "agent_id": agent_id,
            "location": data.get('location'),
            "network": data.get('network', 'Unknown'),
            "status": "active",
            "registered_at": datetime.utcnow().isoformat(),
            "last_seen": datetime.utcnow().isoformat(),
            "devices_found": 0,
            "scans_completed": 0
        }
        
        return jsonify({
            "status": "registered",
            "cloud": "nupidesktopai.com",
            "agent_id": agent_id,
            "message": "Agent registered with REAL data tracking"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# REAL DATA REPORTING
@app.route('/api/agent/report', methods=['POST'])
def agent_report():
    """Receive REAL harvested data from agents"""
    try:
        data = request.get_json()
        agent_id = data.get('agent_id')
        
        # Update agent status
        if agent_id in agents_registry:
            agents_registry[agent_id]['last_seen'] = datetime.utcnow().isoformat()
            agents_registry[agent_id]['scans_completed'] = agents_registry[agent_id].get('scans_completed', 0) + 1
        
        # Store REAL discovered devices
        devices = data.get('devices', [])
        for device in devices:
            device_discoveries.append({
                "agent_id": agent_id,
                "ip": device.get('ip'),
                "hostname": device.get('hostname', 'Unknown'),
                "discovered_at": datetime.utcnow().isoformat(),
                "network": data.get('network', 'Unknown')
            })
            
            if agent_id in agents_registry:
                agents_registry[agent_id]['devices_found'] = agents_registry[agent_id].get('devices_found', 0) + 1
        
        # Store in collected data
        collected_data.append({
            "agent_id": agent_id,
            "timestamp": datetime.utcnow().isoformat(),
            "data": data
        })
        
        return jsonify({
            "status": "received",
            "cloud": "nupidesktopai.com",
            "devices_processed": len(devices)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# API: Get REAL agent locations
@app.route('/api/agents/locations', methods=['GET'])
def get_agents():
    """Return REAL active agents only"""
    active = [a for a in agents_registry.values() if a.get('status') == 'active']
    return jsonify({
        "cloud": "nupidesktopai.com",
        "count": len(active),
        "agents": active
    })

# API: Get REAL collected data summary
@app.route('/api/collected-data/summary', methods=['GET'])
def get_data_summary():
    """Return REAL harvested data summary"""
    total_devices = len(device_discoveries)
    total_agents = len(agents_registry)
    
    # Calculate real hops (unique networks)
    networks = set(d.get('network', 'Unknown') for d in device_discoveries)
    
    return jsonify({
        "cloud": "nupidesktopai.com",
        "total_records": len(collected_data),
        "total_devices": total_devices,
        "total_agents": total_agents,
        "active_agents": len([a for a in agents_registry.values() if a.get('status') == 'active']),
        "total_hops": len(networks),
        "recent_data": collected_data[-10:] if collected_data else []
    })

# API: Get all discovered devices (REAL data)
@app.route('/api/devices/all', methods=['GET'])
def get_all_devices():
    """Return all REAL discovered devices"""
    return jsonify({
        "cloud": "nupidesktopai.com",
        "total": len(device_discoveries),
        "devices": device_discoveries[-50:]  # Last 50
    })

# API: Visitor stats (REAL worldwide tracking)
@app.route('/api/visitors/stats', methods=['GET'])
def visitor_stats():
    """REAL visitor statistics"""
    return jsonify({
        "cloud": "nupidesktopai.com",
        "total_visitors": len(visitor_data),
        "recent_visitors": visitor_data[-20:] if visitor_data else []
    })

# Serve static files - MUST BE LAST (after all API routes)
@app.route('/<path:filename>')
def serve_public(filename):
    """Serve HTML files from public folder"""
    try:
        return send_from_directory('public', filename)
    except:
        return "File not found", 404

HOME_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NUPI Cloud Agent - Real Data Only</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
            color: #fff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            max-width: 800px;
            padding: 2rem;
        }
        h1 { font-size: 3rem; margin-bottom: 1rem; }
        .badge {
            background: #10b981;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            display: inline-block;
            margin: 1rem;
        }
        .warning {
            background: rgba(239, 68, 68, 0.2);
            border: 2px solid #ef4444;
            padding: 1rem;
            border-radius: 10px;
            margin: 2rem 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌍 NUPI Cloud Agent</h1>
        <div class="badge">REAL DATA ONLY - NO SIMULATIONS</div>
        <div class="warning">
            <strong>⚠️ Live Data Tracking Active</strong><br>
            Only actual harvested data is displayed
        </div>
        <p style="margin-top: 2rem;">Powered by nupidesktopai.com</p>
    </div>
</body>
</html>
"""

if __name__ == "__main__":
    # Start ghost cleanup thread
    cleanup_thread = threading.Thread(target=cleanup_ghost_agents, daemon=True)
    cleanup_thread.start()
    print("🧹 Ghost agent cleanup thread started")
    
    port = int(os.environ.get("PORT", 8080))
    print("🚀 NUPI Cloud Agent - REAL DATA ONLY")
    print(f"📡 Port: {port}")
    print(f"📝 Version: 2025-12-06-ROUTE-FIX")
    print("⚠️  No simulations - only actual harvested data")
    app.run(host="0.0.0.0", port=port, debug=False)
# Build: 2025-12-07_02:24:43
