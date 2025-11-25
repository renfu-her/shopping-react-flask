from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from math import ceil

from app.database import get_db
from app.models.user import User
from app.models.ad import Ad
from app.schemas.admin import (
    AdCreate, AdUpdate, AdResponseAdmin, AdListResponseAdmin
)
from app.dependencies import get_current_admin

router = APIRouter()


@router.get("/banners", response_model=AdListResponseAdmin)
def get_banners(
    search: Optional[str] = Query(None, description="搜尋 Banner 名稱"),
    status_filter: Optional[bool] = Query(None, description="狀態篩選"),
    page: int = Query(1, ge=1, description="頁碼"),
    page_size: int = Query(10, ge=1, le=100, description="每頁筆數"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """獲取 Banner 列表（支援搜尋、狀態篩選、分頁）"""
    query = db.query(Ad)
    
    # 搜尋
    if search:
        query = query.filter(Ad.title.contains(search))
    
    # 狀態篩選
    if status_filter is not None:
        query = query.filter(Ad.is_active == status_filter)
    
    # 計算總數
    total = query.count()
    total_pages = ceil(total / page_size) if total > 0 else 0
    
    # 分頁（按排序索引和建立時間排序）
    ads = query.order_by(Ad.order_index.asc(), Ad.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    return AdListResponseAdmin(
        ads=[AdResponseAdmin.model_validate(ad) for ad in ads],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.post("/banners", response_model=AdResponseAdmin, status_code=status.HTTP_201_CREATED)
def create_banner(
    banner_data: AdCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """新增 Banner"""
    new_banner = Ad(
        title=banner_data.title,
        image_url=banner_data.image_url,
        link_url=banner_data.link_url,
        order_index=banner_data.order_index,
        is_active=banner_data.is_active
    )
    db.add(new_banner)
    db.commit()
    db.refresh(new_banner)
    
    return AdResponseAdmin.model_validate(new_banner)


@router.get("/banners/{banner_id}", response_model=AdResponseAdmin)
def get_banner(
    banner_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """獲取 Banner 詳情"""
    banner = db.query(Ad).filter(Ad.id == banner_id).first()
    if not banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Banner not found"
        )
    return AdResponseAdmin.model_validate(banner)


@router.put("/banners/{banner_id}", response_model=AdResponseAdmin)
def update_banner(
    banner_id: int,
    banner_data: AdUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """更新 Banner"""
    banner = db.query(Ad).filter(Ad.id == banner_id).first()
    if not banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Banner not found"
        )
    
    # 更新欄位
    if banner_data.title is not None:
        banner.title = banner_data.title
    if banner_data.image_url is not None:
        banner.image_url = banner_data.image_url
    if banner_data.link_url is not None:
        banner.link_url = banner_data.link_url
    if banner_data.order_index is not None:
        banner.order_index = banner_data.order_index
    if banner_data.is_active is not None:
        banner.is_active = banner_data.is_active
    
    db.commit()
    db.refresh(banner)
    
    return AdResponseAdmin.model_validate(banner)


@router.delete("/banners/{banner_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_banner(
    banner_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """刪除 Banner"""
    banner = db.query(Ad).filter(Ad.id == banner_id).first()
    if not banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Banner not found"
        )
    
    db.delete(banner)
    db.commit()
    return None


@router.patch("/banners/{banner_id}/toggle-status", response_model=AdResponseAdmin)
def toggle_banner_status(
    banner_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """切換 Banner 狀態（啟用/停用）"""
    banner = db.query(Ad).filter(Ad.id == banner_id).first()
    if not banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Banner not found"
        )
    
    banner.is_active = not banner.is_active
    db.commit()
    db.refresh(banner)
    
    return AdResponseAdmin.model_validate(banner)

