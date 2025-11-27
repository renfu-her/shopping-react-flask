# Shopping React Flask 專案

一個基於 React + FastAPI 的購物車系統，支援用戶註冊、商品瀏覽、購物車、訂單管理和綠界金流支付。

## 專案結構

```
shopping-react-flask/
├── frontend/          # React 前端 (TypeScript + Vite)
│   ├── src/
│   ├── dist/         # 構建後的靜態檔案
│   └── package.json
├── backend/          # FastAPI 後端
│   ├── app/          # 應用代碼
│   ├── wsgi.py       # uWSGI 入口檔案
│   ├── pyproject.toml
│   └── uv.lock       # 依賴鎖定檔案
└── deployment/       # 部署配置檔案
    ├── nginx.conf
    ├── uwsgi.ini
    ├── systemd-uwsgi.service
    └── deploy.sh
```

## 系統要求

在伺服器上部署需要以下軟體：

- **Node.js**: 22.x
- **npm**: 随 Node.js 安装
- **Python**: 3.12.12（推薦，已在 `.python-version` 中指定）
- **uv**: Python 套件管理器（最新版本）
- **uWSGI**: Python WSGI 伺服器
- **Nginx**: Web 伺服器和反向代理
- **MySQL/MariaDB**: 資料庫（可選，根據配置）

## 安裝步驟

### 1. 安装 Node.js 22

```bash
# 使用 NodeSource 安装 Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 驗證安裝
node --version  # 應該顯示 v22.x.x
npm --version
```

### 2. 安裝 Python 3.12.12

```bash
# Ubuntu/Debian
# 方法 1: 使用 deadsnakes PPA 安裝特定版本
sudo apt update
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install -y python3.12 python3.12-venv python3.12-dev

# 驗證安裝
python3.12 --version  # 應該顯示 Python 3.12.12

# 方法 2: 從源碼編譯（如果需要特定版本）
# 參考: https://www.python.org/downloads/
```

**注意**: 專案已指定 Python 3.12.12（在 `backend/.python-version` 中），建議使用此版本以確保一致性。

### 3. 安裝 uv

```bash
# 方法 1: 使用官方安裝腳本（推薦）
curl -LsSf https://astral.sh/uv/install.sh | sh

# 新增到 PATH (如果使用預設安裝路徑)
export PATH="$HOME/.cargo/bin:$PATH"

# 方法 2: 使用 pip 安裝（需要先有 Python）
python3.12 -m pip install uv

# 驗證安裝
uv --version

# 設定 uv 使用 Python 3.12.12
# uv 會自動偵測 .python-version 檔案，或手動指定：
uv python install 3.12.12
uv python pin 3.12.12
```

**注意**: 
- `uv` 會自動偵測專案目錄中的 `.python-version` 檔案
- 如果專案中有 `backend/.python-version` 指定 `3.12.12`，`uv sync` 會自動使用該版本
- 如果系統中沒有 Python 3.12.12，`uv` 會自動下載並安裝

### 4. 安装 uWSGI

```bash
# 安裝 uWSGI 和 Python 外掛
sudo apt install -y uwsgi uwsgi-plugin-python3

# 或使用 pip 安裝
pip install uwsgi

# 驗證安裝
uwsgi --version
```

### 5. 安装 Nginx

```bash
sudo apt install -y nginx

# 驗證安裝
nginx -v
```

## 專案部署

### 1. 複製專案

```bash
# 假設專案部署在以下路徑
PROJECT_DIR="/home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# 複製或上傳專案檔案
# git clone <repository-url> .
```

### 2. 後端部署

```bash
cd $PROJECT_DIR/backend

# 使用 uv sync 安裝依賴（會自動建立虛擬環境）
# uv 會自動偵測 .python-version 檔案並使用 Python 3.12.12
uv sync

# uv sync 會：
# - 自動偵測 .python-version 檔案（如果存在）
# - 如果系統中沒有指定的 Python 版本，會自動下載並安裝
# - 根據 pyproject.toml 和 uv.lock 建立/更新虛擬環境 (.venv)
# - 安裝所有依賴到 .venv 目錄
# - 確保依賴版本與 uv.lock 一致
# - 確保 Python 版本符合 pyproject.toml 中的 requires-python

# 驗證 Python 版本
.venv/bin/python --version  # 應該顯示 Python 3.12.12

# 驗證安裝
.venv/bin/python -c "from app.main import app; print('應用匯入成功')"
```

