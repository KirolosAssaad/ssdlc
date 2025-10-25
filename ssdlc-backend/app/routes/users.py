from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError
from app import db
from app.models.user import User
from app.models.book import Book
from app.models.purchase import Purchase
from app.utils.decorators import validate_json
from app.utils.responses import success_response, error_response
import uuid

users_bp = Blueprint('users', __name__)

# Validation schemas
class UpdateProfileSchema(Schema):
    first_name = fields.Str(validate=lambda x: len(x.strip()) >= 2)
    last_name = fields.Str(validate=lambda x: len(x.strip()) >= 2)
    email = fields.Email()

class RegisterDeviceSchema(Schema):
    device_id = fields.Str(required=True)
    device_name = fields.Str(required=True)

class ChangePasswordSchema(Schema):
    current_password = fields.Str(required=True)
    new_password = fields.Str(required=True, validate=lambda x: len(x) >= 6)

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return error_response('User not found or inactive', 404)
        
        return success_response({
            'user': user.to_dict()
        }, 'Profile retrieved successfully')
        
    except Exception as e:
        return error_response(f'Failed to retrieve profile: {str(e)}', 500)

@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
@validate_json(UpdateProfileSchema())
def update_profile():
    """Update user profile"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return error_response('User not found or inactive', 404)
        
        data = request.get_json()
        
        # Check if email is being changed and if it's already taken
        if 'email' in data and data['email'].lower() != user.email:
            existing_user = User.query.filter_by(email=data['email'].lower()).first()
            if existing_user:
                return error_response('Email already in use', 409)
            user.email = data['email'].lower().strip()
        
        # Update other fields
        if 'first_name' in data:
            user.first_name = data['first_name'].strip()
        
        if 'last_name' in data:
            user.last_name = data['last_name'].strip()
        
        db.session.commit()
        
        return success_response({
            'user': user.to_dict()
        }, 'Profile updated successfully')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to update profile: {str(e)}', 500)

@users_bp.route('/purchased-books', methods=['GET'])
@jwt_required()
def get_purchased_books():
    """Get user's purchased books"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return error_response('User not found or inactive', 404)
        
        # Get purchased books with purchase information
        purchases = Purchase.query.filter_by(
            user_id=current_user_id,
            status='completed'
        ).all()
        
        books_data = []
        for purchase in purchases:
            book = Book.query.get(purchase.book_id)
            if book and book.is_active:
                book_dict = book.to_dict()
                book_dict['purchase_info'] = {
                    'purchase_id': purchase.id,
                    'purchase_date': purchase.created_at.isoformat(),
                    'purchase_price': float(purchase.purchase_price),
                    'download_count': purchase.download_count,
                    'max_downloads': purchase.max_downloads,
                    'can_download': purchase.can_download()
                }
                books_data.append(book_dict)
        
        return success_response({
            'books': books_data
        }, 'Purchased books retrieved successfully')
        
    except Exception as e:
        return error_response(f'Failed to retrieve purchased books: {str(e)}', 500)

@users_bp.route('/register-device', methods=['POST'])
@jwt_required()
@validate_json(RegisterDeviceSchema())
def register_device():
    """Register a device for the user"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return error_response('User not found or inactive', 404)
        
        data = request.get_json()
        device_id = data['device_id']
        device_name = data['device_name']
        
        # Check if user already has a registered device
        if user.registered_device_id:
            return error_response('You already have a registered device. Please unregister it first.', 409)
        
        # Register the device
        user.register_device(device_id, device_name)
        
        return success_response({
            'success': True,
            'device_id': device_id,
            'device_name': device_name
        }, 'Device registered successfully')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to register device: {str(e)}', 500)

@users_bp.route('/register-device', methods=['DELETE'])
@jwt_required()
def unregister_device():
    """Unregister the user's current device"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return error_response('User not found or inactive', 404)
        
        if not user.registered_device_id:
            return error_response('No device is currently registered', 400)
        
        # Unregister the device
        user.unregister_device()
        
        return success_response({
            'success': True
        }, 'Device unregistered successfully')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to unregister device: {str(e)}', 500)

@users_bp.route('/change-password', methods=['PUT'])
@jwt_required()
@validate_json(ChangePasswordSchema())
def change_password():
    """Change user password"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return error_response('User not found or inactive', 404)
        
        data = request.get_json()
        current_password = data['current_password']
        new_password = data['new_password']
        
        # Verify current password
        if not user.check_password(current_password):
            return error_response('Current password is incorrect', 400)
        
        # Set new password
        user.set_password(new_password)
        db.session.commit()
        
        return success_response({
            'success': True
        }, 'Password changed successfully')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to change password: {str(e)}', 500)

@users_bp.route('/account', methods=['DELETE'])
@jwt_required()
def delete_account():
    """Delete user account"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return error_response('User not found or inactive', 404)
        
        # Soft delete - just mark as inactive
        user.is_active = False
        db.session.commit()
        
        return success_response({
            'success': True
        }, 'Account deleted successfully')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to delete account: {str(e)}', 500)

@users_bp.route('/purchases', methods=['GET'])
@jwt_required()
def get_purchase_history():
    """Get user's purchase history"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return error_response('User not found or inactive', 404)
        
        # Get all purchases for the user
        purchases = Purchase.get_user_purchases(current_user_id)
        
        purchase_data = []
        for purchase in purchases:
            book = Book.query.get(purchase.book_id)
            purchase_dict = purchase.to_dict()
            if book:
                purchase_dict['book'] = {
                    'id': book.id,
                    'title': book.title,
                    'author': book.author,
                    'cover_image': book.cover_image
                }
            purchase_data.append(purchase_dict)
        
        return success_response({
            'purchases': purchase_data
        }, 'Purchase history retrieved successfully')
        
    except Exception as e:
        return error_response(f'Failed to retrieve purchase history: {str(e)}', 500)