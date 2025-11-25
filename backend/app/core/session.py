"""
Session 管理模块
使用 Starlette 的 SessionMiddleware 实现基于 session 的认证
"""
from starlette.requests import Request
from typing import Optional


def get_session_user_id(request: Request) -> Optional[int]:
    """从 session 中获取用户 ID"""
    return request.session.get("user_id")


def set_session_user(request: Request, user_id: int, role: str, status: str):
    """设置 session 中的用户信息"""
    request.session["user_id"] = user_id
    request.session["user_role"] = role
    request.session["user_status"] = status
    request.session["authenticated"] = True


def clear_session(request: Request):
    """清除 session"""
    request.session.clear()


def is_authenticated(request: Request) -> bool:
    """检查用户是否已认证"""
    return request.session.get("authenticated", False)


def get_session_role(request: Request) -> Optional[str]:
    """从 session 中获取用户角色"""
    return request.session.get("user_role")

