#!/usr/bin/env python3
"""
TASK SCHEDULER AGENT - Automated task execution
Runs scheduled tasks and commands at specified intervals
"""
import os
import sys
import time
import json
import subprocess
import requests
from datetime import datetime

CLOUD_API = os.environ.get('NUPI_CLOUD_API', 'https://nupidesktopai.com')
AGENT_ID = f"task-scheduler-{os.getpid()}"
CHECK_INTERVAL = 30

class TaskSchedulerAgent:
    def __init__(self):
        self.agent_id = AGENT_ID
        self.is_running = True
        self.tasks_completed = 0
        print(f"⏰ Task Scheduler Agent Started - {self.agent_id}")
        print(f"🌐 Cloud: {CLOUD_API}\n")
    
    def send_position(self, action="waiting"):
        try:
            requests.post(f'{CLOUD_API}/api/agent/position', json={
                'agent_id': self.agent_id,
                'position': 'task-scheduling',
                'action': action,
                'timestamp': datetime.now().isoformat()
            }, timeout=3)
        except: pass
    
    def get_tasks(self):
        try:
            r = requests.get(f'{CLOUD_API}/api/tasks/pending/{self.agent_id}', timeout=5)
            if r.status_code == 200:
                return r.json().get('tasks', [])
        except:
            pass
        return []
    
    def execute_task(self, task):
        try:
            print(f"▶️  Executing task: {task.get('name', 'Unknown')}")
            
            if task['type'] == 'shell':
                result = subprocess.run(
                    task['command'],
                    shell=True,
                    capture_output=True,
                    text=True,
                    timeout=60
                )
                output = result.stdout or result.stderr
                
            elif task['type'] == 'python':
                result = subprocess.run(
                    [sys.executable, '-c', task['code']],
                    capture_output=True,
                    text=True,
                    timeout=60
                )
                output = result.stdout or result.stderr
                
            else:
                output = f"Unknown task type: {task['type']}"
            
            self.send_result(task['id'], 'completed', output)
            self.tasks_completed += 1
            print(f"✅ Task completed: {task.get('name', 'Unknown')}")
            
        except Exception as e:
            self.send_result(task['id'], 'failed', str(e))
            print(f"❌ Task failed: {e}")
    
    def send_result(self, task_id, status, output):
        try:
            requests.post(f'{CLOUD_API}/api/tasks/result', json={
                'agent_id': self.agent_id,
                'task_id': task_id,
                'status': status,
                'output': output,
                'timestamp': datetime.now().isoformat()
            }, timeout=5)
        except: pass
    
    def run(self):
        self.send_position("started")
        print("📋 Waiting for scheduled tasks...\n")
        
        while self.is_running:
            try:
                tasks = self.get_tasks()
                
                for task in tasks:
                    self.execute_task(task)
                    self.send_position(f"completed-{self.tasks_completed}")
                
                time.sleep(CHECK_INTERVAL)
                
            except KeyboardInterrupt:
                print("\n⏹️  Stopping task scheduler...")
                self.send_position("stopped")
                break
            except Exception as e:
                print(f"⚠️  Error: {e}")
                time.sleep(10)

if __name__ == '__main__':
    TaskSchedulerAgent().run()
