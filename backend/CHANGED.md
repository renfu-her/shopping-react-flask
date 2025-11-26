# Backend 更改記錄 (CHANGED)

## [2025-11-26 08:20:18] - 修復載入動畫被替換導致購物車圖標閃現的問題

### 修改內容

#### 修復載入動畫在 body 替換時被移除的問題
- **時間**: 2025-11-26 08:20:18
- **問題**: 當 `admin-common.js` 替換 body 內容時，原本的 `#loading` div 被移除，導致 base.html 中的購物車圖標在載入動畫消失前就顯示出來
- **修改檔案**:
  - `app/static/js/admin-common.js`
- **變更詳情**:
  - 在替換 body 內容之前，先保存原有的 `#loading` div
  - 替換 body 內容後，將保存的 `#loading` div 重新添加到 body 最前面
  - 確保載入動畫始終在最上層，覆蓋 base.html 的內容
- **功能特點**:
  - **防止閃現**: 確保載入動畫在頁面內容載入完成前始終顯示
  - **正確順序**: 載入動畫在 base.html 內容之上，避免購物車圖標等內容提前顯示
  - **向後兼容**: 不影響其他功能

### 技術細節

#### 修復邏輯
```javascript
// 保存当前的 loading div（如果存在）
const existingLoading = document.getElementById('loading');
const loadingParent = existingLoading ? existingLoading.parentNode : null;
const loadingNextSibling = existingLoading ? existingLoading.nextSibling : null;

// 替换整个 body 内容
document.body.innerHTML = baseBody.innerHTML;

// 如果有保存的 loading div，将其重新添加到 body 最前面（覆盖 base.html 的内容）
if (existingLoading && loadingParent) {
    document.body.insertBefore(existingLoading, document.body.firstChild);
}
```

### 影響範圍

- **前端頁面**: 所有使用 `admin-common.js` 的 admin 子頁面
- **功能**: 修復載入動畫被替換的問題，避免購物車圖標閃現
- **性能**: 無影響

### 注意事項

1. **載入順序**: 載入動畫現在會正確保留在頁面最上層
2. **視覺效果**: 用戶不會再看到購物車圖標在載入時閃現

---

## [2025-11-26 08:16:43] - 移除 admin 目錄下所有 Font Awesome 引用

### 修改內容

#### 移除分類管理頁面中的 Font Awesome CDN 和相關代碼
- **時間**: 2025-11-26 08:16:43
- **功能**: 移除所有 admin 目錄下頁面中的 Font Awesome CDN link、CSS 樣式和載入檢測腳本
- **修改檔案**:
  - `app/static/admin/categories/index.html`
  - `app/static/admin/categories/add-edit.html`
- **變更詳情**:
  - **categories/index.html**:
    - 移除 Font Awesome CDN link (`<link rel="stylesheet" href="...font-awesome...">`)
    - 移除 Font Awesome 圖標隱藏/顯示 CSS 樣式
    - 移除 Font Awesome CSS 載入檢測腳本
  - **categories/add-edit.html**:
    - 移除 Font Awesome CDN link
    - 移除 Font Awesome 圖標隱藏/顯示 CSS 樣式
    - 移除 Font Awesome CSS 載入檢測腳本
- **功能特點**:
  - **完全移除**: 所有 Font Awesome 的外部引用都已移除
  - **簡化代碼**: 移除了不必要的載入檢測邏輯
  - **注意**: 代碼中仍有使用 Font Awesome 圖標的功能（如 `createFontAwesomeIconSelector`），但不再載入 Font Awesome CSS

### 技術細節

#### 移除的內容
1. **CDN Link**: Font Awesome 6.5.1 CSS CDN 引用
2. **CSS 樣式**: 防止圖標在載入前顯示為大文本的樣式
3. **載入檢測**: 等待 Font Awesome CSS 載入完成並添加 `fontawesome-loaded` 類別的腳本

### 影響範圍

- **前端頁面**: 分類管理頁面（index.html 和 add-edit.html）
- **功能**: Font Awesome 圖標將不再顯示（因為 CSS 未載入）
- **代碼**: 代碼中仍有使用 Font Awesome 的邏輯，但圖標不會正常顯示

### 注意事項

1. **圖標顯示**: 移除 Font Awesome 後，使用 Font Awesome 圖標的地方將無法正常顯示
2. **後續處理**: 可能需要將圖標功能改為使用其他圖標庫或圖片
3. **代碼保留**: 相關的圖標選擇器代碼仍保留在文件中，但功能無法正常使用

