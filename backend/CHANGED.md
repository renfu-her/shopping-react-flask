# Backend 更改記錄 (CHANGED)

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

**最後更新**: 2025-11-25 17:09:34

