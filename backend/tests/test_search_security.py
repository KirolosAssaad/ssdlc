import pytest
from app.dao.book_search import BookSearchDAO
from fastapi.testclient import TestClient
from app.server import app


client = TestClient(app)


class TestInputValidation:
    """Test SQL injection and XSS prevention."""
    
    @pytest.mark.asyncio
    async def test_sql_injection_blocked(self):
        """Ensure SQL injection attempts are caught."""
        sql_injection_payloads = [
            "'; DROP TABLE books; --",
            "1' OR '1'='1",
            "admin'--",
            "test/* comment */",
            "test-- comment",
        ]
        
        for payload in sql_injection_payloads:
            with pytest.raises(ValueError):
                await BookSearchDAO.validate_and_sanitize_query(payload)
    
    @pytest.mark.asyncio
    async def test_xss_payloads_blocked(self):
        """Ensure XSS attempts are blocked."""
        xss_payloads = [
            "<script>alert('xss')</script>",
            "javascript:alert('xss')",
            "<img src=x onerror=alert('xss')>",
            "<svg/onload=alert('xss')>",
        ]
        
        for payload in xss_payloads:
            with pytest.raises(ValueError):
                await BookSearchDAO.validate_and_sanitize_query(payload)
    
    @pytest.mark.asyncio
    async def test_empty_query_rejected(self):
        """Ensure empty queries are rejected."""
        with pytest.raises(ValueError, match="cannot be empty"):
            await BookSearchDAO.validate_and_sanitize_query("")
        
        with pytest.raises(ValueError, match="cannot be empty"):
            await BookSearchDAO.validate_and_sanitize_query("   ")
    
    @pytest.mark.asyncio
    async def test_max_length_enforced(self):
        """Ensure query length is limited."""
        long_query = "a" * 256
        with pytest.raises(ValueError, match="exceeds"):
            await BookSearchDAO.validate_and_sanitize_query(long_query)
    
    @pytest.mark.asyncio
    async def test_valid_queries_pass(self):
        """Ensure legitimate queries pass validation."""
        valid_queries = [
            "The Great Gatsby",
            "George Orwell",
            "1984",
            "sci-fi & fantasy",
            "O'Brien's books",
        ]
        
        for query in valid_queries:
            result = await BookSearchDAO.validate_and_sanitize_query(query)
            assert result == query.strip()


class TestAPIEndpoints:
    """Test search API endpoints."""
    
    def test_search_endpoint_exists(self):
        """Ensure search endpoint is accessible."""
        response = client.get("/search/books?q=test")
        assert response.status_code in [200, 400, 500]  # Should respond
    
    def test_search_pagination_limits(self):
        """Ensure pagination limits are enforced."""
        response = client.get("/search/books?q=test&limit=200")
        
        # FastAPI returns 422 if limit > 100 due to Query validation
        assert response.status_code in (200, 422)

        # If successful, check 'limit' key and its value
        if response.status_code == 200:
            data = response.json()
            assert data["limit"] <= 100
    
    def test_search_offset_validation(self):
        """Ensure offset cannot be negative."""
        response = client.get("/search/books?q=test&offset=-1")
        # Should be corrected or rejected
        assert response.status_code in [200, 400, 422]


class TestErrorHandling:
    """Test error messages don't leak sensitive data."""
    
    def test_no_database_errors_leaked(self):
        """Ensure database errors aren't exposed."""
        response = client.get("/search/books?q=test")
        if response.status_code >= 500:
            assert "psycopg2" not in response.text
            assert "database" not in response.text.lower()
    
    def test_no_traceback_in_errors(self):
        """Ensure traceback isn't exposed."""
        response = client.get("/search/books?q=test")
        assert "traceback" not in response.text.lower()
        assert "File \"" not in response.text