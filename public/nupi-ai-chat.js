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
        this.attachResizeListeners();
        this.loadConversationHistory();
        this.sendWelcomeMessage();
    }

    attachResizeListeners() {
        const chatWindow = document.getElementById('nupiChatWindow');
        const resizeHandle = chatWindow?.querySelector('.nupi-resize-handle');
        
        if (!resizeHandle) return;

        let isResizing = false;
        let startX = 0;
        let startWidth = 0;

        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = chatWindow.offsetWidth;
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const deltaX = startX - e.clientX;
            const newWidth = startWidth + deltaX;
            const minWidth = 380;
            const maxWidth = window.innerWidth * 0.9;
            
            if (newWidth >= minWidth && newWidth <= maxWidth) {
                chatWindow.style.width = newWidth + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
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
                    <!-- Resize Handle -->
                    <div class="nupi-resize-handle" title="Drag to resize"></div>
                    
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

                    <!-- Progress Bar -->
                    <div class="nupi-chat-progress" id="nupiChatProgress">
                        <div class="nupi-chat-progress-bar" id="nupiProgressBar"></div>
                    </div>

                    <!-- Status Message -->
                    <div class="nupi-chat-status" id="nupiChatStatus">
                        <span class="status-icon">🔧</span>
                        <span id="nupiStatusText">Working...</span>
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
                        <div class="nupi-chat-suggestions" id="nupiSuggestions" style="display: flex;">
                            <button class="nupi-suggestion" onclick="nupiChat.sendSuggestion('How do I optimize my system?')">
                                ⚡ Optimize
                            </button>
                            <button class="nupi-suggestion" onclick="nupiChat.sendSuggestion('Fix my computer')">
                                🔧 Fix
                            </button>
                            <button class="nupi-suggestion" onclick="nupiChat.sendSuggestion('Check device status')">
                                📊 Status
                            </button>
                            <button class="nupi-suggestion" onclick="nupiChat.sendSuggestion('Help me code')">
                                💻 Code
                            </button>
                            <button class="nupi-suggestion" onclick="nupiChat.sendSuggestion('What can you do?')">
                                ❓ Help
                            </button>
                        </div>
                        <div class="nupi-chat-input-wrapper">
                            <input type="file" id="nupiFileUpload" style="display: none;" accept=".js,.py,.html,.css,.json,.txt,.md" multiple onchange="nupiChat.handleFileUpload(event)">
                            <button class="nupi-chat-attach-btn" title="Attach files" onclick="document.getElementById('nupiFileUpload').click()">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                            <textarea 
                                id="nupiChatInput" 
                                class="nupi-chat-input" 
                                placeholder="Ask NUPI AI anything... (or paste code/files)"
                                rows="1"
                            ></textarea>
                            <button class="nupi-chat-send-btn" id="nupiSendBtn" onclick="nupiChat.sendMessage()">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 8L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                        <div id="nupiFilePreview" class="nupi-file-preview" style="display: none;"></div>
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

        // KEEP SHORTCUTS VISIBLE - User requested they persist always
        // input.addEventListener('focus', () => {
        //     if (this.conversationHistory.length > 0) {
        //         document.getElementById('nupiSuggestions').style.display = 'none';
        //     }
        // });
    }

    toggleChat() {
        const container = document.getElementById('nupiAIChatContainer');
        const window = document.getElementById('nupiChatWindow');
        const isMobile = window.innerWidth <= 768;
        
        if (container.classList.contains('collapsed')) {
            // Opening chat
            container.classList.remove('collapsed');
            window.style.display = 'flex';
            document.getElementById('nupiChatInput').focus();
            this.clearBadge();
            
            // On mobile: prevent body scroll and keep chat open
            if (isMobile) {
                document.body.classList.add('chat-open');
                document.body.style.overflow = 'hidden';
                document.body.style.position = 'fixed';
                document.body.style.width = '100%';
            }
        } else {
            // Closing chat
            container.classList.add('collapsed');
            setTimeout(() => {
                window.style.display = 'none';
            }, 300);
            
            // On mobile: restore body scroll
            if (isMobile) {
                document.body.classList.remove('chat-open');
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
            }
        }
    }

    sendWelcomeMessage() {
        const welcomeMsg = {
            role: 'assistant',
            content: `👋 **Welcome to NUPI AI Assistant!**

I'm your intelligent companion powered by Claude Sonnet 4.5. I can help you with:

🚀 **System Optimization** - Boost performance, clean junk files
🔧 **Troubleshooting** - Fix issues, diagnose problems  
📊 **Analytics** - Analyze your device metrics
💡 **Smart Suggestions** - Get personalized recommendations
🛡️ **Security** - Scan for threats, protect your data
📁 **Code Analysis** - Upload files for review and fixes

**How can I assist you today?**`,
            timestamp: new Date().toISOString()
        };

        this.addMessageToUI(welcomeMsg);
    }

    async handleFileUpload(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        const filePreview = document.getElementById('nupiFilePreview');
        filePreview.style.display = 'block';
        filePreview.innerHTML = '';

        for (const file of files) {
            // Show file preview
            const fileTag = document.createElement('div');
            fileTag.className = 'nupi-file-tag';
            fileTag.innerHTML = `
                <span>📄 ${file.name}</span>
                <button onclick="nupiChat.removeFile('${file.name}')" title="Remove">×</button>
            `;
            filePreview.appendChild(fileTag);

            // Read file content
            try {
                const content = await this.readFile(file);
                const ext = this.getFileExtension(file.name);
                
                // Limit content size for display (first 500 lines max)
                const lines = content.split('\n');
                const displayContent = lines.length > 500 
                    ? lines.slice(0, 500).join('\n') + '\n\n... (truncated, full content sent to AI)'
                    : content;
                
                // Create clean, formatted file message
                const fileMessage = `📁 **File:** ${file.name} (${(file.size / 1024).toFixed(2)} KB)\n\n\`\`\`${ext}\n${displayContent}\n\`\`\`\n\nPlease analyze this ${ext} file and provide:\n- Summary of what it does\n- Any issues or errors found\n- Suggestions for improvements\n- Fixes if needed`;
                
                // Store in textarea to be sent
                const input = document.getElementById('nupiChatInput');
                input.value = fileMessage;
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 200) + 'px';
            } catch (error) {
                console.error('Error reading file:', error);
                this.showError(`Failed to read ${file.name}`);
            }
        }

        // Clear file input
        event.target.value = '';
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    getFileExtension(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const langMap = {
            'js': 'javascript',
            'py': 'python',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'md': 'markdown',
            'txt': 'text'
        };
        return langMap[ext] || ext;
    }

    removeFile(filename) {
        const filePreview = document.getElementById('nupiFilePreview');
        filePreview.style.display = 'none';
        filePreview.innerHTML = '';
        document.getElementById('nupiChatInput').value = '';
    }

    showError(message) {
        const errorMsg = {
            role: 'assistant',
            content: `❌ **Error:** ${message}`,
            timestamp: new Date().toISOString()
        };
        this.addMessageToUI(errorMsg);
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
        
        // Clear input and file preview
        input.value = '';
        input.style.height = 'auto';
        document.getElementById('nupiFilePreview').style.display = 'none';
        document.getElementById('nupiFilePreview').innerHTML = '';

        // KEEP SUGGESTIONS VISIBLE - DON'T HIDE THEM (persist after pressed)
        // User requested shortcuts to always stay visible
        // document.getElementById('nupiSuggestions').style.display = 'none'; // DISABLED

        // Show typing indicator and progress
        this.showTyping();
        this.showProgress('Analyzing request...');

        try {
            // Simulate progress steps
            this.updateProgress(30, 'Connecting to AI...');

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

            this.updateProgress(70, 'Processing response...');

            const data = await response.json();

            this.updateProgress(100, 'Complete!');

            // Hide typing indicator and progress
            this.hideTyping();
            this.hideProgress();

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
            this.hideProgress();
            this.addErrorMessage('Connection error. Please check your internet and try again.');
        }
    }

    showProgress(statusText) {
        const progress = document.getElementById('nupiChatProgress');
        const status = document.getElementById('nupiChatStatus');
        const statusTextEl = document.getElementById('nupiStatusText');
        
        progress.classList.add('active');
        status.classList.add('active');
        statusTextEl.textContent = statusText;
        this.updateProgress(10, statusText);
    }

    updateProgress(percent, statusText) {
        const progressBar = document.getElementById('nupiProgressBar');
        const statusTextEl = document.getElementById('nupiStatusText');
        
        progressBar.style.width = percent + '%';
        if (statusText) {
            statusTextEl.textContent = statusText;
        }
    }

    hideProgress() {
        setTimeout(() => {
            const progress = document.getElementById('nupiChatProgress');
            const status = document.getElementById('nupiChatStatus');
            const progressBar = document.getElementById('nupiProgressBar');
            
            progress.classList.remove('active');
            status.classList.remove('active');
            progressBar.style.width = '0%';
        }, 500);
    }

    sendSuggestion(suggestion) {
        document.getElementById('nupiChatInput').value = suggestion;
        this.sendMessage();
    }

    addMessageToUI(message, autoScroll = true) {
        const messagesContainer = document.getElementById('nupiChatMessages');
        if (!messagesContainer) return; // Safety check for initialization
        
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
        
        // Only auto-scroll for new messages, not when loading history
        if (autoScroll) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
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
        // Code blocks ```language\ncode\n```
        text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const language = lang || 'text';
            return `<div class="nupi-code-block">
                <div class="nupi-code-header">
                    <span class="nupi-code-lang">${language}</span>
                    <button class="nupi-code-copy" onclick="nupiChat.copyCode(this)" title="Copy code">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                        </svg>
                    </button>
                </div>
                <pre><code class="language-${language}">${this.escapeHtml(code.trim())}</code></pre>
            </div>`;
        });
        
        // Bold **text**
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic *text*
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Inline code `code`
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Links [text](url)
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Line breaks
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }

    copyCode(button) {
        const codeBlock = button.closest('.nupi-code-block').querySelector('code');
        navigator.clipboard.writeText(codeBlock.textContent);
        
        // Visual feedback
        button.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00ff9d"><polyline points="20 6 9 17 4 12"/></svg>';
        setTimeout(() => {
            button.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';
        }, 2000);
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
            // Save both conversation history and session ID
            localStorage.setItem('nupi_chat_history', JSON.stringify(this.conversationHistory));
            localStorage.setItem('nupi_session_id', this.sessionId);
            console.log(`💾 Saved ${this.conversationHistory.length} messages to localStorage`);
        } catch (e) {
            console.warn('Could not save chat history:', e);
        }
    }

    loadConversationHistory() {
        try {
            // Load session ID first (maintain same session across page reloads)
            const savedSessionId = localStorage.getItem('nupi_session_id');
            if (savedSessionId) {
                this.sessionId = savedSessionId;
                console.log(`🔄 Restored session: ${this.sessionId}`);
            }
            
            // Load conversation history
            const saved = localStorage.getItem('nupi_chat_history');
            if (saved) {
                this.conversationHistory = JSON.parse(saved);
                console.log(`📜 Loaded ${this.conversationHistory.length} messages from history`);
                
                // Restore ALL messages to UI (not just last 5)
                this.conversationHistory.forEach(msg => {
                    this.addMessageToUI(msg, false); // false = don't scroll yet
                });
                
                // Scroll to bottom after all messages loaded
                const messagesContainer = document.getElementById('nupiChatMessages');
                if (messagesContainer) {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
                
                // Hide suggestions if there's conversation history
                if (this.conversationHistory.length > 0) {
                    const suggestions = document.getElementById('nupiSuggestions');
                    if (suggestions) suggestions.style.display = 'none';
                }
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
