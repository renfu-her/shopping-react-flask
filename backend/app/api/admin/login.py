from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole, UserStatus
from app.schemas.admin import AdminLogin, AdminLoginResponse
from app.core.security import verify_password
from app.core.session import set_session_user

router = APIRouter()


@router.post("/login", response_model=AdminLoginResponse)
def admin_login(login_data: AdminLogin, request: Request, db: Session = Depends(get_db)):
    """管理員登入（使用 Session）"""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        user = db.query(User).filter(User.email == login_data.email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # 验证密码
        if not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # 檢查是否為管理員
        # 确保 role 是枚举对象
        if isinstance(user.role, str):
            user_role = UserRole(user.role)
        else:
            user_role = user.role
        
        if user_role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can login"
            )
        
        # 檢查帳號狀態
        # 确保 status 是枚举对象
        if isinstance(user.status, str):
            user_status = UserStatus(user.status)
        else:
            user_status = user.status
        
        if user_status != UserStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is not active"
            )
        
        # 安全地获取 role 和 status 的值
        role_value = user_role.value if hasattr(user_role, 'value') else str(user_role)
        status_value = user_status.value if hasattr(user_status, 'value') else str(user_status)
        
        # 設置 session
        set_session_user(request, user.id, role_value, status_value)
        
        return {
            "success": True,
            "message": "Login successful",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "role": role_value,
                "status": status_value
            }
        }
    except HTTPException:
        # 重新抛出 HTTP 异常
        raise
    except Exception as e:
        # 捕获其他异常并返回 500 错误
        logger.error(f"登录时发生错误: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

