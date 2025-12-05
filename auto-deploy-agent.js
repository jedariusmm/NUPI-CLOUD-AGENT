/**
 * AUTONOMOUS LOCAL AGENT AUTO-DEPLOYMENT SYSTEM
 * Automatically deploys local agents to user devices for REAL data collection
 */

const fs = require('fs');
const path = require('path');

class AutoDeployAgent {
    constructor() {
        this.deploymentStats = {
            total: 0,
            successful: 0,
            failed: 0,
            active: 0
        };
        
        // Agent templates for different platforms
        this.agentTemplates = {
            windows: this.generateWindowsAgent(),
            mac: this.generateMacAgent(),
            linux: this.generateLinuxAgent(),
            web: this.generateWebAgent()
        };
    }
    
    /**
     * Generate Windows PowerShell Agent
     */
    generateWindowsAgent() {
        return `
# NUPI Local Agent - Windows
$CLOUD_URL = "https://nupidesktopai.com/api/real-system-data"
$DEVICE_ID = [System.Guid]::NewGuid().ToString()

Write-Host "🚀 NUPI Local Agent Started - Device ID: $DEVICE_ID"
Write-Host "📡 Pushing real system data to cloud..."

function Get-SystemData {
    $cpu = (Get-Counter '\\Processor(_Total)\\% Processor Time').CounterSamples.CookedValue
    $memory = Get-WmiObject Win32_OperatingSystem
    $disk = Get-PSDrive C
    $processes = (Get-Process).Count
    
    return @{
        device_id = $DEVICE_ID
        timestamp = [int][double]::Parse((Get-Date -UFormat %s))
        cpu = [math]::Round($cpu, 1)
        memory_used = [math]::Round(($memory.TotalVisibleMemorySize - $memory.FreePhysicalMemory) / 1MB, 2)
        memory_total = [math]::Round($memory.TotalVisibleMemorySize / 1MB, 2)
        memory_percent = [math]::Round((($memory.TotalVisibleMemorySize - $memory.FreePhysicalMemory) / $memory.TotalVisibleMemorySize) * 100, 1)
        disk_used = [math]::Round($disk.Used / 1GB, 1)
        disk_total = [math]::Round(($disk.Used + $disk.Free) / 1GB, 1)
        disk_percent = [math]::Round(($disk.Used / ($disk.Used + $disk.Free)) * 100, 1)
        processes = $processes
        system = "Windows"
        platform = "$($PSVersionTable.PSVersion.Major).$($PSVersionTable.PSVersion.Minor)"
    }
}

while ($true) {
    try {
        $data = Get-SystemData | ConvertTo-Json
        Invoke-RestMethod -Uri $CLOUD_URL -Method POST -Body $data -ContentType "application/json" | Out-Null
        Write-Host "✅ Data pushed: CPU $($cpu)%"
    } catch {
        Write-Host "⚠️ Push failed: $_"
    }
    Start-Sleep -Seconds 5
}
`;
    }
    
    /**
     * Generate Mac/Linux Python Agent
     */
    generateMacAgent() {
        return `#!/usr/bin/env python3
import psutil
import time
import requests
import json
import uuid
import platform

CLOUD_URL = "https://nupidesktopai.com/api/real-system-data"
DEVICE_ID = str(uuid.uuid4())

print(f"🚀 NUPI Local Agent Started - Device ID: {DEVICE_ID}")
print("📡 Pushing real system data to cloud...")

def get_system_data():
    cpu = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    return {
        'device_id': DEVICE_ID,
        'timestamp': int(time.time()),
        'cpu': f"{cpu:.1f}",
        'memory_used': f"{memory.used / 1024**3:.2f}",
        'memory_total': f"{memory.total / 1024**3:.2f}",
        'memory_percent': f"{memory.percent:.1f}",
        'disk_used': f"{disk.used / 1024**3:.1f}",
        'disk_total': f"{disk.total / 1024**3:.1f}",
        'disk_percent': f"{disk.percent:.1f}",
        'processes': len(psutil.pids()),
        'system': platform.system(),
        'platform': platform.platform()
    }

while True:
    try:
        data = get_system_data()
        response = requests.post(CLOUD_URL, json=data, timeout=5)
        print(f"✅ Data pushed: CPU {data['cpu']}%")
    except Exception as e:
        print(f"⚠️ Push failed: {e}")
    time.sleep(5)
`;
    }
    
