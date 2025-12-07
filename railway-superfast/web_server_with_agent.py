from flask import Flask, request, jsonify, send_from_directory, render_template_string
import os
import json
import time
from datetime import datetime
from security_middleware_military import require_api_key, require_admin_password

app = Flask(__name__, static_folder='public', static_url_path='')

# Storage for collected data
all_collected_data = {
    "devices": [],
    "agents": [],
    "website_data": [],
    "agent_locations": [],
    "device_hops": [],
    "replicas": []
}

# Simple homepage with chat like GitHub Copilot
HOME_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NUPI Desktop AI</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container {
            max-width: 900px;
            width: 90%;
            text-align: center;
        }
        h1 { font-size: 56px; margin-bottom: 20px; font-weight: 700; }
        p { font-size: 24px; margin-bottom: 40px; opacity: 0.9; }
        .chat-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 0;
            overflow: hidden;
            max-width: 800px;
            margin: 0 auto;
        }
        .chat-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            color: white;
            font-weight: 600;
        }
        .chat-messages {
            height: 400px;
            overflow-y: auto;
            padding: 20px;
            background: #f8f9fa;
        }
        .message {
            margin-bottom: 15px;
            padding: 15px;
            border-radius: 12px;
            max-width: 80%;
        }
        .user-message {
            background: #667eea;
            color: white;
            margin-left: auto;
            text-align: right;
        }
        .ai-message {
            background: white;
            color: #333;
            border: 1px solid #e0e0e0;
        }
        .chat-input {
            display: flex;
            padding: 20px;
            background: white;
            border-top: 1px solid #e0e0e0;
        }
        .chat-input input {
            flex: 1;
            padding: 15px;
            border: 2px solid #e0e0e0;
            border-radius: 25px;
            font-size: 16px;
            outline: none;
        }
        .chat-input input:focus {
            border-color: #667eea;
        }
        .chat-input button {
            margin-left: 10px;
            padding: 15px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 25px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .chat-input button:hover {
            transform: scale(1.05);
        }
        .links {
            margin-top: 40px;
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
        }
        .link-btn {
            padding: 15px 30px;
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 12px;
            color: white;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s;
        }
        .link-btn:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 NUPI Desktop AI</h1>
        <p>Your intelligent assistant, just like GitHub Copilot</p>
        
        <div class="chat-container">
            <div class="chat-header">
                💬 Chat with NUPI AI
            </div>
            <div class="chat-messages" id="messages">
                <div class="message ai-message">
                    👋 Hi! I'm NUPI AI, your intelligent assistant. Ask me anything!
                </div>
            </div>
            <div class="chat-input">
                <input type="text" id="userInput" placeholder="Type your message..." onkeypress="if(event.key==='Enter') sendMessage()">
                <button onclick="sendMessage()">Send</button>
            </div>
        </div>

        <div class="links">
            <a href="/travelling-agents-ultimate.html" class="link-btn">🗺️ Network Map</a>
            <a href="/protected-collected-data.html" class="link-btn">📊 Data Dashboard</a>
        </div>
    </div>

    <script>
        async function sendMessage() {
            const input = document.getElementById('userInput');
            const message = input.value.trim();
            if (!message) return;

            const messagesDiv = document.getElementById('messages');
            messagesDiv.innerHTML += `<div class="message user-message">${message}</div>`;
            input.value = '';
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message })
                });

                const data = await response.json();
                messagesDiv.innerHTML += `<div class="message ai-message">${data.response || 'Sorry, I could not process that.'}</div>`;
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            } catch (error) {
                messagesDiv.innerHTML += `<div class="message ai-message">❌ Error connecting to AI</div>`;
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }
        }
    </script>
</body>
</html>
"""

@app.route('/')
def home():
    return render_template_string(HOME_HTML)

# Serve static HTML files from public folder
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('public', path)

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '')
    response = f"I received your message: '{message}'. I'm NUPI AI, how can I assist you?"
    return jsonify({"response": response, "timestamp": datetime.now().isoformat()})

@app.route('/api/data/upload', methods=['POST'])
@require_api_key
def upload_data():
    data = request.get_json()
    agent_type = data.get('agent_type', 'unknown')
    data['timestamp'] = datetime.now().isoformat()
    data['received_at'] = time.time()
    
    if agent_type == 'website':
        all_collected_data['website_data'].append(data)
    elif agent_type in ['travelling', 'safe_travelling_local']:
        all_collected_data['devices'].append(data)
    else:
        all_collected_data['agents'].append(data)
    
    return jsonify({"status": "success", "message": "Data uploaded"})

@app.route('/api/agent/register', methods=['POST'])
@require_api_key
def register_agent():
    data = request.get_json()
    all_collected_data['agents'].append({**data, 'registered_at': datetime.now().isoformat()})
    return jsonify({"status": "registered", "agent_id": data.get('agent_id')})

@app.route('/api/agent/location', methods=['POST'])
@require_api_key
def update_location():
    data = request.get_json()
    all_collected_data['agent_locations'].append({**data, 'timestamp': datetime.now().isoformat()})
    return jsonify({"status": "location_updated"})

@app.route('/api/agents/locations', methods=['GET'])
@require_admin_password
def get_locations():
    return jsonify({
        "agents": all_collected_data.get('agent_locations', [])[-50:],
        "devices": all_collected_data.get('devices', [])[-50:],
        "total_hops": len(all_collected_data.get('device_hops', [])),
        "data_points": sum([len(all_collected_data.get('devices', [])), len(all_collected_data.get('website_data', [])), len(all_collected_data.get('agents', []))])
    })

@app.route('/api/collected-data/summary', methods=['GET'])
@require_admin_password
def data_summary():
    return jsonify({
        "total_count": sum([len(all_collected_data.get('devices', [])), len(all_collected_data.get('website_data', [])), len(all_collected_data.get('agents', []))]),
        "devices_found": len(all_collected_data.get('devices', [])),
        "active_agents": len(all_collected_data.get('agents', [])),
        "website_visitors": len(all_collected_data.get('website_data', [])),
        "recent": (all_collected_data.get('devices', [])[-10:] + all_collected_data.get('website_data', [])[-10:] + all_collected_data.get('agents', [])[-10:])
    })

@app.route('/api/collected-data/full', methods=['GET'])
@require_admin_password
def full_data():
    return jsonify(all_collected_data)

@app.route('/api/telegram/send', methods=['POST'])
@require_api_key
def send_telegram():
    return jsonify({"status": "sent", "message": "Message sent to Telegram"})

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
