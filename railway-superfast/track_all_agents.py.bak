#!/usr/bin/env python3
"""
COMPREHENSIVE AGENT TRACKER
Tracks ALL agents, their locations, connections, and data flow
"""
import psutil
import socket
import requests
import json
from datetime import datetime
import time

CLOUD_URL = "https://nupidesktopai.com"
API_KEY = "NUPI_TRAVELLING_AGENT_KEY_MILITARY_c8f2a9e7b4d6f3a1e9c5b7d2f8a4e6c3"

def get_local_agents():
    """Find all running agent processes"""
    agents = []
    for proc in psutil.process_iter(['pid', 'name', 'cmdline', 'cpu_percent', 'memory_info']):
        try:
            cmdline = ' '.join(proc.info['cmdline'] or [])
            if 'travelling-agent' in cmdline.lower() or 'agent' in cmdline.lower():
                agents.append({
                    'pid': proc.info['pid'],
                    'name': proc.info['name'],
                    'command': cmdline[:100],
                    'cpu': proc.info['cpu_percent'],
                    'memory_mb': proc.info['memory_info'].rss / 1024 / 1024 if proc.info['memory_info'] else 0,
                    'status': proc.status(),
                    'location': 'LOCAL'
                })
        except:
            pass
    return agents

def test_cloud_connection():
    """Test connection to cloud agent"""
    try:
        resp = requests.get(f"{CLOUD_URL}/health", timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            return {
                'status': 'ONLINE',
                'cloud': data.get('cloud', 'Unknown'),
                'services': data.get('services', {}),
                'response_time_ms': resp.elapsed.total_seconds() * 1000
            }
        else:
            return {'status': 'ERROR', 'code': resp.status_code}
    except Exception as e:
        return {'status': 'OFFLINE', 'error': str(e)}

def get_network_connections():
    """Get all active network connections"""
    connections = []
    for conn in psutil.net_connections(kind='inet'):
        if conn.status == 'ESTABLISHED':
            try:
                connections.append({
                    'local': f"{conn.laddr.ip}:{conn.laddr.port}",
                    'remote': f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else "N/A",
                    'status': conn.status,
                    'pid': conn.pid
                })
            except:
                pass
    return connections

def check_api_endpoints():
    """Test all API endpoints"""
    endpoints = {
        '/health': 'GET',
        '/api/agent/register': 'POST',
        '/api/agents/locations': 'GET',
        '/api/collected-data/summary': 'GET'
    }
    
    results = {}
    for endpoint, method in endpoints.items():
        try:
            if method == 'GET':
                resp = requests.get(f"{CLOUD_URL}{endpoint}", timeout=3)
            else:
                resp = requests.post(
                    f"{CLOUD_URL}{endpoint}",
                    headers={'X-API-Key': API_KEY},
                    json={'agent_id': 'test', 'location': 'test'},
                    timeout=3
                )
            results[endpoint] = {
                'status': resp.status_code,
                'working': resp.status_code in [200, 201],
                'response': resp.text[:100]
            }
        except Exception as e:
            results[endpoint] = {'status': 'ERROR', 'working': False, 'error': str(e)[:50]}
    
    return results

def main():
    print("=" * 80)
    print("🔍 COMPREHENSIVE AGENT TRACKING - ALL CONNECTIONS & DATA ROUTES")
    print(f"⏰ Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    # 1. Local Agents
    print("\n📍 LOCAL AGENTS:")
    print("-" * 80)
    local_agents = get_local_agents()
    if local_agents:
        for agent in local_agents:
            print(f"  ✅ PID {agent['pid']}: {agent['name']}")
            print(f"     Command: {agent['command']}")
            print(f"     CPU: {agent['cpu']:.1f}% | Memory: {agent['memory_mb']:.1f} MB")
            print(f"     Status: {agent['status']} | Location: {agent['location']}")
            print()
    else:
        print("  ⚠️  No local agents found running!")
    
    # 2. Cloud Connection
    print("\n☁️  CLOUD AGENT CONNECTION:")
    print("-" * 80)
    cloud = test_cloud_connection()
    if cloud['status'] == 'ONLINE':
        print(f"  ✅ Cloud: {cloud.get('cloud', 'N/A')}")
        print(f"  ⚡ Response Time: {cloud.get('response_time_ms', 0):.1f}ms")
        print(f"  🔧 Services:")
        for service, status in cloud.get('services', {}).items():
            print(f"     - {service}: {status}")
    else:
        print(f"  ❌ Status: {cloud['status']}")
        if 'error' in cloud:
            print(f"     Error: {cloud['error']}")
    
    # 3. API Endpoints
    print("\n🔌 API ENDPOINT STATUS:")
    print("-" * 80)
    endpoints = check_api_endpoints()
    for endpoint, result in endpoints.items():
        status_icon = "✅" if result.get('working') else "❌"
        print(f"  {status_icon} {endpoint}")
        print(f"     Status: {result.get('status')}")
        if 'error' in result:
            print(f"     Error: {result['error']}")
    
    # 4. Network Connections
    print("\n🌐 ACTIVE NETWORK CONNECTIONS:")
    print("-" * 80)
    connections = get_network_connections()
    cloud_connections = [c for c in connections if any(x in c['remote'] for x in ['railway', 'nupi', ':443', ':80'])]
    if cloud_connections:
        for conn in cloud_connections[:10]:
            print(f"  🔗 {conn['local']} → {conn['remote']} (PID: {conn['pid']})")
    else:
        print("  ℹ️  No cloud connections detected")
    
    # 5. Data Flow Summary
    print("\n📊 DATA FLOW SUMMARY:")
    print("-" * 80)
    print(f"  Local Agents: {len(local_agents)}")
    print(f"  Cloud Status: {cloud['status']}")
    print(f"  Active Connections: {len(cloud_connections)}")
    print(f"  Working Endpoints: {sum(1 for e in endpoints.values() if e.get('working'))}/{len(endpoints)}")
    
    print("\n" + "=" * 80)
    print("✅ Tracking complete! All agent locations and routes documented.")
    print("=" * 80)

if __name__ == "__main__":
    main()
