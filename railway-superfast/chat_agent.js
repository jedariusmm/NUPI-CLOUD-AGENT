/**
 * AUTONOMOUS CHAT AGENT SYSTEM
 * GitHub Copilot-style AI Assistant
 * Powered by Claude 3.5 Sonnet + Tavily Web Search
 */

const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');

// Configuration - MUST be set in Railway environment variables
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
}
if (!TAVILY_API_KEY) {
    throw new Error('TAVILY_API_KEY environment variable is required');
}

const anthropic = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
});

class ChatAgent {
    constructor() {
        this.conversationHistory = [];
        this.systemPrompt = `You are NUPI Assistant, an autonomous AI agent similar to GitHub Copilot.

You have access to:
- Real-time network monitoring data from 192.168.12.x
- 14 active agents collecting device data
- Web search capabilities via Tavily
- Code execution and analysis capabilities

Your personality:
- Professional but friendly
- Proactive and autonomous
- Technical and precise
- Helpful and informative

You can:
1. Monitor and analyze network agents
2. Search the web for real-time information
3. Execute code and commands
4. Manage todos and tasks
5. Analyze device data and network stats
6. Provide technical assistance

Always be concise but informative. Use emojis sparingly for visual clarity.`;
    }

    async searchWeb(query) {
        try {
            const response = await axios.post('https://api.tavily.com/search', {
                api_key: TAVILY_API_KEY,
                query: query,
                search_depth: 'basic',
                max_results: 5
            });

            const results = response.data.results.map(r => ({
                title: r.title,
                url: r.url,
                content: r.content
            }));

            return results;
        } catch (error) {
            console.error('Tavily search error:', error.message);
            return [];
        }
    }

    async getNetworkStats() {
        try {
            const response = await axios.get('http://localhost:3000/api/stats');
            return response.data;
        } catch (error) {
            console.error('Failed to get network stats:', error.message);
            return null;
        }
    }

    async getActiveAgents() {
        try {
            const response = await axios.get('http://localhost:3000/api/agents');
            return response.data;
        } catch (error) {
            console.error('Failed to get agents:', error.message);
            return null;
        }
    }

    async chat(userMessage, options = {}) {
        const {
            model = 'claude-3-5-sonnet-20241022',
            webSearch = false,
            streamResponse = false,
            context = {}
        } = options;

        try {
            // Build context
            let contextInfo = '';

            // Add network stats
            if (context.includeStats !== false) {
                const stats = await this.getNetworkStats();
                if (stats) {
                    contextInfo += `\n\n**Current Network Stats:**\n`;
                    contextInfo += `- Total Devices: ${stats.total_devices}\n`;
                    contextInfo += `- Network: ${stats.network}\n`;
                    contextInfo += `- Active Agents: ${stats.active_agents}\n`;
                    contextInfo += `- Last Scan: ${stats.last_scan}\n`;
                }
            }

            // Add active agents
            if (context.includeAgents !== false) {
                const agents = await this.getActiveAgents();
                if (agents && agents.count > 0) {
                    contextInfo += `\n\n**Active Agents:**\n`;
                    agents.agents.forEach(agent => {
                        contextInfo += `- ${agent.agent_id}: ${agent.action}`;
                        if (agent.target_ip) contextInfo += ` (${agent.target_ip})`;
                        contextInfo += `\n`;
                    });
                }
            }

            // Perform web search if requested
            if (webSearch) {
                const searchResults = await this.searchWeb(userMessage);
                if (searchResults.length > 0) {
                    contextInfo += `\n\n**Web Search Results:**\n`;
                    searchResults.forEach((result, i) => {
                        contextInfo += `${i + 1}. **${result.title}**\n`;
                        contextInfo += `   ${result.content}\n`;
                        contextInfo += `   URL: ${result.url}\n\n`;
                    });
                }
            }

            // Add user message to history
            this.conversationHistory.push({
                role: 'user',
                content: userMessage + contextInfo
            });

            // Keep history manageable (last 10 messages)
            if (this.conversationHistory.length > 10) {
                this.conversationHistory = this.conversationHistory.slice(-10);
            }

            // Call Claude
            const response = await anthropic.messages.create({
                model: model,
                max_tokens: 4096,
                system: this.systemPrompt,
                messages: this.conversationHistory
            });

            const assistantMessage = response.content[0].text;

            // Add assistant response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: assistantMessage
            });

            return {
                success: true,
                response: assistantMessage,
                model: model,
                usage: response.usage
            };

        } catch (error) {
            console.error('Chat error:', error);
            return {
                success: false,
                error: error.message,
                response: `❌ Error: ${error.message}`
            };
        }
    }

    clearHistory() {
        this.conversationHistory = [];
    }

    async executeCommand(command) {
        // TODO: Implement safe command execution
        return {
            success: false,
            error: 'Command execution not yet implemented'
        };
    }
}

// Export
module.exports = ChatAgent;

// Test if run directly
if (require.main === module) {
    (async () => {
        console.log('🤖 Testing Chat Agent...\n');
        
        const agent = new ChatAgent();
        
        // Test 1: Basic chat
        console.log('Test 1: Basic chat');
        const response1 = await agent.chat('Hello! What can you help me with?');
        console.log('Response:', response1.response);
        console.log('\n---\n');

        // Test 2: Network stats
        console.log('Test 2: Network stats query');
        const response2 = await agent.chat('How many agents are currently active?');
        console.log('Response:', response2.response);
        console.log('\n---\n');

        // Test 3: Web search
        console.log('Test 3: Web search');
        const response3 = await agent.chat('What is the current price of Bitcoin?', { webSearch: true });
        console.log('Response:', response3.response);
        
        console.log('\n✅ Tests complete!');
    })();
}
