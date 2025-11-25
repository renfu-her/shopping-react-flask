from fastapi import APIRouter
from .login import router as login_router
from .users import router as users_router
from .ads import router as ads_router
from .products import router as products_router
from .categories import router as categories_router
from .news import router as news_router
from .about import router as about_router
from .faq import router as faq_router
from .orders import router as orders_router

router = APIRouter(prefix="/backend/admin", tags=["admin"])

# 包含所有子路由
router.include_router(login_router)
router.include_router(users_router)
router.include_router(ads_router)
router.include_router(products_router)
router.include_router(categories_router)
router.include_router(news_router)
router.include_router(about_router)
router.include_router(faq_router)
router.include_router(orders_router)

