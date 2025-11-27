# 更改日誌 (CHANGELOG)

## [2025-11-25] - Admin 介面改進和圖片上傳功能

### 新增的功能

#### 1. Admin 介面品牌名稱更改
- **時間**: 2025-11-25 11:42:11
- **更改**: 將所有 admin 介面中的 "快點訂" 改為 "購物車管理"
- **影響檔案**:
  - `app/static/base.html`
  - `app/static/login.html`
  - `app/static/admin/users/index.html` 和 `add-edit.html`
  - `app/static/admin/ads/index.html` 和 `add-edit.html`
  - `app/static/admin/products/index.html` 和 `add-edit.html`
  - `app/static/admin/categories/index.html` 和 `add-edit.html`
  - `app/static/admin/news/index.html` 和 `add-edit.html`
  - `app/static/admin/about/index.html` 和 `add-edit.html`
  - `app/static/admin/faq/index.html` 和 `add-edit.html`
  - `app/static/admin/orders/index.html`

#### 2. Admin 導航選單重構
- **時間**: 2025-11-25 11:42:11
- **更改**: 
  - 將導航選單重組為兩個可折疊的分組：
    - **購物車管理**: 首頁 Banner, 使用者管理, 分類管理, 產品管理, 訂單管理
    - **內容管理**: 關於我們, 新聞管理, FAQ 管理
  - 新增了展開/折疊功能
  - 當前頁面自動高亮顯示（bg-gray-700）
  - 自動展開包含當前頁面的選單組
- **影響檔案**:
  - `app/static/base.html` - 導航選單結構
  - `app/static/js/admin-common.js` - 新增了 `initNavigation()` 函數

#### 3. 編輯頁面全螢幕顯示
- **時間**: 2025-11-25 11:42:11
- **更改**: 所有 add-edit.html 頁面的表單容器改為佔滿整個畫面
- **影響檔案**:
  - `app/static/admin/users/add-edit.html`
  - `app/static/admin/ads/add-edit.html`
  - `app/static/admin/products/add-edit.html`
  - `app/static/admin/categories/add-edit.html`
  - `app/static/admin/news/add-edit.html`
  - `app/static/admin/about/add-edit.html`
  - `app/static/admin/faq/add-edit.html`
  - `app/static/base.html` - 更新 main 標籤樣式

#### 4. 圖片上傳功能實現
- **時間**: 2025-11-25 11:42:11
- **更改**: 
  - 實現了圖片上傳 API，支援 jpg/png 自動轉換為 webp 格式
  - 使用 UUID 產生唯一檔案名稱
  - 新增了圖片上傳前端組件
- **新增檔案**:
  - `app/api/admin/upload.py` - 圖片上傳 API 端點
  - `app/static/js/admin-upload.js` - 圖片上傳前端工具庫
- **修改檔案**:
  - `pyproject.toml` - 新增 `pillow>=10.0.0` 依賴
  - `app/api/admin/__init__.py` - 註冊 upload 路由
  - `app/static/admin/products/add-edit.html` - 整合圖片上傳
  - `app/static/admin/ads/add-edit.html` - 整合圖片上傳
  - `app/static/admin/categories/add-edit.html` - 整合圖片上傳
  - `app/static/admin/news/add-edit.html` - 整合圖片上傳
  - `app/static/admin/about/add-edit.html` - 整合圖片上傳
- **功能特點**:
  - 支援格式: jpg, jpeg, png, webp
  - 自動轉換為 webp 格式（品質 85%）
  - 檔案大小限制: 10MB
  - UUID 檔案名稱: `{uuid}.webp`
  - 上傳目錄: `static/uploads/`
  - 圖片預覽功能
  - 上傳進度提示

### 技術細節

#### 圖片上傳 API
- **端點**: `POST /backend/admin/upload`
- **認證**: 需要管理員權限
- **請求**: `multipart/form-data` (file)
- **響應**: 
  ```json
  {
    "url": "/static/uploads/{uuid}.webp",
    "filename": "{uuid}.webp",
    "size": 12345
  }
  ```

#### 圖片處理
- 使用 Pillow (PIL) 進行圖片處理
- 自動處理不同顏色模式（RGB, RGBA, P, LA）
- WebP 品質設定為 85%，壓縮方法為 6（最佳壓縮）

#### 前端組件
- `uploadImage(file)` - 上傳圖片函數
- `createImageUploadHTML(inputId, previewId, currentImageUrl)` - 建立上傳組件 HTML
- `handleImageUpload(inputId, previewId)` - 處理圖片上傳
- `removeImage(previewId, inputId)` - 移除圖片

