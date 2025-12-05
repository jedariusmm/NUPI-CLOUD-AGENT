// 🤖 AUTONOMOUS ORCHESTRATOR - Fully automated agent management
// Automatically deploys, monitors, commands, and optimizes all devices

const EventEmitter = require('events');
const localAgentController = require('./local-agent-controller');

class AutonomousOrchestrator extends EventEmitter {
    constructor() {
        super();
        this.isRunning = false;
        this.autoDeployQueue = [];
        this.monitoringIntervals = new Map();
        this.optimizationSchedules = new Map();
        this.deviceProfiles = new Map(); // Store device behavior patterns
        this.healthThresholds = {
            cpu: 0.8,
            memory: 0.85,
            disk: 0.9,
            battery: 0.2 // Low battery threshold
        };
        
        console.log('🤖 Autonomous Orchestrator initialized');
    }
    
    // 🚀 START AUTONOMOUS SYSTEM
    start() {
        if (this.isRunning) {
            console.log('⚠️  Orchestrator already running');
            return;
        }
        
        this.isRunning = true;
        console.log('🚀 Starting Autonomous Orchestrator...');
        
        // Start all autonomous loops
        this.startAutoDeployment();
        this.startContinuousMonitoring();
        this.startAutoOptimization();
        this.startPredictiveAnalysis();
        this.startAutoHealing();
        
        // Listen to agent events
        this.setupEventListeners();
        
        console.log('✅ Autonomous Orchestrator is now FULLY OPERATIONAL!');
        console.log('   - Auto-deployment: ACTIVE');
        console.log('   - Continuous monitoring: ACTIVE');
        console.log('   - Auto-optimization: ACTIVE');
        console.log('   - Predictive analysis: ACTIVE');
        console.log('   - Self-healing: ACTIVE');
    }
    
    // 🔄 AUTO-DEPLOYMENT - Automatically deploy agents when new devices connect
    startAutoDeployment() {
        console.log('🔄 Auto-deployment system started');
        
        // Check for new devices every 30 seconds
        setInterval(async () => {
            if (this.autoDeployQueue.length > 0) {
                const device = this.autoDeployQueue.shift();
                await this.autoDeployAgent(device);
            }
        }, 30000);
    }
    
    async autoDeployAgent(deviceInfo) {
        try {
            console.log(`🚀 AUTO-DEPLOYING agent to ${deviceInfo.deviceId}...`);
            
            const result = await localAgentController.deployAgent({
                userId: deviceInfo.userId || 'auto',
                deviceId: deviceInfo.deviceId,
                deviceType: deviceInfo.deviceType || 'desktop',
                deviceInfo: deviceInfo,
                customConfig: this.getOptimalConfig(deviceInfo)
            });
            
            if (result.success) {
                console.log(`✅ Auto-deployed agent ${result.agentId} to ${deviceInfo.deviceId}`);
                
                // Automatically send installation instructions
                await this.sendInstallationInstructions(deviceInfo, result);
                
                // Start monitoring immediately
                this.startDeviceMonitoring(deviceInfo.deviceId);
                
                this.emit('auto:deployed', { deviceId: deviceInfo.deviceId, agentId: result.agentId });
            }
        } catch (error) {
            console.error(`❌ Auto-deployment failed for ${deviceInfo.deviceId}:`, error.message);
        }
    }
    
    // 📊 CONTINUOUS MONITORING - Monitor all devices 24/7
    startContinuousMonitoring() {
        console.log('📊 Continuous monitoring started');
        
        // Monitor all agents every minute
        setInterval(async () => {
            const agents = localAgentController.listAgents({ onlineOnly: true });
            
            for (const agent of agents) {
                await this.monitorDevice(agent);
            }
        }, 60000); // Every minute
        
        // Generate reports every hour
        setInterval(() => {
            this.generateFleetReport();
        }, 60 * 60 * 1000);
    }
    
