"""
初始化管理员账户脚本
创建默认管理员：admin@admin.com / admin123
"""
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User, UserRole, UserStatus
from app.core.security import get_password_hash
import logging

logger = logging.getLogger(__name__)


def init_admin_user():
    """创建默认管理员账户"""
    db: Session = SessionLocal()
    try:
        # 检查是否已存在管理员账户
        existing_admin = db.query(User).filter(
            User.email == "admin@admin.com"
        ).first()
        
        if existing_admin:
            logger.info("管理员账户已存在，跳过创建")
            # 更新现有账户确保是管理员角色
            if existing_admin.role != UserRole.ADMIN:
                existing_admin.role = UserRole.ADMIN
                existing_admin.status = UserStatus.ACTIVE
                db.commit()
                logger.info("已更新现有账户为管理员角色")
            return
        
        # 创建新管理员账户
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
        
        logger.info(f"管理员账户创建成功！")
        logger.info(f"  邮箱: admin@admin.com")
        logger.info(f"  密码: admin123")
        logger.info(f"  角色: {admin_user.role.value}")
        
    except Exception as e:
        logger.error(f"创建管理员账户失败: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    print("正在创建默认管理员账户...")
    init_admin_user()
    print("完成！")

