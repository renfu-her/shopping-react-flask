from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List
from pydantic import BaseModel
import logging

from app.database import get_db
from app.models.user import User
from app.models.product import Product
from app.models.product_image import ProductImage
from app.dependencies import get_current_admin


class ProductImageAdd(BaseModel):
    image_url: str


class ProductImageReorder(BaseModel):
    image_ids: List[int]

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/products/{product_id}/images")
def get_product_images(
    product_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """獲取產品的所有圖片"""
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        
        images = db.query(ProductImage).filter(
            ProductImage.product_id == product_id
        ).order_by(ProductImage.order_index.asc()).all()
        
        return {
            "images": [
                {
                    "id": img.id,
                    "product_id": img.product_id,
                    "image_url": img.image_url,
                    "order_index": img.order_index
                }
                for img in images
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取产品图片失败: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取产品图片失败: {str(e)}"
        )


@router.post("/products/{product_id}/images")
def add_product_image(
    product_id: int,
    image_data: ProductImageAdd,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """為產品添加圖片"""
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        
        # 獲取當前最大的 order_index
        max_order = db.query(ProductImage.order_index).filter(
            ProductImage.product_id == product_id
        ).order_by(ProductImage.order_index.desc()).first()
        
        next_order = (max_order[0] + 1) if max_order else 0
        
        new_image = ProductImage(
            product_id=product_id,
            image_url=image_data.image_url,
            order_index=next_order
        )
        db.add(new_image)
        db.commit()
        db.refresh(new_image)
        
        return {
            "id": new_image.id,
            "product_id": new_image.product_id,
            "image_url": new_image.image_url,
            "order_index": new_image.order_index
        }
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"数据库操作错误: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="添加产品图片失败"
        )
    except Exception as e:
        logger.error(f"添加产品图片时发生错误: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"添加产品图片失败: {str(e)}"
        )


@router.put("/products/{product_id}/images/reorder")
def reorder_product_images(
    product_id: int,
    reorder_data: ProductImageReorder,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """重新排序產品圖片"""
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        
        # 更新每個圖片的 order_index
        for index, image_id in enumerate(reorder_data.image_ids):
            image = db.query(ProductImage).filter(
                ProductImage.id == image_id,
                ProductImage.product_id == product_id
            ).first()
            if image:
                image.order_index = index
        
        db.commit()
        return {"message": "图片排序已更新"}
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"数据库操作错误: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="更新图片排序失败"
        )
    except Exception as e:
        logger.error(f"更新图片排序时发生错误: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新图片排序失败: {str(e)}"
        )


@router.delete("/products/{product_id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product_image(
    product_id: int,
    image_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """刪除產品圖片"""
    try:
        image = db.query(ProductImage).filter(
            ProductImage.id == image_id,
            ProductImage.product_id == product_id
        ).first()
        
        if not image:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
        
        db.delete(image)
        db.commit()
        return None
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"数据库操作错误: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="删除产品图片失败"
        )
    except Exception as e:
        logger.error(f"删除产品图片时发生错误: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除产品图片失败: {str(e)}"
        )

