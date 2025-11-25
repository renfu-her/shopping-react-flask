from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.about_us import AboutUs
from app.schemas.admin import (
    AboutUsCreateAdmin, AboutUsUpdateAdmin, AboutUsResponseAdmin
)
from app.dependencies import get_current_admin

router = APIRouter()


@router.get("/about", response_model=AboutUsResponseAdmin)
def get_about_us(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """獲取關於我們"""
    about = db.query(AboutUs).first()
    if not about:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="About us not found")
    return AboutUsResponseAdmin.model_validate(about)


@router.post("/about", response_model=AboutUsResponseAdmin, status_code=status.HTTP_201_CREATED)
def create_about_us(
    about_data: AboutUsCreateAdmin,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """新增關於我們（如果已存在則更新）"""
    about = db.query(AboutUs).first()
    if about:
        # 更新現有
        about.title = about_data.title
        about.content = about_data.content
        if about_data.image is not None:
            about.image = about_data.image
    else:
        # 創建新
        about = AboutUs(
            title=about_data.title,
            content=about_data.content,
            image=about_data.image
        )
        db.add(about)
    db.commit()
    db.refresh(about)
    return AboutUsResponseAdmin.model_validate(about)


@router.put("/about", response_model=AboutUsResponseAdmin)
def update_about_us(
    about_data: AboutUsUpdateAdmin,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """更新關於我們"""
    about = db.query(AboutUs).first()
    if not about:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="About us not found")
    
    if about_data.title is not None:
        about.title = about_data.title
    if about_data.content is not None:
        about.content = about_data.content
    if about_data.image is not None:
        about.image = about_data.image
    
    db.commit()
    db.refresh(about)
    return AboutUsResponseAdmin.model_validate(about)

