# Shopping Cart Backend API

FastAPI 後端系統，提供購物車、訂單、產品管理等完整功能。

## 技術棧

- **框架**: FastAPI
- **ORM**: SQLAlchemy
- **資料庫**: MySQL
- **認證**: JWT Token
- **套件管理**: uv

## 安裝與設定

### 前置需求

- Python 3.12.12（推薦，已在 `.python-version` 中指定）
- MySQL 資料庫
- uv (套件管理工具)

### 安裝步驟

1. 安裝 uv (如果尚未安裝):
   ```bash
   pip install uv
   ```

2. 安裝依賴:
   ```bash
   cd backend
   uv sync
   ```

3. 設定環境變數:
   ```bash
   cp .env.example .env
   ```
   然後編輯 `.env` 檔案：
   - 修改資料庫連接資訊（預設：username=root, password=空, database=shopping-react-flask）
   - 修改 `SECRET_KEY` 和 `SESSION_SECRET_KEY` 為安全的隨機字串
   
   資料庫配置方式：
   - **方式 1（推薦）**: 使用 `DATABASE_URL`（完整 URL）
     - 格式: `mysql+pymysql://使用者名稱:密碼@主機:埠號/資料庫名稱`
     - 範例: `DATABASE_URL=mysql+pymysql://root@localhost/shopping-react-flask`
     - 如果密碼為空，可以省略密碼部分
   - **方式 2**: 使用分開的參數 `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
     - 如果設定了 `DATABASE_URL`，這些參數將被忽略

4. 建立資料庫（可選）:
   - 系統會在啟動時自動檢查並建立資料庫（如果不存在）
   - 或者手動建立：
     ```sql
     CREATE DATABASE shopping-react-flask;
     ```

5. 執行應用:
   ```bash
   uv run uvicorn app.main:app --reload
   ```

應用將在 `http://localhost:8000` 啟動。

## API 文檔

啟動應用後，可存取以下文檔：

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- 後台管理介面: `http://localhost:8000/backend`（可直接在瀏覽器存取）
- 後台管理 API: `http://localhost:8000/backend/admin`

## API 端點

### 認證 (`/api/auth`)
- `POST /api/auth/register` - 使用者註冊
- `POST /api/auth/login` - 使用者登入
- `GET /api/auth/me` - 獲取當前使用者資訊

### 產品 (`/api/products`)
- `GET /api/products` - 獲取產品列表（支援分頁、分類篩選）
- `GET /api/products/{id}` - 獲取產品詳情

### 分類 (`/api/categories`)
- `GET /api/categories` - 獲取所有分類（樹狀結構）
- `GET /api/categories/{id}` - 獲取分類詳情

### 購物車 (`/api/cart`)
- `GET /api/cart` - 獲取當前使用者購物車
- `POST /api/cart/items` - 新增商品到購物車
- `PUT /api/cart/items/{item_id}` - 更新購物車項目數量
- `DELETE /api/cart/items/{item_id}` - 從購物車移除商品
- `DELETE /api/cart` - 清空購物車

### 訂單 (`/api/orders`)
- `GET /api/orders` - 獲取當前使用者訂單列表
- `GET /api/orders/{id}` - 獲取訂單詳情
- `POST /api/orders` - 建立訂單（結帳）

### 內容
- `GET /api/ads` - 獲取首頁 Banner
- `GET /api/news` - 獲取新聞列表
- `GET /api/news/{id}` - 獲取新聞詳情
- `GET /api/about` - 獲取關於我們
- `GET /api/faq` - 獲取常見問題
- `GET /api/home/banners` - 獲取首頁 Banner
- `GET /api/home/featured` - 獲取推薦產品

### 後台管理 (`/backend/admin`)
- `POST /backend/admin/login` - 管理員登入
- `GET /backend/admin/users` - 獲取使用者列表（支援搜尋、角色篩選、狀態篩選、分頁）
- `POST /backend/admin/users` - 新增使用者
- `GET /backend/admin/users/{id}` - 獲取使用者詳情
- `PUT /backend/admin/users/{id}` - 更新使用者
- `DELETE /backend/admin/users/{id}` - 刪除使用者
- `GET /backend/admin/banners` - 獲取 Banner 列表（支援搜尋、狀態篩選、分頁）
- `POST /backend/admin/banners` - 新增 Banner
- `GET /backend/admin/banners/{id}` - 獲取 Banner 詳情
- `PUT /backend/admin/banners/{id}` - 更新 Banner
- `DELETE /backend/admin/banners/{id}` - 刪除 Banner
- `PATCH /backend/admin/banners/{id}/toggle-status` - 切換 Banner 狀態（啟用/停用）

## 資料庫模型

系統包含以下資料表：

1. **users** - 使用者表
2. **ads** - 首頁 Banner
3. **product_categories** - 產品分類
4. **products** - 產品
5. **carts** - 購物車
6. **cart_items** - 購物車項目
7. **orders** - 訂單
8. **order_items** - 訂單項目
9. **news** - 新聞
10. **about_us** - 關於我們
11. **faq** - 常見問題

## 開發

### 專案結構

```
backend/
├── app/
│   ├── api/          # API 路由
│   ├── core/         # 核心功能（認證等）
│   ├── models/       # SQLAlchemy 模型
│   ├── schemas/      # Pydantic 模式
│   ├── config.py     # 配置
│   ├── database.py   # 資料庫連接
│   ├── dependencies.py # 依賴注入
│   └── main.py       # 應用入口
├── pyproject.toml    # 專案配置
└── .env              # 環境變數
```

## 注意事項

- 預設資料庫使用者名稱為 `root`，密碼為空
- 生產環境請務必修改 `.env` 中的 `SECRET_KEY` 和 `SESSION_SECRET_KEY`
- CORS 已設定允許 `localhost:5173` 和 `localhost:3000`，如需修改請編輯 `app/main.py`

