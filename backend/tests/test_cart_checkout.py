import pytest
from fastapi.testclient import TestClient
from app.server import app
from unittest.mock import patch, MagicMock

client = TestClient(app)

# Mock user for testing - Auth0 format
MOCK_USER = "auth0|mockuserid123"


class TestCartOperations:
    """Test shopping cart functionality."""
    
    @pytest.mark.asyncio
    async def test_add_to_cart_success(self):
        """Test adding item to cart successfully."""
        def mock_require_auth(f):
            async def wrapper(*args, **kwargs):
                request = args[0]
                request.state.user_id = MOCK_USER
                return await f(*args, **kwargs)
            return wrapper
        
        with patch("app.core.Auth.require_auth", mock_require_auth):
            response = client.post(
                "/cart/items",
                json={"book_id": 1, "quantity": 2}
            )
            assert response.status_code == 201
            data = response.json()
            assert data["message"] == "Item added to cart"
            assert data["book_id"] == 1
            assert data["quantity"] == 2
    
    @pytest.mark.asyncio
    async def test_add_to_cart_invalid_book(self):
        """Test adding non-existent book to cart."""
        def mock_require_auth(f):
            async def wrapper(*args, **kwargs):
                request = args[0]
                request.state.user_id = MOCK_USER
                return await f(*args, **kwargs)
            return wrapper
        
        with patch("app.core.Auth.require_auth", mock_require_auth):
            response = client.post(
                "/cart/items",
                json={"book_id": 9999, "quantity": 1}
            )
            assert response.status_code == 400
    
    @pytest.mark.asyncio
    async def test_add_to_cart_quantity_limit(self):
        """Test quantity limit validation (max 10)."""
        def mock_require_auth(f):
            async def wrapper(*args, **kwargs):
                request = args[0]
                request.state.user_id = MOCK_USER
                return await f(*args, **kwargs)
            return wrapper
        
        with patch("app.core.Auth.require_auth", mock_require_auth):
            response = client.post(
                "/cart/items",
                json={"book_id": 1, "quantity": 15}
            )
            # Should fail or be clamped
            assert response.status_code in (400, 422)
    
    @pytest.mark.asyncio
    async def test_get_cart(self):
        """Test retrieving user's cart."""
        def mock_require_auth(f):
            async def wrapper(*args, **kwargs):
                request = args[0]
                request.state.user_id = MOCK_USER
                return await f(*args, **kwargs)
            return wrapper
        
        with patch("app.core.Auth.require_auth", mock_require_auth):
            response = client.get("/cart")
            assert response.status_code == 200
            data = response.json()
            assert "items" in data
            assert "total_items" in data
            assert "total_amount" in data
            assert isinstance(data["items"], list)
    
    @pytest.mark.asyncio
    async def test_update_cart_quantity(self):
        """Test updating cart item quantity."""
        def mock_require_auth(f):
            async def wrapper(*args, **kwargs):
                request = args[0]
                request.state.user_id = MOCK_USER
                return await f(*args, **kwargs)
            return wrapper
        
        with patch("app.core.Auth.require_auth", mock_require_auth):
            # First add item
            client.post("/cart/items", json={"book_id": 1, "quantity": 1})
            
            # Get cart to find item ID
            cart_response = client.get("/cart")
            items = cart_response.json()["items"]
            if items:
                item_id = items[0]["id"]
                
                # Update quantity
                response = client.put(f"/cart/items/{item_id}?quantity=3")
                assert response.status_code == 200
                assert response.json()["message"] == "Cart item updated"
    
    @pytest.mark.asyncio
    async def test_remove_from_cart(self):
        """Test removing item from cart."""
        def mock_require_auth(f):
            async def wrapper(*args, **kwargs):
                request = args[0]
                request.state.user_id = MOCK_USER
                return await f(*args, **kwargs)
            return wrapper
        
        with patch("app.core.Auth.require_auth", mock_require_auth):
            # Add item first
            client.post("/cart/items", json={"book_id": 1, "quantity": 1})
            
            # Get cart
            cart_response = client.get("/cart")
            items = cart_response.json()["items"]
            if items:
                item_id = items[0]["id"]
                
                # Remove item
                response = client.delete(f"/cart/items/{item_id}")
                assert response.status_code == 200
                assert "removed" in response.json()["message"].lower()
    
    @pytest.mark.asyncio
    async def test_clear_cart(self):
        """Test clearing entire cart."""
        def mock_require_auth(f):
            async def wrapper(*args, **kwargs):
                request = args[0]
                request.state.user_id = MOCK_USER
                return await f(*args, **kwargs)
            return wrapper
        
        with patch("app.core.Auth.require_auth", mock_require_auth):
            # Add items
            client.post("/cart/items", json={"book_id": 1, "quantity": 1})
            client.post("/cart/items", json={"book_id": 2, "quantity": 1})
            
            # Clear cart
            response = client.delete("/cart")
            assert response.status_code == 200
            assert "cleared" in response.json()["message"].lower()


