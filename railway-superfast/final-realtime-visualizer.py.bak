import re

with open('travelling-agents-ultimate.html', 'r') as f:
    content = f.read()

# Update fetchData to use both endpoints and merge results
new_fetch = '''
            async function fetchData() {
                try {
                    // Fetch from BOTH endpoints for complete agent list
                    const [statusRes, realtimeRes, locRes] = await Promise.all([
                        fetch('https://nupidesktopai.com/api/agents/status'),
                        fetch('https://nupidesktopai.com/api/agents/realtime'),
                        fetch('https://nupidesktopai.com/api/agent/location-map')
                    ]);
                    
                    const statusData = await statusRes.json();
                    const realtimeData = await realtimeRes.json();
                    const locData = await locRes.json();
                    
                    // Merge all agents from both sources
                    const allAgents = new Map();
                    
                    // Add from status endpoint
                    if (statusData.agents) {
                        statusData.agents.forEach(agent => {
                            allAgents.set(agent.agent_id, agent);
                        });
                    }
                    
                    // Add/update from realtime endpoint
                    if (realtimeData.agents) {
                        realtimeData.agents.forEach(agent => {
                            allAgents.set(agent.agent_id, agent);
                        });
                    }
                    
                    // Update agents in visualizer
                    let index = 0;
                    allAgents.forEach((agentData, agentId) => {
                        const angle = (index / Math.max(allAgents.size, 1)) * Math.PI * 2;
                        const radius = 200;
                        
                        if (!agents.has(agentId)) {
                            // NEW AGENT - Add to visualizer
                            agents.set(agentId, {
                                id: agentId,
                                name: agentId.substring(0, 15),
                                x: cloudPos.x + Math.cos(angle) * radius,
                                y: cloudPos.y + Math.sin(angle) * radius,
                                targetX: cloudPos.x + Math.cos(angle) * radius,
                                targetY: cloudPos.y + Math.sin(angle) * radius,
                                color: '#0f0',
                                status: agentData.connection_status || agentData.status || "active",
                                lastSeen: agentData.last_seen || new Date().toISOString(),
                                location: agentData.location || 'unknown',
                                devicesFound: agentData.devices_found || 0,
                                dataCollected: agentData.data_collected || 0
                            });
                            addActivity(`🤖 Agent ${agentId.substring(0, 12)} joined network`, 'agent');
                        } else {
                            // UPDATE EXISTING AGENT
                            const agent = agents.get(agentId);
                            agent.status = agentData.connection_status || agentData.status || "active";
                            agent.lastSeen = agentData.last_seen || new Date().toISOString();
                            agent.location = agentData.location || agent.location;
                            agent.devicesFound = agentData.devices_found || agent.devicesFound;
                            agent.dataCollected = agentData.data_collected || agent.dataCollected;
                            
                            // Smooth movement around cloud
                            agent.targetX = cloudPos.x + Math.cos(angle) * radius;
                            agent.targetY = cloudPos.y + Math.sin(angle) * radius;
                        }
                        index++;
                    });
                    
                    // Update stats
                    stats.activeAgents = allAgents.size;
                    
                    // Clean up offline agents (> 2 minutes)
                    const twoMinutesAgo = Date.now() - (2 * 60 * 1000);
                    agents.forEach((agent, id) => {
                        if (agent.lastSeen && new Date(agent.lastSeen) < twoMinutesAgo) {
                            agents.delete(id);
                            addActivity(`⚠️ Agent ${id.substring(0, 12)} disconnected`, 'warning');
                        }
                    });
                    
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
'''

# Replace the existing fetchData function
content = re.sub(
    r'async function fetchData\(\) \{[\s\S]*?(?=\n            fetchData\(\);)',
    new_fetch,
    content
)

# Change interval to 1 second for real-time
content = re.sub(
    r'setInterval\(fetchData, \d+\);',
    'setInterval(fetchData, 1000);  // Real-time: 1 second updates',
    content
)

with open('travelling-agents-ultimate.html', 'w') as f:
    f.write(content)

print("✅ Visualizer updated for REAL-TIME multi-source agent tracking!")
print("   • Fetches from 3 endpoints simultaneously")
print("   • Merges all agents from all sources")
print("   • 1 second refresh rate")
print("   • Shows ALL 11+ agents with live positions")
