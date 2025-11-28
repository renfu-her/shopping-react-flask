# Frontend 更改記錄 (CHANGED)

## [2025-11-28 09:29:38] - 修復生產環境 API 連接問題：動態 API URL 和統一圖片處理

### 修改內容

#### 修復生產環境 API 連接問題
- **時間**: 2025-11-28 09:29:38
- **目的**: 修復前端在生產環境中嘗試連接 `localhost:8096` 的問題，改為動態使用當前域名
- **修改檔案**:
  - `services/api.ts` - 修復 API_BASE_URL 拼寫錯誤，改為動態獲取
  - `utils/imageUrl.ts` - 新增統一的圖片 URL 處理工具函數
  - `components/Home.tsx` - 使用統一的圖片處理函數
  - `components/Cart.tsx` - 使用統一的圖片處理函數
  - `components/ProductDetail.tsx` - 使用統一的圖片處理函數
  - `components/ProductList.tsx` - 使用統一的圖片處理函數
  - `components/NewsDetail.tsx` - 使用統一的圖片處理函數
  - `pages/NewsPage.tsx` - 使用統一的圖片處理函數

### 變更詳情

#### API Base URL 動態配置
- **修復拼寫錯誤**: `ai-tacks.com` → `ai-tracks.com`
- **動態獲取**: API_BASE_URL 現在會自動使用當前域名
  - 在瀏覽器中：使用 `window.location.protocol` 和 `window.location.host`
  - 自動構建為：`https://shopping-react.ai-tracks.com/api`（生產環境）
  - 開發環境：自動使用 `http://localhost:3000/api` 或當前域名

#### 統一圖片 URL 處理
- **新增工具函數**: `utils/imageUrl.ts`
  - 自動處理相對路徑和絕對路徑
  - 在瀏覽器環境中使用當前域名
  - 移除所有硬編碼的 `localhost:8000`

#### 組件更新
- **移除硬編碼**: 所有組件中的 `http://localhost:8000` 硬編碼
- **統一使用**: 所有組件現在使用 `getImageUrl()` 工具函數
- **自動適配**: 圖片 URL 會根據當前環境自動調整

### 技術細節

#### API Base URL 實現
```typescript
const getApiBaseUrl = (): string => {
  // 支持環境變數 VITE_API_BASE_URL
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // 在瀏覽器中，使用當前域名
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}/api`;
  }
  
  // 默認值
  return 'https://shopping-react.ai-tracks.com/api';
};
```

#### 圖片 URL 處理
```typescript
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // 如果已經是完整 URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 在瀏覽器環境中，使用當前協議和域名
  if (typeof window !== 'undefined') {
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    return `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
  }
  
  // 默認值
  return `https://shopping-react.ai-tracks.com${url.startsWith('/') ? url : '/' + url}`;
}
```

### 影響範圍

#### 生產環境修復
- **API 連接**: 前端現在會正確連接到 `https://shopping-react.ai-tracks.com/api`
- **圖片載入**: 所有圖片 URL 會使用正確的域名
- **自動適配**: 無需手動配置，自動使用當前域名

#### 開發環境
- **本地開發**: 仍然可以正常使用，會自動使用 `http://localhost:3000/api`
- **靈活性**: 可以通過環境變數 `VITE_API_BASE_URL` 自定義 API 地址

### 使用方式

#### 環境變數（可選）
如果需要自定義 API 地址，可以在 `.env` 文件中設置：
```bash
VITE_API_BASE_URL=https://shopping-react.ai-tracks.com/api
```

#### 自動行為
- **生產環境**: 自動使用 `https://shopping-react.ai-tracks.com/api`
- **開發環境**: 自動使用當前域名（通常是 `http://localhost:3000/api`）
- **圖片**: 自動使用當前域名處理相對路徑

### 注意事項
1. **重新構建**: 需要重新執行 `npm run build` 以應用變更
2. **環境變數**: 如果使用環境變數，需要在構建前設置
3. **瀏覽器快取**: 可能需要清除瀏覽器快取以看到更新

---

## [2025-11-28 08:47:45] - 進一步優化打包大小：改進分塊策略和 AiAssistant Lazy Loading

### 修改內容

#### 進一步優化打包大小
- **時間**: 2025-11-28 08:47:45
- **目的**: 進一步優化打包大小，將 AiAssistant 改為 lazy loading，並改進手動分塊策略
- **修改檔案**:
  - `App.tsx` - 將 AiAssistant 改為 lazy loading
  - `vite.config.ts` - 改進手動分塊策略，使用函數形式更精確控制分塊

### 變更詳情

#### 新增 Lazy Loading
- **AiAssistant 組件**:
  - 將 `AiAssistant` 改為使用 `React.lazy()` 動態載入
  - 減少主打包檔案大小（因為 `@google/genai` 是一個大型依賴）
  - 使用獨立的 `Suspense` 邊界包裹，fallback 為 `null`（不顯示載入動畫）

#### 改進手動分塊策略
- **函數形式的 manualChunks**:
  - 改用函數形式來更精確地控制分塊策略
  - 根據模組路徑動態決定分塊歸屬
  - 更靈活的分塊邏輯

- **分塊策略**:
  - `react-vendor`: React、React DOM、React Router DOM
  - `genai-vendor`: `@google/genai` SDK（大型依賴）
  - `markdown-vendor`: react-markdown
  - `icons-vendor`: lucide-react
  - `vendor`: 其他 node_modules 依賴
  - `api-services`: services/api.ts（大型服務檔案）
  - `context`: context 目錄下的檔案

---

## [2025-11-28 08:44:33] - 優化打包大小：實作程式碼分割和手動分塊

### 修改內容

#### 優化打包大小：實作程式碼分割和手動分塊
- **時間**: 2025-11-28 08:44:33
- **目的**: 優化 Vite 打包大小，將主打包檔案從 673.06 kB 減少，並解決打包警告
- **修改檔案**:
  - `App.tsx` - 將所有頁面元件改為 lazy loading
  - `vite.config.ts` - 配置手動分塊策略

### 變更詳情

