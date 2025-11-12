from fastapi import APIRouter, Request, HTTPException, status, Path, Query
from pydantic import BaseModel, Field
from typing import List
from app.dao.cart import CartDAO
from app.core.Auth import require_auth
from app.utils.logger import logger

router = APIRouter(prefix="/cart", tags=["cart"])


class AddToCartRequest(BaseModel):
    """Request model for adding item to cart."""
    book_id: int = Field(..., gt=0, description="ID of book to add")
    quantity: int = Field(1, ge=1, le=10, description="Quantity (1-10)")


class CartItemResponse(BaseModel):
    """Response model for cart item."""
    id: int
    book_id: int
    book_title: str
    book_author: str
    quantity: int
    price: float
    subtotal: float


class CartResponse(BaseModel):
    """Response model for complete cart."""
    items: List[CartItemResponse]
    total_items: int
    total_amount: float


@router.post("/items", status_code=status.HTTP_201_CREATED, response_model=dict)
# @require_auth()
async def add_to_cart(request: Request, payload: AddToCartRequest) -> dict:
    """
    Add item to shopping cart.
    
    Security:
    - User can only add to their own cart
    - Quantity limited to 10 per item
    - Book availability validated
    """
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    
    try:
        result = await CartDAO.add_item(
            user_id=user_id,
            book_id=payload.book_id,
            quantity=payload.quantity
        )
        
        logger.info(
            f"Cart operation: user={user_id[:10]}..., book={payload.book_id}, "
            f"qty={payload.quantity}"
        )
        
        return {
            "message": "Item added to cart",
            "item_id": result["id"],
            "book_id": result["book_id"],
            "quantity": result["quantity"]
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error adding to cart: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add item to cart"
        )


@router.get("", response_model=CartResponse)
# @require_auth()
async def get_cart(request: Request) -> CartResponse:
    """
    Retrieve user's shopping cart.
    
    Returns all items with current prices and totals.
    """
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    
    try:
        cart_data = await CartDAO.get_cart(user_id=user_id)
        return CartResponse(**cart_data)
    except Exception as e:
        logger.error(f"Error retrieving cart: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve cart"
        )


@router.put("/items/{item_id}")
# @require_auth()
async def update_cart_item(
    request: Request,
    item_id: int = Path(..., gt=0),
    quantity: int = Query(..., ge=0, le=10, description="New quantity (0 to remove)")
) -> dict:
    """
    Update cart item quantity.
    
    Set quantity to 0 to remove item from cart.
    """
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    
    try:
        if quantity == 0:
            await CartDAO.remove_item(item_id=item_id, user_id=user_id)
            return {"message": "Item removed from cart"}
        else:
            result = await CartDAO.update_quantity(
                item_id=item_id,
                user_id=user_id,
                quantity=quantity
            )
            return {"message": "Cart item updated", "quantity": result["quantity"]}
            
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error updating cart: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update cart"
        )


@router.delete("/items/{item_id}", response_model=dict)
# @require_auth()
async def remove_from_cart(request: Request, item_id: int = Path(..., gt=0)) -> dict:
    """Remove item from cart."""
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    
    try:
        await CartDAO.remove_item(item_id=item_id, user_id=user_id)
        return {"message": "Item removed from cart"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error removing from cart: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove item"
        )


@router.delete("", response_model=dict)
# @require_auth()
async def clear_cart(request: Request) -> dict:
    """Clear entire shopping cart."""
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    
    try:
        await CartDAO.clear_cart(user_id=user_id)
        return {"message": "Cart cleared successfully"}
    except Exception as e:
        logger.error(f"Error clearing cart: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to clear cart"
        )