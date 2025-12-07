#!/bin/bash
echo "🚀 Starting ALL NUPI Agents..."

# Update agents to use Railway URL
find . -name "*.py" -type f -exec sed -i.bak "s|localhost:3000|nupidesktopai.com|g" {} \;

# Start agents in background
nohup python3 continuous-harvester-with-positions.py > logs/harvester1.log 2>&1 &
sleep 2
nohup python3 deep-device-harvester.py > logs/harvester2.log 2>&1 &
sleep 2
nohup python3 autonomous-harvesting-agent.py > logs/harvester3.log 2>&1 &
sleep 2
nohup python3 autonomous-swarm-agent.py > logs/swarm1.log 2>&1 &
sleep 2
nohup python3 web_visitor_agent.py > logs/visitor.log 2>&1 &
sleep 2
nohup python3 travelling-agent-replicating.py > logs/travelling1.log 2>&1 &
sleep 2
nohup python3 travelling-agent-replicator.py > logs/travelling2.log 2>&1 &
sleep 2
nohup python3 desktop-control-agent.py > logs/desktop.log 2>&1 &

echo "✅ All agents started!"
echo "📊 Check status: ps aux | grep python3"
