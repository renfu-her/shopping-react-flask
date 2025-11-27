# Backend 更改記錄 (CHANGED)

## [2025-11-27 15:02:14] - 支援 JWT Token 認證

### 修改內容

#### 支援 JWT Token 認證
- **時間**: 2025-11-27 15:02:14
- **目的**: 更新 `get_current_user` 和 `get_current_user_optional` 函數以支援 JWT Token 認證，同時保持向後兼容 Session 認證
- **修改檔案**:
  - `dependencies.py` - 更新認證邏輯以支援 JWT Token

### 變更詳情

#### 更新的認證邏輯
- **get_current_user()**: 優先使用 JWT Token 認證，如果無效則回退到 Session 認證
  - 檢查 `Authorization` header 中的 Bearer token
  - 使用 `decode_access_token()` 解碼 token
  - 從 token payload 中獲取用戶 ID (`sub`)
  - 如果 JWT Token 無效或不存在，回退到 Session 認證（向後兼容）

- **get_current_user_optional()**: 同樣支援 JWT Token 和 Session 認證
  - 優先檢查 JWT Token
  - 如果沒有 token 或 token 無效，回退到 Session 認證

#### 技術細節
- 使用 `HTTPBearer(auto_error=False)` 使 Bearer token 為可選
- 同時檢查 `HTTPAuthorizationCredentials` 和 `Authorization` header
- 保持向後兼容，支援原有的 Session 認證方式

### 影響範圍
- **後端**: 
  - 所有使用 `get_current_user` 的 API 端點現在都支援 JWT Token 認證
  - 保持向後兼容，仍支援 Session 認證
- **前端**: 
  - 現在可以正確使用 JWT Token 進行認證
  - 頁面刷新後會自動驗證 token 並恢復用戶狀態

### 注意事項
1. **向後兼容**: 仍支援 Session 認證，不會影響現有的後台管理功能
2. **優先級**: JWT Token 優先於 Session 認證
3. **Token 驗證**: 使用 `decode_access_token()` 驗證 token 的有效性

---

## [2025-11-27 14:16:33] - 用戶資料管理功能擴展

### 修改內容

#### 用戶資料管理功能擴展
- **時間**: 2025-11-27 14:16:33
- **目的**: 擴展用戶資料欄位，添加地址、電話、縣市、區/鄉鎮、郵遞區號等欄位，並提供用戶資料更新和密碼更新 API
- **修改檔案**:
  - `models/user.py` - 添加新欄位到 User 模型
  - `schemas/user.py` - 更新 UserResponse 和添加 UserUpdate、UserPasswordUpdate
  - `api/auth.py` - 添加用戶資料更新和密碼更新端點
  - `database_migration.py` - 添加用戶地址欄位遷移函數
  - `main.py` - 註冊遷移函數

### 變更詳情

#### 新增的資料庫欄位
- **phone**: VARCHAR(20) - 電話號碼
- **address**: VARCHAR(500) - 地址
- **county**: VARCHAR(50) - 縣市
- **district**: VARCHAR(50) - 區/鄉鎮
- **zipcode**: VARCHAR(10) - 郵遞區號

#### 新增的 API 端點
- **PUT `/api/auth/me`**: 更新當前用戶資料（不包含密碼）
  - 需要認證
  - 支持更新：name, email, phone, address, county, district, zipcode
  - 返回更新後的用戶資料

- **PUT `/api/auth/me/password`**: 更新當前用戶密碼
  - 需要認證
  - 需要提供當前密碼和新密碼
  - 驗證當前密碼正確性
  - 返回更新後的用戶資料

#### 新增的 Schema
- **UserUpdate**: 用戶資料更新請求
  - `name?`: Optional[str]
  - `email?`: Optional[EmailStr]
  - `phone?`: Optional[str]
  - `address?`: Optional[str]
  - `county?`: Optional[str]
  - `district?`: Optional[str]
  - `zipcode?`: Optional[str]
  - `role?`: Optional[UserRole]
  - `status?`: Optional[UserStatus]

- **UserPasswordUpdate**: 密碼更新請求
  - `current_password`: str
  - `new_password`: str

#### 更新的 Schema
- **UserResponse**: 添加新欄位
  - `phone?`: Optional[str]
  - `address?`: Optional[str]
  - `county?`: Optional[str]
  - `district?`: Optional[str]
  - `zipcode?`: Optional[str]

#### 資料庫遷移
- **add_user_address_fields()**: 添加用戶地址相關欄位的遷移函數
  - 檢查欄位是否已存在
  - 按順序添加：phone, address, county, district, zipcode
  - 所有欄位都為可選（NULL）

### 技術細節

#### 資料驗證
- Email 唯一性檢查：更新 email 時檢查是否已被其他用戶使用
- 密碼驗證：更新密碼時驗證當前密碼是否正確
- 欄位更新：只更新提供的欄位，未提供的欄位保持不變

#### 安全性
- 所有端點都需要認證（使用 `get_current_user` 依賴）
- 密碼更新需要提供當前密碼
- 密碼使用 bcrypt 加密存儲

### 影響範圍
- **後端**: 
  - User 模型
  - 用戶認證 API
  - 資料庫結構
- **前端**: 
  - Profile 頁面
  - 用戶資料管理
- **數據庫**: 
  - users 表結構變更

### 注意事項
1. **資料遷移**: 新欄位為可選，不會影響現有用戶資料
2. **向後兼容**: 現有 API 端點保持不變，新欄位為可選
3. **資料驗證**: Email 唯一性檢查確保不會有重複的 email
4. **密碼安全**: 密碼更新需要驗證當前密碼，防止未授權修改

---

## [2025-11-27 12:24:35] - 整合綠界科技 (ECPay) 全方位金流 API

### 修改內容

