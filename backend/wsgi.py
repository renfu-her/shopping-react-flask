"""
WSGI/ASGI adapter for uWSGI
FastAPI 应用通过 uWSGI 运行

注意：FastAPI 是 ASGI 应用，需要通过适配器转换为 WSGI
如果 uWSGI 支持 ASGI 插件，建议使用 ASGI 模式
否则使用 asgiref 的 WSGIToASGIAdapter
"""
try:
    # 尝试使用 asgiref 适配器（需要安装 asgiref）
    from asgiref.wsgi import WsgiToAsgi
    from app.main import app
    
    # 将 ASGI 应用转换为 WSGI
    application = WsgiToAsgi(app)
except ImportError:
    # 如果没有 asgiref，尝试直接使用（可能不工作）
    # 建议安装: pip install asgiref
    from app.main import app
    application = app

