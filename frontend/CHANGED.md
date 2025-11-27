# Frontend 更改記錄 (CHANGED)

## [2025-11-27 10:20:39] - Sign 頁面使用真實的登入和註冊 API

### 修改內容

#### Sign 頁面使用真實的登入和註冊 API
- **時間**: 2025-11-27 10:20:39
- **目的**: 將 `/sign` 頁面的登入和註冊功能改為使用後端 `/api/auth/login` 和 `/api/auth/register` API
- **修改檔案**:
  - `services/api.ts` - 添加 `login`、`register`、`logout` 和 `getToken` 函數
  - `components/Auth.tsx` - 使用真實 API 進行登入和註冊
  - `context/AppContext.tsx` - 更新 `handleLogout` 以清除 token

### 變更詳情

#### 新增的 API 函數
- **login(credentials)**: 調用 `/api/auth/login` 端點進行登入
  - 接收 `LoginRequest`（email, password）
  - 返回 `LoginResponse`（access_token, token_type, user）
  - 自動將 token 存儲到 localStorage

- **register(userData)**: 調用 `/api/auth/register` 端點進行註冊
  - 接收 `RegisterRequest`（email, name, password）
  - 返回 `User` 對象
  - 註冊成功後自動登入

- **logout()**: 清除 localStorage 中的 token

- **getToken()**: 獲取 localStorage 中的 token

#### 新增的類型定義
- **User 接口**: 定義用戶數據結構
  - `id`: number
  - `email`: string
  - `name`: string
  - `role`: string
  - `status`: string
  - `created_at`: string

- **LoginRequest 接口**: 登入請求數據
  - `email`: string
  - `password`: string

- **RegisterRequest 接口**: 註冊請求數據
  - `email`: string
  - `name`: string
  - `password`: string

- **LoginResponse 接口**: 登入響應數據
  - `access_token`: string
  - `token_type`: string
  - `user`: User

#### 修改的組件
- **Auth.tsx**:
  - 移除模擬認證邏輯
  - 使用真實的 `login` 和 `register` API 函數
  - 添加 `loading` 狀態管理
  - 添加 `error` 狀態管理和錯誤顯示
  - 註冊成功後自動登入
  - 表單提交時顯示載入狀態
  - 顯示錯誤信息（如果 API 調用失敗）

- **AppContext.tsx**:
  - 更新 `handleLogout` 函數，調用 `apiLogout()` 清除 token

### 技術細節

#### API 調用
```typescript
// 登入
const response = await login({ email, password });
// Token 自動存儲到 localStorage

// 註冊
const user = await register({ email, name, password });
// 註冊成功後自動登入
const loginResponse = await login({ email, password });
```

#### Token 管理
- 登入成功後，token 自動存儲到 `localStorage` 的 `access_token` 鍵
- 登出時，清除 `localStorage` 中的 token
- 使用 `getToken()` 函數獲取當前 token

#### 錯誤處理
- API 調用失敗時，顯示錯誤信息
- 錯誤信息顯示在表單上方
- 支持後端返回的詳細錯誤信息

#### 用戶體驗
- 表單提交時顯示 "Processing..." 狀態
- 按鈕在載入時禁用，防止重複提交
- 註冊成功後自動登入，無需用戶再次輸入憑證

### 影響範圍
- **前端**: 
  - `/sign` 頁面
  - 登入功能
  - 註冊功能
- **數據來源**: 從模擬認證改為後端 API
- **行為**: 
  - 現在使用真實的用戶認證系統
  - Token 自動管理
  - 支持錯誤處理和用戶反饋

### 錯誤處理
- API 調用失敗時顯示錯誤信息
- 支持後端返回的詳細錯誤信息（如 "Email already registered"、"Incorrect email or password"）
- 表單驗證（如註冊時 name 為必填）

### 注意事項
1. **Token 存儲**: Token 存儲在 localStorage 中，頁面刷新後需要重新驗證
2. **自動登入**: 註冊成功後會自動登入，無需用戶再次輸入憑證
3. **錯誤信息**: 錯誤信息會顯示在表單上方，用戶可以清楚看到問題