#### 整合綠界科技 (ECPay) 全方位金流 API
- **時間**: 2025-11-27 12:24:35
- **目的**: 整合綠界科技的全方位金流 API 到結帳流程中，支持多種支付方式
- **修改檔案**:
  - `api/ecpay.py` - 新增綠界金流 API 端點
  - `config.py` - 添加 frontend_url 和 backend_url 配置
  - `main.py` - 註冊 ecpay router

### 變更詳情

#### 新增的 API 端點
- **POST `/api/ecpay/create-order`**: 創建訂單並生成綠界金流表單數據
  - 接收運送信息和支付方式
  - 創建訂單和訂單項目
  - 生成綠界金流所需的表單參數
  - 生成 CheckMacValue 檢查碼
  - 返回表單數據和表單 URL

- **POST `/api/ecpay/return`**: 處理綠界金流付款結果通知
  - 接收綠界回傳的付款結果
  - 返回 "1|OK" 給綠界（必須格式）

#### 新增的功能
- **generate_check_value()**: 生成綠界金流檢查碼（CheckMacValue）
  - 使用 SHA256 加密
  - 按照綠界規定的格式生成

#### 綠界金流配置
- **測試環境配置**:
  - MerchantID: 3002607
  - HashKey: pwFHCqoQZGmho4w6
  - HashIV: EkRm7iFT261dpevs
  - API URL: https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5

- **正式環境配置**（待切換）:
  - API URL: https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5
  - 需要從綠界後台獲取正式的 MerchantID、HashKey、HashIV

#### 支持的支付方式
- **Credit**: 信用卡
- **WebATM**: 網路 ATM
- **ATM**: ATM 自動櫃員機
- **CVS**: 超商代碼
- **BARCODE**: 超商條碼

### 技術細節

#### 訂單創建流程
1. 驗證購物車不為空
2. 計算訂單總金額
3. 檢查商品庫存
4. 創建訂單記錄
5. 創建訂單項目
6. 生成綠界訂單編號（MerchantTradeNo）
7. 構建綠界金流參數
8. 生成 CheckMacValue 檢查碼
9. 返回表單數據給前端

#### CheckMacValue 生成算法
```python
def generate_check_value(params: dict, hash_key: str, hash_iv: str) -> str:
    # 1. 按字母順序排序參數
    sorted_params = sorted(params.items())
    
    # 2. 構建查詢字符串
    query_string = "&".join([f"{k}={v}" for k, v in sorted_params])
    
    # 3. 添加 HashKey 和 HashIV
    check_string = f"HashKey={hash_key}&{query_string}&HashIV={hash_iv}"
    
    # 4. URL Encode 並轉小寫
    encoded_string = urllib.parse.quote(check_string, safe="").lower()
    
    # 5. SHA256 加密並轉大寫
    sha256_hash = hashlib.sha256(encoded_string.encode('utf-8')).hexdigest()
    return sha256_hash.upper()
```

#### 綠界金流參數
- **MerchantID**: 特店編號
- **MerchantTradeNo**: 特店交易編號（唯一）
- **MerchantTradeDate**: 特店交易時間
- **PaymentType**: 交易類型（固定為 "aio"）
- **TotalAmount**: 交易金額
- **TradeDesc**: 交易描述
- **ItemName**: 商品名稱
- **ReturnURL**: 付款結果通知 URL（後端接收）
- **OrderResultURL**: 付款完成跳轉 URL（前端頁面）
- **ChoosePayment**: 選擇的支付方式
- **EncryptType**: 加密類型（固定為 "1" 表示 SHA256）
- **CheckMacValue**: 檢查碼

### 影響範圍
- **後端**: 
  - 新增 `/api/ecpay` 路由
  - 訂單創建流程整合綠界金流
- **前端**: 
  - Checkout 頁面整合綠界支付
- **數據庫**: 
  - 訂單記錄包含支付方式信息

### 注意事項
1. **測試環境**: 目前使用綠界測試環境，正式上線時需要切換
2. **配置管理**: 綠界金流配置信息應該從環境變數或配置文件讀取
3. **付款通知**: ReturnURL 需要能夠接收綠界的 POST 請求並返回 "1|OK"
4. **訂單狀態**: 目前 ReturnURL 端點尚未實現訂單狀態更新邏輯（TODO）
5. **安全性**: CheckMacValue 驗證應該在 ReturnURL 端點實現

### 後續改進
1. 實現 ReturnURL 端點的 CheckMacValue 驗證
2. 根據 RtnCode 更新訂單狀態
3. 將綠界配置移到環境變數
4. 添加訂單狀態更新邏輯

### 參考資料
- 綠界科技全方位金流 API 技術文件: https://developers.ecpay.com.tw/?p=2856
- 綠界科技測試介接資訊: https://developers.ecpay.com.tw/?p=2866

---

## [2025-11-26 22:47:45] - 修復 News add-edit 頁面隱藏 textarea 的 required 驗證錯誤

### 修改內容

#### 修復 News add-edit 頁面隱藏 textarea 的 required 驗證錯誤
- **時間**: 2025-11-26 22:47:45
- **問題**: 當 SimpleMDE 編輯器初始化後，原始的 textarea 被隱藏但仍保留 `required` 屬性，導致瀏覽器無法驗證隱藏的 required 字段，出現 "An invalid form control with name='' is not focusable" 錯誤
- **修改檔案**:
  - `app/static/admin/news/add-edit.html` - 修復 SimpleMDE 初始化後的 required 驗證問題

### 變更詳情

#### 問題原因
- SimpleMDE 編輯器初始化後，會隱藏原始的 textarea 元素（設置 `display: none`）
- 但原始的 textarea 仍然保留 `required` 屬性
- 當表單提交時，瀏覽器會嘗試驗證這個隱藏的 required 字段
- 由於字段是隱藏的，無法聚焦，導致驗證失敗並拋出錯誤

