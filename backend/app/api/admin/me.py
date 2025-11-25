from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import User
from app.dependencies import get_current_admin

router = APIRouter()


@router.get("/me")
def get_current_admin_info(current_user: User = Depends(get_current_admin)):
    """獲取當前管理員資訊（用於檢查登入狀態）"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role),
        "status": current_user.status.value if hasattr(current_user.status, 'value') else str(current_user.status)
    }

