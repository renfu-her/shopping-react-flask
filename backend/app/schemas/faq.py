from pydantic import BaseModel
from datetime import datetime
from typing import List


class FAQResponse(BaseModel):
    id: int
    question: str
    answer: str
    order_index: int
    created_at: datetime

    class Config:
        from_attributes = True

