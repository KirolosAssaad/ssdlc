#!/usr/bin/env python3
"""
Docker initialization script for the backend
This script initializes the database and seeds it with data when running in Docker
"""

import os
import time
import sys
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError

def wait_for_db(database_url, max_retries=30, delay=2):
    """Wait for database to be ready"""
    print("🔄 Waiting for database to be ready...")
    
    for attempt in range(max_retries):
        try:
            engine = create_engine(database_url)
            connection = engine.connect()
            connection.close()
            print("✅ Database is ready!")
            return True
        except OperationalError as e:
            print(f"⏳ Database not ready (attempt {attempt + 1}/{max_retries}): {e}")
            time.sleep(delay)
    
    print("❌ Database failed to become ready")
    return False

def initialize_app():
    """Initialize the application"""
    from run import app
    from app import db
    from app.utils.seed_data import seed_database
    
    with app.app_context():
        print("🏗️  Creating database tables...")
        db.create_all()
        print("✅ Database tables created!")
        
        # Check if we need to seed data
        from app.models.user import User
        if User.query.count() == 0:
            print("🌱 Seeding database with initial data...")
            seed_database()
            print("✅ Database seeded successfully!")
        else:
            print("ℹ️  Database already contains data, skipping seed")

def main():
    """Main initialization function"""
    print("🚀 Starting BookVault Backend Initialization...")
    
    # Get database URL from environment
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL environment variable not set")
        sys.exit(1)
    
    # Wait for database
    if not wait_for_db(database_url):
        print("❌ Failed to connect to database")
        sys.exit(1)
    
    # Initialize application
    try:
        initialize_app()
        print("🎉 Backend initialization completed successfully!")
    except Exception as e:
        print(f"❌ Initialization failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()