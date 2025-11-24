from pydantic import BaseModel
from datetime import datetime, date
from typing import List, Optional


class NewsResponse(BaseModel):
    id: int
    title: str
    excerpt: Optional[str]
    content: str
    image: str
    date: date
    created_at: datetime

    class Config:
        from_attributes = True


class NewsListResponse(BaseModel):
    news: List[NewsResponse]
    total: int