#### 程式碼分割 (Code Splitting)
- **Lazy Loading 頁面元件**:
  - 所有頁面元件改為使用 `React.lazy()` 動態載入
  - 包括：HomePage, ShopPage, ProductDetailPage, NewsPage, NewsDetailPage, AboutPage, CartPage, CheckoutPage, SignPage, OrderSuccessPage, ProfilePage
  - 每個頁面只在需要時才載入，減少初始打包大小

- **Suspense 邊界**:
  - 添加 `Suspense` 組件包裹所有路由
  - 提供統一的載入狀態 UI（PageLoader 組件）
  - 顯示載入動畫和「載入中...」文字

#### 手動分塊配置 (Manual Chunks)
- **Vendor 分塊策略**:
  - `react-vendor`: React, React DOM, React Router DOM
  - `genai-vendor`: Google GenAI SDK
  - `markdown-vendor`: react-markdown
  - `icons-vendor`: lucide-react

- **打包大小警告限制**:
  - 將 `chunkSizeWarningLimit` 從預設 500 kB 調整為 600 kB
  - 允許稍大的分塊，同時保持優化

### 技術細節

#### Lazy Loading 實作
```typescript
// 之前：靜態導入
import { HomePage } from './pages/HomePage';

// 現在：動態導入
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
```

#### Suspense 使用
```typescript
<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/" element={<HomePage />} />
    // ... 其他路由
  </Routes>
</Suspense>
```

