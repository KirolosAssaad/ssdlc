from sqlalchemy import select, delete, update, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.utils.db import get_session
from app.utils.logger import logger
from decimal import Decimal
from typing import List, Dict, Optional


class CartDAO:
    """Data access layer for cart operations with Auth0 integration."""
    
    @staticmethod
    async def get_or_create_cart(user_id: str, session: AsyncSession = None) -> int:
        """
        Get existing cart or create new one for Auth0 user.
        
        Args:
            user_id: Auth0 user ID (e.g., "auth0|123456789")
        """
        if session is None:
            async with get_session() as session:
                return await CartDAO.get_or_create_cart(user_id, session)
        
        # Check if cart exists
        from app.models import Cart
        result = await session.execute(
            select(Cart).where(Cart.user_id == user_id)
        )
        cart = result.scalars().first()
        
        if cart:
            return cart.id
        
        # Create new cart
        cart = Cart(user_id=user_id)
        session.add(cart)
        await session.flush()
        return cart.id
    
    @staticmethod
    async def add_item(
        user_id: str,
        book_id: int,
        quantity: int,
        session: AsyncSession = None
    ) -> Dict:
        """
        Add book to cart with price validation.
        
        Args:
            user_id: Auth0 user ID
            book_id: Book ID to add
            quantity: Quantity to add
        """
        if session is None:
            async with get_session() as session:
                return await CartDAO.add_item(user_id, book_id, quantity, session)
        
        # Validate book exists and get current price
        from app.models import Book, CartItem, Cart
        
        book_result = await session.execute(
            select(Book).where(Book.id == book_id)
        )
        book = book_result.scalars().first()
        
        if not book:
            raise ValueError(f"Book {book_id} not found")
        
        if not book.is_available:
            raise ValueError(f"Book {book.title} is not available")
        
        # Get or create cart
        cart_id = await CartDAO.get_or_create_cart(user_id, session)
        
        # Check if item already in cart
        existing_result = await session.execute(
            select(CartItem).where(
                (CartItem.cart_id == cart_id) & (CartItem.book_id == book_id)
            )
        )
        existing_item = existing_result.scalars().first()
        
        if existing_item:
            # Update quantity
            if existing_item.quantity + quantity > 10:
                raise ValueError("Maximum 10 of same item allowed in cart")
            existing_item.quantity += quantity
            await session.flush()
            item_id = existing_item.id
        else:
            # Add new item
            cart_item = CartItem(
                cart_id=cart_id,
                book_id=book_id,
                quantity=quantity,
                price_at_addition=Decimal(str(book.price))
            )
            session.add(cart_item)
            await session.flush()
            item_id = cart_item.id
        
        await session.commit()
        logger.info(f"User {user_id[:10]}... added {quantity} of book {book_id} to cart")
        
        return {"id": item_id, "book_id": book_id, "quantity": quantity}
    
    @staticmethod
    async def get_cart(user_id: str, session: AsyncSession = None) -> Dict:
        """
        Retrieve user's cart with all items.
        
        Args:
            user_id: Auth0 user ID
        """
        if session is None:
            async with get_session() as session:
                return await CartDAO.get_cart(user_id, session)
        
        from app.models import Cart, CartItem, Book
        
        # Get cart
        cart_result = await session.execute(
            select(Cart).where(Cart.user_id == user_id)
        )
        cart = cart_result.scalars().first()
        
        if not cart:
            return {"items": [], "total_items": 0, "total_amount": 0.0}
        
        # Get cart items with book details
        items_result = await session.execute(
            select(CartItem, Book).join(Book).where(CartItem.cart_id == cart.id)
        )
        rows = items_result.all()
        
        items = []
        total_amount = Decimal("0")
        total_items = 0
        
        for cart_item, book in rows:
            subtotal = cart_item.price_at_addition * cart_item.quantity
            total_amount += subtotal
            total_items += cart_item.quantity
            
            items.append({
                "id": cart_item.id,
                "book_id": book.id,
                "book_title": book.title,
                "book_author": book.author,
                "quantity": cart_item.quantity,
                "price": float(cart_item.price_at_addition),
                "subtotal": float(subtotal)
            })
        
        return {
            "items": items,
            "total_items": total_items,
            "total_amount": float(total_amount)
        }
    
    @staticmethod
    async def update_quantity(
        item_id: int,
        user_id: str,
        quantity: int,
        session: AsyncSession = None
    ) -> Dict:
        """
        Update cart item quantity.
        
        Args:
            item_id: Cart item ID
            user_id: Auth0 user ID (for authorization)
            quantity: New quantity
        """
        if session is None:
            async with get_session() as session:
                return await CartDAO.update_quantity(item_id, user_id, quantity, session)
        
        from app.models import CartItem, Cart
        
        # Verify ownership
        result = await session.execute(
            select(CartItem).join(Cart).where(
                (CartItem.id == item_id) & (Cart.user_id == user_id)
            )
        )
        cart_item = result.scalars().first()
        
        if not cart_item:
            raise ValueError("Cart item not found")
        
        if quantity > 10:
            raise ValueError("Maximum 10 of same item allowed")
        
        cart_item.quantity = quantity
        await session.commit()
        return {"id": item_id, "quantity": quantity}
    
    @staticmethod
    async def remove_item(
        item_id: int,
        user_id: str,
        session: AsyncSession = None
    ) -> None:
        """
        Remove item from cart.
        
        Args:
            item_id: Cart item ID
            user_id: Auth0 user ID (for authorization)
        """
        if session is None:
            async with get_session() as session:
                return await CartDAO.remove_item(item_id, user_id, session)
        
        from app.models import CartItem, Cart
        
        # Verify ownership
        result = await session.execute(
            select(CartItem).join(Cart).where(
                (CartItem.id == item_id) & (Cart.user_id == user_id)
            )
        )
        cart_item = result.scalars().first()
        
        if not cart_item:
            raise ValueError("Cart item not found")
        
        await session.delete(cart_item)
        await session.commit()
        logger.info(f"User {user_id[:10]}... removed item {item_id} from cart")
    
    @staticmethod
    async def clear_cart(user_id: str, session: AsyncSession = None) -> None:
        """
        Clear all items from user's cart.
        
        Args:
            user_id: Auth0 user ID
        """
        if session is None:
            async with get_session() as session:
                return await CartDAO.clear_cart(user_id, session)
        
        from app.models import Cart, CartItem
        
        cart_result = await session.execute(
            select(Cart).where(Cart.user_id == user_id)
        )
        cart = cart_result.scalars().first()
        
        if cart:
            await session.execute(
                delete(CartItem).where(CartItem.cart_id == cart.id)
            )
            await session.commit()
            logger.info(f"User {user_id[:10]}... cleared cart")