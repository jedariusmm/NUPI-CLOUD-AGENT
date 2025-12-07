const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for device data
let deviceData = {
    scan_time: new Date().toISOString(),
    network: '192.168.12.x',
    total_devices: 0,
    devices: []
};

// REAL AGENT TRACKING STORAGE
let agentPositions = new Map(); // agent_id -> {position, action, timestamp, target_ip}
let agentHistory = new Map(); // agent_id -> [{position, timestamp}...] (last 10 positions)

// COMPUTER CONTROL STORAGE
let computers = new Map(); // computer_id -> {computer_id, platform, hostname, status, timestamp}
let commandQueue = new Map(); // computer_id -> [{id, type, command, ...}]
let commandResults = new Map(); // command_id -> {status, output, timestamp}

// Visitor tracking
let visitors = [];

// Load existing data if available
try {
    const files = fs.readdirSync('.')
        .filter(f => f.startsWith('deep-harvest-') && f.endsWith('.json'))
        .sort()
        .reverse();
    
    if (files.length > 0) {
        const latestFile = files[0];
        const data = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
        deviceData = data;
        console.log(`📂 Loaded ${data.total_devices} devices from ${latestFile}`);
    }
} catch (err) {
    console.log('📂 No existing data found, starting fresh');
}

// ============================================
// REAL AGENT POSITION TRACKING
// ============================================

// POST - Agent reports its current position/action
app.post('/api/agent/position', (req, res) => {
    const { agent_id, agent_type, position, action, target_ip, status } = req.body;
    
    if (!agent_id) {
        return res.status(400).json({ error: 'agent_id required' });
    }
    
    const timestamp = new Date().toISOString();
    const agentData = {
        agent_id,
        agent_type: agent_type || 'Unknown',
        position: position || { x: 0, y: 0 },
        action: action || 'Idle',
        target_ip: target_ip || null,
        status: status || 'active',
        timestamp,
        last_update: Date.now()
    };
    
    // Store current position
    agentPositions.set(agent_id, agentData);
    
    // Store in history (keep last 10 positions)
    if (!agentHistory.has(agent_id)) {
        agentHistory.set(agent_id, []);
    }
    const history = agentHistory.get(agent_id);
    history.push({ position, timestamp, action, target_ip });
    if (history.length > 10) {
        history.shift(); // Remove oldest
    }
    
    console.log(`🤖 Agent ${agent_id}: ${action} ${target_ip || ''}`);
    res.json({ success: true, timestamp });
});

// GET - Get all active agents with REAL positions
app.get('/api/agents', (req, res) => {
    const now = Date.now();
    const activeAgents = [];
    
    // Clean up stale agents (no update in 60 seconds = offline)
    for (const [agent_id, data] of agentPositions.entries()) {
        if (now - data.last_update > 60000) {
            agentPositions.delete(agent_id);
            console.log(`🔴 Agent ${agent_id} went offline`);
        } else {
            activeAgents.push(data);
        }
    }
    
    res.json({
        agents: activeAgents,
        count: activeAgents.length,
        timestamp: new Date().toISOString()
    });
});

// GET - Get agent history/trail
app.get('/api/agent/:agent_id/history', (req, res) => {
    const { agent_id } = req.params;
    const history = agentHistory.get(agent_id) || [];
    
    res.json({
        agent_id,
        history,
        count: history.length
    });
});

// ============================================
// DEVICE DATA ENDPOINTS
// ============================================

// GET device data
app.get('/api/devices', (req, res) => {
    res.json(deviceData);
});

// POST device data (from harvesters)
app.post('/api/devices', (req, res) => {
    deviceData = {
        ...req.body,
        scan_time: new Date().toISOString()
    };
    console.log(`📊 Updated device data: ${deviceData.total_devices} devices`);
    res.json({ success: true, timestamp: deviceData.scan_time });
});

// GET statistics
app.get('/api/stats', (req, res) => {
    // Defensive: ensure devices is an array
    const devices = Array.isArray(deviceData?.devices) ? deviceData.devices : [];
    
    const stats = {
        total_devices: deviceData.total_devices || 0,
        network: deviceData.network || '192.168.12.x',
        last_scan: deviceData.scan_time,
        rokus: devices.filter(d => d.device_type === 'Roku').length,
        computers: devices.filter(d => 
            d.device_type === 'Mac' || d.device_type === 'Computer'
        ).length,
        routers: devices.filter(d => d.device_type === 'Router').length,
        phones: devices.filter(d => 
            d.device_type === 'iOS' || d.device_type === 'Android'
        ).length,
        total_open_ports: devices.reduce((sum, d) => 
            sum + (d.open_ports?.length || 0), 0
        ),
        active_agents: agentPositions.size,
        visitors_tracked: visitors.length
    };
    
    res.json(stats);
});

// ============================================
// VISITOR TRACKING
// ============================================

