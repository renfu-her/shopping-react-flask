from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings
import logging
import re

logger = logging.getLogger(__name__)

# Base class for models
Base = declarative_base()


def ensure_database_exists():
    """確保資料庫存在，如果不存在則創建"""
    db_name = settings.get_database_name()
    server_url = settings.get_server_url()
    
    # 驗證資料庫名稱（只允許字母、數字、下劃線和連字符）
    if not re.match(r'^[a-zA-Z0-9_-]+$', db_name):
        raise ValueError(f"無效的資料庫名稱: {db_name}")
    
    # 連接到 MySQL 伺服器（不指定資料庫）
    server_engine = create_engine(
        server_url,
        pool_pre_ping=True,
        echo=False
    )
    
    try:
        with server_engine.connect() as conn:
            # 檢查資料庫是否存在（使用參數化查詢）
            result = conn.execute(
                text("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = :db_name"),
                {"db_name": db_name}
            )
            exists = result.fetchone() is not None
            
            if not exists:
                # 創建資料庫（使用反引號防止特殊字符問題）
                logger.info(f"資料庫 '{db_name}' 不存在，正在創建...")
                # 注意：CREATE DATABASE 不支援參數化查詢，但我們已經驗證了 db_name 的安全性
                conn.execute(text(f"CREATE DATABASE `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
                conn.commit()
                logger.info(f"資料庫 '{db_name}' 創建成功")
            else:
                logger.info(f"資料庫 '{db_name}' 已存在")
    except Exception as e:
        logger.error(f"檢查/創建資料庫時發生錯誤: {e}")
        raise
    finally:
        server_engine.dispose()


# 確保資料庫存在
try:
    ensure_database_exists()
except Exception as e:
    logger.warning(f"無法自動創建資料庫，將嘗試直接連接: {e}")

# Create database engine
engine = create_engine(
    settings.get_database_url(),
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False  # Set to True for SQL query logging
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

