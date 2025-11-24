from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.ad import Ad
from app.schemas.ad import AdResponse

router = APIRouter(prefix="/api/ads", tags=["ads"])


@router.get("", response_model=List[AdResponse])
def get_ads(db: Session = Depends(get_db)):
    """獲取首頁 Banner（僅返回啟用的）"""
    ads = db.query(Ad).filter(
        Ad.is_active == True
    ).order_by(Ad.order_index.asc()).all()
    
    return [AdResponse.model_validate(ad) for ad in ads]

