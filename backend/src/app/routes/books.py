from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import FileResponse
from fastapi.templating import Jinja2Templates
from app.core.Auth import require_auth
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

import os
# templates_dir = os.path.join(
#     os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
#     "templates"
# )
# templates = Jinja2Templates(directory=templates_dir)
from app.utils.logger import logger

router = APIRouter(prefix="/books", tags=["books"])

@router.get("/")
async def get_all_books():
    """Get all available books (public endpoint)"""
    return await get_all_books_controller()


@router.get("/my-books")
@require_auth()
async def get_my_books(request: Request):
    """Get all books that the current user owns"""
    auth0_user_id = request.state.user_id
    return await get_user_books_controller(auth0_user_id)


@router.get("/my-purchases")
@require_auth()
async def get_my_purchases(request: Request):
    """Get all purchase records for the current user"""
    auth0_user_id = request.state.user_id
    return await get_user_purchases_controller(auth0_user_id)


# # 5. Serve the My Books HTML page - BEFORE /{book_id}!
# @router.get("/my-books-page", response_class=HTMLResponse)
# async def my_books_page(request: Request):
#     """Serve the My Books HTML page"""
#     return templates.TemplateResponse("my_books.html", {"request": request})


@router.get("/read/{book_id}")
@require_auth()
async def read_book(request: Request, book_id: int):
    """
    Read/download a book file - DRM PROTECTED!
    Only users who purchased the book can access it.
    """
    auth0_user_id = request.state.user_id
    
    logger.info(f"📖 User {auth0_user_id} requesting book {book_id}")
    
    base_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "private_books"
    )
    
    try:
        file_path = await get_secure_book_path(auth0_user_id, book_id, base_path)
        
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
    
@router.get("/check-ownership/{book_id}")
@require_auth()
async def check_ownership(request: Request, book_id: int):
    """Check if the current user owns a specific book"""
    auth0_user_id = request.state.user_id
    return await check_user_owns_book_controller(auth0_user_id, book_id)


@router.post("/purchase/{book_id}")
@require_auth()
async def purchase_book(request: Request, book_id: int):
    """
    Purchase a book (give user access to it).
    In production, this would be called after payment processing.
    """
    auth0_user_id = request.state.user_id
    return await create_purchase_controller(auth0_user_id, book_id)

@router.get("/{book_id}")
async def get_book(book_id: int):
    """Get details of a specific book (public endpoint)"""
    return await get_book_controller(book_id)


@router.get("/search")
@require_auth()
async def search_books(request: Request, query: str):
    """Search books by title or author"""
    all_books = await get_all_books_controller()
    filtered_books = [
        book for book in all_books
        if query.lower() in book['title'].lower() or (book['author'] and query.lower() in book['author'].lower())
    ]
    return filtered_books

@router.get("/filter/author/{author_name}")
@require_auth()
async def filter_books_by_author(request: Request, author_name: str):
    """Filter books by author name"""
    all_books = await get_all_books_controller()
    filtered_books = [
        book for book in all_books
        if book['author'] and author_name.lower() in book['author'].lower()
    ]
    return filtered_books

@router.get("/filter/genre/{genre_name}")
@require_auth()
async def filter_books_by_genre(request: Request, genre_name: str):
    """Filter books by genre"""
    all_books = await get_all_books_controller()
    filtered_books = [
        book for book in all_books
        if book['genre'] and genre_name.lower() in book['genre'].lower()
    ]
    return filtered_books

@router.get("/genre")
@require_auth()
async def get_all_genres(request: Request):
    """Get a list of all unique genres available in the book store"""
    all_books = await get_all_books_controller()
    genres = set()
    for book in all_books:
        if book['genre']:
            genres.add(book['genre'])
    return list(genres)

@router.get("/author")
@require_auth()
async def get_all_authors(request: Request):
    """Get a list of all unique authors available in the book store"""
    all_books = await get_all_books_controller()
    authors = set()
    for book in all_books:
        if book['author']:
            authors.add(book['author'])
    return list(authors)