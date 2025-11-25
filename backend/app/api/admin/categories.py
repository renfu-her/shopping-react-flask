from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import logging

from app.database import get_db
from app.models.user import User
from app.models.product import Product
from app.models.product_category import ProductCategory
from app.schemas.admin import (
    CategoryCreateAdmin, CategoryUpdateAdmin, CategoryResponseAdmin, CategoryListResponseAdmin
)
from app.dependencies import get_current_admin

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/categories", response_model=CategoryListResponseAdmin)
def get_categories(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """獲取分類列表"""
    try:
        categories = db.query(ProductCategory).order_by(ProductCategory.parent_id.asc(), ProductCategory.created_at.asc()).all()
        return CategoryListResponseAdmin(
            categories=[CategoryResponseAdmin.model_validate(c) for c in categories],
            total=len(categories)
        )
    except SQLAlchemyError as e:
        logger.error(f"数据库查询错误: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取分类列表失败"
        )
    except Exception as e:
        logger.error(f"获取分类列表时发生错误: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取分类列表失败: {str(e)}"
        )


@router.post("/categories", response_model=CategoryResponseAdmin, status_code=status.HTTP_201_CREATED)
def create_category(
    category_data: CategoryCreateAdmin,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """新增分類"""
    try:
        # 验证必填字段
        if not category_data.name or not category_data.name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="分类名称不能为空"
            )
        
        # 如果 parent_id != 0，檢查父分類是否存在
        if category_data.parent_id != 0:
            parent = db.query(ProductCategory).filter(ProductCategory.id == category_data.parent_id).first()
            if not parent:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent category not found")
            # 子分類不能有 image
            image_value = None
        else:
            # 父分類可以有 image（Font Awesome 图标类名）
            image_value = category_data.image if category_data.image else None
        
        new_category = ProductCategory(
            name=category_data.name.strip(),
            parent_id=category_data.parent_id,
            image=image_value,
            description=category_data.description.strip() if category_data.description else None
        )
        db.add(new_category)
        db.commit()
        db.refresh(new_category)
        return CategoryResponseAdmin.model_validate(new_category)
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"数据库操作错误: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="创建分类失败"
        )
    except Exception as e:
        logger.error(f"创建分类时发生错误: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建分类失败: {str(e)}"
        )


@router.get("/categories/{category_id}", response_model=CategoryResponseAdmin)
def get_category(
    category_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """獲取分類詳情"""
    try:
        category = db.query(ProductCategory).filter(ProductCategory.id == category_id).first()
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        return CategoryResponseAdmin.model_validate(category)
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"数据库查询错误: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取分类详情失败"
        )
    except Exception as e:
        logger.error(f"获取分类详情时发生错误: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取分类详情失败: {str(e)}"
        )


@router.put("/categories/{category_id}", response_model=CategoryResponseAdmin)
def update_category(
    category_id: int,
    category_data: CategoryUpdateAdmin,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """更新分類"""
    try:
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
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"数据库操作错误: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="更新分类失败"
        )
    except Exception as e:
        logger.error(f"更新分类时发生错误: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新分类失败: {str(e)}"
        )


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """刪除分類"""
    try:
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
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"数据库操作错误: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="删除分类失败"
        )
    except Exception as e:
        logger.error(f"删除分类时发生错误: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除分类失败: {str(e)}"
        )

