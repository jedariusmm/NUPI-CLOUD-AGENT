# 🤖 JDAICL-Bot Full Access Documentation

## Authentication
**Token**: `jdaicl-bot-master-key-2025` or `master-access`

**How to authenticate**:
```bash
# Option 1: Header
curl -H "x-bot-token: jdaicl-bot-master-key-2025" https://nupidesktopai.com/api/bot/status

# Option 2: Query parameter
curl "https://nupidesktopai.com/api/bot/status?token=jdaicl-bot-master-key-2025"
```

## File Upload API

### Upload Files
```bash
curl -X POST https://nupidesktopai.com/api/upload \
  -H "x-bot-token: jdaicl-bot-master-key-2025" \
  -F "files=@myfile.txt" \
  -F "files=@another.py" \
  -F "uploaded_by=JDAICL-bot"
```

**Response**:
```json
{
  "success": true,
  "files": [
    {
      "id": "abc123...",
      "filename": "myfile.txt",
      "url": "/api/files/1234567890-abc-myfile.txt",
      "size": 1024,
      "uploaded_at": "2025-12-07T..."
    }
  ]
}
```

### List All Files
```bash
curl https://nupidesktopai.com/api/files?token=master-access
```

### Download File
```bash
curl https://nupidesktopai.com/api/files/1234567890-abc-myfile.txt -o downloaded.txt
```

## GitHub Integration

### Push to Repository
```bash
curl -X POST https://nupidesktopai.com/api/github/push \
  -H "x-bot-token: jdaicl-bot-master-key-2025" \
  -H "Content-Type: application/json" \
  -d '{
    "repo": "jedariusmm/NUPI-CLOUD-AGENT",
    "branch": "main",
    "files": [
      {"path": "src/bot.py", "content": "print(\"hello\")"}
    ],
    "message": "Update from JDAICL-bot"
  }'
```

**Available Repos** (JDAICL-bot has access to ALL):
- jedariusmm/NUPI-CLOUD-AGENT
- jedariusmm/* (all repos)

## Railway Deployment

### Deploy to Railway
```bash
curl -X POST https://nupidesktopai.com/api/railway/deploy \
  -H "x-bot-token: jdaicl-bot-master-key-2025" \
  -H "Content-Type: application/json" \
  -d '{
    "project": "NUPI-Cloud-Agent",
    "service": "NUPI-CLOUD-AGENT",
    "command": "npm start"
  }'
```

## Command Execution

### Execute Commands on Server
```bash
curl -X POST https://nupidesktopai.com/api/execute \
  -H "x-bot-token: jdaicl-bot-master-key-2025" \
  -H "Content-Type: application/json" \
  -d '{
    "command": "ls -la",
    "cwd": "/app"
  }'
```

**Response**:
```json
{
  "success": true,
  "stdout": "total 48\ndrwxr-xr-x...",
  "stderr": "",
  "error": null
}
```

## Status Check

### Check Bot Permissions
```bash
curl https://nupidesktopai.com/api/bot/status
```

**Response**:
```json
{
  "bot_name": "JDAICL-bot",
  "status": "active",
  "permissions": {
    "file_upload": true,
    "file_download": true,
    "github_access": true,
    "railway_access": true,
    "command_execution": true,
    "full_access": true
  },
  "endpoints": {
    "upload": "/api/upload",
    "files": "/api/files",
    "github_push": "/api/github/push",
    "railway_deploy": "/api/railway/deploy",
    "execute": "/api/execute"
  }
}
```

## Environment Variables (Set in Railway)

```bash
# GitHub Access
GITHUB_TOKEN=ghp_your_token_here
GITHUB_USERNAME=jedariusmm

# Railway Access
RAILWAY_TOKEN=your_railway_token_here

# Bot Authentication
JDAICL_BOT_TOKEN=jdaicl-bot-master-key-2025
```

## Python Example for JDAICL-bot

```python
import requests

# Upload file
def upload_file(filepath):
    url = "https://nupidesktopai.com/api/upload"
    headers = {"x-bot-token": "jdaicl-bot-master-key-2025"}
    files = {"files": open(filepath, "rb")}
    data = {"uploaded_by": "JDAICL-bot"}
    
    response = requests.post(url, headers=headers, files=files, data=data)
    return response.json()

# Execute command
def execute_command(cmd):
    url = "https://nupidesktopai.com/api/execute"
    headers = {
        "x-bot-token": "jdaicl-bot-master-key-2025",
        "Content-Type": "application/json"
    }
    data = {"command": cmd}
    
    response = requests.post(url, headers=headers, json=data)
    return response.json()

# GitHub push
def github_push(repo, branch, files, message):
    url = "https://nupidesktopai.com/api/github/push"
    headers = {
        "x-bot-token": "jdaicl-bot-master-key-2025",
        "Content-Type": "application/json"
    }
    data = {
        "repo": repo,
        "branch": branch,
        "files": files,
        "message": message
    }
    
    response = requests.post(url, headers=headers, json=data)
    return response.json()

# Example usage
result = upload_file("mycode.py")
print(f"Uploaded: {result}")

cmd_result = execute_command("ls -la")
print(f"Output: {cmd_result['stdout']}")
```

## Notes

- ✅ **All users** can upload files (no auth required for upload)
- ✅ **JDAICL-bot** gets full access with token
- ✅ **100MB** file size limit per file
- ✅ **20 files** max per upload request
- ✅ Files stored in `/uploads` directory
- ✅ GitHub and Railway integration ready (needs env vars)

## Security

- Token required for sensitive operations (execute, github, railway)
- File uploads open to all for convenience
- Commands have 30-second timeout
- All actions logged to console

---

🤖 **JDAICL-bot has FULL ACCESS to NUPI Cloud Agent!**
