#!/usr/bin/env python3
"""
NUPI CLOUD AGENT - Worldwide Visitor Tracking
Tracks ALL devices visiting our sites globally
Only collects readable, useful data - no useless scans
"""
from flask import Flask, request, jsonify, send_from_directory, render_template_string
from datetime import datetime
import os
import json
from web_visitor_agent import web_agent

app = Flask(__name__)

# Store visitor data in memory (will move to database later)
visitors_db = []
agent_data = {
    "agent_id": "cloud-worldwide-scanner",
    "status": "online",
    "devices_found": 0,
    "scan_count": 0,
    "last_scan": None
}

# Middleware to track EVERY visitor
@app.before_request
def track_all_visitors():
    """Track every visitor to ANY page on our sites"""
    try:
        visitor = web_agent.track_visitor(request)
        if visitor:
            visitors_db.append(visitor)
            agent_data["devices_found"] = len(visitors_db)
            agent_data["scan_count"] += 1
            agent_data["last_scan"] = datetime.utcnow().isoformat()
    except Exception as e:
        print(f"⚠️  Tracking error: {e}")

# Serve static files from public folder
@app.route('/<path:filename>')
def serve_public(filename):
    """Serve static files from public folder"""
    try:
        return send_from_directory('public', filename)
    except:
        return "File not found", 404

# Homepage
@app.route('/')
def home():
    return render_template_string(HOME_HTML)

# Health check
@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "cloud": "nupidesktopai.com",
        "agent": agent_data["status"],
        "agent_id": agent_data["agent_id"],
        "devices_found": agent_data["devices_found"],
        "scan_count": agent_data["scan_count"],
        "last_scan": agent_data["last_scan"],
        "timestamp": datetime.utcnow().isoformat(),
        "tracking": "WORLDWIDE - All visitors",
        "services": {
            "web_server": "online",
            "visitor_tracking": "active",
            "api": "online",
            "data_storage": "active"
        }
    })

# API: Get visitor data
@app.route('/api/visitors/all', methods=['GET'])
def get_all_visitors():
    """Get all tracked visitors worldwide"""
    return jsonify({
        "cloud": "nupidesktopai.com",
        "total_visitors": len(visitors_db),
        "visitors": visitors_db[-50:]  # Last 50 visitors
    })

# API: Get visitor stats
@app.route('/api/visitors/stats', methods=['GET'])
def get_visitor_stats():
    """Get statistics about worldwide visitors"""
    countries = {}
    devices = {}
    browsers = {}
    
    for visitor in visitors_db:
        # Count by country
        country = visitor.get('location', {}).get('country', 'Unknown')
        countries[country] = countries.get(country, 0) + 1
        
        # Count by device type
        device = visitor.get('device', {}).get('type', 'Unknown')
        devices[device] = devices.get(device, 0) + 1
        
        # Count by browser
        browser = visitor.get('device', {}).get('browser', 'Unknown')
        browsers[browser] = browsers.get(browser, 0) + 1
    
    return jsonify({
        "cloud": "nupidesktopai.com",
        "total_visitors": len(visitors_db),
        "by_country": countries,
        "by_device": devices,
        "by_browser": browsers,
        "tracking_status": "ACTIVE - Worldwide"
    })

# API: Track visitor manually (for external sites)
@app.route('/api/visitor/track', methods=['POST'])
def track_visitor():
    """Receive visitor data from other sources"""
    data = request.get_json()
    visitors_db.append(data)
    agent_data["devices_found"] = len(visitors_db)
    return jsonify({
        "status": "tracked",
        "cloud": "nupidesktopai.com",
        "total_visitors": len(visitors_db)
    })

# API: Agent registration
@app.route('/api/agent/register', methods=['POST'])
def register_agent():
    """Register a new agent"""
    data = request.get_json()
    return jsonify({
        "status": "registered",
        "cloud": "nupidesktopai.com",
        "agent_id": data.get('agent_id'),
        "message": "Agent connected to worldwide tracking system"
    })

HOME_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NUPI Desktop AI - Cloud Agent</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
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
        .subtitle { font-size: 1.2rem; opacity: 0.9; margin-bottom: 2rem; }
        .status {
            background: rgba(255,255,255,0.1);
            padding: 2rem;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        .status-item {
            display: flex;
            justify-content: space-between;
            padding: 1rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .status-item:last-child { border-bottom: none; }
        .badge {
            background: #10b981;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-weight: bold;
        }
        .footer {
            margin-top: 2rem;
            opacity: 0.7;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌍 NUPI Cloud Agent</h1>
        <div class="subtitle">Worldwide Visitor Tracking System</div>
        
        <div class="status">
            <div class="status-item">
                <span>Status</span>
                <span class="badge">🟢 ONLINE</span>
            </div>
            <div class="status-item">
                <span>Tracking</span>
                <span>Worldwide - All Visitors</span>
            </div>
            <div class="status-item">
                <span>Data Collection</span>
                <span>Readable & Useful Only</span>
            </div>
            <div class="status-item">
                <span>Powered By</span>
                <span>nupidesktopai.com</span>
            </div>
        </div>
        
        <div class="footer">
            Powered by nupidesktopai.com | All data encrypted and secure
        </div>
    </div>
</body>
</html>
"""

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    print(f"🌍 Starting NUPI Cloud Agent - Worldwide Tracking")
    print(f"📡 Port: {port}")
    print(f"🔍 Tracking: ALL visitors to all sites")
    print(f"✅ Only readable, useful data - no useless scans")
    app.run(host="0.0.0.0", port=port, debug=False)
