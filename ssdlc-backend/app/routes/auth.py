from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from marshmallow import Schema, fields, ValidationError
from email_validator import validate_email, EmailNotValidError
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from app import db
from app.models.user import User
from app.utils.decorators import validate_json
from app.utils.responses import success_response, error_response
import os

auth_bp = Blueprint('auth', __name__)

# Validation schemas
class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=lambda x: len(x) >= 6)

class SignupSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=lambda x: len(x) >= 6)
    first_name = fields.Str(required=True, validate=lambda x: len(x.strip()) >= 2)
    last_name = fields.Str(required=True, validate=lambda x: len(x.strip()) >= 2)

class ForgotPasswordSchema(Schema):
    email = fields.Email(required=True)

class GoogleAuthSchema(Schema):
    id_token = fields.Str(required=True)
    access_token = fields.Str(required=False)

@auth_bp.route('/login', methods=['POST'])
@validate_json(LoginSchema())
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        email = data['email'].lower().strip()
        password = data['password']
        
        # Find user by email
        user = User.query.filter_by(email=email, is_active=True).first()
        
        if not user or not user.check_password(password):
            return error_response('Invalid email or password', 401)
        
        # Generate tokens
        tokens = user.generate_tokens()
        
        return success_response({
            'user': user.to_dict(),
            'token': tokens['access_token'],
            'refresh_token': tokens['refresh_token']
        }, 'Login successful')
        
    except Exception as e:
        return error_response(f'Login failed: {str(e)}', 500)

@auth_bp.route('/signup', methods=['POST'])
@validate_json(SignupSchema())
def signup():
    """User registration endpoint"""
    try:
        data = request.get_json()
        email = data['email'].lower().strip()
        
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return error_response('Email already registered', 409)
        
        # Validate email format
        try:
            validate_email(email)
        except EmailNotValidError:
            return error_response('Invalid email format', 400)
        
        # Create new user
        user = User(
            email=email,
            password=data['password'],
            first_name=data['first_name'],
            last_name=data['last_name']
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Generate tokens
        tokens = user.generate_tokens()
        
        return success_response({
            'user': user.to_dict(),
            'token': tokens['access_token'],
            'refresh_token': tokens['refresh_token']
        }, 'Registration successful', 201)
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Registration failed: {str(e)}', 500)

@auth_bp.route('/forgot-password', methods=['POST'])
@validate_json(ForgotPasswordSchema())
def forgot_password():
    """Password reset request endpoint"""
    try:
        data = request.get_json()
        email = data['email'].lower().strip()
        
        # Check if user exists
        user = User.query.filter_by(email=email, is_active=True).first()
        
        # Always return success for security (don't reveal if email exists)
        # In production, you would send an actual email here
        if user:
            # TODO: Implement actual email sending
            # For now, just log the reset request
            print(f"Password reset requested for user: {user.email}")
        
        return success_response(
            {'message': 'If the email exists, a password reset link has been sent'},
            'Password reset email sent'
        )
        
    except Exception as e:
        return error_response(f'Password reset failed: {str(e)}', 500)

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token endpoint"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return error_response('User not found or inactive', 404)
        
        # Generate new access token
        new_access_token = create_access_token(identity=current_user_id)
        
        return success_response({
            'token': new_access_token
        }, 'Token refreshed successfully')
        
    except Exception as e:
        return error_response(f'Token refresh failed: {str(e)}', 500)

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """User logout endpoint"""
    try:
        # In a production app, you might want to blacklist the token
        # For now, we'll just return success
        return success_response({}, 'Logout successful')
        
    except Exception as e:
        return error_response(f'Logout failed: {str(e)}', 500)

@auth_bp.route('/google', methods=['POST'])
@validate_json(GoogleAuthSchema())
def google_auth():
    """Google SSO authentication"""
    try:
        data = request.get_json()
        id_token_str = data['id_token']
        
        # Verify the Google ID token
        try:
            # Get Google Client ID from environment
            google_client_id = os.getenv('GOOGLE_CLIENT_ID')
            if not google_client_id:
                return error_response('Google authentication not configured', 500)
            
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                id_token_str, 
                google_requests.Request(), 
                google_client_id
            )
            
            # Verify the issuer
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                return error_response('Invalid token issuer', 400)
            
            # Extract user information
            google_user_id = idinfo['sub']
            email = idinfo['email']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            picture = idinfo.get('picture', '')
            email_verified = idinfo.get('email_verified', False)
            
        except ValueError as e:
            return error_response(f'Invalid Google token: {str(e)}', 400)
        
        # Check if user exists
        user = User.query.filter_by(email=email).first()
        
        if user:
            # Existing user - sign them in
            if not user.is_active:
                return error_response('Account is disabled', 403)
            
            # Update user info from Google if needed
            if not user.google_id:
                user.google_id = google_user_id
                user.profile_picture = picture
                db.session.commit()
            
        else:
            # New user - create account
            if not email_verified:
                return error_response('Email not verified with Google', 400)
            
            user = User(
                email=email,
                password='google-sso-user',  # Special password for SSO users
                first_name=first_name,
                last_name=last_name
            )
            user.google_id = google_user_id
            user.profile_picture = picture
            user.email_verified = True
            
            db.session.add(user)
            db.session.commit()
        
        # Generate tokens
        tokens = user.generate_tokens()
        
        return success_response({
            'user': user.to_dict(),
            'token': tokens['access_token'],
            'refresh_token': tokens['refresh_token'],
            'is_new_user': not bool(User.query.filter_by(email=email).first())
        }, 'Google authentication successful')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Google authentication failed: {str(e)}', 500)

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return error_response('User not found or inactive', 404)
        
        return success_response({
            'user': user.to_dict()
        }, 'User information retrieved')
        
    except Exception as e:
        return error_response(f'Failed to get user information: {str(e)}', 500)