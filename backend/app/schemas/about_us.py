from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AboutUsResponse(BaseModel):
    id: int
    title: str
    content: str
    image: Optional[str]
    updated_at: datetime

    class Config:
        from_attributes = True

