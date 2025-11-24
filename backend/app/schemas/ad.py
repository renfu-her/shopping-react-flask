from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AdResponse(BaseModel):
    id: int
    title: str
    image_url: str
    link_url: Optional[str]
    order_index: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

