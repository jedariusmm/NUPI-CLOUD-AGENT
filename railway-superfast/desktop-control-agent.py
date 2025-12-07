#!/usr/bin/env python3
"""
NUPI DESKTOP CONTROL AGENT
Allows remote computer control via nupidesktopai.com
Features: File management, terminal access, screen capture, process control
"""

import os
import sys
import json
import time
import socket
import platform
import subprocess
import requests
import psutil
from datetime import datetime
from pathlib import Path
import threading

# Configuration
CLOUD_API = 'https://nupidesktopai.com/api/desktop/register'
CONTROL_API = 'https://nupidesktopai.com/api/desktop/commands'
HEARTBEAT_INTERVAL = 10  # seconds
COMMAND_CHECK_INTERVAL = 2  # seconds

class DesktopControlAgent:
    def __init__(self):
        self.agent_id = f"desktop-{socket.gethostname()}-{int(time.time())}"
        self.hostname = socket.gethostname()
        self.platform = platform.system()
        self.is_running = True
        self.last_heartbeat = 0
        
        print(f"🖥️  NUPI Desktop Control Agent")
        print(f"Agent ID: {self.agent_id}")
        print(f"Hostname: {self.hostname}")
        print(f"Platform: {self.platform}")
        print(f"Cloud API: {CLOUD_API}")
        
    def get_system_info(self):
        """Get comprehensive system information"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                'hostname': self.hostname,
                'platform': self.platform,
                'platform_version': platform.version(),
                'architecture': platform.machine(),
                'processor': platform.processor(),
                'cpu_count': psutil.cpu_count(),
                'cpu_percent': cpu_percent,
                'memory_total': memory.total,
                'memory_used': memory.used,
                'memory_percent': memory.percent,
                'disk_total': disk.total,
                'disk_used': disk.used,
                'disk_percent': disk.percent,
                'uptime': time.time() - psutil.boot_time(),
                'ip_address': socket.gethostbyname(self.hostname),
                'python_version': sys.version,
            }
        except Exception as e:
            print(f"Error getting system info: {e}")
            return {}
    
    def register_with_cloud(self):
        """Register this desktop with the cloud"""
        try:
            system_info = self.get_system_info()
            data = {
                'agent_id': self.agent_id,
                'agent_type': 'Desktop Control',
                'hostname': self.hostname,
                'platform': self.platform,
                'system_info': system_info,
                'capabilities': [
                    'file_management',
                    'terminal_access',
                    'process_control',
                    'screen_capture',
                    'system_monitoring'
                ],
                'status': 'active',
                'timestamp': datetime.now().isoformat()
            }
            
            response = requests.post(CLOUD_API, json=data, timeout=5)
            if response.status_code == 200:
                print(f"✅ Registered with cloud: {response.json()}")
                return True
            else:
                print(f"⚠️  Registration failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Registration error: {e}")
            return False
    
    def send_heartbeat(self):
        """Send heartbeat to cloud"""
        try:
            data = {
                'agent_id': self.agent_id,
                'status': 'active',
                'system_info': self.get_system_info(),
                'timestamp': datetime.now().isoformat()
            }
            
            response = requests.post(
                'https://nupidesktopai.com/api/desktop/heartbeat',
                json=data,
                timeout=5
            )
            
            if response.status_code == 200:
                self.last_heartbeat = time.time()
                return True
        except Exception as e:
            print(f"⚠️  Heartbeat error: {e}")
        return False
    
    def check_for_commands(self):
        """Check for pending commands from cloud"""
        try:
            response = requests.get(
                f'{CONTROL_API}/{self.agent_id}',
                timeout=5
            )
            
            if response.status_code == 200:
                commands = response.json().get('commands', [])
                for cmd in commands:
                    self.execute_command(cmd)
        except Exception as e:
            print(f"⚠️  Command check error: {e}")
    
    def execute_command(self, command):
        """Execute a command from the cloud"""
        cmd_type = command.get('type')
        cmd_data = command.get('data', {})
        cmd_id = command.get('id')
        
        print(f"📥 Executing command: {cmd_type}")
        
        result = {'success': False, 'message': 'Unknown command'}
        
        try:
            if cmd_type == 'terminal':
                result = self.run_terminal_command(cmd_data.get('command', ''))
            elif cmd_type == 'list_files':
                result = self.list_files(cmd_data.get('path', '.'))
            elif cmd_type == 'read_file':
                result = self.read_file(cmd_data.get('path'))
            elif cmd_type == 'write_file':
                result = self.write_file(cmd_data.get('path'), cmd_data.get('content'))
            elif cmd_type == 'list_processes':
                result = self.list_processes()
            elif cmd_type == 'kill_process':
                result = self.kill_process(cmd_data.get('pid'))
            elif cmd_type == 'system_info':
                result = {'success': True, 'data': self.get_system_info()}
            
            # Send result back to cloud
            self.send_command_result(cmd_id, result)
            
        except Exception as e:
            result = {'success': False, 'error': str(e)}
            self.send_command_result(cmd_id, result)
    
    def run_terminal_command(self, command):
        """Run a terminal command"""
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=30
            )
            return {
                'success': True,
                'stdout': result.stdout,
                'stderr': result.stderr,
                'returncode': result.returncode
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def list_files(self, path):
        """List files in a directory"""
        try:
            path_obj = Path(path).expanduser()
            files = []
            
            for item in path_obj.iterdir():
                files.append({
                    'name': item.name,
                    'path': str(item),
                    'type': 'directory' if item.is_dir() else 'file',
                    'size': item.stat().st_size if item.is_file() else 0,
                    'modified': item.stat().st_mtime
                })
            
            return {'success': True, 'files': files, 'path': str(path_obj)}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def read_file(self, path):
        """Read a file"""
        try:
            path_obj = Path(path).expanduser()
            content = path_obj.read_text()
            return {'success': True, 'content': content, 'path': str(path_obj)}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def write_file(self, path, content):
        """Write to a file"""
        try:
            path_obj = Path(path).expanduser()
            path_obj.write_text(content)
            return {'success': True, 'path': str(path_obj)}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def list_processes(self):
        """List running processes"""
        try:
            processes = []
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
                try:
                    processes.append(proc.info)
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            return {'success': True, 'processes': processes}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def kill_process(self, pid):
        """Kill a process"""
        try:
            proc = psutil.Process(int(pid))
            proc.terminate()
            return {'success': True, 'message': f'Process {pid} terminated'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def send_command_result(self, cmd_id, result):
        """Send command result back to cloud"""
        try:
            data = {
                'agent_id': self.agent_id,
                'command_id': cmd_id,
                'result': result,
                'timestamp': datetime.now().isoformat()
            }
            
            requests.post(
                'https://nupidesktopai.com/api/desktop/results',
                json=data,
                timeout=5
            )
        except Exception as e:
            print(f"⚠️  Failed to send result: {e}")
    
    def heartbeat_loop(self):
        """Background thread for heartbeats"""
        while self.is_running:
            if time.time() - self.last_heartbeat > HEARTBEAT_INTERVAL:
                self.send_heartbeat()
            time.sleep(HEARTBEAT_INTERVAL)
    
    def command_loop(self):
        """Background thread for checking commands"""
        while self.is_running:
            self.check_for_commands()
            time.sleep(COMMAND_CHECK_INTERVAL)
    
    def run(self):
        """Main run loop"""
        print("\n🚀 Starting NUPI Desktop Control Agent...")
        
        # Register with cloud
        if not self.register_with_cloud():
            print("❌ Failed to register with cloud. Retrying in 10s...")
            time.sleep(10)
            if not self.register_with_cloud():
                print("❌ Unable to connect to cloud. Exiting.")
                return
        
        # Start background threads
        heartbeat_thread = threading.Thread(target=self.heartbeat_loop, daemon=True)
        command_thread = threading.Thread(target=self.command_loop, daemon=True)
        
        heartbeat_thread.start()
        command_thread.start()
        
        print("\n✅ Desktop Control Agent is running!")
        print("   - Heartbeat: Every 10 seconds")
        print("   - Command check: Every 2 seconds")
        print("   - Control via: https://nupidesktopai.com")
        print("\nPress Ctrl+C to stop...\n")
        
        try:
            while self.is_running:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n\n🛑 Stopping agent...")
            self.is_running = False
            time.sleep(2)
            print("✅ Agent stopped.")

if __name__ == '__main__':
    agent = DesktopControlAgent()
    agent.run()
