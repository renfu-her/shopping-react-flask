# Backend 更改記錄 (CHANGED)

## [2025-11-25 20:04:47] - 公開產品 API 更新：添加分類名稱欄位

### 修改內容

#### 公開產品 API 返回分類名稱
- **時間**: 2025-11-25 20:04:47
- **功能**: 在公開產品 API 響應中添加 `category_name` 欄位，直接返回分類名稱，無需前端額外查詢
- **修改檔案**:
  - `app/schemas/product.py` - 更新 `ProductResponse` schema
  - `app/api/products.py` - 更新所有公開產品相關 API 端點
- **變更詳情**:
  - 在 `ProductResponse` schema 中添加 `category_name: Optional[str] = None` 欄位
  - 使用 SQLAlchemy `joinedload` 在查詢時預加載分類關係
  - 更新產品列表 API (`GET /api/products`) 以包含分類名稱
  - 更新產品詳情 API (`GET /api/products/{product_id}`) 以包含分類名稱
  - 使用手動構建響應字典的方式，確保分類名稱正確包含在響應中
- **功能特點**:
  - **直接返回分類名稱**: API 響應直接包含 `category_name`，前端無需額外查詢
  - **性能優化**: 使用 `joinedload` 預加載分類關係，減少數據庫查詢次數
  - **向後兼容**: `category_id` 欄位仍然保留，確保現有代碼不受影響
  - **空值處理**: 如果分類不存在，`category_name` 返回 `None`

### 技術細節

#### Schema 更新
```python
class ProductResponse(BaseModel):
    # ... 其他欄位 ...
    category_id: int
    category_name: Optional[str] = None  # 新增欄位
    # ... 其他欄位 ...
```

#### 查詢優化
- 使用 `joinedload(Product.category)` 預加載分類關係
- 在構建響應時從 `product.category.name` 獲取分類名稱
- 產品列表和詳情端點都使用相同的模式

#### 受影響的 API 端點
1. **GET /api/products** - 產品列表（支援分類篩選、分頁）
2. **GET /api/products/{product_id}** - 產品詳情

#### 響應格式示例
```json
{
  "id": 1,
  "title": "產品名稱",
  "price": 100.0,
  "category_id": 5,
  "category_name": "電子產品",  // 新增欄位
  "stock": 10,
  "is_active": true,
  // ... 其他欄位
}
```

### 影響範圍
- **前端**: 前端可以直接從產品 API 響應中獲取分類名稱，無需額外查詢分類 API
- **性能**: 減少前端需要發送的 API 請求次數
- **一致性**: 公開 API 和 Admin API 現在都返回分類名稱，保持一致性

---

## [2025-11-25 20:01:47] - Admin 產品管理 API 更新：添加分類名稱欄位

### 修改內容

#### Admin 產品 API 返回分類名稱
- **時間**: 2025-11-25 20:01:47
- **功能**: 在 admin 產品 API 響應中添加 `category_name` 欄位，直接返回分類名稱，無需前端額外查詢
- **修改檔案**:
  - `app/schemas/admin.py` - 更新 `ProductResponseAdmin` schema
  - `app/api/admin/products.py` - 更新所有產品相關 API 端點
- **變更詳情**:
  - 在 `ProductResponseAdmin` schema 中添加 `category_name: Optional[str]` 欄位
  - 使用 SQLAlchemy `joinedload` 在查詢時預加載分類關係
  - 更新所有產品 API 端點（列表、詳情、創建、更新）以包含分類名稱
  - 使用手動構建響應字典的方式，確保分類名稱正確包含在響應中
- **功能特點**:
  - **直接返回分類名稱**: API 響應直接包含 `category_name`，前端無需額外查詢
  - **性能優化**: 使用 `joinedload` 預加載分類關係，減少數據庫查詢次數
  - **向後兼容**: `category_id` 欄位仍然保留，確保現有代碼不受影響
  - **空值處理**: 如果分類不存在，`category_name` 返回 `None`

### 技術細節

#### Schema 更新
```python
class ProductResponseAdmin(BaseModel):
    # ... 其他欄位 ...
    category_id: int
    category_name: Optional[str] = None  # 新增欄位
    # ... 其他欄位 ...
```

