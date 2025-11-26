from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models.ad import Ad
from app.models.product import Product
from app.schemas.ad import AdResponse
from app.schemas.product import ProductResponse, ProductImageResponse

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
    products = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.images)
    ).filter(
        Product.is_active == True
    ).order_by(Product.created_at.desc()).limit(3).all()
    
    # 構建包含分類名稱和圖片的產品響應
    product_responses = []
    for p in products:
        # 構建產品圖片列表
        product_images = [
            ProductImageResponse(
                id=img.id,
                image_url=img.image_url,
                order_index=img.order_index
            )
            for img in sorted(p.images, key=lambda x: x.order_index) if p.images
        ]
        
        product_dict = {
            "id": p.id,
            "title": p.title,
            "price": p.price,
            "description": p.description,
            "image": p.image,
            "category_id": p.category_id,
            "category_name": p.category.name if p.category else None,
            "stock": p.stock,
            "is_active": p.is_active,
            "created_at": p.created_at,
            "product_images": product_images
        }
        product_responses.append(ProductResponse(**product_dict))
    
    return product_responses


@router.get("/hot", response_model=List[ProductResponse])
def get_hot_products(db: Session = Depends(get_db)):
    """獲取熱門產品（is_hot=True 的啟用產品）"""
    products = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.images)
    ).filter(
        Product.is_active == True,
        Product.is_hot == True
    ).order_by(Product.created_at.desc()).all()
    
    # 構建包含分類名稱和圖片的產品響應
    product_responses = []
    for p in products:
        # 構建產品圖片列表
        product_images = [
            ProductImageResponse(
                id=img.id,
                image_url=img.image_url,
                order_index=img.order_index
            )
            for img in sorted(p.images, key=lambda x: x.order_index) if p.images
        ]
        
        product_dict = {
            "id": p.id,
            "title": p.title,
            "price": p.price,
            "description": p.description,
            "image": p.image,
            "category_id": p.category_id,
            "category_name": p.category.name if p.category else None,
            "stock": p.stock,
            "is_active": p.is_active,
            "created_at": p.created_at,
            "product_images": product_images
        }
        product_responses.append(ProductResponse(**product_dict))
    
    return product_responses

