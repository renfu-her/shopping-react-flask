# Frontend 更改記錄 (CHANGED)

## [2025-11-26 21:23:35] - 重構 App.tsx 拆分成多個模組

### 修改內容

#### 將大型 App.tsx 文件拆分成多個模組
- **時間**: 2025-11-26 21:23:35
- **目的**: 提高代碼可維護性和可讀性，將 565 行的 App.tsx 拆分成多個專責模組
- **修改檔案**:
  - `data/mockData.ts` - 存放模擬數據（PRODUCTS, NEWS_ITEMS）
  - `context/AppContext.tsx` - 應用狀態管理（用戶、購物車、分類等）
  - `components/layout/Navbar.tsx` - 導航欄組件
  - `components/layout/Footer.tsx` - 頁腳組件
  - `pages/HomePage.tsx` - 首頁
  - `pages/ShopPage.tsx` - 商店頁
  - `pages/ProductDetailPage.tsx` - 產品詳情頁
  - `pages/NewsPage.tsx` - 新聞列表頁
  - `pages/NewsDetailPage.tsx` - 新聞詳情頁
  - `pages/AboutPage.tsx` - 關於我們頁
  - `pages/CartPage.tsx` - 購物車頁
  - `pages/CheckoutPage.tsx` - 結帳頁
  - `pages/SignPage.tsx` - 登錄/註冊頁
  - `pages/OrderSuccessPage.tsx` - 訂單成功頁
  - `hooks/useAiContext.ts` - AI 上下文 Hook
  - `App.tsx` - 主應用組件（僅包含路由配置）

### 變更詳情

#### 目錄結構
```
frontend/
├── data/
│   └── mockData.ts          # 模擬數據
├── context/
│   └── AppContext.tsx       # 應用狀態管理
├── components/
│   └── layout/
│       ├── Navbar.tsx        # 導航欄
│       └── Footer.tsx        # 頁腳
├── pages/
│   ├── HomePage.tsx         # 首頁
│   ├── ShopPage.tsx         # 商店頁
│   ├── ProductDetailPage.tsx # 產品詳情
│   ├── NewsPage.tsx         # 新聞列表
│   ├── NewsDetailPage.tsx   # 新聞詳情
│   ├── AboutPage.tsx        # 關於我們
│   ├── CartPage.tsx         # 購物車
│   ├── CheckoutPage.tsx     # 結帳
│   ├── SignPage.tsx         # 登錄/註冊
│   └── OrderSuccessPage.tsx # 訂單成功
├── hooks/
│   └── useAiContext.ts      # AI 上下文 Hook
└── App.tsx                   # 主應用（路由配置）
```

#### 狀態管理
- **AppContext**: 使用 React Context API 管理全局狀態
  - 用戶狀態（user）
  - 購物車（cart）
  - 分類選擇（selectedCategory）
  - 分頁（currentPage）
  - 購物車操作方法（addToCart, updateQuantity, removeFromCart）
  - 用戶操作方法（handleLogin, handleLogout）

#### 組件分離
- **Layout 組件**: Navbar 和 Footer 獨立成組件
- **Page 組件**: 每個路由對應一個獨立的頁面組件
- **Hook**: AI 上下文邏輯提取為自定義 Hook

#### 數據管理
- **mockData.ts**: 集中管理所有模擬數據
  - PRODUCTS 數組
  - NEWS_ITEMS 數組
  - ITEMS_PER_PAGE 常量

### 技術細節

#### Context API 使用
```typescript
// 提供全局狀態
<AppProvider>
  <AppContent />
</AppProvider>

// 在組件中使用
const { user, cart, addToCart } = useApp();
```

#### 路由配置
```typescript
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/shop" element={<ShopPage />} />
  // ... 其他路由
</Routes>
```

### 優勢
- **可維護性**: 每個文件職責單一，易於理解和修改
- **可重用性**: 組件和 Hook 可以在其他地方重用
- **可測試性**: 獨立的組件更容易進行單元測試
- **可擴展性**: 添加新頁面或功能更加容易

