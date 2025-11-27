# 部署配置说明

## 项目结构

```
/home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/
├── frontend/          # React 前端
│   └── dist/         # 构建后的静态文件
└── backend/          # FastAPI 后端
    ├── app/
    ├── wsgi.py       # uWSGI 入口文件
    └── .venv/        # Python 虚拟环境
```

## 端口配置

- **前端**: Port 8000 (开发模式) 或静态文件服务
- **后端**: Port 8096 (uWSGI)

## 部署步骤

### 1. 准备后端

```bash
cd /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend

# 使用 uv sync 安装依赖（会自动创建虚拟环境并安装所有依赖）
# 确保已安装 uv: curl -LsSf https://astral.sh/uv/install.sh | sh
uv sync

# uv sync 会：
# - 根据 pyproject.toml 和 uv.lock 创建/更新虚拟环境
# - 安装所有依赖到 .venv 目录
# - 确保依赖版本与 uv.lock 一致

# 确保 wsgi.py 存在
# 文件已创建在 backend/wsgi.py
```

### 2. 配置 uWSGI

```bash
# 复制配置文件
sudo cp deployment/uwsgi.ini /etc/uwsgi/apps-available/shopping-react-backend.ini
sudo ln -s /etc/uwsgi/apps-available/shopping-react-backend.ini /etc/uwsgi/apps-enabled/

# 创建日志目录
sudo mkdir -p /var/log/uwsgi
sudo chown ai-tracks-shopping-react:ai-tracks-shopping-react /var/log/uwsgi

# 启动 uWSGI
sudo systemctl start uwsgi
sudo systemctl enable uwsgi
```

### 3. 配置 Nginx

```bash
# 复制配置文件
sudo cp deployment/nginx.conf /etc/nginx/sites-available/shopping-react.ai-tracks.com
sudo ln -s /etc/nginx/sites-available/shopping-react.ai-tracks.com /etc/nginx/sites-enabled/

# 修改 SSL 证书路径
sudo nano /etc/nginx/sites-available/shopping-react.ai-tracks.com
# 更新 ssl_certificate_key 和 ssl_certificate 路径

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

### 4. 前端构建和部署

```bash
cd /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/frontend

# 构建生产版本
npm run build
# 或
yarn build

# 构建后的文件在 dist/ 目录
# Nginx 会直接服务这些静态文件
```

## 配置说明

### Nginx 配置

- **前端**: 服务静态文件（`/` 路径）
- **后端 API**: 代理到 `http://127.0.0.1:8096/api/`
- **HTTPS**: 强制 HTTPS 重定向
- **静态文件缓存**: JS/CSS/图片等缓存 1 年

### uWSGI 配置

- **监听**: `127.0.0.1:8096`
- **进程数**: 8 个进程，每个 2 线程
- **动态进程**: Cheaper mode，最少 2 个进程
- **日志**: `/var/log/uwsgi/shopping-react-backend.log`

## 注意事项

### 依赖管理

项目使用 `uv` 进行依赖管理：

```bash
# 安装/更新依赖
uv sync

# 添加新依赖
uv add package-name

# 更新依赖
uv sync --upgrade

# 查看依赖
uv tree
```

`uv sync` 会根据 `pyproject.toml` 和 `uv.lock` 文件自动：
- 创建/更新虚拟环境（`.venv`）
- 安装所有依赖
- 确保依赖版本锁定

### FastAPI 和 uWSGI

FastAPI 是 ASGI 应用，但可以通过以下方式在 uWSGI 中运行：

1. **使用 WSGI 适配器**（当前方案）:
   - 使用 `asgiref` 的 `WSGIToASGIAdapter`
   - `asgiref` 已包含在依赖中（通过 `uv sync` 安装）

2. **使用 ASGI 插件**:
   - 安装 `uwsgi-asgi` 插件
   - 配置 `asgi-app` 而不是 `wsgi-file`

3. **推荐方案**（如果 uWSGI 有问题）:
   - 使用 `gunicorn` + `uvicorn` workers:
   ```bash
   # 使用 uv 运行
   uv run gunicorn app.main:app -w 8 -k uvicorn.workers.UvicornWorker -b 127.0.0.1:8096
   ```

### 环境变量

如果需要设置环境变量，可以在 uWSGI 配置中添加：
```ini
env = DATABASE_URL=postgresql://...
env = SECRET_KEY=...
```

或在 systemd service 文件中设置。

### 使用 uv 的优势

- **快速安装**: `uv` 比 `pip` 快 10-100 倍
- **依赖锁定**: `uv.lock` 确保生产环境依赖版本一致
- **自动虚拟环境管理**: 无需手动创建虚拟环境
- **更好的依赖解析**: 更快的依赖冲突检测和解决

### 更新依赖

```bash
cd /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend

# 更新所有依赖到最新版本
uv sync --upgrade

# 更新特定依赖
uv add package-name@latest

# 重新生成 uv.lock
uv lock

# 重启 uWSGI 使更改生效
sudo systemctl restart uwsgi
```

### 日志

- **Nginx 访问日志**: `/var/log/nginx/shopping-react-access.log`
- **Nginx 错误日志**: `/var/log/nginx/shopping-react-error.log`
- **uWSGI 日志**: `/var/log/uwsgi/shopping-react-backend.log`

## 故障排查

### 检查 uWSGI 状态
```bash
sudo systemctl status uwsgi
sudo journalctl -u uwsgi -f
```

### 检查 Nginx 状态
```bash
sudo systemctl status nginx
sudo nginx -t
```

### 测试后端 API
```bash
curl http://127.0.0.1:8096/api/health
# 或
curl https://shopping-react.ai-tracks.com/api/health
```

### 查看日志
```bash
# uWSGI 日志
tail -f /var/log/uwsgi/shopping-react-backend.log

# Nginx 错误日志
tail -f /var/log/nginx/shopping-react-error.log
```

