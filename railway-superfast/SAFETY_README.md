# ⚠️ NUPI AGENT SAFETY GUIDELINES

## CRITICAL: PREVENT SYSTEM CRASHES

All NUPI agents MUST follow these safety rules:

### Resource Limits
- **Max Memory**: 100MB per agent
- **Max CPU**: 10% per agent
- **Max Threads**: 5 concurrent threads
- **Scan Delay**: Minimum 10 seconds between scans
- **Request Timeout**: 3 seconds maximum

### Safe Scanning
- Only scan 3 IPs max (gateway: .1, .2, .254)
- 1 second delay between pings
- No aggressive network scanning
- No rapid-fire requests

### Process Priority
- Always run at low priority (nice +10)
- Monitor memory usage continuously
- Auto-throttle if limits exceeded
- Graceful error handling

### What NOT To Do
❌ NO scanning entire network (1-254)
❌ NO ThreadPoolExecutor with 50+ workers
❌ NO rapid subprocess spawning
❌ NO self-replication without limits
❌ NO aggressive resource usage

### Safe Agent Files
✅ `travelling-agent-safe.py` - Resource-limited, safe scanning
✅ `local-desktop-agent-smart.py` - Local data only, no scanning
❌ `travelling-agent-replicating.py` - UNSAFE, can crash system

## Use Only Safe Agents
```bash
python3 travelling-agent-safe.py
```