#### 查詢優化
- 使用 `joinedload(Product.category)` 預加載分類關係
- 在構建響應時從 `product.category.name` 獲取分類名稱
- 所有產品相關端點都使用相同的模式

#### 受影響的 API 端點
1. **GET /backend/admin/products** - 產品列表
2. **GET /backend/admin/products/{product_id}** - 產品詳情
3. **POST /backend/admin/products** - 創建產品
4. **PUT /backend/admin/products/{product_id}** - 更新產品

#### 響應格式示例
```json
{
  "id": 1,
  "title": "產品名稱",
  "price": 100.0,
  "category_id": 5,
  "category_name": "電子產品",  // 新增欄位
  "stock": 10,
  "is_active": true,
  // ... 其他欄位
}
```

### 影響範圍

- **API 端點**: 所有 admin 產品相關端點
- **前端頁面**: `app/static/admin/products/index.html`（可以簡化，直接使用 `category_name`）
- **數據庫**: 無變更
- **向後兼容**: 完全向後兼容，現有調用不受影響

### 注意事項

1. 前端可以選擇使用 `category_name` 直接顯示，無需再查詢分類列表
2. 如果分類被刪除，`category_name` 會返回 `None`，前端需要處理這種情況
3. `category_id` 欄位仍然保留，用於更新操作和向後兼容

### 後續改進建議

1. 前端可以移除單獨的分類查詢邏輯，直接使用 API 返回的 `category_name`
2. 考慮在其他產品 API（如 `/api/products`）中也添加分類名稱欄位

---

## [2025-11-25 20:00:17] - Admin 產品管理 API 更新：添加狀態篩選功能

### 修改內容

#### Admin 產品列表 API 添加狀態篩選
- **時間**: 2025-11-25 20:00:17
- **功能**: 在 admin 產品列表 API 中添加 `status_filter` 參數，支援按啟用/停用狀態篩選產品
- **修改檔案**:
  - `app/api/admin/products.py`
- **變更詳情**:
  - 在 `get_products` 函數中添加 `status_filter` 查詢參數（Optional[str]）
  - 實現狀態篩選邏輯：將字符串 "true"/"false" 轉換為布爾值並過濾 `is_active` 欄位
  - 更新函數文檔字符串，說明支援狀態篩選功能
- **功能特點**:
  - 支援按啟用狀態篩選：`status_filter=true` 顯示啟用產品
  - 支援按停用狀態篩選：`status_filter=false` 顯示停用產品
  - 不提供參數時顯示所有產品（不進行狀態篩選）
  - 與前端 admin 產品管理頁面的篩選功能完全對應

### 技術細節

#### API 參數
- **參數名稱**: `status_filter`
- **類型**: `Optional[str]`
- **值**: `"true"` 或 `"false"`（字符串格式）
- **預設值**: `None`（不篩選）

#### 篩選邏輯
```python
if status_filter is not None and status_filter != '':
    is_active = status_filter.lower() == 'true'
    query = query.filter(Product.is_active == is_active)
```

#### API 端點
- **端點**: `GET /backend/admin/products`
- **查詢參數**:
  - `search`: 搜尋產品名稱（可選）
  - `category_id`: 分類篩選（可選）
  - `status_filter`: 狀態篩選，值為 "true" 或 "false"（可選）
  - `page`: 頁碼（預設：1）
  - `page_size`: 每頁筆數（預設：10）

### 影響範圍

- **API 端點**: `GET /backend/admin/products`
- **前端頁面**: `app/static/admin/products/index.html`（已支援，現在 API 也支援）
- **數據庫**: 無變更
- **向後兼容**: 完全向後兼容，現有調用不受影響

### 注意事項

1. `status_filter` 參數為可選，不提供時不進行狀態篩選
2. 參數值為字符串格式（"true"/"false"），API 會自動轉換為布爾值
3. 空字符串會被忽略，不進行篩選
4. 與其他篩選條件（search、category_id）可以組合使用

---

## [2025-11-25 16:55:44] - 產品圖片刪除功能增強

### 修改內容

#### 產品圖片刪除時自動刪除文件
- **時間**: 2025-11-25 16:55:44
- **功能**: 刪除產品圖片時，同時刪除 `static/uploads/` 目錄中的實際文件
- **修改檔案**:
  - `app/api/admin/product_images.py`
