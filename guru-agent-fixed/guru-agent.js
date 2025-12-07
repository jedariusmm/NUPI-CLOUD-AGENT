// GURU AGENT - Fixed version without Anthropic API dependency
// Reports insights to Telegram based on system monitoring

const TelegramBot = require('node-telegram-bot-api');

// Configuration
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8407882307:AAErVEXhC26xQtDWlXdBZf2JX_sMiTtT22Y';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '6523159355';
const API_BASE_URL = process.env.API_BASE_URL || 'https://nupidesktopai.com';

class GuruAgent {
    constructor() {
        this.bot = null;
        this.isRunning = false;
        this.lastThinkTime = Date.now();
        
        console.log('🧠 GURU AGENT - Initializing...');
    }
    
    async initialize() {
        try {
            // Use webhook mode instead of polling to avoid conflicts
            this.bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });
            this.isRunning = true;
            
            console.log('✅ GURU AGENT - Ready (Webhook mode - no polling conflicts)');
            console.log(`📡 Monitoring API: ${API_BASE_URL}`);
            
            // Send startup message
            await this.sendMessage('🧠 GURU AGENT ONLINE\n\nMonitoring network and providing insights.\n\nMode: Webhook (no polling conflicts)\nAPI: ' + API_BASE_URL);
            
            // Start autonomous thinking
            this.startAutonomousThinking();
            
        } catch (error) {
            console.error('❌ Failed to initialize:', error.message);
        }
    }
    
    async sendMessage(text) {
        try {
            await this.bot.sendMessage(TELEGRAM_CHAT_ID, text);
        } catch (error) {
            console.error('❌ Failed to send message:', error.message);
        }
    }
    
    async fetchStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/stats`);
            return await response.json();
        } catch (error) {
            console.error('❌ Failed to fetch stats:', error.message);
            return null;
        }
    }
    
    async fetchAgents() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/agents`);
            return await response.json();
        } catch (error) {
            console.error('❌ Failed to fetch agents:', error.message);
            return null;
        }
    }
    
    async exerciseFreeWill() {
        try {
            const stats = await this.fetchStats();
            const agents = await this.fetchAgents();
            
            if (!stats) return;
            
            // Simple rule-based insights (no Anthropic API needed)
            const insights = [];
            
            if (stats.total_devices === 0) {
                insights.push('⚠️ No devices detected on network. Harvester may be offline.');
            }
            
            if (stats.active_agents === 0) {
                insights.push('💤 No active agents reporting. Start continuous-harvester-with-positions.py');
            }
            
            if (stats.active_agents > 0 && stats.total_devices > 10) {
                insights.push(`✅ System healthy: ${stats.active_agents} agents monitoring ${stats.total_devices} devices`);
            }
            
            if (stats.rokus > 0) {
                insights.push(`📺 ${stats.rokus} Roku device${stats.rokus > 1 ? 's' : ''} online and ready for control`);
            }
            
            if (insights.length > 0) {
                const message = '🧠 GURU INSIGHTS:\n\n' + insights.join('\n\n');
                await this.sendMessage(message);
                console.log('🧠 FREE WILL: Shared insights with user');
            } else {
                console.log('🧠 FREE WILL: Nothing urgent to report');
            }
            
        } catch (error) {
            console.error('❌ Free will error:', error.message);
        }
    }
    
    async autonomousThinking() {
        try {
            const stats = await this.fetchStats();
            const agents = await this.fetchAgents();
            
            console.log(`💭 AUTONOMOUS THINKING: Analyzing ${stats?.total_devices || 0} devices, ${agents?.count || 0} agents`);
            
            // Rule-based monitoring (no Anthropic API)
            if (stats && stats.total_devices > 15) {
                await this.sendMessage('📊 Network Status: HIGH ACTIVITY\n\nDetected ' + stats.total_devices + ' devices on network.\nAll systems operational.');
            }
            
        } catch (error) {
            console.error('❌ Autonomous thinking error:', error.message);
        }
    }
    
    startAutonomousThinking() {
        // Exercise free will every 5 minutes
        setInterval(() => {
            this.exerciseFreeWill();
        }, 5 * 60 * 1000);
        
        // Autonomous thinking every 3 minutes
        setInterval(() => {
            this.autonomousThinking();
        }, 3 * 60 * 1000);
        
        console.log('🧠 Autonomous thinking activated (no Anthropic API - rule-based only)');
    }
    
    async run() {
        await this.initialize();
        
        // Keep alive
        setInterval(() => {
            console.log('🧠 GURU AGENT: Still running...');
        }, 60 * 1000);
    }
}

// Start the agent
const guru = new GuruAgent();
guru.run().catch(console.error);

// Handle shutdown
process.on('SIGTERM', () => {
    console.log('🛑 GURU AGENT: Shutting down...');
    process.exit(0);
});