---

## [2025-11-25 23:07:31] - 移除 admin-common.js 中的 Font Awesome 處理，改用 CDN 直接載入

### 修改內容

#### 從 admin-common.js 移除 Font Awesome 相關邏輯
- **時間**: 2025-11-25 23:07:31
- **功能**: 移除 `admin-common.js` 中所有 Font Awesome 相關的載入邏輯，改為在分類管理頁面直接使用 CDN
- **修改檔案**:
  - `app/static/js/admin-common.js`
  - `app/static/admin/categories/index.html`
  - `app/static/admin/categories/add-edit.html`
- **變更詳情**:
  - **admin-common.js**:
    - 移除 `needsFontAwesome` 檢查邏輯
    - 移除 Font Awesome CSS 載入等待邏輯
    - 移除 `fontawesome-loaded` 類別標記邏輯
    - 在載入 `base.html` 的 link 標籤時，跳過 Font Awesome（因為分類管理頁面會直接使用 CDN）
  - **categories/index.html 和 categories/add-edit.html**:
    - 在 `<head>` 中直接添加 Font Awesome CDN link
    - 在 `<body>` 開始處添加腳本，等待 Font Awesome CSS 載入完成後添加 `fontawesome-loaded` 類別
    - 保留原有的 Font Awesome 圖標隱藏/顯示 CSS 樣式
- **功能特點**:
  - **簡化邏輯**: `admin-common.js` 不再需要處理 Font Awesome 的特殊邏輯
  - **直接載入**: 分類管理頁面直接使用 CDN，載入更快
  - **向後兼容**: 所有功能保持不變，只是改變了載入方式
  - **性能優化**: 其他頁面不再載入 Font Awesome，減少不必要的資源載入

### 技術細節

#### Font Awesome CDN
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
      integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" 
      crossorigin="anonymous" 
      referrerpolicy="no-referrer" />
```

#### Font Awesome 載入檢測
- 使用 `link.onload` 事件監聽載入完成
- 使用 `link.sheet` 或 `link.styleSheet` 檢查樣式是否已應用
- 設置 5 秒超時，避免無限等待
- 載入完成後添加 `fontawesome-loaded` 類別，觸發 CSS 顯示圖標

### 影響範圍

- **前端頁面**: 分類管理頁面（index.html 和 add-edit.html）
- **功能**: 所有功能保持不變，Font Awesome 圖標正常顯示
- **性能**: 其他頁面不再載入 Font Awesome，減少資源載入

### 注意事項

1. **CDN 載入**: 分類管理頁面現在直接使用 CDN 載入 Font Awesome
2. **載入檢測**: 使用多種方法檢測 Font Awesome 是否已載入完成
3. **向後兼容**: 所有功能保持不變

---

## [2025-11-25 23:05:14] - 調整 admin-common.js 載入順序：移至 body 末尾

### 修改內容

#### 將 admin-common.js 移到所有其他腳本之後載入
- **時間**: 2025-11-25 23:05:14
- **功能**: 將所有 admin 頁面中的 `admin-common.js` 從 `<head>` 移到 `<body>` 末尾，確保在所有其他腳本載入完成後才載入
- **修改檔案**:
  - 所有 `app/static/admin/**/*.html` 文件（15 個文件）
- **變更詳情**:
  - 從所有頁面的 `<head>` 中移除 `<script src="/static/js/admin-common.js"></script>`
  - 將 `admin-common.js` 移到 `<body>` 末尾，在所有內聯腳本和其他外部腳本之後
  - 確保載入順序：其他腳本（如 `admin-upload.js`, `admin-simplemde.js`, `admin-pagination.js`）→ 內聯腳本 → `admin-common.js`
- **功能特點**:
  - **正確的載入順序**: `admin-common.js` 在所有依賴載入完成後才執行
  - **避免依賴問題**: 確保所有必要的函數和變數都已定義
  - **性能優化**: 不阻塞其他資源的載入
  - **向後兼容**: 所有功能保持不變

### 技術細節

#### 載入順序
```
<head>
  <style>...</style>
  <script src="/static/js/admin-upload.js"></script>  <!-- 其他腳本 -->
  <script src="/static/js/admin-simplemde.js"></script>
