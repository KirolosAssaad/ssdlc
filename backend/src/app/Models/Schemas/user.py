from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import Column, String, Integer, BigInteger, Text, DateTime, ForeignKey, Table, Index, func, Enum
from sqlalchemy.dialects.postgresql import INET


class Base(DeclarativeBase):
    pass


# --- Association table for many-to-many
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", Integer, ForeignKey(
        "users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", Integer, ForeignKey(
        "roles.id", ondelete="CASCADE"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)  # matches SERIAL
    username: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False)
    first_name: Mapped[str] = mapped_column(String(255), nullable=False)
    last_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    salt: Mapped[str] = mapped_column(String(255), nullable=False)
    mfa_secret: Mapped[str | None] = mapped_column(String(64))
    created_at: Mapped["DateTime"] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False)

    roles: Mapped[list["Role"]] = relationship(
        "Role", secondary=user_roles, back_populates="users")
    sessions: Mapped[list["Session"]] = relationship(
        "Session", back_populates="user", cascade="all, delete-orphan")
    password_resets: Mapped[list["PasswordReset"]] = relationship(
        "PasswordReset", back_populates="user", cascade="all, delete-orphan")


class UserType(Base):
    __tablename__ = "user_types"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)
    type_name: Mapped[str] = mapped_column(
        Enum('cloud', 'native', name='user_type_enum'), unique=True, nullable=False
    )


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)
    role_name: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False)

    users: Mapped[list["User"]] = relationship(
        "User", secondary=user_roles, back_populates="roles"
    )


class PasswordReset(Base):
    __tablename__ = "password_resets"

    id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, autoincrement=True)  # BIGSERIAL
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    token_hash: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    expires_at: Mapped["DateTime"] = mapped_column(
        DateTime(timezone=True), nullable=False)
    created_at: Mapped["DateTime"] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False)
    used_at: Mapped["DateTime | None"] = mapped_column(DateTime(timezone=True))
    request_ip: Mapped[str | None] = mapped_column(INET)
    user_agent: Mapped[str | None] = mapped_column(Text)

    user: Mapped["User"] = relationship(
        "User", back_populates="password_resets")


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)  # SERIAL
    token: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped["DateTime"] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at: Mapped["DateTime | None"] = mapped_column(
        DateTime(timezone=True))

    user: Mapped["User"] = relationship("User", back_populates="sessions")


# Helpful index (optional)
Index("ix_sessions_user_id_expires_at", Session.user_id, Session.expires_at)

from sqlalchemy import Float, Boolean, Text, Index, func
from sqlalchemy.dialects.postgresql import TSVECTOR
from datetime import datetime

# Add these models to your existing user.py file

class Book(Base):
    """Enhanced book schema with full-text search support."""
    __tablename__ = "books"
    
    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    title: Mapped[str] = mapped_column(
        String(500), nullable=False, index=True
    )
    author: Mapped[str] = mapped_column(
        String(255), nullable=False, index=True
    )
    description: Mapped[str] = mapped_column(Text)
    isbn: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False
    )
    price: Mapped[float] = mapped_column(Float, nullable=False)
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    publication_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    is_available: Mapped[bool] = mapped_column(
        Boolean, default=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), onupdate=func.now()
    )
    
    # Full-text search vector (PostgreSQL specific)
    search_vector: Mapped[str] = mapped_column(
        TSVECTOR, nullable=True, index=True
    )
    
    # Composite indexes
    __table_args__ = (
        Index('ix_books_title_author', 'title', 'author'),
        Index('ix_books_is_available_rating', 'is_available', 'rating'),
    )


class BookCategory(Base):
    """Book categorization for filtered searches."""
    __tablename__ = "book_categories"
    
    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    book_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("books.id", ondelete="CASCADE")
    )
    category: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True
    )
    
    __table_args__ = (
        Index('ix_book_id_category', 'book_id', 'category'),
    )