#### 修復方案
1. **移除 required 屬性**: 在 SimpleMDE 初始化後，移除原始 textarea 的 `required` 屬性
2. **手動驗證**: 在表單提交時，手動驗證內容是否為空（因為無法使用 HTML5 驗證）

#### 修改的函數
- **initNewsFormPage**: 在 SimpleMDE 初始化後，移除 textarea 的 `required` 屬性
- **handleSubmit**: 添加手動內容驗證，確保內容不為空

### 技術細節

#### 修復前
```html
<textarea id="content" rows="8" required ...></textarea>
```
SimpleMDE 初始化後，textarea 被隱藏但保留 `required`，導致驗證錯誤。

#### 修復後
```javascript
// SimpleMDE 初始化後，移除原始 textarea 的 required 屬性
if (contentEditor) {
    const contentTextarea = document.getElementById('content');
    if (contentTextarea) {
        contentTextarea.removeAttribute('required');
    }
}

// 在表單提交時手動驗證
const content = contentEditor ? getSimpleMDEValue(contentEditor) : document.getElementById('content').value;
if (!content || content.trim() === '') {
    alert('請輸入新聞內容');
    return;
}
```

### 影響範圍
- **前端**: News 新增/編輯頁面的表單驗證
- **行為**: 現在可以正常提交表單，不會再出現隱藏字段驗證錯誤

---

## [2025-11-26 22:27:23] - 修復圖片上傳時 addToLocalList is not defined 錯誤

### 修改內容

#### 修復圖片上傳時 addToLocalList is not defined 錯誤
- **時間**: 2025-11-26 22:27:23
- **問題**: 圖片成功上傳後，會跳出 "addToLocalList is not defined" 錯誤
- **修改檔案**:
  - `app/static/admin/products/add-edit.html` - 修復函數參數名不匹配問題

### 變更詳情

#### 問題原因
- 在 `addImageToProduct` 函數中，參數名定義為 `updateLocalList`
- 但在函數內部卻使用了 `addToLocalList`（未定義的變數）
- 導致圖片上傳成功後，嘗試更新本地列表時出現錯誤

#### 修復方案
- 將函數內部的 `addToLocalList` 改為正確的參數名 `updateLocalList`
- 同時添加重複檢查邏輯，避免重複添加圖片到本地列表

#### 修改的函數
- **addImageToProduct**:
  - 修復參數名不匹配問題（`addToLocalList` → `updateLocalList`）
  - 添加重複檢查，避免重複添加圖片

### 技術細節

#### 修復前
```javascript
if (addToLocalList) {  // ❌ 錯誤：變數未定義
    productImages.push(imageData);
    renderImages();
}
```

#### 修復後
```javascript
if (updateLocalList) {  // ✅ 正確：使用正確的參數名
    // 检查是否已存在，避免重复
    const exists = productImages.some(img => img.id === imageData.id || img.image_url === imageUrl);
    if (!exists) {
        productImages.push(imageData);
        renderImages();
    }
}
```

### 影響範圍
- **前端**: 產品新增/編輯頁面的圖片上傳功能
- **行為**: 圖片上傳成功後不再出現錯誤，可以正常添加到本地列表

---

## [2025-11-26 22:20:19] - 產品管理頁面加入 Font Awesome 6

### 修改內容

#### 產品管理頁面加入 Font Awesome 6
- **時間**: 2025-11-26 22:20:19
- **目的**: 為產品管理頁面添加 Font Awesome 6 圖標庫支持
- **修改檔案**:
  - `app/static/admin/products/index.html` - 產品列表頁面
  - `app/static/admin/products/add-edit.html` - 產品新增/編輯頁面

### 變更詳情

#### 添加的內容
1. **Font Awesome 6 CDN 連結**:
   - 使用 CDN 方式引入 Font Awesome 6.5.1
   - 包含 integrity 和 crossorigin 屬性確保安全性

2. **CSS 樣式**:
   - 添加防止圖標在 CSS 加載前顯示為大文本的樣式
   - 當 Font Awesome 加載完成後，圖標會正常顯示

3. **加載檢測腳本**:
   - 添加檢測 Font Awesome CSS 是否已加載的腳本
   - 設置超時機制，避免無限等待
   - 加載完成後添加 `fontawesome-loaded` class

#### 修改的檔案

##### `app/static/admin/products/index.html`
- 在 `<head>` 中添加 Font Awesome 6 CDN 連結
- 添加 Font Awesome 相關 CSS 樣式
- 添加 Font Awesome 加載檢測腳本

##### `app/static/admin/products/add-edit.html`
- 在 `<head>` 中添加 Font Awesome 6 CDN 連結
- 添加 Font Awesome 相關 CSS 樣式
- 添加 Font Awesome 加載檢測腳本

### 技術細節

#### Font Awesome 6 CDN
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
      integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" 
      crossorigin="anonymous" 
      referrerpolicy="no-referrer" />