### 影響範圍
- **代碼組織**: 大幅改善代碼結構
- **開發體驗**: 更容易找到和修改特定功能
- **性能**: 無影響，僅為代碼重構

---

## [2025-11-26 21:17:49] - 實現基於 React Router 的路由系統

### 修改內容

#### 將狀態管理轉換為路由系統
- **時間**: 2025-11-26 21:17:49
- **功能**: 使用 React Router 實現 URL 路由，替換原有的狀態管理方式
- **修改檔案**:
  - `App.tsx` - 完全重寫，使用 React Router
  - `package.json` - 添加 `react-router-dom` 依賴

### 變更詳情

#### 路由路徑映射
- `/` - 首頁 (Home)
- `/shop` - 商店 (Shop)
- `/product/:id` - 產品詳情
- `/news` - 新聞列表
- `/news/:id` - 新聞詳情
- `/about` - 關於我們
- `/sign` - 登錄/註冊
- `/cart` - 購物車
- `/checkout` - 結帳
- `/shop-finish` - 結帳完成

#### 技術實現
- **BrowserRouter**: 使用 `BrowserRouter` 包裹整個應用
- **Routes & Route**: 使用 `Routes` 和 `Route` 定義路由
- **useNavigate**: 使用 `useNavigate` hook 進行程序化導航
- **useLocation**: 使用 `useLocation` hook 獲取當前路徑
- **useParams**: 使用 `useParams` hook 獲取路由參數

#### 導航更新
- 所有 `setView` 調用改為 `navigate` 調用
- 所有按鈕和鏈接使用路由路徑
- Navbar 使用 `location.pathname` 判斷當前活動路由
- 產品和新聞詳情頁面使用動態路由參數

#### 保持的功能
- 所有原有功能保持不變
- 購物車、用戶狀態等狀態管理保持不變
- 組件結構和 UI 保持不變
- AI Assistant 上下文檢測基於路由路徑

### 技術細節

#### 路由結構
```typescript
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/shop" element={<ShopPage />} />
  <Route path="/product/:id" element={<ProductDetailPage />} />
  <Route path="/news" element={<NewsPage />} />
  <Route path="/news/:id" element={<NewsDetailPage />} />
  <Route path="/about" element={<AboutPage />} />
  <Route path="/cart" element={<CartPage />} />
  <Route path="/checkout" element={<CheckoutPage />} />
  <Route path="/sign" element={<SignPage />} />
  <Route path="/shop-finish" element={<OrderSuccess />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

#### 導航示例
```typescript
// 之前
setView(AppView.PRODUCT_LIST);

// 現在
navigate('/shop');
```

### 影響範圍
- **導航**: 所有頁面導航現在使用 URL 路由
- **瀏覽器**: 支持瀏覽器前進/後退按鈕
- **分享**: 可以分享特定頁面的 URL
- **SEO**: 改善 SEO 友好性（如果部署 SSR）

### 注意事項
1. 需要運行 `npm install` 安裝 `react-router-dom` 依賴
2. 所有路由路徑必須符合規範（/shop, /news, /about, /sign, /cart, /checkout, /shop-finish）
3. 產品和新聞詳情使用動態路由參數

---

## [2025-11-26 21:00:53] - 添加首頁熱門產品 API 服務

### 修改內容

#### 添加熱門產品 API 服務
- **時間**: 2025-11-26 21:00:53
- **功能**: 在 API 服務中添加獲取熱門產品的函數
- **修改檔案**:
  - `services/api.ts` - 添加 `fetchHotProducts` 函數和 `Product` 接口定義

### 變更詳情

#### API 服務
- **新增函數**: `fetchHotProducts()`
  - 調用後端 `/api/home/hot` 端點
  - 返回熱門產品列表（`Product[]`）
  - 包含錯誤處理

#### 類型定義
- **新增接口**: `Product`
  - 定義完整的產品數據結構
  - 包含基本字段、分類信息、產品圖片列表等

### 使用方式
```typescript
import { fetchHotProducts } from './services/api';

