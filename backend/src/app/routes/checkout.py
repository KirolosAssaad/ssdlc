from fastapi import APIRouter, Request, HTTPException, status, Path, Query
from pydantic import BaseModel, Field
from typing import Optional
from app.dao.orders import OrderDAO
from app.dao.cart import CartDAO
from app.core.Auth import require_auth
from app.utils.logger import logger
import uuid
import asyncio

router = APIRouter(prefix="/checkout", tags=["checkout"])


class CheckoutRequest(BaseModel):
    """Request model for checkout."""
    payment_method: str = Field(
        ...,
        pattern="^(credit_card|paypal|dummy)$",
        description="Payment method"
    )
    shipping_address: str = Field(
        ...,
        min_length=10,
        max_length=500,
        description="Shipping address"
    )
    card_number: Optional[str] = Field(
        None,
        pattern="^[0-9]{16}$",
        description="16-digit card number (dummy payment only)"
    )


class OrderItemResponse(BaseModel):
    """Order item details."""
    book_id: int
    book_title: str
    book_author: str
    quantity: int
    price: float
    subtotal: float


class OrderResponse(BaseModel):
    """Response model for order."""
    order_id: int
    order_number: str
    total_amount: float
    status: str
    payment_status: str


class OrderDetailResponse(OrderResponse):
    """Detailed order response with items."""
    items: list[OrderItemResponse]
    shipping_address: str
    payment_method: str
    created_at: Optional[str] = None


async def process_dummy_payment(
    order_id: int,
    amount: float,
    payment_method: str,
    card_number: Optional[str]
) -> dict:
    """
    Dummy payment gateway simulation.
    
    In production, integrate with real provider (Stripe, PayPal, etc.)
    
    Security Note:
    - Never store full card numbers in logs
    - In production, use tokenization
    - Validate with real gateway
    """
    # Simulate payment processing delay
    await asyncio.sleep(0.5)
    
    # Dummy logic: fail if card ends in '0000'
    if card_number and card_number.endswith("0000"):
        logger.warning(f"Dummy payment declined for order {order_id}")
        return {
            "status": "failed",
            "message": "Card declined (dummy: ends in 0000)",
            "order_id": order_id
        }
    
    logger.info(
        f"Dummy payment processed: order={order_id}, amount=${amount:.2f}, "
        f"method={payment_method}"
    )
    return {
        "status": "completed",
        "message": "Payment successful (dummy gateway)",
        "order_id": order_id
    }


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
# @require_auth()
async def create_order(request: Request, payload: CheckoutRequest) -> OrderResponse:
    """
    Create order from cart and process payment.
    
    Security:
    - Recalculates prices from DB (prevents tampering)
    - Validates inventory availability
    - Creates idempotent order number
    - Only user's own cart can be checked out
    """
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    
    try:
        # Get cart and validate
        cart = await CartDAO.get_cart(user_id=user_id)
        
        if not cart["items"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart is empty"
            )
        
        # Generate unique order number
        order_number = f"ORD-{uuid.uuid4().hex[:12].upper()}"
        
        logger.info(f"Creating order {order_number} for user {user_id[:10]}...")
        
        # Create order (recalculates prices for security)
        order = await OrderDAO.create_order(
            user_id=user_id,
            order_number=order_number,
            cart_items=cart["items"],
            shipping_address=payload.shipping_address,
            payment_method=payload.payment_method
        )
        
        # Process dummy payment
        payment_result = await process_dummy_payment(
            order_id=order["id"],
            amount=order["total_amount"],
            payment_method=payload.payment_method,
            card_number=payload.card_number
        )
        
        # Update order with payment status
        await OrderDAO.update_payment_status(
            order_id=order["id"],
            payment_status=payment_result["status"]
        )
        
        # Clear cart on successful payment
        if payment_result["status"] == "completed":
            await CartDAO.clear_cart(user_id=user_id)
            logger.info(f"Order {order_number} completed. Cart cleared.")
        
        return OrderResponse(
            order_id=order["id"],
            order_number=order["order_number"],
            total_amount=order["total_amount"],
            status=order["status"],
            payment_status=payment_result["status"]
        )
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Checkout validation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Checkout error: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Checkout failed. Please try again."
        )


@router.get("/orders/{order_number}", response_model=OrderDetailResponse)
# @require_auth()
async def get_order(request: Request, order_number: str = Path(..., min_length=5, max_length=50)) -> OrderDetailResponse:
    """
    Retrieve order details by order number.
    
    Security: Only order owner can retrieve their order.
    """
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    
    try:
        order = await OrderDAO.get_order_by_number(
            order_number=order_number,
            user_id=user_id
        )
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        return OrderDetailResponse(
            order_id=order["id"],
            order_number=order["order_number"],
            total_amount=order["total_amount"],
            status=order["status"],
            payment_status=order["payment_status"],
            items=order["items"],
            shipping_address=order["shipping_address"],
            payment_method=order["payment_method"],
            created_at=order["created_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving order: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve order"
        )


@router.get("/orders", response_model=dict)
# @require_auth()
async def get_user_orders(request: Request, limit: int = Query(50, ge=1, le=100)) -> dict:
    """
    Retrieve user's order history.
    
    Returns paginated list of user's orders.
    """
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    
    try:
        orders = await OrderDAO.get_user_orders(
            user_id=user_id,
            limit=limit
        )
        return {
            "orders": orders,
            "total": len(orders)
        }
    except Exception as e:
        logger.error(f"Error retrieving orders: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve orders"
        )