---

## [2025-11-27 10:14:46] - Cart 頁面使用產品的第一張圖片

### 修改內容

#### Cart 頁面使用產品的第一張圖片
- **時間**: 2025-11-27 10:14:46
- **目的**: 將購物車頁面的商品圖片改為優先使用 `product_images` 數組中的第一張圖片，並正確處理圖片 URL
- **修改檔案**:
  - `components/Cart.tsx` - 更新圖片顯示邏輯，優先使用 product_images[0].image_url

### 變更詳情

#### 修改的組件
- **Cart.tsx**:
  - 添加 `getImageUrl` 函數處理相對路徑轉換為絕對 URL
  - 添加 `getProductImage` 函數獲取商品的第一張圖片
  - 優先使用 `product_images[0].image_url` 作為圖片源
  - 如果 `product_images` 為空或不存在，回退到 `item.image`
  - 自動處理相對路徑轉換為完整 URL

### 技術細節

#### 圖片選擇邏輯
```typescript
const getProductImage = (item: CartItem & { product_images?: Array<{ image_url: string; order_index: number }> }) => {
  // Check if product_images exists and has items
  if (item.product_images && item.product_images.length > 0) {
    return item.product_images[0].image_url;
  }
  // Fallback to item.image
  return item.image;
};
```

#### 圖片 URL 處理
- 優先使用 `product_images[0].image_url`（第一張圖片）
- 如果 `product_images` 為空，使用 `item.image` 作為備用
- 相對路徑自動轉換為完整 URL（添加 `http://localhost:8000` 前綴）
- 確保所有圖片都能正確顯示

#### 類型處理
- 使用類型斷言處理 CartItem 可能包含 `product_images` 的情況
- 保持向後兼容，如果沒有 `product_images` 則使用 `item.image`

### 影響範圍
- **前端**: 購物車頁面 (`/cart`)
- **功能**: 
  - 現在會優先顯示 `product_images` 數組中的第一張圖片
  - 圖片 URL 自動處理相對路徑
- **行為**: 
  - 與商品列表頁面和商品詳情頁面保持一致
  - 確保購物車中顯示的圖片與商品頁面一致

### 注意事項
1. **圖片優先級**: 優先使用 `product_images[0].image_url`（第一張圖片）
2. **向後兼容**: 如果商品沒有 `product_images`，會回退到 `item.image`
3. **URL 處理**: 所有圖片 URL 都會自動處理相對路徑

---

## [2025-11-27 10:05:37] - Product Detail 頁面支援 Markdown 渲染

### 修改內容

#### Product Detail 頁面支援 Markdown 渲染
- **時間**: 2025-11-27 10:05:37
- **目的**: 將商品詳情頁面的描述內容從純文字顯示改為支援 Markdown 格式渲染為 HTML
- **修改檔案**:
  - `components/ProductDetail.tsx` - 使用 react-markdown 渲染商品描述內容

### 變更詳情

#### 修改的組件
- **ProductDetail.tsx**:
  - 導入 `ReactMarkdown` 組件
  - 移除原本的純文字顯示方式
  - 使用 `ReactMarkdown` 組件渲染 `product.description`
  - 添加自定義組件映射（`markdownComponents`）以美化 Markdown 元素樣式

#### 自定義 Markdown 組件樣式
- **圖片 (img)**: 
  - 自動處理相對路徑轉換為絕對 URL
  - 添加圓角、間距和響應式樣式
  - 確保圖片正確顯示

- **標題 (h1, h2, h3)**: 
  - 不同層級的標題有不同的字體大小和間距
  - 使用灰色文字顏色
  - 字體大小適配產品詳情頁面（比新聞頁面稍小）

- **段落 (p)**: 
  - 添加底部間距和行高
  - 使用灰色文字顏色

- **列表 (ul, ol, li)**: 
  - 有序和無序列表都有適當的樣式
  - 列表項有適當的縮進和間距
  - 使用灰色文字顏色

