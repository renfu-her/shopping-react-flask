from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.ad import Ad
from app.models.product import Product
from app.schemas.ad import AdResponse
from app.schemas.product import ProductResponse

router = APIRouter(prefix="/api/home", tags=["home"])


@router.get("/banners", response_model=List[AdResponse])
def get_banners(db: Session = Depends(get_db)):
    """獲取首頁 Banner (Ads)"""
    ads = db.query(Ad).filter(
        Ad.is_active == True
    ).order_by(Ad.order_index.asc()).all()
    
    return [AdResponse.model_validate(ad) for ad in ads]


@router.get("/featured", response_model=List[ProductResponse])
def get_featured_products(db: Session = Depends(get_db)):
    """獲取推薦產品（前3個啟用的產品）"""
    products = db.query(Product).filter(
        Product.is_active == True
    ).order_by(Product.created_at.desc()).limit(3).all()
    
    return [ProductResponse.model_validate(product) for product in products]

