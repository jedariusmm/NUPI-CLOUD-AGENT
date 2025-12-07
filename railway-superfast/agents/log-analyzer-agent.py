#!/usr/bin/env python3
"""
LOG ANALYZER AGENT - Real-time log file analysis
Monitors system logs and sends alerts for errors/warnings
"""
import os
import sys
import time
import json
import requests
from datetime import datetime
from pathlib import Path

CLOUD_API = os.environ.get('NUPI_CLOUD_API', 'https://nupidesktopai.com')
AGENT_ID = f"log-analyzer-{os.getpid()}"
LOG_FILES = [
    '/var/log/system.log',
    os.path.expanduser('~/.nupi/agent.log'),
]

class LogAnalyzerAgent:
    def __init__(self):
        self.agent_id = AGENT_ID
        self.is_running = True
        self.file_positions = {}
        print(f"📝 Log Analyzer Agent Started - {self.agent_id}")
        print(f"🌐 Cloud: {CLOUD_API}\n")
    
    def send_position(self, action="analyzing"):
        try:
            requests.post(f'{CLOUD_API}/api/agent/position', json={
                'agent_id': self.agent_id,
                'position': 'log-analysis',
                'action': action,
                'timestamp': datetime.now().isoformat()
            }, timeout=3)
        except: pass
    
    def analyze_line(self, line):
        """Detect severity level"""
        line_lower = line.lower()
        if any(x in line_lower for x in ['error', 'fatal', 'critical']):
            return 'error'
        elif any(x in line_lower for x in ['warn', 'warning']):
            return 'warning'
        elif any(x in line_lower for x in ['info', 'success']):
            return 'info'
        return None
    
    def send_log_entry(self, log_file, line, severity):
        try:
            requests.post(f'{CLOUD_API}/api/logs/entry', json={
                'agent_id': self.agent_id,
                'log_file': log_file,
                'line': line.strip(),
                'severity': severity,
                'timestamp': datetime.now().isoformat()
            }, timeout=3)
            print(f"📊 [{severity.upper()}] {log_file}: {line.strip()[:60]}...")
        except: pass
    
    def tail_log(self, log_file):
        try:
            if not os.path.exists(log_file):
                return
            
            # Get current position or start at end
            if log_file not in self.file_positions:
                self.file_positions[log_file] = os.path.getsize(log_file)
            
            with open(log_file, 'r') as f:
                f.seek(self.file_positions[log_file])
                new_lines = f.readlines()
                self.file_positions[log_file] = f.tell()
                
                for line in new_lines:
                    severity = self.analyze_line(line)
                    if severity:
                        self.send_log_entry(log_file, line, severity)
                        
        except Exception as e:
            pass
    
    def run(self):
        self.send_position("started")
        print("👀 Monitoring logs for errors and warnings...")
        
        while self.is_running:
            try:
                for log_file in LOG_FILES:
                    self.tail_log(log_file)
                
                self.send_position("active")
                time.sleep(5)
                
            except KeyboardInterrupt:
                print("\n⏹️  Stopping log analyzer...")
                self.send_position("stopped")
                break
            except Exception as e:
                print(f"⚠️  Error: {e}")
                time.sleep(10)

if __name__ == '__main__':
    LogAnalyzerAgent().run()