app.get('/track', (req, res) => {
    const visitor = {
        ip: req.ip || req.connection.remoteAddress,
        user_agent: req.headers['user-agent'],
        referer: req.headers['referer'] || req.headers['referrer'],
        accept_language: req.headers['accept-language'],
        timestamp: new Date().toISOString()
    };
    
    visitors.push(visitor);
    console.log(`👁️  Visitor tracked: ${visitor.ip} - ${visitor.user_agent}`);
    res.sendStatus(200);
});

app.post('/track', (req, res) => {
    const visitor = {
        ip: req.ip || req.connection.remoteAddress,
        ...req.body,
        timestamp: new Date().toISOString()
    };
    
    visitors.push(visitor);
    console.log(`👁️  Visitor tracked: ${visitor.ip}`);
    res.json({ success: true });
});

app.get('/api/visitors', (req, res) => {
    res.json({
        count: visitors.length,
        visitors: visitors.slice(-100), // Last 100 visitors
        timestamp: new Date().toISOString()
    });
});

// ============================================
// COMPUTER CONTROL API
// ============================================

// Receive heartbeat from desktop agents
app.post('/api/control/heartbeat', (req, res) => {
    const { computer_id, platform, hostname, status } = req.body;
    
    computers.set(computer_id, {
        computer_id,
        platform,
        hostname,
        status: status || 'online',
        timestamp: new Date().toISOString()
    });
    
    console.log(`💓 Heartbeat from ${computer_id} (${platform})`);
    res.json({ success: true });
});

// Get commands for a specific computer
app.get('/api/control/commands/:computer_id', (req, res) => {
    const { computer_id } = req.params;
    const queue = commandQueue.get(computer_id) || [];
    
    // Send commands and clear queue
    commandQueue.set(computer_id, []);
    
    res.json({ commands: queue });
});

// Receive command results from desktop agent
app.post('/api/control/results', (req, res) => {
    const { command_id, status, output } = req.body;
    
    commandResults.set(command_id, {
        status,
        output,
        timestamp: new Date().toISOString()
    });
    
    console.log(`📥 Result for command ${command_id}: ${status}`);
    res.json({ success: true });
});

// Get list of connected computers
app.get('/api/control/computers', (req, res) => {
    // Clean up stale computers (> 2 minutes old)
    const now = Date.now();
    for (const [id, comp] of computers.entries()) {
        if (now - new Date(comp.timestamp).getTime() > 120000) {
            computers.delete(id);
        }
    }
    
    res.json({
        computers: Array.from(computers.values()),
        count: computers.size
    });
});

// Queue a command for execution
app.post('/api/control/execute', (req, res) => {
    const { computer_id, type, command } = req.body;
    
    if (!computer_id || !type) {
        return res.status(400).json({ success: false, message: 'Missing computer_id or type' });
    }
    
    const cmd = {
        id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        command,
        queued_at: new Date().toISOString()
    };
    
    const queue = commandQueue.get(computer_id) || [];
    queue.push(cmd);
    commandQueue.set(computer_id, queue);
    
    console.log(`📤 Queued ${type} command for ${computer_id}`);
    res.json({ success: true, command_id: cmd.id });
});

// ============================================
// HEALTH & STATUS
// ============================================

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        devices: deviceData.total_devices,
        active_agents: agentPositions.size,
        visitors: visitors.length,
        network: deviceData.network,
        timestamp: new Date().toISOString()
    });
});

// ============================================
// AUTONOMOUS CHAT AGENT ENDPOINT
// ============================================
let ChatAgent, chatAgent;

// Simple Claude API proxy (no dependencies needed)
const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

async function callClaude(messages, model = 'claude-3-5-sonnet-20241022') {
    if (!CLAUDE_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model: model,
        max_tokens: 4096,
        system: `You are NUPI Assistant, an autonomous AI agent for network monitoring. You help manage network agents, analyze device data, and provide technical assistance. Be concise and helpful.`,
        messages: messages
    }, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01'
        }
    });

    return response.data;
}

console.log('✅ Claude API proxy ready');

app.post('/api/chat', async (req, res) => {
    try {
        const { message, messages, model } = req.body;

        if (!message && (!messages || messages.length === 0)) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log(`💬 Chat request: "${message ? message.substring(0, 50) : 'conversation'}..."`);

        // Build context
        let contextInfo = `\n\nCurrent system status:\n`;
        contextInfo += `- Active agents: ${agentPositions.size}\n`;
        contextInfo += `- Devices tracked: ${deviceData.total_devices || 0}\n`;
        contextInfo += `- Network: ${deviceData.network || '192.168.12.x'}\n`;

        // Prepare messages array
        let conversationMessages = messages || [];
        if (message) {
            conversationMessages.push({ 
                role: 'user', 
                content: message + contextInfo 
            });
        }

        // Call Claude
        const result = await callClaude(conversationMessages, model);

        res.json({
            success: true,
            response: result.content[0].text,
            model: result.model,
            usage: result.usage
        });
    } catch (error) {
        console.error('❌ Chat error:', error);
        res.status(500).json({ 
            error: error.message,
            success: false
        });
    }
});