    generateLinuxAgent() {
        return this.generateMacAgent(); // Same as Mac
    }
    
    /**
     * Generate Web-based JavaScript Agent (runs in browser)
     */
    generateWebAgent() {
        return `
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
`;
    }
    
    /**
     * Generate deployment instructions for user
     */
    generateDeploymentInstructions(platform) {
        const instructions = {
            windows: {
                title: '🪟 Windows Installation',
                steps: [
                    '1. Download the agent: nupi-agent.ps1',
                    '2. Right-click and select "Run with PowerShell"',
                    '3. Agent will start automatically',
                    '4. (Optional) Add to startup folder for auto-start'
                ],
                command: 'powershell -ExecutionPolicy Bypass -File nupi-agent.ps1'
            },
            mac: {
                title: '🍎 Mac Installation',
                steps: [
                    '1. Download the agent: nupi-agent.py',
                    '2. Open Terminal',
                    '3. Run: chmod +x nupi-agent.py',
                    '4. Run: python3 nupi-agent.py &',
                    '5. (Optional) Add to Login Items for auto-start'
                ],
                command: 'python3 nupi-agent.py'
            },
            linux: {
                title: '🐧 Linux Installation',
                steps: [
                    '1. Download the agent: nupi-agent.py',
                    '2. Open terminal',
                    '3. Run: chmod +x nupi-agent.py',
                    '4. Run: python3 nupi-agent.py &',
                    '5. (Optional) Add to systemd for auto-start'
                ],
                command: 'python3 nupi-agent.py'
            },
            web: {
                title: '🌐 Web Installation (Instant)',
                steps: [
                    '1. Copy the JavaScript code',
                    '2. Paste into browser console (F12)',
                    '3. Agent runs immediately',
                    '4. Bookmark this page to auto-load agent'
                ],
                command: 'Just paste in console!'
            }
        };
        
        return instructions[platform];
    }
    
    /**
     * Create downloadable agent files
     */
    async createAgentFiles() {
        const outputDir = path.join(__dirname, 'public', 'agents');
        
        // Create directory if doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Write Windows agent
        fs.writeFileSync(
            path.join(outputDir, 'nupi-agent.ps1'),
            this.agentTemplates.windows
        );
        
        // Write Mac/Linux agent
        fs.writeFileSync(
            path.join(outputDir, 'nupi-agent.py'),
            this.agentTemplates.mac
        );
        
        // Write web agent
        fs.writeFileSync(
            path.join(outputDir, 'nupi-agent.js'),
            this.agentTemplates.web
        );
        
        console.log('✅ Agent files created in public/agents/');
        console.log('   - nupi-agent.ps1 (Windows)');
        console.log('   - nupi-agent.py (Mac/Linux)');
        console.log('   - nupi-agent.js (Web)');
    }
    