```

#### 使用方式
現在可以在產品管理頁面中使用 Font Awesome 6 圖標：
- `<i class="fas fa-box"></i>` - Solid 樣式
- `<i class="far fa-box"></i>` - Regular 樣式
- `<i class="fab fa-font-awesome"></i>` - Brands 樣式
- `<i class="fa-solid fa-box"></i>` - 新語法（Solid）
- `<i class="fa-regular fa-box"></i>` - 新語法（Regular）

### 影響範圍
- **前端**: 產品管理列表頁面和新增/編輯頁面
- **功能**: 現在可以在這些頁面中使用 Font Awesome 6 圖標
- **兼容性**: 與分類管理頁面的實現保持一致

---

## [2025-11-26 22:13:46] - 修復只有一張圖片時保存會自動新增的問題

### 修改內容

#### 修復只有一張圖片時保存會自動新增的問題
- **時間**: 2025-11-26 22:13:46
- **問題**: 當產品只有一張圖片時，按下儲存會自動新增重複的圖片
- **修改檔案**:
  - `app/api/admin/product_images.py` - 在添加圖片時檢查是否已存在
  - `app/static/admin/products/add-edit.html` - 在保存時檢查圖片URL是否已存在

### 變更詳情

#### 問題原因
- 當產品只有一張圖片時，這張圖片已經存在於數據庫中
- 保存時，如果圖片URL與數據庫中的圖片URL相同，但沒有檢查重複，會導致重複添加
- 後端 API 沒有檢查圖片URL是否已存在

#### 修復方案
1. **後端 API 檢查** (`add_product_image`):
   - 在添加圖片前，檢查該產品的圖片列表中是否已存在相同的 `image_url`
   - 如果已存在，直接返回現有圖片，不重複添加

2. **前端保存邏輯檢查**:
   - 在添加新上傳的圖片前，獲取數據庫中已有的圖片URL列表
   - 只添加不在數據庫中的圖片URL

#### 修改的函數
- **add_product_image** (POST /api/admin/products/{product_id}/images):
  - 添加重複檢查邏輯
  - 如果圖片URL已存在，返回現有圖片而不是創建新記錄

- **handleSubmit** (編輯模式):
  - 在添加新圖片前，檢查圖片URL是否已存在於數據庫中
  - 只添加真正新的圖片

### 技術細節

#### 後端重複檢查
```python
# 檢查圖片是否已存在（避免重複添加）
existing_image = db.query(ProductImage).filter(
    ProductImage.product_id == product_id,
    ProductImage.image_url == image_data.image_url
).first()

if existing_image:
    # 如果圖片已存在，直接返回現有圖片
    return existing_image
```

#### 前端重複檢查
```javascript
// 獲取數據庫中已有的圖片URL，避免重複添加
const existingImageUrls = (currentData.images || []).map(img => img.image_url);

for (const img of productImages) {
    if (img.id > 1000000000000) {
        // 檢查圖片URL是否已存在於數據庫中
        if (!existingImageUrls.includes(img.image_url)) {
            await addImageToProduct(productId, img.image_url);
        }
    }
}
```

### 影響範圍
- **後端 API**: `/api/admin/products/{product_id}/images` 端點（POST）
- **前端**: 產品編輯頁面的圖片保存邏輯
- **行為**: 只有一張圖片時保存不會再自動新增重複圖片

---

## [2025-11-26 22:09:24] - 修復產品編輯時圖片重複增加的問題

### 修改內容

#### 修復產品編輯時圖片重複增加的問題
- **時間**: 2025-11-26 22:09:24
- **問題**: 在產品編輯模式下，每次保存都會重複添加圖片，導致圖片不斷累積
- **修改檔案**:
  - `app/static/admin/products/add-edit.html` - 修復圖片處理邏輯

### 變更詳情

#### 問題原因
1. **編輯模式下上傳圖片**: 上傳時立即添加到數據庫，但同時也添加到本地列表
2. **保存時處理不當**: 編輯模式下只更新順序，沒有處理新增和刪除的圖片
3. **重複添加**: 每次保存都會基於當前列表重新處理，導致圖片重複

#### 修復方案
1. **統一圖片處理流程**:
   - 無論新增還是編輯模式，上傳圖片時都先添加到本地列表
   - 只有在保存時才真正同步到數據庫

2. **編輯模式圖片同步**:
   - 獲取當前數據庫中的圖片列表
   - 刪除不在當前列表中的圖片（用戶已刪除的）
   - 添加新上傳的圖片（臨時ID的）
   - 更新圖片順序

3. **防止重複添加**:
   - 在 `addImageToLocalList` 中檢查圖片URL是否已存在
   - 使用臨時ID（> 1000000000000）區分新上傳和已保存的圖片
   - 在保存時只處理臨時ID的圖片

#### 修改的函數
- **uploadAndAddImage**: 統一處理流程，不再在編輯模式下立即添加到數據庫
- **addImageToLocalList**: 添加重複檢查，防止相同URL重複添加
- **handleSubmit**: 改進編輯模式的圖片同步邏輯
- **updateImageOrder**: 過濾臨時ID，只處理真實ID的圖片

### 技術細節

#### 圖片ID區分
- **真實ID** (≤ 1000000000000): 已保存到數據庫的圖片
- **臨時ID** (> 1000000000000): 新上傳但尚未保存的圖片

#### 編輯模式同步流程
```javascript
1. 獲取數據庫中的圖片列表
2. 比較當前列表和數據庫列表
3. 刪除不在當前列表中的圖片
4. 添加新上傳的圖片（臨時ID）
5. 更新圖片順序
```

### 影響範圍
- **前端**: 產品編輯頁面的圖片管理功能
- **行為**: 編輯產品時圖片不再重複增加，可以正確刪除和添加圖片

---

## [2025-11-26 22:04:53] - 修復創建產品 API 缺少 is_hot 欄位的問題

### 修改內容

#### 修復創建產品 API 響應缺少 is_hot 欄位
- **時間**: 2025-11-26 22:04:53
- **問題**: `POST /api/admin/products` 創建產品時，返回的響應中缺少 `is_hot` 欄位，導致 JSON 解析錯誤
- **修改檔案**:
  - `app/api/admin/products.py` - 在 `create_product` 函數的返回響應中添加 `is_hot` 欄位

### 變更詳情

#### 修復的函數
- **create_product** (POST /api/admin/products):
  - 在返回的 `product_dict` 中添加 `"is_hot": new_product.is_hot`
  - 確保響應數據與 `ProductResponseAdmin` schema 定義一致

### 技術細節

#### 問題原因
- 雖然在創建產品時設置了 `is_hot=product_data.is_hot`
- 但在構建返回響應時忘記包含 `is_hot` 欄位
- 導致 FastAPI 驗證失敗，返回 "Internal Server Error" 而非 JSON

#### 修復方法
- 在 `create_product` 函數的 `product_dict` 中添加 `"is_hot": new_product.is_hot`
- 與 `get_product` 和 `update_product` 保持一致

### 影響範圍
- **API**: `/api/admin/products` 端點（POST）
- **前端**: 產品新增頁面現在可以正常保存

---

## [2025-11-26 21:00:53] - 添加首頁熱門產品 API 端點

### 修改內容

#### 添加首頁熱門產品 API
- **時間**: 2025-11-26 21:00:53
- **功能**: 在首頁 API 中添加 `/api/home/hot` 端點，用於獲取熱門產品（is_hot=True）
- **修改檔案**:
  - `app/api/home.py` - 添加 `get_hot_products` 函數和 `/api/home/hot` 端點
  - `frontend/services/api.ts` - 添加 `fetchHotProducts` 函數和 `Product` 接口定義

### 變更詳情

#### 後端 API
- **新增端點**: `GET /api/home/hot`
  - 返回所有 `is_hot=True` 且 `is_active=True` 的產品
  - 按創建時間降序排序
  - 包含完整的產品信息：分類名稱、產品圖片列表等

#### 前端 API 服務
- **新增函數**: `fetchHotProducts()`
  - 調用 `/api/home/hot` 端點
  - 返回 `Product[]` 類型的產品列表
- **新增接口**: `Product`
  - 定義產品數據結構
  - 包含所有產品字段和產品圖片列表

#### 改進的推薦產品端點
- **優化**: `GET /api/home/featured`
  - 現在也包含完整的產品信息（分類名稱、產品圖片列表）
  - 使用 `joinedload` 優化數據庫查詢

### 技術細節

#### API 端點實現
```python
@router.get("/hot", response_model=List[ProductResponse])
def get_hot_products(db: Session = Depends(get_db)):
    """獲取熱門產品（is_hot=True 的啟用產品）"""
    products = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.images)
    ).filter(
        Product.is_active == True,
        Product.is_hot == True
    ).order_by(Product.created_at.desc()).all()