app.get('/api/chat/history', (req, res) => {
    if (!chatAgent) {
        return res.status(503).json({ error: 'Chat agent not available' });
    }
    res.json({
        history: chatAgent.conversationHistory,
        count: chatAgent.conversationHistory.length
    });
});

app.post('/api/chat/clear', (req, res) => {
    if (!chatAgent) {
        return res.status(503).json({ error: 'Chat agent not available' });
    }
    chatAgent.clearHistory();
    res.json({ success: true, message: 'Chat history cleared' });
});

// ============================================
// DESKTOP CONTROL SYSTEM (LEGACY - Now using /api/control/* endpoints)
// ============================================
let desktopAgents = new Map(); // agent_id -> agent_data
let pendingCommands = new Map(); // agent_id -> [commands]

app.post('/api/desktop/register', (req, res) => {
    const { agent_id, hostname, platform, system_info, capabilities } = req.body;
    
    desktopAgents.set(agent_id, {
        agent_id,
        hostname,
        platform,
        system_info,
        capabilities,
        status: 'active',
        last_seen: Date.now(),
        registered_at: Date.now()
    });
    
    console.log(`🖥️  Desktop registered: ${hostname} (${agent_id})`);
    
    res.json({
        success: true,
        message: 'Desktop registered successfully',
        agent_id: agent_id
    });
});

app.post('/api/desktop/heartbeat', (req, res) => {
    const { agent_id, system_info } = req.body;
    
    if (desktopAgents.has(agent_id)) {
        const agent = desktopAgents.get(agent_id);
        agent.system_info = system_info;
        agent.last_seen = Date.now();
        agent.status = 'active';
        desktopAgents.set(agent_id, agent);
    }
    
    res.json({ success: true });
});

app.get('/api/desktop/agents', (req, res) => {
    const agents = Array.from(desktopAgents.values()).map(agent => ({
        ...agent,
        online: (Date.now() - agent.last_seen) < 30000 // 30 seconds
    }));
    
    res.json({
        agents: agents,
        count: agents.length,
        online: agents.filter(a => a.online).length
    });
});

app.get('/api/desktop/commands/:agent_id', (req, res) => {
    const { agent_id } = req.params;
    const commands = pendingCommands.get(agent_id) || [];
    
    // Clear pending commands after retrieval
    pendingCommands.set(agent_id, []);
    
    res.json({ commands: commands });
});

app.post('/api/desktop/command', (req, res) => {
    const { agent_id, type, data } = req.body;
    
    if (!desktopAgents.has(agent_id)) {
        return res.status(404).json({ error: 'Agent not found' });
    }
    
    const command_id = `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const command = { id: command_id, type, data, timestamp: Date.now() };
    
    const commands = pendingCommands.get(agent_id) || [];
    commands.push(command);
    pendingCommands.set(agent_id, commands);
    
    console.log(`📤 Command sent to ${agent_id}: ${type}`);
    
    res.json({ success: true, command_id: command_id });
});

app.post('/api/desktop/results', (req, res) => {
    const { agent_id, command_id, result } = req.body;
    
    commandResults.set(command_id, {
        agent_id,
        result,
        timestamp: Date.now()
    });
    
    res.json({ success: true });
});

app.get('/api/desktop/result/:command_id', (req, res) => {
    const { command_id } = req.params;
    const result = commandResults.get(command_id);
    
    if (result) {
        res.json({ success: true, result: result });
    } else {
        res.json({ success: false, message: 'Result not yet available' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║     🚀 NUPI CLOUD AGENT - REAL AGENT TRACKING ACTIVE     ║
╚════════════════════════════════════════════════════════════╝

✅ Server running on port ${PORT}
✅ Network: ${deviceData.network}
✅ Devices tracked: ${deviceData.total_devices}
✅ Active agents: ${agentPositions.size}
✅ REAL agent position tracking enabled

📡 ENDPOINTS:
   GET  /                          → Landing page with visitor tracking
   GET  /visualizer.html           → REAL-TIME agent & device visualizer
   
   POST /api/agent/position        → Agents report their position
   GET  /api/agents                → Get all active agents (REAL data)
   GET  /api/agent/:id/history     → Get agent movement trail
   
   GET  /api/devices               → All harvested device data
   POST /api/devices               → Upload device data
   GET  /api/stats                 → Network statistics
   
   GET  /track                     → Silent visitor tracking
   POST /track                     → Detailed visitor tracking
   GET  /api/visitors              → Visitor data
   
   GET  /health                    → Server health check

🤖 Agent Position Format:
   POST /api/agent/position
   {
     "agent_id": "harvester-1",
     "agent_type": "Data Harvester",
     "position": {"x": 100, "y": 200},
     "action": "Scanning device",
     "target_ip": "192.168.12.175",
     "status": "active"
   }

🌐 Deploy to Railway: git push → auto-deploy
📊 Visit: https://nupidesktopai.com
`);
});
