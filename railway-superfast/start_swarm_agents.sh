#!/bin/bash
echo "🌐 STARTING AUTONOMOUS SWARM AGENTS"
echo "===================================="
echo ""
echo "Mode: COMPLETE AUTONOMY"
echo "- No API restrictions"
echo "- Peer-to-peer discovery"
echo "- Real-time travel"
echo "- Live broadcasting"
echo ""

# Start 5 swarm agents
for i in {1..5}; do
    nohup python3 -u autonomous-swarm-agent.py > logs/swarm-$i.log 2>&1 &
    pid=$!
    echo "✅ Swarm Agent $i started (PID: $pid)"
    sleep 2
done

echo ""
echo "📊 Total agents now:"
ps aux | grep -E "(autonomous|stealth|travelling|desktop|swarm|unified)" | grep "\.py" | grep -v grep | wc -l

echo ""
echo "✅ All swarm agents launched!"
echo "🔊 Broadcasting on port 9999"
echo "📡 Auto-discovering each other"
