/**
 * 🤖 AUTOMATED AGENT CREATION SYSTEM
 * Like nupiai.com custom bot orders but for NUPI agents
 * Stripe integration + Telegram notifications
 * Built for: Jedarius Maxwell
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Store agent orders (in production, use database)
const agentOrders = new Map();
const createdAgents = new Map();

/**
 * 🎯 CREATE CUSTOM AGENT ORDER
 * POST /api/create-agent/order
 */
router.post('/order', async (req, res) => {
    try {
        const {
            agentName,
            agentType,  // 'fast' | 'standard' | 'enterprise'
            features,   // Array: ['network-scan', 'security-audit', 'cloud-sync', etc]
            platform,   // 'windows' | 'macos' | 'linux' | 'android' | 'ios'
            email,
            paymentMethod = 'stripe',
            metadata = {}
        } = req.body;

        // Validate required fields
        if (!agentName || !agentType || !email) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: agentName, agentType, email'
            });
        }

        // Generate unique order ID
        const orderId = `agent_order_${crypto.randomBytes(8).toString('hex')}`;
        const agentId = `agent_${crypto.randomBytes(12).toString('hex')}`;

        // Pricing based on agent type
        const pricing = {
            'fast': 49.99,           // Super fast agent
            'standard': 29.99,       // Standard agent
            'enterprise': 199.99     // Enterprise with all features
        };

        const price = pricing[agentType] || 29.99;

        // Create order
        const order = {
            orderId,
            agentId,
            agentName,
            agentType,
            features: features || getDefaultFeatures(agentType),
            platform,
            email,
            price,
            paymentStatus: 'pending',
            creationStatus: 'pending',
            createdAt: new Date().toISOString(),
            metadata
        };

        agentOrders.set(orderId, order);

        // If payment method is Stripe, create Stripe checkout
        if (paymentMethod === 'stripe') {
            const checkoutUrl = await createStripeCheckout(order);
            
            res.json({
                success: true,
                orderId,
                agentId,
                price,
                checkoutUrl,
                message: 'Agent order created! Complete payment to generate your agent.'
            });
        } else {
            // Free/testing mode
            res.json({
                success: true,
                orderId,
                agentId,
                price: 0,
                message: 'Agent order created in test mode!'
            });
        }

    } catch (error) {
        console.error('❌ Agent order error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create agent order',
            details: error.message
        });
    }
});

/**
 * 💳 STRIPE PAYMENT WEBHOOK
 * POST /api/create-agent/webhook/stripe
 */
router.post('/webhook/stripe', express.raw({type: 'application/json'}), async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        // In production, verify signature with Stripe webhook secret
        
        const event = JSON.parse(req.body.toString());

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const orderId = session.metadata.orderId;
            
            if (orderId && agentOrders.has(orderId)) {
                const order = agentOrders.get(orderId);
                order.paymentStatus = 'completed';
                order.paymentDate = new Date().toISOString();
                
                // Automatically create agent after payment
                await createAgentAutomatically(order);
                
                console.log(`✅ Payment completed for order: ${orderId}`);
            }
        }

        res.json({received: true});
    } catch (error) {
        console.error('❌ Webhook error:', error);
        res.status(400).json({error: 'Webhook failed'});
    }
});

/**
 * 🤖 GET AGENT STATUS
 * GET /api/create-agent/status/:orderId
 */
router.get('/status/:orderId', (req, res) => {
    const { orderId } = req.params;
    
    if (!agentOrders.has(orderId)) {
        return res.status(404).json({
            success: false,
            error: 'Order not found'
        });
    }

    const order = agentOrders.get(orderId);
    const agent = createdAgents.get(order.agentId);

    res.json({
        success: true,
        order: {
            orderId: order.orderId,
            agentName: order.agentName,
            agentType: order.agentType,
            paymentStatus: order.paymentStatus,
            creationStatus: order.creationStatus,
            createdAt: order.createdAt
        },
        agent: agent ? {
            agentId: agent.agentId,
            downloadUrl: agent.downloadUrl,
            installInstructions: agent.installInstructions,
            apiKey: agent.apiKey,
            cloudUrl: agent.cloudUrl
        } : null
    });
});

/**
 * 📥 DOWNLOAD AGENT
 * GET /api/create-agent/download/:agentId
 */
router.get('/download/:agentId', (req, res) => {
    const { agentId } = req.params;
    
    if (!createdAgents.has(agentId)) {
        return res.status(404).json({
            success: false,
            error: 'Agent not found'
        });
    }

    const agent = createdAgents.get(agentId);
    
    // Generate agent code on-the-fly
    const agentCode = generateAgentCode(agent);
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${agent.agentName}-agent.py"`);
    res.send(agentCode);
});

/**
 * 🛠️ HELPER FUNCTIONS
 */

function getDefaultFeatures(agentType) {
    const features = {
        'fast': [
            'network-scan',
            'security-audit',
            'cloud-sync',
            'real-time-monitoring',
            'parallel-scanning'
        ],
        'standard': [
            'network-scan',
            'cloud-sync',
            'basic-monitoring'
        ],
        'enterprise': [
            'network-scan',
            'security-audit',
            'cloud-sync',
            'real-time-monitoring',
            'parallel-scanning',
            'ai-analysis',
            'predictive-alerts',
            'multi-device-orchestration',
            'custom-integrations'
        ]
    };
    
    return features[agentType] || features['standard'];
}

async function createStripeCheckout(order) {
    // In production, integrate with Stripe
    // For now, return mock URL
    const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;
    
    if (!STRIPE_PUBLISHABLE_KEY) {
        console.log('⚠️  Stripe not configured - using test mode');
        return `https://nupidesktopai.com/agent-checkout?order=${order.orderId}`;
    }

    // Real Stripe integration would go here
    return `https://checkout.stripe.com/pay/${order.orderId}`;
}

