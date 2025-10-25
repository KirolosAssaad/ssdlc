from flask import request, g
import time
import logging

class SecurityMiddleware:
    """
    Security middleware to add security headers and logging to all responses
    """
    
    def __init__(self, app=None):
        self.app = app
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize the security middleware with the Flask app"""
        app.before_request(self.before_request)
        app.after_request(self.after_request)
        
        # Setup logging
        if not app.debug:
            logging.basicConfig(level=logging.INFO)
            self.logger = logging.getLogger(__name__)
        else:
            self.logger = app.logger
    
    def before_request(self):
        """Execute before each request"""
        # Record request start time for performance monitoring
        g.start_time = time.time()
        
        # Log incoming request
        self.logger.info(f"Request: {request.method} {request.path} from {request.remote_addr}")
        
        # Add request ID for tracking
        g.request_id = f"{int(time.time() * 1000)}-{request.remote_addr}"
    
    def after_request(self, response):
        """Execute after each request to add security headers"""
        
        # Add security headers
        security_headers = self.app.config.get('SECURITY_HEADERS', {})
        for header, value in security_headers.items():
            response.headers[header] = value
        
        # Add CORS headers if not already set by Flask-CORS
        if 'Access-Control-Allow-Origin' not in response.headers:
            allowed_origins = self.app.config.get('CORS_ORIGINS', ['http://localhost:5173'])
            origin = request.headers.get('Origin')
            if origin in allowed_origins:
                response.headers['Access-Control-Allow-Origin'] = origin
                response.headers['Access-Control-Allow-Credentials'] = 'true'
        
        # Add custom headers
        response.headers['X-Request-ID'] = getattr(g, 'request_id', 'unknown')
        response.headers['X-Response-Time'] = f"{(time.time() - getattr(g, 'start_time', time.time())) * 1000:.2f}ms"
        
        # Remove server information for security
        response.headers.pop('Server', None)
        
        # Log response
        duration = (time.time() - getattr(g, 'start_time', time.time())) * 1000
        self.logger.info(
            f"Response: {response.status_code} for {request.method} {request.path} "
            f"in {duration:.2f}ms"
        )
        
        return response