```

#### 數據結構
- 返回的產品包含：
  - 基本信息（id, title, price, description, image）
  - 分類信息（category_id, category_name）
  - 庫存和狀態（stock, is_active）
  - 產品圖片列表（product_images）

### 影響範圍
- **後端 API**: 新增 `/api/home/hot` 端點
- **前端服務**: 新增 `fetchHotProducts` 函數
- **使用場景**: 首頁可以顯示熱門產品列表

---

## [2025-11-26 20:56:50] - 修復產品 API 缺少 is_hot 欄位的問題

### 修改內容

#### 修復產品詳情和更新 API 缺少 is_hot 欄位
- **時間**: 2025-11-26 20:56:50
- **問題**: `GET /api/admin/products/{product_id}` 和 `PUT /api/admin/products/{product_id}` 返回的響應中缺少 `is_hot` 欄位，導致 JSON 解析錯誤
- **修改檔案**:
  - `app/api/admin/products.py` - 在 `get_product` 和 `update_product` 函數中添加 `is_hot` 欄位

### 變更詳情

#### 修復的函數
- **get_product** (GET /api/admin/products/{product_id}):
  - 在返回的 `product_dict` 中添加 `"is_hot": product.is_hot`
- **update_product** (PUT /api/admin/products/{product_id}):
  - 在返回的 `product_dict` 中添加 `"is_hot": product.is_hot`

### 技術細節

#### 問題原因
- `ProductResponseAdmin` schema 要求 `is_hot` 欄位
- 但 API 返回的字典中缺少此欄位
- 導致 FastAPI 驗證失敗，返回 "Internal Server Error" 而非 JSON

#### 修復方法
- 在所有返回 `ProductResponseAdmin` 的地方都添加 `is_hot` 欄位
- 確保響應數據與 schema 定義一致

### 影響範圍
- **API**: `/api/admin/products/{product_id}` 端點（GET 和 PUT）
- **前端**: 產品編輯頁面現在可以正常載入和更新

---

## [2025-11-26 20:50:36] - 為產品管理添加 is_hot 欄位

### 修改內容

#### 添加產品熱門標記功能
- **時間**: 2025-11-26 20:50:36
- **功能**: 在 admin 產品管理中新增 `is_hot` 欄位，用於標記熱門商品
- **修改檔案**:
  - `app/models/product.py` - 添加 `is_hot` 欄位到 Product 模型
  - `app/schemas/admin.py` - 在 ProductCreateAdmin, ProductUpdateAdmin, ProductResponseAdmin 中添加 `is_hot`
  - `app/api/admin/products.py` - 在創建、更新、獲取產品時處理 `is_hot` 欄位
  - `app/static/admin/products/index.html` - 在產品列表中添加「熱門」列顯示
  - `app/static/admin/products/add-edit.html` - 在產品編輯表單中添加「熱門商品」複選框
  - `app/database_migration.py` - 添加 `add_product_is_hot_column()` 遷移函數
  - `app/main.py` - 在應用啟動時執行 `is_hot` 欄位遷移

### 變更詳情

#### 數據庫模型
- **Product 模型**:
  - 添加 `is_hot = Column(Boolean, default=False)` 欄位
  - 位置：在 `is_active` 欄位之後

#### API Schema
- **ProductCreateAdmin**:
  - 添加 `is_hot: bool = False` 欄位（可選，默認為 False）
- **ProductUpdateAdmin**:
  - 添加 `is_hot: Optional[bool] = None` 欄位（可選更新）
- **ProductResponseAdmin**:
  - 添加 `is_hot: bool` 欄位（響應中包含）

#### API 端點
- **GET /api/admin/products**:
  - 返回的產品列表中包含 `is_hot` 欄位
- **POST /api/admin/products**:
  - 創建產品時支持設置 `is_hot` 欄位
- **GET /api/admin/products/{product_id}**:
  - 返回的產品詳情中包含 `is_hot` 欄位
- **PUT /api/admin/products/{product_id}**:
  - 更新產品時支持修改 `is_hot` 欄位

#### 前端界面
- **產品列表頁面** (`index.html`):
  - 在表格中添加「熱門」列
  - 顯示熱門狀態：是（紅色標籤）/ 否（灰色標籤）
- **產品編輯頁面** (`add-edit.html`):
  - 添加「熱門商品」複選框
  - 在載入產品數據時自動填充 `is_hot` 值
  - 在提交表單時包含 `is_hot` 欄位

#### 數據庫遷移
- **遷移函數**: `add_product_is_hot_column()`
  - 檢查 `products` 表是否存在
  - 檢查 `is_hot` 欄位是否已存在
  - 如果不存在，添加 `is_hot BOOLEAN NOT NULL DEFAULT FALSE` 欄位
  - 位置：在 `is_active` 欄位之後
- **自動執行**: 在應用啟動時自動執行遷移

### 技術細節

#### 欄位定義
```python
is_hot = Column(Boolean, default=False)
```

#### 前端顯示
- 熱門商品顯示為紅色標籤（`bg-red-100 text-red-800`）
- 非熱門商品顯示為灰色標籤（`bg-gray-100 text-gray-800`）

#### 數據庫遷移 SQL
```sql
ALTER TABLE products 
ADD COLUMN is_hot BOOLEAN NOT NULL DEFAULT FALSE
AFTER is_active
```

### 影響範圍
- **後端 API**: 所有產品相關的 admin API 端點
- **前端界面**: 產品列表和產品編輯頁面
- **數據庫**: `products` 表結構變更

---

## [2025-11-26 08:57:25] - 徹底修復 /api/categories API 重複問題

### 修改內容

#### 徹底修復分類 API 的重複問題
- **時間**: 2025-11-26 08:57:25
- **問題**: `/api/categories` API 仍然返回重複的分類（即使之前已修復）
- **根本原因**: SQLAlchemy 的 relationship 可能自動填充了 children，導致重複
- **修改檔案**:
  - `app/api/categories.py` - 重寫樹狀結構構建邏輯
- **變更詳情**:
  - **明確初始化 children**:
    - 在創建 `CategoryTreeResponse` 後，明確設置 `children = []`
    - 避免 SQLAlchemy relationship 自動填充導致的重複
  - **使用 ID 追蹤**:
    - 使用 `children_ids_by_parent` 字典追蹤每個父分類已添加的子分類 ID
    - 在添加子分類前，檢查該 ID 是否已存在
    - 確保每個子分類只被添加一次
  - **最終去重**:
    - 在返回前，對每個根分類的 children 進行最終去重
    - 使用 `seen_ids` 集合確保沒有重複
  - **排序優化**:
    - 在去重後進行排序，確保順序正確
- **功能特點**:
  - **徹底去重**: 多層防護確保不會有重複
  - **性能優化**: 使用 ID 集合檢查，比對象比較更高效
  - **正確排序**: 按 `sort_order` 和 `created_at` 排序

### 技術細節

#### 修復邏輯
```python
# 1. 明確設置 children 為空列表
category_node.children = []

