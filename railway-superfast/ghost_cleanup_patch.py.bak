# Add this to web_server_with_agent.py after imports

from datetime import datetime, timedelta
import threading
import time

# Ghost agent cleanup configuration
GHOST_AGENT_TIMEOUT = 300  # 5 minutes - agents not seen for this long are marked as ghost
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
                            if not agent_data.get('location') and agent_data.get('network') == 'Unknown':
                                del agents_registry[agent_id]
                                ghosts_removed.append(agent_id)
                                print(f"🗑️  Removed ghost agent: {agent_id} (orphaned, not seen for {int(time_diff)}s)")
                            # Or mark as inactive but keep for history
                            else:
                                agents_registry[agent_id]['status'] = 'inactive'
                                print(f"⚠️  Marked agent inactive: {agent_id} (not seen for {int(time_diff)}s)")
                    except:
                        pass
            
            if ghosts_removed:
                print(f"✅ Cleanup complete: Removed {len(ghosts_removed)} ghost agent(s)")
                
        except Exception as e:
            print(f"❌ Ghost cleanup error: {e}")

# Start cleanup thread when app starts
cleanup_thread = threading.Thread(target=cleanup_ghost_agents, daemon=True)
cleanup_thread.start()
print("🧹 Ghost agent cleanup thread started (checking every 60s)")
