#!/usr/bin/env python3
"""
NUPI Cloud Agent Security Layer
- API Key Authentication
- Rate Limiting
- Encryption
- Hack Protection
"""

import hashlib
import time
import secrets
from functools import wraps
from flask import request, jsonify
from collections import defaultdict

# SECURE API KEYS (only these can upload data)
VALID_API_KEYS = {
    'NUPI_CLOUD_MASTER_KEY_2025': 'master',
    'NUPI_TRAVELLING_AGENT_KEY': 'travelling_agent',
    'NUPI_LOCAL_DESKTOP_KEY': 'local_desktop',
    'NUPI_WEBSITE_KEY_THERAPY': 'therapy_site',
    'NUPI_WEBSITE_KEY_MAIN': 'main_site'
}

# Rate limiting: track requests per IP
request_tracker = defaultdict(list)
MAX_REQUESTS_PER_MINUTE = 60
BLOCK_DURATION = 300  # 5 minutes

# Track failed auth attempts
failed_auth = defaultdict(int)
MAX_FAILED_ATTEMPTS = 5

def generate_secure_token():
    """Generate a secure token for agents"""
    return secrets.token_urlsafe(32)

def validate_api_key(api_key):
    """Check if API key is valid"""
    return api_key in VALID_API_KEYS

def check_rate_limit(ip_address):
    """Check if IP is rate limited"""
    current_time = time.time()
    
    # Clean old requests (older than 1 minute)
    request_tracker[ip_address] = [
        req_time for req_time in request_tracker[ip_address]
        if current_time - req_time < 60
    ]
    
    # Check if too many requests
    if len(request_tracker[ip_address]) >= MAX_REQUESTS_PER_MINUTE:
        return False
    
    # Add current request
    request_tracker[ip_address].append(current_time)
    return True

def is_blocked(ip_address):
    """Check if IP is blocked due to failed auth"""
    if failed_auth[ip_address] >= MAX_FAILED_ATTEMPTS:
        return True
    return False

def require_api_key(f):
    """Decorator to require API key for endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get client IP
        ip_address = request.headers.get('X-Forwarded-For', request.remote_addr)
        
        # Check if blocked
        if is_blocked(ip_address):
            return jsonify({
                'error': 'Access denied',
                'message': 'Too many failed authentication attempts'
            }), 403
        
        # Check rate limit
        if not check_rate_limit(ip_address):
            return jsonify({
                'error': 'Rate limit exceeded',
                'message': 'Too many requests, please try again later'
            }), 429
        
        # Get API key from header
        api_key = request.headers.get('X-API-Key') or request.args.get('api_key')
        
        if not api_key:
            failed_auth[ip_address] += 1
            return jsonify({
                'error': 'Authentication required',
                'message': 'API key missing'
            }), 401
        
        # Validate API key
        if not validate_api_key(api_key):
            failed_auth[ip_address] += 1
            return jsonify({
                'error': 'Invalid API key',
                'message': 'Authentication failed'
            }), 403
        
        # Reset failed attempts on success
        failed_auth[ip_address] = 0
        
        # Add agent type to request
        request.agent_type = VALID_API_KEYS[api_key]
        
        return f(*args, **kwargs)
    
    return decorated_function

def require_admin_password(f):
    """Decorator for admin-only endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        password = request.headers.get('X-Admin-Password') or request.args.get('password')
        
        # Admin password
        if password != 'Jedariusm':
            return jsonify({
                'error': 'Admin access required',
                'message': 'Invalid password'
            }), 403
        
        return f(*args, **kwargs)
    
    return decorated_function

def encrypt_sensitive_data(data):
    """Basic encryption for sensitive data"""
    # In production, use proper encryption like Fernet
    # For now, just hash sensitive fields
    if isinstance(data, dict):
        if 'password' in data:
            data['password'] = hashlib.sha256(data['password'].encode()).hexdigest()
        if 'credentials' in data:
            data['credentials'] = '[ENCRYPTED]'
    return data

def log_security_event(event_type, details):
    """Log security events"""
    timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
    print(f"🔒 SECURITY [{timestamp}]: {event_type} - {details}")