# 2. 使用 ID 追蹤已添加的子分類
children_ids_by_parent = {}
if cat.id not in children_ids_by_parent[cat.parent_id]:
    category_dict[cat.parent_id].children.append(category_node)
    children_ids_by_parent[cat.parent_id].add(cat.id)

# 3. 最終去重
seen_ids = set()
unique_children = []
for child in root_cat.children:
    if child.id not in seen_ids:
        seen_ids.add(child.id)
        unique_children.append(child)
```

### 影響範圍

- **API**: `/api/categories` 端點
- **前端**: 使用此 API 的前端頁面會收到無重複且正確排序的數據
- **性能**: 使用 ID 集合檢查，性能更好

### 注意事項

1. **多層防護**: 三層防護確保不會有重複（初始化、ID 追蹤、最終去重）
2. **SQLAlchemy**: 明確設置 children 為空列表，避免 relationship 自動填充
3. **排序**: 在去重後進行排序，確保順序正確

---

## [2025-11-26 08:52:06] - 修復 /api/categories API 重複問題並添加排序功能

### 修改內容

#### 修復分類 API 的重複問題並添加排序功能
- **時間**: 2025-11-26 08:52:06
- **問題**: `/api/categories` API 返回的數據有重複的分類，且沒有按 `sort_order` 排序
- **修改檔案**:
  - `app/api/categories.py` - 修復重複問題並添加排序
  - `app/schemas/category.py` - 在 CategoryResponse 中添加 `sort_order` 字段
- **變更詳情**:
  - **修復重複問題**:
    - 添加 `added_to_children` 集合來追蹤已經添加到 children 的分類
    - 在添加子分類到父分類的 children 之前，檢查是否已經添加過
    - 避免同一個分類被重複添加到 children 中
  - **添加排序功能**:
    - 在數據庫查詢時按 `sort_order` 升序排序，相同時按 `created_at` 排序
    - 在構建樹狀結構後，對根分類和子分類都進行排序
    - 確保返回的數據按照排序順序排列
  - **Schema 更新**:
    - 在 `CategoryResponse` 中添加 `sort_order` 字段
    - 確保 API 返回的數據包含排序信息
- **功能特點**:
  - **無重複**: 每個分類只會出現一次
  - **正確排序**: 按 `sort_order` 排序，相同時按創建時間排序
  - **樹狀結構**: 保持原有的樹狀結構，但已排序且無重複

### 技術細節

#### 修復邏輯
```python
added_to_children = set()  # 追蹤已經添加到 children 的分類

