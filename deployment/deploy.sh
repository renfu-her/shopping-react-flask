#!/bin/bash
# 部署脚本 - 使用 uv sync 安装依赖

set -e

PROJECT_DIR="/home/ai-tracks-shopping-react/htdocs/shopping-react.ai-tracks.com"
BACKEND_DIR="${PROJECT_DIR}/backend"

echo "开始部署后端..."

# 检查 uv 是否安装
if ! command -v uv &> /dev/null; then
    echo "错误: uv 未安装"
    echo "请先安装 uv: curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

# 进入后端目录
cd "${BACKEND_DIR}"

# 使用 uv sync 安装依赖
echo "使用 uv sync 安装依赖..."
uv sync

# 检查虚拟环境是否创建成功
if [ ! -d ".venv" ]; then
    echo "错误: 虚拟环境创建失败"
    exit 1
fi

echo "依赖安装完成"

# 检查 wsgi.py 是否存在
if [ ! -f "wsgi.py" ]; then
    echo "警告: wsgi.py 不存在，请确保文件已创建"
fi

# 测试导入应用
echo "测试应用导入..."
"${BACKEND_DIR}/.venv/bin/python" -c "from app.main import app; print('应用导入成功')"

echo "部署完成！"
echo ""
echo "下一步："
echo "1. 确保 uWSGI 配置正确"
echo "2. 重启 uWSGI: sudo systemctl restart uwsgi"
echo "3. 检查服务状态: sudo systemctl status uwsgi"

