# 🤖 AUTOMATED AI CREATION SYSTEM - COMPLETE GUIDE

## 🎯 System Overview

**Automatically creates personalized Telegram AI bots for customers after Stripe payment!**

- **URL**: https://nupi-cloud-agent-production.up.railway.app
- **Bot Manager**: https://nupi-cloud-agent-production.up.railway.app/bot-manager.html
- **Status**: ✅ LIVE & RUNNING

---

## 🔄 How It Works

### 1️⃣ **Customer Places Order on nupiai.com**
- Customer pays via Stripe
- Stripe sends webhook to: `/api/stripe-webhook`
- System automatically saves customer data

### 2️⃣ **Customer Receives Email Instructions**
```
Subject: Create Your AI Bot - Simple Steps!

Hi [Customer Name]!

1. Open Telegram
2. Search for @BotFather
3. Send: /newbot
4. Name your bot
5. Copy the bot token
6. Reply with your token
```

### 3️⃣ **Customer Sends Bot Token**
- Admin receives token via email
- Admin pastes token in Bot Manager Dashboard

### 4️⃣ **System Auto-Creates Bot**
- Generates custom bot code with customer's preferences
- Bot includes:
  - Custom personality (professional, friendly, creative, technical)
  - Specialized use case
  - Claude AI integration
  - Conversation memory
  - 24/7 availability

### 5️⃣ **Bot Goes Live**
- Customer receives welcome message in Telegram
- Bot is ready to use immediately

---

## 🛠️ Admin Dashboard

**Access:** https://nupi-cloud-agent-production.up.railway.app/bot-manager.html

### Features:
- 📊 **Live Stats** - Total customers, active bots, pending
- 📋 **Customer List** - All paid customers with details
- 🤖 **Bot Management** - Activate bots with tokens
- 🔄 **Auto-Refresh** - Updates every 30 seconds
- 🚀 **One-Click Activation** - Paste token → Click activate

---

## 📡 API Endpoints

### 1. **Stripe Webhook** (Automatic)
```
POST /api/stripe-webhook
```
Receives payment notifications from Stripe automatically.

### 2. **Activate Bot** (Manual)
```
POST /api/activate-bot
Content-Type: application/json

{
  "customerId": "CUST_12345",
  "botToken": "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
}
```

### 3. **Get All Customers & Bots**
```
GET /api/customer-bots
```

### 4. **Check Customer Status**
```
GET /api/customer-status/customer@email.com
```

---

## 🔗 Stripe Integration

### Setup Stripe Webhook:

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Endpoint URL: `https://nupi-cloud-agent-production.up.railway.app/api/stripe-webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Copy webhook secret
6. Add to Railway environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### Add Metadata to Stripe Checkout:

When creating Stripe checkout session:
```javascript
const session = await stripe.checkout.sessions.create({
  line_items: [...],
  mode: 'payment',
  success_url: 'https://nupiai.com/success',
  cancel_url: 'https://nupiai.com/cancel',
  metadata: {
    name: customerName,
    email: customerEmail,
    personality: 'friendly', // or professional, creative, technical
    useCase: 'Business Assistant' // customer's chosen use case
  }
});
```

---

## 🤖 Bot Features

Each customer bot includes:

### ✅ **Personalized Personality**
- Professional, Friendly, Creative, or Technical
- Tailored responses based on personality type

### ✅ **Custom Use Case**
- Business Assistant
- Personal Productivity
- Creative Helper
- Technical Support
- Custom specialization

### ✅ **Claude AI Integration**
- Powered by Claude Haiku (fast & efficient)
- Natural conversations
- Context awareness

### ✅ **Conversation Memory**
- Remembers past conversations
- Maintains context
- Learns preferences

### ✅ **Commands**
- `/start` - Welcome message
- `/help` - Help menu
- `/clear` - Clear conversation history

---

## 📁 File Structure

```
NUPI_Cloud_Agent/
├── server.js (Main server with webhook integration)
├── automated-ai-creator.js (AI creation system)
├── customers.json (Customer database)
├── customer_bots.json (Bot database)
├── customer_bots/
│   ├── customer_bot_CUST_001.js
│   ├── customer_bot_CUST_002.js
│   └── ... (Auto-generated bot files)
└── public/
    └── bot-manager.html (Admin dashboard)
