#!/usr/bin/env python3
"""
Database initialization script
"""

from run import app
from app import db
from app.utils.seed_data import seed_database

def init_database():
    """Initialize the database"""
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database tables created successfully!")
        
        # Seed with sample data
        seed_database()
        print("Database seeded with sample data!")

if __name__ == '__main__':
    init_database()