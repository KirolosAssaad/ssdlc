from datetime import datetime
from app import db, bcrypt
from flask_jwt_extended import create_access_token, create_refresh_token
import uuid

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    registered_device_id = db.Column(db.String(255), nullable=True)
    registered_device_name = db.Column(db.String(255), nullable=True)
    
    # Google SSO fields
    google_id = db.Column(db.String(255), nullable=True, unique=True, index=True)
    profile_picture = db.Column(db.String(500), nullable=True)
    email_verified = db.Column(db.Boolean, default=False, nullable=False)
    auth_provider = db.Column(db.String(50), default='local', nullable=False)  # 'local', 'google'
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    purchases = db.relationship('Purchase', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    def __init__(self, email, password, first_name, last_name, **kwargs):
        self.email = email.lower().strip()
        self.first_name = first_name.strip()
        self.last_name = last_name.strip()
        self.set_password(password)
        
        # Handle Google SSO fields
        self.google_id = kwargs.get('google_id')
        self.profile_picture = kwargs.get('profile_picture')
        self.email_verified = kwargs.get('email_verified', False)
        self.auth_provider = kwargs.get('auth_provider', 'local')
    
    def set_password(self, password):
        """Hash and set the user's password"""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        """Check if the provided password matches the user's password"""
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def generate_tokens(self):
        """Generate access and refresh tokens for the user"""
        access_token = create_access_token(identity=self.id)
        refresh_token = create_refresh_token(identity=self.id)
        return {
            'access_token': access_token,
            'refresh_token': refresh_token
        }
    
    def register_device(self, device_id, device_name):
        """Register a device for this user"""
        self.registered_device_id = device_id
        self.registered_device_name = device_name
        db.session.commit()
    
    def unregister_device(self):
        """Unregister the current device"""
        self.registered_device_id = None
        self.registered_device_name = None
        db.session.commit()
    
    def has_purchased_book(self, book_id):
        """Check if user has purchased a specific book"""
        return self.purchases.filter_by(book_id=book_id, status='completed').first() is not None
    
    def get_purchased_books(self):
        """Get all books purchased by this user"""
        from app.models.book import Book
        purchased_book_ids = [p.book_id for p in self.purchases.filter_by(status='completed')]
        return Book.query.filter(Book.id.in_(purchased_book_ids)).all()
    
    def to_dict(self, include_sensitive=False):
        """Convert user object to dictionary"""
        data = {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'is_active': self.is_active,
            'registered_device': self.registered_device_name,
            'profile_picture': self.profile_picture,
            'email_verified': self.email_verified,
            'auth_provider': self.auth_provider,
            'created_at': self.created_at.isoformat(),
            'purchased_books': [p.book_id for p in self.purchases.filter_by(status='completed')]
        }
        
        if include_sensitive:
            data['registered_device_id'] = self.registered_device_id
            data['google_id'] = self.google_id
        
        return data
    
    def __repr__(self):
        return f'<User {self.email}>'