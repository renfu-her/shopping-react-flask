from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import uuid
import os
from pathlib import Path
from PIL import Image
import io
from typing import Optional

from app.database import get_db
from app.dependencies import get_current_admin
from app.models.user import User
from app.config import settings

router = APIRouter()

# 确保上传目录存在（相对于项目根目录）
BASE_DIR = Path(__file__).parent.parent.parent
UPLOAD_DIR = BASE_DIR / "static" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# 允许的图片格式
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def convert_to_webp(image_file: UploadFile) -> tuple[bytes, str]:
    """将图片转换为 webp 格式"""
    try:
        # 读取图片数据
        image_data = image_file.file.read()
        image_file.file.seek(0)  # 重置文件指针
        
        # 使用 PIL 打开图片
        image = Image.open(io.BytesIO(image_data))
        
        # 如果是 RGBA 模式，转换为 RGB（webp 支持透明度，但为了兼容性可以转换）
        if image.mode in ("RGBA", "LA", "P"):
            # 保持透明度，使用 RGBA
            if image.mode == "P":
                image = image.convert("RGBA")
        elif image.mode != "RGB":
            image = image.convert("RGB")
        
        # 转换为 webp
        webp_buffer = io.BytesIO()
        image.save(webp_buffer, format="WEBP", quality=85, method=6)
        webp_data = webp_buffer.getvalue()
        
        # 生成 UUID 文件名
        filename = f"{uuid.uuid4()}.webp"
        
        return webp_data, filename
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"图片处理失败: {str(e)}"
        )


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """上传图片并转换为 webp 格式"""
    # 检查文件扩展名
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"不支持的文件格式。允许的格式: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # 检查文件大小（限制为 10MB）
    file.file.seek(0, 2)  # 移动到文件末尾
    file_size = file.file.tell()
    file.file.seek(0)  # 重置文件指针
    
    if file_size > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="文件大小不能超过 10MB"
        )
    
    try:
        # 转换为 webp
        webp_data, filename = convert_to_webp(file)
        
        # 保存文件
        file_path = UPLOAD_DIR / filename
        with open(file_path, "wb") as f:
            f.write(webp_data)
        
        # 返回文件 URL（使用 /backend/static/ 路徑）
        file_url = f"/backend/static/uploads/{filename}"
        
        return {
            "url": file_url,
            "filename": filename,
            "size": len(webp_data)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"上传失败: {str(e)}"
        )

