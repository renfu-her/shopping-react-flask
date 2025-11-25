from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class CategoryResponse(BaseModel):
    id: int
    name: str
    parent_id: Optional[int]  # None 表示根分類
    image: Optional[str]
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class CategoryTreeResponse(CategoryResponse):
    children: List["CategoryTreeResponse"] = []

    class Config:
        from_attributes = True

