from fastapi import APIRouter, Query, Request, HTTPException, status
from typing import Optional
from app.dao.book_search import BookSearchDAO
from app.utils.logger import logger
from pydantic import BaseModel, ConfigDict

class BookResponse(BaseModel):
    """Response model for individual book."""
    id: int
    title: str
    author: str
    description: Optional[str] = None
    isbn: str
    price: float
    rating: float
    is_available: bool
    model_config = ConfigDict(from_attributes=True)


class SearchResponse(BaseModel):
    """Response model for search results."""
    query: str
    results: list[BookResponse]
    total: int
    limit: int
    offset: int
    has_more: bool


# Initialize router
router = APIRouter(prefix="/search", tags=["search"])


@router.get("/books", response_model=SearchResponse)
async def search_books(
    q: str = Query(
        ..., 
        min_length=1, 
        max_length=255,
        description="Search query",
        examples={"example": {"value": "The Great Gatsby"}}
    ),
    limit: int = Query(20, ge=1, le=100, description="Results per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    category: Optional[str] = Query(None, max_length=100),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    sort_by: str = Query(
        "relevance",
        pattern="^(relevance|price_asc|price_desc|rating)$"
    ),
    request: Request = None,
) -> SearchResponse:
    """
    Search books with optional filtering and sorting.
    
    Security: All inputs validated, results limited to available books,
    parameterized queries prevent SQL injection.
    """
    try:
        # Validate price filters
        if min_price is not None and max_price is not None:
            if min_price > max_price:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="min_price cannot be greater than max_price"
                )
        
        # Execute search
        books, total_count = await BookSearchDAO.search_books(
            query=q,
            limit=limit,
            offset=offset,
            category=category,
            min_price=min_price,
            max_price=max_price,
            sort_by=sort_by
        )
        
        # Safe logging (no PII)
        logger.info(
            f"Search endpoint: query_length={len(q)}, results={len(books)}, "
            f"filters_applied={bool(category or min_price or max_price)}"
        )
        
        # Build response
        book_responses = [BookResponse.from_orm(book) for book in books]
        
        return SearchResponse(
            query=q,
            results=book_responses,
            total=total_count,
            limit=limit,
            offset=offset,
            has_more=(offset + limit) < total_count
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Search endpoint error: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Search failed"
        )


@router.get("/books/{book_id}", response_model=BookResponse)
async def get_book(book_id: int) -> BookResponse:
    """Retrieve a specific book by ID."""
    book = await BookSearchDAO.get_book_by_id(book_id)
    return BookResponse.from_orm(book)


@router.get("/categories")
async def get_categories() -> dict:
    """
    Get list of available book categories.
    TODO: Implement with caching for performance.
    """
    return {"categories": []}