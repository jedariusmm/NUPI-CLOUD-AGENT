import re

with open('travelling-agents-ultimate.html', 'r') as f:
    content = f.read()

# Find the agents update section and replace it
old_pattern = r'(if \(agentsData\.agents\) \{[\s\S]*?agentsData\.agents\.forEach\(\(agentData, index\) => \{[\s\S]*?if \(!agents\.has\(agentData\.agent_id\)\) \{)([\s\S]*?)(\}\s*\}\);)'

new_code = r'''\1
                            // ALWAYS UPDATE OR ADD AGENTS
                            const angle = (index / Math.max(agentsData.agents.length, 1)) * Math.PI * 2;
                            const radius = 200;
                            
                            if (!agents.has(agentData.agent_id)) {
                                // NEW AGENT
                                agents.set(agentData.agent_id, {
                                    id: agentData.agent_id,
                                    name: agentData.agent_id.substring(0, 12),
                                    x: cloudPos.x + Math.cos(angle) * radius,
                                    y: cloudPos.y + Math.sin(angle) * radius,
                                    targetX: cloudPos.x + Math.cos(angle) * radius,
                                    targetY: cloudPos.y + Math.sin(angle) * radius,
                                    color: '#0f0',
                                    status: agentData.connection_status || agentData.status || "active",
                                    lastSeen: agentData.last_seen || Date.now()
                                });
                                addActivity(`�� Agent ${agentData.agent_id.substring(0, 12)} joined`, 'agent');
                            } else {
                                // UPDATE EXISTING AGENT
                                const agent = agents.get(agentData.agent_id);
                                agent.status = agentData.connection_status || agentData.status || "active";
                                agent.lastSeen = agentData.last_seen || Date.now();
                                // Keep moving
                                agent.targetX = cloudPos.x + Math.cos(angle) * radius;
                                agent.targetY = cloudPos.y + Math.sin(angle) * radius;
                            }
                        });
                        
                        // Remove offline agents after 5 minutes
                        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
                        agents.forEach((agent, id) => {
                            if (agent.lastSeen && new Date(agent.lastSeen) < fiveMinutesAgo) {
                                agents.delete(id);
                                addActivity(`⚠️ Agent ${id.substring(0, 12)} timed out`, 'warning');
                            }\3'''

content = re.sub(old_pattern, new_code, content, flags=re.MULTILINE)

with open('travelling-agents-ultimate.html', 'w') as f:
    f.write(content)

print("✅ Visualizer updated to always show all active agents!")
