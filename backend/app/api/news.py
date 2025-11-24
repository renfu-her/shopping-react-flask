from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.news import News
from app.schemas.news import NewsResponse, NewsListResponse

router = APIRouter(prefix="/api/news", tags=["news"])


@router.get("", response_model=NewsListResponse)
def get_news_list(db: Session = Depends(get_db)):
    """獲取新聞列表"""
    news_items = db.query(News).order_by(News.date.desc(), News.created_at.desc()).all()
    
    return NewsListResponse(
        news=[NewsResponse.model_validate(item) for item in news_items],
        total=len(news_items)
    )


@router.get("/{news_id}", response_model=NewsResponse)
def get_news_detail(news_id: int, db: Session = Depends(get_db)):
    """獲取新聞詳情"""
    news_item = db.query(News).filter(News.id == news_id).first()
    
    if not news_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="News not found"
        )
    
    return NewsResponse.model_validate(news_item)