- **引用 (blockquote)**: 
  - 左側邊框和斜體樣式
  - 使用 indigo 顏色主題

- **代碼 (code, pre)**: 
  - 行內代碼和代碼塊有不同的樣式
  - 代碼塊有背景色和滾動條
  - 使用等寬字體

- **連結 (a)**: 
  - 使用 indigo 顏色
  - 添加 hover 效果
  - 外部連結自動添加 `target="_blank"` 和 `rel="noopener noreferrer"`

- **強調 (strong, em)**: 
  - 粗體和斜體樣式

### 技術細節

#### Markdown 渲染
```typescript
{product.description ? (
  <ReactMarkdown components={markdownComponents}>
    {product.description}
  </ReactMarkdown>
) : (
  <p>No description available.</p>
)}
```

#### 圖片 URL 處理
- Markdown 中的圖片 URL 也會通過 `getImageUrl` 函數處理
- 相對路徑自動轉換為完整 URL（添加 `http://localhost:8000` 前綴）
- 確保所有圖片都能正確顯示

#### 樣式設計
- 使用 Tailwind CSS 類名進行樣式設計
- 保持與整體設計風格一致（indigo 主題色）
- 字體大小和間距適配產品詳情頁面的設計
- 響應式設計，適配不同屏幕尺寸

### 影響範圍
- **前端**: 商品詳情頁面 (`/product/:id`) 的描述部分
- **功能**: 現在支援完整的 Markdown 語法渲染
  - 標題、段落、列表
  - 圖片、連結
  - 代碼塊、引用
  - 粗體、斜體等格式
- **用戶體驗**: 
  - 內容顯示更加美觀和結構化
  - 支援豐富的內容格式
  - 圖片和連結自動處理

### 支援的 Markdown 語法
- 標題 (# ## ###)
- 段落和換行
- 有序和無序列表
- 粗體 (**text**) 和斜體 (*text*)
- 連結 [text](url)
- 圖片 ![alt](url)
- 代碼塊和行內代碼
- 引用 (> text)
- 水平線

### 注意事項
1. **安全性**: react-markdown 默認是安全的，不會執行危險的 HTML
2. **圖片路徑**: Markdown 中的圖片 URL 會自動處理相對路徑
3. **樣式**: 所有 Markdown 元素都有自定義樣式，與整體設計保持一致
4. **空描述**: 當商品沒有描述時，顯示 "No description available."

---

## [2025-11-27 09:35:52] - Product Detail 頁面使用 /api/products/{id} API 獲取商品詳情

### 修改內容

#### Product Detail 頁面使用 /api/products/{id} API 獲取商品詳情
- **時間**: 2025-11-27 09:35:52
- **目的**: 將商品詳情頁面改為從後端 `/api/products/{id}` API 獲取商品數據，並正確處理圖片 URL 和多張圖片顯示
- **修改檔案**:
  - `services/api.ts` - 添加 `fetchProductDetail` 函數
  - `pages/ProductDetailPage.tsx` - 使用 API 獲取商品詳情
  - `components/ProductDetail.tsx` - 更新以處理圖片 URL、多張圖片和 `category_name` 字段

### 變更詳情

#### 新增的 API 函數
- **fetchProductDetail(productId)**: 調用 `/api/products/{product_id}` 端點獲取單個商品詳情
  - 返回完整的 `Product` 對象，包含所有商品信息和 `product_images` 數組

#### 修改的頁面
- **ProductDetailPage.tsx**:
  - 移除對 `PRODUCTS` mock data 的依賴
  - 添加狀態管理（product, loading, error）
  - 使用 `useEffect` 從 API 加載商品詳情
  - 使用 `useParams` 獲取商品 ID
  - 添加載入和錯誤狀態的 UI 處理
  - 如果商品不存在，重定向到商店頁面

#### 修改的組件
- **ProductDetail.tsx**:
  - 更新導入：從 `../types` 改為 `../services/api` 以使用正確的 Product 類型
  - 添加 `getImageUrl` 函數處理相對路徑轉換為絕對 URL
  - 支持多張圖片顯示：
    - 優先使用 `product_images` 數組中的所有圖片
    - 如果 `product_images` 為空，使用 `product.image` 作為備用
    - 添加圖片輪播功能（上一張/下一張按鈕）
    - 添加圖片指示器（小圓點顯示當前圖片位置）
  - 將 `product.category` 改為 `product.category_name || 'Uncategorized'`
  - 處理 `product.description` 可能為 null 的情況

### 技術細節

#### API 調用
```typescript
export async function fetchProductDetail(productId: number): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`);
  const data: Product = await response.json();
  return data;
}
```

#### 圖片處理
- **多張圖片支持**: 
  - 從 `product_images` 數組中獲取所有圖片
  - 如果數組為空，使用 `product.image` 作為單張圖片
  - 支持圖片輪播（當有多張圖片時）

- **圖片 URL 處理**:
  - 相對路徑自動轉換為完整 URL（添加 `http://localhost:8000` 前綴）
  - 確保所有圖片都能正確顯示

