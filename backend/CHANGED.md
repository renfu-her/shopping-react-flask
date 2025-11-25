# Backend 更改記錄 (CHANGED)

## [2025-11-25 22:33:50] - 提取 Admin 頁面內嵌 CSS 到 admin-common.css

### 修改內容

#### 將所有內嵌 CSS 提取到統一的外部文件
- **時間**: 2025-11-25 22:33:50
- **功能**: 將所有 admin 頁面中的內嵌 CSS 樣式提取到 `admin-common.css` 文件中，減少代碼重複，提高可維護性
- **修改檔案**:
  - `app/static/css/admin-common.css` - 新增文件，包含所有 admin 頁面共用的 CSS 樣式
  - 所有 `app/static/admin/**/*.html` 文件（15 個文件）- 移除內嵌 `<style>` 標籤，改為引用外部 CSS 文件
- **變更詳情**:
  - 創建 `admin-common.css` 文件，包含載入動畫相關的 CSS 樣式
  - 在所有 admin 頁面的 `<head>` 中添加 `<link rel="stylesheet" href="/static/css/admin-common.css">`
  - 移除所有頁面中的內嵌 `<style>` 標籤及其內容
  - 保持 CSS 樣式順序：CSS link 在 script 之前載入
- **功能特點**:
  - **代碼重用**: 所有 admin 頁面共用同一份 CSS 文件，減少重複代碼
  - **易於維護**: CSS 樣式集中管理，修改一處即可影響所有頁面
  - **性能優化**: 瀏覽器可以緩存 CSS 文件，減少重複下載
  - **結構清晰**: HTML 文件更簡潔，樣式和結構分離

### 技術細節

#### 新增文件結構
```
backend/app/static/css/admin-common.css
```

#### CSS 內容
```css
/* 載入動畫樣式 */
#loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    opacity: 1;
    transition: opacity 0.3s ease-out;
}

#loading.hidden {
    opacity: 0;
    pointer-events: none;
}

.spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

#### HTML 引用方式
```html
<head>
    <!-- ... meta tags ... -->
    <link rel="stylesheet" href="/static/css/admin-common.css">
    <script src="/static/js/admin-common.js"></script>
    <!-- ... 其他 script ... -->
