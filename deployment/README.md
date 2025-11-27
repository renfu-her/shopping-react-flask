# 部署配置說明

## 專案結構

```
/home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/
├── frontend/          # React 前端
│   └── dist/         # 構建後的靜態檔案
└── backend/          # FastAPI 後端
    ├── app/
    ├── wsgi.py       # uWSGI 入口檔案
    └── .venv/        # Python 虛擬環境
```

## 埠號配置

- **前端**: Port 8000 (開發模式) 或靜態檔案服務
- **後端**: Port 8096 (uWSGI)

## 部署步驟

### 1. 準備後端

```bash
cd /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend

# 使用 uv sync 安裝依賴（會自動建立虛擬環境並安裝所有依賴）
# 確保已安裝 uv: curl -LsSf https://astral.sh/uv/install.sh | sh
uv sync

# uv sync 會：
# - 根據 pyproject.toml 和 uv.lock 建立/更新虛擬環境
# - 安裝所有依賴到 .venv 目錄
# - 確保依賴版本與 uv.lock 一致

# 確保 wsgi.py 存在
# 檔案已建立在 backend/wsgi.py
```

### 2. 配置後端服務器（使用 uWSGI）

**⚠️ 重要**：如果使用 `uv` 管理的 Python，uWSGI 會出現 `_contextvars` 和 `_decimal` 錯誤。
**必須使用系統 Python 3.12 重新創建虛擬環境**。

#### 步驟 1: 安裝系統 Python 3.12

```bash
# 檢查系統是否已有 Python 3.12
which python3.12

# 如果沒有，安裝系統 Python 3.12
# Ubuntu/Debian:
sudo apt-get update
sudo apt-get install python3.12 python3.12-venv python3.12-dev

# 驗證安裝
python3.12 --version
```

#### 步驟 2: 使用系統 Python 3.12 重新創建虛擬環境

```bash
cd /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend

# **重要**：刪除舊的虛擬環境（使用 uv 管理的 Python，缺少 C 擴展模組）
rm -rf .venv

# 使用系統 Python 3.12 創建新的虛擬環境
python3.12 -m venv .venv

# 激活虛擬環境
source .venv/bin/activate

# 驗證 Python 版本和路徑（應該是系統 Python，不是 uv 管理的）
which python
python --version
# 應該顯示類似：
# /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend/.venv/bin/python
# Python 3.12.x

# 驗證不是 uv 管理的 Python（路徑不應該包含 ~/.local/share/uv/python/）
echo $VIRTUAL_ENV
```

#### 步驟 3: 使用 uv 安裝依賴

```bash
# uv 會使用當前激活的虛擬環境中的系統 Python
uv sync

# 驗證 C 擴展模組是否正常（重要！）
python -c "import _contextvars; import _decimal; print('✅ C 擴展模組正常')"

# 如果出現錯誤，說明虛擬環境仍然使用 uv 管理的 Python，需要重新創建
```

#### 步驟 4: 配置 uWSGI（選擇 WSGI 或 ASGI 模式）

**有兩種模式可選**：

##### 選項 A: WSGI 模式（使用 asgiref 適配器）

```bash
# 確保已安裝 asgiref
uv add asgiref

# 複製 WSGI 配置文件
sudo cp deployment/uwsgi.ini /etc/uwsgi/apps-available/shopping-react-backend.ini

# 創建符號連結
sudo ln -sf /etc/uwsgi/apps-available/shopping-react-backend.ini /etc/uwsgi/apps-enabled/

# 檢查配置文件路徑是否正確
sudo nano /etc/uwsgi/apps-enabled/shopping-react-backend.ini
# 確保以下配置正確：
# chdir = /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend
# virtualenv = /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend/.venv
# wsgi-file = /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend/wsgi.py
```

**注意**：WSGI 模式需要在 `wsgi.py` 中使用 `asgiref.wsgi.WsgiToAsgi` 適配器。

##### 選項 B: 使用 asgiref 適配器（推薦）

