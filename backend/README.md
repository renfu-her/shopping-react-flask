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

- Python 3.10+
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
   - 複製 `.env` 檔案並修改資料庫連接資訊
   - 修改 `SECRET_KEY` 和 `SESSION_SECRET_KEY` 為安全的隨機字串

4. 建立資料庫:
   ```sql
   CREATE DATABASE shopping-react-flask;
   ```

5. 執行應用:
   ```bash
   uv run uvicorn app.main:app --reload
   ```

應用將在 `http://localhost:8000` 啟動。

## API 文檔

啟動應用後，可訪問以下文檔：

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API 端點

### 認證 (`/api/auth`)
- `POST /api/auth/register` - 用戶註冊
- `POST /api/auth/login` - 用戶登入
- `GET /api/auth/me` - 獲取當前用戶資訊

### 產品 (`/api/products`)
- `GET /api/products` - 獲取產品列表（支援分頁、分類篩選）
- `GET /api/products/{id}` - 獲取產品詳情

### 分類 (`/api/categories`)
- `GET /api/categories` - 獲取所有分類（樹狀結構）
- `GET /api/categories/{id}` - 獲取分類詳情

### 購物車 (`/api/cart`)
- `GET /api/cart` - 獲取當前用戶購物車
- `POST /api/cart/items` - 添加商品到購物車
- `PUT /api/cart/items/{item_id}` - 更新購物車項目數量
- `DELETE /api/cart/items/{item_id}` - 從購物車移除商品
- `DELETE /api/cart` - 清空購物車

### 訂單 (`/api/orders`)
- `GET /api/orders` - 獲取當前用戶訂單列表
- `GET /api/orders/{id}` - 獲取訂單詳情
- `POST /api/orders` - 創建訂單（結帳）

### 內容
- `GET /api/ads` - 獲取首頁 Banner
- `GET /api/news` - 獲取新聞列表
- `GET /api/news/{id}` - 獲取新聞詳情
- `GET /api/about` - 獲取關於我們
- `GET /api/faq` - 獲取常見問題
- `GET /api/home/banners` - 獲取首頁 Banner
- `GET /api/home/featured` - 獲取推薦產品

## 資料庫模型

系統包含以下資料表：

1. **users** - 用戶表
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

- 預設資料庫用戶名為 `root`，密碼為空
- 生產環境請務必修改 `.env` 中的 `SECRET_KEY` 和 `SESSION_SECRET_KEY`
- CORS 已設定允許 `localhost:5173` 和 `localhost:3000`，如需修改請編輯 `app/main.py`