**重要**: 
- 專案使用 Python 3.12.12（在 `backend/.python-version` 和 `pyproject.toml` 中指定）
- `uv sync` 會自動使用正確的 Python 版本
- 如果系統中沒有 Python 3.12.12，`uv` 會自動下載並安裝（需要網路連線）

### 3. 前端部署

```bash
cd $PROJECT_DIR/frontend

# 安裝依賴
npm install

# 構建生產版本
npm run build

# 構建後的檔案在 dist/ 目錄
# Nginx 會直接服務這些靜態檔案
```

### 4. 配置 uWSGI

```bash
# 複製 uWSGI 配置檔案
sudo cp $PROJECT_DIR/deployment/uwsgi.ini /etc/uwsgi/apps-available/shopping-react-backend.ini

# 編輯配置檔案，修改路徑和用戶
sudo nano /etc/uwsgi/apps-available/shopping-react-backend.ini
# 確保以下路徑正確：
# - chdir = /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend
# - virtualenv = /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend/.venv
# - uid = ai-tracks-shopping-react
# - gid = ai-tracks-shopping-react

# 啟用配置
sudo ln -s /etc/uwsgi/apps-available/shopping-react-backend.ini /etc/uwsgi/apps-enabled/

# 建立日誌目錄
sudo mkdir -p /var/log/uwsgi
sudo chown ai-tracks-shopping-react:ai-tracks-shopping-react /var/log/uwsgi

# 啟動 uWSGI
sudo systemctl start uwsgi
sudo systemctl enable uwsgi

# 檢查狀態
sudo systemctl status uwsgi
```

### 5. 配置 Nginx

```bash
# 複製 Nginx 配置檔案
sudo cp $PROJECT_DIR/deployment/nginx.conf /etc/nginx/sites-available/shopping-react.ai-tracks.com

# 編輯配置檔案
sudo nano /etc/nginx/sites-available/shopping-react.ai-tracks.com

# 修改以下內容：
# - server_name: 您的網域
# - ssl_certificate_key: SSL 憑證金鑰路徑
# - ssl_certificate: SSL 憑證路徑
# - root: 前端 dist 目錄路徑
#   root /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/frontend/dist;

# 啟用配置
sudo ln -s /etc/nginx/sites-available/shopping-react.ai-tracks.com /etc/nginx/sites-enabled/

# 測試配置
sudo nginx -t

# 重新載入 Nginx
sudo systemctl reload nginx
```

### 6. 配置資料庫

```bash
# 編輯後端配置檔案
cd $PROJECT_DIR/backend
nano app/config.py

# 或設定環境變數
export DATABASE_URL="mysql+pymysql://user:password@localhost/dbname"
export SECRET_KEY="your-secret-key-here"
```

## 服務管理

### uWSGI 服务

```bash
# 啟動
sudo systemctl start uwsgi

# 停止
sudo systemctl stop uwsgi

# 重新啟動
sudo systemctl restart uwsgi

# 查看狀態
sudo systemctl status uwsgi

# 查看日誌
sudo journalctl -u uwsgi -f
tail -f /var/log/uwsgi/shopping-react-backend.log
```

### Nginx 服务

```bash
# 啟動
sudo systemctl start nginx

# 停止
sudo systemctl stop nginx

# 重新啟動
sudo systemctl restart nginx

# 重新載入配置（不中斷服務）
sudo systemctl reload nginx

# 查看狀態
sudo systemctl status nginx

# 測試配置
sudo nginx -t
```

## 埠號配置

- **前端**: 透過 Nginx 服務靜態檔案（預設 80/443）
- **後端 API**: uWSGI 監聽 `127.0.0.1:8096`，透過 Nginx 代理 `/api/` 路徑

## 依賴管理

### 後端依賴 (使用 uv)

```bash
cd backend

# 安裝/更新依賴（會自動使用 Python 3.12.12）
uv sync

# uv sync 會：
# - 自動偵測 .python-version 檔案（Python 3.12.12）
# - 如果系統中沒有 Python 3.12.12，會自動下載並安裝
# - 建立/更新虛擬環境 (.venv)
# - 安裝所有依賴到 .venv 目錄
# - 確保依賴版本與 uv.lock 一致

# 新增新依賴
uv add package-name

# 更新依賴
uv sync --upgrade

# 查看依賴樹
uv tree

# 查看 Python 版本
uv python list

# 手動指定 Python 版本（如果需要）
uv python pin 3.12.12

# 重新產生鎖定檔案
uv lock
```

