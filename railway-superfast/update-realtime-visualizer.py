import re

with open('travelling-agents-ultimate.html', 'r') as f:
    content = f.read()

# Add real-time agent movement animation
realtime_code = '''
        // REAL-TIME AGENT MOVEMENT
        function updateAgentPositions() {
            agents.forEach((agent, id) => {
                // Smooth movement to target
                if (agent.x !== agent.targetX || agent.y !== agent.targetY) {
                    const dx = agent.targetX - agent.x;
                    const dy = agent.targetY - agent.y;
                    agent.x += dx * 0.1;  // Smooth interpolation
                    agent.y += dy * 0.1;
                }
            });
        }
        
        // REAL-TIME STATUS INDICATORS
        function getAgentColor(status, lastSeen) {
            const now = Date.now();
            const lastSeenTime = new Date(lastSeen || now).getTime();
            const secondsAgo = (now - lastSeenTime) / 1000;
            
            if (secondsAgo < 10) return '#0f0';  // Bright green - active (< 10s)
            if (secondsAgo < 30) return '#7f7';  // Light green - recent (< 30s)
            if (secondsAgo < 60) return '#ff0';  // Yellow - warning (< 1m)
            return '#f70';  // Orange - offline
        }
        
        // Update animation loop to include agent movement
        const originalAnimate = animate;
        function animate() {
            updateAgentPositions();
            originalAnimate();
        }
'''

# Find the animate function and inject real-time updates
if 'function animate()' in content:
    # Add before the animate function
    content = content.replace(
        'function animate() {',
        realtime_code + '\n        function originalAnimateFunc() {'
    )
    
    # Update color assignment to use real-time status
    content = re.sub(
        r"ctx\.fillStyle = agent\.color \|\| '#0f0';",
        "ctx.fillStyle = getAgentColor(agent.status, agent.lastSeen);",
        content
    )

# Reduce fetch interval to 1 second for real-time updates
content = re.sub(
    r'setInterval\(fetchData, \d+\);',
    'setInterval(fetchData, 1000);  // 1 second for real-time',
    content
)

with open('travelling-agents-ultimate.html', 'w') as f:
    f.write(content)

print("✅ Visualizer updated for REAL-TIME tracking!")
print("   • 1 second refresh rate")
print("   • Smooth agent movement")
print("   • Live status indicators")
print("   • Color-coded activity levels")
