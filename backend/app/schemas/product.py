from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class ProductImageResponse(BaseModel):
    id: int
    image_url: str
    order_index: int

    class Config:
        from_attributes = True


class ProductResponse(BaseModel):
    id: int
    title: str
    price: float
    description: Optional[str]
    image: str
    category_id: int
    category_name: Optional[str] = None
    stock: int
    is_active: bool
    created_at: datetime
    product_images: List[ProductImageResponse] = []

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

