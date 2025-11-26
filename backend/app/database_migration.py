"""
数据库迁移脚本 - 添加 User 表的 role 和 status 字段，以及 ProductCategory 表的 sort_order 字段，以及 Product 表的 is_hot 字段
"""
from sqlalchemy import create_engine, text, inspect
from app.config import settings
import logging

logger = logging.getLogger(__name__)


def add_user_role_status_columns():
    """为 users 表添加 role 和 status 字段"""
    engine = create_engine(
        settings.get_database_url(),
        pool_pre_ping=True,
        echo=False
    )
    
    try:
        with engine.connect() as conn:
            # 检查表是否存在
            inspector = inspect(engine)
            if 'users' not in inspector.get_table_names():
                logger.warning("users 表不存在，跳过迁移")
                return
            
            # 检查字段是否已存在
            columns = [col['name'] for col in inspector.get_columns('users')]
            
            # 添加 role 字段（如果不存在）
            if 'role' not in columns:
                logger.info("添加 role 字段...")
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN role ENUM('admin', 'store_manager', 'customer') 
                    NOT NULL DEFAULT 'customer' 
                    AFTER password_hash
                """))
                # 检查索引是否已存在
                indexes = [idx['name'] for idx in inspector.get_indexes('users')]
                if 'idx_users_role' not in indexes:
                    conn.execute(text("ALTER TABLE users ADD INDEX idx_users_role (role)"))
                conn.commit()
                logger.info("role 字段添加成功")
            else:
                logger.info("role 字段已存在，跳过")
            
            # 添加 status 字段（如果不存在）
            if 'status' not in columns:
                logger.info("添加 status 字段...")
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN status ENUM('active', 'inactive') 
                    NOT NULL DEFAULT 'active' 
                    AFTER role
                """))
                # 检查索引是否已存在
                indexes = [idx['name'] for idx in inspector.get_indexes('users')]
                if 'idx_users_status' not in indexes:
                    conn.execute(text("ALTER TABLE users ADD INDEX idx_users_status (status)"))
                conn.commit()
                logger.info("status 字段添加成功")
            else:
                logger.info("status 字段已存在，跳过")
                
    except Exception as e:
        logger.error(f"迁移失败: {e}")
        raise
    finally:
        engine.dispose()


def add_category_sort_order_column():
    """为 product_categories 表添加 sort_order 字段"""
    engine = create_engine(
        settings.get_database_url(),
        pool_pre_ping=True,
        echo=False
    )
    
    try:
        with engine.connect() as conn:
            # 检查表是否存在
            inspector = inspect(engine)
            if 'product_categories' not in inspector.get_table_names():
                logger.warning("product_categories 表不存在，跳过迁移")
                return
            
            # 检查字段是否已存在
            columns = [col['name'] for col in inspector.get_columns('product_categories')]
            
            # 添加 sort_order 字段（如果不存在）
            if 'sort_order' not in columns:
                logger.info("添加 sort_order 字段...")
                conn.execute(text("""
                    ALTER TABLE product_categories 
                    ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0
                    AFTER description
                """))
                conn.commit()
                logger.info("sort_order 字段添加成功")
                
                # 检查索引是否已存在
                indexes = [idx['name'] for idx in inspector.get_indexes('product_categories')]
                if 'ix_product_categories_sort_order' not in indexes:
                    logger.info("添加 sort_order 索引...")
                    conn.execute(text("CREATE INDEX ix_product_categories_sort_order ON product_categories(sort_order)"))
                    conn.commit()
                    logger.info("sort_order 索引添加成功")
                else:
                    logger.info("sort_order 索引已存在，跳过")
            else:
                logger.info("sort_order 字段已存在，跳过")
                
    except Exception as e:
        logger.error(f"迁移失败: {e}")
        raise
    finally:
        engine.dispose()


def add_product_is_hot_column():
    """为 products 表添加 is_hot 字段"""
    engine = create_engine(
        settings.get_database_url(),
        pool_pre_ping=True,
        echo=False
    )
    
    try:
        with engine.begin() as conn:
            # 检查表是否存在
            inspector = inspect(engine)
            if 'products' not in inspector.get_table_names():
                logger.warning("products 表不存在，跳过迁移")
                return
            
            # 检查字段是否已存在
            columns = [col['name'] for col in inspector.get_columns('products')]
            
            # 添加 is_hot 字段（如果不存在）
            if 'is_hot' not in columns:
                logger.info("添加 is_hot 字段...")
                conn.execute(text("""
                    ALTER TABLE products 
                    ADD COLUMN is_hot BOOLEAN NOT NULL DEFAULT FALSE
                    AFTER is_active
                """))
                logger.info("is_hot 字段添加成功")
            else:
                logger.info("is_hot 字段已存在，跳过")
                
    except Exception as e:
        logger.error(f"迁移失败: {e}")
        raise
    finally:
        engine.dispose()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    add_user_role_status_columns()
    add_category_sort_order_column()
    add_product_is_hot_column()
    print("迁移完成！")

