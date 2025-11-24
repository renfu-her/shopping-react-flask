from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    database_url: str = "mysql+pymysql://root@localhost/shopping-react-flask"
    secret_key: str = "your-secret-key-change-in-production"
    session_secret_key: str = "your-session-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