- **圖片導航**:
  - 左/右箭頭按鈕切換圖片
  - 底部指示器顯示當前圖片位置
  - 點擊指示器可直接跳轉到對應圖片

#### 狀態管理
- 使用 `useState` 管理當前顯示的圖片索引
- 當有多張圖片時，顯示導航控件
- 單張圖片時，隱藏導航控件

### 影響範圍
- **前端**: 
  - `/product/:id` 頁面
  - 商品詳情顯示
  - 多張圖片輪播功能
- **數據來源**: 從 mock data (`PRODUCTS`) 改為後端 API (`/api/products/{id}`)
- **行為**: 
  - 現在顯示的是後端數據庫中的商品詳情
  - 支持動態加載和錯誤處理
  - 圖片 URL 自動處理相對路徑
  - 支持多張商品圖片輪播顯示

### 錯誤處理
- API 調用失敗時顯示錯誤信息
- 商品不存在時重定向到商店頁面
- 載入狀態提供更好的用戶體驗

### 用戶體驗改進
- **多圖片支持**: 當商品有多張圖片時，用戶可以瀏覽所有圖片
- **圖片導航**: 直觀的左右箭頭和指示器
- **響應式設計**: 適配不同屏幕尺寸
- **加載狀態**: 顯示載入提示，提升用戶體驗

### 注意事項
1. **圖片優先級**: 優先使用 `product_images` 數組中的圖片
2. **單張圖片**: 當只有一張圖片時，不顯示導航控件
3. **圖片輪播**: 支持循環切換（最後一張後回到第一張）

---

## [2025-11-27 09:32:22] - Shop 頁面使用 /api/products API 獲取所有商品

### 修改內容

#### Shop 頁面使用 /api/products API 獲取所有商品
- **時間**: 2025-11-27 09:32:22
- **目的**: 將 `/shop` 頁面改為從後端 `/api/products` API 獲取所有商品，並正確處理圖片 URL
- **修改檔案**:
  - `services/api.ts` - 添加 `fetchProducts` 函數和 `ProductListResponse` 接口
  - `pages/ShopPage.tsx` - 使用 API 獲取商品列表
  - `components/ProductList.tsx` - 更新以處理圖片 URL 和 `category_name` 字段

### 變更詳情

#### 新增的 API 函數
- **fetchProducts(categoryId?, page, pageSize)**: 調用 `/api/products` 端點獲取商品列表
  - 支持可選的 `categoryId` 參數（目前未使用，使用前端篩選）
  - 支持分頁參數 `page` 和 `pageSize`
  - 返回 `ProductListResponse` 包含商品列表、總數、頁碼等信息

#### 新增的類型定義
- **ProductListResponse 接口**: 定義 API 響應結構
  - `products`: Product[]
  - `total`: number
  - `page`: number
  - `page_size`: number
  - `total_pages`: number

