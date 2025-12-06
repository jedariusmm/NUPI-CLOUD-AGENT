/**
 * 🌍 NUPI CLOUD TRAVELLING AGENT
 * Runs 24/7 in the cloud, travels to all connected devices worldwide
 * Built for: Jedarius Maxwell
 */

const crypto = require('crypto');
const os = require('os');

class CloudTravellingAgent {
    constructor() {
        this.agentId = this.generateAgentId();
        this.location = 'NUPI_CLOUD';
        this.platform = 'Cloud_Infrastructure';
        this.startTime = Date.now();
        this.visitedDevices = [];
        this.connectedDevices = new Map();
        this.travelInterval = 30000; // Travel every 30 seconds
        this.running = true;
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🌍 NUPI CLOUD TRAVELLING AGENT - INITIALIZING');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🆔 Agent ID: ${this.agentId}`);
        console.log(`☁️  Location: ${this.location}`);
        console.log(`🌐 Platform: ${this.platform}`);
        console.log(`⏰ Travel Interval: ${this.travelInterval/1000}s`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
    
    generateAgentId() {
        return crypto.randomBytes(8).toString('hex');
    }
    
    getCloudFingerprint() {
        return crypto.createHash('sha256')
            .update(`${this.location}${os.hostname()}${process.pid}`)
            .digest('hex');
    }
    
    registerDevice(deviceData) {
        const deviceId = deviceData.device_fingerprint || deviceData.deviceId;
        
        if (!this.connectedDevices.has(deviceId)) {
            this.connectedDevices.set(deviceId, {
                ...deviceData,
                first_seen: new Date().toISOString(),
                last_seen: new Date().toISOString(),
                visit_count: 1
            });
            
            console.log(`✅ New device registered: ${deviceData.hostname || deviceId.substr(0, 8)}`);
        } else {
            const device = this.connectedDevices.get(deviceId);
            device.last_seen = new Date().toISOString();
            device.visit_count++;
        }
        
        return this.connectedDevices.get(deviceId);
    }
    
    async travelToDevice(deviceData) {
        const deviceId = deviceData.device_fingerprint || deviceData.deviceId;
        
        console.log(`🚀 TRAVELLING TO: ${deviceData.hostname || deviceId.substr(0, 8)}`);
        console.log(`   Platform: ${deviceData.platform || 'Unknown'}`);
        console.log(`   Location: ${deviceData.hostname || 'Unknown'}`);
        
        const visit = {
            agent_id: this.agentId,
            device_id: deviceId,
            device_hostname: deviceData.hostname,
            device_platform: deviceData.platform,
            visit_time: new Date().toISOString(),
            from_location: 'NUPI_CLOUD'
        };
        
        this.visitedDevices.push(visit);
        
        // Simulate agent presence on device
        console.log(`   ✅ Agent present on ${deviceData.hostname}`);
        console.log(`   📊 Monitoring device metrics...`);
        
        return visit;
    }
    
    async autonomousTravelMode() {
        console.log('');
        console.log('🌍 AUTONOMOUS TRAVEL MODE ACTIVATED');
        console.log('🚀 Cloud Agent will travel to all connected devices');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        
        let travelCount = 0;
        
        const travelLoop = setInterval(async () => {
            if (!this.running) {
                clearInterval(travelLoop);
                return;
            }
            
            const devices = Array.from(this.connectedDevices.values());
            
            if (devices.length === 0) {
                console.log(`⏰ [${new Date().toLocaleTimeString()}] No devices connected - waiting...`);
                return;
            }
            
            console.log('');
            console.log(`🌍 ═══ TRAVEL CYCLE ${++travelCount} ═══`);
            console.log(`📊 Connected Devices: ${devices.length}`);
            console.log(`🚀 Total Travels: ${this.visitedDevices.length}`);
            console.log('');
            
            // Travel to each connected device
            for (const device of devices) {
                await this.travelToDevice(device);
                
                // Small delay between travels
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            console.log('');
            console.log(`✅ Travel cycle complete - visited ${devices.length} devices`);
            console.log(`⏰ Next travel in ${this.travelInterval/1000} seconds`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
        }, this.travelInterval);
    }
    
    async monitorWorldwideDevices() {
        console.log('🌐 WORLDWIDE DEVICE MONITOR - ACTIVE');
        
        setInterval(() => {
            const devices = Array.from(this.connectedDevices.values());
            const activeDevices = devices.filter(d => {
                const lastSeen = new Date(d.last_seen);
                const now = new Date();
                return (now - lastSeen) < 60000; // Active in last minute
            });
            
            if (activeDevices.length > 0) {
                console.log('');
                console.log(`📡 WORLDWIDE STATUS UPDATE`);
                console.log(`   Total Registered: ${devices.length} devices`);
                console.log(`   Currently Active: ${activeDevices.length} devices`);
                console.log(`   Total Travels: ${this.visitedDevices.length}`);
                console.log(`   Uptime: ${Math.floor((Date.now() - this.startTime) / 1000 / 60)} minutes`);
            }
        }, 60000); // Every minute
    }
    
    getStatus() {
        const devices = Array.from(this.connectedDevices.values());
        const activeDevices = devices.filter(d => {
            const lastSeen = new Date(d.last_seen);
            const now = new Date();
            return (now - lastSeen) < 60000;
        });
        
        return {
            agent_id: this.agentId,
            location: this.location,
            platform: this.platform,
            uptime_seconds: Math.floor((Date.now() - this.startTime) / 1000),
            total_devices: devices.length,
            active_devices: activeDevices.length,
            total_travels: this.visitedDevices.length,
            connected_devices: devices.map(d => ({
                hostname: d.hostname,
                platform: d.platform,
                last_seen: d.last_seen,
                visit_count: d.visit_count
            }))
        };
    }
    
    async start() {
        console.log('🔥 STARTING CLOUD TRAVELLING AGENT...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Start autonomous travel
        this.autonomousTravelMode();
        
        // Start monitoring
        this.monitorWorldwideDevices();
        
        console.log('');
        console.log('✅ CLOUD TRAVELLING AGENT IS NOW FULLY OPERATIONAL!');
        console.log('🌍 Monitoring all devices worldwide...');
        console.log('🚀 Autonomous travel system active...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
    }
    
    stop() {
        this.running = false;
        console.log('🛑 Cloud Travelling Agent stopped');
    }
}

// Create and start the cloud agent
const cloudAgent = new CloudTravellingAgent();

// Start immediately
cloudAgent.start();

// Export for use in server
module.exports = cloudAgent;
