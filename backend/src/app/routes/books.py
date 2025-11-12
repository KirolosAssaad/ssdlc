from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import FileResponse
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from app.core.Auth import require_auth, get_current_user_id
from app.controllers.book import (
    get_all_books_controller,
    get_book_controller,
    get_user_books_controller,
    authorize_book_access,
    get_secure_book_path,
    create_purchase_controller,
    check_user_owns_book_controller,
    get_user_purchases_controller
)
# Setup templates
import os
templates_dir = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "templates"
)
templates = Jinja2Templates(directory=templates_dir)
from app.utils.logger import logger

router = APIRouter(prefix="/books", tags=["books"])

# IMPORTANT: Specific routes FIRST, parameterized routes LAST!

# 1. Public endpoint - Get all books
@router.get("/")
async def get_all_books():
    """Get all available books (public endpoint)"""
    return await get_all_books_controller()


# 2. Debug endpoint (protected)
@router.get("/debug-auth")
@require_auth()
async def debug_auth(request: Request):
    """Debug endpoint to see Auth0 user info"""
    return {
        "user_id": getattr(request.state, "user_id", "NOT FOUND"),
        "user_email": getattr(request.state, "user_email", "NOT FOUND"),
        "has_user_id": hasattr(request.state, "user_id"),
    }


# 3. Get user's books (protected)
@router.get("/my-books")
@require_auth()
async def get_my_books(request: Request):  # ← Already correct
    """Get all books that the current user owns"""
    auth0_user_id = get_current_user_id(request)
    return await get_user_books_controller(auth0_user_id)


# 4. Get user's purchases (protected)
@router.get("/my-purchases")
@require_auth()
async def get_my_purchases(request: Request):  # ← Already correct
    """Get all purchase records for the current user"""
    auth0_user_id = get_current_user_id(request)
    return await get_user_purchases_controller(auth0_user_id)


# 5. Serve the My Books HTML page - BEFORE /{book_id}!
@router.get("/my-books-page", response_class=HTMLResponse)
async def my_books_page(request: Request):
    """Serve the My Books HTML page"""
    return templates.TemplateResponse("my_books.html", {"request": request})


# 6. Read a book - DRM PROTECTED! (protected)
@router.get("/read/{book_id}")
@require_auth()
async def read_book(request: Request, book_id: int):  # ← Request MUST come first!
    """
    Read/download a book file - DRM PROTECTED!
    Only users who purchased the book can access it.
    """
    auth0_user_id = get_current_user_id(request)
    
    logger.info(f"📖 User {auth0_user_id} requesting book {book_id}")
    
    # Get the secure file path (includes DRM check)
    base_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "private_books"
    )
    
    try:
        file_path = await get_secure_book_path(auth0_user_id, book_id, base_path)
        
        # Serve the file
        return FileResponse(
            path=file_path,
            media_type="application/pdf",
            filename=os.path.basename(file_path)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving book: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to serve book file."
        )
    
# 7. Check ownership (protected)
@router.get("/check-ownership/{book_id}")
@require_auth()
async def check_ownership(request: Request, book_id: int):  # ← Request first!
    """Check if the current user owns a specific book"""
    auth0_user_id = get_current_user_id(request)
    return await check_user_owns_book_controller(auth0_user_id, book_id)


# 8. Purchase a book (protected)
@router.post("/purchase/{book_id}")
@require_auth()
async def purchase_book(request: Request, book_id: int):  # ← Request first!
    """
    Purchase a book (give user access to it).
    In production, this would be called after payment processing.
    """
    auth0_user_id = get_current_user_id(request)
    return await create_purchase_controller(auth0_user_id, book_id)

# 9. Get single book details - THIS MUST BE LAST!
@router.get("/{book_id}")
async def get_book(book_id: int):
    """Get details of a specific book (public endpoint)"""
    return await get_book_controller(book_id)