- **變更詳情**:
  - 添加文件路徑處理邏輯（導入 `Path` 和 `os` 模組）
  - 定義 `UPLOAD_DIR` 路徑常量（與 `upload.py` 保持一致）
  - 在刪除數據庫記錄前，先刪除實際文件
  - 從 `image_url` 中提取文件名（處理 `/static/uploads/filename.webp` 格式）
  - 添加文件存在性檢查
  - 添加錯誤處理和日誌記錄
- **功能特點**:
  - 自動刪除：刪除圖片記錄時自動刪除對應的文件
  - 安全處理：文件不存在或刪除失敗不會影響數據庫操作
  - 日誌記錄：記錄刪除操作和錯誤信息
  - 路徑解析：正確解析 URL 格式並定位文件

### 技術細節

#### 文件刪除邏輯
```python
# 從 URL 中提取文件名
if image_url.startswith('/static/uploads/'):
    filename = image_url.replace('/static/uploads/', '')
    file_path = UPLOAD_DIR / filename
    
    # 檢查文件是否存在並刪除
    if file_path.exists() and file_path.is_file():
        os.remove(file_path)
```

#### 錯誤處理
- 文件不存在：記錄警告但不中斷流程
- 文件刪除失敗：記錄警告，仍繼續刪除數據庫記錄
- 確保數據庫操作和文件操作都有適當的異常處理

### 影響範圍

- **API 端點**: `DELETE /backend/admin/products/{product_id}/images/{image_id}`
- **數據庫**: 無變更
- **文件系統**: 刪除操作會移除 `static/uploads/` 目錄中的文件

### 注意事項

1. 確保應用程序有刪除 `static/uploads/` 目錄文件的權限
2. 文件刪除失敗不會影響數據庫記錄的刪除
3. 建議定期檢查 `static/uploads/` 目錄，清理孤立文件

---

**最後更新**: 2025-11-25 16:55:44

---

## [2025-11-25 17:09:34] - 整合 SimpleMDE Markdown 編輯器

### 修改內容