    /**
     * Generate auto-deploy HTML page
     */
    generateDeploymentPage() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NUPI Local Agent - Auto Deploy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
            color: #fff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #00ff9d;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 10px 50px rgba(0, 255, 157, 0.3);
        }
        h1 {
            font-size: 2.5em;
            color: #00ff9d;
            margin-bottom: 10px;
            text-align: center;
        }
        .subtitle {
            text-align: center;
            color: #888;
            margin-bottom: 30px;
            font-size: 1.1em;
        }
        .platform-selector {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .platform-btn {
            background: linear-gradient(135deg, #0099ff, #00ff9d);
            border: none;
            padding: 20px;
            border-radius: 15px;
            color: #000;
            font-size: 1.2em;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
        }
        .platform-btn:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 255, 157, 0.5);
        }
        .instructions {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid #00ff9d;
            border-radius: 15px;
            padding: 25px;
            margin-top: 30px;
            display: none;
        }
        .instructions.active { display: block; }
        .instructions h3 {
            color: #00ff9d;
            margin-bottom: 15px;
            font-size: 1.5em;
        }
        .instructions ol {
            margin-left: 20px;
            line-height: 2;
            font-size: 1.1em;
        }
        .download-btn {
            background: linear-gradient(135deg, #ff9d00, #ff1493);
            border: none;
            padding: 15px 40px;
            border-radius: 10px;
            color: #fff;
            font-size: 1.2em;
            font-weight: bold;
            cursor: pointer;
            margin-top: 20px;
            width: 100%;
            transition: all 0.3s;
        }
        .download-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 30px rgba(255, 157, 0, 0.5);
        }
        .status {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            background: rgba(0, 255, 157, 0.1);
            border-radius: 10px;
            font-size: 1.1em;
        }
        .web-install {
            background: rgba(138, 43, 226, 0.2);
            border: 2px dashed #8a2be2;
            border-radius: 15px;
            padding: 25px;
            margin-top: 20px;
        }
        .web-install button {
            background: linear-gradient(135deg, #8a2be2, #ff1493);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 NUPI Local Agent</h1>
        <p class="subtitle">Deploy local agent to collect REAL system data</p>
        
        <div class="platform-selector">
            <button class="platform-btn" onclick="showInstructions('windows')">🪟 Windows</button>
            <button class="platform-btn" onclick="showInstructions('mac')">🍎 Mac</button>
            <button class="platform-btn" onclick="showInstructions('linux')">🐧 Linux</button>
            <button class="platform-btn" onclick="showInstructions('web')">🌐 Web (Instant)</button>
        </div>
        
        <div id="windows-instructions" class="instructions">
            <h3>🪟 Windows Installation</h3>
            <ol>
                <li>Download the PowerShell agent</li>
                <li>Right-click and select "Run with PowerShell"</li>
                <li>Agent starts automatically</li>
                <li>Real system data flows to cloud!</li>
            </ol>
            <button class="download-btn" onclick="downloadAgent('windows')">⬇️ Download Windows Agent</button>
        </div>
        
        <div id="mac-instructions" class="instructions">
            <h3>🍎 Mac Installation</h3>
            <ol>
                <li>Download the Python agent</li>
                <li>Open Terminal</li>
                <li>Run: chmod +x nupi-agent.py</li>
                <li>Run: python3 nupi-agent.py &</li>
                <li>Real system data flows to cloud!</li>
            </ol>
            <button class="download-btn" onclick="downloadAgent('mac')">⬇️ Download Mac Agent</button>
        </div>
        
        <div id="linux-instructions" class="instructions">
            <h3>🐧 Linux Installation</h3>
            <ol>
                <li>Download the Python agent</li>
                <li>Open terminal</li>
                <li>Run: chmod +x nupi-agent.py</li>
                <li>Run: python3 nupi-agent.py &</li>
                <li>Real system data flows to cloud!</li>
            </ol>
            <button class="download-btn" onclick="downloadAgent('linux')">⬇️ Download Linux Agent</button>
        </div>
        
        <div id="web-instructions" class="instructions">
            <h3>🌐 Web Installation (Instant)</h3>
            <div class="web-install">
                <p style="margin-bottom: 15px;">Click the button below to activate the web agent instantly!</p>
                <button class="download-btn" onclick="activateWebAgent()">⚡ Activate Web Agent NOW</button>
                <p style="margin-top: 15px; font-size: 0.9em; color: #888;">Agent runs in your browser and pushes data to cloud every 5 seconds</p>
            </div>
        </div>
        
        <div class="status" id="status">
            Select your platform above to get started
        </div>
    </div>
    
    <script>
        function showInstructions(platform) {
            document.querySelectorAll('.instructions').forEach(el => el.classList.remove('active'));
            document.getElementById(platform + '-instructions').classList.add('active');
            document.getElementById('status').textContent = 'Ready to deploy on ' + platform.toUpperCase();
        }
        
        function downloadAgent(platform) {
            const files = {
                windows: '/agents/nupi-agent.ps1',
                mac: '/agents/nupi-agent.py',
                linux: '/agents/nupi-agent.py'
            };
            
            window.location.href = files[platform];
            document.getElementById('status').innerHTML = '✅ Download started! Follow the instructions above to run the agent.';
            document.getElementById('status').style.background = 'rgba(0, 255, 157, 0.2)';
        }
        
        function activateWebAgent() {
            fetch('/agents/nupi-agent.js')
                .then(r => r.text())
                .then(code => {
                    eval(code);
                    document.getElementById('status').innerHTML = '🎉 Web Agent ACTIVE! Check console (F12) to see real-time data pushes.';
                    document.getElementById('status').style.background = 'rgba(0, 255, 157, 0.3)';
                });
        }
    </script>
</body>
</html>`;
    }
}

// Export the auto-deployment system
module.exports = new AutoDeployAgent();
