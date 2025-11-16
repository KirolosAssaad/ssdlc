"""
Book Controller - OAuth Version
Handles business logic for book operations and DRM checks
Uses Auth0 user IDs
"""

from fastapi import HTTPException, status
from app.utils.logger import logger
from app.dao.book import (
    get_book_by_id,
    get_all_books,
    get_books_by_user,
    check_user_owns_book,
    get_book_filepath,
    create_purchase,
    get_all_purchases_by_user
)
import os
from typing import List, Dict


# ==================================================================
# --- BOOK RETRIEVAL CONTROLLERS ---
# ==================================================================

async def get_book_controller(book_id: int):
    """
    Get a single book by ID.
    
    Args:
        book_id: The ID of the book
        
    Returns:
        Book information
    """
    try:
        book = await get_book_by_id(book_id)
        return {
            "id": book.id,
            "title": book.title,
            "author": book.author if hasattr(book, 'author') else "Unknown",
            "description": book.description if hasattr(book, 'description') else "",
            "genre": book.genre if hasattr(book, 'genre') else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving book {book_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve book."
        ) from e


async def get_all_books_controller():
    """Get all available books."""
    try:
        print("🔍 DEBUG: Starting get_all_books_controller")
        books = await get_all_books()
        print(f"🔍 DEBUG: Retrieved {len(books)} books")
        
        result = [
            {
                "id": book.id,
                "title": book.title,
                "author": book.author if hasattr(book, 'author') else "Unknown",
                "description": book.description if hasattr(book, 'description') else "",
                "genre": book.genre if hasattr(book, 'genre') else None,
            }
            for book in books
        ]
        print(f"🔍 DEBUG: Returning {len(result)} books")
        return result
    except Exception as e:
        print(f"❌ ERROR in get_all_books_controller: {e}")
        print(f"❌ ERROR type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve books."
        ) from e
    
async def get_user_books_controller(user_id: str):
    """
    Get all books that a user owns (purchased).
    
    Args:
        user_id: The Auth0 user ID
        
    Returns:
        List of books the user owns
    """
    try:
        books = await get_books_by_user(user_id)
        return [
            {
                "id": book.id,
                "title": book.title,
                "author": book.author if hasattr(book, 'author') else "Unknown",
                "description": book.description if hasattr(book, 'description') else "",
                "genre": book.genre if hasattr(book, 'genre') else None,
            }
            for book in books
        ]
    except Exception as e:
        print("ERORRRR")
        logger.error(f"Error retrieving user books: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user books."
        ) from e


# ==================================================================
# --- DRM CONTROLLER (THE IMPORTANT ONE!) ---
# ==================================================================

async def authorize_book_access(user_id: str, book_id: int) -> Dict:
    """
    Authorize a user's access to a book (DRM check).
    This is called before serving the book file.
    
    Args:
        user_id: The Auth0 user ID requesting access
        book_id: The ID of the book being requested
        
    Returns:
        Dictionary with authorization result and file path
        
    Raises:
        HTTPException: If user doesn't own the book (403 Forbidden)
    """
    logger.info(f"🔐 DRM Check: User {user_id} requesting access to book {book_id}")
    
    # Step 1: Check if user owns the book
    try:
        owns_book = await check_user_owns_book(user_id, book_id)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking book ownership: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify book ownership."
        ) from e
    
    # Step 2: If user doesn't own the book, deny access
    if not owns_book:
        logger.warning(f"❌ ACCESS DENIED: User {user_id} tried to access book {book_id} without purchase")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Purchase required to access this book."
        )
    
    # Step 3: User owns the book, get the file path
    logger.info(f"✅ ACCESS GRANTED: User {user_id} authorized for book {book_id}")
    
    try:
        filepath = await get_book_filepath(book_id)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving book filepath: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve book file information."
        ) from e
    
    return {
        "authorized": True,
        "filepath": filepath,
        "book_id": book_id,
        "user_id": user_id
    }


async def get_secure_book_path(user_id: str, book_id: int, base_path: str) -> str:
    """
    Get the secure file path for a book after DRM authorization.
    Prevents path traversal attacks.
    
    Args:
        user_id: The Auth0 user ID
        book_id: The ID of the book
        base_path: The base directory where books are stored
        
    Returns:
        The full, secure path to the book file
        
    Raises:
        HTTPException: If unauthorized or file not found
    """
    # Authorize access first (DRM check)
    auth_result = await authorize_book_access(user_id, book_id)
    
    # Get the filename and sanitize it (prevent path traversal)
    filename = os.path.basename(auth_result["filepath"])
    
    # Construct full path
    full_path = os.path.join(base_path, filename)
    
    # Verify file exists
    if not os.path.exists(full_path):
        logger.error(f"❌ FILE NOT FOUND: {full_path}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Book file is missing from server."
        )
    
    logger.info(f"📖 Serving book from: {full_path}")
    return full_path


# ==================================================================
# --- PURCHASE CONTROLLER ---
# ==================================================================

async def create_purchase_controller(user_id: str, book_id: int):
    """
    Create a purchase (give user access to a book).
    In a real app, this would be called after payment processing.
    
    Args:
        user_id: The Auth0 user ID
        book_id: The ID of the book
        
    Returns:
        Success message
    """
    try:
        # Verify book exists
        book = await get_book_by_id(book_id)
        
        # Create the purchase
        purchase = await create_purchase(user_id, book_id)
        
        logger.info(f"✅ Purchase completed: User {user_id} now owns '{book.title}'")
        
        return {
            "status": "success",
            "message": f"Successfully purchased '{book.title}'",
            "book_id": book_id,
            "purchase_id": purchase.id if hasattr(purchase, 'id') else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating purchase: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete purchase."
        ) from e


async def check_user_owns_book_controller(user_id: str, book_id: int):
    """
    Check if a user owns a specific book.
    
    Args:
        user_id: The Auth0 user ID
        book_id: The ID of the book
        
    Returns:
        Dictionary with ownership status
    """
    try:
        owns_book = await check_user_owns_book(user_id, book_id)
        return {
            "user_id": user_id,
            "book_id": book_id,
            "owns_book": owns_book
        }
    except Exception as e:
        logger.error(f"Error checking book ownership: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check book ownership."
        ) from e


async def get_user_purchases_controller(user_id: str):
    """
    Get all purchases for a user.
    
    Args:
        user_id: The Auth0 user ID
        
    Returns:
        List of purchase records with book details
    """
    try:
        purchases = await get_all_purchases_by_user(user_id)
        
        result = []
        for purchase in purchases:
            # Get book details
            book = await get_book_by_id(purchase.book_id)
            result.append({
                "purchase_id": purchase.id if hasattr(purchase, 'id') else None,
                "book_id": purchase.book_id,
                "book_title": book.title,
                "book_author": book.author if hasattr(book, 'author') else "Unknown",
                "purchased_at": purchase.purchase_date.isoformat() if hasattr(purchase, 'purchase_date') else None
            })
        
        return result
        
    except Exception as e:
        logger.error(f"Error retrieving user purchases: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve purchases."
        ) from e