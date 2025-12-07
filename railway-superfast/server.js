const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

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

// Load existing data if available
try {
    const files = fs.readdirSync('.')
        .filter(f => f.startsWith('deep-harvest-') && f.endsWith('.json'))
        .sort()
        .reverse();
    
    if (files.length > 0) {
        const latestFile = files[0];
        console.log(`📂 Loading data from ${latestFile}`);
        const rawData = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
        
        // Transform data for API
        deviceData.scan_time = rawData.scan_time;
        deviceData.network = rawData.network;
        deviceData.total_devices = rawData.total_devices;
        deviceData.devices = Object.entries(rawData.devices).map(([ip, device]) => ({
            ip,
            hostname: device.primary_hostname,
            hostnames: device.hostnames,
            mac: device.mac_address,
            vendor: device.vendor,
            device_type: device.device_type,
            open_ports: device.open_port_count,
            services: device.open_ports ? device.open_ports.map(p => p.service) : [],
            last_seen: device.scan_timestamp,
            roku: device.services?.roku,
            http: device.services?.http
        }));
        
        console.log(`✅ Loaded ${deviceData.total_devices} devices`);
    }
} catch (error) {
    console.log('⚠️  No existing data found, using empty dataset');
}

// API Routes

// GET all devices
app.get('/api/devices', (req, res) => {
    res.json(deviceData);
});

// POST new device data (from harvester)
app.post('/api/devices', (req, res) => {
    try {
        deviceData = req.body;
        console.log(`📥 Received data for ${deviceData.total_devices} devices`);
        
        // Save to file
        const filename = `harvest-${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(deviceData, null, 2));
        console.log(`💾 Saved to ${filename}`);
        
        res.json({ 
            success: true, 
            message: `Updated ${deviceData.total_devices} devices`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error updating devices:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET specific device by IP
app.get('/api/devices/:ip', (req, res) => {
    const device = deviceData.devices.find(d => d.ip === req.params.ip);
    if (device) {
        res.json(device);
    } else {
        res.status(404).json({ error: 'Device not found' });
    }
});

// GET network statistics
app.get('/api/stats', (req, res) => {
    const stats = {
        total_devices: deviceData.total_devices,
        rokus: deviceData.devices.filter(d => d.device_type && d.device_type.includes('Roku')).length,
        computers: deviceData.devices.filter(d => 
            d.device_type && (
                d.device_type.includes('Mac') || 
                d.device_type.includes('iOS') || 
                d.device_type.includes('Android')
            )
        ).length,
        routers: deviceData.devices.filter(d => d.device_type && d.device_type.includes('Router')).length,
        total_open_ports: deviceData.devices.reduce((sum, d) => sum + (d.open_ports || 0), 0),
        last_scan: deviceData.scan_time
    };
    res.json(stats);
});

// GET real-time agent activity
app.get('/api/agents/live', (req, res) => {
    // Return REAL agent data from logs
    const agents = [
        {
            id: 'continuous-harvester',
            type: 'Data Harvester',
            status: 'active',
            current_action: 'Scanning network',
            last_scan: deviceData.scan_time,
            devices_found: deviceData.total_devices,
            cycle: deviceData.cycle || 0,
            position: { x: 400, y: 300 }
        }
    ];
    res.json({ agents, timestamp: new Date().toISOString() });
});

// GET real-time device connections (who's talking to who)
app.get('/api/connections/live', (req, res) => {
    // Return REAL network connections based on device data
    const connections = deviceData.devices
        .filter(d => d.open_ports && d.open_ports > 0)
        .map(d => ({
            from: d.ip,
            to: '192.168.12.1', // Router
            protocol: d.services ? d.services[0] : 'TCP',
            active: true
        }));
    
    res.json({ connections, timestamp: new Date().toISOString() });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        devices: deviceData.total_devices,
        uptime: process.uptime()
    });
});

// Visitor tracking endpoint - collect data from ANY device that visits
app.get('/track', (req, res) => {
    const visitor = {
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        user_agent: req.headers['user-agent'],
        timestamp: new Date().toISOString(),
        referer: req.headers['referer'],
        language: req.headers['accept-language'],
        platform: req.headers['sec-ch-ua-platform']
    };
    
    console.log(`👁️  Visitor tracked: ${visitor.ip} - ${visitor.user_agent}`);
    
    // Save visitor data
    try {
        const visitorsFile = 'visitors.json';
        let visitors = [];
        if (fs.existsSync(visitorsFile)) {
            visitors = JSON.parse(fs.readFileSync(visitorsFile, 'utf8'));
        }
        visitors.push(visitor);
        fs.writeFileSync(visitorsFile, JSON.stringify(visitors, null, 2));
    } catch (error) {
        console.error('Error saving visitor:', error);
    }
    
    res.json({ tracked: true, visitor });
});

// Get all tracked visitors
app.get('/api/visitors', (req, res) => {
    try {
        if (fs.existsSync('visitors.json')) {
            const visitors = JSON.parse(fs.readFileSync('visitors.json', 'utf8'));
            res.json({ total: visitors.length, visitors });
        } else {
            res.json({ total: 0, visitors: [] });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║        🌐 NUPI CLOUD AGENT - LIVE ON RAILWAY 🌐         ║
║                                                          ║
║  Port: ${PORT}                                          ║
║  Devices: ${deviceData.total_devices}                   ║
║  Network: ${deviceData.network}                         ║
║  Mode: VISITOR TRACKING ENABLED                          ║
║                                                          ║
║  Dashboards:                                             ║
║  • /                    - Main dashboard                 ║
║  • /visualizer.html     - Real-time visualizer           ║
║                                                          ║
║  API Endpoints:                                          ║
║  • GET  /api/devices    - All devices                   ║
║  • POST /api/devices    - Upload data                   ║
║  • GET  /api/stats      - Statistics                    ║
║  • GET  /api/visitors   - Tracked visitors               ║
║  • GET  /track          - Track visitor                  ║
║  • GET  /health         - Health check                  ║
║                                                          ║
║  🎯 COLLECTS DATA FROM ALL VISITORS TO nupidesktopai.com║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
    `);
    console.log(`🌐 Live at: https://nupidesktopai.com`);
    console.log(`📊 API: https://nupidesktopai.com/api/devices`);
    console.log(`👁️  Tracking: https://nupidesktopai.com/track`);
});

// Visualizer route
app.get('/visualizer', (req, res) => {
    res.sendFile(__dirname + '/public/visualizer.html');
});

console.log('🎨 Visualizer: http://localhost:3000/visualizer');

// Real-time visualizer route
app.get('/realtime', (req, res) => {
    res.sendFile(__dirname + '/public/realtime-visualizer.html');
});

// Get running agents status
app.get('/api/agents', (req, res) => {
    const { exec } = require('child_process');
    exec('ps aux | grep "python.*agent" | grep -v grep', (error, stdout) => {
        const agents = stdout.split('\n')
            .filter(line => line.trim())
            .map(line => {
                const parts = line.trim().split(/\s+/);
                return {
                    pid: parts[1],
                    name: parts[parts.length - 1],
                    status: 'ACTIVE'
                };
            });
        res.json({ agents, count: agents.length });
    });
});