const hotProducts = await fetchHotProducts();
```

### 影響範圍
- **API 服務**: 新增熱門產品獲取功能
- **準備工作**: 為首頁顯示熱門產品提供數據支持

---

## [2025-11-26 16:25:00] - 修正 Ads 圖片 URL 處理

### 說明

修正廣告圖片 URL 處理邏輯，將後端返回的相對路徑轉換為完整 URL。

### 修改內容

- **更新 Home 組件** (`frontend/components/Home.tsx`)
  - 新增 `getImageUrl()` 輔助函數
  - 自動將相對路徑（如 `/static/uploads/...`）轉換為完整 URL（`http://localhost:8000/static/uploads/...`）
  - 如果已經是完整 URL（以 `http://` 或 `https://` 開頭），則直接使用

### 影響的檔案

- `frontend/components/Home.tsx`

### 技術細節

- 檢查 URL 是否為相對路徑
- 相對路徑自動加上 `http://localhost:8000` 前綴
- 支援絕對 URL 和相對路徑兩種格式

---

## [2025-11-26 16:21:57] - 整合 Categories 和 Ads API

### 說明

將前端頁面的分類選單和 Banner 改為從後端 API 動態載入，取代原本的硬編碼資料。

### 修改內容

1. **新增 API 服務檔案** (`frontend/services/api.ts`)
   - 建立統一的 API 呼叫服務
   - 定義 `fetchCategories()` 函數：從 `/api/categories` 取得分類樹狀結構
   - 定義 `fetchAds()` 函數：從 `/api/ads` 取得啟用的廣告列表
   - API 基礎 URL：`http://localhost:8000/api`

2. **更新類型定義** (`frontend/types.ts`)
   - 新增 `Category` 介面：對應後端 CategoryTreeResponse schema
   - 新增 `Ad` 介面：對應後端 AdResponse schema

3. **更新 CategoryNav 組件** (`frontend/components/CategoryNav.tsx`)
   - 移除硬編碼的 `CATEGORY_HIERARCHY` 常數
   - 新增狀態管理：categories、loading、error
   - 在組件掛載時使用 `useEffect` 從 API 載入分類資料
   - 實作圖示映射函數 `getCategoryIcon()`：根據分類名稱動態選擇對應圖示
   - 過濾並顯示根分類（parent_id 為 null）
   - 顯示子分類於 mega menu 中
   - 新增載入和錯誤狀態的 UI 處理

4. **更新 Home 組件** (`frontend/components/Home.tsx`)
   - 新增狀態管理：ads、loading、error
   - 在組件掛載時使用 `useEffect` 從 API 載入廣告資料
   - 將 Hero Banner 改為動態顯示廣告內容：
     - 使用第一個廣告（或 order_index 最低的廣告）作為主要 banner
     - 使用 `image_url` 作為背景圖片
     - 使用 `title` 作為標題文字
     - 使用 `link_url` 作為「Shop Now」按鈕連結（如果提供）
   - 當沒有廣告時，回退到預設的 banner 設計

### 影響的檔案

- `frontend/services/api.ts` (新增)
- `frontend/types.ts`
- `frontend/components/CategoryNav.tsx`
- `frontend/components/Home.tsx`

### 功能變更

- **分類選單**：現在從後端 `/api/categories` API 動態載入，支援樹狀結構分類
- **Hero Banner**：現在從後端 `/api/ads` API 動態載入，可透過後台管理系統管理
- **錯誤處理**：新增載入狀態和錯誤處理，提升使用者體驗

### 技術細節

- 使用 React Hooks (`useState`, `useEffect`) 管理狀態和副作用
- API 呼叫使用原生 `fetch` API
- 保持現有的 UI/UX 設計，僅替換資料來源
- 分類圖示使用智能映射，根據分類名稱自動選擇合適的圖示

---

## [2025-11-25 16:55:44] - 初始文件

### 說明

此文件用於記錄前端（Frontend）的所有更改。

---

**最後更新**: 2025-11-26 16:21:57

