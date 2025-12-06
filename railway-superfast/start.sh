#!/bin/bash
exec gunicorn web_server_with_agent:app --bind 0.0.0.0:${PORT:-8080} --workers 1 --timeout 120 --access-logfile - --error-logfile -
