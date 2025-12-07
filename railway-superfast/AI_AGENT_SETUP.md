# 🤖 NUPI AI Agent - Complete Setup Guide

## ✨ FULL CAPABILITIES

Your NUPI AI Agent now has **COMPLETE** capabilities just like me! 

### 🎯 Features

**AI Intelligence:**
- ✅ **Claude 3.5 Sonnet** integration (most advanced AI)
- ✅ Real-time system monitoring
- ✅ Context-aware conversations
- ✅ Conversation history (remembers chat)
- ✅ Smart fallbacks (works even without Claude)

**Professional Interface:**
- ✅ **Adjustable window** (drag to move, resize handles)
- ✅ **Mobile-responsive** (adapts to any screen)
- ✅ **Minimizable** chat window
- ✅ **Quick action** buttons for common tasks
- ✅ **Keyboard shortcut**: `Ctrl+K` or `Cmd+K` to open
- ✅ **Typing indicators** for natural feel
- ✅ **Timestamps** on all messages

**System Integration:**
- ✅ Real-time agent status
- ✅ Device tracking & network analysis
- ✅ System health monitoring
- ✅ Command suggestions
- ✅ Web search ready (Tavily API)

---

## 🔑 Enable Claude AI (Optional but Recommended)

### Step 1: Get Claude API Key

1. Go to: https://console.anthropic.com/
2. Sign up or log in
3. Navigate to **API Keys**
4. Create a new API key
5. Copy your key (starts with `sk-ant-...`)

### Step 2: Add to Railway

In Railway Dashboard:
1. Go to your **NUPI-CLOUD-AGENT** service
2. Click **Variables** tab
3. Add new variable:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: `sk-ant-your-api-key-here`
4. Save and redeploy

### Step 3: Verify

Once deployed, the chat will show:
- "Claude AI Integration: ✅ Connected"
- Much smarter, context-aware responses
- Natural conversation flow

---

## 🌐 Add Tavily Web Search (Optional)

For web search capabilities:

1. Get API key: https://tavily.com/
2. Add to Railway variables:
   - **Name**: `TAVILY_API_KEY`
   - **Value**: Your Tavily key
3. Now AI can search the web for answers!

---

## 📱 Chat Features Guide

### Opening the Chat

**Methods:**
1. Click the purple bubble (bottom-right)
2. Press `Ctrl+K` (Windows/Linux) or `Cmd+K` (Mac)

### Window Controls

**Drag to Move:**
- Click and drag the header bar
- Position anywhere on screen
- (Desktop only - mobile is fixed)

**Resize:**
- Drag from bottom-right corner
- Min: 320x400px
- Max: 800x900px

**Minimize:**
- Click the `—` button in header
- Closes window but keeps history

**Close:**
- Click the `×` button
- Or press `Ctrl+K` again

### Quick Actions

Pre-set questions for common tasks:
- **📊 Agent Status** - Check active agents
- **🔍 Devices** - View network devices
- **💚 Health** - System health check
- **❓ Help** - Show all capabilities

### Mobile Experience

On mobile devices:
- Full-screen optimized layout
- Touch-friendly buttons
- Swipe-friendly scrolling
- Auto-adjusts to screen size

---

## 💬 What to Ask the AI

### System Monitoring
```
"How many agents are active?"
"Show me device status"
"What's the system health?"
"Are all agents online?"
```

### Analysis & Help
```
"Help me optimize performance"
"What can you do?"
"Explain the agent system"
"How do I add more agents?"
```

### Commands (Smart Suggestions)
```
"Run a network scan"
"Show me agent locations"
"Check for offline agents"
"Monitor system resources"
```

### Web Search (if Tavily enabled)
```
"Search for network security best practices"
"Find latest Claude API updates"
"Look up Python async programming"
```

---

## 🎨 Customization

### Change Colors

Edit `public/nupi-ai-chat-widget.html`:

```css
/* Main gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Change to your brand colors */
background: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
```

### Adjust Size

```css
#nupi-chat-window {
    width: 420px;    /* Change width */
    height: 650px;   /* Change height */
}
```

### Change Position

```css
#nupi-chat-btn {
    bottom: 24px;    /* Distance from bottom */
    right: 24px;     /* Distance from right */
}
```

---

## 🔧 Troubleshooting

### Chat not responding?

1. Check Railway logs for errors
2. Verify API keys are set correctly
3. Test fallback mode (works without Claude)

### Window not dragging?

- Dragging only works on desktop (>768px width)
- Mobile has fixed position for usability

### Styling issues?

- Clear browser cache (Ctrl+Shift+R)
- Check for CSS conflicts with other scripts

---

## 🚀 Advanced Features

### Conversation History

The AI remembers your conversation:
- Last 20 messages kept in memory
- Context-aware responses
- Natural conversation flow

### Smart Fallbacks

Even without Claude API:
- Still fully functional
- Uses intelligent pattern matching
- Real-time system data integration
- Command suggestions

### Real-time Data

AI has access to:
```javascript
- Active agent count
- Device discoveries
- Visitor statistics
- System health metrics
- Network status
```

---

## 📊 Usage Statistics

Track in Railway logs:
- Message count
- Response times
- API usage (if Claude enabled)
- Error rates

---

## 🌟 Best Practices

1. **Set Claude API key** for best experience
2. **Use quick actions** for common tasks
3. **Ask natural questions** - AI understands context
4. **Ctrl+K shortcut** for quick access
5. **Drag & resize** to fit your workflow

---

## 🎯 What Makes This AI Special

### vs Regular Chatbots:
- ✅ Real system integration
- ✅ Live data access
- ✅ Context awareness
- ✅ Professional interface
- ✅ Mobile-responsive
- ✅ Adjustable & draggable

### vs Generic AI:
- ✅ Specialized for NUPI system
- ✅ Direct command execution
- ✅ Real-time monitoring
- ✅ Network analysis
- ✅ Agent management

---

## 📞 Support

If you need help:
1. Ask the AI agent itself! (It can help with most issues)
2. Check Railway deployment logs
3. Verify environment variables are set
4. Test with simple questions first

---

**Your AI agent is now fully operational with complete capabilities! 🚀**

Set the ANTHROPIC_API_KEY in Railway to enable Claude AI for the best experience.
