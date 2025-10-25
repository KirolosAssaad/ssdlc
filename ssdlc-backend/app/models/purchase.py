from datetime import datetime
from app import db
import uuid

class Purchase(db.Model):
    __tablename__ = 'purchases'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    book_id = db.Column(db.String(36), db.ForeignKey('books.id'), nullable=False)
    purchase_price = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='pending', nullable=False)  # pending, completed, failed, refunded
    transaction_id = db.Column(db.String(100), nullable=True)  # External payment processor transaction ID
    download_count = db.Column(db.Integer, default=0, nullable=False)
    max_downloads = db.Column(db.Integer, default=5, nullable=False)  # Limit downloads per purchase
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Add composite index for user_id and book_id
    __table_args__ = (
        db.Index('idx_user_book', 'user_id', 'book_id'),
    )
    
    def __init__(self, user_id, book_id, purchase_price, payment_method, **kwargs):
        self.user_id = user_id
        self.book_id = book_id
        self.purchase_price = purchase_price
        self.payment_method = payment_method
        self.transaction_id = kwargs.get('transaction_id')
        self.status = kwargs.get('status', 'pending')
        self.max_downloads = kwargs.get('max_downloads', 5)
    
    def complete_purchase(self, transaction_id=None):
        """Mark the purchase as completed"""
        self.status = 'completed'
        if transaction_id:
            self.transaction_id = transaction_id
        db.session.commit()
    
    def fail_purchase(self, reason=None):
        """Mark the purchase as failed"""
        self.status = 'failed'
        db.session.commit()
    
    def refund_purchase(self):
        """Mark the purchase as refunded"""
        self.status = 'refunded'
        db.session.commit()
    
    def can_download(self):
        """Check if the user can still download this book"""
        return (
            self.status == 'completed' and 
            self.download_count < self.max_downloads
        )
    
    def increment_download_count(self):
        """Increment the download count"""
        if self.can_download():
            self.download_count += 1
            db.session.commit()
            return True
        return False
    
    @staticmethod
    def get_user_purchases(user_id, status=None):
        """Get all purchases for a user"""
        query = Purchase.query.filter_by(user_id=user_id)
        if status:
            query = query.filter_by(status=status)
        return query.order_by(Purchase.created_at.desc()).all()
    
    @staticmethod
    def get_book_purchases(book_id, status=None):
        """Get all purchases for a book"""
        query = Purchase.query.filter_by(book_id=book_id)
        if status:
            query = query.filter_by(status=status)
        return query.order_by(Purchase.created_at.desc()).all()
    
    @staticmethod
    def user_has_purchased_book(user_id, book_id):
        """Check if a user has successfully purchased a book"""
        return Purchase.query.filter_by(
            user_id=user_id, 
            book_id=book_id, 
            status='completed'
        ).first() is not None
    
    def to_dict(self):
        """Convert purchase object to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'book_id': self.book_id,
            'purchase_price': float(self.purchase_price),
            'payment_method': self.payment_method,
            'status': self.status,
            'transaction_id': self.transaction_id,
            'download_count': self.download_count,
            'max_downloads': self.max_downloads,
            'can_download': self.can_download(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Purchase {self.id}: User {self.user_id} -> Book {self.book_id}>'