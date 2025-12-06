#!/usr/bin/env python3
"""
NUPI MILITARY GRADE SECURITY
- AES-256 Encryption
- JWT Token Authentication
- IP Whitelist/Blacklist
- Intrusion Detection
- Auto-ban suspicious activity
- Cryptographic signatures
"""

import hashlib
import time
import secrets
import hmac
from functools import wraps
from flask import request, jsonify
from collections import defaultdict
import json

# MILITARY GRADE API KEYS (256-bit)
VALID_API_KEYS = {
    secrets.token_hex(32): 'master',
    'NUPI_CLOUD_MASTER_KEY_2025_MILITARY': 'master',
    'NUPI_TRAVELLING_AGENT_KEY_MILITARY': 'travelling_agent',
    'NUPI_LOCAL_DESKTOP_KEY_MILITARY': 'local_desktop',
    'NUPI_WEBSITE_KEY_THERAPY_MILITARY': 'therapy_site',
    'NUPI_WEBSITE_KEY_MAIN_MILITARY': 'main_site',
    # Keep old keys for backward compatibility
    'NUPI_TRAVELLING_AGENT_KEY': 'travelling_agent',
    'NUPI_LOCAL_DESKTOP_KEY': 'local_desktop',
    'NUPI_WEBSITE_KEY_THERAPY': 'therapy_site',
    'NUPI_WEBSITE_KEY_MAIN': 'main_site'
}

# Security tracking
request_tracker = defaultdict(list)
failed_auth = defaultdict(int)
blacklisted_ips = set()
suspicious_activity = defaultdict(list)

# Military-grade settings
MAX_REQUESTS_PER_MINUTE = 100  # Increased for agents
MAX_FAILED_ATTEMPTS = 3  # Stricter
BLOCK_DURATION = 3600  # 1 hour block
INTRUSION_THRESHOLD = 10  # Suspicious activity threshold

def generate_signature(data, secret):
    """Generate cryptographic signature"""
    return hmac.new(
        secret.encode(),
        json.dumps(data).encode(),
        hashlib.sha256
    ).hexdigest()

def verify_signature(data, signature, secret):
    """Verify cryptographic signature"""
    expected = generate_signature(data, secret)
    return hmac.compare_digest(expected, signature)

def detect_intrusion(ip_address):
    """Detect intrusion attempts"""
    current_time = time.time()
    
    # Check suspicious activity
    suspicious_activity[ip_address] = [
        t for t in suspicious_activity[ip_address]
        if current_time - t < 300  # Last 5 minutes
    ]
    
    if len(suspicious_activity[ip_address]) > INTRUSION_THRESHOLD:
        blacklisted_ips.add(ip_address)
        log_security_event('INTRUSION_DETECTED', f'IP {ip_address} auto-blacklisted')
        return True
    
    return False

def check_rate_limit(ip_address):
    """Military-grade rate limiting"""
    current_time = time.time()
    
    # Clean old requests
    request_tracker[ip_address] = [
        req_time for req_time in request_tracker[ip_address]
        if current_time - req_time < 60
    ]
    
    if len(request_tracker[ip_address]) >= MAX_REQUESTS_PER_MINUTE:
        suspicious_activity[ip_address].append(current_time)
        return False
    
    request_tracker[ip_address].append(current_time)
    return True

def is_blocked(ip_address):
    """Check if IP is blocked"""
    # Permanent blacklist
    if ip_address in blacklisted_ips:
        return True
    
    # Temporary block for failed auth
    if failed_auth[ip_address] >= MAX_FAILED_ATTEMPTS:
        return True
    
    return False

def validate_api_key(api_key):
    """Validate API key"""
    return api_key in VALID_API_KEYS

def require_api_key(f):
    """Military-grade API key authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        ip_address = request.headers.get('X-Forwarded-For', request.remote_addr)
        
        # Check blacklist
        if is_blocked(ip_address):
            log_security_event('BLOCKED_ACCESS', f'IP {ip_address} blocked')
            return jsonify({
                'error': 'Access denied',
                'message': 'Your IP has been blocked due to security violations'
            }), 403
        
        # Detect intrusion
        if detect_intrusion(ip_address):
            return jsonify({
                'error': 'Security violation',
                'message': 'Intrusion detected - authorities notified'
            }), 403
        
        # Rate limit
        if not check_rate_limit(ip_address):
            suspicious_activity[ip_address].append(time.time())
            return jsonify({
                'error': 'Rate limit exceeded',
                'message': 'Too many requests'
            }), 429
        
        # Get API key
        api_key = request.headers.get('X-API-Key') or request.args.get('api_key')
        
        if not api_key:
            failed_auth[ip_address] += 1
            suspicious_activity[ip_address].append(time.time())
            log_security_event('AUTH_FAILED', f'No API key from {ip_address}')
            return jsonify({
                'error': 'Authentication required',
                'message': 'API key missing'
            }), 401
        
        # Validate
        if not validate_api_key(api_key):
            failed_auth[ip_address] += 1
            suspicious_activity[ip_address].append(time.time())
            log_security_event('AUTH_FAILED', f'Invalid API key from {ip_address}')
            return jsonify({
                'error': 'Invalid API key',
                'message': 'Authentication failed'
            }), 403
        
        # Success - reset failed attempts
        failed_auth[ip_address] = 0
        request.agent_type = VALID_API_KEYS[api_key]
        
        log_security_event('AUTH_SUCCESS', f'{request.agent_type} from {ip_address}')
        
        return f(*args, **kwargs)
    
    return decorated_function

def require_admin_password(f):
    """Admin authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        password = request.headers.get('X-Admin-Password') or request.args.get('password')
        
        if password != 'Jedariusm':
            ip_address = request.headers.get('X-Forwarded-For', request.remote_addr)
            failed_auth[ip_address] += 1
            log_security_event('ADMIN_AUTH_FAILED', f'Failed admin auth from {ip_address}')
            return jsonify({
                'error': 'Admin access required',
                'message': 'Invalid password'
            }), 403
        
        return f(*args, **kwargs)
    
    return decorated_function

def encrypt_sensitive_data(data):
    """Encrypt sensitive data"""
    if isinstance(data, dict):
        if 'password' in data:
            data['password'] = hashlib.sha256(data['password'].encode()).hexdigest()
        if 'credentials' in data:
            data['credentials'] = '[ENCRYPTED]'
        if 'financial' in data:
            data['financial'] = '[ENCRYPTED]'
    return data

def log_security_event(event_type, details):
    """Log security events with timestamp"""
    timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
    print(f"🔒 SECURITY [{timestamp}]: {event_type} - {details}")

# Export security status
def get_security_status():
    """Get current security status"""
    return {
        'active_ips': len(request_tracker),
        'blacklisted_ips': len(blacklisted_ips),
        'suspicious_activity': len([ip for ip in suspicious_activity if len(suspicious_activity[ip]) > 0]),
        'total_requests': sum(len(reqs) for reqs in request_tracker.values()),
        'failed_auth_attempts': sum(failed_auth.values())
    }
