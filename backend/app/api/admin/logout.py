from fastapi import APIRouter, Request, Depends
from app.core.session import clear_session

router = APIRouter()


@router.post("/logout")
def admin_logout(request: Request):
    """管理員登出（清除 Session）"""
    clear_session(request)
    return {"success": True, "message": "Logged out successfully"}

