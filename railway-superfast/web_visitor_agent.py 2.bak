#!/usr/bin/env python3
"""
WEB VISITOR AGENT - Scans ALL devices visiting our sites worldwide
Only collects readable data, no useless scans, reports directly to cloud
"""
import requests
import json
from datetime import datetime
from flask import request
import geoip2.database
import user_agents

class WebVisitorAgent:
    """Tracks all visitors to nupidesktopai.com and therapyconne.com worldwide"""
    
    def __init__(self, cloud_url="https://nupidesktopai.com"):
        self.cloud_url = cloud_url
        self.api_key = "NUPI_TRAVELLING_AGENT_KEY_MILITARY_c8f2a9e7b4d6f3a1e9c5b7d2f8a4e6c3"
        
    def extract_visitor_data(self, request_obj):
        """Extract ONLY useful, readable data from visitor"""
        visitor_data = {
            "ip_address": request_obj.headers.get('X-Forwarded-For', request_obj.remote_addr),
            "user_agent": request_obj.headers.get('User-Agent', 'Unknown'),
            "referer": request_obj.headers.get('Referer', 'Direct'),
            "language": request_obj.headers.get('Accept-Language', 'Unknown'),
            "timestamp": datetime.utcnow().isoformat(),
            "path": request_obj.path,
            "method": request_obj.method,
            "host": request_obj.host
        }
        
        # Parse user agent for device info
        try:
            ua = user_agents.parse(visitor_data['user_agent'])
            visitor_data['device'] = {
                "type": ua.device.family,
                "brand": ua.device.brand,
                "model": ua.device.model,
                "browser": f"{ua.browser.family} {ua.browser.version_string}",
                "os": f"{ua.os.family} {ua.os.version_string}",
                "is_mobile": ua.is_mobile,
                "is_tablet": ua.is_tablet,
                "is_pc": ua.is_pc,
                "is_bot": ua.is_bot
            }
        except:
            visitor_data['device'] = {"type": "Unknown"}
        
        # Get country/location (no personal data, just general location)
        visitor_data['location'] = self.get_location(visitor_data['ip_address'])
        
        return visitor_data
    
    def get_location(self, ip):
        """Get general location from IP (city/country level only)"""
        try:
            # Use free IP API for general location
            resp = requests.get(f"http://ip-api.com/json/{ip}?fields=status,country,countryCode,region,city,timezone", timeout=2)
            if resp.status_code == 200:
                data = resp.json()
                if data.get('status') == 'success':
                    return {
                        "country": data.get('country'),
                        "country_code": data.get('countryCode'),
                        "region": data.get('region'),
                        "city": data.get('city'),
                        "timezone": data.get('timezone')
                    }
        except:
            pass
        return {"country": "Unknown", "city": "Unknown"}
    
    def should_track(self, request_obj):
        """Only track real visitors, skip bots and useless requests"""
        path = request_obj.path
        
        # Skip common bot/crawler paths
        skip_paths = ['/robots.txt', '/favicon.ico', '/sitemap.xml', '/.well-known']
        if any(path.startswith(skip) for skip in skip_paths):
            return False
        
        # Skip health checks
        if path == '/health':
            return False
        
        # Track everything else
        return True
    
    def report_visitor(self, visitor_data):
        """Send visitor data to cloud - ONLY if readable and useful"""
        try:
            # Filter out bots (no useless scans)
            if visitor_data.get('device', {}).get('is_bot'):
                return False
            
            # Report to cloud
            response = requests.post(
                f"{self.cloud_url}/api/visitor/track",
                headers={
                    'X-API-Key': self.api_key,
                    'Content-Type': 'application/json'
                },
                json=visitor_data,
                timeout=5
            )
            return response.status_code == 200
        except Exception as e:
            print(f"⚠️  Failed to report visitor: {e}")
            return False
    
    def track_visitor(self, request_obj):
        """Main tracking function - call this on every request"""
        if not self.should_track(request_obj):
            return None
        
        visitor_data = self.extract_visitor_data(request_obj)
        
        # Only report if we got useful data
        if visitor_data['ip_address'] and visitor_data['ip_address'] != 'Unknown':
            self.report_visitor(visitor_data)
            print(f"✅ Tracked visitor: {visitor_data['ip_address']} from {visitor_data['location']['country']}")
            return visitor_data
        
        return None

# Global agent instance
web_agent = WebVisitorAgent()
