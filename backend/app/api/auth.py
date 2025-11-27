from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.models.user import User, UserRole, UserStatus
from app.models.cart import Cart
from app.schemas.user import UserCreate, UserResponse, UserLogin, UserUpdate, UserPasswordUpdate
from app.core.security import verify_password, get_password_hash, create_access_token
from app.config import settings
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """用戶註冊"""
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
        role=user_data.role,  # 使用 schema 中的默认值（CUSTOMER）
        status=user_data.status  # 使用 schema 中的默认值（ACTIVE）
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # 為用戶創建購物車
    cart = Cart(user_id=new_user.id)
    db.add(cart)
    db.commit()
    
    return new_user


@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """用戶登入"""
    user = db.query(User).filter(User.email == user_data.email).first()
    
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # 創建 access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user)
    }


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """獲取當前用戶資訊"""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_current_user_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新當前用戶資料（不包含密碼）"""
    # 更新欄位
    if user_data.name is not None:
        current_user.name = user_data.name
    if user_data.email is not None:
        # 檢查 email 是否已被其他用戶使用
        existing = db.query(User).filter(User.email == user_data.email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
        current_user.email = user_data.email
    if user_data.phone is not None:
        current_user.phone = user_data.phone
    if user_data.address is not None:
        current_user.address = user_data.address
    if user_data.county is not None:
        current_user.county = user_data.county
    if user_data.district is not None:
        current_user.district = user_data.district
    if user_data.zipcode is not None:
        current_user.zipcode = user_data.zipcode
    
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.put("/me/password", response_model=UserResponse)
def update_current_user_password(
    password_data: UserPasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新當前用戶密碼"""
    # 驗證當前密碼
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # 更新密碼
    current_user.password_hash = get_password_hash(password_data.new_password)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