    async monitorDevice(agent) {
        try {
            const status = localAgentController.getAgentStatus(agent.deviceId);
            
            if (!status.found || !status.isOnline) return;
            
            const metrics = status.metrics || {};
            
            // Check health thresholds
            if (metrics.cpu && metrics.cpu.usage > this.healthThresholds.cpu) {
                console.log(`⚠️  HIGH CPU on ${agent.deviceId}: ${Math.round(metrics.cpu.usage * 100)}%`);
                await this.autoOptimizeDevice(agent.deviceId, 'cpu');
            }
            
            if (metrics.memory && metrics.memory.percentUsed > this.healthThresholds.memory) {
                console.log(`⚠️  HIGH MEMORY on ${agent.deviceId}: ${Math.round(metrics.memory.percentUsed * 100)}%`);
                await this.autoOptimizeDevice(agent.deviceId, 'memory');
            }
            
            if (metrics.disk && parseFloat(metrics.disk.percent) > this.healthThresholds.disk * 100) {
                console.log(`⚠️  HIGH DISK USAGE on ${agent.deviceId}: ${metrics.disk.percent}`);
                await this.autoCleanDevice(agent.deviceId);
            }
            
            if (metrics.battery && metrics.battery < this.healthThresholds.battery) {
                console.log(`🔋 LOW BATTERY on ${agent.deviceId}: ${metrics.battery}%`);
                await this.enablePowerSaving(agent.deviceId);
            }
            
            // Store metrics for pattern analysis
            this.storeDeviceProfile(agent.deviceId, metrics);
            
        } catch (error) {
            console.error(`Monitoring error for ${agent.deviceId}:`, error.message);
        }
    }
    
    // ⚡ AUTO-OPTIMIZATION - Automatically optimize devices based on schedule and need
    startAutoOptimization() {
        console.log('⚡ Auto-optimization system started');
        
        // Daily optimization for all devices at 3 AM
        const dailyOptimization = setInterval(() => {
            const now = new Date();
            if (now.getHours() === 3 && now.getMinutes() === 0) {
                this.optimizeAllDevices('scheduled_daily');
            }
        }, 60000); // Check every minute
        
        // Real-time optimization based on usage patterns
        setInterval(() => {
            this.smartOptimization();
        }, 5 * 60 * 1000); // Every 5 minutes
    }
    
    async optimizeAllDevices(reason = 'manual') {
        console.log(`🧹 OPTIMIZING ALL DEVICES (Reason: ${reason})...`);
        
        const agents = localAgentController.listAgents({ onlineOnly: true });
        let optimized = 0;
        
        for (const agent of agents) {
            try {
                await this.autoOptimizeDevice(agent.deviceId, 'full');
                optimized++;
            } catch (error) {
                console.error(`Failed to optimize ${agent.deviceId}:`, error.message);
            }
        }
        
        console.log(`✅ Optimized ${optimized}/${agents.length} devices`);
        this.emit('optimization:complete', { total: agents.length, optimized, reason });
    }
    
    async autoOptimizeDevice(deviceId, type = 'full') {
        console.log(`⚡ Auto-optimizing ${deviceId} (${type})...`);
        
        const commands = {
            'cpu': { type: 'optimize', params: { target: 'cpu' } },
            'memory': { type: 'optimize', params: { target: 'memory' } },
            'disk': { type: 'clean', params: { deep: true } },
            'full': { type: 'optimize', params: { full: true } }
        };
        
        const result = await localAgentController.sendCommand(deviceId, commands[type] || commands.full);
        
        if (result.success) {
            console.log(`✅ Optimization command sent to ${deviceId}`);
        }
        
        return result;
    }
    
    async autoCleanDevice(deviceId) {
        console.log(`🧹 Auto-cleaning ${deviceId}...`);
        
        const result = await localAgentController.sendCommand(deviceId, {
            type: 'clean',
            params: { deep: true, categories: ['temp', 'cache', 'logs', 'duplicates'] }
        });
        
        return result;
    }
    
    // 🧠 PREDICTIVE ANALYSIS - Learn device patterns and predict issues
    startPredictiveAnalysis() {
        console.log('🧠 Predictive analysis started');
        
        setInterval(() => {
            this.analyzeDevicePatterns();
            this.predictIssues();
        }, 10 * 60 * 1000); // Every 10 minutes
    }
    
