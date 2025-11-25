from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from math import ceil

from app.database import get_db
from app.models.user import User, UserRole, UserStatus
from app.schemas.admin import (
    UserCreateAdmin, UserUpdateAdmin, UserResponseAdmin, UserListResponseAdmin
)
from app.core.security import get_password_hash
from app.dependencies import get_current_admin

router = APIRouter()


@router.get("/users", response_model=UserListResponseAdmin)
def get_users(
    search: Optional[str] = Query(None, description="搜尋姓名、郵箱"),
    role: Optional[str] = Query(None, description="角色篩選"),
    status_filter: Optional[str] = Query(None, description="狀態篩選"),
    page: int = Query(1, ge=1, description="頁碼"),
    page_size: int = Query(10, ge=1, le=100, description="每頁筆數"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """獲取使用者列表（支援搜尋、篩選、分頁）"""
    query = db.query(User)
    
    # 搜尋
    if search:
        query = query.filter(
            or_(
                User.name.contains(search),
                User.email.contains(search)
            )
        )
    
    # 角色篩選
    if role:
        try:
            role_enum = UserRole(role)
            query = query.filter(User.role == role_enum)
        except ValueError:
            pass
    
    # 狀態篩選
    if status_filter:
        try:
            status_enum = UserStatus(status_filter)
            query = query.filter(User.status == status_enum)
        except ValueError:
            pass
    
    # 計算總數
    total = query.count()
    total_pages = ceil(total / page_size) if total > 0 else 0
    
    # 分頁
    users = query.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    return UserListResponseAdmin(
        users=[UserResponseAdmin.model_validate(u) for u in users],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.post("/users", response_model=UserResponseAdmin, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: UserCreateAdmin,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """新增使用者"""
    # 檢查 email 是否已存在
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # 創建新用戶
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=hashed_password,
        role=user_data.role,
        status=user_data.status
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return UserResponseAdmin.model_validate(new_user)


@router.get("/users/{user_id}", response_model=UserResponseAdmin)
def get_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """獲取使用者詳情"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return UserResponseAdmin.model_validate(user)


@router.put("/users/{user_id}", response_model=UserResponseAdmin)
def update_user(
    user_id: int,
    user_data: UserUpdateAdmin,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """更新使用者"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # 更新欄位
    if user_data.name is not None:
        user.name = user_data.name
    if user_data.email is not None:
        # 檢查 email 是否已被其他用戶使用
        existing = db.query(User).filter(User.email == user_data.email, User.id != user_id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
        user.email = user_data.email
    if user_data.role is not None:
        user.role = user_data.role
    if user_data.status is not None:
        user.status = user_data.status
    if user_data.password is not None:
        user.password_hash = get_password_hash(user_data.password)
    
    db.commit()
    db.refresh(user)
    
    return UserResponseAdmin.model_validate(user)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """刪除使用者"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # 不能刪除自己
    if user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    db.delete(user)
    db.commit()
    return None

