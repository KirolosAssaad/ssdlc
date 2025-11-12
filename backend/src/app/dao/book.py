"""
Book DAO (Data Access Object) - OAuth Version
Handles all database operations for books and purchases (DRM)
Uses Auth0 user IDs instead of local user table
"""

from app.utils.db import get_session
from app.utils.logger import logger
from sqlalchemy.future import select
from fastapi import HTTPException, status
from typing import Optional, List


# ==================================================================
# --- BOOK DAO FUNCTIONS ---
# ==================================================================

async def get_book_by_id(book_id: int):
    """
    Retrieve a book by its ID.
    
    Args:
        book_id: The ID of the book to retrieve
        
    Returns:
        Book object if found
        
    Raises:
        HTTPException: If book not found
    """
    from app.Models.Schemas.book import Book
    
    async with get_session() as session:
        result = await session.execute(
            select(Book).where(Book.id == book_id)
        )
        book = result.scalars().first()
        
        if not book:
            logger.warning(f"Book not found: {book_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book not found."
            )
        
        return book


async def get_all_books():
    """
    Retrieve all books from the database.
    
    Returns:
        List of all books
    """
    from app.Models.Schemas.book import Book
    
    async with get_session() as session:
        result = await session.execute(select(Book))
        books = result.scalars().all()
        logger.info(f"Retrieved {len(books)} books")
        return books


async def get_books_by_user(auth0_user_id: str):
    """
    Retrieve all books that a user has purchased (owns).
    
    Args:
        auth0_user_id: The Auth0 user ID (from JWT 'sub' field)
        
    Returns:
        List of books the user owns
    """
    from app.Models.Schemas.book import Book
    from app.Models.Schemas.purchase import Purchase
    
    async with get_session() as session:
        # Join books with purchases to get books owned by user
        result = await session.execute(
            select(Book)
            .join(Purchase, Purchase.book_id == Book.id)
            .where(Purchase.auth0_user_id == auth0_user_id)
        )
        books = result.scalars().all()
        logger.info(f"User {auth0_user_id} owns {len(books)} books")
        return books


# ==================================================================
# --- DRM / PURCHASE CHECK FUNCTIONS ---
# ==================================================================

async def check_user_owns_book(auth0_user_id: str, book_id: int) -> bool:
    """
    Check if a user has purchased (owns) a specific book.
    This is the core DRM check!
    
    Args:
        auth0_user_id: The Auth0 user ID (from JWT 'sub' field, e.g., "auth0|12345")
        book_id: The ID of the book
        
    Returns:
        True if user owns the book, False otherwise
    """
    from app.Models.Schemas.purchase import Purchase
    
    try:
        async with get_session() as session:
            result = await session.execute(
                select(Purchase).where(
                    Purchase.auth0_user_id == auth0_user_id,
                    Purchase.book_id == book_id
                )
            )
            purchase = result.scalars().first()
            
            owns_book = purchase is not None
            
            if owns_book:
                logger.info(f"✅ DRM CHECK PASSED: User {auth0_user_id} owns book {book_id}")
            else:
                logger.warning(f"❌ DRM CHECK FAILED: User {auth0_user_id} does not own book {book_id}")
            
            return owns_book
            
    except Exception as e:
        logger.error(f"Error checking book ownership: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify book ownership."
        ) from e


async def get_purchase_record(auth0_user_id: str, book_id: int):
    """
    Get the purchase record for a user and book.
    
    Args:
        auth0_user_id: The Auth0 user ID
        book_id: The ID of the book
        
    Returns:
        Purchase record if found, None otherwise
    """
    from app.Models.Schemas.purchase import Purchase
    
    async with get_session() as session:
        result = await session.execute(
            select(Purchase).where(
                Purchase.auth0_user_id == auth0_user_id,
                Purchase.book_id == book_id
            )
        )
        return result.scalars().first()


async def create_purchase(auth0_user_id: str, book_id: int):
    """
    Create a purchase record (give user access to a book).
    
    Args:
        auth0_user_id: The Auth0 user ID
        book_id: The ID of the book
        
    Returns:
        The created purchase record
    """
    from app.Models.Schemas.purchase import Purchase
    
    # First check if purchase already exists
    existing_purchase = await get_purchase_record(auth0_user_id, book_id)
    if existing_purchase:
        logger.warning(f"Purchase already exists: user {auth0_user_id}, book {book_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already owns this book."
        )
    
    # Verify book exists
    book = await get_book_by_id(book_id)
    
    # Create purchase
    purchase = Purchase(
        auth0_user_id=auth0_user_id,
        book_id=book_id
    )
    
    try:
        async with get_session() as session:
            session.add(purchase)
            await session.commit()
            await session.refresh(purchase)
            logger.info(f"✅ Purchase created: User {auth0_user_id} now owns book {book_id}")
    except Exception as e:
        await session.rollback()
        logger.error(f"Error creating purchase: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create purchase."
        ) from e
    
    return purchase


async def get_all_purchases_by_user(auth0_user_id: str):
    """
    Get all purchases for a specific user.
    
    Args:
        auth0_user_id: The Auth0 user ID
        
    Returns:
        List of purchase records
    """
    from app.Models.Schemas.purchase import Purchase
    
    async with get_session() as session:
        result = await session.execute(
            select(Purchase).where(Purchase.auth0_user_id == auth0_user_id)
        )
        purchases = result.scalars().all()
        logger.info(f"User {auth0_user_id} has {len(purchases)} purchases")
        return purchases


# ==================================================================
# --- FILE PATH HELPERS ---
# ==================================================================

async def get_book_filepath(book_id: int) -> str:
    """
    Get the file path for a book.
    
    Args:
        book_id: The ID of the book
        
    Returns:
        The filepath string
        
    Raises:
        HTTPException: If book not found
    """
    book = await get_book_by_id(book_id)
    
    if not book.filepath:
        logger.error(f"Book {book_id} has no filepath")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Book file configuration error."
        )
    
    return book.filepath