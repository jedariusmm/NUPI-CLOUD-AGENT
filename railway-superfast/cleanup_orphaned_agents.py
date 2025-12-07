#!/usr/bin/env python3
"""
Clean up orphaned hex-ID agents from NUPI Cloud
These are old agents from previous runs with auto-generated IDs
"""
import requests

CLOUD_URL = "https://nupidesktopai.com"

# Orphaned hex-ID agents to identify and mark
ORPHANED_AGENTS = {
    "b7c80bf28a267eda": "travelling-agent-orphaned-1",
    "9da8e1df0cfb45df": "local-desktop-agent-orphaned-1",
    "793d974a00ea1fac": "travelling-agent-orphaned-2",
    "71d59eef3b27c3b6": "local-desktop-agent-orphaned-2",
    "01537bb0df2a85b1": "travelling-agent-orphaned-3",
    "c3b2016b9d422895": "local-desktop-agent-orphaned-3",
}

print("=" * 80)
print("HEX-ID AGENT IDENTIFICATION & CLEANUP")
print("=" * 80)

# Get current agents
response = requests.get(f"{CLOUD_URL}/api/agents/locations")
agents = response.json().get('agents', [])

print(f"\nTotal agents in cloud: {len(agents)}")

# Identify hex-ID agents
hex_agents = []
named_agents = []

for agent in agents:
    agent_id = agent.get('agent_id', '')
    if agent_id in ORPHANED_AGENTS:
        hex_agents.append(agent)
    elif len(agent_id) == 16 and not any(c.isupper() or c == '-' for c in agent_id):
        hex_agents.append(agent)
    else:
        named_agents.append(agent)

print(f"\nNamed agents (active): {len(named_agents)}")
for agent in named_agents:
    print(f"  ✓ {agent.get('agent_id')}")

print(f"\nOrphaned hex-ID agents (old runs): {len(hex_agents)}")
for agent in hex_agents:
    agent_id = agent.get('agent_id')
    identified_as = ORPHANED_AGENTS.get(agent_id, "unknown-orphaned-agent")
    registered = agent.get('registered_at', 'Unknown')[:19]
    print(f"  ✗ {agent_id} >> {identified_as} (Registered: {registered})")

print("\n" + "=" * 80)
print("IDENTIFICATION COMPLETE")
print("=" * 80)
print("\nThese hex-ID agents are from previous runs before unified naming.")
print("They have no location/network info and are no longer active.")
print("\nRecommendation: Keep for historical tracking, they will show as")
print("'CLOUD' agents in visualization but marked as orphaned/inactive.")
print("=" * 80)