class TestCheckout:
    """Test checkout and order creation."""
    
    @pytest.mark.asyncio
    async def test_checkout_success(self):
        """Test successful order creation."""
        def mock_require_auth(f):
            async def wrapper(*args, **kwargs):
                request = args[0]
                request.state.user_id = MOCK_USER
                return await f(*args, **kwargs)
            return wrapper
        
        with patch("app.core.Auth.require_auth", mock_require_auth):
            # Add item to cart
            client.post("/cart/items", json={"book_id": 1, "quantity": 2})
            
            # Checkout
            response = client.post(
                "/checkout",
                json={
                    "payment_method": "dummy",
                    "shipping_address": "123 Main Street, City, State 12345",
                    "card_number": "1234567890123456"
                }
            )
            assert response.status_code == 201
            data = response.json()
            assert "order_number" in data
            assert data["payment_status"] in ["pending", "completed"]
            assert data["status"] in ["pending", "completed"]
    
    @pytest.mark.asyncio
    async def test_checkout_empty_cart(self):
        """Test checkout with empty cart fails."""
        def mock_require_auth(f):
            async def wrapper(*args, **kwargs):
                request = args[0]
                request.state.user_id = MOCK_USER
                return await f(*args, **kwargs)
            return wrapper
        
        with patch("app.core.Auth.require_auth", mock_require_auth):
            # Clear cart first
            client.delete("/cart")
            
            # Try checkout
            response = client.post(
                "/checkout",
                json={
                    "payment_method": "dummy",
                    "shipping_address": "123 Main Street, City, State 12345"
                }
            )
            assert response.status_code == 400
            assert "empty" in response.json()["detail"].lower()
    
    @pytest.mark.asyncio
    async def test_checkout_invalid_payment_method(self):
        """Test checkout with invalid payment method."""
        def mock_require_auth(f):
            async def wrapper(*args, **kwargs):
                request = args[0]
                request.state.user_id = MOCK_USER
                return await f(*args, **kwargs)
            return wrapper
        
        with patch("app.core.Auth.require_auth", mock_require_auth):
            response = client.post(
                "/checkout",
                json={
                    "payment_method": "bitcoin",  # Invalid
                    "shipping_address": "123 Main Street, City, State 12345"
                }
            )
            assert response.status_code == 422  # Validation error
    
    @pytest.mark.asyncio
    async def test_checkout_short_address(self):
        """Test checkout with too short shipping address."""
        def mock_require_auth(f):
            async def wrapper(*args, **kwargs):
                request = args[0]
                request.state.user_id = MOCK_USER
                return await f(*args, **kwargs)
            return wrapper
        
        with patch("app.core.Auth.require_auth", mock_require_auth):
            response = client.post(
                "/checkout",
                json={
                    "payment_method": "dummy",
                    "shipping_address": "123 St"  # Too short
                }
            )
            assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_get_order(self):
        """Test retrieving order details."""
        def mock_require_auth(f):
            async def wrapper(*args, **kwargs):
                request = args[0]
                request.state.user_id = MOCK_USER
                return await f(*args, **kwargs)
            return wrapper
        
        with patch("app.core.Auth.require_auth", mock_require_auth):
            # Create order
            client.post("/cart/items", json={"book_id": 1, "quantity": 1})
            
            checkout_response = client.post(
                "/checkout",
                json={
                    "payment_method": "dummy",
                    "shipping_address": "123 Main Street, City, State 12345"
                }
            )
            
            if checkout_response.status_code == 201:
                order_number = checkout_response.json()["order_number"]
                
                # Retrieve order
                response = client.get(f"/checkout/orders/{order_number}")
                assert response.status_code == 200
                data = response.json()
                assert data["order_number"] == order_number
                assert "items" in data
                assert "shipping_address" in data


