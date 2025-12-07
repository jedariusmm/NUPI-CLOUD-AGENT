// Add this after line 565 (after the agents/status fetch)

// Also fetch WiFi agent movements
async function fetchWiFiAgentData() {
    try {
        const response = await fetch(`${CLOUD_API}/api/wifi-agent/movements`);
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.locations) {
                // Add WiFi agents to the main agents array
                data.locations.forEach(wifiAgent => {
                    const existingIndex = agents.findIndex(a => a.id === wifiAgent.id);
                    if (existingIndex >= 0) {
                        // Update existing
                        agents[existingIndex].location = wifiAgent.location;
                        agents[existingIndex].device = wifiAgent.device;
                    } else {
                        // Add new WiFi agent
                        agents.push({
                            id: wifiAgent.id,
                            location: wifiAgent.location,
                            device: wifiAgent.device || 'WiFi Traveller',
                            status: 'active',
                            type: 'wifi'
                        });
                    }
                });
            }
        }
    } catch (err) {
        console.log('WiFi agent data not available');
    }
}

// Call this in the fetchData function
