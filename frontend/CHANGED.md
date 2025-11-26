# Frontend 更改記錄 (CHANGED)

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

