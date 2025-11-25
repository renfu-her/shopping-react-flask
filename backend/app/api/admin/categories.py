from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.product import Product
from app.models.product_category import ProductCategory
from app.schemas.admin import (
    CategoryCreateAdmin, CategoryUpdateAdmin, CategoryResponseAdmin, CategoryListResponseAdmin
)
from app.dependencies import get_current_admin

router = APIRouter()


@router.get("/categories", response_model=CategoryListResponseAdmin)
def get_categories(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """獲取分類列表"""
    categories = db.query(ProductCategory).order_by(ProductCategory.parent_id.asc(), ProductCategory.created_at.asc()).all()
    return CategoryListResponseAdmin(
        categories=[CategoryResponseAdmin.model_validate(c) for c in categories],
        total=len(categories)
    )


@router.post("/categories", response_model=CategoryResponseAdmin, status_code=status.HTTP_201_CREATED)
def create_category(
    category_data: CategoryCreateAdmin,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """新增分類"""
    # 如果 parent_id != 0，檢查父分類是否存在
    if category_data.parent_id != 0:
        parent = db.query(ProductCategory).filter(ProductCategory.id == category_data.parent_id).first()
        if not parent:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent category not found")
        # 子分類不能有 image
        category_data.image = None
    
    new_category = ProductCategory(
        name=category_data.name,
        parent_id=category_data.parent_id,
        image=category_data.image if category_data.parent_id == 0 else None,
        description=category_data.description
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return CategoryResponseAdmin.model_validate(new_category)


@router.get("/categories/{category_id}", response_model=CategoryResponseAdmin)
def get_category(
    category_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """獲取分類詳情"""
    category = db.query(ProductCategory).filter(ProductCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return CategoryResponseAdmin.model_validate(category)


@router.put("/categories/{category_id}", response_model=CategoryResponseAdmin)
def update_category(
    category_id: int,
    category_data: CategoryUpdateAdmin,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """更新分類"""
    category = db.query(ProductCategory).filter(ProductCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    if category_data.name is not None:
        category.name = category_data.name
    if category_data.parent_id is not None:
        if category_data.parent_id != 0:
            parent = db.query(ProductCategory).filter(ProductCategory.id == category_data.parent_id).first()
            if not parent:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent category not found")
            category.image = None  # 子分類不能有 image
        category.parent_id = category_data.parent_id
    if category_data.image is not None:
        if category.parent_id == 0:
            category.image = category_data.image
    if category_data.description is not None:
        category.description = category_data.description
    
    db.commit()
    db.refresh(category)
    return CategoryResponseAdmin.model_validate(category)


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """刪除分類"""
    category = db.query(ProductCategory).filter(ProductCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    # 檢查是否有子分類
    children = db.query(ProductCategory).filter(ProductCategory.parent_id == category_id).count()
    if children > 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete category with subcategories")
    
    # 檢查是否有產品使用此分類
    products = db.query(Product).filter(Product.category_id == category_id).count()
    if products > 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete category with products")
    
    db.delete(category)
    db.commit()
    return None

