from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from math import ceil
from datetime import datetime as dt

from app.database import get_db
from app.models.user import User
from app.models.news import News
from app.schemas.admin import (
    NewsCreateAdmin, NewsUpdateAdmin, NewsResponseAdmin, NewsListResponseAdmin
)
from app.dependencies import get_current_admin

router = APIRouter()


@router.get("/news", response_model=NewsListResponseAdmin)
def get_news(
    search: Optional[str] = Query(None, description="搜尋新聞標題"),
    page: int = Query(1, ge=1, description="頁碼"),
    page_size: int = Query(10, ge=1, le=100, description="每頁筆數"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """獲取新聞列表"""
    query = db.query(News)
    if search:
        query = query.filter(News.title.contains(search))
    
    total = query.count()
    total_pages = ceil(total / page_size) if total > 0 else 0
    news_items = query.order_by(News.date.desc(), News.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    return NewsListResponseAdmin(
        news=[NewsResponseAdmin.model_validate(n) for n in news_items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.post("/news", response_model=NewsResponseAdmin, status_code=status.HTTP_201_CREATED)
def create_news(
    news_data: NewsCreateAdmin,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """新增新聞"""
    news_date = dt.strptime(news_data.date, "%Y-%m-%d").date()
    
    new_news = News(
        title=news_data.title,
        excerpt=news_data.excerpt,
        content=news_data.content,
        image=news_data.image,
        date=news_date
    )
    db.add(new_news)
    db.commit()
    db.refresh(new_news)
    news_dict = {
        "id": new_news.id,
        "title": new_news.title,
        "excerpt": new_news.excerpt,
        "content": new_news.content,
        "image": new_news.image,
        "date": new_news.date.strftime("%Y-%m-%d") if new_news.date else "",
        "created_at": new_news.created_at
    }
    return NewsResponseAdmin(**news_dict)


@router.get("/news/{news_id}", response_model=NewsResponseAdmin)
def get_news(
    news_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """獲取新聞詳情"""
    news_item = db.query(News).filter(News.id == news_id).first()
    if not news_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News not found")
    news_dict = {
        "id": news_item.id,
        "title": news_item.title,
        "excerpt": news_item.excerpt,
        "content": news_item.content,
        "image": news_item.image,
        "date": news_item.date.strftime("%Y-%m-%d") if news_item.date else "",
        "created_at": news_item.created_at
    }
    return NewsResponseAdmin(**news_dict)


@router.put("/news/{news_id}", response_model=NewsResponseAdmin)
def update_news(
    news_id: int,
    news_data: NewsUpdateAdmin,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """更新新聞"""
    news_item = db.query(News).filter(News.id == news_id).first()
    if not news_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News not found")
    
    if news_data.title is not None:
        news_item.title = news_data.title
    if news_data.excerpt is not None:
        news_item.excerpt = news_data.excerpt
    if news_data.content is not None:
        news_item.content = news_data.content
    if news_data.image is not None:
        news_item.image = news_data.image
    if news_data.date is not None:
        news_item.date = dt.strptime(news_data.date, "%Y-%m-%d").date()
    
    db.commit()
    db.refresh(news_item)
    news_dict = {
        "id": news_item.id,
        "title": news_item.title,
        "excerpt": news_item.excerpt,
        "content": news_item.content,
        "image": news_item.image,
        "date": news_item.date.strftime("%Y-%m-%d") if news_item.date else "",
        "created_at": news_item.created_at
    }
    return NewsResponseAdmin(**news_dict)


@router.delete("/news/{news_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_news(
    news_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """刪除新聞"""
    news_item = db.query(News).filter(News.id == news_id).first()
    if not news_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News not found")
    db.delete(news_item)
    db.commit()
    return None