#### 修改的頁面
- **ShopPage.tsx**:
  - 移除對 `PRODUCTS` mock data 的依賴
  - 移除對 `ITEMS_PER_PAGE` 常數的依賴
  - 添加狀態管理（products, totalPages, loading, error）
  - 使用 `useEffect` 從 API 加載商品列表
  - 支持分類篩選（在前端根據 `category_name` 篩選）
  - 當分類改變時，重置到第一頁
  - 添加載入和錯誤狀態的 UI 處理

#### 修改的組件
- **ProductList.tsx**:
  - 更新導入：從 `../types` 改為 `../services/api` 以使用正確的 Product 類型
  - 添加 `getImageUrl` 函數處理相對路徑轉換為絕對 URL
  - 優先使用 `product_images[0].image_url` 作為圖片源
  - 如果 `product_images` 為空，回退到 `product.image`
  - 將 `product.category` 改為 `product.category_name || 'Uncategorized'`
  - 處理 `product.description` 可能為 null 的情況

### 技術細節

#### API 調用
```typescript
export async function fetchProducts(
  categoryId?: number | null,
  page: number = 1,
  pageSize: number = 9
): Promise<ProductListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  
  if (categoryId) {
    params.append('category_id', categoryId.toString());
  }
  
  const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
  const data: ProductListResponse = await response.json();
  return data;
}
```

#### 圖片 URL 處理
- 優先使用 `product_images[0].image_url`（第一張圖片）
- 如果 `product_images` 為空，使用 `product.image` 作為備用
- 相對路徑自動轉換為完整 URL（添加 `http://localhost:8000` 前綴）
- 確保所有圖片都能正確顯示

#### 分類篩選
- 目前使用前端篩選（根據 `category_name` 匹配 `selectedCategory`）
- 當分類改變時，重置到第一頁
- 支持顯示所有商品（當 `selectedCategory` 為 null 時）

#### 分頁處理
- 使用 API 返回的 `total_pages` 進行分頁
- 每頁顯示 9 個商品（`pageSize = 9`）
- 分頁控件顯示當前頁和總頁數

### 影響範圍
- **前端**: 
  - `/shop` 頁面
  - 商品列表顯示
  - 分類篩選功能
  - 分頁功能
- **數據來源**: 從 mock data (`PRODUCTS`) 改為後端 API (`/api/products`)
- **行為**: 
  - 現在顯示的是後端數據庫中的所有啟用商品
  - 支持動態加載和錯誤處理
  - 圖片 URL 自動處理相對路徑
  - 分類篩選在前端進行（根據 `category_name`）

### 錯誤處理
- API 調用失敗時顯示錯誤信息
- 載入狀態提供更好的用戶體驗
- 空狀態處理（當沒有商品時顯示提示）

### 注意事項
1. **分類篩選**: 目前使用前端篩選，未來可以改為使用 API 的 `category_id` 參數進行後端篩選
2. **圖片優先級**: 優先使用 `product_images` 數組中的第一張圖片
3. **分頁**: 每頁固定顯示 9 個商品

---

## [2025-11-27 09:26:13] - News Detail 頁面支援 Markdown 渲染

### 修改內容

#### News Detail 頁面支援 Markdown 渲染
- **時間**: 2025-11-27 09:26:13
- **目的**: 將新聞詳情頁面的內容從純文字顯示改為支援 Markdown 格式渲染為 HTML
- **修改檔案**:
  - `components/NewsDetail.tsx` - 使用 react-markdown 渲染 Markdown 內容
  - `package.json` - 添加 `react-markdown` 依賴

### 變更詳情

#### 新增依賴
- **react-markdown**: 用於將 Markdown 文本轉換為 React 組件
  - 版本: 最新版本（通過 npm install 安裝）
  - 功能: 安全地渲染 Markdown 內容為 HTML

#### 修改的組件
- **NewsDetail.tsx**:
  - 導入 `ReactMarkdown` 組件
  - 移除原本的 `whitespace-pre-line` 純文字顯示方式
  - 使用 `ReactMarkdown` 組件渲染 `newsItem.content`
  - 添加自定義組件映射（`markdownComponents`）以美化 Markdown 元素樣式