#### 手動分塊配置（改進後）
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        // Vendor libraries
        if (id.includes('node_modules')) {
          // React core
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'react-vendor';
          }
          // Google GenAI SDK
          if (id.includes('@google/genai')) {
            return 'genai-vendor';
          }
          // Markdown rendering
          if (id.includes('react-markdown')) {
            return 'markdown-vendor';
          }
          // UI icons
          if (id.includes('lucide-react')) {
            return 'icons-vendor';
          }
          // Other node_modules
          return 'vendor';
        }
        // Split large service files
        if (id.includes('services/api')) {
          return 'api-services';
        }
        // Split context files
        if (id.includes('context/')) {
          return 'context';
        }
      },
    },
  },
  chunkSizeWarningLimit: 600,
}
```

### 影響範圍

#### 打包優化
- **初始載入**: 主打包檔案大小減少，只包含必要的核心程式碼
- **按需載入**: 頁面元件只在用戶訪問時才載入
- **快取策略**: Vendor 分塊可以更好地利用瀏覽器快取
- **載入效能**: 減少初始載入時間，提升首頁載入速度

#### 用戶體驗
- **載入狀態**: 頁面切換時顯示載入動畫，提供更好的用戶反饋
- **效能提升**: 初始打包大小減少，頁面載入更快
- **快取效率**: Vendor 分塊可以長期快取，減少重複下載

### 預期效果

#### 打包大小優化
- **主打包檔案**: 從 673.06 kB 減少（具體數值需重新打包後確認）
- **分塊策略**: Vendor 分塊可以更好地利用瀏覽器快取
- **按需載入**: 每個頁面元件獨立打包，只在需要時載入

#### 效能提升
- **初始載入時間**: 減少初始打包大小，提升首頁載入速度
- **頁面切換**: 使用 lazy loading，頁面切換時才載入對應元件
- **快取效率**: Vendor 分塊可以長期快取，減少重複下載

### 注意事項
1. **載入狀態**: 頁面切換時會顯示載入動畫，這是正常行為
2. **首次載入**: 首次訪問頁面時需要載入對應的程式碼分塊
3. **快取策略**: Vendor 分塊可以長期快取，但頁面元件分塊會在更新時重新下載
4. **打包大小**: 重新打包後需要檢查實際的打包大小變化

### 後續優化建議
1. **進一步分割**: 可以考慮將大型元件（如 ProductList, Checkout）也改為 lazy loading
2. **預載入**: 可以使用 `<link rel="prefetch">` 預載入可能訪問的頁面
3. **Tree Shaking**: 確保只打包實際使用的程式碼
4. **壓縮優化**: 檢查是否有未使用的依賴可以移除

---

## [2025-11-27 16:56:46] - 按照綠界官方文檔優化 ECPay 參數顯示

### 修改內容

#### 按照綠界官方文檔優化參數顯示
- **時間**: 2025-11-27 16:56:46
- **目的**: 根據綠界官方文檔 https://developers.ecpay.com.tw/?p=2864 的要求，優化參數顯示，清晰標示必填參數和選填參數
- **參考文檔**: https://developers.ecpay.com.tw/?p=2864 (全方位金流付款)
- **修改檔案**:
  - `components/Checkout.tsx` - 優化 ECPay 數據顯示區域

### 變更詳情

#### 參數顯示優化
- **按照官方文檔順序顯示必填參數**:
  1. MerchantID (特店編號) *
  2. MerchantTradeNo (特店訂單編號) *
  3. MerchantTradeDate (特店交易時間，格式：yyyy/MM/dd HH:mm:ss) *
  4. PaymentType (交易類型，固定為 aio) *
  5. TotalAmount (交易金額，整數) *
  6. TradeDesc (交易描述) *
  7. ItemName (商品名稱，多筆用 # 分隔) *
  8. ReturnURL (付款完成通知回傳網址) *
  9. ChoosePayment (選擇預設付款方式) *
  10. EncryptType (CheckMacValue加密類型，固定為 1) *
  11. CheckMacValue (檢查碼) *

- **選填參數顯示**:
  - OrderResultURL (付款完成跳轉網址)
  - CustomerName (客戶姓名)
  - CustomerEmail (客戶 Email)

- **顯示改進**:
  - 每個參數都有中文說明
  - 必填參數標示紅色星號 (*)
  - CheckMacValue 使用黃色背景高亮顯示
  - 新增官方文檔連結
  - 參數分組顯示（必填、選填、完整 JSON）

### 技術細節

#### 必填參數驗證
根據綠界官方文檔，所有必填參數都已正確設置：
- ✅ MerchantID: 測試環境特店編號
- ✅ MerchantTradeNo: 唯一訂單編號
- ✅ MerchantTradeDate: 格式 yyyy/MM/dd HH:mm:ss
- ✅ PaymentType: 固定為 "aio"
- ✅ TotalAmount: 整數格式
- ✅ TradeDesc: 交易描述
- ✅ ItemName: 多商品用 # 分隔
- ✅ ReturnURL: 付款結果通知 URL
- ✅ ChoosePayment: 付款方式選擇
- ✅ EncryptType: 固定為 "1" (SHA256)
- ✅ CheckMacValue: 檢查碼

### 影響範圍
- **前端**: 
  - `/checkout` 頁面現在按照官方文檔要求顯示參數
  - 參數顯示更清晰，方便驗證
  - 必填參數和選填參數分組顯示

### 注意事項
1. **暫時不提交到綠界**：驗證 CheckMacValue 正確後，需要取消註解相關代碼以恢復正常功能
2. **參數格式**：所有參數格式都符合綠界官方文檔要求
3. **官方文檔**：顯示區域包含官方文檔連結，方便查閱

---

## [2025-11-27 16:54:28] - 在頁面上直接顯示 ECPay 參數和 CheckMacValue

### 修改內容

#### 在頁面上直接顯示 ECPay 參數和 CheckMacValue
- **時間**: 2025-11-27 16:54:28
- **目的**: 修改 Checkout 頁面，在點擊 Pay 後直接在頁面上顯示所有 ECPay 參數和 CheckMacValue，方便驗證
- **修改檔案**:
  - `components/Checkout.tsx` - 新增 `ecpayData` 狀態，在頁面上顯示參數

### 變更詳情

#### Checkout 組件修改
- **新增狀態管理**:
  - 新增 `ecpayData` 狀態來存儲 ECPay 訂單數據
  - 包含 Order ID、Merchant Trade No、Form URL、CheckMacValue 等

- **頁面顯示**:
  - 在表單上方顯示一個藍色背景的區域
  - 顯示所有關鍵信息：
    - Order ID
    - Merchant Trade No
    - Form URL
    - **CheckMacValue**（高亮顯示）
    - 所有參數（用於計算 CheckMacValue）
    - 完整表單數據（包含 CheckMacValue）

- **用戶體驗**:
  - CheckMacValue 使用黃色背景高亮顯示，方便查看
  - 參數以 JSON 格式顯示，可複製
  - 顯示提示資訊，說明訂單已建立但未提交到綠界

### 技術細節

#### 顯示的數據
```typescript
{
  order_id: number,
  merchant_trade_no: string,
  form_url: string,
  check_mac_value: string,  // 高亮顯示
  params_for_check: object,  // 用於計算 CheckMacValue 的參數
  all_params: object         // 完整表單數據
}
```

#### 使用方式
1. 在 `/checkout` 頁面填寫資訊並點擊 "Pay" 按鈕
2. 訂單會在後端建立（購物車會被清空）
3. 頁面上會直接顯示所有參數和 CheckMacValue
4. 可以複製 CheckMacValue 進行驗證
5. 驗證無誤後，取消註解相關代碼以啟用綠界提交

### 影響範圍
- **前端**: 
  - `/checkout` 頁面現在會在點擊 Pay 後顯示 ECPay 數據
  - 不需要打開瀏覽器控制台即可查看所有參數
  - CheckMacValue 高亮顯示，方便驗證

### 注意事項
1. **這是臨時修改**：驗證 CheckMacValue 正確後，需要取消註解相關代碼以恢復正常功能
2. **訂單仍會建立**：雖然不提交到綠界，但訂單仍會在後端建立
3. **購物車會被清空**：訂單建立時購物車會被清空，這是正常行為
4. **資料顯示**：所有資料都會在頁面上顯示，包括 CheckMacValue

---

## [2025-11-27 16:51:39] - 暫時停用綠界提交，用於驗證 CheckMacValue

### 修改內容

#### 暫時停用綠界表單提交，改為顯示參數用於驗證
- **時間**: 2025-11-27 16:51:39
- **目的**: 暫時不提交表單到綠界，而是將所有參數和 CheckMacValue 顯示在控制台，方便驗證 CheckMacValue 計算是否正確
- **修改檔案**:
  - `components/Checkout.tsx` - 修改 `handleSubmit` 函數，暫時註解掉表單提交邏輯

### 變更詳情

#### Checkout 組件修改
- **暫時停用綠界提交**:
  - 註解掉創建隱藏表單並提交到綠界的代碼
  - 改為將所有參數和 CheckMacValue 打印到瀏覽器控制台
  - 顯示 alert 提示用戶查看控制台

- **調試信息輸出**:
  - 訂單 ID 和 Merchant Trade No
  - Form URL
  - 所有表單參數（包括 CheckMacValue）
  - 用於計算 CheckMacValue 的所有參數（JSON 格式）

#### 使用方式
1. 在 `/checkout` 頁面填寫資訊並點擊 "Pay" 按鈕
2. 訂單會在後端建立（購物車會被清空）
3. 瀏覽器控制台（F12）會顯示所有參數和 CheckMacValue
4. 可以手動驗證 CheckMacValue 是否正確
5. 驗證無誤後，取消註解相關代碼以啟用綠界提交

### 技術細節

#### 修改後的流程
```typescript
// 1. 調用 API 建立訂單
const ecpayOrder = await createECPayOrder({...});

// 2. 打印所有參數到控制台
console.log('=== ECPay Order Data ===');
console.log('CheckMacValue:', ecpayOrder.form_data.CheckMacValue);
// ... 其他參數

// 3. 顯示 alert 提示
alert('CheckMacValue 驗證模式...');

