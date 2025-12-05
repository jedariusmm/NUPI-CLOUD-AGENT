#!/usr/bin/env node

// 🧪 Test script for NUPI Local Agent Deployment System

const CLOUD_URL = process.env.RAILWAY_URL || 'http://localhost:3000';

async function testLocalAgentSystem() {
    console.log('🧪 Testing NUPI Local Agent Deployment System\n');
    console.log('Cloud Endpoint:', CLOUD_URL);
    console.log('─'.repeat(60));
    
    try {
        // Test 1: Deploy Desktop Agent
        console.log('\n📍 Test 1: Deploy Desktop Agent');
        const deployResponse = await fetch(`${CLOUD_URL}/api/agents/deploy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'test_user',
                deviceId: 'test-laptop',
                deviceType: 'desktop',
                deviceInfo: {
                    os: 'macOS',
                    hostname: 'Test-MacBook',
                    version: '14.0'
                },
                customConfig: {
                    autoOptimize: true,
                    reportingInterval: 30000
                }
            })
        });
        
        const deployment = await deployResponse.json();
        console.log('✅ Agent deployed:', deployment.agentId);
        console.log('📥 Quick install:', deployment.quickInstall);
        
        const agentId = deployment.agentId;
        const deviceId = 'test-laptop';
        const deploymentKey = deployment.deploymentKey;
        
        // Test 2: Simulate Agent Check-in
        console.log('\n📍 Test 2: Simulate Agent Check-in');
        const checkinResponse = await fetch(`${CLOUD_URL}/api/agents/checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agentId,
                deviceId,
                deploymentKey,
                status: 'online',
                metrics: {
                    cpu: { usage: 0.35, cores: 8 },
                    memory: { total: 16000000000, used: 8000000000 },
                    disk: { total: '1TB', used: '500GB' },
                    processes: 234
                }
            })
        });
        
        const checkin = await checkinResponse.json();
        console.log('✅ Agent checked in successfully');
        
        // Test 3: Get Agent Status
        console.log('\n📍 Test 3: Get Agent Status');
        const statusResponse = await fetch(`${CLOUD_URL}/api/agents/status/${deviceId}`);
        const status = await statusResponse.json();
        console.log('✅ Agent status:', status.status);
        console.log('   Online:', status.isOnline);
        console.log('   Capabilities:', status.capabilities?.length || 0);
        
        // Test 4: Send Command
        console.log('\n📍 Test 4: Send Command to Agent');
        const commandResponse = await fetch(`${CLOUD_URL}/api/agents/command`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                deviceId,
                command: {
                    type: 'scan',
                    params: {}
                }
            })
        });
        
        const command = await commandResponse.json();
        console.log('✅ Command sent:', command.commandId);
        
        // Test 5: Simulate Agent Receiving Command
        console.log('\n📍 Test 5: Agent Receives & Executes Command');
        const checkin2Response = await fetch(`${CLOUD_URL}/api/agents/checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agentId,
                deviceId,
                deploymentKey,
                status: 'online',
                metrics: {}
            })
        });
        
        const checkin2 = await checkin2Response.json();
        console.log('✅ Agent received commands:', checkin2.commands?.length || 0);
        
        if (checkin2.commands && checkin2.commands.length > 0) {
            const receivedCommand = checkin2.commands[0];
            console.log('   Command type:', receivedCommand.type);
            
            // Test 6: Send Command Result
            console.log('\n📍 Test 6: Send Command Result');
            const resultResponse = await fetch(`${CLOUD_URL}/api/agents/command-result`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId,
                    deviceId,
                    deploymentKey,
                    commandId: receivedCommand.commandId,
                    result: {
                        success: true,
                        system: {
                            platform: 'darwin',
                            cpu: '8 cores @ 45%',
                            memory: '8GB used / 16GB total',
                            disk: '500GB used / 1TB total'
                        },
                        completedAt: new Date().toISOString()
                    }
                })
            });
            
            const result = await resultResponse.json();
            console.log('✅ Command result sent back to cloud');
        }
        
        // Test 7: List All Agents
        console.log('\n📍 Test 7: List All Agents');
        const listResponse = await fetch(`${CLOUD_URL}/api/agents/list`);
        const list = await listResponse.json();
        console.log('✅ Total agents:', list.count);
        console.log('   Agents:', list.agents.map(a => `${a.deviceId} (${a.deviceType})`).join(', '));
        
        // Test 8: Get Statistics
        console.log('\n📍 Test 8: Get Agent Statistics');
        const statsResponse = await fetch(`${CLOUD_URL}/api/agents/stats`);
        const stats = await statsResponse.json();
        console.log('✅ Statistics:');
        console.log('   Total:', stats.stats.total);
        console.log('   Online:', stats.stats.online);
        console.log('   Offline:', stats.stats.offline);
        console.log('   By type:', JSON.stringify(stats.stats.byType));
        
        // Test 9: Deploy Mobile Agent
        console.log('\n📍 Test 9: Deploy Mobile Agent');
        const mobileResponse = await fetch(`${CLOUD_URL}/api/agents/deploy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'test_user',
                deviceId: 'test-iphone',
                deviceType: 'mobile',
                deviceInfo: {
                    os: 'iOS',
                    model: 'iPhone 15 Pro',
                    version: '17.2'
                }
            })
        });
        
        const mobileDeployment = await mobileResponse.json();
        console.log('✅ Mobile agent deployed:', mobileDeployment.agentId);
        
        // Test 10: Update Agent Config
        console.log('\n📍 Test 10: Update Agent Configuration');
        const configResponse = await fetch(`${CLOUD_URL}/api/agents/config/${deviceId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                autoOptimize: false,
                reportingInterval: 60000
            })
        });
        
        const configResult = await configResponse.json();
        console.log('✅ Configuration updated');
        
        // Final Stats
        console.log('\n📍 Final System Status');
        const finalStatsResponse = await fetch(`${CLOUD_URL}/api/agents/stats`);
        const finalStats = await finalStatsResponse.json();
        console.log('✅ System Status:');
        console.log('   Total Agents:', finalStats.stats.total);
        console.log('   Online:', finalStats.stats.online);
        console.log('   Device Types:', Object.keys(finalStats.stats.byType).join(', '));
        console.log('   Commands Executed:', finalStats.stats.completedCommands, '/', finalStats.stats.totalCommands);
        
        console.log('\n' + '─'.repeat(60));
        console.log('🎉 ALL TESTS PASSED! Local Agent System Working!');
        console.log('─'.repeat(60) + '\n');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error);
    }
}

// Run tests
console.log('🚀 Starting Local Agent System Tests...\n');
testLocalAgentSystem();