</head>
<body>
  ...
  <script>
    // 內聯腳本（使用 admin-common.js 中的函數）
    loadBaseAndInit(initPage);
  </script>
  <script src="/static/js/admin-common.js"></script>  <!-- 最後載入 -->
</body>
```

### 影響範圍

- **前端頁面**: 所有 15 個 admin 子頁面
- **功能**: 所有功能保持不變，只是改變了載入順序
- **性能**: 無影響，可能略有改善（不阻塞其他資源）

### 注意事項

1. **載入順序**: `admin-common.js` 現在在所有其他腳本之後載入
2. **依賴關係**: 確保所有依賴 `admin-common.js` 的腳本在它之前載入
3. **向後兼容**: 所有功能保持不變

---

## [2025-11-25 23:01:29] - 移除非分類管理頁面的 admin-common.css 引用

### 修改內容

#### 從非分類管理頁面移除 admin-common.css 引用
- **時間**: 2025-11-25 23:01:29
- **功能**: 從所有非分類管理的 admin 頁面中移除 `admin-common.css` 引用，改為內聯載入動畫樣式
- **修改檔案**:
  - 所有 `app/static/admin/**/*.html` 文件（13 個非分類管理頁面）
- **變更詳情**:
  - 從 13 個非分類管理頁面中移除 `<link rel="stylesheet" href="/static/css/admin-common.css">`
  - 在這些頁面中添加內聯的載入動畫樣式（`#loading` 和 `.spinner`）
  - 保留所有頁面的 `<script src="/static/js/admin-common.js"></script>` 引用
  - 分類管理頁面（`categories/index.html` 和 `categories/add-edit.html`）保留 `admin-common.css` 引用
- **功能特點**:
  - **精確控制**: 只有分類管理頁面使用 `admin-common.css`
  - **避免閃爍**: 其他頁面不再受 Font Awesome 樣式影響
  - **保持功能**: 所有頁面保留載入動畫功能（通過內聯樣式）
  - **代碼分離**: 通用樣式和特定功能樣式分離

### 技術細節

#### 內聯樣式內容
```css
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

### 影響範圍

- **前端頁面**: 13 個非分類管理頁面
- **分類管理**: 保留 `admin-common.css` 引用
- **功能**: 所有功能保持不變，載入動畫正常工作
- **性能**: 無影響

### 注意事項

1. **樣式位置**: 載入動畫樣式現在內聯在每個頁面中
2. **分類管理**: 分類管理頁面仍使用 `admin-common.css`（包含 Font Awesome 樣式）
3. **向後兼容**: 所有功能保持不變

---

## [2025-11-25 22:55:13] - 移除 admin-common.css 中的 Font Awesome 樣式，僅在分類管理頁面使用

### 修改內容

#### 將 Font Awesome 樣式從通用 CSS 中移除
- **時間**: 2025-11-25 22:55:13
- **問題**: 其他頁面載入 `admin-common.css` 時會出現很大的 icon 閃一下，因為 CSS 中有隱藏 Font Awesome 圖標的樣式
- **原因**: `admin-common.css` 中包含 Font Awesome 相關樣式，但只有分類管理需要 Font Awesome
- **修改檔案**:
  - `app/static/css/admin-common.css` - 移除 Font Awesome 相關樣式
  - `app/static/admin/categories/index.html` - 添加 Font Awesome 樣式（內聯）
  - `app/static/admin/categories/add-edit.html` - 添加 Font Awesome 樣式（內聯）
- **變更詳情**:
  - 從 `admin-common.css` 中移除所有 Font Awesome 相關樣式
  - 在分類管理的兩個頁面（`index.html` 和 `add-edit.html`）中添加內聯樣式
  - 保持 `admin-common.css` 只包含載入動畫等通用樣式
  - 其他頁面不再受 Font Awesome 樣式影響
- **功能特點**:
  - **精確控制**: Font Awesome 樣式只在分類管理頁面生效
  - **避免閃爍**: 其他頁面不會再出現大圖標閃爍問題
  - **代碼分離**: 通用樣式和特定功能樣式分離，更易維護

### 技術細節

#### 移除的樣式（從 admin-common.css）
```css
/* 防止 Font Awesome 图标在 CSS 加载前显示为大文本 */
.fa, .fas, .far, .fab, .fal, .fad, .fa-solid, .fa-regular, .fa-brands, .fa-light, .fa-duotone,
[class*="fa-"] {
    visibility: hidden;
    font-size: 0;
}

