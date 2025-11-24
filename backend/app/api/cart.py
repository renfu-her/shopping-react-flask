from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.product import Product
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartResponse, CartItemResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/cart", tags=["cart"])


def get_or_create_cart(user: User, db: Session) -> Cart:
    """獲取或創建用戶購物車"""
    cart = db.query(Cart).filter(Cart.user_id == user.id).first()
    if not cart:
        cart = Cart(user_id=user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


@router.get("", response_model=CartResponse)
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """獲取當前用戶購物車"""
    cart = get_or_create_cart(current_user, db)
    
    # 計算總價
    total = sum(item.product.price * item.quantity for item in cart.items)
    
    return CartResponse(
        id=cart.id,
        user_id=cart.user_id,
        items=[CartItemResponse.model_validate(item) for item in cart.items],
        total=total,
        created_at=cart.created_at,
        updated_at=cart.updated_at
    )


@router.post("/items", response_model=CartResponse)
def add_to_cart(
    item_data: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """添加商品到購物車"""
    # 檢查產品是否存在
    product = db.query(Product).filter(Product.id == item_data.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    if not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is not available"
        )
    
    # 獲取或創建購物車
    cart = get_or_create_cart(current_user, db)
    
    # 檢查購物車中是否已有該商品
    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == item_data.product_id
    ).first()
    
    if existing_item:
        # 更新數量
        existing_item.quantity += item_data.quantity
    else:
        # 創建新項目
        new_item = CartItem(
            cart_id=cart.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity
        )
        db.add(new_item)
    
    db.commit()
    db.refresh(cart)
    
    # 計算總價
    total = sum(item.product.price * item.quantity for item in cart.items)
    
    return CartResponse(
        id=cart.id,
        user_id=cart.user_id,
        items=[CartItemResponse.model_validate(item) for item in cart.items],
        total=total,
        created_at=cart.created_at,
        updated_at=cart.updated_at
    )


@router.put("/items/{item_id}", response_model=CartResponse)
def update_cart_item(
    item_id: int,
    item_data: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新購物車項目數量"""
    if item_data.quantity < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be at least 1"
        )
    
    cart = get_or_create_cart(current_user, db)
    
    item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    
    item.quantity = item_data.quantity
    db.commit()
    db.refresh(cart)
    
    # 計算總價
    total = sum(item.product.price * item.quantity for item in cart.items)
    
    return CartResponse(
        id=cart.id,
        user_id=cart.user_id,
        items=[CartItemResponse.model_validate(item) for item in cart.items],
        total=total,
        created_at=cart.created_at,
        updated_at=cart.updated_at
    )


@router.delete("/items/{item_id}", response_model=CartResponse)
def remove_cart_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """從購物車移除商品"""
    cart = get_or_create_cart(current_user, db)
    
    item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    
    db.delete(item)
    db.commit()
    db.refresh(cart)
    
    # 計算總價
    total = sum(item.product.price * item.quantity for item in cart.items)
    
    return CartResponse(
        id=cart.id,
        user_id=cart.user_id,
        items=[CartItemResponse.model_validate(item) for item in cart.items],
        total=total,
        created_at=cart.created_at,
        updated_at=cart.updated_at
    )


@router.delete("", response_model=dict)
def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """清空購物車"""
    cart = get_or_create_cart(current_user, db)
    
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()
    
    return {"message": "Cart cleared successfully"}

