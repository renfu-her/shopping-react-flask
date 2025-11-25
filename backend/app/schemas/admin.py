from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from app.models.user import UserRole, UserStatus


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class AdminLoginResponse(BaseModel):
    success: bool
    message: str
    user: dict


class UserCreateAdmin(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: UserRole = UserRole.CUSTOMER
    status: UserStatus = UserStatus.ACTIVE


class UserUpdateAdmin(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    password: Optional[str] = None


class UserResponseAdmin(BaseModel):
    id: int
    email: str
    name: str
    role: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserListResponseAdmin(BaseModel):
    users: List[UserResponseAdmin]
    total: int
    page: int
    page_size: int
    total_pages: int


class AdCreate(BaseModel):
    title: str
    image_url: str
    link_url: Optional[str] = None
    order_index: int = 0
    is_active: bool = True


class AdUpdate(BaseModel):
    title: Optional[str] = None
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None


class AdResponseAdmin(BaseModel):
    id: int
    title: str
    image_url: str
    link_url: Optional[str]
    order_index: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AdListResponseAdmin(BaseModel):
    ads: List[AdResponseAdmin]
    total: int
    page: int
    page_size: int
    total_pages: int


# ==================== 產品管理 ====================

class ProductCreateAdmin(BaseModel):
    title: str
    price: float
    description: Optional[str] = None
    image: str
    category_id: int
    stock: int = 0
    is_active: bool = True


class ProductUpdateAdmin(BaseModel):
    title: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    image: Optional[str] = None
    category_id: Optional[int] = None
    stock: Optional[int] = None
    is_active: Optional[bool] = None


class ProductResponseAdmin(BaseModel):
    id: int
    title: str
    price: float
    description: Optional[str]
    image: str
    category_id: int
    stock: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ProductListResponseAdmin(BaseModel):
    products: List[ProductResponseAdmin]
    total: int
    page: int
    page_size: int
    total_pages: int


# ==================== 分類管理 ====================

class CategoryCreateAdmin(BaseModel):
    name: str
    parent_id: int = 0
    image: Optional[str] = None
    description: Optional[str] = None


class CategoryUpdateAdmin(BaseModel):
    name: Optional[str] = None
    parent_id: Optional[int] = None
    image: Optional[str] = None
    description: Optional[str] = None


class CategoryResponseAdmin(BaseModel):
    id: int
    name: str
    parent_id: int
    image: Optional[str]
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class CategoryListResponseAdmin(BaseModel):
    categories: List[CategoryResponseAdmin]
    total: int


# ==================== 新聞管理 ====================

class NewsCreateAdmin(BaseModel):
    title: str
    excerpt: Optional[str] = None
    content: str
    image: str
    date: str  # YYYY-MM-DD format


class NewsUpdateAdmin(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    image: Optional[str] = None
    date: Optional[str] = None


class NewsResponseAdmin(BaseModel):
    id: int
    title: str
    excerpt: Optional[str]
    content: str
    image: str
    date: str  # Date as string (YYYY-MM-DD)
    created_at: datetime

    class Config:
        from_attributes = True


class NewsListResponseAdmin(BaseModel):
    news: List[NewsResponseAdmin]
    total: int
    page: int
    page_size: int
    total_pages: int


# ==================== 關於我們管理 ====================

class AboutUsCreateAdmin(BaseModel):
    title: str
    content: str
    image: Optional[str] = None


class AboutUsUpdateAdmin(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    image: Optional[str] = None


class AboutUsResponseAdmin(BaseModel):
    id: int
    title: str
    content: str
    image: Optional[str]
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== FAQ 管理 ====================

class FAQCreateAdmin(BaseModel):
    question: str
    answer: str
    order_index: int = 0


class FAQUpdateAdmin(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    order_index: Optional[int] = None


class FAQResponseAdmin(BaseModel):
    id: int
    question: str
    answer: str
    order_index: int
    created_at: datetime

    class Config:
        from_attributes = True


class FAQListResponseAdmin(BaseModel):
    faqs: List[FAQResponseAdmin]
    total: int


# ==================== 訂單管理 ====================

class OrderResponseAdmin(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: str
    shipping_name: str
    shipping_address: str
    shipping_city: str
    shipping_zip: str
    payment_method: Optional[str]
    items: List[dict]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderListResponseAdmin(BaseModel):
    orders: List[OrderResponseAdmin]
    total: int
    page: int
    page_size: int
    total_pages: int


class OrderStatusUpdate(BaseModel):
    status: str

