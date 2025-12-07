#!/bin/bash
echo "🔥 KILLING ALL OLD PROCESSES..."
pkill -9 gunicorn || true
pkill -9 python || true
sleep 2

echo "🧹 CLEANING OLD STATE..."
rm -rf __pycache__ *.pyc .pytest_cache || true

echo "✅ STARTING FRESH DEPLOYMENT..."
echo "📝 Version: 2025-12-06-FINAL-CLEAN"
echo "📂 Using: app.py (ONLY FILE)"

exec gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120 --access-logfile - --error-logfile - --preload --log-level info