</head>
```

### 影響範圍

- **新增文件**: `app/static/css/admin-common.css`
- **修改文件**: 所有 15 個 admin 子頁面
- **功能**: 所有功能保持不變，只是將 CSS 樣式外部化
- **性能**: 瀏覽器可以緩存 CSS 文件，提升載入速度

### 注意事項

1. **載入順序**: CSS link 標籤應放在 script 標籤之前，確保樣式優先載入
2. **路徑**: CSS 文件路徑為 `/static/css/admin-common.css`，確保路徑正確
3. **向後兼容**: 所有功能保持不變，只是改變了 CSS 的載入方式
4. **未來擴展**: 可以在 `admin-common.css` 中添加更多共用的 admin 樣式

### 後續改進建議

1. 考慮將更多共用的 admin 樣式添加到 `admin-common.css`
2. 考慮使用 CSS 變量（CSS Variables）來統一管理顏色、間距等設計系統
3. 考慮使用 CSS 預處理器（如 Sass/Less）來進一步組織樣式

---

## [2025-11-25 22:31:06] - 優化 Admin 頁面載入動畫顯示效果

### 修改內容

#### 改進載入動畫的顯示和隱藏效果
- **時間**: 2025-11-25 22:31:06
- **問題**: 載入動畫在頁面載入時會突然出現和消失，造成視覺上的閃爍
- **修改檔案**:
  - `app/static/js/admin-common.js` - 改進載入動畫隱藏邏輯
  - 所有 `app/static/admin/**/*.html` 文件（15 個文件）- 優化載入動畫樣式
- **變更詳情**:
  - 將載入動畫尺寸從 40px 縮小到 32px，邊框從 4px 縮小到 3px
  - 將動畫速度從 1s 加快到 0.8s，讓動畫更流暢
  - 添加淡出過渡效果（`transition: opacity 0.3s ease-out`）
  - 使用 `hidden` class 來控制淡出，而不是直接設置 `display: none`
  - 延遲隱藏載入動畫，確保在頁面內容完全初始化後再隱藏
  - 添加 `pointer-events: none` 在淡出時，避免點擊干擾
- **功能特點**:
  - **平滑過渡**: 載入動畫會平滑淡出，而不是突然消失
  - **更小的尺寸**: 載入動畫更小更精緻，不會過於突兀
  - **更好的時機**: 在頁面內容完全載入後才隱藏，避免閃爍
  - **更好的體驗**: 整體載入體驗更流暢自然

### 技術細節

#### 載入動畫樣式改進
```css
#loading {
    /* ... 其他樣式 ... */
    opacity: 1;
    transition: opacity 0.3s ease-out;
}
#loading.hidden {
    opacity: 0;
    pointer-events: none;
}
.spinner {
    border: 3px solid #f3f3f3;  /* 從 4px 改為 3px */
    border-top: 3px solid #3498db;  /* 從 4px 改為 3px */
    width: 32px;  /* 從 40px 改為 32px */
    height: 32px;  /* 從 40px 改為 32px */
    animation: spin 0.8s linear infinite;  /* 從 1s 改為 0.8s */
}
```

#### 隱藏邏輯改進
```javascript
// 頁面內容初始化完成後再隱藏載入提示（添加淡出動畫）
setTimeout(() => {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.classList.add('hidden');  // 使用 class 觸發淡出
        setTimeout(() => {
            loadingDiv.style.display = 'none';  // 淡出完成後移除
        }, 300);
    }
}, 100);
```

### 影響範圍

- **前端頁面**: 所有 15 個 admin 子頁面
- **用戶體驗**: 載入動畫更平滑，視覺效果更好
- **性能**: 無影響，只是改進了視覺效果

### 注意事項

1. **淡出時間**: 淡出動畫持續 0.3 秒，確保平滑過渡
2. **隱藏時機**: 在頁面內容初始化完成後再隱藏，避免閃爍
3. **向後兼容**: 所有功能保持不變，只是改進了視覺效果

---

## [2025-11-25 22:26:27] - 修復 Admin 頁面 jQuery 載入問題

### 修改內容

#### 修復 "$ is not defined" 錯誤
- **時間**: 2025-11-25 22:26:27
- **問題**: 移除重複資源後，`admin-common.js` 中的 `initNavigation()` 函數在 jQuery 載入前就被調用，導致 `$ is not defined` 錯誤
- **修改檔案**:
  - `app/static/js/admin-common.js`
- **變更詳情**:
  - 修改 `loadBaseAndInit` 函數，不再移除 `base.html` 中的 script 標籤
  - 改為提取 `base.html` 中的 link 和 script 標籤，並按順序載入
  - 先載入 CSS link 標籤
  - 替換 body 內容
  - 按順序載入所有 script 標籤，並等待載入完成
  - 添加 jQuery 載入檢查，確保 jQuery 已載入後再調用 `initNavigation()`
  - 添加最多 5 秒的等待機制，確保 jQuery 完全載入
- **功能特點**:
  - **正確的載入順序**: 確保資源按正確順序載入
  - **異步載入處理**: 使用 Promise 等待腳本載入完成
  - **錯誤處理**: 添加超時檢查，避免無限等待
  - **向後兼容**: 保持所有功能不變

### 技術細節

#### 載入流程
1. 提取 `base.html` 中的 link 和 script 標籤
2. 先添加 CSS link 標籤到 head
3. 替換 body 內容
4. 按順序載入所有 script 標籤（使用 Promise 等待）
5. 檢查 jQuery 是否已載入（最多等待 5 秒）
6. 調用 `initNavigation()` 初始化導航菜單

#### 腳本載入邏輯
```javascript
const loadScripts = async () => {
    for (const script of headScripts) {
        if (script.src) {
            if (!document.querySelector(`script[src="${script.src}"]`)) {
                await new Promise((resolve, reject) => {
                    const newScript = document.createElement('script');
                    newScript.src = script.src;
                    newScript.onload = resolve;
                    newScript.onerror = reject;
                    document.head.appendChild(newScript);
                });
            }
        }
    }
};
```

#### jQuery 載入檢查
```javascript
// 確保 jQuery 已載入（等待最多 5 秒）
let jqueryReady = false;
for (let i = 0; i < 50; i++) {
    if (typeof window.$ !== 'undefined' || typeof window.jQuery !== 'undefined') {
        jqueryReady = true;
        break;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
}
```

### 影響範圍

- **前端頁面**: 所有使用 `admin-common.js` 的 admin 子頁面
- **功能**: 修復了 jQuery 未載入導致的錯誤
- **性能**: 無影響，只是改進了載入順序

### 注意事項

1. **載入順序**: 確保 jQuery 在 `initNavigation()` 之前載入
2. **超時處理**: 如果 jQuery 載入超時，會記錄警告但繼續執行
3. **向後兼容**: 所有功能保持不變

---

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

## [2025-11-25 22:24:14] - Admin 頁面資源載入優化：統一使用 base.html 的資源

### 修改內容

#### 移除重複的 script 和 link 標籤
- **時間**: 2025-11-25 22:24:14
- **功能**: 從所有 `static/admin` 目錄下的子頁面中移除重複的 jQuery、Tailwind CSS 和 Font Awesome 引用，統一使用 `base.html` 中已載入的資源
- **修改檔案**:
  - `app/static/admin/about/index.html`
  - `app/static/admin/about/add-edit.html`
  - `app/static/admin/ads/index.html`
  - `app/static/admin/ads/add-edit.html`
  - `app/static/admin/categories/index.html`
  - `app/static/admin/categories/add-edit.html`
  - `app/static/admin/products/index.html`
  - `app/static/admin/products/add-edit.html`
  - `app/static/admin/users/index.html`
  - `app/static/admin/users/add-edit.html`
  - `app/static/admin/orders/index.html`
  - `app/static/admin/news/index.html`
  - `app/static/admin/news/add-edit.html`
  - `app/static/admin/faq/index.html`
  - `app/static/admin/faq/add-edit.html`
- **變更詳情**:
  - 移除所有頁面中重複的 jQuery CDN 引用（`<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>`）
  - 移除所有頁面中重複的 Tailwind CSS CDN 引用（`<script src="https://cdn.tailwindcss.com"></script>`）
  - 移除部分頁面中重複的 Font Awesome CSS 引用（`<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">`）
  - 保留 `admin-common.js` 引用（必須在載入 base.html 之前載入）
  - 保留頁面特定的 JS 文件（如 `admin-upload.js`、`admin-simplemde.js`、`admin-pagination.js`）
- **功能特點**:
  - **減少重複載入**: 避免重複載入相同的資源，提升頁面載入速度
  - **統一資源管理**: 所有共用資源（jQuery、Tailwind CSS、Font Awesome、SimpleMDE）統一在 `base.html` 中管理
  - **簡化維護**: 資源版本更新只需修改 `base.html` 一處
  - **保持功能**: 所有頁面功能保持不變，因為 `base.html` 已包含所需資源

### 技術細節

#### base.html 已包含的資源
- **jQuery**: `https://code.jquery.com/jquery-3.7.1.min.js`
- **Tailwind CSS**: `https://cdn.tailwindcss.com`
- **Font Awesome**: `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css`
- **SimpleMDE CSS**: `https://cdn.jsdelivr.net/npm/simplemde@1.11.2/dist/simplemde.min.css`
- **SimpleMDE JS**: `https://cdn.jsdelivr.net/npm/simplemde@1.11.2/dist/simplemde.min.js`

#### 載入流程
1. 各子頁面載入 `admin-common.js`（包含 `loadBaseAndInit` 函數）
2. `loadBaseAndInit` 函數動態載入 `base.html`
3. `base.html` 中包含所有共用資源（jQuery、Tailwind CSS、Font Awesome、SimpleMDE）
4. 子頁面特定的 JS 文件（如 `admin-upload.js`、`admin-simplemde.js`）在子頁面中載入

#### 保留的資源引用
- **admin-common.js**: 必須保留，因為它包含載入 base.html 的邏輯
- **admin-upload.js**: 頁面特定的上傳功能
- **admin-simplemde.js**: SimpleMDE 編輯器的包裝函數（依賴 base.html 中的 SimpleMDE）
- **admin-pagination.js**: 頁面特定的分頁功能

### 影響範圍

- **前端頁面**: 15 個 admin 子頁面（8 個 index.html + 7 個 add-edit.html）
- **頁面載入**: 減少重複資源載入，提升載入速度
- **維護性**: 資源版本更新只需修改 `base.html`
- **功能**: 所有頁面功能保持不變

### 注意事項

1. **載入順序**: `admin-common.js` 必須在載入 base.html 之前載入
2. **資源依賴**: 頁面特定的 JS 文件（如 `admin-simplemde.js`）依賴 base.html 中的 SimpleMDE
3. **向後兼容**: 所有功能保持不變，只是移除了重複的資源引用
4. **CDN 依賴**: 所有資源仍依賴 CDN，確保網絡連接正常

### 後續改進建議

1. 考慮將頁面特定的 JS 文件也整合到 base.html 中（如果所有頁面都需要）
2. 考慮使用本地資源替代 CDN，提升載入速度和穩定性
3. 考慮使用構建工具（如 webpack）打包和優化資源

---

**最後更新**: 2025-11-25 22:24:14