#### 自定義 Markdown 組件樣式
- **圖片 (img)**: 
  - 自動處理相對路徑轉換為絕對 URL
  - 添加圓角、間距和響應式樣式
  - 確保圖片正確顯示

- **標題 (h1, h2, h3)**: 
  - 不同層級的標題有不同的字體大小和間距
  - 使用灰色文字顏色

- **段落 (p)**: 
  - 添加底部間距和行高

- **列表 (ul, ol, li)**: 
  - 有序和無序列表都有適當的樣式
  - 列表項有適當的縮進和間距

- **引用 (blockquote)**: 
  - 左側邊框和斜體樣式
  - 使用 indigo 顏色主題

- **代碼 (code, pre)**: 
  - 行內代碼和代碼塊有不同的樣式
  - 代碼塊有背景色和滾動條
  - 使用等寬字體

- **連結 (a)**: 
  - 使用 indigo 顏色
  - 添加 hover 效果
  - 外部連結自動添加 `target="_blank"` 和 `rel="noopener noreferrer"`

- **強調 (strong, em)**: 
  - 粗體和斜體樣式

### 技術細節

#### Markdown 渲染
```typescript
<ReactMarkdown components={markdownComponents}>
  {newsItem.content}
</ReactMarkdown>
```

#### 圖片 URL 處理
- Markdown 中的圖片 URL 也會通過 `getImageUrl` 函數處理
- 相對路徑自動轉換為完整 URL（添加 `http://localhost:8000` 前綴）
- 確保所有圖片都能正確顯示

#### 樣式設計
- 使用 Tailwind CSS 類名進行樣式設計
- 保持與整體設計風格一致（indigo 主題色）
- 響應式設計，適配不同屏幕尺寸

### 影響範圍
- **前端**: 新聞詳情頁面 (`/news/:id`)
- **功能**: 現在支援完整的 Markdown 語法渲染
  - 標題、段落、列表
  - 圖片、連結
  - 代碼塊、引用
  - 粗體、斜體等格式
- **用戶體驗**: 
  - 內容顯示更加美觀和結構化
  - 支援豐富的內容格式
  - 圖片和連結自動處理