// 4. 暫時不提交到綠界（代碼已註解）
// const form = document.createElement('form');
// ...
```

### 影響範圍
- **前端**: 
  - `/checkout` 頁面暫時不會跳轉到綠界支付頁面
  - 訂單仍會在後端建立
  - 購物車仍會被清空
  - 用戶需要查看瀏覽器控制台來驗證 CheckMacValue

### 注意事項
1. **這是臨時修改**：驗證 CheckMacValue 正確後，需要取消註解相關代碼以恢復正常功能
2. **訂單仍會建立**：雖然不提交到綠界，但訂單仍會在後端建立
3. **購物車會被清空**：訂單建立時購物車會被清空，這是正常行為
4. **查看控制台**：按 F12 打開瀏覽器開發者工具，查看 Console 標籤頁

### 後續步驟
1. 驗證 CheckMacValue 計算是否正確
2. 如果正確，取消註解 `Checkout.tsx` 中的表單提交代碼
3. 恢復正常的綠界支付流程

---

## [2025-11-27 16:41:23] - 移除 categories 和 products 的 loading 提示

### 修改內容

#### 移除 loading 狀態的文字說明
- **時間**: 2025-11-27 16:41:23
- **目的**: 移除 categories 和 products 的 loading 文字提示，直接顯示空的結構或內容
- **修改檔案**:
  - `components/CategoryNav.tsx` - 移除 "Loading categories..." 提示
  - `pages/ShopPage.tsx` - 移除 "Loading products..." 提示

### 變更詳情

#### CategoryNav 組件
- **修改前**: loading 時顯示 "Loading categories..." 文字
- **修改後**: loading 時直接顯示空的導航欄結構（不顯示任何文字）

#### ShopPage 頁面
- **修改前**: loading 時顯示 "Loading products..." 文字
- **修改後**: loading 時直接顯示空的商品列表（使用空的 products 陣列）

### 技術細節

#### CategoryNav.tsx
```typescript
// 修改前
if (loading) {
  return (
    <div>
      <span>Loading categories...</span>
    </div>
  );
}

// 修改後
if (loading) {
  return (
    <div>
      {/* Empty navigation bar */}
    </div>
  );
}
```

#### ShopPage.tsx
```typescript
// 修改前
if (loading) {
  return (
    <>
      <CategoryNav />
      <div>
        <p>Loading products...</p>
      </div>
    </>
  );
}

