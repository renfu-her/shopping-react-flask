from sqlalchemy import Column, Integer, String, DateTime, Enum, Boolean
from sqlalchemy.sql import func
import enum
from app.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"  # 管理員
    STORE_MANAGER = "store_manager"  # 商店管理者
    CUSTOMER = "customer"  # 客戶


class UserStatus(str, enum.Enum):
    ACTIVE = "active"  # 啟用
    INACTIVE = "inactive"  # 停用


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER, nullable=False, index=True)
    status = Column(Enum(UserStatus), default=UserStatus.ACTIVE, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

