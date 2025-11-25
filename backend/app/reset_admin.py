"""
重置管理员账户脚本
删除现有的 admin@admin.com 账户，然后重新创建
"""
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from app.models.user import UserRole, UserStatus
import logging

logger = logging.getLogger(__name__)


def reset_admin_user():
    """删除并重新创建管理员账户"""
    db: Session = SessionLocal()
    try:
        # 查找并删除现有的 admin 账户
        existing_admin = db.query(User).filter(
            User.email == "admin@admin.com"
        ).first()
        
        if existing_admin:
            logger.info(f"找到现有管理员账户 (ID: {existing_admin.id})，正在删除...")
            db.delete(existing_admin)
            db.commit()
            logger.info("管理员账户已删除")
        else:
            logger.info("未找到现有管理员账户")
        
        # 创建新的管理员账户
        logger.info("正在创建新的管理员账户...")
        admin_user = User(
            name="admin",
            email="admin@admin.com",
            password_hash=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        logger.info("管理员账户创建成功！")
        logger.info(f"  ID: {admin_user.id}")
        logger.info(f"  姓名: {admin_user.name}")
        logger.info(f"  邮箱: {admin_user.email}")
        logger.info(f"  密码: admin123")
        logger.info(f"  角色: {admin_user.role.value}")
        logger.info(f"  状态: {admin_user.status.value}")
        
    except Exception as e:
        logger.error(f"重置管理员账户失败: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    print("正在重置管理员账户...")
    print("=" * 50)
    reset_admin_user()
    print("=" * 50)
    print("完成！")

