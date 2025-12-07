#!/usr/bin/env python3
"""
JDAICL-Bot API Test Script
Full access to NUPI Cloud Agent
"""

import requests
import json
import os
from datetime import datetime

# API Configuration
API_BASE = "https://nupidesktopai.com"
BOT_TOKEN = "jdaicl-bot-master-key-2025"
HEADERS = {
    "x-bot-token": BOT_TOKEN,
    "Content-Type": "application/json"
}

def test_bot_status():
    """Check bot permissions and status"""
    print("🤖 Testing Bot Status...")
    response = requests.get(f"{API_BASE}/api/bot/status")
    data = response.json()
    print(json.dumps(data, indent=2))
    return data

def upload_file(filepath):
    """Upload a file to NUPI Cloud"""
    print(f"📤 Uploading {filepath}...")
    
    with open(filepath, 'rb') as f:
        files = {'files': (os.path.basename(filepath), f)}
        data = {'uploaded_by': 'JDAICL-bot'}
        headers = {'x-bot-token': BOT_TOKEN}
        
        response = requests.post(
            f"{API_BASE}/api/upload",
            headers=headers,
            files=files,
            data=data
        )
    
    result = response.json()
    print(json.dumps(result, indent=2))
    return result

def list_files():
    """List all uploaded files"""
    print("📂 Listing Files...")
    response = requests.get(
        f"{API_BASE}/api/files",
        params={'token': BOT_TOKEN}
    )
    data = response.json()
    print(f"Total files: {data['count']}")
    for file in data['files'][:5]:  # Show first 5
        print(f"  - {file['filename']} ({file['size']} bytes)")
    return data

def github_push(repo, branch, files, message):
    """Push code to GitHub repository"""
    print(f"🐙 GitHub Push to {repo}/{branch}...")
    
    payload = {
        "repo": repo,
        "branch": branch,
        "files": files,
        "message": message
    }
    
    response = requests.post(
        f"{API_BASE}/api/github/push",
        headers=HEADERS,
        json=payload
    )
    
    result = response.json()
    print(json.dumps(result, indent=2))
    return result

def railway_deploy(project, service, command="npm start"):
    """Deploy to Railway"""
    print(f"🚂 Railway Deploy: {project}/{service}...")
    
    payload = {
        "project": project,
        "service": service,
        "command": command
    }
    
    response = requests.post(
        f"{API_BASE}/api/railway/deploy",
        headers=HEADERS,
        json=payload
    )
    
    result = response.json()
    print(json.dumps(result, indent=2))
    return result

def execute_command(command, cwd=None):
    """Execute shell command on server"""
    print(f"⚡ Executing: {command}")
    
    payload = {
        "command": command,
        "cwd": cwd
    }
    
    response = requests.post(
        f"{API_BASE}/api/execute",
        headers=HEADERS,
        json=payload
    )
    
    result = response.json()
    if result.get('success'):
        print("✅ Command succeeded")
        print(f"STDOUT:\n{result.get('stdout', '')}")
        if result.get('stderr'):
            print(f"STDERR:\n{result['stderr']}")
    else:
        print(f"❌ Command failed: {result.get('error', 'Unknown error')}")
    
    return result

def create_test_file():
    """Create a test file to upload"""
    filename = f"jdaicl-bot-test-{datetime.now().strftime('%Y%m%d-%H%M%S')}.txt"
    with open(filename, 'w') as f:
        f.write(f"JDAICL-Bot Test File\n")
        f.write(f"Created: {datetime.now().isoformat()}\n")
        f.write(f"Bot: JDAICL-bot\n")
        f.write(f"Mission: Full access to NUPI Cloud Agent\n")
    return filename

def run_full_test():
    """Run comprehensive test of all features"""
    print("=" * 50)
    print("🤖 JDAICL-Bot Full Access Test")
    print("=" * 50)
    print()
    
    # 1. Check status
    print("1️⃣ Checking Bot Status...")
    test_bot_status()
    print()
    
    # 2. Test file upload
    print("2️⃣ Testing File Upload...")
    test_file = create_test_file()
    upload_file(test_file)
    os.remove(test_file)  # Clean up
    print()
    
    # 3. List files
    print("3️⃣ Listing Uploaded Files...")
    list_files()
    print()
    
    # 4. Test GitHub (mock)
    print("4️⃣ Testing GitHub Integration...")
    github_push(
        repo="jedariusmm/NUPI-CLOUD-AGENT",
        branch="main",
        files=[
            {"path": "test.txt", "content": "Hello from JDAICL-bot"}
        ],
        message="Test commit from JDAICL-bot"
    )
    print()
    
    # 5. Test Railway (mock)
    print("5️⃣ Testing Railway Integration...")
    railway_deploy(
        project="NUPI-Cloud-Agent",
        service="NUPI-CLOUD-AGENT"
    )
    print()
    
    # 6. Test command execution
    print("6️⃣ Testing Command Execution...")
    execute_command("echo 'Hello from JDAICL-bot' && date && pwd")
    print()
    
    print("=" * 50)
    print("✅ All tests completed!")
    print("=" * 50)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "status":
            test_bot_status()
        elif command == "upload" and len(sys.argv) > 2:
            upload_file(sys.argv[2])
        elif command == "list":
            list_files()
        elif command == "exec" and len(sys.argv) > 2:
            execute_command(sys.argv[2])
        elif command == "test":
            run_full_test()
        else:
            print("Usage:")
            print("  python3 jdaicl_bot_test.py status")
            print("  python3 jdaicl_bot_test.py upload <file>")
            print("  python3 jdaicl_bot_test.py list")
            print("  python3 jdaicl_bot_test.py exec '<command>'")
            print("  python3 jdaicl_bot_test.py test  # Run all tests")
    else:
        run_full_test()