/* 当 Font Awesome 加载完成后，图标会正常显示 */
html.fontawesome-loaded .fa,
/* ... 其他類別 ... */
```

#### 添加的樣式（分類管理頁面）
在 `categories/index.html` 和 `categories/add-edit.html` 中添加相同的內聯樣式。

### 影響範圍

- **前端頁面**: 所有 admin 頁面
- **分類管理**: 保持 Font Awesome 圖標正常顯示
- **其他頁面**: 不再出現大圖標閃爍問題
- **功能**: 所有功能保持不變

### 注意事項

1. **樣式位置**: Font Awesome 樣式現在只在分類管理頁面中
2. **維護性**: 如果未來其他頁面需要 Font Awesome，可以考慮創建單獨的 CSS 文件
3. **向後兼容**: 所有功能保持不變

---

## [2025-11-25 22:49:18] - 優化 Font Awesome 載入邏輯：僅在分類管理頁面等待載入

### 修改內容

#### 優化 Font Awesome CSS 載入邏輯
- **時間**: 2025-11-25 22:49:18
- **功能**: 只在分類管理頁面等待 Font Awesome CSS 載入完成，其他頁面不需要等待，提升載入速度
- **修改檔案**:
  - `app/static/js/admin-common.js`
- **變更詳情**:
  - 檢查當前頁面路徑，判斷是否為分類管理頁面（`/categories`）
  - 只在分類管理頁面等待 Font Awesome CSS 載入完成
  - 其他頁面不等待 Font Awesome CSS 載入，立即標記為已載入，避免延遲
  - 非分類管理頁面立即添加 `fontawesome-loaded` class，確保圖標正常顯示（如果有的話）
- **功能特點**:
  - **性能優化**: 非分類管理頁面不需要等待 Font Awesome CSS 載入，載入速度更快
  - **精確控制**: 只在真正需要 Font Awesome 的頁面等待載入
  - **向後兼容**: 所有功能保持不變

### 技術細節

#### 判斷邏輯
```javascript
// 检查当前页面是否需要 Font Awesome（只有分类管理需要）
const currentPath = window.location.pathname;
const needsFontAwesome = currentPath.includes('/categories');

// 对于 Font Awesome CSS，只在分类管理页面等待加载完成
if (href.includes('font-awesome') && needsFontAwesome) {
    // 等待加载完成
} else if (href.includes('font-awesome') && !needsFontAwesome) {
    // 非分类管理页面，直接标记为已加载，不等待
    document.documentElement.classList.add('fontawesome-loaded');
}
```

### 影響範圍

- **前端頁面**: 所有 admin 頁面
- **性能**: 非分類管理頁面載入速度更快
- **功能**: 所有功能保持不變

### 注意事項

1. **頁面判斷**: 使用路徑包含 `/categories` 來判斷是否為分類管理頁面
2. **載入順序**: 分類管理頁面仍會等待 Font Awesome CSS 載入完成
3. **其他頁面**: 非分類管理頁面不等待，立即顯示內容

---

## [2025-11-25 22:46:02] - 修復 Admin 頁面 Font Awesome 圖標閃爍問題

### 修改內容

#### 修復某些頁面出現大圖標閃爍的問題
- **時間**: 2025-11-25 22:46:02
- **問題**: 首頁 Banner、分類管理、產品管理、訂單管理、FAQ 管理頁面在載入時會出現一個很大的圖標然後消失
- **原因**: Font Awesome CSS 異步載入，在 CSS 載入完成前，圖標會顯示為大文本（因為 Font Awesome 使用字體圖標）
- **修改檔案**:
  - `app/static/css/admin-common.css` - 添加圖標隱藏樣式
  - `app/static/js/admin-common.js` - 等待 Font Awesome CSS 載入完成
- **變更詳情**:
  - 在 `admin-common.css` 中添加樣式，默認隱藏所有 Font Awesome 圖標
  - 當 Font Awesome CSS 載入完成後，添加 `fontawesome-loaded` class 到 `html` 元素
  - 在 `admin-common.js` 中，等待 Font Awesome CSS 載入完成後再替換 body 內容
  - 設置 5 秒超時，避免無限等待
- **功能特點**:
  - **防止閃爍**: 圖標在 CSS 載入前不會顯示，避免大圖標閃爍
  - **自動顯示**: CSS 載入完成後自動顯示圖標
  - **超時保護**: 即使 CSS 載入失敗，也會在 5 秒後顯示圖標
  - **向後兼容**: 所有功能保持不變

### 技術細節

#### CSS 樣式
```css
/* 防止 Font Awesome 图标在 CSS 加载前显示为大文本 */
.fa, .fas, .far, .fab, .fal, .fad, .fa-solid, .fa-regular, .fa-brands, .fa-light, .fa-duotone,
[class*="fa-"] {
    visibility: hidden;
    font-size: 0;
}

