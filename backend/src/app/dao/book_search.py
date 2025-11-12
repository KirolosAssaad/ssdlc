from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.future import select
from app.Models.Schemas.user import Book, BookCategory
from app.utils.db import get_session
from app.utils.logger import logger
from fastapi import HTTPException, status
from typing import Optional, List, Tuple
import re


class BookSearchDAO:
    """Data Access Object for secure book searches."""
    
    MAX_SEARCH_QUERY_LENGTH = 255
    MAX_RESULTS = 100
    DEFAULT_LIMIT = 20
    
    @staticmethod
    async def validate_and_sanitize_query(query: str) -> str:
        """
        Validate search query against injection and abuse patterns.
        Raises ValueError if validation fails.
        """
        if not query or len(query.strip()) == 0:
            raise ValueError("Search query cannot be empty")
        
        query = query.strip()
        
        if len(query) > BookSearchDAO.MAX_SEARCH_QUERY_LENGTH:
            raise ValueError(
                f"Search query exceeds {BookSearchDAO.MAX_SEARCH_QUERY_LENGTH} characters"
            )
        
        # Block obvious SQL injection patterns
        dangerous_patterns = ['--', '/*', '*/', 'xp_', 'sp_', ';', '\\x00']
        if any(pattern in query.lower() for pattern in dangerous_patterns):
            logger.warning(f"Suspicious search pattern detected in query")
            raise ValueError("Invalid characters in search query")
        
        # Allow only alphanumeric, spaces, and common punctuation
        if not re.match(r'^[a-zA-Z0-9\s\-&.,\'":?!]+$', query):
            logger.warning(f"Invalid characters in search")
            raise ValueError("Search contains invalid characters")
        
        return query
    
    @staticmethod
    async def search_books(
        query: str,
        limit: int = DEFAULT_LIMIT,
        offset: int = 0,
        category: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        sort_by: str = "relevance"
    ) -> Tuple[List[Book], int]:
        """
        Execute secure, parameterized book search.
        Returns: (books, total_count)
        """
        try:
            # Validate inputs
            query = await BookSearchDAO.validate_and_sanitize_query(query)
            
            if limit < 1 or limit > BookSearchDAO.MAX_RESULTS:
                limit = BookSearchDAO.DEFAULT_LIMIT
            
            if offset < 0:
                offset = 0
            
            # Validate sort parameter
            valid_sorts = {"relevance", "price_asc", "price_desc", "rating"}
            if sort_by not in valid_sorts:
                sort_by = "relevance"
            
            async with get_session() as session:
                # Build query with parameterization
                search_query = select(Book).where(
                    and_(
                        Book.is_available == True,
                        or_(
                            Book.title.ilike(f"%{query}%"),
                            Book.author.ilike(f"%{query}%"),
                            Book.description.ilike(f"%{query}%")
                        )
                    )
                )
                
                # Apply price filters if provided
                if min_price is not None:
                    search_query = search_query.where(Book.price >= min_price)
                
                if max_price is not None:
                    search_query = search_query.where(Book.price <= max_price)
                
                # Apply category filter if provided
                if category:
                    category = category.strip()
                    search_query = search_query.join(BookCategory).where(
                        BookCategory.category == category
                    )
                
                # Apply sorting
                if sort_by == "price_asc":
                    search_query = search_query.order_by(Book.price)
                elif sort_by == "price_desc":
                    search_query = search_query.order_by(desc(Book.price))
                elif sort_by == "rating":
                    search_query = search_query.order_by(desc(Book.rating))
                else:  # relevance
                    search_query = search_query.order_by(desc(Book.rating))
                
                # Get total count
                count_query = select(func.count()).select_from(Book).where(
                    and_(
                        Book.is_available == True,
                        or_(
                            Book.title.ilike(f"%{query}%"),
                            Book.author.ilike(f"%{query}%"),
                            Book.description.ilike(f"%{query}%")
                        )
                    )
                )
                
                total_count = await session.scalar(count_query)
                
                # Apply pagination
                search_query = search_query.limit(limit).offset(offset)
                
                # Execute search
                result = await session.execute(search_query)
                books = result.scalars().all()
                
                logger.info(
                    f"Search executed: query_length={len(query)}, "
                    f"results={len(books)}, total={total_count}"
                )
                
                return books, total_count
                
        except ValueError as e:
            logger.warning(f"Search validation error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except Exception as e:
            logger.error(f"Unexpected search error: {type(e).__name__}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Search operation failed"
            )
    
    @staticmethod
    async def get_book_by_id(book_id: int) -> Book:
        """Retrieve a single book by ID."""
        try:
            if not isinstance(book_id, int) or book_id <= 0:
                raise ValueError("Invalid book ID")
            
            async with get_session() as session:
                result = await session.execute(
                    select(Book).where(Book.id == book_id)
                )
                book = result.scalars().first()
                
                if not book:
                    logger.warning(f"Book not found with ID")
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Book not found"
                    )
                
                return book
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error retrieving book: {type(e).__name__}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve book"
            )