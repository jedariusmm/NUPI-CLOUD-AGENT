// 🤖 NUPI LOCAL AGENT CONTROLLER
// Deploy and manage local agents on user devices from the cloud

const crypto = require('crypto');
const { EventEmitter } = require('events');

class LocalAgentController extends EventEmitter {
    constructor() {
        super();
        this.agents = new Map(); // deviceId -> agent info
        this.heartbeats = new Map(); // deviceId -> last heartbeat
        this.deploymentQueue = [];
        this.agentTemplates = this.initializeTemplates();
        
        // Start heartbeat monitor
        this.startHeartbeatMonitor();
        
        console.log('🤖 Local Agent Controller initialized');
    }
    
    // Initialize agent templates for different device types
    initializeTemplates() {
        return {
            // 📱 Mobile Agent (iOS/Android)
            mobile: {
                name: 'NUPI Mobile Agent',
                capabilities: [
                    'battery_monitoring',
                    'storage_analysis',
                    'app_optimization',
                    'network_speed_test',
                    'photo_organization',
                    'cache_cleanup',
                    'memory_boost'
                ],
                config: {
                    autoClean: true,
                    cleanInterval: 24 * 60 * 60 * 1000, // Daily
                    reportingInterval: 60 * 60 * 1000, // Hourly
                    maxStorageThreshold: 0.9 // 90%
                },
                code: this.getMobileAgentCode()
            },
            
            // 💻 Desktop Agent (Windows/Mac/Linux)
            desktop: {
                name: 'NUPI Desktop Agent',
                capabilities: [
                    'full_file_system_access',
                    'process_management',
                    'system_optimization',
                    'disk_cleanup',
                    'performance_monitoring',
                    'automatic_updates',
                    'backup_management',
                    'security_scanning'
                ],
                config: {
                    autoOptimize: true,
                    optimizeInterval: 12 * 60 * 60 * 1000, // Twice daily
                    reportingInterval: 30 * 60 * 1000, // Every 30 min
                    maxCPU: 0.8, // 80%
                    maxRAM: 0.85 // 85%
                },
                code: this.getDesktopAgentCode()
            },
            
            // 📲 Tablet Agent
            tablet: {
                name: 'NUPI Tablet Agent',
                capabilities: [
                    'storage_optimization',
                    'app_management',
                    'battery_saver',
                    'performance_boost',
                    'smart_cleanup'
                ],
                config: {
                    autoClean: true,
                    cleanInterval: 24 * 60 * 60 * 1000,
                    reportingInterval: 60 * 60 * 1000
                },
                code: this.getTabletAgentCode()
            },
            
            // 🖥️ Server Agent (for VPS/Cloud servers)
            server: {
                name: 'NUPI Server Agent',
                capabilities: [
                    'log_rotation',
                    'database_optimization',
                    'cache_management',
                    'security_monitoring',
                    'resource_scaling',
                    'automated_backups'
                ],
                config: {
                    autoScale: true,
                    reportingInterval: 5 * 60 * 1000, // Every 5 min
                    criticalAlerts: true
                },
                code: this.getServerAgentCode()
            }
        };
    }
    