### 前端依賴 (使用 npm)

```bash
cd frontend

# 安裝依賴
npm install

# 更新依賴
npm update

# 新增新依賴
npm install package-name

# 查看依賴
npm list
```

## 更新部署

### 更新後端

```bash
cd $PROJECT_DIR/backend

# 拉取最新代碼
# git pull

# 更新依賴
uv sync

# 重新啟動 uWSGI
sudo systemctl restart uwsgi
```

### 更新前端

```bash
cd $PROJECT_DIR/frontend

# 拉取最新代碼
# git pull

# 安裝新依賴（如果有）
npm install

# 重新構建
npm run build

# Nginx 會自動服務新的靜態檔案，無需重新啟動
```

## 故障排查

### 檢查後端 API

```bash
# 測試本機 API
curl http://127.0.0.1:8096/api/health

# 測試透過 Nginx
curl https://your-domain.com/api/health
```

### 查看日誌

```bash
# uWSGI 日誌
tail -f /var/log/uwsgi/shopping-react-backend.log
sudo journalctl -u uwsgi -f

# Nginx 存取日誌
tail -f /var/log/nginx/shopping-react-access.log

# Nginx 錯誤日誌
tail -f /var/log/nginx/shopping-react-error.log
```

### 常見問題

1. **uWSGI 無法啟動**
   - 檢查配置檔案路徑是否正確
   - 檢查虛擬環境是否存在
   - 查看日誌：`sudo journalctl -u uwsgi -n 50`

2. **Nginx 502 Bad Gateway**
   - 檢查 uWSGI 是否執行：`sudo systemctl status uwsgi`
   - 檢查埠號 8096 是否監聽：`netstat -tlnp | grep 8096`
   - 檢查 Nginx 錯誤日誌

3. **前端頁面無法載入**
   - 檢查 `dist/` 目錄是否存在
   - 檢查 Nginx `root` 配置是否正確
   - 檢查檔案權限

4. **依賴安裝失敗**
   - 確保 Python 版本正確：`python3.12 --version`（應該顯示 3.12.12）
   - 確保 uv 已安裝：`uv --version`
   - 檢查 `.python-version` 檔案是否存在：`cat backend/.python-version`
   - 讓 uv 自動安裝 Python：`uv python install 3.12.12`
   - 檢查網路連線（uv 可能需要下載 Python）
   - 檢查 pyproject.toml 中的 `requires-python` 設定（應該是 `>=3.12,<3.13`）
   - 手動指定 Python 版本：`uv python pin 3.12.12`

## 開發環境

### 後端開發

```bash
cd backend

# 啟動虛擬環境
source .venv/bin/activate

# 或使用 uv
uv run python -m app.main

# 使用 uvicorn 開發伺服器
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 前端開發

```bash
cd frontend

# 啟動開發伺服器
npm run dev

# 存取 http://localhost:5173
```

## 技術棧

### 前端
- **React 19**: UI 框架
- **TypeScript**: 型別安全
- **Vite**: 構建工具
- **React Router**: 路由管理
- **Tailwind CSS**: 樣式框架

### 後端
- **FastAPI**: Web 框架
- **SQLAlchemy**: ORM
- **MySQL**: 資料庫
- **uWSGI**: WSGI 伺服器
- **uv**: Python 套件管理

## 待辦事項

### 綠界金流結帳功能

- **狀態**: 待完成
- **說明**: 結帳使用綠界金流尚未完成，等待完成部署，再接續完成
- **目前進度**:
  - ✅ 後端 ECPay API 整合已完成
  - ✅ CheckMacValue 計算已修正
  - ✅ 前端結帳頁面和 ECPay 表單提交已實現
  - ⏸️ 目前處於驗證模式（不提交到綠界，只顯示參數）
- **待完成**:
  - 部署完成後驗證 CheckMacValue 是否正確
  - 取消註解前端代碼，啟用綠界提交
  - 測試完整的支付流程
  - 處理支付結果通知和訂單狀態更新

## 授權許可

[新增您的授權許可資訊]

## 聯絡方式

[新增聯絡方式]

