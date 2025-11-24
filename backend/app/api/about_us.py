from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.about_us import AboutUs
from app.schemas.about_us import AboutUsResponse

router = APIRouter(prefix="/api/about", tags=["about"])


@router.get("", response_model=AboutUsResponse)
def get_about_us(db: Session = Depends(get_db)):
    """獲取關於我們內容"""
    about = db.query(AboutUs).first()
    
    if not about:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="About us content not found"
        )
    
    return AboutUsResponse.model_validate(about)