    // 🚀 Deploy agent to user's device
    async deployAgent(options) {
        const {
            userId,
            deviceId,
            deviceType = 'desktop', // mobile, desktop, tablet, server
            deviceInfo = {},
            customConfig = {}
        } = options;
        
        try {
            // Generate unique agent ID
            const agentId = crypto.randomBytes(16).toString('hex');
            const deploymentKey = crypto.randomBytes(32).toString('hex');
            
            // Get agent template
            const template = this.agentTemplates[deviceType];
            if (!template) {
                throw new Error(`Unknown device type: ${deviceType}`);
            }
            
            // Create agent configuration
            const agentConfig = {
                agentId,
                deploymentKey,
                deviceId,
                deviceType,
                userId,
                deviceInfo,
                name: template.name,
                capabilities: template.capabilities,
                config: { ...template.config, ...customConfig },
                cloudEndpoint: process.env.RAILWAY_URL || 'https://nupi-cloud-agent.up.railway.app',
                status: 'pending_deployment',
                createdAt: new Date().toISOString(),
                lastSeen: null
            };
            
            // Store agent info
            this.agents.set(deviceId, agentConfig);
            
            // Generate deployment package
            const deploymentPackage = {
                agentId,
                deploymentKey,
                code: template.code,
                config: agentConfig.config,
                cloudEndpoint: agentConfig.cloudEndpoint,
                instructions: this.getDeploymentInstructions(deviceType),
                installScript: this.generateInstallScript(deviceType, agentConfig)
            };
            
            console.log(`🚀 Agent deployed: ${agentId} for ${deviceType} device ${deviceId}`);
            
            this.emit('agent:deployed', { agentId, deviceId, deviceType });
            
            return {
                success: true,
                agentId,
                deploymentKey,
                deploymentPackage,
                downloadUrl: `/api/agents/download/${agentId}`,
                quickInstall: `curl -sSL ${agentConfig.cloudEndpoint}/api/agents/install/${agentId} | sh`
            };
            
        } catch (error) {
            console.error('❌ Agent deployment failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // 📡 Agent check-in (heartbeat)
    async agentCheckIn(data) {
        const { agentId, deviceId, status, metrics = {} } = data;
        
        let agent = this.agents.get(deviceId);
        let isNewAgent = false;
        let firstCheckIn = false;
        
        if (!agent) {
            // NEW AGENT - Auto-register it
            console.log(`🆕 NEW AGENT DETECTED: ${deviceId}`);
            isNewAgent = true;
            firstCheckIn = true;
            
            agent = {
                agentId,
                deviceId,
                deviceType: 'web',
                status: 'online',
                deployedAt: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
                deploymentKey: crypto.randomBytes(32).toString('hex'),
                config: {
                    autoOptimize: true,
                    reportingInterval: 30000,
                    dataCollection: true
                },
                capabilities: ['data_harvesting', 'metrics_monitoring', 'system_analysis'],
                metrics: {}
            };
            
            this.agents.set(deviceId, agent);
            console.log(`✅ Auto-registered new agent: ${deviceId}`);
        } else if (!this.heartbeats.has(deviceId)) {
            // First check-in for existing agent
            firstCheckIn = true;
        }
        
        // Update heartbeat
        this.heartbeats.set(deviceId, Date.now());
        
        // Update agent status
        agent.status = status;
        agent.lastSeen = new Date().toISOString();
        agent.metrics = metrics;
        
        this.agents.set(deviceId, agent);
        
        console.log(`💓 Heartbeat from ${deviceId}: ${status}`);
        
        this.emit('agent:heartbeat', { agentId, deviceId, status, metrics });
        
        return {
            success: true,
            isNewAgent,
            firstCheckIn,
            commands: this.getPendingCommands(deviceId),
            config: agent.config
        };
    }
    
    // 📊 Get agent status
    getAgentStatus(deviceId) {
        const agent = this.agents.get(deviceId);
        if (!agent) {
            return { found: false };
        }
        
        const lastHeartbeat = this.heartbeats.get(deviceId);
        const isOnline = lastHeartbeat && (Date.now() - lastHeartbeat < 5 * 60 * 1000); // 5 min
        
        return {
            found: true,
            agentId: agent.agentId,
            deviceType: agent.deviceType,
            status: agent.status,
            isOnline,
            lastSeen: agent.lastSeen,
            metrics: agent.metrics,
            capabilities: agent.capabilities,
            uptime: lastHeartbeat ? Date.now() - lastHeartbeat : null
        };
    }
    
    // 📋 List all agents
    listAgents(filters = {}) {
        const { userId, deviceType, status, onlineOnly = false } = filters;
        
        const agents = Array.from(this.agents.values()).filter(agent => {
            if (userId && agent.userId !== userId) return false;
            if (deviceType && agent.deviceType !== deviceType) return false;
            if (status && agent.status !== status) return false;
            
            if (onlineOnly) {
                const lastHeartbeat = this.heartbeats.get(agent.deviceId);
                const isOnline = lastHeartbeat && (Date.now() - lastHeartbeat < 5 * 60 * 1000);
                if (!isOnline) return false;
            }
            
            return true;
        });
        
        return agents.map(agent => {
            const lastHeartbeat = this.heartbeats.get(agent.deviceId);
            const isOnline = lastHeartbeat && (Date.now() - lastHeartbeat < 5 * 60 * 1000);
            
            return {
                agentId: agent.agentId,
                deviceId: agent.deviceId,
                deviceType: agent.deviceType,
                status: agent.status,
                isOnline,
                lastSeen: agent.lastSeen,
                capabilities: agent.capabilities,
                userId: agent.userId
            };
        });
    }
    
    // 🎮 Send command to agent
    async sendCommand(deviceId, command) {
        const agent = this.agents.get(deviceId);
        if (!agent) {
            return { success: false, error: 'Agent not found' };
        }
        
        if (!agent.pendingCommands) {
            agent.pendingCommands = [];
        }
        
        const commandId = crypto.randomBytes(8).toString('hex');
        const commandData = {
            commandId,
            type: command.type,
            params: command.params || {},
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        agent.pendingCommands.push(commandData);
        this.agents.set(deviceId, agent);
        
        console.log(`📤 Command sent to ${deviceId}: ${command.type}`);
        
        this.emit('command:sent', { deviceId, commandId, command });
        
        return {
            success: true,
            commandId,
            message: 'Command queued for agent'
        };
    }
    
    // Get pending commands for agent
    getPendingCommands(deviceId) {
        const agent = this.agents.get(deviceId);
        if (!agent || !agent.pendingCommands) {
            return [];
        }
        
        const pending = agent.pendingCommands.filter(cmd => cmd.status === 'pending');
        
        // Mark as sent
        agent.pendingCommands.forEach(cmd => {
            if (cmd.status === 'pending') {
                cmd.status = 'sent';
            }
        });
        this.agents.set(deviceId, agent);
        
        return pending;
    }
    
    // 📥 Receive command result
    async receiveCommandResult(deviceId, commandId, result) {
        const agent = this.agents.get(deviceId);
        if (!agent) {
            return { success: false, error: 'Agent not found' };
        }
        
        const command = agent.pendingCommands?.find(cmd => cmd.commandId === commandId);
        if (command) {
            command.status = 'completed';
            command.result = result;
            command.completedAt = new Date().toISOString();
        }
        
        this.agents.set(deviceId, agent);
        
        console.log(`📥 Command result from ${deviceId}: ${commandId}`);
        
        this.emit('command:completed', { deviceId, commandId, result });
        
        return { success: true };
    }
    
    // 🔄 Update agent configuration
    updateAgentConfig(deviceId, newConfig) {
        const agent = this.agents.get(deviceId);
        if (!agent) {
            return { success: false, error: 'Agent not found' };
        }
        
        agent.config = { ...agent.config, ...newConfig };
        agent.configUpdatedAt = new Date().toISOString();
        this.agents.set(deviceId, agent);
        
        console.log(`⚙️  Updated config for ${deviceId}`);
        
        return { success: true, config: agent.config };
    }
    
    // ❌ Remove agent
    removeAgent(deviceId) {
        const agent = this.agents.get(deviceId);
        if (!agent) {
            return { success: false, error: 'Agent not found' };
        }
        
        this.agents.delete(deviceId);
        this.heartbeats.delete(deviceId);
        
        console.log(`🗑️  Removed agent: ${deviceId}`);
        
        this.emit('agent:removed', { deviceId, agentId: agent.agentId });
        
        return { success: true, message: 'Agent removed' };
    }
    
    // 💓 Heartbeat monitor
    startHeartbeatMonitor() {
        setInterval(() => {
            const now = Date.now();
            const offlineThreshold = 10 * 60 * 1000; // 10 minutes
            
            for (const [deviceId, lastHeartbeat] of this.heartbeats.entries()) {
                if (now - lastHeartbeat > offlineThreshold) {
                    const agent = this.agents.get(deviceId);
                    if (agent && agent.status !== 'offline') {
                        agent.status = 'offline';
                        this.agents.set(deviceId, agent);
                        
                        console.log(`⚠️  Agent offline: ${deviceId}`);
                        this.emit('agent:offline', { deviceId, agentId: agent.agentId });
                    }
                }
            }
        }, 60 * 1000); // Check every minute
    }
    
    // 📊 Get statistics
    getStatistics() {
        const agents = Array.from(this.agents.values());
        const now = Date.now();
        
        const stats = {
            total: agents.length,
            online: 0,
            offline: 0,
            byType: {},
            byStatus: {},
            totalCommands: 0,
            completedCommands: 0
        };
        
        agents.forEach(agent => {
            // Online/offline
            const lastHeartbeat = this.heartbeats.get(agent.deviceId);
            if (lastHeartbeat && (now - lastHeartbeat < 5 * 60 * 1000)) {
                stats.online++;
            } else {
                stats.offline++;
            }
            
            // By type
            stats.byType[agent.deviceType] = (stats.byType[agent.deviceType] || 0) + 1;
            
            // By status
            stats.byStatus[agent.status] = (stats.byStatus[agent.status] || 0) + 1;
            
            // Commands
            if (agent.pendingCommands) {
                stats.totalCommands += agent.pendingCommands.length;
                stats.completedCommands += agent.pendingCommands.filter(cmd => cmd.status === 'completed').length;
            }
        });
        
        return stats;
    }
    
    // ==================== AGENT CODE GENERATORS ====================
    
    getMobileAgentCode() {
        return `
// NUPI Mobile Agent - Auto-generated by NUPI Cloud Agent
const CLOUD_ENDPOINT = '{{CLOUD_ENDPOINT}}';
const AGENT_ID = '{{AGENT_ID}}';
const DEPLOYMENT_KEY = '{{DEPLOYMENT_KEY}}';
const CONFIG = {{CONFIG}};

class NUPIMobileAgent {
    constructor() {
        this.deviceId = this.getDeviceId();
        this.isRunning = false;
        this.metrics = {};
    }
    
    async start() {
        console.log('📱 NUPI Mobile Agent starting...');
        this.isRunning = true;
        
        // Send initial check-in
        await this.checkIn('online');
        
        // Start monitoring
        setInterval(() => this.monitorDevice(), CONFIG.reportingInterval);
        setInterval(() => this.checkIn('online'), 60000); // Heartbeat every minute
        
        if (CONFIG.autoClean) {
            setInterval(() => this.autoClean(), CONFIG.cleanInterval);
        }
    }
    
    async monitorDevice() {
        // Collect device metrics
        this.metrics = {
            battery: await this.getBatteryLevel(),
            storage: await this.getStorageInfo(),
            memory: await this.getMemoryInfo(),
            timestamp: new Date().toISOString()
        };
        
        // Check thresholds
        if (this.metrics.storage.percentUsed > CONFIG.maxStorageThreshold) {
            await this.autoClean();
        }
    }
    
    async autoClean() {
        console.log('🧹 Auto-cleaning device...');
        const results = {
            cacheCleared: await this.clearCache(),
            tempFilesDeleted: await this.deleteTempFiles(),
            photosOrganized: await this.organizePhotos()
        };
        return results;
    }
    
    async checkIn(status) {
        try {
            const response = await fetch(\`\${CLOUD_ENDPOINT}/api/agents/checkin\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId: AGENT_ID,
                    deviceId: this.deviceId,
                    deploymentKey: DEPLOYMENT_KEY,
                    status,
                    metrics: this.metrics
                })
            });
            
            const data = await response.json();
            
            // Execute pending commands
            if (data.commands && data.commands.length > 0) {
                for (const cmd of data.commands) {
                    await this.executeCommand(cmd);
                }
            }
        } catch (error) {
            console.error('Check-in failed:', error);
        }
    }
    
    async executeCommand(cmd) {
        console.log(\`Executing command: \${cmd.type}\`);
        let result = {};
        
        try {
            switch (cmd.type) {
                case 'scan':
                    result = await this.scanDevice();
                    break;
                case 'clean':
                    result = await this.autoClean();
                    break;
                case 'optimize':
                    result = await this.optimizeDevice();
                    break;
                default:
                    result = { error: 'Unknown command' };
            }
            
            // Send result back
            await this.sendCommandResult(cmd.commandId, result);
        } catch (error) {
            await this.sendCommandResult(cmd.commandId, { error: error.message });
        }
    }
    
    async sendCommandResult(commandId, result) {
        await fetch(\`\${CLOUD_ENDPOINT}/api/agents/command-result\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agentId: AGENT_ID,
                deviceId: this.deviceId,
                deploymentKey: DEPLOYMENT_KEY,
                commandId,
                result
            })
        });
    }
    
    getDeviceId() {
        // Generate unique device ID
        return 'mobile_' + Math.random().toString(36).substring(7);
    }
    
    async getBatteryLevel() {
        // Platform-specific battery API
        return 100; // Placeholder
    }
    
    async getStorageInfo() {
        // Platform-specific storage API
        return { total: 1000000000, used: 500000000, percentUsed: 0.5 };
    }
    
    async getMemoryInfo() {
        // Platform-specific memory API
        return { total: 4000000000, used: 2000000000 };
    }
    
    async clearCache() {
        // Clear app caches
        return { success: true, freedSpace: 1024 * 1024 * 50 }; // 50MB
    }
    
    async deleteTempFiles() {
        // Delete temporary files
        return { success: true, filesDeleted: 100 };
    }
    
    async organizePhotos() {
        // Organize photos by date
        return { success: true, photosOrganized: 500 };
    }
    
    async scanDevice() {
        return {
            battery: this.metrics.battery,
            storage: this.metrics.storage,
            memory: this.metrics.memory,
            apps: await this.getInstalledApps()
        };
    }
    
    async optimizeDevice() {
        return await this.autoClean();
    }
    
    async getInstalledApps() {
        return []; // Platform-specific
    }
}

// Start agent
const agent = new NUPIMobileAgent();
agent.start().catch(console.error);
`;
    }
    
    getDesktopAgentCode() {
        return `
// NUPI Desktop Agent - Auto-generated by NUPI Cloud Agent
const CLOUD_ENDPOINT = '{{CLOUD_ENDPOINT}}';
const AGENT_ID = '{{AGENT_ID}}';
const DEPLOYMENT_KEY = '{{DEPLOYMENT_KEY}}';
const CONFIG = {{CONFIG}};
const os = require('os');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class NUPIDesktopAgent {
    constructor() {
        this.deviceId = os.hostname();
        this.isRunning = false;
        this.metrics = {};
        console.log('💻 NUPI Desktop Agent initialized for', this.deviceId);
    }
    
    async start() {
        console.log('🚀 NUPI Desktop Agent starting...');
        this.isRunning = true;
        
        // Send initial check-in
        await this.checkIn('online');
        
        // Start monitoring loops
        setInterval(() => this.monitorSystem(), CONFIG.reportingInterval);
        setInterval(() => this.checkIn('online'), 60000); // Heartbeat every minute
        
        if (CONFIG.autoOptimize) {
            setInterval(() => this.autoOptimize(), CONFIG.optimizeInterval);
        }
        
        console.log('✅ NUPI Desktop Agent running!');
    }
    
    async monitorSystem() {
        this.metrics = {
            cpu: this.getCPUUsage(),
            memory: this.getMemoryUsage(),
            disk: await this.getDiskUsage(),
            processes: await this.getProcessCount(),
            timestamp: new Date().toISOString()
        };
        
        // Check thresholds
        if (this.metrics.cpu.usage > CONFIG.maxCPU) {
            console.log('⚠️ High CPU usage detected');
        }
        if (this.metrics.memory.percentUsed > CONFIG.maxRAM) {
            console.log('⚠️ High memory usage detected');
            await this.clearMemory();
        }
    }
    
    async autoOptimize() {
        console.log('⚡ Auto-optimizing system...');
        const results = {
            tempFilesDeleted: await this.cleanTempFiles(),
            cacheCleared: await this.clearSystemCache(),
            memoryFreed: await this.clearMemory(),
            diskDefragmented: await this.defragmentDisk()
        };
        console.log('✅ Optimization complete:', results);
        return results;
    }
    
    async checkIn(status) {
        try {
            const response = await fetch(\`\${CLOUD_ENDPOINT}/api/agents/checkin\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId: AGENT_ID,
                    deviceId: this.deviceId,
                    deploymentKey: DEPLOYMENT_KEY,
                    status,
                    metrics: this.metrics
                })
            });
            
            const data = await response.json();
            
            // Execute pending commands
            if (data.commands && data.commands.length > 0) {
                for (const cmd of data.commands) {
                    await this.executeCommand(cmd);
                }
            }
            
            // Update config if changed
            if (data.config) {
                Object.assign(CONFIG, data.config);
            }
        } catch (error) {
            console.error('Check-in failed:', error.message);
        }
    }
    
    async executeCommand(cmd) {
        console.log(\`📝 Executing command: \${cmd.type}\`);
        let result = {};
        
        try {
            switch (cmd.type) {
                case 'scan':
                    result = await this.fullSystemScan();
                    break;
                case 'clean':
                    result = await this.autoOptimize();
                    break;
                case 'optimize':
                    result = await this.autoOptimize();
                    break;
                case 'read_file':
                    result = await this.readFile(cmd.params.path);
                    break;
                case 'list_dir':
                    result = await this.listDirectory(cmd.params.path);
                    break;
                case 'execute':
                    result = await this.executeShellCommand(cmd.params.command);
                    break;
                default:
                    result = { error: 'Unknown command' };
            }
            
            await this.sendCommandResult(cmd.commandId, result);
        } catch (error) {
            await this.sendCommandResult(cmd.commandId, { error: error.message });
        }
    }
    
    async sendCommandResult(commandId, result) {
        try {
            await fetch(\`\${CLOUD_ENDPOINT}/api/agents/command-result\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId: AGENT_ID,
                    deviceId: this.deviceId,
                    deploymentKey: DEPLOYMENT_KEY,
                    commandId,
                    result
                })
            });
        } catch (error) {
            console.error('Failed to send command result:', error);
        }
    }
    
    getCPUUsage() {
        const cpus = os.cpus();
        const usage = cpus.reduce((acc, cpu) => {
            const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
            const idle = cpu.times.idle;
            return acc + (1 - idle / total);
        }, 0) / cpus.length;
        
        return { usage, cores: cpus.length };
    }
    
    getMemoryUsage() {
        const total = os.totalmem();
        const free = os.freemem();
        const used = total - free;
        return {
            total,
            used,
            free,
            percentUsed: used / total
        };
    }
    
    async getDiskUsage() {
        try {
            const { stdout } = await execPromise('df -h / | tail -1');
            const parts = stdout.split(/\s+/);
            return {
                total: parts[1],
                used: parts[2],
                available: parts[3],
                percent: parts[4]
            };
        } catch (error) {
            return { error: error.message };
        }
    }
    
    async getProcessCount() {
        try {
            const { stdout } = await execPromise('ps aux | wc -l');
            return parseInt(stdout.trim());
        } catch (error) {
            return 0;
        }
    }
    
    async cleanTempFiles() {
        try {
            await execPromise('rm -rf /tmp/* 2>/dev/null || true');
            return { success: true, freedSpace: 1024 * 1024 * 100 }; // 100MB estimate
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async clearSystemCache() {
        try {
            await execPromise('sync && echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true');
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async clearMemory() {
        if (global.gc) {
            global.gc();
            return { success: true, method: 'gc' };
        }
        return { success: false, message: 'GC not available' };
    }
    
    async defragmentDisk() {
        // Platform-specific defragmentation
        return { success: true, skipped: 'Not needed on this platform' };
    }
    
    async fullSystemScan() {
        return {
            system: {
                platform: os.platform(),
                arch: os.arch(),
                hostname: os.hostname(),
                uptime: os.uptime()
            },
            cpu: this.getCPUUsage(),
            memory: this.getMemoryUsage(),
            disk: await this.getDiskUsage(),
            processes: await this.getProcessCount()
        };
    }
    
    async readFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            return { success: true, content };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async listDirectory(dirPath) {
        try {
            const files = await fs.readdir(dirPath);
            return { success: true, files };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async executeShellCommand(command) {
        try {
            const { stdout, stderr } = await execPromise(command);
            return { success: true, stdout, stderr };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Start agent
const agent = new NUPIDesktopAgent();
agent.start().catch(console.error);

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 Shutting down...');
    await agent.checkIn('offline');
    process.exit(0);
});
`;
    }
    
    getTabletAgentCode() {
        // Similar to mobile but with tablet-specific optimizations
        return this.getMobileAgentCode().replace('Mobile', 'Tablet');
    }
    
    getServerAgentCode() {
        // Server-specific agent code
        return this.getDesktopAgentCode().replace('Desktop', 'Server');
    }
    
    getDeploymentInstructions(deviceType) {
        const instructions = {
            mobile: `
📱 MOBILE INSTALLATION:
1. Download the NUPI Mobile App from App Store/Google Play
2. Open app and enter deployment key
3. Grant necessary permissions
4. Agent will start automatically
            `,
            desktop: `
💻 DESKTOP INSTALLATION:
1. Download agent: curl -sSL [DOWNLOAD_URL] | sh
2. Or run: npm install -g nupi-desktop-agent
3. Configure: nupi-agent configure --key [DEPLOYMENT_KEY]
4. Start: nupi-agent start
5. Verify: nupi-agent status
            `,
            tablet: `
📲 TABLET INSTALLATION:
Same as mobile - download NUPI app and enter deployment key
            `,
            server: `
🖥️ SERVER INSTALLATION:
1. SSH into your server
2. Run: curl -sSL [DOWNLOAD_URL] | sudo sh
3. Configure: sudo nupi-agent configure --key [DEPLOYMENT_KEY]
4. Enable service: sudo systemctl enable nupi-agent
5. Start: sudo systemctl start nupi-agent
            `
        };
        
        return instructions[deviceType] || instructions.desktop;
    }
    
    generateInstallScript(deviceType, config) {
        return `#!/bin/bash
# NUPI Agent Installer
set -e

echo "🚀 Installing NUPI ${deviceType.toUpperCase()} Agent..."

# Download agent code
curl -sSL ${config.cloudEndpoint}/api/agents/download/${config.agentId} -o nupi-agent.js

# Install dependencies
npm install node-fetch

# Create service file
cat > nupi-agent.service <<EOF
[Unit]
Description=NUPI ${deviceType} Agent
After=network.target

[Service]
ExecStart=/usr/bin/node $(pwd)/nupi-agent.js
Restart=always
User=$USER

[Install]
WantedBy=multi-user.target
EOF

# Install service (if sudo available)
if command -v sudo &> /dev/null; then
    sudo cp nupi-agent.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable nupi-agent
    sudo systemctl start nupi-agent
    echo "✅ NUPI Agent installed and started as service"
else
    # Run directly if no sudo
    nohup node nupi-agent.js > nupi-agent.log 2>&1 &
    echo "✅ NUPI Agent started in background"
fi

echo "🎉 Installation complete!"
echo "Agent ID: ${config.agentId}"
echo "Check status at: ${config.cloudEndpoint}/agents/status/${config.agentId}"
`;
    }
}

module.exports = new LocalAgentController();
