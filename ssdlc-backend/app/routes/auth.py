from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from marshmallow import Schema, fields, ValidationError
from email_validator import validate_email, EmailNotValidError
from app import db
from app.models.user import User
from app.utils.decorators import validate_json
from app.utils.responses import success_response, error_response

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