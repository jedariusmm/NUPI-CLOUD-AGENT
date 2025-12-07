#!/usr/bin/env python3
"""Verify deployment is using correct file"""
import sys

try:
    import web_server_with_agent
    print("✅ Correct module loaded: web_server_with_agent.py")
    
    # Check for version marker
    with open('web_server_with_agent.py', 'r') as f:
        content = f.read()
        if 'Version: 2025-12-06' in content:
            print("✅ Version tag found - latest code deployed")
        else:
            print("⚠️  Warning: Version tag not found")
    
    # Check if app exists
    if hasattr(web_server_with_agent, 'app'):
        print("✅ Flask app found")
    else:
        print("❌ Flask app not found!")
        sys.exit(1)
        
    print("\n🎉 Deployment verification PASSED")
    sys.exit(0)
    
except Exception as e:
    print(f"❌ Deployment verification FAILED: {e}")
    sys.exit(1)
