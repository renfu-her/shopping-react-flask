from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.api import auth, products, cart, categories, orders, news, ads, about_us, faq, home, admin
from app.database import engine, Base
from app.database_migration import add_user_role_status_columns
from app.init_admin import init_admin_user
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

# 执行数据库迁移（添加缺失的字段）
try:
    add_user_role_status_columns()
except Exception as e:
    logger.warning(f"数据库迁移失败，但继续运行: {e}")

# 初始化默认管理员账户
try:
    init_admin_user()
except Exception as e:
    logger.warning(f"初始化管理员账户失败，但继续运行: {e}")

# Create FastAPI app
app = FastAPI(
    title="Shopping Cart API",
    description="Backend API for shopping cart system",
    version="1.0.0"
)

# 添加 Session 中间件（必须在 CORS 之前）
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.session_secret_key,
    max_age=3600 * 24,  # 24 小时
    same_site="lax"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(news.router)
app.include_router(ads.router)
app.include_router(about_us.router)
app.include_router(faq.router)
app.include_router(home.router)
app.include_router(admin.router)  # 後台管理 API

# 靜態文件目錄
static_dir = Path(__file__).parent / "static"
static_dir.mkdir(exist_ok=True)

# 掛載靜態文件
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


@app.get("/backend")
async def admin_frontend():
    """後台管理前端界面 - 重定向到登入頁面"""
    return FileResponse(static_dir / "login.html")


@app.get("/backend/login")
async def admin_login_page():
    """後台管理登入頁面"""
    return FileResponse(static_dir / "login.html")


@app.get("/backend/users")
async def admin_users_page():
    """使用者管理頁面 - 列表"""
    return FileResponse(static_dir / "admin" / "users" / "index.html")


@app.get("/backend/users/add")
async def admin_users_add_page():
    """使用者管理頁面 - 新增"""
    return FileResponse(static_dir / "admin" / "users" / "add-edit.html")


@app.get("/backend/users/edit")
async def admin_users_edit_page():
    """使用者管理頁面 - 編輯"""
    return FileResponse(static_dir / "admin" / "users" / "add-edit.html")


@app.get("/backend/ads")
async def admin_ads_page():
    """Banner 管理頁面 - 列表"""
    return FileResponse(static_dir / "admin" / "ads" / "index.html")


@app.get("/backend/ads/add")
async def admin_ads_add_page():
    """Banner 管理頁面 - 新增"""
    return FileResponse(static_dir / "admin" / "ads" / "add-edit.html")


@app.get("/backend/ads/edit")
async def admin_ads_edit_page():
    """Banner 管理頁面 - 編輯"""
    return FileResponse(static_dir / "admin" / "ads" / "add-edit.html")


@app.get("/backend/products")
async def admin_products_page():
    """產品管理頁面 - 列表"""
    return FileResponse(static_dir / "admin" / "products" / "index.html")


@app.get("/backend/products/add")
async def admin_products_add_page():
    """產品管理頁面 - 新增"""
    return FileResponse(static_dir / "admin" / "products" / "add-edit.html")


@app.get("/backend/products/edit")
async def admin_products_edit_page():
    """產品管理頁面 - 編輯"""
    return FileResponse(static_dir / "admin" / "products" / "add-edit.html")


@app.get("/backend/categories")
async def admin_categories_page():
    """分類管理頁面 - 列表"""
    return FileResponse(static_dir / "admin" / "categories" / "index.html")


@app.get("/backend/categories/add")
async def admin_categories_add_page():
    """分類管理頁面 - 新增"""
    return FileResponse(static_dir / "admin" / "categories" / "add-edit.html")


@app.get("/backend/categories/edit")
async def admin_categories_edit_page():
    """分類管理頁面 - 編輯"""
    return FileResponse(static_dir / "admin" / "categories" / "add-edit.html")


@app.get("/backend/news")
async def admin_news_page():
    """新聞管理頁面 - 列表"""
    return FileResponse(static_dir / "admin" / "news" / "index.html")


@app.get("/backend/news/add")
async def admin_news_add_page():
    """新聞管理頁面 - 新增"""
    return FileResponse(static_dir / "admin" / "news" / "add-edit.html")


@app.get("/backend/news/edit")
async def admin_news_edit_page():
    """新聞管理頁面 - 編輯"""
    return FileResponse(static_dir / "admin" / "news" / "add-edit.html")


@app.get("/backend/about")
async def admin_about_page():
    """關於我們管理頁面 - 列表"""
    return FileResponse(static_dir / "admin" / "about" / "index.html")


@app.get("/backend/about/add")
async def admin_about_add_page():
    """關於我們管理頁面 - 新增"""
    return FileResponse(static_dir / "admin" / "about" / "add-edit.html")


@app.get("/backend/about/edit")
async def admin_about_edit_page():
    """關於我們管理頁面 - 編輯"""
    return FileResponse(static_dir / "admin" / "about" / "add-edit.html")


@app.get("/backend/faq")
async def admin_faq_page():
    """FAQ 管理頁面 - 列表"""
    return FileResponse(static_dir / "admin" / "faq" / "index.html")


@app.get("/backend/faq/add")
async def admin_faq_add_page():
    """FAQ 管理頁面 - 新增"""
    return FileResponse(static_dir / "admin" / "faq" / "add-edit.html")


@app.get("/backend/faq/edit")
async def admin_faq_edit_page():
    """FAQ 管理頁面 - 編輯"""
    return FileResponse(static_dir / "admin" / "faq" / "add-edit.html")


@app.get("/backend/orders")
async def admin_orders_page():
    """訂單管理頁面 - 列表（只讀）"""
    return FileResponse(static_dir / "admin" / "orders" / "index.html")


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Shopping Cart API",
        "version": "1.0.0",
        "docs": "/docs",
        "backend": "/backend"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

