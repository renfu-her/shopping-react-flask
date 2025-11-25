from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from math import ceil

from app.database import get_db
from app.models.user import User
from app.models.product import Product
from app.models.product_category import ProductCategory
from app.schemas.admin import (
    ProductCreateAdmin, ProductUpdateAdmin, ProductResponseAdmin, ProductListResponseAdmin
)
from app.dependencies import get_current_admin

router = APIRouter()


@router.get("/products", response_model=ProductListResponseAdmin)
def get_products(
    search: Optional[str] = Query(None, description="搜尋產品名稱"),
    category_id: Optional[int] = Query(None, description="分類篩選"),
    status_filter: Optional[str] = Query(None, description="狀態篩選 (true/false)"),
    page: int = Query(1, ge=1, description="頁碼"),
    page_size: int = Query(10, ge=1, le=100, description="每頁筆數"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """獲取產品列表（支援搜尋、分類篩選、狀態篩選、分頁）"""
    query = db.query(Product).options(joinedload(Product.category))
    
    if search:
        query = query.filter(Product.title.contains(search))
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if status_filter is not None and status_filter != '':
        is_active = status_filter.lower() == 'true'
        query = query.filter(Product.is_active == is_active)
    
    total = query.count()
    total_pages = ceil(total / page_size) if total > 0 else 0
    products = query.order_by(Product.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    # 構建包含分類名稱的產品響應
    product_responses = []
    for p in products:
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
            "created_at": p.created_at
        }
        product_responses.append(ProductResponseAdmin(**product_dict))
    
    return ProductListResponseAdmin(
        products=product_responses,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.post("/products", response_model=ProductResponseAdmin, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreateAdmin,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """新增產品"""
    # 檢查分類是否存在
    category = db.query(ProductCategory).filter(ProductCategory.id == product_data.category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    new_product = Product(
        title=product_data.title,
        price=product_data.price,
        description=product_data.description,
        image=product_data.image,
        category_id=product_data.category_id,
        stock=product_data.stock,
        is_active=product_data.is_active
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    
    # 重新加載分類關係
    db.refresh(new_product, ["category"])
    
    product_dict = {
        "id": new_product.id,
        "title": new_product.title,
        "price": new_product.price,
        "description": new_product.description,
        "image": new_product.image,
        "category_id": new_product.category_id,
        "category_name": new_product.category.name if new_product.category else None,
        "stock": new_product.stock,
        "is_active": new_product.is_active,
        "created_at": new_product.created_at
    }
    return ProductResponseAdmin(**product_dict)


@router.get("/products/{product_id}", response_model=ProductResponseAdmin)
def get_product(
    product_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """獲取產品詳情"""
    product = db.query(Product).options(joinedload(Product.category)).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
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
        "created_at": product.created_at
    }
    return ProductResponseAdmin(**product_dict)


@router.put("/products/{product_id}", response_model=ProductResponseAdmin)
def update_product(
    product_id: int,
    product_data: ProductUpdateAdmin,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """更新產品"""
    product = db.query(Product).options(joinedload(Product.category)).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    if product_data.title is not None:
        product.title = product_data.title
    if product_data.price is not None:
        product.price = product_data.price
    if product_data.description is not None:
        product.description = product_data.description
    if product_data.image is not None:
        product.image = product_data.image
    if product_data.category_id is not None:
        category = db.query(ProductCategory).filter(ProductCategory.id == product_data.category_id).first()
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        product.category_id = product_data.category_id
    if product_data.stock is not None:
        product.stock = product_data.stock
    if product_data.is_active is not None:
        product.is_active = product_data.is_active
    
    db.commit()
    db.refresh(product, ["category"])
    
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
        "created_at": product.created_at
    }
    return ProductResponseAdmin(**product_dict)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """刪除產品"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    db.delete(product)
    db.commit()
    return None

