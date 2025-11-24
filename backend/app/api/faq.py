from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.faq import FAQ
from app.schemas.faq import FAQResponse

router = APIRouter(prefix="/api/faq", tags=["faq"])


@router.get("", response_model=List[FAQResponse])
def get_faq_list(db: Session = Depends(get_db)):
    """獲取常見問題列表"""
    faqs = db.query(FAQ).order_by(FAQ.order_index.asc()).all()
    
    return [FAQResponse.model_validate(faq) for faq in faqs]