```bash
# 確保已安裝 asgiref（應該已經在依賴中）
uv add asgiref

# 複製配置文件（使用 wsgi.py，它已包含 asgiref 適配器）
sudo cp deployment/uwsgi.ini /etc/uwsgi/apps-available/shopping-react-backend.ini

# 創建符號連結
sudo ln -sf /etc/uwsgi/apps-available/shopping-react-backend.ini /etc/uwsgi/apps-enabled/

# 檢查配置文件路徑是否正確
sudo nano /etc/uwsgi/apps-enabled/shopping-react-backend.ini
# 確保以下配置正確：
# chdir = /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend
# virtualenv = /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend/.venv
# wsgi-file = /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend/wsgi.py
```

**注意**：
- ⚠️ uWSGI **不支持原生 ASGI**，沒有 `uwsgi-asgi` 包
- ✅ 使用 `asgiref.wsgi.WsgiToAsgi` 適配器將 ASGI 轉換為 WSGI
- ✅ `wsgi.py` 已包含適配器代碼
- ✅ 這是 uWSGI 運行 FastAPI 的標準方式

#### 步驟 5: 建立日誌目錄並啟動服務

```bash
# 建立日誌目錄
sudo mkdir -p /var/log/uwsgi
sudo chown ai-tracks-shopping-react:ai-tracks-shopping-react /var/log/uwsgi

# 重新載入 systemd（如果使用 systemd 服務）
sudo systemctl daemon-reload

# 重啟 uWSGI
sudo systemctl restart uwsgi
# 或如果使用 Emperor 模式：
# sudo systemctl restart uwsgi

# 檢查狀態
sudo systemctl status uwsgi

# 查看日誌
sudo tail -f /var/log/uwsgi/shopping-react-backend.log
```

#### 故障排查

如果仍然出現錯誤，請檢查：

1. **驗證虛擬環境使用系統 Python**：
   ```bash
   cd /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend
   source .venv/bin/activate
   which python
   # 應該顯示：/home/.../backend/.venv/bin/python
   # 不應該包含：~/.local/share/uv/python/
   
   python -c "import sys; print(sys.executable)"
   # 應該顯示系統 Python 路徑，不是 uv 管理的 Python
   ```

2. **驗證 C 擴展模組**：
   ```bash
   python -c "import _contextvars; import _decimal; print('✅ 正常')"
   # 如果失敗，虛擬環境仍然使用 uv 管理的 Python
   ```

3. **檢查 uWSGI 配置**：
   ```bash
   # 確保 virtualenv 路徑正確
   grep virtualenv /etc/uwsgi/apps-enabled/shopping-react-backend.ini
   # 應該顯示：virtualenv = /home/.../backend/.venv
   ```

4. **重新創建虛擬環境**（如果以上都失敗）：
   ```bash
   cd /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend
   rm -rf .venv
   /usr/bin/python3.12 -m venv .venv  # 明確使用系統 Python
   source .venv/bin/activate
   uv sync
   python -c "import _contextvars; import _decimal; print('✅ 正常')"
   ```

**⚠️ 重要警告**：`uv` 管理的 Python 缺少 C 擴展模組（`_contextvars`、`_decimal` 等），**無法與 uWSGI 正常運行**。

**必須使用系統 Python 3.12 重新創建虛擬環境**，否則會出現以下錯誤：
- `ModuleNotFoundError: No module named '_contextvars'`
- `ModuleNotFoundError: No module named '_decimal'`

**解決步驟**：

