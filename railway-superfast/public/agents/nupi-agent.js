
// NUPI Local Agent - Web Version (JavaScript)
(function() {
    const CLOUD_URL = 'https://nupidesktopai.com/api/real-system-data';
    const DEVICE_ID = 'web_' + Math.random().toString(36).substr(2, 9);
    
    console.log('🚀 NUPI Web Agent Active - Device ID:', DEVICE_ID);
    
    async function collectAndPush() {
        try {
            // Collect browser-level data
            const data = {
                device_id: DEVICE_ID,
                timestamp: Math.floor(Date.now() / 1000),
                cpu: performance && performance.memory ? 
                    Math.min(100, (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit * 100).toFixed(1)) : '0',
                memory_used: performance && performance.memory ? 
                    (performance.memory.usedJSHeapSize / 1024 / 1024 / 1024).toFixed(2) : '0',
                memory_total: performance && performance.memory ? 
                    (performance.memory.jsHeapSizeLimit / 1024 / 1024 / 1024).toFixed(2) : '0',
                memory_percent: performance && performance.memory ? 
                    ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(1) : '0',
                disk_used: '0',
                disk_total: '0',
                disk_percent: '0',
                processes: navigator.hardwareConcurrency || 4,
                system: 'Web',
                platform: navigator.platform,
                browser: navigator.userAgent.split(' ').pop(),
                screen: window.screen.width + 'x' + window.screen.height,
                connection: navigator.connection ? navigator.connection.effectiveType : 'unknown'
            };
            
            await fetch(CLOUD_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            console.log('✅ Web data pushed');
        } catch (error) {
            console.log('⚠️ Push failed:', error.message);
        }
    }
    
    // Push every 5 seconds
    setInterval(collectAndPush, 5000);
    collectAndPush(); // Initial push
})();
