#!/usr/bin/env python3
"""
Development server startup script
"""

import os
import sys
from run import app

def start_server():
    """Start the development server"""
    print("🚀 Starting BookVault Backend Server...")
    print(f"📍 Server will be available at: http://localhost:5000")
    print(f"📚 API Documentation: http://localhost:5000/api")
    print(f"🔧 Environment: {app.config.get('ENV', 'development')}")
    print(f"🐛 Debug Mode: {app.config.get('DEBUG', False)}")
    print("\n📋 Available endpoints:")
    print("  • GET  /api/books - Get all books")
    print("  • POST /api/auth/login - User login")
    print("  • POST /api/auth/signup - User registration")
    print("  • GET  /api/user/profile - User profile (auth required)")
    print("\n🧪 Test credentials:")
    print("  Email: john.doe@example.com")
    print("  Password: password123")
    print("\n" + "="*50)
    
    try:
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True
        )
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    start_server()