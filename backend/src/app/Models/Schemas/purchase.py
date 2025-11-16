from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from app.utils.db import Base


class Purchase(Base):
    """
    Purchase model representing user ownership of books.
    Uses Auth0 user ID instead of local user table.
    
    If a record exists with (user_id, book_id), the user owns the book.
    """
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(255), nullable=False, index=True)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    purchase_date = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint('user_id', 'book_id', name='unique_user_book_purchase'),
    )

    def __repr__(self):
        return f"<Purchase(id={self.id}, user_id='{self.user_id}', book_id={self.book_id})>"