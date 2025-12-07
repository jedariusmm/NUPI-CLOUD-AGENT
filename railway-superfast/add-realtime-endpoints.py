# Add real-time endpoints to app.py

import_code = '''
# Add after other imports
from collections import defaultdict
import time

# Real-time agent tracking
agent_realtime_status = {}
agent_last_heartbeat = {}
'''

status_endpoint = '''

@app.route('/api/agent/status', methods=['POST'])
def update_agent_status():
    """Real-time agent status updates (no restrictions)"""
    try:
        data = request.json
        agent_id = data.get('agent_id')
        
        # Update real-time status
        agent_realtime_status[agent_id] = {
            'agent_id': agent_id,
            'location': data.get('location'),
            'status': data.get('status', 'active'),
            'devices_found': data.get('devices_found', 0),
            'data_collected': data.get('data_collected', 0),
            'travel_count': data.get('travel_count', 0),
            'other_agents': data.get('other_agents', 0),
            'last_seen': datetime.utcnow().isoformat(),
            'connection_status': 'online'
        }
        
        agent_last_heartbeat[agent_id] = time.time()
        
        # Also register in main registry
        if agent_id not in agents_registry:
            agents_registry[agent_id] = agent_realtime_status[agent_id]
        else:
            agents_registry[agent_id].update(agent_realtime_status[agent_id])
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/agents/realtime', methods=['GET'])
def get_realtime_agents():
    """Get all agents with real-time status"""
    try:
        # Clean up offline agents (no heartbeat > 60s)
        current_time = time.time()
        for agent_id in list(agent_last_heartbeat.keys()):
            if current_time - agent_last_heartbeat[agent_id] > 60:
                if agent_id in agent_realtime_status:
                    agent_realtime_status[agent_id]['connection_status'] = 'offline'
        
        # Return all agents
        all_agents = []
        
        # Add real-time tracked agents
        for agent_id, status in agent_realtime_status.items():
            all_agents.append(status)
        
        # Add registry agents not in real-time
        for agent_id, status in agents_registry.items():
            if agent_id not in agent_realtime_status:
                all_agents.append(status)
        
        return jsonify({
            'success': True,
            'agents': all_agents,
            'count': len(all_agents)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})
'''

# Read app.py
with open('app.py', 'r') as f:
    content = f.read()

# Check if already added
if 'agent_realtime_status' not in content:
    # Add imports after Flask setup
    if 'app = Flask(__name__)' in content:
        content = content.replace(
            'app = Flask(__name__)',
            'app = Flask(__name__)\n' + import_code
        )
    
    # Add endpoints before the main block
    if 'if __name__ == "__main__":' in content:
        content = content.replace(
            'if __name__ == "__main__":',
            status_endpoint + '\n\nif __name__ == "__main__":'
        )
    
    with open('app.py', 'w') as f:
        f.write(content)
    
    print("✅ Added real-time agent tracking endpoints!")
    print("   • POST /api/agent/status - Real-time status updates")
    print("   • GET /api/agents/realtime - All agents with live status")
else:
    print("✅ Real-time endpoints already exist!")
