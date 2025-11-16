from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.utils.db import Base

class Book(Base):
    """
    Book model representing books available in the store.
    """
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False, index=True)
    author = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    genre = Column(String(100), nullable=True)
    filepath = Column(String(500), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Book(id={self.id}, title='{self.title}', author='{self.author}')>"