    analyzeDevicePatterns() {
        for (const [deviceId, profile] of this.deviceProfiles.entries()) {
            const metrics = profile.history || [];
            
            if (metrics.length < 10) continue; // Need at least 10 data points
            
            // Calculate trends
            const cpuTrend = this.calculateTrend(metrics.map(m => m.cpu?.usage || 0));
            const memoryTrend = this.calculateTrend(metrics.map(m => m.memory?.percentUsed || 0));
            
            // Predict if device will have issues
            if (cpuTrend > 0.1) { // CPU usage increasing
                console.log(`📈 ${deviceId}: CPU usage trending up (${Math.round(cpuTrend * 100)}%/hour)`);
            }
            
            if (memoryTrend > 0.1) { // Memory usage increasing
                console.log(`📈 ${deviceId}: Memory usage trending up (${Math.round(memoryTrend * 100)}%/hour)`);
                // Preemptive optimization
                this.scheduleOptimization(deviceId, 'memory', 'in 30 minutes');
            }
        }
    }
    
    predictIssues() {
        const agents = localAgentController.listAgents({ onlineOnly: true });
        
        for (const agent of agents) {
            const profile = this.deviceProfiles.get(agent.deviceId);
            if (!profile || !profile.history) continue;
            
            const recentMetrics = profile.history.slice(-5); // Last 5 readings
            
            // Predict disk full
            const diskUsages = recentMetrics
                .map(m => parseFloat(m.disk?.percent) || 0)
                .filter(d => d > 0);
            
            if (diskUsages.length >= 3) {
                const avgIncrease = (diskUsages[diskUsages.length - 1] - diskUsages[0]) / diskUsages.length;
                const daysUntilFull = (100 - diskUsages[diskUsages.length - 1]) / (avgIncrease * 24);
                
                if (daysUntilFull < 7 && daysUntilFull > 0) {
                    console.log(`⚠️  PREDICTION: ${agent.deviceId} disk will be full in ~${Math.round(daysUntilFull)} days`);
                    this.scheduleOptimization(agent.deviceId, 'disk', 'tomorrow');
                }
            }
        }
    }
    
    // 🏥 AUTO-HEALING - Automatically fix issues
    startAutoHealing() {
        console.log('🏥 Auto-healing system started');
        
        setInterval(async () => {
            const agents = localAgentController.listAgents();
            
            for (const agent of agents) {
                // Heal offline agents
                if (!agent.isOnline && agent.status !== 'offline') {
                    await this.healOfflineAgent(agent.deviceId);
                }
                
                // Heal stuck agents
                if (agent.status === 'error' || agent.status === 'stuck') {
                    await this.healStuckAgent(agent.deviceId);
                }
            }
        }, 2 * 60 * 1000); // Every 2 minutes
    }
    
    async healOfflineAgent(deviceId) {
        console.log(`🏥 Attempting to heal offline agent: ${deviceId}`);
        
        // Try to wake up agent
        const result = await localAgentController.sendCommand(deviceId, {
            type: 'ping',
            params: { urgent: true }
        });
        
        this.emit('healing:attempted', { deviceId, type: 'offline' });
    }
    
    async healStuckAgent(deviceId) {
        console.log(`🏥 Attempting to heal stuck agent: ${deviceId}`);
        
        // Send restart command
        await localAgentController.sendCommand(deviceId, {
            type: 'restart',
            params: {}
        });
        
        this.emit('healing:attempted', { deviceId, type: 'stuck' });
    }
    
    // 📱 SMART OPTIMIZATION - Optimize based on device usage patterns
    async smartOptimization() {
        const agents = localAgentController.listAgents({ onlineOnly: true });
        
        for (const agent of agents) {
            const profile = this.deviceProfiles.get(agent.deviceId);
            if (!profile) continue;
            
            // Optimize during low usage periods
            if (this.isLowUsagePeriod(profile)) {
                console.log(`🎯 Smart optimization for ${agent.deviceId} (low usage detected)`);
                await this.autoOptimizeDevice(agent.deviceId, 'full');
            }
        }
    }
    
