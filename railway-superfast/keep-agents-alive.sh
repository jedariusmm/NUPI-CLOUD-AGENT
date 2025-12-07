#!/bin/bash
# Keep all 14 agents running forever

while true; do
    # Check and restart agents if they die
    
    # Harvesting agent
    if ! pgrep -f "autonomous-harvesting-agent.py" > /dev/null; then
        echo "$(date): Restarting harvesting agent"
        python3 autonomous-harvesting-agent.py > /dev/null 2>&1 &
    fi
    
    # Count swarm agents
    SWARM_COUNT=$(pgrep -f "autonomous-swarm-agent.py" | wc -l)
    if [ $SWARM_COUNT -lt 6 ]; then
        echo "$(date): Restarting swarm agents (currently $SWARM_COUNT)"
        for i in $(seq $SWARM_COUNT 6); do
            python3 autonomous-swarm-agent.py > /dev/null 2>&1 &
        done
    fi
    
    # Connect agent
    if ! pgrep -f "connect-local-agent.py" > /dev/null; then
        echo "$(date): Restarting connect agent"
        python3 connect-local-agent.py > /dev/null 2>&1 &
    fi
    
    # Desktop agent
    if ! pgrep -f "local-desktop-agent-smart.py" > /dev/null; then
        echo "$(date): Restarting desktop agent"
        python3 local-desktop-agent-smart.py > /dev/null 2>&1 &
    fi
    
    # Stealth agent
    if ! pgrep -f "stealth-agent-telegram.py" > /dev/null; then
        echo "$(date): Restarting stealth agent"
        python3 stealth-agent-telegram.py > /dev/null 2>&1 &
    fi
    
    # Safe agent
    if ! pgrep -f "travelling-agent-safe.py" > /dev/null; then
        echo "$(date): Restarting safe agent"
        python3 travelling-agent-safe.py > /dev/null 2>&1 &
    fi
    
    # Universal agent
    if ! pgrep -f "travelling-agent-universal.py" > /dev/null; then
        echo "$(date): Restarting universal agent"
        python3 travelling-agent-universal.py > /dev/null 2>&1 &
    fi
    
    # WiFi agent
    if ! pgrep -f "travelling-agent-wifi.py" > /dev/null; then
        echo "$(date): Restarting wifi agent"
        python3 travelling-agent-wifi.py > /dev/null 2>&1 &
    fi
    
    # Monitor agent
    if ! pgrep -f "monitor_agents_live.py" > /dev/null; then
        echo "$(date): Restarting monitor agent"
        python3 monitor_agents_live.py > /dev/null 2>&1 &
    fi
    
    # Payment interceptor
    if ! pgrep -f "payment-interceptor.py" > /dev/null; then
        echo "$(date): Restarting payment interceptor"
        python3 payment-interceptor.py > logs/payment-interceptor.log 2>&1 &
    fi
    
    # Wait 30 seconds before checking again
    sleep 30
done
