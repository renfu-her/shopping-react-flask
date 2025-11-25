from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.faq import FAQ
from app.schemas.admin import (
    FAQCreateAdmin, FAQUpdateAdmin, FAQResponseAdmin, FAQListResponseAdmin
)
from app.dependencies import get_current_admin

router = APIRouter()


@router.get("/faq", response_model=FAQListResponseAdmin)
def get_faqs(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """獲取 FAQ 列表"""
    faqs = db.query(FAQ).order_by(FAQ.order_index.asc(), FAQ.created_at.asc()).all()
    return FAQListResponseAdmin(
        faqs=[FAQResponseAdmin.model_validate(f) for f in faqs],
        total=len(faqs)
    )


@router.post("/faq", response_model=FAQResponseAdmin, status_code=status.HTTP_201_CREATED)
def create_faq(
    faq_data: FAQCreateAdmin,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """新增 FAQ"""
    new_faq = FAQ(
        question=faq_data.question,
        answer=faq_data.answer,
        order_index=faq_data.order_index
    )
    db.add(new_faq)
    db.commit()
    db.refresh(new_faq)
    return FAQResponseAdmin.model_validate(new_faq)


@router.get("/faq/{faq_id}", response_model=FAQResponseAdmin)
def get_faq(
    faq_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """獲取 FAQ 詳情"""
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="FAQ not found")
    return FAQResponseAdmin.model_validate(faq)


@router.put("/faq/{faq_id}", response_model=FAQResponseAdmin)
def update_faq(
    faq_id: int,
    faq_data: FAQUpdateAdmin,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """更新 FAQ"""
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="FAQ not found")
    
    if faq_data.question is not None:
        faq.question = faq_data.question
    if faq_data.answer is not None:
        faq.answer = faq_data.answer
    if faq_data.order_index is not None:
        faq.order_index = faq_data.order_index
    
    db.commit()
    db.refresh(faq)
    return FAQResponseAdmin.model_validate(faq)


@router.delete("/faq/{faq_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_faq(
    faq_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """刪除 FAQ"""
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="FAQ not found")
    db.delete(faq)
    db.commit()
    return None