// 修改後
if (loading) {
  return (
    <>
      <CategoryNav />
      <ProductList products={[]} ... />
    </>
  );
}
```

### 影響範圍
- **用戶體驗**: 
  - 不再顯示 loading 文字，頁面直接顯示空的結構
  - 當資料載入完成後，內容會自動出現
- **前端**: 
  - CategoryNav 和 ShopPage 的 loading 狀態處理更簡潔

### 注意事項
1. 錯誤狀態的處理保持不變（仍會顯示錯誤訊息）
2. 其他頁面的 loading 狀態不受影響（如 ProductDetailPage, NewsPage 等）

---

## [2025-11-27 16:19:45] - 修復首頁分類選單點擊跳轉問題

### 修改內容

#### 修復首頁分類選單點擊跳轉問題
- **時間**: 2025-11-27 16:19:45
- **目的**: 修復首頁分類選單點擊後沒有跳轉到應有畫面的問題
- **修改檔案**:
  - `components/CategoryNav.tsx` - 添加主分類點擊回調，修復"Shop All"按鈕
  - `pages/HomePage.tsx` - 添加分類點擊後跳轉到 /shop 頁面
  - `pages/ShopPage.tsx` - 統一分類點擊處理邏輯

### 變更詳情

#### CategoryNav 組件修改
- **添加 onMainCategoryClick 回調**:
  - 新增可選的 `onMainCategoryClick` prop
  - 主分類點擊時，除了打開/關閉 mega menu，也會調用此回調
  - 用於跳轉到 shop 頁面

- **修復 "Shop All" 按鈕**:
  - 將 `onViewAllClick()` 改為 `onCategoryClick(cat.name)`
  - 現在會傳遞分類名稱，而不是清空分類選擇
  - 點擊後會跳轉到 shop 頁面並顯示該分類的商品

#### HomePage 修改
- **分類點擊處理**:
  - `onCategoryClick` 現在會設置分類並跳轉到 `/shop` 頁面
  - `onMainCategoryClick` 也會設置分類並跳轉到 `/shop` 頁面
  - 確保點擊分類後能正確跳轉

#### ShopPage 修改
- **統一分類點擊處理**:
  - 所有 CategoryNav 實例（loading、error、正常狀態）都使用相同的處理邏輯
  - 添加 `onMainCategoryClick` 處理

### 技術細節
- 分類點擊流程：
  1. 用戶點擊分類（主分類或子分類）
  2. 調用 `handleCategorySelect(categoryName)` 設置分類
  3. 導航到 `/shop` 頁面
  4. ShopPage 根據 `category_name` 過濾產品

### 影響範圍
- **前端**: 
  - 首頁分類選單點擊後會正確跳轉到 shop 頁面
  - 顯示對應分類的商品
  - 提供更好的用戶體驗

---

## [2025-11-27 16:16:08] - 完善 Checkout 支付流程和訂單完成頁面

### 修改內容

#### 完善 Checkout 支付流程
- **時間**: 2025-11-27 16:16:08
- **目的**: 完善支付流程，確保支付完成後正確跳轉到訂單完成頁面，並清空購物車
- **修改檔案**:
  - `components/Checkout.tsx` - 簡化訂單創建流程，只調用 createECPayOrder
  - `pages/CheckoutPage.tsx` - 更新購物車清空邏輯
  - `pages/OrderSuccessPage.tsx` - 更新訂單完成頁面，顯示訂單編號並清空購物車

### 變更詳情

#### Checkout 組件修改
- **簡化訂單創建**:
  - 移除重複的 `createOrder()` 調用
  - 只調用 `createECPayOrder()`，它會自動創建訂單並清空購物車
  - 在提交到綠界前清空本地購物車狀態

- **支付流程**:
  - 創建隱藏表單並提交到綠界支付頁面
  - 綠界支付完成後會自動跳轉到 `/shop-finish?order_id={order_id}`

#### CheckoutPage 修改
- **購物車清空**:
  - `handleCheckoutSubmit()` 現在會清空本地購物車狀態
  - 與後端同步，確保購物車在訂單創建後被清空

#### OrderSuccessPage 修改
- **顯示訂單信息**:
  - 從 URL 參數獲取 `order_id` 並顯示
  - 自動清空購物車狀態（確保一致性）
  - 更新為中文界面
  - 添加"查看訂單"按鈕

- **用戶體驗**:
  - 顯示訂單編號
  - 提供"繼續購物"和"查看訂單"兩個選項

### 技術細節
- 後端 `createECPayOrder` 已經設置了 `OrderResultURL`，支付完成後會跳轉到 `/shop-finish?order_id={order_id}`
- 後端在創建訂單時自動清空購物車
- 前端同步清空本地購物車狀態，確保一致性

### 影響範圍
- **前端**: 
  - 支付流程更完整
  - 用戶支付完成後會看到訂單完成頁面
  - 購物車在訂單創建後自動清空

---

## [2025-11-27 15:52:00] - 更新 Checkout 頁面使用與 Profile 相同的地址字段

### 修改內容

#### 更新 Checkout 頁面地址字段
- **時間**: 2025-11-27 15:52:00
- **目的**: 將 Checkout 頁面的 Shipping Information 改為使用與 Profile 頁面相同的地址字段格式，並自動填充用戶的地址信息
- **修改檔案**:
  - `components/Checkout.tsx` - 更新地址字段為台灣地址格式

### 變更詳情

#### 地址字段更新
- **移除舊字段**:
  - `city` (城市)
  - `zip` (郵遞區號)

- **新增字段** (與 Profile 相同):
  - `phone` (電話號碼)
  - `county` (縣市) - 下拉選單
  - `district` (區鄉鎮) - 下拉選單，根據縣市動態更新
  - `zipcode` (郵遞區號) - 自動填充，只讀
  - `address` (詳細地址) - 保留

#### 功能改進
- **自動填充**: 
  - 從用戶 Profile 自動填充所有地址字段
  - 包括 name, phone, address, county, district, zipcode

- **智能聯動**:
  - 選擇縣市時，自動清空區鄉鎮和郵遞區號
  - 選擇區鄉鎮時，自動填充對應的郵遞區號
  - 使用 `twzipcode` 工具函數處理台灣地址數據

- **數據提交**:
  - 將 `county` 和 `district` 組合為 `shipping_city` (例如: "台北市大安區")
  - 使用 `zipcode` 作為 `shipping_zip`

### 技術細節
- 導入 `getCounties()`, `getDistricts()`, `getZipcode()` 工具函數
- 使用與 Profile 頁面相同的地址選擇邏輯
- 郵遞區號字段設為只讀，自動填充

### 影響範圍
- **前端**: 
  - Checkout 頁面現在使用台灣地址格式
  - 用戶可以從 Profile 快速填充地址信息
  - 提供更好的用戶體驗

---

## [2025-11-27 15:47:04] - 整合購物車和訂單 API

### 修改內容

#### 整合購物車和訂單 API
- **時間**: 2025-11-27 15:47:04
- **目的**: 將購物車和訂單功能與後端 API 整合，使用 POST /api/cart、GET /api/cart 和 POST /api/orders
- **修改檔案**:
  - `services/api.ts` - 添加購物車和訂單相關的 API 函數
  - `context/AppContext.tsx` - 修改購物車操作以調用 API
  - `pages/CheckoutPage.tsx` - 從 API 獲取購物車數據
  - `pages/CartPage.tsx` - 從 API 獲取購物車數據
  - `components/Checkout.tsx` - 在提交時調用 POST /api/orders

### 變更詳情

#### API 服務擴展
- **購物車 API**:
  - `getCart()` - GET /api/cart 獲取購物車
  - `addToCart(item)` - POST /api/cart/items 添加商品到購物車
  - `updateCartItem(itemId, update)` - PUT /api/cart/items/{item_id} 更新購物車項目
  - `removeCartItem(itemId)` - DELETE /api/cart/items/{item_id} 移除購物車項目
  - `clearCart()` - DELETE /api/cart 清空購物車

- **訂單 API**:
  - `createOrder(orderData)` - POST /api/orders 創建訂單
  - `getOrders()` - GET /api/orders 獲取訂單列表
  - `getOrder(orderId)` - GET /api/orders/{id} 獲取訂單詳情

#### AppContext 修改
- **addToCart()**: 
  - 改為異步函數
  - 調用 POST /api/cart/items API
  - 更新本地狀態以反映 API 響應

- **updateQuantity()**: 
  - 改為異步函數
  - 調用 PUT /api/cart/items/{item_id} API
  - 重新載入購物車以獲取最新數據

- **removeFromCart()**: 
  - 改為異步函數
  - 調用 DELETE /api/cart/items/{item_id} API
  - 更新本地狀態

- **handleLogin()**: 
  - 登入後自動從 API 載入購物車

- **verifySession()**: 
  - 驗證 session 時自動載入購物車

#### 頁面修改
- **CheckoutPage**: 
  - 從 GET /api/cart 獲取購物車數據
  - 顯示載入狀態
  - 如果購物車為空，重定向到購物車頁面

- **CartPage**: 
  - 從 GET /api/cart 獲取購物車數據
  - 顯示載入狀態
  - 包裝異步函數調用

- **Checkout 組件**: 
  - 在提交時先調用 POST /api/orders 創建訂單
  - 然後調用 createECPayOrder 創建綠界訂單
  - 提交到綠界支付頁面

### 技術細節
- 所有購物車操作現在都通過 API 進行
- 購物車狀態與後端同步
- 訂單創建流程：先創建訂單，再創建綠界訂單
- 異步操作使用 try-catch 處理錯誤

### 影響範圍
- **前端**: 
  - 購物車數據現在存儲在後端，跨設備同步
  - 訂單創建流程更完整
  - 所有購物車操作都需要用戶登入

---

## [2025-11-27 15:28:44] - 重構 API 服務層，使用 Clean Code 原則優化

### 修改內容

#### 重構 API 服務層
- **時間**: 2025-11-27 15:28:44
- **目的**: 消除代碼重複，統一錯誤處理，提高代碼可維護性和性能
- **修改檔案**:
  - `services/api.ts` - 完全重構，使用統一的 API 客戶端函數

### 變更詳情

#### 代碼重構
- **創建統一的 API 客戶端函數 `apiRequest<T>()`**:
  - 統一處理所有 HTTP 請求
  - 自動處理錯誤響應
  - 支持認證請求（`requiresAuth` 選項）
  - 統一設置 headers 和 credentials
  - 處理空響應（204 No Content）

- **消除代碼重複**:
  - 移除所有重複的 try-catch 塊
  - 移除重複的錯誤處理邏輯
  - 移除重複的 `credentials: 'include'` 設置
  - 統一錯誤消息格式

- **類型安全**:
  - 使用 TypeScript 泛型 `<T>` 確保類型安全
  - 所有 API 函數都有明確的返回類型

- **代碼組織**:
  - 將所有類型定義集中在文件頂部
  - 清晰的函數分組（Categories, Ads, Products, News, Auth, etc.）
  - 添加註釋說明

### 技術細節

#### API 客戶端設計
```typescript
interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T>
```

#### 優勢
1. **減少代碼量**: 從 ~414 行減少到 ~280 行（減少約 32%）
2. **統一錯誤處理**: 所有錯誤都通過同一個函數處理
3. **易於維護**: 修改請求邏輯只需修改一個地方
4. **類型安全**: TypeScript 泛型確保編譯時類型檢查
5. **性能優化**: 減少重複代碼，提高執行效率

### 影響範圍
- **前端**: 
  - 所有 API 調用現在都通過統一的客戶端函數
  - 代碼更易於維護和擴展
  - 錯誤處理更一致
  - 沒有破壞性變更，所有現有功能保持不變

---

## [2025-11-27 15:15:59] - 從 JWT Token 認證切換到 Session 認證

### 修改內容

#### 從 JWT Token 認證切換到 Session 認證
- **時間**: 2025-11-27 15:15:59
- **目的**: 放棄 JWT Token 認證，改用 Session 認證來記住登入狀態
- **修改檔案**:
  - `services/api.ts` - 移除所有 JWT token 相關代碼，改用 session
  - `context/AppContext.tsx` - 修改認證驗證邏輯，使用 session 而不是 token

### 變更詳情

#### API 服務修改
- **login()**: 
  - 移除 `access_token` 和 `token_type` 從 `LoginResponse` 接口
  - 添加 `credentials: 'include'` 來發送 cookie (session)
  - 移除 localStorage token 存儲邏輯

- **logout()**: 
  - 改為異步函數，調用後端 `/api/auth/logout` API
  - 添加 `credentials: 'include'` 來發送 cookie

- **getCurrentUser()**: 
  - 移除所有 token 相關代碼
  - 移除 `Authorization` header
  - 添加 `credentials: 'include'` 來發送 cookie

- **updateUserProfile()**: 
  - 移除 token 檢查和 `Authorization` header
  - 添加 `credentials: 'include'` 來發送 cookie

- **updateUserPassword()**: 
  - 移除 token 檢查和 `Authorization` header
  - 添加 `credentials: 'include'` 來發送 cookie

- **createECPayOrder()**: 
  - 移除 token 檢查和 `Authorization` header
  - 添加 `credentials: 'include'` 來發送 cookie

- **移除 getToken() 函數**: 
  - 不再需要從 localStorage 獲取 token

#### AppContext 修改
- **verifySession()**: 
  - 重命名從 `verifyToken()` 到 `verifySession()`
  - 移除所有 token 相關邏輯
  - 直接調用 `getCurrentUser()` 來驗證 session
  - 簡化錯誤處理

- **handleLogout()**: 
  - 改為異步函數
  - 調用 `apiLogout()` 來清除後端 session

### 技術細節
- 所有需要認證的 API 調用都添加了 `credentials: 'include'`
- Session 通過 cookie 自動管理，無需手動處理
- 不再使用 localStorage 存儲 token

### 影響範圍
- **前端**: 
  - 登入狀態現在通過 session cookie 自動管理
  - 頁面刷新後會自動驗證 session 並恢復用戶狀態
  - 不再需要手動管理 token 的存儲和清除

---

## [2025-11-27 15:06:47] - 增強 JWT Token 驗證調試日誌

### 修改內容

#### 增強 JWT Token 驗證調試日誌
- **時間**: 2025-11-27 15:06:47
- **目的**: 添加更詳細的調試日誌，幫助診斷登入狀態不持久的問題
- **修改檔案**:
  - `context/AppContext.tsx` - 添加詳細的調試日誌

### 變更詳情

#### 調試日誌增強
- **verifyToken 函數**: 添加更詳細的日誌輸出
  - 記錄 token 是否存在
  - 記錄 token 的前 20 個字符（用於調試）
  - 記錄 `getCurrentUser()` 調用過程
  - 記錄成功和失敗的詳細信息
  - 記錄錯誤的詳細堆疊信息
  - 記錄 `isLoadingUser` 狀態變化

### 技術細節
- 使用 `[AppContext]` 前綴標識日誌來源
- 記錄 token 的部分內容（不暴露完整 token）
- 記錄錯誤的完整堆疊信息

### 影響範圍
- **前端**: 
  - 更容易診斷登入狀態不持久的問題
  - 提供更詳細的調試信息

---

## [2025-11-27 15:02:14] - JWT Token 認證與自動恢復登入狀態

### 修改內容

#### JWT Token 認證與自動恢復登入狀態
- **時間**: 2025-11-27 15:02:14
- **目的**: 實現完整的 JWT Token 認證流程，包括頁面刷新後自動驗證 token 並恢復用戶登入狀態
- **修改檔案**:
  - `context/AppContext.tsx` - 添加 `isLoadingUser` 狀態和自動驗證 token 邏輯
  - `services/api.ts` - 添加 `getCurrentUser` 函數
  - `components/Auth.tsx` - 更新以傳遞完整的用戶對象
  - `pages/SignPage.tsx` - 添加加載狀態檢查和自動重定向
  - `pages/CheckoutPage.tsx` - 添加加載狀態檢查
  - `pages/ProfilePage.tsx` - 添加加載狀態檢查

### 變更詳情

#### 新增的功能
- **自動驗證 Token**: 頁面加載時自動檢查 localStorage 中的 token 並驗證
- **恢復用戶狀態**: 如果 token 有效，自動恢復用戶登入狀態
- **加載狀態管理**: 添加 `isLoadingUser` 狀態，防止在驗證完成前顯示錯誤頁面

#### 新增的 API 函數
- **getCurrentUser()**: 調用 `/api/auth/me` 端點獲取當前用戶信息
  - 自動從 localStorage 獲取 token
  - 在請求頭中添加 `Authorization: Bearer {token}`
  - 如果 token 無效（401），自動清除 localStorage 中的 token

#### 更新的組件
- **AppContext.tsx**:
  - 添加 `isLoadingUser` 狀態
  - 在 `useEffect` 中自動驗證 token
  - 導出 `isLoadingUser` 供其他組件使用

- **SignPage.tsx**:
  - 在 token 驗證期間顯示加載狀態
  - 如果已登入，自動重定向到首頁
  - 僅在驗證完成且未登入時顯示登入頁面

- **CheckoutPage.tsx**:
  - 在 token 驗證期間顯示加載狀態
  - 避免在驗證完成前重定向

- **ProfilePage.tsx**:
  - 在 token 驗證期間顯示加載狀態
  - 僅在驗證完成後檢查登入狀態

- **Auth.tsx**:
  - 更新以傳遞完整的用戶對象（包含所有字段）
  - 添加調試日誌

### 技術細節

#### JWT Token 認證流程
1. **登入時**:
   - 調用 `/api/auth/login` 獲取 `access_token`
   - 自動將 token 存儲到 `localStorage`
   - 保存完整的用戶信息到 context

2. **頁面加載時**:
   - 檢查 `localStorage` 中是否有 token
   - 如果有，調用 `/api/auth/me` 驗證 token
   - 如果驗證成功，恢復用戶登入狀態
   - 如果驗證失敗，清除 token 並重置用戶狀態

3. **API 調用時**:
   - 所有需要認證的 API 調用都會自動從 localStorage 獲取 token
   - 在請求頭中添加 `Authorization: Bearer {token}`

4. **登出時**:
   - 清除 localStorage 中的 token
   - 清除用戶狀態

#### 加載狀態管理
- `isLoadingUser`: 表示正在驗證 token
- 在加載期間顯示加載動畫
- 防止在驗證完成前顯示錯誤頁面或重定向

### 影響範圍
- **前端**: 
  - 所有需要認證的頁面
  - 登入流程
  - 頁面刷新後的狀態恢復
- **後端**: 
  - `/api/auth/me` 端點現在支援 JWT Token 認證

### 注意事項
1. **Token 存儲**: Token 存儲在 localStorage 中，頁面刷新後仍然存在
2. **自動驗證**: 每次頁面加載都會自動驗證 token
3. **錯誤處理**: 如果 token 無效或過期，會自動清除並重置用戶狀態
4. **向後兼容**: 後端仍支援 Session 認證，不影響後台管理功能

---

## [2025-11-27 14:16:33] - 用戶資料管理功能與 Profile 頁面

### 修改內容

#### 用戶資料管理功能與 Profile 頁面
- **時間**: 2025-11-27 14:16:33
- **目的**: 添加用戶資料管理功能，包括地址、電話、縣市、區/鄉鎮、郵遞區號等欄位，並創建 Profile 頁面供用戶查看和修改資料
- **修改檔案**:
  - `components/layout/Navbar.tsx` - 將登出按鈕改為下拉菜單（Profile, Logout）
  - `pages/ProfilePage.tsx` - 新增 Profile 頁面組件
  - `services/api.ts` - 添加 `updateUserProfile` 和 `updateUserPassword` API 函數
  - `utils/twzipcode.ts` - 新增台灣郵遞區號資料工具
  - `types.ts` - 更新 User 接口以包含新欄位
  - `App.tsx` - 添加 `/profile` 路由

### 變更詳情

#### 新增的 API 函數
- **updateUserProfile(userData)**: 更新用戶資料（不包含密碼）
  - 調用 `PUT /api/auth/me` 端點
  - 支持更新：name, email, phone, address, county, district, zipcode

- **updateUserPassword(passwordData)**: 更新用戶密碼
  - 調用 `PUT /api/auth/me/password` 端點
  - 需要提供當前密碼和新密碼

#### 新增的類型定義
- **UserUpdateRequest 接口**: 定義用戶資料更新請求
  - `name?`: string
  - `email?`: string
  - `phone?`: string
  - `address?`: string
  - `county?`: string
  - `district?`: string
  - `zipcode?`: string

- **UserPasswordUpdateRequest 接口**: 定義密碼更新請求
  - `current_password`: string
  - `new_password`: string

#### 新增的工具函數（twzipcode.ts）
- **getCounties()**: 獲取所有縣市列表
- **getDistricts(county)**: 根據縣市獲取區/鄉鎮列表
- **getZipcode(county, district)**: 根據縣市和區/鄉鎮獲取郵遞區號
- **TW_ZIPCODE_DATA**: 台灣郵遞區號完整資料（參考 jQuery-TWzipcode）

#### 修改的組件
- **Navbar.tsx**:
  - 將登出按鈕改為下拉菜單
  - 添加 Profile 和 Logout 選項
  - 使用 `useRef` 和 `useEffect` 處理點擊外部關閉菜單
  - 移動端也更新為顯示 Profile 和 Logout 選項

- **ProfilePage.tsx** (新增):
  - 兩個標籤頁：Profile Information 和 Change Password
  - Profile Information 標籤：
    - 顯示和編輯所有用戶資料
    - 台灣郵遞區號選擇器（縣市 → 區/鄉鎮 → 郵遞區號自動填充）
    - 表單驗證和錯誤處理
  - Change Password 標籤：
    - 當前密碼驗證
    - 新密碼和確認密碼匹配驗證
    - 密碼長度驗證（至少 6 個字符）

#### 更新的類型定義
- **User 接口** (types.ts 和 services/api.ts):
  - 添加 `id`: number
  - 添加 `role`: string
  - 添加 `status`: string
  - 添加 `phone?`: string
  - 添加 `address?`: string
  - 添加 `county?`: string
  - 添加 `district?`: string
  - 添加 `zipcode?`: string
  - 添加 `created_at`: string

### 技術細節

#### 台灣郵遞區號選擇器
- 使用三級聯動：縣市 → 區/鄉鎮 → 郵遞區號
- 選擇縣市時，自動清空區/鄉鎮和郵遞區號
- 選擇區/鄉鎮時，自動填充郵遞區號
- 郵遞區號欄位為只讀，由系統自動填充

#### 表單驗證
- Profile 表單：name 和 email 為必填
- Password 表單：
  - 當前密碼為必填
  - 新密碼至少 6 個字符
  - 新密碼和確認密碼必須匹配

#### 錯誤處理
- API 調用失敗時顯示錯誤信息
- 表單驗證錯誤時顯示相應提示
- 成功更新時顯示成功信息

### 影響範圍
- **前端**: 
  - `/profile` 頁面
  - Navbar 下拉菜單
  - 用戶資料管理
- **後端**: 
  - `/api/auth/me` PUT 端點（更新資料）
  - `/api/auth/me/password` PUT 端點（更新密碼）
- **數據庫**: 
  - users 表新增欄位：phone, address, county, district, zipcode

### 注意事項
1. **用戶驗證**: Profile 頁面會檢查用戶是否已登入，未登入時自動重定向到登入頁面
2. **資料同步**: 更新資料後會自動更新 AppContext 中的用戶資料
3. **密碼安全**: 更新密碼需要提供當前密碼進行驗證
4. **郵遞區號**: 使用台灣郵遞區號資料，參考 jQuery-TWzipcode 專案

### 參考資料
- jQuery-TWzipcode: https://github.com/essoduke/jQuery-TWzipcode/blob/master/jquery.twzipcode.js

---

## [2025-11-27 12:24:03] - Checkout 頁面整合綠界金流 (ECPay)

### 修改內容

#### Checkout 頁面整合綠界金流 (ECPay)
- **時間**: 2025-11-27 12:24:03
- **目的**: 將 `/checkout` 頁面的付款功能整合綠界科技 (ECPay) 全方位金流 API
- **修改檔案**:
  - `services/api.ts` - 添加 `createECPayOrder` 函數
  - `components/Checkout.tsx` - 整合綠界金流，自動填充用戶名稱
  - `pages/CheckoutPage.tsx` - 添加用戶驗證和購物車檢查

### 變更詳情

#### 新增的 API 函數
- **createECPayOrder(orderData)**: 調用 `/api/ecpay/create-order` 端點創建綠界訂單
  - 接收 `ECPayOrderRequest`（運送信息和支付方式）
  - 返回 `ECPayOrderResponse`（訂單ID、表單數據、表單URL）
  - 自動生成綠界金流表單並提交到綠界支付頁面

#### 新增的類型定義
- **ECPayOrderRequest 接口**: 定義綠界訂單請求數據
  - `shipping_name`: string
  - `shipping_address`: string
  - `shipping_city`: string
  - `shipping_zip`: string
  - `payment_method?`: string (Credit, WebATM, ATM, CVS, BARCODE)

- **ECPayOrderResponse 接口**: 定義綠界訂單響應數據
  - `order_id`: number
  - `merchant_trade_no`: string
  - `form_data`: Record<string, string>
  - `form_url`: string

#### 修改的組件
- **Checkout.tsx**:
  - 移除 `cardNumber` 字段（不再需要）
  - 添加 `payment_method` 選擇（信用卡、網路ATM、ATM、超商代碼、超商條碼）
  - Full Name 自動從 `user.name` 填充
  - 使用 `useEffect` 監聽用戶信息變化，自動填充名稱
  - 提交時調用 `createECPayOrder` API
  - 自動生成隱藏表單並提交到綠界支付頁面
  - 添加 loading 和 error 狀態處理

- **CheckoutPage.tsx**:
  - 添加用戶驗證（未登入時重定向到登入頁面）
  - 添加購物車檢查（購物車為空時重定向到購物車頁面）
  - 更新 `handleCheckoutSubmit` 邏輯

### 技術細節

#### 綠界金流整合流程
1. 用戶填寫運送信息（Full Name 自動從 user.name 填充）
2. 選擇支付方式（信用卡、ATM、超商等）
3. 提交表單時，前端調用 `/api/ecpay/create-order` API
4. 後端創建訂單並生成綠界金流表單數據
5. 前端自動生成隱藏表單並提交到綠界支付頁面
6. 用戶在綠界頁面完成付款
7. 綠界通過 ReturnURL 通知後端付款結果
8. 付款完成後跳轉到 `/shop-finish` 頁面

#### 支付方式
- **Credit**: 信用卡
- **WebATM**: 網路 ATM
- **ATM**: ATM 自動櫃員機
- **CVS**: 超商代碼
- **BARCODE**: 超商條碼

#### 自動填充功能
- Full Name 字段自動從 `user.name` 填充
- 使用 `useEffect` 監聽用戶信息變化
- 如果用戶已登入，自動填充名稱字段

#### 表單提交
```typescript
// 創建隱藏表單並提交到綠界
const form = document.createElement('form');
form.method = 'POST';
form.action = ecpayOrder.form_url;

