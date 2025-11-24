from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class ProductResponse(BaseModel):
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


class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

