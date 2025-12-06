#!/usr/bin/env python3
"""
🚀 BATCH AUTONOMOUS AGENT DEPLOYER
Deploy multiple agents to Railway Cloud automatically
"""

import sys
import os

# Add current directory to path to import our generator
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime

def batch_deploy_agents():
    """Deploy multiple pre-configured agents"""
    
    try:
        # Import after adding to path
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "generator", 
            os.path.join(os.path.dirname(__file__), "autonomous-agent-generator.py")
        )
        generator_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(generator_module)
        
        generator = generator_module.AutonomousAgentGenerator()
    except Exception as e:
        print(f"❌ Failed to load generator: {e}")
        return
    
    print("""
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║              🚀 BATCH AUTONOMOUS AGENT DEPLOYER 🚀                             ║
║                                                                                ║
║          Deploy multiple agents to Railway Cloud automatically                ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
    """)
    
    # Pre-configured agent fleet
    agent_fleet = [
        {
            "name": "ultra-scanner-01",
            "type": "ultra",
            "interval": 6,  # 6 seconds - ultra fast
            "description": "Ultra-fast scanner (6s cycles)"
        },
        {
            "name": "fast-scanner-02",
            "type": "fast",
            "interval": 12,  # 12 seconds - fast
            "description": "Fast scanner (12s cycles)"
        },
        {
            "name": "standard-scanner-03",
            "type": "standard",
            "interval": 60,  # 60 seconds - standard
            "description": "Standard scanner (60s cycles)"
        }
    ]
    
    print("\n📋 Agent Fleet Configuration:")
    print("━" * 80)
    for i, agent in enumerate(agent_fleet, 1):
        print(f"{i}. {agent['name']}")
        print(f"   Type: {agent['type']}")
        print(f"   Interval: {agent['interval']}s")
        print(f"   Description: {agent['description']}")
        print()
    
    proceed = input("Deploy all agents? [Y/n]: ").strip().lower()
    if proceed == 'n':
        print("❌ Deployment cancelled")
        return
    
    print("\n🚀 Starting batch deployment...")
    print("━" * 80)
    
    deployed = []
    failed = []
    
    for agent in agent_fleet:
        print(f"\n{'=' * 80}")
        print(f"Deploying: {agent['name']}")
        print(f"{'=' * 80}")
        
        try:
            config = generator.create_and_deploy_agent(
                agent_name=agent['name'],
                agent_type=agent['type'],
                scan_interval=agent['interval'],
                auto_deploy=True
            )
            deployed.append(agent['name'])
            print(f"✅ {agent['name']} deployed successfully!")
        except Exception as e:
            failed.append(agent['name'])
            print(f"❌ {agent['name']} deployment failed: {e}")
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 DEPLOYMENT SUMMARY")
    print("=" * 80)
    print(f"\n✅ Successfully deployed: {len(deployed)}/{len(agent_fleet)}")
    for name in deployed:
        print(f"   ✓ {name}")
    
    if failed:
        print(f"\n❌ Failed deployments: {len(failed)}")
        for name in failed:
            print(f"   ✗ {name}")
    
    print("\n" + "=" * 80)
    print("🎉 Batch deployment complete!")
    print("=" * 80)

if __name__ == "__main__":
    batch_deploy_agents()
