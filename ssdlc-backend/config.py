import os
from datetime import timedelta
from decouple import config

class Config:
    # Basic Flask configuration
    SECRET_KEY = config('SECRET_KEY', default='dev-secret-key-change-in-production')
    
    # Database configuration - PostgreSQL only
    SQLALCHEMY_DATABASE_URI = config(
        'DATABASE_URL', 
        default='postgresql://bookvault_user:bookvault_password@localhost:5432/bookvault'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT configuration
    JWT_SECRET_KEY = config('JWT_SECRET_KEY', default='jwt-secret-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # CORS configuration
    CORS_ORIGINS = config('CORS_ORIGINS', default='http://localhost:5173').split(',')
    
    # Security headers
    SECURITY_HEADERS = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'",
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    }
    
    # Rate limiting (using memory for simplicity)
    RATELIMIT_STORAGE_URL = 'memory://'
    
    # File upload configuration
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = config('UPLOAD_FOLDER', default='uploads')
    
    # Email configuration (for password reset)
    MAIL_SERVER = config('MAIL_SERVER', default='localhost')
    MAIL_PORT = config('MAIL_PORT', default=587, cast=int)
    MAIL_USE_TLS = config('MAIL_USE_TLS', default=True, cast=bool)
    MAIL_USERNAME = config('MAIL_USERNAME', default='')
    MAIL_PASSWORD = config('MAIL_PASSWORD', default='')
    
    # Pagination
    BOOKS_PER_PAGE = config('BOOKS_PER_PAGE', default=20, cast=int)
    
    # Environment
    ENV = config('FLASK_ENV', default='development')
    DEBUG = config('DEBUG', default=True, cast=bool)

class DevelopmentConfig(Config):
    DEBUG = True
    # Development uses PostgreSQL
    SQLALCHEMY_DATABASE_URI = config(
        'DATABASE_URL', 
        default='postgresql://bookvault_user:bookvault_password@localhost:5432/bookvault'
    )
    
class ProductionConfig(Config):
    DEBUG = False
    # Production uses PostgreSQL (should be set via environment variable)
    SQLALCHEMY_DATABASE_URI = config('DATABASE_URL')
    
class TestingConfig(Config):
    TESTING = True
    # Testing uses in-memory PostgreSQL or test database
    SQLALCHEMY_DATABASE_URI = config(
        'TEST_DATABASE_URL',
        default='postgresql://bookvault_user:bookvault_password@localhost:5432/bookvault_test'
    )
    WTF_CSRF_ENABLED = False

config_dict = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig
}