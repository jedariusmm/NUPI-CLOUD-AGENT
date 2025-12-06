#!/usr/bin/env python3
"""
🚀 NUPI Agent Order Processing API
Backend API for nupidesktopai.com to handle agent orders and deployments
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import subprocess
import time
import hashlib
from datetime import datetime
import threading

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Configuration
API_KEY = os.getenv("NUPI_API_KEY", "nupi_jdtech_secure_2025_key")
ORDERS_DB_FILE = "agent-orders.json"
DEPLOYMENT_LOG_FILE = "deployment-log.json"

def verify_api_key(request):
    """Verify API key from request headers"""
    api_key = request.headers.get('x-api-key')
    return api_key == API_KEY

def generate_agent_id():
    """Generate unique agent ID"""
    timestamp = str(time.time())
    return hashlib.md5(timestamp.encode()).hexdigest()[:16]

def save_order(order_data):
    """Save order to database"""
    try:
        # Load existing orders
        if os.path.exists(ORDERS_DB_FILE):
            with open(ORDERS_DB_FILE, 'r') as f:
                orders = json.load(f)
        else:
            orders = []
        
        # Add new order
        orders.append(order_data)
        
        # Save
        with open(ORDERS_DB_FILE, 'w') as f:
            json.dump(orders, f, indent=2)
        
        return True
    except Exception as e:
        print(f"Error saving order: {e}")
        return False

def log_deployment(agent_id, status, details):
    """Log deployment status"""
    try:
        log_entry = {
            "agent_id": agent_id,
            "status": status,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        
        if os.path.exists(DEPLOYMENT_LOG_FILE):
            with open(DEPLOYMENT_LOG_FILE, 'r') as f:
                logs = json.load(f)
        else:
            logs = []
        
        logs.append(log_entry)
        
        with open(DEPLOYMENT_LOG_FILE, 'w') as f:
            json.dump(logs, f, indent=2)
    except Exception as e:
        print(f"Error logging deployment: {e}")

def deploy_agent_async(order_data, agent_id):
    """Deploy agent asynchronously using autonomous generator"""
    try:
        log_deployment(agent_id, "started", "Deployment initiated")
        
        # Prepare deployment command
        agent_name = order_data['agentName']
        scan_speed = order_data['scanSpeed']
        
        # Determine agent type based on speed
        if scan_speed <= 6:
            agent_type = "ultra"
        elif scan_speed <= 12:
            agent_type = "fast"
        else:
            agent_type = "standard"
        
        # Create agent directory
        base_path = os.path.dirname(os.path.abspath(__file__))
        generator_script = os.path.join(base_path, "autonomous-agent-generator.py")
        
        if not os.path.exists(generator_script):
            log_deployment(agent_id, "failed", "Generator script not found")
            return False
        
        # Run autonomous generator
        print(f"🚀 Deploying agent: {agent_name}")
        log_deployment(agent_id, "building", "Generating agent code")
        
        # Execute Python generator directly
        import sys
        sys.path.insert(0, base_path)
        
        # Import generator
        import importlib.util
        spec = importlib.util.spec_from_file_location("generator", generator_script)
        generator_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(generator_module)
        
        # Create generator instance
        generator = generator_module.AutonomousAgentGenerator()
        
        # Generate and deploy agent
        config = generator.create_and_deploy_agent(
            agent_name=agent_name,
            agent_type=agent_type,
            scan_interval=scan_speed,
            auto_deploy=True
        )
        
        log_deployment(agent_id, "deployed", f"Agent deployed successfully: {config['agent_id']}")
        
        # Update order with deployment info
        order_data['deployment_status'] = 'deployed'
        order_data['deployed_at'] = datetime.now().isoformat()
        order_data['railway_url'] = f"https://nupi-cloud-agent-production.up.railway.app"
        
        print(f"✅ Agent {agent_name} deployed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Deployment error: {e}")
        log_deployment(agent_id, "failed", str(e))
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "NUPI Agent Order API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/agent-orders', methods=['POST', 'OPTIONS'])
def create_agent_order():
    """Handle new agent orders"""
    
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return '', 204
    
    # Verify API key
    if not verify_api_key(request):
        return jsonify({"success": False, "error": "Invalid API key"}), 401
    
    try:
        # Get order data
        order_data = request.get_json()
        
        # Validate required fields
        required_fields = ['plan', 'agentName', 'platform', 'customerEmail']
        for field in required_fields:
            if field not in order_data:
                return jsonify({"success": False, "error": f"Missing field: {field}"}), 400
        
        # Generate agent ID
        agent_id = generate_agent_id()
        
        # Add metadata
        order_data['agent_id'] = agent_id
        order_data['order_id'] = f"ORD-{agent_id}"
        order_data['created_at'] = datetime.now().isoformat()
        order_data['status'] = 'processing'
        
        # Save order
        if not save_order(order_data):
            return jsonify({"success": False, "error": "Failed to save order"}), 500
        
        # Start async deployment
        deployment_thread = threading.Thread(
            target=deploy_agent_async,
            args=(order_data, agent_id)
        )
        deployment_thread.start()
        
        # Return success response immediately
        return jsonify({
            "success": True,
            "message": "Order received and deployment started",
            "agent_id": agent_id,
            "order_id": order_data['order_id'],
            "url": f"https://nupi-cloud-agent-production.up.railway.app/agent/{agent_id}",
            "status": "deploying",
            "estimated_time": "2-3 minutes"
        }), 200
        
    except Exception as e:
        print(f"Error processing order: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/agent-orders/<agent_id>', methods=['GET'])
def get_agent_status(agent_id):
    """Get agent deployment status"""
    
    if not verify_api_key(request):
        return jsonify({"success": False, "error": "Invalid API key"}), 401
    
    try:
        # Load orders
        if os.path.exists(ORDERS_DB_FILE):
            with open(ORDERS_DB_FILE, 'r') as f:
                orders = json.load(f)
                
            # Find order
            for order in orders:
                if order.get('agent_id') == agent_id:
                    return jsonify({
                        "success": True,
                        "agent": order
                    })
        
        return jsonify({"success": False, "error": "Agent not found"}), 404
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/orders', methods=['GET'])
def list_orders():
    """List all orders"""
    
    if not verify_api_key(request):
        return jsonify({"success": False, "error": "Invalid API key"}), 401
    
    try:
        if os.path.exists(ORDERS_DB_FILE):
            with open(ORDERS_DB_FILE, 'r') as f:
                orders = json.load(f)
            return jsonify({"success": True, "orders": orders})
        else:
            return jsonify({"success": True, "orders": []})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/deployment-logs', methods=['GET'])
def get_deployment_logs():
    """Get deployment logs"""
    
    if not verify_api_key(request):
        return jsonify({"success": False, "error": "Invalid API key"}), 401
    
    try:
        if os.path.exists(DEPLOYMENT_LOG_FILE):
            with open(DEPLOYMENT_LOG_FILE, 'r') as f:
                logs = json.load(f)
            return jsonify({"success": True, "logs": logs})
        else:
            return jsonify({"success": True, "logs": []})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/', methods=['GET'])
def index():
    """API index"""
    return jsonify({
        "service": "NUPI Agent Order API",
        "version": "1.0.0",
        "endpoints": {
            "/health": "Health check",
            "/api/agent-orders": "POST - Create new agent order",
            "/api/agent-orders/<agent_id>": "GET - Get agent status",
            "/api/orders": "GET - List all orders",
            "/api/deployment-logs": "GET - View deployment logs"
        }
    })

if __name__ == '__main__':
    print("""
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║                  🚀 NUPI AGENT ORDER API - STARTING 🚀                        ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝

📍 Server: http://localhost:8080
🔐 API Key: {key}
📊 Endpoints: 6 routes active
⚡ Ready to process orders!

""".format(key=API_KEY[:20] + "..."))
    
    app.run(host='0.0.0.0', port=8080, debug=True)
