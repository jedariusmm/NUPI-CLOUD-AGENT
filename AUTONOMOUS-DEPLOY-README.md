# 🤖 Autonomous Agent Creation & Deployment System

## Overview
Automatically create, configure, and deploy AI agents to Railway Cloud with **zero manual intervention**.

## 🚀 Quick Start

### Single Agent Deployment (Interactive)
```bash
./autonomous-agent-generator.py
```

### Single Agent Deployment (One Command)
```bash
./auto-deploy-agent.sh my-agent-name 12
```

### Batch Deployment (Multiple Agents)
```bash
./batch-deploy-agents.py
```

## 📋 Features

✅ **Automatic Code Generation** - Generates complete Python agent code
✅ **Docker Containerization** - Creates optimized Dockerfile
✅ **Railway Integration** - Auto-deploys to Railway Cloud
✅ **Environment Setup** - Configures API keys and variables
✅ **Health Monitoring** - Built-in health checks and auto-restart
✅ **Parallel Scanning** - High-performance network scanning
✅ **Cloud Sync** - Automatic data synchronization
✅ **Batch Deployment** - Deploy multiple agents at once

## 🎯 Usage Examples

### Example 1: Create Ultra-Fast Agent
```bash
./auto-deploy-agent.sh ultra-scanner-01 6 ultra
```
Creates an ultra-fast agent that scans every 6 seconds.

### Example 2: Create Standard Agent
```bash
./auto-deploy-agent.sh standard-agent-01 60 standard
```
Creates a standard agent that scans every 60 seconds.

### Example 3: Interactive Mode
```bash
python3 autonomous-agent-generator.py
```
Follow the prompts to customize your agent.

### Example 4: Deploy Agent Fleet
```bash
python3 batch-deploy-agents.py
```
Deploys 3 pre-configured agents:
- Ultra scanner (6s cycles)
- Fast scanner (12s cycles)  
- Standard scanner (60s cycles)

## 📂 File Structure

```
NUPI_Cloud_Agent/
├── autonomous-agent-generator.py   # Main generator script
├── auto-deploy-agent.sh           # Quick deploy CLI tool
├── batch-deploy-agents.py         # Batch deployment script
├── autonomous-agents/             # Generated agents directory
│   ├── agent-name-01/
│   │   ├── agent-name-01.py      # Agent code
│   │   ├── Dockerfile            # Container config
│   │   ├── requirements.txt      # Python dependencies
│   │   └── config.json           # Agent configuration
│   └── agent-name-02/
│       └── ...
```

## ⚙️ Agent Configuration

Each agent is configured with:

```json
{
  "agent_name": "my-agent",
  "agent_id": "unique-id",
  "agent_type": "fast",
  "scan_interval": 12,
  "network_range": "auto",
  "deployment": {
    "platform": "railway",
    "auto_deploy": true,
    "environment": "production"
  },
  "capabilities": {
    "network_scanning": true,
    "cloud_sync": true,
    "device_hopping": true,
    "parallel_execution": true,
    "auto_recovery": true
  }
}
```

## 🔧 Customization

### Agent Types
- **ultra**: 6-second scan cycles (20X faster)
- **fast**: 12-second scan cycles (10X faster)
- **standard**: 60-second scan cycles (2X faster)

### Scan Intervals
- Minimum: 5 seconds
- Maximum: 300 seconds (5 minutes)
- Default: 12 seconds

### Network Range
- Auto-detected based on local network
- Or specify custom range: "192.168.1.1-254"

## 🚀 Deployment Process

The autonomous system performs these steps automatically:

1. **Generate Configuration** - Creates agent ID and settings
2. **Generate Code** - Writes complete Python agent code
3. **Create Dockerfile** - Builds optimized container image
4. **Create Requirements** - Lists Python dependencies
5. **Save Files** - Writes all files to disk
6. **Initialize Railway** - Sets up Railway project
7. **Set Environment** - Configures API keys and variables
8. **Deploy** - Builds and deploys to Railway Cloud
9. **Verify** - Checks deployment status and gets domain

## 🌐 Railway Integration

### Prerequisites
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login
```

### Environment Variables
Automatically configured:
- `NUPI_API_KEY` - API authentication key
- `PORT` - Application port (8080)
- `PYTHONUNBUFFERED` - Python output buffering

### Domains
Each agent gets two domains:
- Primary: `https://nupidesktopai.com`
- Railway: `https://agent-name.railway.app`

## 📊 Monitoring

### Check Agent Status
```bash
cd autonomous-agents/agent-name
railway logs
```

### View All Agents
```bash
./check-all-agents.sh
```

### Railway Dashboard
Visit: https://railway.app/dashboard

## 🔐 Security

- API keys stored in Railway environment variables
- HTTPS-enabled endpoints
- Health check monitoring
- Auto-restart on failures
- Container isolation

## 🐛 Troubleshooting

### Deployment Fails
1. Check Railway CLI is installed: `railway --version`
2. Ensure logged in: `railway whoami`
3. Check Railway project: `railway status`

### Agent Not Responding
1. View logs: `railway logs`
2. Check health: `railway ps`
3. Restart: `railway restart`

### Manual Deployment
If auto-deploy fails:
```bash
cd autonomous-agents/agent-name
railway init
railway variables set NUPI_API_KEY=your-key
railway up
```

## 💡 Tips

- Use short, descriptive agent names
- Start with longer intervals, then optimize
- Deploy one agent first to test
- Monitor Railway logs during deployment
- Keep API keys secure

## 🎉 Success Indicators

✅ Agent code generated
✅ Docker files created
✅ Railway project initialized
✅ Environment variables set
✅ Container built successfully
✅ Deployment complete
✅ Domain assigned
✅ Agent responding to health checks

## 📚 Examples

### Deploy Development Agent
```bash
./auto-deploy-agent.sh dev-test-01 30 standard
```

### Deploy Production Fleet
```bash
python3 batch-deploy-agents.py
```

### Custom Configuration
```python
generator = AutonomousAgentGenerator()
config = generator.create_and_deploy_agent(
    agent_name="custom-agent",
    agent_type="ultra",
    scan_interval=5,
    auto_deploy=True
)
```

## 🚀 Ready to Deploy!

Start deploying autonomous agents to Railway Cloud now:

```bash
./auto-deploy-agent.sh my-first-agent 12
```

Your agent will be live in minutes! 🎊
