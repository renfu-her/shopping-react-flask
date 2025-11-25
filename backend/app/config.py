from pydantic_settings import BaseSettings
from typing import Optional
from urllib.parse import urlparse, urlunparse


class Settings(BaseSettings):
    # Database Configuration
    # 方式 1: 使用完整的資料庫 URL（優先）
    database_url: Optional[str] = None
    
    # 方式 2: 分別設定資料庫參數（如果未設定 DATABASE_URL）
    db_host: str = "localhost"
    db_port: int = 3306
    db_user: str = "root"
    db_password: str = ""
    db_name: str = "shopping-react-flask"
    
    # Security Configuration
    secret_key: str = "your-secret-key-change-in-production"
    session_secret_key: str = "your-session-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    def get_server_url(self) -> str:
        """獲取 MySQL 伺服器 URL（不包含資料庫名稱），用於創建資料庫"""
        if self.database_url:
            # 使用 urllib.parse 解析 URL
            parsed = urlparse(self.database_url)
            
            # 構建不包含路徑（資料庫名稱）的 URL
            # 格式: scheme://netloc
            server_url = urlunparse((
                parsed.scheme,  # mysql+pymysql
                parsed.netloc,   # user:password@host:port
                "",              # 路徑設為空（移除資料庫名稱）
                "",              # params
                "",              # query
                ""               # fragment
            ))
            return server_url
        
        # 構建伺服器 URL（不包含資料庫名稱）
        password_part = f":{self.db_password}" if self.db_password else ""
        return f"mysql+pymysql://{self.db_user}{password_part}@{self.db_host}:{self.db_port}"
    
    def get_database_url(self) -> str:
        """獲取資料庫 URL，優先使用 DATABASE_URL，否則使用分開的參數構建"""
        if self.database_url:
            return self.database_url
        
        # 構建資料庫 URL
        password_part = f":{self.db_password}" if self.db_password else ""
        return f"mysql+pymysql://{self.db_user}{password_part}@{self.db_host}:{self.db_port}/{self.db_name}"
    
    def get_database_name(self) -> str:
        """獲取資料庫名稱"""
        if self.database_url:
            # 使用 urllib.parse 解析 URL
            parsed = urlparse(self.database_url)
            
            # 從路徑中提取資料庫名稱（移除開頭的 /）
            db_name = parsed.path.lstrip("/")
            
            # 移除可能的查詢參數和片段（雖然通常不會出現在路徑中）
            if "?" in db_name:
                db_name = db_name.split("?")[0]
            if "#" in db_name:
                db_name = db_name.split("#")[0]
            
            if db_name:  # 確保不是空字串
                return db_name
            
            # 如果無法從 URL 中提取，返回預設值
            return "shopping-react-flask"
        
        return self.db_name
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