/* 当 Font Awesome 加载完成后，图标会正常显示 */
html.fontawesome-loaded .fa,
html.fontawesome-loaded .fas,
/* ... 其他類別 ... */
html.fontawesome-loaded [class*="fa-"] {
    visibility: visible;
    font-size: inherit;
}
```

#### JavaScript 邏輯
```javascript
// 对于 Font Awesome CSS，等待加载完成
if (href.includes('font-awesome')) {
    linkPromises.push(new Promise((resolve, reject) => {
        newLink.onload = () => {
            // 标记 Font Awesome 已加载
            document.documentElement.classList.add('fontawesome-loaded');
            resolve();
        };
        // 设置超时，避免无限等待
        setTimeout(() => {
            document.documentElement.classList.add('fontawesome-loaded');
            resolve();
        }, 5000);
    }));
}

// 等待 Font Awesome CSS 加载完成（如果存在）
if (linkPromises.length > 0) {
    await Promise.all(linkPromises);
    console.log('Font Awesome CSS 已加载');
}
```

### 影響範圍

- **前端頁面**: 所有使用 Font Awesome 圖標的 admin 頁面
- **功能**: 修復了圖標閃爍問題，提升用戶體驗
- **性能**: 無影響，只是改進了載入順序

### 注意事項

1. **載入順序**: Font Awesome CSS 會在 body 內容替換前載入完成
2. **超時處理**: 如果 CSS 載入超時，會在 5 秒後自動顯示圖標
3. **向後兼容**: 所有功能保持不變，只是改進了視覺效果

---

## [2025-11-25 22:35:47] - 修復 FAQ 頁面重複聲明 renderPagination 錯誤

### 修改內容

#### 修復 FAQ 頁面一直 loading 的問題
- **時間**: 2025-11-25 22:35:47
- **問題**: FAQ 頁面出現 "Identifier 'renderPagination' has already been declared" 錯誤，導致頁面一直 loading
- **原因**: FAQ 頁面重複聲明了 `renderPagination` 函數，與 `admin-pagination.js` 中的函數衝突
- **修改檔案**:
  - `app/static/admin/faq/index.html`
- **變更詳情**:
  - 移除了 FAQ 頁面中重複定義的 `renderPaginationLocal` 函數
  - 移除了 `const renderPagination = renderPaginationLocal;` 這行重複聲明
  - 將 `loadData` 函數暴露到全局作用域（`window.loadData`），以便 `admin-pagination.js` 中的 `renderPagination` 可以調用
  - 添加註釋說明使用 `admin-pagination.js` 中的 `renderPagination` 函數
- **功能特點**:
  - **消除衝突**: 不再重複聲明 `renderPagination`，避免語法錯誤
  - **代碼重用**: 直接使用 `admin-pagination.js` 中的通用分頁函數
  - **全局訪問**: `loadData` 函數暴露到全局，確保分頁按鈕可以正常工作

### 技術細節

#### 問題原因
```javascript
// admin-pagination.js 中已定義
function renderPagination(data) { ... }

// FAQ 頁面中重複定義（錯誤）
function renderPaginationLocal(data) { ... }
const renderPagination = renderPaginationLocal; // 重複聲明錯誤
```

#### 修復方案
```javascript
// 移除重複定義，直接使用 admin-pagination.js 中的函數
// 將 loadData 暴露到全局作用域
window.loadData = async function(page = 1) {
    // ... loadData 實現 ...
};
```

### 影響範圍

- **前端頁面**: `app/static/admin/faq/index.html`
- **功能**: 修復了 FAQ 頁面一直 loading 的問題
- **性能**: 無影響

### 注意事項

1. **函數作用域**: `loadData` 必須在全局作用域中，以便 `admin-pagination.js` 可以調用
2. **向後兼容**: 所有功能保持不變，只是修復了錯誤
3. **代碼重用**: 現在使用統一的 `admin-pagination.js` 分頁函數

---

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