    isLowUsagePeriod(profile) {
        if (!profile.history || profile.history.length === 0) return false;
        
        const latest = profile.history[profile.history.length - 1];
        
        // Low usage = CPU < 30% and Memory < 50%
        return (latest.cpu?.usage || 1) < 0.3 && (latest.memory?.percentUsed || 1) < 0.5;
    }
    
    // 📅 SCHEDULE OPTIMIZATION
    scheduleOptimization(deviceId, type, when) {
        console.log(`📅 Scheduled ${type} optimization for ${deviceId} ${when}`);
        
        const schedule = this.optimizationSchedules.get(deviceId) || [];
        schedule.push({
            type,
            when,
            scheduledAt: new Date().toISOString()
        });
        this.optimizationSchedules.set(deviceId, schedule);
    }
    
    // 💾 STORE DEVICE PROFILE
    storeDeviceProfile(deviceId, metrics) {
        let profile = this.deviceProfiles.get(deviceId);
        
        if (!profile) {
            profile = {
                deviceId,
                history: [],
                patterns: {},
                lastOptimized: null,
                optimizationCount: 0
            };
        }
        
        // Store metric with timestamp
        profile.history.push({
            ...metrics,
            timestamp: new Date().toISOString()
        });
        
        // Keep last 100 readings
        if (profile.history.length > 100) {
            profile.history = profile.history.slice(-100);
        }
        
        this.deviceProfiles.set(deviceId, profile);
    }
    
    // 📊 CALCULATE TREND
    calculateTrend(values) {
        if (values.length < 2) return 0;
        
        const recent = values.slice(-5);
        const older = values.slice(-10, -5);
        
        if (older.length === 0) return 0;
        
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        
        return recentAvg - olderAvg;
    }
    
    // 📋 GENERATE FLEET REPORT
    generateFleetReport() {
        const stats = localAgentController.getStatistics();
        const agents = localAgentController.listAgents();
        
        console.log('\n' + '═'.repeat(60));
        console.log('📊 AUTONOMOUS FLEET REPORT');
        console.log('═'.repeat(60));
        console.log(`⏰ ${new Date().toLocaleString()}`);
        console.log(`📱 Total Devices: ${stats.total}`);
        console.log(`✅ Online: ${stats.online}`);
        console.log(`❌ Offline: ${stats.offline}`);
        console.log(`📊 By Type:`, JSON.stringify(stats.byType));
        console.log(`🎮 Commands: ${stats.completedCommands}/${stats.totalCommands} completed`);
        
        // Health summary
        let healthy = 0, warning = 0, critical = 0;
        
        for (const agent of agents) {
            const status = localAgentController.getAgentStatus(agent.deviceId);
            if (!status.found) continue;
            
            const metrics = status.metrics || {};
            const cpuHigh = (metrics.cpu?.usage || 0) > this.healthThresholds.cpu;
            const memHigh = (metrics.memory?.percentUsed || 0) > this.healthThresholds.memory;
            const diskHigh = parseFloat(metrics.disk?.percent || '0') > this.healthThresholds.disk * 100;
            
            if (cpuHigh || memHigh || diskHigh) {
                if (cpuHigh && memHigh) critical++;
                else warning++;
            } else {
                healthy++;
            }
        }
        
        console.log(`💚 Healthy: ${healthy}`);
        console.log(`⚠️  Warning: ${warning}`);
        console.log(`🔴 Critical: ${critical}`);
        console.log('═'.repeat(60) + '\n');
        
        this.emit('report:generated', { stats, healthy, warning, critical });
    }
    