#### Admin 內容管理整合 SimpleMDE 編輯器
- **時間**: 2025-11-25 17:09:34
- **功能**: 在所有需要內容編輯的 admin 頁面中整合 SimpleMDE Markdown 編輯器
- **參考**: [SimpleMDE Markdown Editor](https://github.com/sparksuite/simplemde-markdown-editor)
- **修改檔案**:
  - `app/static/base.html` - 添加 SimpleMDE CSS 和 JS CDN 連結
  - `app/static/js/admin-simplemde.js` - 新增 SimpleMDE 工具函數
  - `app/static/admin/products/add-edit.html` - 產品描述使用 Markdown 編輯器
  - `app/static/admin/news/add-edit.html` - 新聞內容使用 Markdown 編輯器
  - `app/static/admin/about/add-edit.html` - 關於我們內容使用 Markdown 編輯器
  - `app/static/admin/faq/add-edit.html` - FAQ 答案使用 Markdown 編輯器
  - `app/static/admin/categories/add-edit.html` - 分類描述使用 Markdown 編輯器
- **變更詳情**:
  - 在 `base.html` 中添加 SimpleMDE 1.11.2 的 CDN 連結（CSS 和 JS）
  - 創建 `admin-simplemde.js` 工具文件，提供統一的編輯器初始化函數
  - 所有內容編輯欄位從普通 `textarea` 升級為 SimpleMDE 編輯器
  - 支援 Markdown 語法高亮、預覽、快捷鍵等功能
- **功能特點**:
  - **語法高亮**: 編輯時即時顯示 Markdown 語法樣式
  - **工具欄**: 提供常用 Markdown 格式按鈕（粗體、斜體、標題、連結、圖片等）
  - **預覽功能**: 支援即時預覽和並排預覽模式
  - **快捷鍵**: 支援常用快捷鍵（Cmd-B 粗體、Cmd-I 斜體等）
  - **自動保存**: 可選的自動保存功能
  - **拼寫檢查**: 可選的拼寫檢查（預設關閉）
  - **全螢幕編輯**: 支援全螢幕編輯模式

### 技術細節

#### SimpleMDE 配置
- **版本**: 1.11.2
- **CDN**: jsDelivr
- **依賴**: CodeMirror（已包含）、Font Awesome（已存在）

#### 工具函數 (`admin-simplemde.js`)
- `initSimpleMDE(textareaId, options)` - 初始化編輯器
- `getSimpleMDEValue(simplemde)` - 獲取編輯器內容
- `setSimpleMDEValue(simplemde, value)` - 設置編輯器內容

#### 各頁面配置
- **產品管理**: 描述欄位，簡化工具欄（粗體、斜體、標題、引用、代碼、連結、圖片、預覽）
- **新聞管理**: 內容欄位，完整工具欄
- **關於我們**: 內容欄位，完整工具欄
- **FAQ 管理**: 答案欄位，完整工具欄
- **分類管理**: 描述欄位，簡化工具欄

#### 編輯器初始化
```javascript
// 延遲初始化，確保 DOM 已載入
setTimeout(() => {
    descriptionEditor = initSimpleMDE('description', {
        placeholder: '輸入內容（支援 Markdown 格式）...',
        toolbar: ['bold', 'italic', '|', 'heading', '|', 'quote', 'code', '|', 'link', '|', 'preview']
    });
}, 100);
```

#### 數據處理
- **載入數據**: 使用 `setSimpleMDEValue()` 設置編輯器內容
- **提交數據**: 使用 `getSimpleMDEValue()` 獲取編輯器內容
- **向後兼容**: 如果編輯器未初始化，回退到普通 textarea

### 影響範圍

- **前端頁面**: 5 個 admin 編輯頁面
- **用戶體驗**: 大幅提升內容編輯體驗
- **數據格式**: 支援 Markdown 格式的內容存儲
- **向後兼容**: 現有數據不受影響，可正常顯示和編輯

### 注意事項

1. **Markdown 格式**: 所有內容欄位現在支援 Markdown 格式
2. **前端渲染**: 前端顯示時需要 Markdown 解析器（如 marked.js）
3. **編輯器載入**: 使用 `setTimeout` 確保 DOM 完全載入後再初始化
4. **CDN 依賴**: 依賴 jsDelivr CDN，確保網絡連接正常

### 後續改進建議

1. 在前端添加 Markdown 解析器，正確顯示 Markdown 內容
2. 添加圖片上傳功能到編輯器工具欄
3. 自定義工具欄按鈕，添加更多實用功能
4. 實現自動保存功能

---

## 2025-11-25 21:08:27 - 添加產品圖片陣列到 API 響應

### 修改內容

在產品 API 響應中添加 `product_images` 陣列，包含產品的所有圖片資訊。

### 修改檔案

1. **`app/schemas/product.py`**
   - 新增 `ProductImageResponse` schema，包含 `id`、`image_url`、`order_index` 欄位
   - 在 `ProductResponse` 中添加 `product_images: List[ProductImageResponse] = []` 欄位

2. **`app/api/products.py`**
   - 在 `get_products()` 函數中：
     - 添加 `joinedload(Product.images)` 以載入產品圖片關係
     - 構建 `product_images` 陣列，按 `order_index` 排序
     - 將 `product_images` 包含在響應中
   - 在 `get_product()` 函數中：
     - 添加 `joinedload(Product.images)` 以載入產品圖片關係
     - 構建 `product_images` 陣列，按 `order_index` 排序
     - 將 `product_images` 包含在響應中

### 功能變更

- **GET `/api/products`**: 現在返回的每個產品都包含 `product_images` 陣列
- **GET `/api/products/{product_id}`**: 現在返回的產品詳情包含 `product_images` 陣列

### 技術細節

- 使用 SQLAlchemy 的 `joinedload()` 進行 eager loading，避免 N+1 查詢問題
- 圖片按 `order_index` 排序，確保顯示順序正確
- 如果產品沒有圖片，`product_images` 為空陣列 `[]`

### API 響應格式

```json
{
  "id": 1,
  "title": "產品名稱",
  "price": 99.99,
  "description": "產品描述",
  "image": "主圖片URL",
  "category_id": 1,
  "category_name": "分類名稱",
  "stock": 100,
  "is_active": true,
  "created_at": "2025-11-25T21:08:27",
  "product_images": [
    {
      "id": 1,
      "image_url": "圖片URL1",
      "order_index": 0
    },
    {
      "id": 2,
      "image_url": "圖片URL2",
      "order_index": 1
    }
  ]
}
```

---

**最後更新**: 2025-11-25 21:08:27