for cat in all_categories:
    if cat.parent_id is None:
        root_categories.append(category_node)
    else:
        if cat.id not in added_to_children:  # 檢查是否已添加
            category_dict[cat.parent_id].children.append(category_node)
            added_to_children.add(cat.id)  # 標記為已添加
```

#### 排序邏輯
1. 數據庫查詢時按 `sort_order` 和 `created_at` 排序
2. 構建樹狀結構後，對根分類和子分類分別排序
3. 排序鍵：`(sort_order, created_at)`

### 影響範圍

- **API**: `/api/categories` 端點
- **前端**: 使用此 API 的前端頁面會收到正確排序且無重複的數據
- **向後兼容**: 不影響其他功能

### 注意事項

1. **排序**: 分類按 `sort_order` 排序，值越小越靠前
2. **無重複**: 每個分類在樹狀結構中只會出現一次
3. **Schema**: API 返回的數據現在包含 `sort_order` 字段

---

## [2025-11-26 08:32:57] - 添加分類排序字段的數據庫遷移腳本

### 修改內容

#### 添加數據庫遷移腳本以支援分類排序功能
- **時間**: 2025-11-26 08:32:57
- **功能**: 創建數據庫遷移腳本，自動為 `product_categories` 表添加 `sort_order` 字段
- **修改檔案**:
  - `app/database_migration.py` - 添加 `add_category_sort_order_column` 函數
  - `app/main.py` - 在應用啟動時自動執行遷移
- **變更詳情**:
  - **遷移函數**: 創建 `add_category_sort_order_column()` 函數
    - 檢查 `product_categories` 表是否存在
    - 檢查 `sort_order` 字段是否已存在
    - 如果不存在，添加 `sort_order` 字段（INTEGER，NOT NULL，DEFAULT 0）
    - 創建 `ix_product_categories_sort_order` 索引
  - **自動執行**: 在 `main.py` 中導入並調用遷移函數
    - 應用啟動時自動執行遷移
    - 如果遷移失敗，記錄警告但繼續運行
- **功能特點**:
  - **自動遷移**: 應用啟動時自動檢查並添加缺失的字段
  - **安全檢查**: 檢查字段是否已存在，避免重複添加
  - **索引優化**: 自動創建索引以提升查詢性能
  - **錯誤處理**: 遷移失敗不會阻止應用啟動

### 技術細節

#### 遷移腳本執行流程
1. 連接到數據庫
2. 檢查 `product_categories` 表是否存在
3. 檢查 `sort_order` 字段是否已存在
4. 如果不存在，執行 `ALTER TABLE` 添加字段
5. 創建索引以優化排序查詢
6. 記錄日誌信息

#### SQL 語句
```sql
ALTER TABLE product_categories 
ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0
AFTER description;

CREATE INDEX ix_product_categories_sort_order ON product_categories(sort_order);
```

### 使用方式

#### 方式 1: 自動遷移（推薦）
- 直接啟動應用，遷移會自動執行
- 無需手動操作

#### 方式 2: 手動執行遷移腳本
```bash
cd backend
python -m app.database_migration
```

### 影響範圍

- **數據庫**: 為 `product_categories` 表添加 `sort_order` 字段和索引
- **應用啟動**: 應用啟動時自動執行遷移
- **向後兼容**: 現有數據的 `sort_order` 值為 0

### 注意事項

1. **自動執行**: 遷移會在應用啟動時自動執行，無需手動操作
2. **現有數據**: 現有分類的 `sort_order` 值會自動設為 0
3. **重複執行**: 遷移腳本會檢查字段是否已存在，可以安全地重複執行
4. **錯誤處理**: 如果遷移失敗，應用會記錄警告但繼續運行

---

## [2025-11-26 08:30:41] - 為分類管理添加排序功能

### 修改內容

#### 在數據庫和前端添加排序欄位
- **時間**: 2025-11-26 08:30:41
- **功能**: 為分類管理添加排序功能，包括數據庫欄位、API 支援和前端顯示/編輯
- **修改檔案**:
  - `app/models/product_category.py` - 添加 `sort_order` 欄位
  - `app/schemas/admin.py` - 在 schemas 中添加 `sort_order` 欄位
  - `app/api/admin/categories.py` - 修改 API 以支援排序欄位的保存和查詢
  - `app/static/admin/categories/index.html` - 添加排序欄位顯示和編輯功能
  - `app/static/admin/categories/add-edit.html` - 添加排序欄位輸入框
- **變更詳情**:
  - **數據庫模型**:
    - 在 `ProductCategory` 模型中添加 `sort_order` 欄位（Integer，默認值 0，有索引）
  - **Schemas**:
    - 在 `CategoryCreateAdmin` 中添加 `sort_order` 欄位（默認值 0）
    - 在 `CategoryUpdateAdmin` 中添加 `sort_order` 欄位（可選）
    - 在 `CategoryResponseAdmin` 中添加 `sort_order` 欄位
  - **API**:
    - 修改 `get_categories` 查詢，按 `sort_order` 排序（然後按 `created_at`）
    - 在 `create_category` 中保存 `sort_order` 值
    - 在 `update_category` 中支援更新 `sort_order` 值
  - **前端列表頁面**:
    - 在表格中添加"排序"列
    - 每個分類顯示一個數字輸入框，可以直接編輯排序值
    - 添加 `updateSortOrder` 函數，當排序值改變時自動更新
    - 修改排序邏輯，先按 `sort_order` 排序，相同時按名稱排序
  - **前端新增/編輯頁面**:
    - 添加排序輸入框，可以設置分類的排序值
    - 在載入分類數據時，顯示現有的排序值
    - 在提交表單時，包含排序值
- **功能特點**:
  - **即時更新**: 在列表頁面可以直接修改排序值，無需進入編輯頁面
  - **自動排序**: 分類按排序值自動排序，相同排序值時按名稱排序
  - **階層排序**: 根分類和子分類分別按各自的排序值排序
  - **數據驗證**: 排序值必須是非負整數

### 技術細節

#### 數據庫遷移
需要在數據庫中執行以下 SQL（或使用 Alembic 遷移）：
```sql
ALTER TABLE product_categories ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
CREATE INDEX ix_product_categories_sort_order ON product_categories(sort_order);
```

#### 排序邏輯
1. 根分類按 `sort_order` 升序排序，相同時按名稱排序
2. 子分類按 `sort_order` 升序排序，相同時按名稱排序
3. 排序值越小越靠前

### 影響範圍

- **數據庫**: 需要添加 `sort_order` 欄位
- **API**: 所有分類相關的 API 都支援排序欄位
- **前端**: 列表頁面和新增/編輯頁面都支援排序功能

### 注意事項

1. **數據庫遷移**: 需要執行數據庫遷移以添加 `sort_order` 欄位
2. **默認值**: 現有分類的 `sort_order` 值為 0，會按創建時間和名稱排序
3. **排序更新**: 在列表頁面修改排序值後，會立即更新並重新渲染表格

---

## [2025-11-26 08:27:51] - 修改分類管理頁面為階層式顯示

### 修改內容

#### 將分類管理頁面改為按階層結構顯示
- **時間**: 2025-11-26 08:27:51
- **功能**: 修改分類管理頁面的顯示方式，按照根分類和子分類的階層結構顯示
- **修改檔案**:
  - `app/static/admin/categories/index.html`
- **變更詳情**:
  - **移除分頁功能**: 移除分頁選擇器和分頁顯示，改為一次載入所有分類
  - **階層式顯示**: 
    - 先顯示所有根分類（parent_id 為 null 或 0）
    - 每個根分類下方顯示其子分類，使用縮進和 `└─` 符號表示階層關係
    - 子分類使用 `pl-8` 類別進行左側縮進
  - **排序**: 根分類和子分類都按名稱排序顯示
  - **顯示格式**: 
    - 根分類：正常顯示（如 "Electronic", "Lifestyle"）
    - 子分類：縮進顯示，前面有 `└─` 符號（如 "  └─ Audio", "  └─ Fitness"）
- **功能特點**:
  - **階層清晰**: 可以清楚看到分類的父子關係
  - **易於管理**: 根分類和子分類的關係一目了然
  - **無分頁**: 所有分類一次顯示，方便查看完整的分類結構

### 技術細節

#### 顯示邏輯
1. 將分類分為根分類和子分類兩組
2. 對根分類按名稱排序
3. 對每個根分類，找出其子分類並按名稱排序
4. 使用縮進和符號表示階層關係

#### 顯示格式示例
```
Electronic
  └─ Audio
