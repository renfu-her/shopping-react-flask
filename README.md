# Shopping React Flask 项目

一个基于 React + FastAPI 的购物车系统，支持用户注册、商品浏览、购物车、订单管理和绿界金流支付。

## 项目结构

```
shopping-react-flask/
├── frontend/          # React 前端 (TypeScript + Vite)
│   ├── src/
│   ├── dist/         # 构建后的静态文件
│   └── package.json
├── backend/          # FastAPI 后端
│   ├── app/          # 应用代码
│   ├── wsgi.py       # uWSGI 入口文件
│   ├── pyproject.toml
│   └── uv.lock       # 依赖锁定文件
└── deployment/       # 部署配置文件
    ├── nginx.conf
    ├── uwsgi.ini
    ├── systemd-uwsgi.service
    └── deploy.sh
```

## 系统要求

在服务器上部署需要以下软件：

- **Node.js**: 22.x
- **npm**: 随 Node.js 安装
- **Python**: 3.12.x
- **uv**: Python 包管理器（最新版本）
- **uWSGI**: Python WSGI 服务器
- **Nginx**: Web 服务器和反向代理
- **MySQL/MariaDB**: 数据库（可选，根据配置）

## 安装步骤

### 1. 安装 Node.js 22

```bash
# 使用 NodeSource 安装 Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version  # 应该显示 v22.x.x
npm --version
```

### 2. 安装 Python 3.12

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y python3.12 python3.12-venv python3.12-dev

# 验证安装
python3.12 --version
```

### 3. 安装 uv

```bash
# 安装 uv (Python 包管理器)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 添加到 PATH (如果使用默认安装路径)
export PATH="$HOME/.cargo/bin:$PATH"

# 或使用 pip 安装
pip install uv

# 验证安装
uv --version
```

### 4. 安装 uWSGI

```bash
# 安装 uWSGI 和 Python 插件
sudo apt install -y uwsgi uwsgi-plugin-python3

# 或使用 pip 安装
pip install uwsgi

# 验证安装
uwsgi --version
```

### 5. 安装 Nginx

```bash
sudo apt install -y nginx

# 验证安装
nginx -v
```

## 项目部署

### 1. 克隆项目

```bash
# 假设项目部署在以下路径
PROJECT_DIR="/home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# 克隆或上传项目文件
# git clone <repository-url> .
```

### 2. 后端部署

```bash
cd $PROJECT_DIR/backend

# 使用 uv sync 安装依赖（会自动创建虚拟环境）
uv sync

# uv sync 会：
# - 根据 pyproject.toml 和 uv.lock 创建/更新虚拟环境 (.venv)
# - 安装所有依赖到 .venv 目录
# - 确保依赖版本与 uv.lock 一致

# 验证安装
.venv/bin/python -c "from app.main import app; print('应用导入成功')"
```

### 3. 前端部署

```bash
cd $PROJECT_DIR/frontend

# 安装依赖
npm install

# 构建生产版本
npm run build

# 构建后的文件在 dist/ 目录
# Nginx 会直接服务这些静态文件
```

### 4. 配置 uWSGI

```bash
# 复制 uWSGI 配置文件
sudo cp $PROJECT_DIR/deployment/uwsgi.ini /etc/uwsgi/apps-available/shopping-react-backend.ini

# 编辑配置文件，修改路径和用户
sudo nano /etc/uwsgi/apps-available/shopping-react-backend.ini
# 确保以下路径正确：
# - chdir = /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend
# - virtualenv = /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/backend/.venv
# - uid = ai-tracks-shopping-react
# - gid = ai-tracks-shopping-react

# 启用配置
sudo ln -s /etc/uwsgi/apps-available/shopping-react-backend.ini /etc/uwsgi/apps-enabled/

# 创建日志目录
sudo mkdir -p /var/log/uwsgi
sudo chown ai-tracks-shopping-react:ai-tracks-shopping-react /var/log/uwsgi

# 启动 uWSGI
sudo systemctl start uwsgi
sudo systemctl enable uwsgi

# 检查状态
sudo systemctl status uwsgi
```

### 5. 配置 Nginx

```bash
# 复制 Nginx 配置文件
sudo cp $PROJECT_DIR/deployment/nginx.conf /etc/nginx/sites-available/shopping-react.ai-tracks.com

# 编辑配置文件
sudo nano /etc/nginx/sites-available/shopping-react.ai-tracks.com

# 修改以下内容：
# - server_name: 您的域名
# - ssl_certificate_key: SSL 证书密钥路径
# - ssl_certificate: SSL 证书路径
# - root: 前端 dist 目录路径
#   root /home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com/frontend/dist;

# 启用配置
sudo ln -s /etc/nginx/sites-available/shopping-react.ai-tracks.com /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

### 6. 配置数据库

