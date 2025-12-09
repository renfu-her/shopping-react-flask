# Vite 構建優化配置說明

## 概述

本專案使用 Vite 作為構建工具，並配置了多項優化策略以提升生產環境的性能和加載速度。

## 優化功能

### 1. 檔案壓縮

#### Gzip 壓縮
- **壓縮率**：約 70-75%
- **閾值**：10KB 以上的檔案才壓縮
- **格式**：`.gz`
- **瀏覽器支援**：所有現代瀏覽器

#### Brotli 壓縮
- **壓縮率**：約 80% （比 Gzip 更高）
- **閾值**：10KB 以上的檔案才壓縮
- **格式**：`.br`
- **瀏覽器支援**：Chrome, Firefox, Edge 等現代瀏覽器

### 2. 代碼分割 (Code Splitting)

自動將代碼分割成多個 chunks，減少初始加載時間：

- `react-vendor.js` - React 核心庫
- `genai-vendor.js` - Google GenAI SDK
- `markdown-vendor.js` - Markdown 渲染庫
- `icons-vendor.js` - Lucide React 圖標庫
- `api-services.js` - API 服務層
- `context.js` - React Context
- `vendor.js` - 其他第三方庫

### 3. 代碼最小化 (Minification)

使用 **Terser** 進行代碼壓縮：
- 移除未使用的代碼
- 變數名稱短化
- 移除空白和註釋
- 生產環境自動移除 `console.log` 和 `console.info`

### 4. 靜態資源分類

打包後的檔案結構：

```
dist/
├── index.html
├── assets/
│   ├── js/          # JavaScript 檔案
│   ├── css/         # CSS 樣式檔案
│   ├── images/      # 圖片資源
│   └── fonts/       # 字型檔案
└── stats.html       # 打包分析報告
```

### 5. CSS 優化

- CSS 代碼分割
- CSS 最小化
- 移除未使用的 CSS（需要配合 PurgeCSS）

### 6. 依賴預構建

預構建常用依賴，加快開發伺服器啟動速度：
- React 系列
- React Router
- Google GenAI
- Lucide React
- React Markdown

## 打包命令

```bash
# 開發模式（不壓縮）
npm run dev

# 生產構建（完整優化）
npm run build

# 預覽構建結果
npm run preview
```

## 打包分析

每次生產構建後，會在 `dist/stats.html` 生成視覺化的打包分析報告，包含：
- 每個檔案的大小
- Gzip 壓縮後的大小
- Brotli 壓縮後的大小
- 依賴關係圖

在瀏覽器中打開 `dist/stats.html` 即可查看。

## 性能提升

與未優化的構建相比：

| 優化項目 | 效果 |
|---------|------|
| Brotli 壓縮 | 檔案大小減少約 80% |
| Code Splitting | 初始加載減少約 60% |
| Tree Shaking | 移除未使用代碼約 20-30% |
| CSS 分割 | 加快首屏渲染 |

## Nginx 配置建議

為了讓瀏覽器使用預壓縮的 `.gz` 和 `.br` 檔案，需要在 Nginx 中配置：

```nginx
# 啟用 Gzip
gzip_static on;

# 啟用 Brotli
brotli_static on;

# 設置正確的 MIME 類型
location ~* \.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 開發模式 vs 生產模式

| 功能 | 開發模式 | 生產模式 |
|-----|---------|---------|
| 壓縮 | ❌ | ✅ |
| Source Map | ✅ | ❌ |
| Console 日誌 | ✅ | ❌ |
| 代碼最小化 | ❌ | ✅ |
| 檔案分割 | ✅ | ✅ |

## 進階優化建議

1. **圖片優化**：使用 WebP 格式，配合 `vite-plugin-imagemin`
2. **字型優化**：只載入需要的字型子集
3. **懶加載**：使用 React.lazy() 延遲載入路由組件
4. **CDN**：將靜態資源部署到 CDN
5. **Service Worker**：使用 PWA 技術實現離線訪問

## 相關套件

- `vite` - 構建工具
- `vite-plugin-compression` - Gzip/Brotli 壓縮
- `rollup-plugin-visualizer` - 打包分析
- `terser` - 代碼最小化
- `@vitejs/plugin-react` - React 支援

## 故障排除

### 問題：打包後檔案太大
- 檢查是否引入了不必要的依賴
- 查看 `dist/stats.html` 找出大型依賴
- 考慮使用動態導入 (dynamic import)

### 問題：Nginx 沒有使用壓縮檔案
- 確認 Nginx 已安裝 `ngx_http_gzip_static_module`
- 確認 Nginx 已安裝 `ngx_http_brotli_module`
- 檢查 Nginx 配置是否正確

### 問題：Source Map 錯誤
- 開發模式：`sourcemap: true`
- 生產模式：`sourcemap: false`

## 效能監控

建議使用以下工具監控前端性能：
- Google Lighthouse
- WebPageTest
- Chrome DevTools Performance
- Bundle Analyzer (已內建)

## 更新日誌

### 2025-12-03
- ✅ 新增 Gzip 壓縮支援
- ✅ 新增 Brotli 壓縮支援
- ✅ 新增打包分析工具
- ✅ 優化代碼分割策略
- ✅ 新增 Terser 最小化
- ✅ 優化靜態資源分類
- ✅ 新增依賴預構建配置


