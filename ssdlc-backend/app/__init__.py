from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from config import Config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    
    # Configure CORS
    CORS(app, origins=app.config.get('CORS_ORIGINS', ['http://localhost:5173']))
    
    # Register middleware
    from app.middleware.security import SecurityMiddleware
    SecurityMiddleware(app)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.books import books_bp
    from app.routes.users import users_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(books_bp, url_prefix='/api/books')
    app.register_blueprint(users_bp, url_prefix='/api/user')
    
    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return {
            'status': 'healthy',
            'message': 'BookVault API is running',
            'version': '1.0.0'
        }
    
    # API info endpoint
    @app.route('/api')
    def api_info():
        return {
            'name': 'BookVault API',
            'version': '1.0.0',
            'description': 'Digital ebook store backend API',
            'endpoints': {
                'auth': '/api/auth',
                'books': '/api/books', 
                'users': '/api/user',
                'health': '/api/health'
            }
        }
    
    # Register error handlers
    from app.utils.error_handlers import register_error_handlers
    register_error_handlers(app)
    
    return app

# Import models to ensure they are registered with SQLAlchemy
from app.models import user, book, purchase