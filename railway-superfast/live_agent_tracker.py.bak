#!/usr/bin/env python3
"""
COMPLETE NETWORK & SYSTEM VISUALIZATION
Real-time tracking of ALL agents including NUPI CLOUD AGENT
Shows agent movement, device locations, and system status
"""
import requests
import time
import os
from datetime import datetime

CLOUD_URL = "https://nupidesktopai.com"

def clear_screen():
    os.system('clear')

def get_status_indicator(status, last_seen):
    """Get status indicator based on agent status and activity"""
    if status == "active":
        # Check if recently seen (within 1 minute)
        try:
            # Parse ISO format timestamp manually
            if 'T' in last_seen:
                time_parts = last_seen.split('T')
                if len(time_parts) == 2:
                    date_part = time_parts[0]
                    time_part = time_parts[1].split('.')[0]
                    last_time = datetime.strptime(f"{date_part} {time_part}", "%Y-%m-%d %H:%M:%S")
                    now = datetime.now()
                    diff = (now - last_time).total_seconds()
                    if diff < 60:
                        return "[ACTIVE]"  # Green - actively reporting
                    elif diff < 300:
                        return "[IDLE]"    # Yellow - last seen < 5 min
                    else:
                        return "[STALE]"   # Orange - last seen > 5 min
        except:
            pass
        return "[ACTIVE]"
    elif status == "moving":
        return "[MOVING]"  # Traveling
    elif status == "scanning":
        return "[SCANNING]"  # Active scan
    else:
        return "[OFFLINE]"  # Not responding

def get_location_type(network, location):
    """Determine location type"""
    if not network or network == "Unknown":
        if not location:
            return "CLOUD"
        return "UNKNOWN"
    
    if "all-networks" in str(network).lower():
        return "MASTER"
    elif "192.168" in str(network):
        return "LOCAL-NET"
    elif "multi-hop" in str(network).lower():
        return "MULTI-NET"
    elif "local-system" in str(network).lower():
        return "LOCALHOST"
    elif "cloud" in str(network).lower():
        return "CLOUD"
    else:
        return "REMOTE"