```bash
# 编辑后端配置文件
cd $PROJECT_DIR/backend
nano app/config.py

# 或设置环境变量
export DATABASE_URL="mysql+pymysql://user:password@localhost/dbname"
export SECRET_KEY="your-secret-key-here"
```

## 服务管理

### uWSGI 服务

```bash
# 启动
sudo systemctl start uwsgi

# 停止
sudo systemctl stop uwsgi

# 重启
sudo systemctl restart uwsgi

# 查看状态
sudo systemctl status uwsgi

# 查看日志
sudo journalctl -u uwsgi -f
tail -f /var/log/uwsgi/shopping-react-backend.log
```

### Nginx 服务

```bash
# 启动
sudo systemctl start nginx

# 停止
sudo systemctl stop nginx

# 重启
sudo systemctl restart nginx

# 重载配置（不中断服务）
sudo systemctl reload nginx

# 查看状态
sudo systemctl status nginx

# 测试配置
sudo nginx -t
```

## 端口配置

- **前端**: 通过 Nginx 服务静态文件（默认 80/443）
- **后端 API**: uWSGI 监听 `127.0.0.1:8096`，通过 Nginx 代理 `/api/` 路径

## 依赖管理

### 后端依赖 (使用 uv)

```bash
cd backend

# 安装/更新依赖
uv sync

# 添加新依赖
uv add package-name

# 更新依赖
uv sync --upgrade

# 查看依赖树
uv tree

# 重新生成锁文件
uv lock
```

### 前端依赖 (使用 npm)

```bash
cd frontend

# 安装依赖
npm install

# 更新依赖
npm update

# 添加新依赖
npm install package-name

# 查看依赖
npm list
```

## 更新部署

### 更新后端

```bash
cd $PROJECT_DIR/backend

# 拉取最新代码
# git pull

# 更新依赖
uv sync

# 重启 uWSGI
sudo systemctl restart uwsgi
```

### 更新前端

```bash
cd $PROJECT_DIR/frontend

# 拉取最新代码
# git pull

# 安装新依赖（如果有）
npm install

# 重新构建
npm run build

# Nginx 会自动服务新的静态文件，无需重启
```

## 故障排查

### 检查后端 API

```bash
# 测试本地 API
curl http://127.0.0.1:8096/api/health

# 测试通过 Nginx
curl https://your-domain.com/api/health
```

### 查看日志

```bash
# uWSGI 日志
tail -f /var/log/uwsgi/shopping-react-backend.log
sudo journalctl -u uwsgi -f

# Nginx 访问日志
tail -f /var/log/nginx/shopping-react-access.log

# Nginx 错误日志
tail -f /var/log/nginx/shopping-react-error.log
```

### 常见问题

1. **uWSGI 无法启动**
   - 检查配置文件路径是否正确
   - 检查虚拟环境是否存在
   - 查看日志：`sudo journalctl -u uwsgi -n 50`

2. **Nginx 502 Bad Gateway**
   - 检查 uWSGI 是否运行：`sudo systemctl status uwsgi`
   - 检查端口 8096 是否监听：`netstat -tlnp | grep 8096`
   - 检查 Nginx 错误日志

3. **前端页面无法加载**
   - 检查 `dist/` 目录是否存在
   - 检查 Nginx `root` 配置是否正确
   - 检查文件权限

4. **依赖安装失败**
   - 确保 Python 版本正确：`python3.12 --version`
   - 确保 uv 已安装：`uv --version`
   - 检查网络连接

## 开发环境

### 后端开发

```bash
cd backend

# 激活虚拟环境
source .venv/bin/activate

# 或使用 uv
uv run python -m app.main

# 使用 uvicorn 开发服务器
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 前端开发

```bash
cd frontend

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

## 技术栈

### 前端
- **React 19**: UI 框架
- **TypeScript**: 类型安全
- **Vite**: 构建工具
- **React Router**: 路由管理
- **Tailwind CSS**: 样式框架

### 后端
- **FastAPI**: Web 框架
- **SQLAlchemy**: ORM
- **MySQL**: 数据库
- **uWSGI**: WSGI 服务器
- **uv**: Python 包管理

## 待办事项

### 绿界金流结帐功能

- **状态**: 待完成
- **说明**: 結帳使用綠界金流尚未完成，等待完成部署，再接續完成
- **当前进度**:
  - ✅ 后端 ECPay API 集成已完成
  - ✅ CheckMacValue 计算已修正
  - ✅ 前端结帐页面和 ECPay 表单提交已实现
  - ⏸️ 目前处于验证模式（不提交到绿界，只显示参数）
- **待完成**:
  - 部署完成后验证 CheckMacValue 是否正确
  - 取消注释前端代码，启用绿界提交
  - 测试完整的支付流程
  - 处理支付结果通知和订单状态更新

## 许可证

[添加您的许可证信息]

## 联系方式

[添加联系方式]

