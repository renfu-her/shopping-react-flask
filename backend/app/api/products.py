from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List
from app.database import get_db
from app.models.product import Product
from app.models.product_category import ProductCategory
from app.schemas.product import ProductResponse, ProductListResponse, ProductImageResponse
from math import ceil

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=ProductListResponse)
def get_products(
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(9, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """獲取產品列表（支援分類篩選、分頁）"""
    query = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.images)
    ).filter(Product.is_active == True)
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    total = query.count()
    total_pages = ceil(total / page_size) if total > 0 else 0
    
    products = query.offset((page - 1) * page_size).limit(page_size).all()
    
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
    
    return ProductListResponse(
        products=product_responses,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """獲取產品詳情"""
    product = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.images)
    ).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # 構建產品圖片列表
    product_images = [
        ProductImageResponse(
            id=img.id,
            image_url=img.image_url,
            order_index=img.order_index
        )
        for img in sorted(product.images, key=lambda x: x.order_index) if product.images
    ]
    
    product_dict = {
        "id": product.id,
        "title": product.title,
        "price": product.price,
        "description": product.description,
        "image": product.image,
        "category_id": product.category_id,
        "category_name": product.category.name if product.category else None,
        "stock": product.stock,
        "is_active": product.is_active,
        "created_at": product.created_at,
        "product_images": product_images
    }
    return ProductResponse(**product_dict)


@router.get("/categories/list", response_model=List[dict])
def get_categories_list(db: Session = Depends(get_db)):
    """獲取分類列表（簡單列表）"""
    categories = db.query(ProductCategory).all()
    return [
        {
            "id": cat.id,
            "name": cat.name,
            "parent_id": cat.parent_id,
            "image": cat.image if cat.parent_id is None else None
        }
        for cat in categories
    ]

