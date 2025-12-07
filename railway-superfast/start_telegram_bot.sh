#!/bin/bash
echo "🚀 Starting NUPI Telegram Bot..."
python3 telegram_bot_handler.py > /tmp/nupi_telegram_bot.log 2>&1 &
BOT_PID=$!
echo "✅ Bot started with PID: $BOT_PID"
echo "📱 Bot: @Iosservicesbot (JDTECHSUPPORT)"
echo ""
echo "Commands available in Telegram:"
echo "  /status - System status"
echo "  /agents - Agent list"
echo "  /devices - Device list"
echo "  /health - Health check"
echo "  /errors - Recent errors"
echo "  /live - Live monitoring"
echo ""
echo "📋 Logs: tail -f /tmp/nupi_telegram_bot.log"
