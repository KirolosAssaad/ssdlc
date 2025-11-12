from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.utils.db import get_session
from app.utils.logger import logger
from decimal import Decimal
from typing import List, Dict, Optional
from datetime import datetime


class OrderDAO:
    """Data access layer for order operations with Auth0 integration."""
    
    @staticmethod
    async def create_order(
        user_id: str,
        order_number: str,
        cart_items: List[Dict],
        shipping_address: str,
        payment_method: str,
        session: AsyncSession = None
    ) -> Dict:
        """
        Create order from cart items.
        Recalculates prices from DB to prevent tampering.
        
        Args:
            user_id: Auth0 user ID (e.g., "auth0|123456789")
            order_number: Unique order number
            cart_items: List of cart items
            shipping_address: Shipping address
            payment_method: Payment method
        """
        if session is None:
            async with get_session() as session:
                return await OrderDAO.create_order(
                    user_id, order_number, cart_items, shipping_address, payment_method, session
                )
        
        from app.models import Order, OrderItem, Book
        
        if not cart_items:
            raise ValueError("Cannot create order with empty cart")
        
        # Recalculate total from current book prices (security: prevent price tampering)
        total_amount = Decimal("0")
        order_items_data = []
        
        for cart_item in cart_items:
            book_result = await session.execute(
                select(Book).where(Book.id == cart_item["book_id"])
            )
            book = book_result.scalars().first()
            
            if not book:
                raise ValueError(f"Book {cart_item['book_id']} not found")
            
            if not book.is_available:
                raise ValueError(f"Book {book.title} is not available")
            
            # Use current price, not cart price (security)
            item_price = Decimal(str(book.price))
            item_quantity = int(cart_item["quantity"])
            subtotal = item_price * item_quantity
            total_amount += subtotal
            
            order_items_data.append({
                "book_id": book.id,
                "book_title": book.title,
                "book_author": book.author,
                "quantity": item_quantity,
                "price": item_price,
                "subtotal": subtotal
            })
        
        # Create order
        order = Order(
            user_id=user_id,
            order_number=order_number,
            total_amount=total_amount,
            status="pending",
            payment_method=payment_method,
            payment_status="pending",
            shipping_address=shipping_address
        )
        session.add(order)
        await session.flush()
        
        # Add order items
        for item_data in order_items_data:
            order_item = OrderItem(
                order_id=order.id,
                book_id=item_data["book_id"],
                book_title=item_data["book_title"],
                book_author=item_data["book_author"],
                quantity=item_data["quantity"],
                price=item_data["price"],
                subtotal=item_data["subtotal"]
            )
            session.add(order_item)
        
        await session.commit()
        logger.info(f"Order {order_number} created for user {user_id[:10]}...: ${total_amount}")
        
        return {
            "id": order.id,
            "order_number": order_number,
            "total_amount": float(total_amount),
            "status": "pending",
            "payment_status": "pending"
        }
    
    @staticmethod
    async def get_order_by_number(
        order_number: str,
        user_id: str,
        session: AsyncSession = None
    ) -> Optional[Dict]:
        """
        Retrieve order by order number with authorization check.
        
        Args:
            order_number: Order number
            user_id: Auth0 user ID (for authorization)
        """
        if session is None:
            async with get_session() as session:
                return await OrderDAO.get_order_by_number(order_number, user_id, session)
        
        from app.models import Order, OrderItem
        
        order_result = await session.execute(
            select(Order).where(
                (Order.order_number == order_number) & (Order.user_id == user_id)
            )
        )
        order = order_result.scalars().first()
        
        if not order:
            return None
        
        # Get order items
        items_result = await session.execute(
            select(OrderItem).where(OrderItem.order_id == order.id)
        )
        order_items = items_result.scalars().all()
        
        items = [
            {
                "book_id": item.book_id,
                "book_title": item.book_title,
                "book_author": item.book_author,
                "quantity": item.quantity,
                "price": float(item.price),
                "subtotal": float(item.subtotal)
            }
            for item in order_items
        ]
        
        return {
            "id": order.id,
            "order_number": order.order_number,
            "total_amount": float(order.total_amount),
            "status": order.status,
            "payment_status": order.payment_status,
            "payment_method": order.payment_method,
            "shipping_address": order.shipping_address,
            "items": items,
            "created_at": order.created_at.isoformat() if order.created_at else None
        }
    
    @staticmethod
    async def update_payment_status(
        order_id: int,
        payment_status: str,
        session: AsyncSession = None
    ) -> None:
        """Update order payment status."""
        if session is None:
            async with get_session() as session:
                return await OrderDAO.update_payment_status(order_id, payment_status, session)
        
        from app.models import Order
        
        if payment_status not in ["pending", "completed", "failed"]:
            raise ValueError(f"Invalid payment status: {payment_status}")
        
        result = await session.execute(
            select(Order).where(Order.id == order_id)
        )
        order = result.scalars().first()
        
        if not order:
            raise ValueError(f"Order {order_id} not found")
        
        order.payment_status = payment_status
        if payment_status == "completed":
            order.status = "completed"
        elif payment_status == "failed":
            order.status = "failed"
        
        await session.commit()
        logger.info(f"Order {order_id} payment status updated to {payment_status}")
    
    @staticmethod
    async def get_user_orders(user_id: str, limit: int = 50, session: AsyncSession = None) -> List[Dict]:
        """
        Get user's order history.
        
        Args:
            user_id: Auth0 user ID
            limit: Max orders to return
        """
        if session is None:
            async with get_session() as session:
                return await OrderDAO.get_user_orders(user_id, limit, session)
        
        from app.models import Order
        
        result = await session.execute(
            select(Order)
            .where(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
            .limit(limit)
        )
        orders = result.scalars().all()
        
        return [
            {
                "id": order.id,
                "order_number": order.order_number,
                "total_amount": float(order.total_amount),
                "status": order.status,
                "payment_status": order.payment_status,
                "created_at": order.created_at.isoformat() if order.created_at else None
            }
            for order in orders
        ]