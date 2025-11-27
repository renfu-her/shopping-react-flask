from fastapi import Depends, HTTPException, status, Request, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.core.session import get_session_user_id, is_authenticated
from app.core.security import decode_access_token

# HTTP Bearer token security scheme (optional for backward compatibility)
security = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """從 JWT Token 或 Session 獲取當前用戶（優先使用 JWT Token）"""
    user_id = None
    
    # 優先檢查 JWT Token (Bearer token)
    token = None
    if credentials:
        token = credentials.credentials
    elif authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
    
    if token:
        payload = decode_access_token(token)
        if payload:
            user_id = payload.get("sub")
            if user_id:
                user = db.query(User).filter(User.id == user_id).first()
                if user:
                    return user
    
    # 如果 JWT Token 無效或不存在，回退到 Session 認證（向後兼容）
    if not user_id:
        if not is_authenticated(request):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        
        user_id = get_session_user_id(request)
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user


async def get_current_user_optional(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User | None:
    """可選的獲取當前用戶（用於可選認證的端點）"""
    user_id = None
    
    # 優先檢查 JWT Token
    token = None
    if credentials:
        token = credentials.credentials
    elif authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
    
    if token:
        payload = decode_access_token(token)
        if payload:
            user_id = payload.get("sub")
            if user_id:
                user = db.query(User).filter(User.id == user_id).first()
                if user:
                    return user
    
    # 回退到 Session 認證
    if not user_id:
        if not is_authenticated(request):
            return None
        
        try:
            user_id = get_session_user_id(request)
            if user_id is None:
                return None
            
            user = db.query(User).filter(User.id == user_id).first()
            return user
        except Exception:
            return None
    
    return None


async def get_current_admin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> User:
    """獲取當前管理員用戶（必須是管理員角色）"""
    from app.models.user import UserRole, UserStatus
    
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access this resource"
        )
    
    if current_user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not active"
        )
    
    return current_user

