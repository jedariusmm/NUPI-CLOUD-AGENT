#!/bin/bash

# 🤖 QUICK AUTONOMOUS AGENT DEPLOYER
# One-command agent creation and deployment to Railway

cat << 'BANNER'
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        🚀 AUTONOMOUS AGENT QUICK DEPLOYER 🚀                   ║
║                                                                ║
║     One command to create and deploy agents to Railway        ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
BANNER

echo ""
echo "Usage examples:"
echo "  ./auto-deploy-agent.sh                    # Interactive mode"
echo "  ./auto-deploy-agent.sh fast-agent-01 12  # Quick deploy (name, interval)"
echo ""

# Parse arguments
AGENT_NAME="${1:-auto-agent-$(date +%s)}"
SCAN_INTERVAL="${2:-12}"
AGENT_TYPE="${3:-fast}"

echo "📝 Configuration:"
echo "   Name: $AGENT_NAME"
echo "   Scan Interval: ${SCAN_INTERVAL}s"
echo "   Type: $AGENT_TYPE"
echo ""

# Run Python generator
python3 autonomous-agent-generator.py << INPUT
$AGENT_NAME
$AGENT_TYPE
$SCAN_INTERVAL
y
INPUT

echo ""
echo "✅ Autonomous deployment complete!"