def show_complete_visualization():
    """Display complete network and system visualization"""
    clear_screen()
    
    print("=" * 120)
    print("COMPLETE NETWORK & SYSTEM VISUALIZATION - REAL-TIME AGENT TRACKING")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 120)
    
    try:
        # Get all agents
        response = requests.get(f"{CLOUD_URL}/api/agents/locations", timeout=5)
        if response.status_code != 200:
            print(f"\nERROR: Cannot connect to NUPI CLOUD AGENT (Status: {response.status_code})")
            return
        
        data = response.json()
        agents = data.get('agents', [])
        cloud_name = data.get('cloud', 'nupidesktopai.com')
        
        if not agents:
            print("\nWARNING: No agents registered yet")
            return
        
        # Categorize agents by location
        cloud_agents = []
        local_agents = []
        remote_agents = []
        unknown_agents = []
        
        for agent in agents:
            location = agent.get('location')
            network = agent.get('network', '')
            loc_type = get_location_type(network, location)
            
            if loc_type == "CLOUD" or not location:
                cloud_agents.append(agent)
            elif loc_type in ["LOCAL-NET", "LOCALHOST", "MASTER"]:
                local_agents.append(agent)
            elif loc_type in ["MULTI-NET", "REMOTE"]:
                remote_agents.append(agent)
            else:
                unknown_agents.append(agent)
        
        # HEADER: NUPI CLOUD AGENT STATUS
        print("\n" + "+" + "=" * 118 + "+")
        print("|" + " " * 45 + "NUPI CLOUD AGENT" + " " * 57 + "|")
        print("|" + " " * 40 + f"[{cloud_name}]" + " " * (78 - len(cloud_name)) + "|")
        print("+" + "=" * 118 + "+")
        print(f"| Status: [ONLINE]  |  Total Agents: {len(agents):<3}  |  Cloud Agents: {len(cloud_agents):<3}  |  Local: {len(local_agents):<3}  |  Remote: {len(remote_agents):<3}  |")
        print("+" + "=" * 118 + "+")
        
        # SECTION 1: NUPI CLOUD AGENT (Agents on cloud)
        if cloud_agents:
            print("\n" + "-" * 120)
            print(f"AGENTS ON NUPI CLOUD [{len(cloud_agents)} agents]")
            print("-" * 120)
            for agent in cloud_agents:
                agent_id = agent.get('agent_id', 'Unknown')
                status = agent.get('status', 'unknown')
                last_seen = agent.get('last_seen', 'Never')
                devices = agent.get('devices_found', 0)
                scans = agent.get('scans_completed', 0)
                network = agent.get('network', 'Unknown')
                
                status_ind = get_status_indicator(status, last_seen)
                
                print(f"\n  {status_ind} {agent_id}")
                print(f"    Location: CLOUD ({cloud_name})")
                print(f"    Network: {network}")
                print(f"    Activity: {devices} devices | {scans} scans")
                print(f"    Last Contact: {last_seen[:19] if len(last_seen) > 19 else last_seen}")
        
        # SECTION 2: LOCAL NETWORK AGENTS
        if local_agents:
            print("\n" + "-" * 120)
            print(f"LOCAL NETWORK AGENTS [{len(local_agents)} agents]")
            print("-" * 120)
            for agent in local_agents:
                agent_id = agent.get('agent_id', 'Unknown')
                location = agent.get('location', 'Unknown')
                network = agent.get('network', 'Unknown')
                status = agent.get('status', 'unknown')
                last_seen = agent.get('last_seen', 'Never')
                devices = agent.get('devices_found', 0)
                scans = agent.get('scans_completed', 0)
                
                status_ind = get_status_indicator(status, last_seen)
                loc_type = get_location_type(network, location)
                
                print(f"\n  {status_ind} {agent_id}")
                print(f"    Location: {location} [{loc_type}]")
                print(f"    Network: {network}")
                print(f"    Activity: {devices} devices | {scans} scans")
                print(f"    Last Contact: {last_seen[:19] if len(last_seen) > 19 else last_seen}")
                
                # Show movement if active
                if scans > 0:
                    print(f"    Movement: SCANNING >> {network}")
                if devices > 0:
                    print(f"    Harvesting: {devices} devices discovered")
        
        # SECTION 3: REMOTE/MULTI-NETWORK AGENTS
        if remote_agents:
            print("\n" + "-" * 120)
            print(f"REMOTE & MULTI-NETWORK AGENTS [{len(remote_agents)} agents]")
            print("-" * 120)
            for agent in remote_agents:
                agent_id = agent.get('agent_id', 'Unknown')
                location = agent.get('location', 'Unknown')
                network = agent.get('network', 'Unknown')
                status = agent.get('status', 'unknown')
                last_seen = agent.get('last_seen', 'Never')
                devices = agent.get('devices_found', 0)
                scans = agent.get('scans_completed', 0)
                
                status_ind = get_status_indicator(status, last_seen)
                loc_type = get_location_type(network, location)
                
                print(f"\n  {status_ind} {agent_id}")
                print(f"    Location: {location} [{loc_type}]")
                print(f"    Network: {network}")
                print(f"    Activity: {devices} devices | {scans} scans")
                print(f"    Last Contact: {last_seen[:19] if len(last_seen) > 19 else last_seen}")
                print(f"    Movement: HOPPING between networks")
        
        # SECTION 4: UNKNOWN/UNIDENTIFIED AGENTS
        if unknown_agents:
            print("\n" + "-" * 120)
            print(f"UNIDENTIFIED AGENTS [{len(unknown_agents)} agents - Need Classification]")
            print("-" * 120)
            for agent in unknown_agents:
                agent_id = agent.get('agent_id', 'Unknown')
                status = agent.get('status', 'unknown')
                last_seen = agent.get('last_seen', 'Never')
                
                status_ind = get_status_indicator(status, last_seen)
                
                print(f"\n  {status_ind} {agent_id}")
                print(f"    Location: UNKNOWN")
                print(f"    Last Contact: {last_seen[:19] if len(last_seen) > 19 else last_seen}")
                print(f"    Status: Needs location update")
        
        # SECTION 5: DISCOVERED DEVICES
        print("\n" + "=" * 120)
        print("DISCOVERED DEVICES & NETWORK MAP")
        print("=" * 120)
        
        data_response = requests.get(f"{CLOUD_URL}/api/collected-data/summary", timeout=5)
        if data_response.status_code == 200:
            summary = data_response.json()
            recent = summary.get('recent_data', [])
            total_devices = summary.get('total_devices', 0)
            
            print(f"\nTotal Devices Discovered: {total_devices}")
            
            if recent:
                print("\nRecent Discoveries:")
                for activity in recent[:5]:
                    agent_id = activity.get('agent_id', 'Unknown')
                    timestamp = activity.get('timestamp', 'Unknown')[:19]
                    devices_data = activity.get('data', {}).get('devices', [])
                    
                    if devices_data:
                        print(f"\n  [{timestamp}] {agent_id} discovered {len(devices_data)} device(s):")
                        for device in devices_data:
                            ip = device.get('ip', 'Unknown')
                            hostname = device.get('hostname', 'Unknown')
                            print(f"    >> {ip:15} | {hostname}")
        
        # SECTION 6: MOVEMENT TRACKING
        print("\n" + "=" * 120)
        print("AGENT MOVEMENT TRACKING")
        print("=" * 120)
        
        active_movement = []
        for agent in agents:
            scans = agent.get('scans_completed', 0)
            devices = agent.get('devices_found', 0)
            if scans > 0 or devices > 0:
                active_movement.append(agent)
        
        if active_movement:
            print("\nAgents Currently Active:")
            for agent in active_movement:
                agent_id = agent.get('agent_id', 'Unknown')
                location = agent.get('location', 'Unknown')
                network = agent.get('network', 'Unknown')
                scans = agent.get('scans_completed', 0)
                devices = agent.get('devices_found', 0)
                
                print(f"\n  {agent_id}")
                print(f"    Current Location: {location}")
                print(f"    Scanning: {network}")
                print(f"    Progress: {scans} scans >> {devices} devices found")
        else:
            print("\nNo active movement detected. Agents in standby mode.")
        
        # FOOTER: STATUS LEGEND
        print("\n" + "=" * 120)
        print("STATUS INDICATORS: [ACTIVE]=Responding  [IDLE]=Standby  [STALE]=Slow Response  [OFFLINE]=Not Responding")
        print("LOCATION TYPES: CLOUD=Cloud Server  LOCAL-NET=Local Network  MULTI-NET=Multiple Networks  LOCALHOST=This Device")
        print("=" * 120)
        
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
    
    print("\nRefreshing in 3 seconds... (Press Ctrl+C to stop)")
    print("=" * 120)

def main():
    print("=" * 120)
    print("INITIALIZING COMPLETE NETWORK & SYSTEM VISUALIZATION")
    print("=" * 120)
    print("\nConnecting to NUPI CLOUD AGENT...")
    print(f"Cloud URL: {CLOUD_URL}")
    print("\nStarting real-time monitoring...")
    time.sleep(2)
    
    try:
        while True:
            show_complete_visualization()
            time.sleep(3)
    except KeyboardInterrupt:
        clear_screen()
        print("\n" + "=" * 120)
        print("VISUALIZATION STOPPED")
        print("=" * 120)
        print("\nFinal Status: All agents tracked")
        print(f"Connection: {CLOUD_URL}")
        print("\nSession ended.")
        print("=" * 120)

if __name__ == "__main__":
    main()