```bash
# 1. 檢查系統是否有 Python 3.12
which python3.12

# 2. 如果沒有，安裝系統 Python 3.12
# Ubuntu/Debian:
sudo apt-get update
sudo apt-get install python3.12 python3.12-venv python3.12-dev

# 3. **重要**：刪除舊的虛擬環境（使用 uv 管理的 Python）
cd /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend
rm -rf .venv

# 4. 使用系統 Python 3.12 創建新的虛擬環境
python3.12 -m venv .venv

# 5. 激活虛擬環境
source .venv/bin/activate

# 6. 驗證 Python 版本和路徑（應該是系統 Python，不是 uv 管理的）
which python
python --version
# 應該顯示類似：/home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend/.venv/bin/python
# 版本應該是：Python 3.12.x

# 7. 使用 uv 安裝依賴（uv 會使用當前激活的虛擬環境中的系統 Python）
uv sync

# 8. 驗證安裝是否成功
python -c "import _contextvars; import _decimal; print('C 擴展模組正常')"

# 9. 配置 uWSGI
# 檢查實際的配置文件名：
ls -la /etc/uwsgi/apps-enabled/
# 可能是 shopping-react.uwsgi.ini 或 shopping-react-backend.ini

# 複製配置文件
sudo cp deployment/uwsgi.ini /etc/uwsgi/apps-available/shopping-react-backend.ini
# 如果服務器上已有配置文件，使用相同的名稱：
# sudo cp deployment/uwsgi.ini /etc/uwsgi/apps-available/shopping-react.uwsgi.ini
sudo ln -sf /etc/uwsgi/apps-available/shopping-react-backend.ini /etc/uwsgi/apps-enabled/

# 10. 檢查配置文件路徑是否正確
sudo nano /etc/uwsgi/apps-enabled/shopping-react-backend.ini
# 確保以下配置正確：
# chdir = /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend
# virtualenv = /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend/.venv
# wsgi-file = /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend/wsgi.py

# 11. 建立日誌目錄
sudo mkdir -p /var/log/uwsgi
sudo chown ai-tracks-shopping-react:ai-tracks-shopping-react /var/log/uwsgi

# 12. 重啟 uWSGI
sudo systemctl restart uwsgi

# 13. 檢查狀態和日誌
sudo systemctl status uwsgi
sudo tail -f /var/log/uwsgi/shopping-react-backend.log
```

**常見錯誤及解決方法**：

| 錯誤 | 原因 | 解決方法 |
|------|------|----------|
| `ModuleNotFoundError: No module named '_contextvars'` | 使用 uv 管理的 Python | 使用系統 Python 3.12 重新創建虛擬環境 |
| `ModuleNotFoundError: No module named '_decimal'` | 使用 uv 管理的 Python | 使用系統 Python 3.12 重新創建虛擬環境 |
| `ModuleNotFoundError: No module named 'encodings'` | 虛擬環境路徑錯誤 | 檢查 `virtualenv` 配置是否指向正確的 `.venv` 目錄 |
| `unable to load app` | 路徑配置錯誤 | 檢查 `chdir` 和 `wsgi-file` 路徑是否正確 |
| `Python Home is not a directory` | 虛擬環境不存在 | 確保 `.venv` 目錄存在且路徑正確 |

**重要提示**：
- ✅ 必須使用系統 Python 3.12 創建虛擬環境
- ✅ 驗證 C 擴展模組：`python -c "import _contextvars; import _decimal"`
- ✅ 確保 `virtualenv` 配置指向正確的 `.venv` 目錄
- ✅ 確保 `chdir` 指向 `backend` 目錄，不是項目根目錄

### 3. 配置 Nginx

```bash
# 複製配置檔案
sudo cp deployment/nginx.conf /etc/nginx/sites-available/shopping-react.ai-tracks.com
sudo ln -s /etc/nginx/sites-available/shopping-react.ai-tracks.com /etc/nginx/sites-enabled/

# 修改 SSL 憑證路徑
sudo nano /etc/nginx/sites-available/shopping-react.ai-tracks.com
# 更新 ssl_certificate_key 和 ssl_certificate 路徑

# 測試配置
sudo nginx -t

# 重新載入 Nginx
sudo systemctl reload nginx
```

### 4. 前端构建和部署

```bash
cd /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/frontend

# 構建生產版本
npm run build
# 或
yarn build

# 構建後的檔案在 dist/ 目錄
# Nginx 會直接服務這些靜態檔案
```

## 配置說明

### Nginx 配置

- **前端**: 服務靜態檔案（`/` 路徑）
- **後端管理界面**: 代理到 `http://127.0.0.1:8096/backend/`（`/backend/` 路徑）
- **後端 API**: 代理到 `http://127.0.0.1:8096/api/`（`/api/` 路徑）
- **HTTPS**: 強制 HTTPS 重定向
- **靜態檔案快取**: JS/CSS/圖片等快取 1 年

**路徑說明**：
- `/backend/` → 後端管理界面（如 `/backend/admin`、`/backend/login` 等）
- `/api/` → 後端 API 接口（如 `/api/auth/login`、`/api/products` 等）
- `/` → 前端 React 應用（SPA，使用 `try_files` 處理路由）

### uWSGI 配置

