# GURU Agent - Fixed Version

## ✅ Changes from Original:
- ❌ Removed Anthropic API dependency (no credit errors)
- ✅ Uses webhook mode (no Telegram polling conflicts)
- ✅ Rule-based insights (no AI API needed)
- ✅ Monitors nupidesktopai.com API
- ✅ Reports to Telegram every 3-5 minutes

## 🚀 Deploy to Railway:
1. Create new service in Railway
2. Connect to this directory
3. Set environment variables (optional):
   - TELEGRAM_BOT_TOKEN (defaults to existing)
   - TELEGRAM_CHAT_ID (defaults to yours)
   - API_BASE_URL (defaults to nupidesktopai.com)
4. Deploy

## 🎯 What It Does:
- Monitors network stats from API
- Sends insights when interesting things happen
- No AI API calls = No credit errors
- No polling = No Telegram conflicts
