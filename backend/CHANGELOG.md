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

**最後更新**: 2025-11-25 11:42:11

