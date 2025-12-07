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
        rokus: deviceData.devices.filter(d => d.device_type.includes('Roku')).length,
        computers: deviceData.devices.filter(d => 
            d.device_type.includes('Mac') || 
            d.device_type.includes('iOS') || 
            d.device_type.includes('Android')
        ).length,
        routers: deviceData.devices.filter(d => d.device_type.includes('Router')).length,
        total_open_ports: deviceData.devices.reduce((sum, d) => sum + (d.open_ports || 0), 0),
        last_scan: deviceData.scan_time
    };
    res.json(stats);
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        devices: deviceData.total_devices,
        uptime: process.uptime()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║        🌐 NUPI CLOUD AGENT API SERVER 🌐                ║
║                                                          ║
║  Port: ${PORT}                                          ║
║  Devices: ${deviceData.total_devices}                   ║
║  Network: ${deviceData.network}                         ║
║                                                          ║
║  API Endpoints:                                          ║
║  • GET  /api/devices    - All devices                   ║
║  • POST /api/devices    - Upload data                   ║
║  • GET  /api/stats      - Statistics                    ║
║  • GET  /health         - Health check                  ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
    `);
    console.log(`🌐 Dashboard: http://localhost:${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}/api/devices`);
});
