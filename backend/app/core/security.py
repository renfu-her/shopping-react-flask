from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from app.config import settings

# 配置密码上下文
# 使用 pbkdf2_sha256 作为主要方案（更兼容，无 72 字节限制）
# bcrypt 作为备选方案
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256", "bcrypt"],
    default="pbkdf2_sha256",
    deprecated="auto",
    pbkdf2_sha256__default_rounds=29000
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """驗證密碼"""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # 如果验证失败，返回 False
        return False


def get_password_hash(password: str) -> str:
    """生成密碼雜湊"""
    # 使用 pbkdf2_sha256，没有 72 字节限制
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """創建 JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """解碼 JWT token"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        return None

