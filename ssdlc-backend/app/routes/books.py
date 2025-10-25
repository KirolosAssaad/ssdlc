from flask import Blueprint, request, jsonify, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity, jwt_required
from marshmallow import Schema, fields, ValidationError
from app import db
from app.models.book import Book
from app.models.user import User
from app.models.purchase import Purchase
from app.utils.decorators import validate_json
from app.utils.responses import success_response, error_response
import os
from datetime import datetime

books_bp = Blueprint('books', __name__)

# Validation schemas
class PurchaseSchema(Schema):
    book_id = fields.Str(required=True)
    payment_method = fields.Str(required=True)

@books_bp.route('', methods=['GET'])
def get_books():
    """Get books with optional filtering, searching, and pagination"""
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('limit', current_app.config['BOOKS_PER_PAGE'], type=int), 100)
        search = request.args.get('search', '').strip()
        genre = request.args.get('genre', '').strip()
        sort_by = request.args.get('sortBy', 'title')
        sort_order = request.args.get('sortOrder', 'asc')
        
        # Validate sort parameters
        valid_sort_fields = ['title', 'author', 'price', 'rating', 'published_date']
        if sort_by not in valid_sort_fields:
            sort_by = 'title'
        
        if sort_order not in ['asc', 'desc']:
            sort_order = 'asc'
        
        # Search books
        pagination = Book.search(
            query=search if search else None,
            genre=genre if genre else None,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            per_page=per_page
        )
        
        # Convert books to dict
        books = [book.to_dict() for book in pagination.items]
        
        return success_response({
            'books': books,
            'total': pagination.total,
            'page': pagination.page,
            'pages': pagination.pages,
            'per_page': pagination.per_page,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }, 'Books retrieved successfully')
        
    except Exception as e:
        return error_response(f'Failed to retrieve books: {str(e)}', 500)

@books_bp.route('/<book_id>', methods=['GET'])
def get_book(book_id):
    """Get a specific book by ID"""
    try:
        book = Book.query.filter_by(id=book_id, is_active=True).first()
        
        if not book:
            return error_response('Book not found', 404)
        
        return success_response({
            'book': book.to_dict()
        }, 'Book retrieved successfully')
        
    except Exception as e:
        return error_response(f'Failed to retrieve book: {str(e)}', 500)

@books_bp.route('/genres', methods=['GET'])
def get_genres():
    """Get all available book genres"""
    try:
        genres = [genre[0] for genre in Book.get_genres()]
        
        return success_response({
            'genres': genres
        }, 'Genres retrieved successfully')
        
    except Exception as e:
        return error_response(f'Failed to retrieve genres: {str(e)}', 500)

@books_bp.route('/purchase', methods=['POST'])
@jwt_required()
@validate_json(PurchaseSchema())
def purchase_book():
    """Purchase a book"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        book_id = data['book_id']
        payment_method = data['payment_method']
        
        # Get user and book
        user = User.query.get(current_user_id)
        book = Book.query.filter_by(id=book_id, is_active=True).first()
        
        if not user or not user.is_active:
            return error_response('User not found or inactive', 404)
        
        if not book:
            return error_response('Book not found', 404)
        
        # Check if user already owns this book
        if user.has_purchased_book(book_id):
            return error_response('You already own this book', 409)
        
        # Create purchase record
        purchase = Purchase(
            user_id=current_user_id,
            book_id=book_id,
            purchase_price=book.price,
            payment_method=payment_method
        )
        
        db.session.add(purchase)
        
        # In a real app, you would process payment here
        # For demo purposes, we'll just mark it as completed
        purchase.complete_purchase(transaction_id=f'demo_txn_{datetime.now().timestamp()}')
        
        db.session.commit()
        
        return success_response({
            'success': True,
            'purchase_id': purchase.id,
            'download_url': f'/api/books/{book_id}/download'
        }, 'Book purchased successfully', 201)
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Purchase failed: {str(e)}', 500)

@books_bp.route('/<book_id>/download', methods=['GET'])
@jwt_required()
def download_book(book_id):
    """Download a purchased book"""
    try:
        current_user_id = get_jwt_identity()
        
        # Get user and book
        user = User.query.get(current_user_id)
        book = Book.query.filter_by(id=book_id, is_active=True).first()
        
        if not user or not user.is_active:
            return error_response('User not found or inactive', 404)
        
        if not book:
            return error_response('Book not found', 404)
        
        # Check if user has purchased this book
        purchase = Purchase.query.filter_by(
            user_id=current_user_id,
            book_id=book_id,
            status='completed'
        ).first()
        
        if not purchase:
            return error_response('You have not purchased this book', 403)
        
        # Check if user has a registered device
        if not user.registered_device_id:
            return error_response('Please register a device to download books', 403)
        
        # Check download limits
        if not purchase.can_download():
            return error_response('Download limit exceeded for this book', 403)
        
        # Increment download count
        purchase.increment_download_count()
        
        # In a real app, you would serve the actual file
        # For demo purposes, return a download URL
        return success_response({
            'download_url': f'/downloads/{book_id}/{purchase.id}',
            'expires_in': 3600,  # 1 hour
            'downloads_remaining': purchase.max_downloads - purchase.download_count
        }, 'Download URL generated successfully')
        
    except Exception as e:
        return error_response(f'Download failed: {str(e)}', 500)

@books_bp.route('/search', methods=['GET'])
def search_books():
    """Advanced book search endpoint"""
    try:
        # Get search parameters
        query = request.args.get('q', '').strip()
        author = request.args.get('author', '').strip()
        genre = request.args.get('genre', '').strip()
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        min_rating = request.args.get('min_rating', type=float)
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('limit', 20, type=int), 100)
        
        # Build query
        books_query = Book.query.filter_by(is_active=True)
        
        # Apply filters
        if query:
            search_filter = db.or_(
                Book.title.ilike(f'%{query}%'),
                Book.author.ilike(f'%{query}%'),
                Book.description.ilike(f'%{query}%')
            )
            books_query = books_query.filter(search_filter)
        
        if author:
            books_query = books_query.filter(Book.author.ilike(f'%{author}%'))
        
        if genre:
            books_query = books_query.filter_by(genre=genre)
        
        if min_price is not None:
            books_query = books_query.filter(Book.price >= min_price)
        
        if max_price is not None:
            books_query = books_query.filter(Book.price <= max_price)
        
        if min_rating is not None:
            books_query = books_query.filter(Book.rating >= min_rating)
        
        # Apply pagination
        pagination = books_query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        books = [book.to_dict() for book in pagination.items]
        
        return success_response({
            'books': books,
            'total': pagination.total,
            'page': pagination.page,
            'pages': pagination.pages,
            'per_page': pagination.per_page
        }, 'Search completed successfully')
        
    except Exception as e:
        return error_response(f'Search failed: {str(e)}', 500)