- **監聽**: `127.0.0.1:8096`
- **進程數**: 8 個進程，每個 2 執行緒
- **動態進程**: Cheaper mode，最少 2 個進程
- **日誌**: `/var/log/uwsgi/shopping-react-backend.log`

## 注意事項

### 依賴管理

專案使用 `uv` 進行依賴管理：

```bash
# 安裝/更新依賴
uv sync

# 新增新依賴
uv add package-name

# 更新依賴
uv sync --upgrade

# 查看依賴
uv tree
```

`uv sync` 會根據 `pyproject.toml` 和 `uv.lock` 檔案自動：
- 建立/更新虛擬環境（`.venv`）
- 安裝所有依賴
- 確保依賴版本鎖定

### FastAPI 和 uWSGI

FastAPI 是 ASGI 應用，但可以透過以下方式在 uWSGI 中執行：

1. **使用 WSGI 適配器**（目前方案）:
   - 使用 `asgiref` 的 `WSGIToASGIAdapter`
   - `asgiref` 已包含在依賴中（透過 `uv sync` 安裝）

2. **使用 ASGI 外掛**:
   - 安裝 `uwsgi-asgi` 外掛
   - 配置 `asgi-app` 而不是 `wsgi-file`

3. **推薦方案**（如果 uWSGI 有問題，特別是遇到 `_contextvars` 錯誤）:
   - 使用 `gunicorn` + `uvicorn` workers（原生支持 ASGI，無需 WSGI 適配器）:
   ```bash
   # 1. 安裝 gunicorn（如果尚未安裝）
   cd /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend
   uv add gunicorn
   
   # 2. 測試運行
   uv run gunicorn app.main:app -w 8 -k uvicorn.workers.UvicornWorker -b 127.0.0.1:8096
   
   # 3. 使用 systemd 服務（推薦）
   sudo cp deployment/gunicorn.service /etc/systemd/system/shopping-react-gunicorn.service
   sudo mkdir -p /var/log/gunicorn
   sudo chown ai-tracks-shopping-react:ai-tracks-shopping-react /var/log/gunicorn
   sudo systemctl daemon-reload
   sudo systemctl start shopping-react-gunicorn
   sudo systemctl enable shopping-react-gunicorn
   ```
   
   **優點**：
   - 原生支持 ASGI，無需 WSGI 適配器
   - 更簡單，更穩定
   - 避免 `_contextvars` 等 C 擴展模組問題
   - 更好的異步支持

### 環境變數

如果需要設定環境變數，可以在 uWSGI 配置中新增：
```ini
env = DATABASE_URL=postgresql://...
env = SECRET_KEY=...
```

或在 systemd service 檔案中設定。

### 使用 uv 的優勢

- **快速安裝**: `uv` 比 `pip` 快 10-100 倍
- **依賴鎖定**: `uv.lock` 確保生產環境依賴版本一致
- **自動虛擬環境管理**: 無需手動建立虛擬環境
- **更好的依賴解析**: 更快的依賴衝突檢測和解決

### 更新依賴

```bash
cd /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend

# 更新所有依賴到最新版本
uv sync --upgrade

# 更新特定依賴
uv add package-name@latest

# 重新產生 uv.lock
uv lock

# 重新啟動 uWSGI 使更改生效
sudo systemctl restart uwsgi
```

### 日誌

- **Nginx 存取日誌**: `/var/log/nginx/shopping-react-access.log`
- **Nginx 錯誤日誌**: `/var/log/nginx/shopping-react-error.log`
- **uWSGI 日誌**: `/var/log/uwsgi/shopping-react-backend.log`

## 故障排查

### 檢查 uWSGI 狀態
```bash
sudo systemctl status uwsgi
sudo journalctl -u uwsgi -f
```

### 檢查 Nginx 狀態
```bash
sudo systemctl status nginx
sudo nginx -t
```

### 測試後端 API
```bash
curl http://127.0.0.1:8096/api/health
# 或
curl https://shopping-react.ai-tracks.com/api/health
```

### 查看日誌
```bash
# uWSGI 日誌
tail -f /var/log/uwsgi/shopping-react-backend.log

# Nginx 錯誤日誌
tail -f /var/log/nginx/shopping-react-error.log
```

