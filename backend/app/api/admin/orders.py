from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from math import ceil

from app.database import get_db
from app.models.user import User
from app.models.order import Order, OrderStatus
from app.schemas.admin import (
    OrderResponseAdmin, OrderListResponseAdmin, OrderStatusUpdate
)
from app.dependencies import get_current_admin

router = APIRouter()


@router.get("/orders", response_model=OrderListResponseAdmin)
def get_orders(
    status_filter: Optional[str] = Query(None, description="狀態篩選"),
    page: int = Query(1, ge=1, description="頁碼"),
    page_size: int = Query(10, ge=1, le=100, description="每頁筆數"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """獲取訂單列表"""
    query = db.query(Order)
    
    if status_filter:
        try:
            status_enum = OrderStatus(status_filter)
            query = query.filter(Order.status == status_enum)
        except ValueError:
            pass
    
    total = query.count()
    total_pages = ceil(total / page_size) if total > 0 else 0
    orders = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    return OrderListResponseAdmin(
        orders=[OrderResponseAdmin.model_validate(o) for o in orders],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/orders/{order_id}", response_model=OrderResponseAdmin)
def get_order(
    order_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """獲取訂單詳情"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return OrderResponseAdmin.model_validate(order)


@router.put("/orders/{order_id}/status", response_model=OrderResponseAdmin)
def update_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """更新訂單狀態"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    try:
        order.status = OrderStatus(status_data.status)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid order status")
    
    db.commit()
    db.refresh(order)
    return OrderResponseAdmin.model_validate(order)

