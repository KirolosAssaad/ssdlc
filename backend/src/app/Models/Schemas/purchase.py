"""
Purchase Model Schema - OAuth Version
SQLAlchemy model for the purchases table (DRM)
Uses Auth0 user ID instead of local user table
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from app.utils.db import Base  # Adjust this import to match your project!


class Purchase(Base):
    """
    Purchase model representing user ownership of books.
    Uses Auth0 user ID instead of local user table.
    
    If a record exists with (auth0_user_id, book_id), the user owns the book.
    """
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    auth0_user_id = Column(String(255), nullable=False, index=True)  # Auth0 'sub' field
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    purchase_date = Column(DateTime(timezone=True), server_default=func.now())

    # Ensure a user can't "purchase" the same book twice
    __table_args__ = (
        UniqueConstraint('auth0_user_id', 'book_id', name='unique_user_book_purchase'),
    )

    def __repr__(self):
        return f"<Purchase(id={self.id}, auth0_user_id='{self.auth0_user_id}', book_id={self.book_id})>"