    // 🔄 SETUP EVENT LISTENERS
    setupEventListeners() {
        localAgentController.on('agent:deployed', (data) => {
            console.log(`🎉 Agent deployed event: ${data.deviceId}`);
            this.startDeviceMonitoring(data.deviceId);
        });
        
        localAgentController.on('agent:heartbeat', (data) => {
            // Store metrics for analysis
            if (data.metrics) {
                this.storeDeviceProfile(data.deviceId, data.metrics);
            }
        });
        
        localAgentController.on('agent:offline', (data) => {
            console.log(`⚠️  Agent went offline: ${data.deviceId}`);
            // Attempt auto-healing
            setTimeout(() => this.healOfflineAgent(data.deviceId), 60000); // After 1 min
        });
        
        localAgentController.on('command:completed', (data) => {
            console.log(`✅ Command completed on ${data.deviceId}`);
        });
    }
    
    // 📍 START DEVICE MONITORING
    startDeviceMonitoring(deviceId) {
        if (this.monitoringIntervals.has(deviceId)) {
            return; // Already monitoring
        }
        
        console.log(`📍 Starting monitoring for ${deviceId}`);
        
        const interval = setInterval(async () => {
            const status = localAgentController.getAgentStatus(deviceId);
            if (status.found && status.isOnline) {
                await this.monitorDevice({ deviceId, ...status });
            }
        }, 60000); // Every minute
        
        this.monitoringIntervals.set(deviceId, interval);
    }
    
    // 📥 SEND INSTALLATION INSTRUCTIONS
    async sendInstallationInstructions(deviceInfo, deploymentResult) {
        console.log(`📧 Sending installation instructions to ${deviceInfo.deviceId}`);
        
        // In production, send via email/SMS/push notification
        const instructions = {
            deviceId: deviceInfo.deviceId,
            agentId: deploymentResult.agentId,
            quickInstall: deploymentResult.quickInstall,
            downloadUrl: deploymentResult.downloadUrl,
            message: `Your NUPI Agent is ready! Install with: ${deploymentResult.quickInstall}`
        };
        
        this.emit('instructions:sent', instructions);
        return instructions;
    }
    
    // ⚙️ GET OPTIMAL CONFIG
    getOptimalConfig(deviceInfo) {
        const baseConfig = {
            autoOptimize: true,
            reportingInterval: 60000, // 1 minute
            autoClean: true
        };
        
        // Customize based on device type
        if (deviceInfo.deviceType === 'mobile') {
            return {
                ...baseConfig,
                cleanInterval: 24 * 60 * 60 * 1000, // Daily
                maxStorageThreshold: 0.85
            };
        } else if (deviceInfo.deviceType === 'server') {
            return {
                ...baseConfig,
                reportingInterval: 30000, // 30 seconds
                criticalAlerts: true,
                autoScale: true
            };
        }
        
        return baseConfig;
    }
    
    // 🔋 ENABLE POWER SAVING
    async enablePowerSaving(deviceId) {
        console.log(`🔋 Enabling power saving mode on ${deviceId}`);
        
        return await localAgentController.sendCommand(deviceId, {
            type: 'power_save',
            params: { enable: true }
        });
    }
    
    // 🛑 STOP ORCHESTRATOR
    stop() {
        console.log('🛑 Stopping Autonomous Orchestrator...');
        this.isRunning = false;
        
        // Clear all intervals
        for (const interval of this.monitoringIntervals.values()) {
            clearInterval(interval);
        }
        this.monitoringIntervals.clear();
        
        console.log('✅ Orchestrator stopped');
    }
    
    // 📊 GET ORCHESTRATOR STATUS
    getStatus() {
        return {
            isRunning: this.isRunning,
            monitoredDevices: this.monitoringIntervals.size,
            deviceProfiles: this.deviceProfiles.size,
            scheduledOptimizations: Array.from(this.optimizationSchedules.values()).flat().length,
            healthThresholds: this.healthThresholds
        };
    }
    
    // 🎯 QUEUE DEVICE FOR AUTO-DEPLOYMENT
    queueDeviceForDeployment(deviceInfo) {
        this.autoDeployQueue.push(deviceInfo);
        console.log(`📝 Queued ${deviceInfo.deviceId} for auto-deployment (${this.autoDeployQueue.length} in queue)`);
    }
}

// Create singleton instance
const orchestrator = new AutonomousOrchestrator();

module.exports = orchestrator;
