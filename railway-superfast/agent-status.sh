#!/bin/bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 NUPI AGENT SYSTEM STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 RUNNING AGENTS:"
ps aux | grep -E "autonomous-harvesting|stealth-agent|travelling-agent|local-desktop|web_visitor|unified_agent" | grep -v grep | while read line; do
    pid=$(echo "$line" | awk '{print $2}')
    agent=$(echo "$line" | grep -oE "(autonomous-harvesting-agent|stealth-agent-telegram|travelling-agent-[a-z]+|local-desktop-agent-smart|web_visitor_agent|unified_agent_system)\.py" | head -1)
    echo "  ✅ $agent (PID: $pid)"
done
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
total=$(ps aux | grep -E "autonomous-harvesting|stealth-agent|travelling-agent|local-desktop|web_visitor|unified_agent" | grep -v grep | wc -l | tr -d ' ')
echo "📈 Total Agents Running: $total"
echo ""
echo "☁️  NUPI Cloud: https://nupidesktopai.com"
echo "👁️  Visualizer: https://nupidesktopai.com/travelling-agents-ultimate.html"
echo "🔑 Password: Jedariusm"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 CHECKING CLOUD REGISTRATION:"
curl -s https://nupidesktopai.com/api/agents/status | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'  📡 {len(data[\"agents\"])} agents registered in cloud'); [print(f'    • {a[\"agent_id\"][:20]}... ({a[\"connection_status\"]})') for a in data['agents'][:10]]"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
