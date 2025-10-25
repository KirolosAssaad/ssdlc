from datetime import datetime
from app import db
import uuid

class Book(db.Model):
    __tablename__ = 'books'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False, index=True)
    author = db.Column(db.String(100), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    cover_image = db.Column(db.String(255), nullable=True)
    genre = db.Column(db.String(50), nullable=False, index=True)
    rating = db.Column(db.Float, default=0.0)
    rating_count = db.Column(db.Integer, default=0)
    published_date = db.Column(db.Date, nullable=False)
    file_path = db.Column(db.String(255), nullable=True)  # Path to the actual ebook file
    file_size = db.Column(db.Integer, nullable=True)  # File size in bytes
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    purchases = db.relationship('Purchase', backref='book', lazy='dynamic', cascade='all, delete-orphan')
    
    def __init__(self, title, author, description, price, genre, published_date, **kwargs):
        self.title = title.strip()
        self.author = author.strip()
        self.description = description.strip() if description else None
        self.price = price
        self.genre = genre.strip()
        self.published_date = published_date
        
        # Optional fields
        self.cover_image = kwargs.get('cover_image')
        self.rating = kwargs.get('rating', 0.0)
        self.rating_count = kwargs.get('rating_count', 0)
        self.file_path = kwargs.get('file_path')
        self.file_size = kwargs.get('file_size')
    
    def update_rating(self, new_rating):
        """Update the book's average rating"""
        if self.rating_count == 0:
            self.rating = new_rating
            self.rating_count = 1
        else:
            total_rating = self.rating * self.rating_count
            self.rating_count += 1
            self.rating = (total_rating + new_rating) / self.rating_count
        
        db.session.commit()
    
    def get_purchase_count(self):
        """Get the number of times this book has been purchased"""
        return self.purchases.filter_by(status='completed').count()
    
    def is_purchased_by_user(self, user_id):
        """Check if a specific user has purchased this book"""
        return self.purchases.filter_by(user_id=user_id, status='completed').first() is not None
    
    @staticmethod
    def search(query=None, genre=None, sort_by='title', sort_order='asc', page=1, per_page=20):
        """Search and filter books with pagination"""
        books_query = Book.query.filter_by(is_active=True)
        
        # Apply search filter
        if query:
            search_filter = db.or_(
                Book.title.ilike(f'%{query}%'),
                Book.author.ilike(f'%{query}%'),
                Book.description.ilike(f'%{query}%')
            )
            books_query = books_query.filter(search_filter)
        
        # Apply genre filter
        if genre:
            books_query = books_query.filter_by(genre=genre)
        
        # Apply sorting
        if sort_by == 'title':
            order_column = Book.title
        elif sort_by == 'author':
            order_column = Book.author
        elif sort_by == 'price':
            order_column = Book.price
        elif sort_by == 'rating':
            order_column = Book.rating
        elif sort_by == 'published_date':
            order_column = Book.published_date
        else:
            order_column = Book.title
        
        if sort_order == 'desc':
            order_column = order_column.desc()
        
        books_query = books_query.order_by(order_column)
        
        # Apply pagination
        return books_query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
    
    @staticmethod
    def get_genres():
        """Get all unique genres"""
        return db.session.query(Book.genre).filter_by(is_active=True).distinct().all()
    
    def to_dict(self, include_file_info=False):
        """Convert book object to dictionary"""
        data = {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'description': self.description,
            'price': float(self.price),
            'cover_image': self.cover_image,
            'genre': self.genre,
            'rating': round(self.rating, 1),
            'rating_count': self.rating_count,
            'published_date': self.published_date.isoformat(),
            'purchase_count': self.get_purchase_count()
        }
        
        if include_file_info:
            data.update({
                'file_path': self.file_path,
                'file_size': self.file_size
            })
        
        return data
    
    def __repr__(self):
        return f'<Book {self.title} by {self.author}>'