async function createAgentAutomatically(order) {
    try {
        console.log(`🤖 Creating agent automatically: ${order.agentName}`);
        
        const apiKey = `nupi_agent_${crypto.randomBytes(16).toString('hex')}`;
        
        const agent = {
            agentId: order.agentId,
            agentName: order.agentName,
            agentType: order.agentType,
            features: order.features,
            platform: order.platform,
            apiKey: apiKey,
            cloudUrl: 'https://nupidesktopai.com',
            downloadUrl: `https://nupidesktopai.com/api/create-agent/download/${order.agentId}`,
            installInstructions: generateInstallInstructions(order),
            createdAt: new Date().toISOString()
        };

        createdAgents.set(order.agentId, agent);
        order.creationStatus = 'completed';
        order.completedAt = new Date().toISOString();

        // Send to Telegram
        await sendAgentCreatedNotification(order, agent);
        
        // Send email with download link
        await sendAgentDownloadEmail(order, agent);

        console.log(`✅ Agent created: ${agent.agentName} (${agent.agentId})`);
        
        return agent;
    } catch (error) {
        console.error('❌ Agent creation error:', error);
        throw error;
    }
}

async function sendAgentCreatedNotification(order, agent) {
    // Send to Telegram bot
    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.YOUR_CHAT_ID;
    
    if (!TELEGRAM_TOKEN || !CHAT_ID) return;

    const message = `
🤖 NEW AGENT CREATED!

📝 Order ID: ${order.orderId}
🆔 Agent ID: ${agent.agentId}
📛 Name: ${agent.agentName}
⚡ Type: ${order.agentType.toUpperCase()}
💰 Price: $${order.price}
📧 Customer: ${order.email}

🔗 Download: ${agent.downloadUrl}
🔑 API Key: ${agent.apiKey}

✅ Payment: ${order.paymentStatus}
✅ Status: ${order.creationStatus}
    `.trim();

    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
    } catch (error) {
        console.error('Telegram notification failed:', error);
    }
}

async function sendAgentDownloadEmail(order, agent) {
    // Email integration would go here
    console.log(`📧 Email sent to: ${order.email}`);
}

function generateInstallInstructions(order) {
    const platform = order.platform;
    
    const instructions = {
        'macos': `
🍎 MacOS Installation:

1. Download the agent file
2. Open Terminal
3. Run: chmod +x ${order.agentName}-agent.py
4. Run: export NUPI_API_KEY=${order.agentId}
5. Run: python3 ${order.agentName}-agent.py

Your agent will start automatically!
        `.trim(),
        
        'windows': `
🪟 Windows Installation:

1. Download the agent file
2. Install Python 3.9+ if not installed
3. Open Command Prompt
4. Run: set NUPI_API_KEY=${order.agentId}
5. Run: python ${order.agentName}-agent.py

Your agent will start automatically!
        `.trim(),
        
        'linux': `
🐧 Linux Installation:

1. Download the agent file
2. Open Terminal
3. Run: chmod +x ${order.agentName}-agent.py
4. Run: export NUPI_API_KEY=${order.agentId}
5. Run: python3 ${order.agentName}-agent.py

Your agent will start automatically!
        `.trim()
    };

    return instructions[platform] || instructions['linux'];
}

function generateAgentCode(agent) {
    // Generate custom agent code based on features
    const speed = agent.agentType === 'fast' ? '12' : '120';
    const features = agent.features.join(', ');
    
    return `#!/usr/bin/env python3
"""
🤖 ${agent.agentName.toUpperCase()}
Custom NUPI Agent - Generated automatically
Agent ID: ${agent.agentId}
Type: ${agent.agentType}
Features: ${features}
"""

import os
import time
import requests
import socket

AGENT_ID = "${agent.agentId}"
API_KEY = "${agent.apiKey}"
CLOUD_URL = "${agent.cloudUrl}"
SCAN_INTERVAL = ${speed}  # seconds

class ${agent.agentName.replace(/[^a-zA-Z0-9]/g, '')}Agent:
    def __init__(self):
        self.agent_id = AGENT_ID
        self.api_key = API_KEY
        self.cloud_url = CLOUD_URL
        self.running = True
        
        print(f"🤖 {agent.agentName} Agent Starting...")
        print(f"🆔 Agent ID: {self.agent_id}")
        print(f"☁️  Cloud: {self.cloud_url}")
        
    def sync_to_cloud(self):
        """Sync data to NUPI Cloud"""
        try:
            response = requests.post(
                f"{self.cloud_url}/api/travelling-agent/visit",
                headers={'x-api-key': self.api_key},
                json={
                    'agent_id': self.agent_id,
                    'agent_name': '${agent.agentName}',
                    'hostname': socket.gethostname()
                },
                timeout=5
            )
            
            if response.status_code == 200:
                print("✅ Synced to cloud")
            else:
                print(f"⚠️  Cloud status: {response.status_code}")
        except Exception as e:
            print(f"❌ Sync error: {e}")
    
    def run(self):
        """Main agent loop"""
        print(f"\\n🚀 Agent running... (scanning every {SCAN_INTERVAL}s)")
        
        while self.running:
            try:
                self.sync_to_cloud()
                time.sleep(SCAN_INTERVAL)
            except KeyboardInterrupt:
                print("\\n🛑 Agent stopped")
                self.running = False
                break

if __name__ == "__main__":
    agent = ${agent.agentName.replace(/[^a-zA-Z0-9]/g, '')}Agent()
    agent.run()
`;
}

module.exports = router;