### 依賴更新

```toml
dependencies = [
    ...
    "pillow>=10.0.0",  # 新增：圖片處理庫
]
```

### 目錄結構

```
backend/
├── app/
│   ├── api/
│   │   └── admin/
│   │       └── upload.py          # 新增：圖片上傳 API
│   ├── static/
│   │   ├── js/
│   │   │   └── admin-upload.js     # 新增：圖片上傳前端工具
│   │   ├── uploads/                # 新增：圖片上傳目錄
│   │   └── admin/
│   │       └── ...                 # 更新的編輯頁面
│   └── ...
└── CHANGELOG.md                    # 本檔案
```

### 注意事項

1. **圖片儲存**: 上傳的圖片儲存在 `backend/static/uploads/` 目錄
2. **靜態檔案服務**: 確保 FastAPI 正確設定了靜態檔案服務
3. **檔案清理**: 建議定期清理未使用的圖片檔案
4. **安全性**: 上傳功能需要管理員權限，已透過 `get_current_admin` 依賴保護

### 後續改進建議

1. 新增圖片壓縮優化（根據用途調整尺寸）
2. 實現圖片刪除 API
3. 新增圖片管理介面（查看所有上傳的圖片）
4. 實現圖片 CDN 整合
5. 新增圖片浮水印功能

---

## [2025-11-25] - 分類管理和產品圖片功能改進

### 修復的問題

#### 1. 分類外鍵約束錯誤修復
- **時間**: 2025-11-25 16:46:05
- **問題**: 建立分類時出現外鍵約束錯誤（parent_id = 0 無法引用不存在的記錄）
- **解決方案**: 
  - 將 `parent_id` 的預設值從 `0` 改為 `NULL`
  - 修改模型允許 `parent_id` 為 `NULL`（`nullable=True`）
  - 在 API 中將 `parent_id = 0` 轉換為 `parent_id = None`
- **影響檔案**:
  - `app/models/product_category.py` - 模型定義
  - `app/api/admin/categories.py` - 建立和更新邏輯
  - `app/api/categories.py` - 前端 API 查詢邏輯
  - `app/api/products.py` - 分類列表查詢
  - `app/schemas/category.py` - Schema 定義（parent_id 改為 Optional[int]）
  - `app/schemas/admin.py` - Admin Schema 定義

#### 2. Pydantic 驗證錯誤修復
- **時間**: 2025-11-25 16:46:05
- **問題**: `CategoryResponseAdmin` schema 中 `parent_id` 定義為 `int`，無法處理 `None` 值
- **解決方案**: 將 `parent_id: int` 改為 `parent_id: Optional[int]`
- **影響檔案**:
  - `app/schemas/admin.py`

#### 3. 分類圖標顯示修復
- **時間**: 2025-11-25 16:46:05
- **問題**: 分類列表中的圖標無法正確顯示 Font Awesome 圖標
- **解決方案**:
  - 在 `base.html` 和 `index.html` 中新增 Font Awesome 6 CSS
  - 改進圖標檢測邏輯，正確識別 Font Awesome 類名
  - 優化圖標渲染，支援多種格式（Font Awesome 圖標或圖片 URL）
- **影響檔案**:
  - `app/static/base.html` - 新增 Font Awesome CSS
  - `app/static/admin/categories/index.html` - 圖標顯示邏輯和 CSS
  - `app/static/js/admin-common.js` - 確保 Font Awesome CSS 加載
- **更改內容**:
  - 表格列名從 "圖片" 改為 "圖標"
  - 圖標正確渲染為 `<i class="fa-solid fa-microchip"></i>` 格式

### 新增的功能

#### 4. 分類下拉菜單層級顯示
- **時間**: 2025-11-25 16:46:05
- **功能**: 產品管理頁面的分類下拉菜單顯示層級結構
- **特點**:
  - 頂層分類（parent_id = NULL）不可選擇，作為分組標題顯示
  - 子分類顯示在父分類下方，使用縮進（`&nbsp;&nbsp;&nbsp;&nbsp;`）
  - 只允許選擇子分類
- **顯示格式**:
  ```
  請選擇分類
  Electronics (不可選擇，粗體，灰色背景)
      Audio (可選擇，有縮進)
      Computers (可選擇，有縮進)
  ```
- **影響檔案**:
  - `app/static/admin/products/add-edit.html` - 新增 `buildCategoryOptions()` 函數

