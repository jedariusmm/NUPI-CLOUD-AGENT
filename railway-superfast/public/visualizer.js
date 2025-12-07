const canvas = document.getElementById('network-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

let agents = [];
let devices = [];
let signals = [];
let cycleCount = 0;
let dataHarvested = 0;

class Agent {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.speed = 2;
        this.radius = 8;
        this.color = '#00ff41';
        this.trail = [];
        this.scanning = false;
        this.scanRadius = 0;
    }
    
    moveTo(x, y) {
        this.targetX = x;
        this.targetY = y;
    }
    
    update() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 1) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
            this.trail.push({x: this.x, y: this.y, alpha: 1});
            if (this.trail.length > 30) this.trail.shift();
        }
        
        this.trail.forEach(p => p.alpha *= 0.95);
        
        if (this.scanning) {
            this.scanRadius += 3;
            if (this.scanRadius > 100) {
                this.scanning = false;
                this.scanRadius = 0;
            }
        }
    }
    
    draw() {
        this.trail.forEach((p, i) => {
            ctx.globalAlpha = p.alpha * 0.3;
            ctx.fillStyle = this.color;
            ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        });
        
        ctx.globalAlpha = 1;
        
        if (this.scanning) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 1 - (this.scanRadius / 100);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.scanRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText('A' + this.id, this.x - 10, this.y - 15);
    }
    
    startScan() {
        this.scanning = true;
        this.scanRadius = 0;
    }
}

class Device {
    constructor(ip, name, type, x, y) {
        this.ip = ip;
        this.name = name;
        this.type = type;
        this.x = x;
        this.y = y;
        this.radius = 6;
        this.pulse = 0;
        this.discovered = false;
        this.color = this.getColor();
    }
    
    getColor() {
        if (this.type.includes('Roku') || this.type.includes('📺')) return '#ff00ff';
        if (this.type.includes('Mac') || this.type.includes('💻')) return '#00ffff';
        if (this.type.includes('Router') || this.type.includes('🌐')) return '#ffff00';
        if (this.type.includes('iOS') || this.type.includes('Android') || this.type.includes('📱')) return '#ff8800';
        return '#888888';
    }
    
    update() {
        if (this.discovered) {
            this.pulse += 0.1;
        }
    }
    
    draw() {
        if (!this.discovered) return;
        
        const pulseSize = this.radius + Math.sin(this.pulse) * 3;
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '9px monospace';
        const label = this.name.length > 15 ? this.name.substring(0, 15) + '...' : this.name;
        ctx.fillText(label, this.x - 30, this.y + 20);
    }
}

class Signal {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.alpha = 1;
    }
    
    update() {
        this.alpha *= 0.98;
    }
    
    draw() {
        if (this.alpha < 0.1) return;
        ctx.globalAlpha = this.alpha;
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
    }
}

function initAgents() {
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const distance = 150;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        agents.push(new Agent(i + 1, x, y));
    }
}

async function loadDevices() {
    try {
        const response = await fetch('/api/devices');
        const data = await response.json();
        
        if (data && data.devices) {
            cycleCount = data.cycle || cycleCount;
            
            data.devices.forEach((device, i) => {
                const angle = (i / data.devices.length) * Math.PI * 2;
                const distance = 250 + Math.random() * 100;
                const x = centerX + Math.cos(angle) * distance;
                const y = centerY + Math.sin(angle) * distance;
                
                const existing = devices.find(d => d.ip === device.ip);
                if (!existing) {
                    devices.push(new Device(device.ip, device.hostname, device.device_type, x, y));
                    addLog('📡 Discovered: ' + device.hostname);
                }
            });
            
            dataHarvested += data.devices.length * 2;
        }
    } catch (error) {
        console.log('Demo mode');
    }
}

function addLog(message) {
    const log = document.getElementById('log');
    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = '<span class="timestamp">[' + timestamp + ']</span> ' + message;
    log.insertBefore(entry, log.firstChild);
    while (log.children.length > 20) {
        log.removeChild(log.lastChild);
    }
}

function agentBehaviors() {
    agents.forEach((agent, i) => {
        if (Math.random() < 0.01) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 200 + Math.random() * 200;
            agent.moveTo(
                centerX + Math.cos(angle) * distance,
                centerY + Math.sin(angle) * distance
            );
        }
        
        if (Math.random() < 0.02) {
            agent.startScan();
            
            devices.forEach(device => {
                const dx = device.x - agent.x;
                const dy = device.y - agent.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 150 && !device.discovered) {
                    device.discovered = true;
                    signals.push(new Signal(agent.x, agent.y, device.x, device.y));
                    addLog('🔍 Agent ' + agent.id + ' found ' + device.name);
                }
            });
        }
    });
}

function updateStats() {
    document.getElementById('agent-count').textContent = agents.length;
    document.getElementById('device-count').textContent = devices.filter(d => d.discovered).length;
    document.getElementById('signal-count').textContent = signals.filter(s => s.alpha > 0.1).length;
    document.getElementById('data-harvested').textContent = Math.floor(dataHarvested) + ' KB';
    document.getElementById('cycle-count').textContent = cycleCount;
}

function animate() {
    ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffff00';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ffff00';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText('ROUTER', centerX - 25, centerY - 25);
    
    signals.forEach(s => { s.update(); s.draw(); });
    signals = signals.filter(s => s.alpha > 0.1);
    
    devices.forEach(d => { d.update(); d.draw(); });
    agents.forEach(a => { a.update(); a.draw(); });
    
    agentBehaviors();
    updateStats();
    
    requestAnimationFrame(animate);
}

initAgents();
loadDevices();
animate();

setInterval(loadDevices, 30000);
setInterval(() => {
    cycleCount++;
    addLog('🔄 Scan cycle #' + cycleCount + ' complete');
}, 300000);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

setTimeout(() => addLog('🚀 6 Autonomous agents deployed'), 1000);
setTimeout(() => addLog('📡 Scanning network 192.168.12.x'), 2000);
setTimeout(() => addLog('🔍 Beginning device discovery'), 3000);