```

---

## 🚀 Quick Start Guide

### For Admin:

1. **Access Dashboard**
   - Go to: https://nupi-cloud-agent-production.up.railway.app/bot-manager.html

2. **Wait for Orders**
   - Customers place orders on nupiai.com
   - System automatically saves customer data

3. **Customer Emails Token**
   - Customer creates bot with @BotFather
   - Customer sends token via email

4. **Activate Bot**
   - Paste token in dashboard
   - Click "Activate Bot"
   - Bot goes live instantly!

5. **Customer Uses Bot**
   - Customer opens Telegram
   - Receives welcome message
   - Starts using their AI assistant

---

## 🧪 Testing

### Test Stripe Webhook:
```bash
curl -X POST https://nupi-cloud-agent-production.up.railway.app/api/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "customer": "CUST_TEST",
        "customer_details": {
          "name": "Test User",
          "email": "test@example.com"
        },
        "metadata": {
          "personality": "friendly",
          "useCase": "Business Assistant"
        },
        "amount_total": 9900,
        "currency": "usd"
      }
    }
  }'
```

### Test Bot Activation:
```bash
curl -X POST https://nupi-cloud-agent-production.up.railway.app/api/activate-bot \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST_TEST",
    "botToken": "YOUR_TEST_BOT_TOKEN"
  }'
```

---

## 💡 Customer Instructions Template

Send this to customers after payment:

```
🎉 Your NUPI AI Assistant is Ready!

Hi [Name],

Thank you for your purchase! Let's activate your AI in 3 simple steps:

1️⃣ OPEN TELEGRAM
   • On your phone or computer

2️⃣ CREATE YOUR BOT
   • Search for: @BotFather
   • Send: /newbot
   • Name: "[YourName] AI" (example: "John AI")
   • Username: Must end in "bot" (example: "johnai_bot")

3️⃣ SEND US YOUR TOKEN
   • BotFather will give you a token
   • It looks like: 1234567890:ABCdefGHI...
   • Reply to this email with: "Token: [paste here]"

⏱️ Activation Time: 5-10 minutes after we receive your token

Questions? Reply to this email!

Best,
NUPI AI Team
```

---

## 📊 Database Structure

### customers.json
```json
{
  "customers": [
    {
      "customerId": "CUST_12345",
      "name": "John Doe",
      "email": "john@example.com",
      "personality": "friendly",
      "useCase": "Business Assistant",
      "amountPaid": 99,
      "currency": "USD",
      "paymentDate": "2025-12-03T..."
    }
  ]
}
```

### customer_bots.json
```json
{
  "bots": [
    {
      "customerId": "CUST_12345",
      "name": "John Doe",
      "email": "john@example.com",
      "botToken": "1234567890:ABC...",
      "botFileName": "customer_bot_CUST_12345.js",
      "chatId": "987654321",
      "activated": "2025-12-03T...",
      "personality": "friendly",
      "useCase": "Business Assistant"
    }
  ]
}
```

---

## 🔧 Maintenance

### View All Customers:
```bash
curl https://nupi-cloud-agent-production.up.railway.app/api/customer-bots
```

### Check Specific Customer:
```bash
curl https://nupi-cloud-agent-production.up.railway.app/api/customer-status/customer@email.com
```

### System Health:
```bash
curl https://nupi-cloud-agent-production.up.railway.app/health
```

---

## 🎯 Next Steps

1. ✅ **Add Stripe webhook** to receive payments
2. ✅ **Share bot-manager.html** link with admin
3. ✅ **Create customer email template**
4. ✅ **Test with real Stripe payment**
5. ✅ **Monitor dashboard** for new orders

---

## 🚨 Important Notes

- **Bot tokens are sensitive** - Keep them secure
- **Each bot needs unique username** - Must end in "bot"
- **Customer must message bot first** - Required for welcome message
- **Bots run 24/7** - Auto-restart on Railway
- **No coding needed** - Fully automated system

---

## ✨ Features Summary

🎯 **Fully Automated** - From payment to active bot in minutes
🤖 **Custom AI** - Each customer gets personalized bot
💾 **Permanent Storage** - All data saved to disk
📊 **Live Dashboard** - Real-time monitoring
🔄 **Auto-Scaling** - Handles unlimited customers
🌐 **Cloud Hosted** - Railway deployment (24/7)
💳 **Stripe Integrated** - Automatic payment detection
📱 **Telegram Powered** - Easy customer access

---

**System Status:** 🟢 LIVE & OPERATIONAL
**Dashboard:** https://nupi-cloud-agent-production.up.railway.app/bot-manager.html
**Support:** jdautotintsllc@icloud.com
