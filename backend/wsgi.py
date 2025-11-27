"""
FastAPI 應用入口文件

可以直接運行此文件進行測試：
  python wsgi.py
  或
  uv run python wsgi.py
"""
from app.main import app

# 用於 uWSGI（如果需要）
# 注意：FastAPI 是 ASGI 應用，uWSGI 需要使用 ASGI 插件或 gunicorn + uvicorn
application = app

if __name__ == "__main__":
    # 直接運行模式：使用 uvicorn 運行 FastAPI（用於測試）
    import uvicorn
    
    print("=" * 60)
    print("啟動 FastAPI 應用（開發模式）")
    print("=" * 60)
    print("訪問地址:")
    print("  - API 文檔: http://localhost:8000/docs")
    print("  - ReDoc: http://localhost:8000/redoc")
    print("  - 後台管理: http://localhost:8000/backend")
    print("=" * 60)
    print("按 Ctrl+C 停止服務器")
    print("=" * 60)
    
    # 使用 uvicorn 運行（使用導入字符串以支持 reload）
    uvicorn.run(
        "app.main:app",  # 使用導入字符串而不是應用對象
        host="0.0.0.0",
        port=8000,
        reload=True,  # 開發模式：自動重載
        log_level="info"
    )