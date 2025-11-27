from sqlalchemy import Column, Integer, String, DateTime, Enum, Boolean, TypeDecorator
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


class EnumValueType(TypeDecorator):
    """自定义类型，将字符串值转换为枚举对象"""
    impl = String
    cache_ok = True
    
    def __init__(self, enum_class, length=20):
        super().__init__(length=length)
        self.enum_class = enum_class
    
    def process_bind_param(self, value, dialect):
        """将 Python 枚举值转换为数据库字符串"""
        if value is None:
            return None
        if isinstance(value, enum.Enum):
            return value.value
        # 如果已经是字符串，直接返回
        return str(value)
    
    def process_result_value(self, value, dialect):
        """将数据库字符串转换为 Python 枚举对象"""
        if value is None:
            return None
        # 直接通过值查找枚举（因为我们的枚举值就是字符串）
        try:
            return self.enum_class(value)
        except ValueError:
            # 如果值不匹配，返回原始值（字符串）
            # 这样至少不会抛出异常
            return value


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    # 使用自定义类型处理器，确保正确转换枚举值
    role = Column(
        EnumValueType(UserRole, length=20),
        default=UserRole.CUSTOMER,
        nullable=False,
        index=True
    )
    status = Column(
        EnumValueType(UserStatus, length=20),
        default=UserStatus.ACTIVE,
        nullable=False,
        index=True
    )
    phone = Column(String(20), nullable=True)
    address = Column(String(500), nullable=True)
    county = Column(String(50), nullable=True)  # 縣市
    district = Column(String(50), nullable=True)  # 區/鄉鎮
    zipcode = Column(String(10), nullable=True)  # 郵遞區號
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