Lifestyle
  └─ Fitness
```

### 影響範圍

- **前端頁面**: 分類管理列表頁面（index.html）
- **功能**: 分類顯示改為階層式，更清晰展示分類關係
- **性能**: 移除分頁，一次載入所有分類（最多 1000 筆）

### 注意事項

1. **載入數量**: 設定最多載入 1000 筆分類，如果分類數量超過此限制，可能需要調整
2. **階層顯示**: 子分類使用縮進和符號表示，視覺上更清晰
3. **排序**: 根分類和子分類都按名稱排序

---

## [2025-11-26 08:22:16] - 為分類管理頁面添加 Font Awesome 6 CDN

### 修改內容

#### 在分類管理頁面添加 Font Awesome 6 CDN 和相關功能
- **時間**: 2025-11-26 08:22:16
- **功能**: 為分類管理頁面（index.html 和 add-edit.html）添加 Font Awesome 6 CDN，用於顯示分類圖標
- **修改檔案**:
  - `app/static/admin/categories/index.html`
  - `app/static/admin/categories/add-edit.html`
- **變更詳情**:
  - **Font Awesome 6 CDN**: 添加 Font Awesome 6.5.1 CSS CDN 連結
  - **圖標隱藏/顯示 CSS**: 添加防止圖標在 CSS 載入前顯示為大文本的樣式
  - **載入檢測腳本**: 添加等待 Font Awesome CSS 載入完成並添加 `fontawesome-loaded` 類別的腳本
  - **僅分類管理使用**: 只有分類管理頁面使用 Font Awesome，其他頁面不使用
- **功能特點**:
  - **Font Awesome 6**: 使用最新版本的 Font Awesome 6.5.1
  - **防止閃現**: 圖標在 CSS 載入前會被隱藏，避免顯示為大文本
  - **載入檢測**: 使用多種方法檢測 Font Awesome 是否已載入完成
  - **僅分類管理**: 只有分類管理頁面載入 Font Awesome，其他頁面不受影響

### 技術細節

#### Font Awesome 6 CDN
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
      integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" 
      crossorigin="anonymous" 
      referrerpolicy="no-referrer" />
```

#### 圖標隱藏/顯示邏輯
- 初始狀態：所有 Font Awesome 圖標類別設為 `visibility: hidden` 和 `font-size: 0`
- 載入完成後：當 `html` 元素有 `fontawesome-loaded` 類別時，圖標正常顯示

### 影響範圍

- **前端頁面**: 分類管理頁面（index.html 和 add-edit.html）
- **功能**: 分類圖標可以正常顯示（使用 Font Awesome 圖標類別）
- **性能**: 僅分類管理頁面載入 Font Awesome，其他頁面不受影響

### 注意事項

1. **僅分類管理**: 只有分類管理頁面使用 Font Awesome，其他頁面不使用
2. **圖標顯示**: 分類圖標使用 Font Awesome 圖標類別（如 `fas fa-box`）可以正常顯示
3. **載入檢測**: 使用多種方法確保 Font Awesome 正確載入

---

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