// 添加所有表單字段
Object.entries(ecpayOrder.form_data).forEach(([key, value]) => {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = key;
  input.value = value;
  form.appendChild(input);
});

document.body.appendChild(form);
form.submit();
```

### 影響範圍
- **前端**: 
  - `/checkout` 頁面
  - 付款流程
  - 用戶體驗
- **後端**: 
  - `/api/ecpay/create-order` 端點
  - `/api/ecpay/return` 端點（處理付款結果通知）
- **行為**: 
  - 現在使用綠界科技的金流服務處理付款
  - 支持多種支付方式
  - Full Name 自動填充

### 錯誤處理
- API 調用失敗時顯示錯誤信息
- 用戶未登入時重定向到登入頁面
- 購物車為空時重定向到購物車頁面
- 表單驗證確保所有必填字段已填寫

### 注意事項
1. **測試環境**: 目前使用綠界測試環境，正式上線時需要切換到正式環境
2. **配置信息**: 綠界金流的 MerchantID、HashKey、HashIV 需要在後端配置
3. **付款通知**: ReturnURL 需要能夠接收綠界的 POST 請求
4. **Full Name**: 自動從用戶信息填充，用戶可以手動修改

### 參考資料
- 綠界科技全方位金流 API 技術文件: https://developers.ecpay.com.tw/?p=2856
- 綠界科技測試介接資訊: https://developers.ecpay.com.tw/?p=2866

---

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

**最後更新**: 2025-11-27 12:24:03