### 支援的 Markdown 語法
- 標題 (# ## ###)
- 段落和換行
- 有序和無序列表
- 粗體 (**text**) 和斜體 (*text*)
- 連結 [text](url)
- 圖片 ![alt](url)
- 代碼塊和行內代碼
- 引用 (> text)
- 水平線

### 注意事項
1. **安全性**: react-markdown 默認是安全的，不會執行危險的 HTML
2. **圖片路徑**: Markdown 中的圖片 URL 會自動處理相對路徑
3. **樣式**: 所有 Markdown 元素都有自定義樣式，與整體設計保持一致

---

## [2025-11-27 09:14:25] - Latest News & Stories 使用 /api/news API

### 修改內容

#### Latest News & Stories 使用 /api/news API
- **時間**: 2025-11-27 09:14:25
- **目的**: 將首頁的 "Latest News & Stories" 部分和新聞頁面改為使用後端 `/api/news` API 獲取新聞數據
- **修改檔案**:
  - `services/api.ts` - 添加 `fetchNews` 和 `fetchNewsDetail` 函數
  - `pages/HomePage.tsx` - 使用 API 獲取新聞數據
  - `pages/NewsPage.tsx` - 使用 API 獲取新聞列表
  - `pages/NewsDetailPage.tsx` - 使用 API 獲取單個新聞詳情
  - `components/Home.tsx` - 更新新聞圖片 URL 處理
  - `components/NewsDetail.tsx` - 更新新聞圖片 URL 處理

### 變更詳情

#### 添加的 API 函數
- **fetchNews()**: 調用 `/api/news` 端點獲取新聞列表
  - 返回 `NewsItem[]` 數組
  - 自動處理日期格式轉換（從 ISO 格式提取日期部分）
  - 確保 `excerpt` 字段不為 null（轉換為空字符串）
  
- **fetchNewsDetail(newsId)**: 調用 `/api/news/{news_id}` 端點獲取單個新聞詳情
  - 返回單個 `NewsItem` 對象
  - 同樣處理日期和 excerpt 格式

#### 新增的類型定義
- **NewsItem 接口**: 定義新聞數據結構
  - `id`: number
  - `title`: string
  - `excerpt`: string | null
  - `content`: string
  - `image`: string
  - `date`: string
  - `created_at`: string

- **NewsListResponse 接口**: 定義 API 響應結構
  - `news`: NewsItem[]
  - `total`: number

#### 修改的頁面
- **HomePage.tsx**:
  - 移除對 `NEWS_ITEMS` mock data 的依賴
  - 添加 `newsItems` 狀態管理
  - 使用 `Promise.all` 並行加載 featured products 和 news
  - 從 API 動態加載新聞數據

- **NewsPage.tsx**:
  - 移除對 `NEWS_ITEMS` mock data 的依賴
  - 添加狀態管理（newsItems, loading, error）
  - 在組件掛載時從 API 加載新聞列表
  - 添加載入和錯誤狀態的 UI 處理
  - 添加空狀態處理（當沒有新聞時顯示提示）

- **NewsDetailPage.tsx**:
  - 移除對 `NEWS_ITEMS` mock data 的依賴
  - 添加狀態管理（newsItem, loading, error）
  - 使用 `useParams` 獲取新聞 ID
  - 從 API 動態加載新聞詳情
  - 添加載入和錯誤狀態處理
  - 如果新聞不存在，重定向到新聞列表頁

#### 圖片 URL 處理
- **Home.tsx**: 更新新聞圖片顯示邏輯
  - 使用 `getImageUrl` 函數處理相對路徑
  - 將相對路徑轉換為完整 URL（添加 `http://localhost:8000` 前綴）

- **NewsDetail.tsx**: 添加圖片 URL 處理
  - 新增 `getImageUrl` 輔助函數
  - 處理相對路徑轉換

- **NewsPage.tsx**: 添加圖片 URL 處理
  - 在渲染新聞卡片時處理圖片 URL

### 技術細節

#### API 調用
```typescript
// 獲取新聞列表
export async function fetchNews(): Promise<NewsItem[]> {
  const response = await fetch(`${API_BASE_URL}/news`);
  const data: NewsListResponse = await response.json();
  return data.news.map(item => ({
    ...item,
    date: item.date.split('T')[0], // 提取日期部分
    excerpt: item.excerpt || '', // 確保不為 null
  }));
}

// 獲取新聞詳情
export async function fetchNewsDetail(newsId: number): Promise<NewsItem> {
  const response = await fetch(`${API_BASE_URL}/news/${newsId}`);
  const data: NewsItem = await response.json();
  return {
    ...data,
    date: data.date.split('T')[0],
    excerpt: data.excerpt || '',
  };
}
```

#### 數據加載策略
- **HomePage**: 使用 `Promise.all` 並行加載 featured products 和 news，提高性能
- **NewsPage**: 單獨加載新聞列表，包含完整的錯誤處理
- **NewsDetailPage**: 根據路由參數動態加載新聞詳情

#### 日期格式處理
- API 返回的日期是 ISO 格式字符串（如 `2025-11-27T00:00:00`）
- 前端提取日期部分（`split('T')[0]`）以顯示為 `YYYY-MM-DD` 格式

#### 圖片路徑處理
- 檢查圖片 URL 是否為完整 URL（以 `http://` 或 `https://` 開頭）
- 如果是相對路徑，添加 `http://localhost:8000` 前綴
- 確保圖片能正確顯示

### 影響範圍
- **前端**: 
  - 首頁的 "Latest News & Stories" 部分
  - 新聞列表頁面 (`/news`)
  - 新聞詳情頁面 (`/news/:id`)
- **數據來源**: 從 mock data (`NEWS_ITEMS`) 改為後端 API (`/api/news`)
- **行為**: 
  - 現在顯示的是後端數據庫中的新聞
  - 支持動態加載和錯誤處理
  - 圖片 URL 自動處理相對路徑

### 錯誤處理
- API 調用失敗時顯示錯誤信息
- 新聞不存在時重定向到新聞列表
- 載入狀態提供更好的用戶體驗

---

## [2025-11-26 22:32:56] - 修復 Popular This Week 顯示第一張產品圖片

### 修改內容

#### 修復 Popular This Week 顯示第一張產品圖片
- **時間**: 2025-11-26 22:32:56
- **目的**: 使用 `product_images` 數組中的第一張圖片（order_index 為 0）來顯示產品
- **修改檔案**:
  - `components/Home.tsx` - 修改圖片顯示邏輯

### 變更詳情

#### 問題
- 之前使用 `product.image` 作為圖片源
- 但 API 返回的數據中，產品有多張圖片在 `product_images` 數組中
- 應該顯示 `product_images` 數組中的第一張圖片

#### 修復方案
- 優先使用 `product_images[0].image_url` 作為圖片源
- 如果 `product_images` 為空或不存在，則回退到 `product.image`
- 處理相對路徑轉換為絕對路徑（添加 `http://localhost:8000` 前綴）

#### 修改的邏輯
```typescript
// 获取第一张图片（order_index 为 0 的图片，或 product_images 的第一张）
const firstImage = product.product_images && product.product_images.length > 0
  ? product.product_images[0].image_url
  : product.image;

// 转换相对路径为绝对路径
const imageUrl = firstImage?.startsWith('http') 
  ? firstImage 
  : `http://localhost:8000${firstImage?.startsWith('/') ? firstImage : '/' + firstImage}`;
```

### 技術細節

#### 圖片選擇邏輯
1. 優先使用 `product_images[0].image_url`（第一張圖片）
2. 如果 `product_images` 為空，使用 `product.image` 作為備用
3. 處理相對路徑，轉換為完整的 URL

#### 路徑處理
- 如果圖片 URL 已經是完整 URL（以 `http` 開頭），直接使用
- 如果是相對路徑，添加 `http://localhost:8000` 前綴

### 影響範圍
- **前端**: 首頁 "Popular This Week" 部分的產品圖片顯示
- **行為**: 現在會正確顯示 `product_images` 數組中的第一張圖片

---

## [2025-11-26 22:30:41] - 首頁 Popular This Week 使用 /api/home/featured API

### 修改內容

#### 首頁 Popular This Week 使用 /api/home/featured API
- **時間**: 2025-11-26 22:30:41
- **目的**: 將首頁的 "Popular This Week" 部分改為使用後端 API 獲取推薦產品
- **修改檔案**:
  - `services/api.ts` - 添加 `fetchFeaturedProducts` 函數
  - `pages/HomePage.tsx` - 使用 API 獲取 featured products
  - `components/Home.tsx` - 修復 category 顯示問題

### 變更詳情

#### 添加的 API 函數
- **fetchFeaturedProducts**: 調用 `/api/home/featured` 端點獲取推薦產品

#### 修改的頁面
- **HomePage.tsx**:
  - 移除對 mock data `PRODUCTS` 的依賴
  - 添加 `useState` 和 `useEffect` 來獲取 featured products
  - 從 API 動態加載推薦產品數據

#### 修復的問題
- **Home.tsx**: 將 `product.category` 改為 `product.category_name`，因為 API 返回的是 `category_name` 字段

### 技術細節

#### API 調用
```typescript
export async function fetchFeaturedProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/home/featured`);
  const data = await response.json();
  return data;
}
```

#### 數據加載
- 使用 `useEffect` 在組件掛載時加載數據
- 添加 loading 狀態管理
- 錯誤處理：API 失敗時使用空數組

#### 數據結構
- API 返回的 Product 包含 `category_name` 字段（不是 `category`）
- 需要調整顯示邏輯以匹配 API 響應

### 影響範圍
- **前端**: 首頁的 "Popular This Week" 部分
- **數據來源**: 從 mock data 改為後端 API
- **行為**: 現在顯示的是後端推薦的產品（前3個啟用的產品）

---

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

**最後更新**: 2025-11-27 10:20:39

