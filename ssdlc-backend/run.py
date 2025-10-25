#!/usr/bin/env python3
"""
BookVault Backend Application Entry Point
"""

import os
from app import create_app, db
from config import config_dict

# Get environment from environment variable or default to development
env = os.getenv('FLASK_ENV', 'development')
config_class = config_dict.get(env, config_dict['development'])

# Create Flask application
app = create_app(config_class)

# Set Flask app for CLI commands
os.environ['FLASK_APP'] = 'run.py'

@app.cli.command()
def init_db():
    """Initialize the database with tables"""
    db.create_all()
    print("Database tables created successfully!")

@app.cli.command()
def seed_db():
    """Seed the database with sample data"""
    from app.utils.seed_data import seed_database
    seed_database()
    print("Database seeded successfully!")

@app.cli.command()
def reset_db():
    """Reset the database (drop and recreate all tables)"""
    db.drop_all()
    db.create_all()
    print("Database reset successfully!")

@app.shell_context_processor
def make_shell_context():
    """Make database models available in Flask shell"""
    from app.models.user import User
    from app.models.book import Book
    from app.models.purchase import Purchase
    
    return {
        'db': db,
        'User': User,
        'Book': Book,
        'Purchase': Purchase
    }

if __name__ == '__main__':
    # Run the application
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=app.config.get('DEBUG', False)
    )