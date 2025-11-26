from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.product_category import ProductCategory
from app.models.product import Product
from app.schemas.category import CategoryResponse, CategoryTreeResponse
from app.schemas.product import ProductResponse

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=List[CategoryTreeResponse])
def get_categories(db: Session = Depends(get_db)):
    """獲取所有分類（樹狀結構）"""
    # 按 sort_order 排序，相同時按 created_at 排序
    all_categories = db.query(ProductCategory).order_by(
        ProductCategory.sort_order.asc(),
        ProductCategory.created_at.asc()
    ).all()
    
    # 建立分類字典，並確保每個分類的 children 列表是空的（避免 SQLAlchemy relationship 自動填充）
    category_dict = {}
    for cat in all_categories:
        category_node = CategoryTreeResponse.model_validate(cat)
        category_node.children = []  # 明確設置為空列表，避免 SQLAlchemy 自動填充
        category_dict[cat.id] = category_node
    
    # 建立樹狀結構
    root_categories = []
    children_ids_by_parent = {}  # 追蹤每個父分類已經添加的子分類 ID
    
    for cat in all_categories:
        category_node = category_dict[cat.id]
        if cat.parent_id is None:  # 根分類的 parent_id 為 None
            root_categories.append(category_node)
        else:
            # 子分類添加到父分類的 children 中
            if cat.parent_id in category_dict:
                # 初始化父分類的子分類 ID 集合
                if cat.parent_id not in children_ids_by_parent:
                    children_ids_by_parent[cat.parent_id] = set()
                
                # 確保不會重複添加（使用 ID 檢查）
                if cat.id not in children_ids_by_parent[cat.parent_id]:
                    category_dict[cat.parent_id].children.append(category_node)
                    children_ids_by_parent[cat.parent_id].add(cat.id)
    
    # 對根分類和子分類進行排序
    root_categories.sort(key=lambda x: (x.sort_order, x.created_at))
    for root_cat in root_categories:
        if root_cat.children:
            # 最終去重並排序（以防萬一）
            seen_ids = set()
            unique_children = []
            for child in root_cat.children:
                if child.id not in seen_ids:
                    seen_ids.add(child.id)
                    unique_children.append(child)
            root_cat.children = sorted(unique_children, key=lambda x: (x.sort_order, x.created_at))
    
    return root_categories


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    """獲取分類詳情"""
    category = db.query(ProductCategory).filter(ProductCategory.id == category_id).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    return CategoryResponse.model_validate(category)


@router.get("/{category_id}/products", response_model=List[ProductResponse])
def get_category_products(category_id: int, db: Session = Depends(get_db)):
    """獲取分類下的產品"""
    category = db.query(ProductCategory).filter(ProductCategory.id == category_id).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # 獲取該分類及其子分類的所有產品
    category_ids = [category_id]
    # 簡單實現：只獲取直接分類的產品
    # 如果需要遞歸獲取子分類產品，需要更複雜的查詢
    
    products = db.query(Product).filter(
        Product.category_id.in_(category_ids),
        Product.is_active == True
    ).all()
    
    return [ProductResponse.model_validate(p) for p in products]

