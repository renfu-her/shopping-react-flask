"""
WSGI 應用入口文件（用於 uWSGI）
"""
from app.main import app

# 供 uWSGI 使用
application = app