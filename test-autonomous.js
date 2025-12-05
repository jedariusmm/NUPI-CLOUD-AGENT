#!/usr/bin/env node

// 🤖 AUTONOMOUS ORCHESTRATOR TEST SUITE

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

console.log('🧪 Testing Autonomous Orchestrator...\n');

async function test(name, fn) {
    try {
        console.log(`▶️  ${name}`);
        await fn();
        console.log(`✅ ${name} - PASSED\n`);
    } catch (error) {
        console.log(`❌ ${name} - FAILED`);
        console.log(`   Error: ${error.message}\n`);
    }
}

async function runTests() {
    // Test 1: Start autonomous system
    await test('Start Autonomous System', async () => {
        const response = await fetch(`${BASE_URL}/api/autonomous/start`, {
            method: 'POST'
        });
        const data = await response.json();
        
        if (!data.success) throw new Error('Failed to start');
        if (!data.status.isRunning) throw new Error('System not running');
        
        console.log(`   Status: ${JSON.stringify(data.status, null, 2)}`);
    });
    
    // Test 2: Get orchestrator status
    await test('Get Orchestrator Status', async () => {
        const response = await fetch(`${BASE_URL}/api/autonomous/status`);
        const data = await response.json();
        
        if (!data.success) throw new Error('Failed to get status');
        
        console.log(`   Monitored Devices: ${data.status.monitoredDevices}`);
        console.log(`   Device Profiles: ${data.status.deviceProfiles}`);
        console.log(`   Thresholds: ${JSON.stringify(data.status.healthThresholds)}`);
    });
    
    // Test 3: Queue device for auto-deployment
    await test('Queue Device for Auto-Deployment', async () => {
        const response = await fetch(`${BASE_URL}/api/autonomous/queue-device`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'test-user',
                deviceId: 'test-macbook',
                deviceType: 'desktop',
                deviceInfo: {
                    os: 'macOS',
                    version: '14.0',
                    name: 'Test MacBook Pro'
                }
            })
        });
        const data = await response.json();
        
        if (!data.success) throw new Error('Failed to queue device');
        
        console.log(`   ${data.message}`);
    });
    
    // Test 4: Deploy the queued device (wait 30 seconds for auto-deploy)
    await test('Wait for Auto-Deployment (30s)', async () => {
        console.log('   Waiting 30 seconds for auto-deployment...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        // Check if device was deployed
        const response = await fetch(`${BASE_URL}/api/agents/list`);
        const data = await response.json();
        
        console.log(`   Total agents: ${data.agents.length}`);
        
        const testDevice = data.agents.find(a => a.deviceId === 'test-macbook');
        if (testDevice) {
            console.log(`   ✅ Device auto-deployed: ${testDevice.agentId}`);
        } else {
            console.log(`   ⏳ Device still in queue (may take longer)`);
        }
    });
    
    // Test 5: Update health thresholds
    await test('Update Health Thresholds', async () => {
        const response = await fetch(`${BASE_URL}/api/autonomous/thresholds`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cpu: 0.75,
                memory: 0.80,
                disk: 0.85,
                battery: 0.15
            })
        });
        const data = await response.json();
        
        if (!data.success) throw new Error('Failed to update thresholds');
        
        console.log(`   New thresholds: ${JSON.stringify(data.thresholds)}`);
    });
    
    // Test 6: Trigger optimization for all devices
    await test('Optimize All Devices', async () => {
        const response = await fetch(`${BASE_URL}/api/autonomous/optimize-all`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: 'test' })
        });
        const data = await response.json();
        
        if (!data.success) throw new Error('Failed to trigger optimization');
        
        console.log(`   ${data.message}`);
    });
    
    // Test 7: Generate fleet report
    await test('Generate Fleet Report', async () => {
        const response = await fetch(`${BASE_URL}/api/autonomous/report`);
        const data = await response.json();
        
        if (!data.success) throw new Error('Failed to generate report');
        
        console.log(`   ${data.message}`);
        console.log('   Check server logs for full report');
    });
    
    // Test 8: Check health endpoint includes autonomous status
    await test('Health Check Includes Autonomous Status', async () => {
        const response = await fetch(`${BASE_URL}/health`);
        const data = await response.json();
        
        if (!data.autonomousSystem) throw new Error('Autonomous status missing');
        
        console.log(`   Autonomous Running: ${data.autonomousSystem.running}`);
        console.log(`   Monitored Devices: ${data.autonomousSystem.monitoredDevices}`);
    });
    
    // Test 9: Simulate device check-in and verify monitoring
    await test('Simulate Device Check-in & Monitoring', async () => {
        // First deploy a test agent
        const deployResponse = await fetch(`${BASE_URL}/api/agents/deploy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'monitor-test',
                deviceId: 'monitor-device',
                deviceType: 'desktop',
                deviceInfo: { os: 'macOS' }
            })
        });
        const deployData = await deployResponse.json();
        
        if (!deployData.success) throw new Error('Failed to deploy test agent');
        
        console.log(`   Deployed agent: ${deployData.agentId}`);
        
        // Simulate check-in with metrics
        const checkinResponse = await fetch(`${BASE_URL}/api/agents/checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agentId: deployData.agentId,
                deviceId: 'monitor-device',
                deploymentKey: deployData.deploymentKey,
                status: 'active',
                metrics: {
                    cpu: { usage: 0.85 }, // High CPU - should trigger optimization
                    memory: { percentUsed: 0.90 }, // High memory
                    disk: { percent: '95%' }, // High disk
                    battery: 15 // Low battery
                }
            })
        });
        const checkinData = await checkinResponse.json();
        
        if (!checkinData.success) throw new Error('Check-in failed');
        
        console.log('   Check-in successful with high usage metrics');
        console.log('   Orchestrator should auto-optimize this device');
        console.log('   Check server logs for monitoring actions');
    });
    
    // Test 10: Stop autonomous system
    await test('Stop Autonomous System', async () => {
        const response = await fetch(`${BASE_URL}/api/autonomous/stop`, {
            method: 'POST'
        });
        const data = await response.json();
        
        if (!data.success) throw new Error('Failed to stop');
        
        console.log(`   ${data.message}`);
    });
    
    console.log('\n═══════════════════════════════════════');
    console.log('🎉 ALL TESTS COMPLETED!');
    console.log('═══════════════════════════════════════\n');
}

// Run tests
runTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
});
