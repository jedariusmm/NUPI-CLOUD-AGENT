const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

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
const ChatAgent = require('./chat_agent.js');
const chatAgent = new ChatAgent();

app.post('/api/chat', async (req, res) => {
    try {
        const { message, model, webSearch, attachments, context } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log(`💬 Chat request: "${message.substring(0, 50)}..."`);

        // Get response from autonomous agent
        const result = await chatAgent.chat(message, {
            model: model || 'claude-3-5-sonnet-20241022',
            webSearch: webSearch || false,
            context: context || {}
        });

        res.json(result);
    } catch (error) {
        console.error('❌ Chat error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/chat/history', (req, res) => {
    res.json({
        history: chatAgent.conversationHistory,
        count: chatAgent.conversationHistory.length
    });
});

app.post('/api/chat/clear', (req, res) => {
    chatAgent.clearHistory();
    res.json({ success: true, message: 'Chat history cleared' });
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
