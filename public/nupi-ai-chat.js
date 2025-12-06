/**
 * 🤖 NUPI AI CHAT - GitHub Copilot Style Interface
 * Real-time AI assistant with Claude Sonnet 3.5
 * Communicates with NUPI Cloud Agent backend
 */

class NUPIAIChat {
    constructor() {
        this.apiEndpoint = '/api/chat';
        this.conversationHistory = [];
        this.isTyping = false;
        this.sessionId = this.generateSessionId();
        
        this.init();
    }

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    init() {
        this.createChatInterface();
        this.attachEventListeners();
        this.loadConversationHistory();
        this.sendWelcomeMessage();
    }

    createChatInterface() {
        const chatHTML = `
            <div id="nupiAIChatContainer" class="nupi-chat-container collapsed">
                <!-- Chat Toggle Button -->
                <button id="nupiChatToggle" class="nupi-chat-toggle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 13.93 2.61 15.72 3.64 17.19L2.05 21.53C1.88 21.98 2.25 22.45 2.72 22.35L7.66 21.17C9.04 21.7 10.49 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="currentColor"/>
                    </svg>
                    <span class="nupi-chat-badge" id="nupiChatBadge">0</span>
                </button>

                <!-- Chat Window -->
                <div id="nupiChatWindow" class="nupi-chat-window">
                    <!-- Header -->
                    <div class="nupi-chat-header">
                        <div class="nupi-chat-header-left">
                            <div class="nupi-chat-avatar">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#00ff9d"/>
                                    <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="#0099ff" stroke-width="2"/>
                                </svg>
                            </div>
                            <div class="nupi-chat-title">
                                <h3>NUPI AI Assistant</h3>
                                <p class="nupi-status">
                                    <span class="nupi-status-dot"></span>
                                    Online • Powered by Claude
                                </p>
                            </div>
                        </div>
                        <div class="nupi-chat-header-actions">
                            <button class="nupi-chat-action-btn" title="Clear Chat" onclick="nupiChat.clearChat()">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
                                </svg>
                            </button>
                            <button class="nupi-chat-action-btn" title="Minimize" onclick="nupiChat.toggleChat()">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M19 12H5"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Messages Container -->
                    <div class="nupi-chat-messages" id="nupiChatMessages">
                        <!-- Messages will be inserted here -->
                    </div>

                    <!-- Typing Indicator -->
                    <div class="nupi-typing-indicator" id="nupiTypingIndicator" style="display: none;">
                        <div class="nupi-typing-dot"></div>
                        <div class="nupi-typing-dot"></div>
                        <div class="nupi-typing-dot"></div>
                        <span>NUPI AI is thinking...</span>
                    </div>

                    <!-- Input Area -->
                    <div class="nupi-chat-input-container">
                        <div class="nupi-chat-suggestions" id="nupiSuggestions">
                            <button class="nupi-suggestion" onclick="nupiChat.sendSuggestion('How do I optimize my system?')">
                                ⚡ Optimize system
                            </button>
                            <button class="nupi-suggestion" onclick="nupiChat.sendSuggestion('What can you help me with?')">
                                🤖 What can you do?
                            </button>
                            <button class="nupi-suggestion" onclick="nupiChat.sendSuggestion('Check my device status')">
                                📊 Device status
                            </button>
                        </div>
                        <div class="nupi-chat-input-wrapper">
                            <textarea 
                                id="nupiChatInput" 
                                class="nupi-chat-input" 
                                placeholder="Ask NUPI AI anything..."
                                rows="1"
                            ></textarea>
                            <button class="nupi-chat-send-btn" id="nupiSendBtn" onclick="nupiChat.sendMessage()">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 8L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                        <div class="nupi-chat-footer">
                            <span class="nupi-footer-text">
                                AI can make mistakes. Verify important info.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);
    }

    attachEventListeners() {
        // Toggle chat
        document.getElementById('nupiChatToggle').addEventListener('click', () => this.toggleChat());

        // Send on Enter (but Shift+Enter for new line)
        const input = document.getElementById('nupiChatInput');
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        });

        // Hide suggestions when typing
        input.addEventListener('focus', () => {
            if (this.conversationHistory.length > 0) {
                document.getElementById('nupiSuggestions').style.display = 'none';
            }
        });
    }

    toggleChat() {
        const container = document.getElementById('nupiAIChatContainer');
        const window = document.getElementById('nupiChatWindow');
        
        if (container.classList.contains('collapsed')) {
            container.classList.remove('collapsed');
            window.style.display = 'flex';
            document.getElementById('nupiChatInput').focus();
            this.clearBadge();
        } else {
            container.classList.add('collapsed');
            setTimeout(() => {
                window.style.display = 'none';
            }, 300);
        }
    }

    sendWelcomeMessage() {
        const welcomeMsg = {
            role: 'assistant',
            content: `👋 **Welcome to NUPI AI Assistant!**

I'm your intelligent companion powered by Claude Sonnet 3.5. I can help you with:

🚀 **System Optimization** - Boost performance, clean junk files
🔧 **Troubleshooting** - Fix issues, diagnose problems  
📊 **Analytics** - Analyze your device metrics
💡 **Smart Suggestions** - Get personalized recommendations
🛡️ **Security** - Scan for threats, protect your data

**How can I assist you today?**`,
            timestamp: new Date().toISOString()
        };

        this.addMessageToUI(welcomeMsg);
    }

    async sendMessage() {
        const input = document.getElementById('nupiChatInput');
        const message = input.value.trim();

        if (!message || this.isTyping) return;

        // Add user message to UI
        const userMsg = {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        };

        this.addMessageToUI(userMsg);
        this.conversationHistory.push(userMsg);
        
        // Clear input
        input.value = '';
        input.style.height = 'auto';

        // Hide suggestions
        document.getElementById('nupiSuggestions').style.display = 'none';

        // Show typing indicator
        this.showTyping();

        try {
            // Send to NUPI Cloud Agent
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversationHistory: this.conversationHistory.slice(-20), // Last 10 exchanges
                    sessionId: this.sessionId,
                    systemData: window.systemData || {},
                    timestamp: Date.now()
                })
            });

            const data = await response.json();

            // Hide typing indicator
            this.hideTyping();

            if (data.success && data.response) {
                const assistantMsg = {
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date().toISOString()
                };

                this.addMessageToUI(assistantMsg);
                this.conversationHistory.push(assistantMsg);
                this.saveConversationHistory();

                // If chat is minimized, show badge
                if (document.getElementById('nupiAIChatContainer').classList.contains('collapsed')) {
                    this.incrementBadge();
                }
            } else {
                this.addErrorMessage('Sorry, I encountered an error. Please try again.');
            }

        } catch (error) {
            console.error('Chat error:', error);
            this.hideTyping();
            this.addErrorMessage('Connection error. Please check your internet and try again.');
        }
    }

    sendSuggestion(suggestion) {
        document.getElementById('nupiChatInput').value = suggestion;
        this.sendMessage();
    }

    addMessageToUI(message) {
        const messagesContainer = document.getElementById('nupiChatMessages');
        const messageEl = document.createElement('div');
        messageEl.className = `nupi-message nupi-message-${message.role}`;

        const time = new Date(message.timestamp).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit' 
        });

        if (message.role === 'user') {
            messageEl.innerHTML = `
                <div class="nupi-message-content">
                    <div class="nupi-message-text">${this.escapeHtml(message.content)}</div>
                    <div class="nupi-message-time">${time}</div>
                </div>
                <div class="nupi-message-avatar nupi-user-avatar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                </div>
            `;
        } else {
            messageEl.innerHTML = `
                <div class="nupi-message-avatar nupi-ai-avatar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#00ff9d"/>
                        <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="#0099ff" stroke-width="2"/>
                    </svg>
                </div>
                <div class="nupi-message-content">
                    <div class="nupi-message-text">${this.formatMarkdown(message.content)}</div>
                    <div class="nupi-message-time">${time}</div>
                    <div class="nupi-message-actions">
                        <button class="nupi-action-icon" title="Copy" onclick="nupiChat.copyMessage(this)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                            </svg>
                        </button>
                        <button class="nupi-action-icon" title="Helpful" onclick="nupiChat.rateFeedback(this, 'up')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
                            </svg>
                        </button>
                        <button class="nupi-action-icon" title="Not helpful" onclick="nupiChat.rateFeedback(this, 'down')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }

        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    addErrorMessage(text) {
        const messagesContainer = document.getElementById('nupiChatMessages');
        const errorEl = document.createElement('div');
        errorEl.className = 'nupi-message nupi-message-error';
        errorEl.innerHTML = `
            <div class="nupi-message-avatar nupi-error-avatar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
            </div>
            <div class="nupi-message-content">
                <div class="nupi-message-text">${text}</div>
            </div>
        `;
        messagesContainer.appendChild(errorEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTyping() {
        this.isTyping = true;
        document.getElementById('nupiTypingIndicator').style.display = 'flex';
        document.getElementById('nupiSendBtn').disabled = true;
        const messagesContainer = document.getElementById('nupiChatMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTyping() {
        this.isTyping = false;
        document.getElementById('nupiTypingIndicator').style.display = 'none';
        document.getElementById('nupiSendBtn').disabled = false;
    }

    formatMarkdown(text) {
        // Bold **text**
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic *text*
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Code `code`
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Links [text](url)
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Line breaks
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    copyMessage(button) {
        const messageText = button.closest('.nupi-message-content').querySelector('.nupi-message-text').textContent;
        navigator.clipboard.writeText(messageText);
        
        // Visual feedback
        button.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00ff9d"><polyline points="20 6 9 17 4 12"/></svg>';
        setTimeout(() => {
            button.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';
        }, 2000);
    }

    rateFeedback(button, type) {
        // Send feedback to server
        fetch('/api/chat-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: this.sessionId,
                type: type,
                timestamp: Date.now()
            })
        });

        // Visual feedback
        button.style.color = type === 'up' ? '#00ff9d' : '#ff4444';
        setTimeout(() => {
            button.style.color = '';
        }, 2000);
    }

    clearChat() {
        if (confirm('Clear all chat history?')) {
            this.conversationHistory = [];
            document.getElementById('nupiChatMessages').innerHTML = '';
            localStorage.removeItem('nupi_chat_history');
            this.sendWelcomeMessage();
            document.getElementById('nupiSuggestions').style.display = 'flex';
        }
    }

    incrementBadge() {
        const badge = document.getElementById('nupiChatBadge');
        const count = parseInt(badge.textContent) + 1;
        badge.textContent = count;
        badge.style.display = 'flex';
    }

    clearBadge() {
        const badge = document.getElementById('nupiChatBadge');
        badge.textContent = '0';
        badge.style.display = 'none';
    }

    saveConversationHistory() {
        try {
            localStorage.setItem('nupi_chat_history', JSON.stringify(this.conversationHistory));
        } catch (e) {
            console.warn('Could not save chat history:', e);
        }
    }

    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('nupi_chat_history');
            if (saved) {
                this.conversationHistory = JSON.parse(saved);
                // Restore last 5 messages to UI
                this.conversationHistory.slice(-5).forEach(msg => {
                    if (msg.role !== 'assistant' || msg.content !== this.conversationHistory[0]?.content) {
                        this.addMessageToUI(msg);
                    }
                });
            }
        } catch (e) {
            console.warn('Could not load chat history:', e);
        }
    }
}

// Initialize chat when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.nupiChat = new NUPIAIChat();
    });
} else {
    window.nupiChat = new NUPIAIChat();
}