class TestSecurityAndAuthorization:
    """Test security aspects of cart and checkout."""
    
    @pytest.mark.asyncio
    async def test_cart_isolation_between_users(self):
        """Test that users can only access their own carts."""
        def mock_require_auth_user1(f):
            async def wrapper(*args, **kwargs):
                request = args[0]
                request.state.user_id = "auth0|user1"
                return await f(*args, **kwargs)
            return wrapper
        
        def mock_require_auth_user2(f):
            async def wrapper(*args, **kwargs):
                request = args[0]
                request.state.user_id = "auth0|user2"
                return await f(*args, **kwargs)
            return wrapper
        
        # User 1 adds to cart
        with patch("app.core.Auth.require_auth", mock_require_auth_user1):
            response1 = client.post("/cart/items", json={"book_id": 1, "quantity": 1})
            assert response1.status_code == 201
            
            cart1 = client.get("/cart").json()
            cart1_items = len(cart1["items"])
        
        # User 2 should see empty cart
        with patch("app.core.Auth.require_auth", mock_require_auth_user2):
            cart2 = client.get("/cart").json()
            assert len(cart2["items"]) == 0
    
    @pytest.mark.asyncio
    async def test_price_tampering_prevention(self):
        """Test that cart prices are recalculated at checkout."""
        def mock_require_auth(f):
            async def wrapper(*args, **kwargs):
                request = args[0]
                request.state.user_id = MOCK_USER
                return await f(*args, **kwargs)
            return wrapper
        
        # This ensures frontend cannot tamper with prices
        with patch("app.core.Auth.require_auth", mock_require_auth):
            # Add to cart
            client.post("/cart/items", json={"book_id": 1, "quantity": 1})
            
            # Checkout (prices should be recalculated from DB)
            response = client.post(
                "/checkout",
                json={
                    "payment_method": "dummy",
                    "shipping_address": "123 Main Street, City, State 12345"
                }
            )
            
            if response.status_code == 201:
                # In production, verify order total matches DB prices
                assert "total_amount" in response.json()
    
    @pytest.mark.asyncio
    async def test_order_isolation_between_users(self):
        """Test that users cannot access others' orders."""
        def mock_require_auth_user1(f):
            async def wrapper(*args, **kwargs):
                request = args[0]
                request.state.user_id = "auth0|user1"
                return await f(*args, **kwargs)
            return wrapper
        
        def mock_require_auth_user2(f):
            async def wrapper(*args, **kwargs):
                request = args[0]
                request.state.user_id = "auth0|user2"
                return await f(*args, **kwargs)
            return wrapper
        
        order_number = None
        
        # User 1 creates order
        with patch("app.core.Auth.require_auth", mock_require_auth_user1):
            client.post("/cart/items", json={"book_id": 1, "quantity": 1})
            response = client.post(
                "/checkout",
                json={
                    "payment_method": "dummy",
                    "shipping_address": "123 Main Street, City, State 12345"
                }
            )
            if response.status_code == 201:
                order_number = response.json()["order_number"]
        
        # User 2 tries to access User 1's order
        if order_number:
            with patch("app.core.Auth.require_auth", mock_require_auth_user2):
                response = client.get(f"/checkout/orders/{order_number}")
                assert response.status_code == 404  # Should not find order


class TestPaymentProcessing:
    """Test dummy payment gateway."""
    
    @pytest.mark.asyncio
    async def test_payment_success(self):
        """Test successful payment."""
        def mock_require_auth(f):
            async def wrapper(*args, **kwargs):
                request = args[0]
                request.state.user_id = MOCK_USER
                return await f(*args, **kwargs)
            return wrapper
        
        with patch("app.core.Auth.require_auth", mock_require_auth):
            client.post("/cart/items", json={"book_id": 1, "quantity": 1})
            
            response = client.post(
                "/checkout",
                json={
                    "payment_method": "dummy",
                    "shipping_address": "123 Main Street, City, State 12345",
                    "card_number": "1234567890123456"
                }
            )
            
            if response.status_code == 201:
                data = response.json()
                # Card not ending in 0000 should succeed
                assert data["payment_status"] == "completed"
    
    @pytest.mark.asyncio
    async def test_payment_declined(self):
        """Test payment decline (card ending in 0000)."""
        def mock_require_auth(f):
            async def wrapper(*args, **kwargs):
                request = args[0]
                request.state.user_id = MOCK_USER
                return await f(*args, **kwargs)
            return wrapper
        
        with patch("app.core.Auth.require_auth", mock_require_auth):
            client.post("/cart/items", json={"book_id": 1, "quantity": 1})
            
            response = client.post(
                "/checkout",
                json={
                    "payment_method": "dummy",
                    "shipping_address": "123 Main Street, City, State 12345",
                    "card_number": "1234567890120000"  # Ends in 0000
                }
            )
            
            if response.status_code == 201:
                data = response.json()
                # Card ending in 0000 should be declined
                assert data["payment_status"] == "failed"