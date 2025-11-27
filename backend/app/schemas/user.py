from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.models.user import UserRole, UserStatus


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: UserRole = UserRole.CUSTOMER  # 默认值为 CUSTOMER，但可以指定
    status: UserStatus = UserStatus.ACTIVE  # 默认值为 ACTIVE，但可以指定


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    status: str
    phone: Optional[str] = None
    address: Optional[str] = None
    county: Optional[str] = None
    district: Optional[str] = None
    zipcode: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    county: Optional[str] = None
    district: Optional[str] = None
    zipcode: Optional[str] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None


class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str


class UserListResponse(BaseModel):
    users: list[UserResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