#### 5. 產品多圖片管理功能
- **時間**: 2025-11-25 16:46:05
- **功能**: 實現產品多圖片上傳、管理和排序功能
- **新增檔案**:
  - `app/models/product_image.py` - ProductImage 模型
  - `app/api/admin/product_images.py` - 產品圖片管理 API
- **修改檔案**:
  - `app/models/product.py` - 新增 `images` 關係
  - `app/models/__init__.py` - 導出 ProductImage
  - `app/api/admin/__init__.py` - 註冊 product_images 路由
  - `app/static/admin/products/add-edit.html` - 多圖片管理介面
- **API 端點**:
  - `GET /backend/admin/products/{product_id}/images` - 獲取產品圖片列表
  - `POST /backend/admin/products/{product_id}/images` - 新增圖片
  - `PUT /backend/admin/products/{product_id}/images/reorder` - 重新排序圖片
  - `DELETE /backend/admin/products/{product_id}/images/{image_id}` - 刪除圖片
- **功能特點**:
  - 支援多圖片上傳（一次可上傳多張）
  - 拖拽排序：可拖拽圖片調整順序
  - 圖片編號顯示：顯示圖片序號（1, 2, 3...）
  - 圖片刪除：每張圖片都有刪除按鈕
  - 自動保存：編輯模式下自動保存到數據庫
  - 響應式設計：使用 Tailwind CSS 網格布局（4 列）
- **數據庫結構**:
  ```sql
  product_images (
    id, 
    product_id, 
    image_url, 
    order_index,  -- 排序索引
    created_at, 
    updated_at
  )
  ```
- **前端功能**:
  - 圖片上傳：點擊「新增圖片」按鈕上傳
  - 拖拽排序：拖拽圖片卡片調整順序
  - 圖片預覽：網格顯示所有圖片
  - 刪除確認：刪除前彈出確認對話框
  - 新增模式：圖片先保存在本地，產品建立後再保存到資料庫
  - 編輯模式：圖片直接保存到資料庫，支援即時更新

### 技術細節

#### 分類模型改進
- `parent_id` 欄位改為 `nullable=True, default=None`
- 根分類使用 `parent_id = NULL` 表示
- 所有查詢邏輯從 `parent_id == 0` 改為 `parent_id is None`

#### 產品圖片管理
- 使用 `order_index` 欄位控制圖片顯示順序
- 拖拽排序後自動更新所有圖片的 `order_index`
- 第一張圖片作為產品主圖（`product.image` 欄位）

#### 前端拖拽實現
- 使用 HTML5 Drag and Drop API
- 實現 `dragstart`, `dragend`, `dragover`, `drop` 事件處理
- 自動計算拖拽後的位置並更新 DOM
- 拖拽結束後同步更新資料庫順序

### 資料庫遷移注意事項

1. **product_categories 表**:
   - 現有資料的 `parent_id = 0` 需要手動更新為 `NULL`
   - 建議執行 SQL: `UPDATE product_categories SET parent_id = NULL WHERE parent_id = 0;`

2. **product_images 表**:
   - 新表，需要建立
   - 執行應用後會自動建立（SQLAlchemy `Base.metadata.create_all`）

### 依賴更新

無新增依賴，使用現有的：
- `pillow>=10.0.0` - 圖片處理（已存在）
- `sqlalchemy>=2.0.0` - ORM（已存在）

### 目錄結構

```
backend/
├── app/
│   ├── models/
│   │   ├── product_image.py          # 新增：產品圖片模型
│   │   └── product.py                # 修改：添加 images 關係
│   ├── api/
│   │   └── admin/
│   │       └── product_images.py     # 新增：產品圖片 API
│   └── static/
│       └── admin/
│           └── products/
│               └── add-edit.html      # 修改：多圖片管理界面
└── CHANGELOG.md                       # 本檔案
```

### 注意事項

1. **分類資料遷移**: 如果資料庫中已有 `parent_id = 0` 的分類，需要手動更新為 `NULL`
2. **圖片儲存**: 產品圖片使用 `product_images` 表，不再只依賴 `product.image` 欄位
3. **主圖選擇**: 系統自動使用第一張圖片（`order_index = 0`）作為產品主圖
4. **圖片排序**: 拖拽排序後會立即更新資料庫，無需額外保存操作

### 後續改進建議

1. 分類管理頁面新增圖標選擇器（類似分類編輯頁面）
2. 產品圖片新增圖片描述/標題功能
3. 實現圖片批次上傳功能
4. 新增圖片裁剪/編輯功能
5. 實現圖片 CDN 整合

---

**最後更新**: 2025-11-25 16:46:05

