from fastapi import APIRouter, Depends, HTTPException, status, Request, Form
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import hashlib
import urllib.parse
from app.database import get_db
from app.models.user import User
from app.models.order import Order, OrderStatus
from app.models.order_item import OrderItem
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.dependencies import get_current_user
from app.config import settings
from pydantic import BaseModel

router = APIRouter(prefix="/api/ecpay", tags=["ecpay"])


# 绿界金流配置（测试环境）
ECPAY_MERCHANT_ID = "3002607"  # 测试特店编号
ECPAY_HASH_KEY = "pwFHCqoQZGmho4w6"  # 测试 HashKey
ECPAY_HASH_IV = "EkRm7iFT261dpevs"  # 测试 HashIV
ECPAY_API_URL = "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5"  # 测试环境
# 正式环境请使用: https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5


class ECPayOrderRequest(BaseModel):
    shipping_name: str
    shipping_address: str
    shipping_city: str
    shipping_zip: str
    payment_method: Optional[str] = "Credit"  # Credit, WebATM, ATM, CVS, BARCODE


def generate_check_value(params: dict, hash_key: str, hash_iv: str) -> str:
    """
    生成绿界金流检查码 (CheckMacValue)
    参考: https://developers.ecpay.com.tw/?p=29998
    """
    # 1) 如果資料中有 null，必需轉成空字串
    params = {k: str(v) if v is not None else "" for k, v in params.items()}
    
    # 2) 如果資料中有 CheckMacValue 必需先移除
    params.pop("CheckMacValue", None)
    
    # 3) 將鍵值由 A-Z 排序（不区分大小写）
    sorted_params = sorted(params.items(), key=lambda x: x[0].lower())
    
    # 4) 將陣列轉為 query 字串
    # PHP: urldecode(http_build_query($params))
    # http_build_query 会自动编码，然后 urldecode 会解码
    # 在 Python 中，我们直接构建未编码的 query string
    query_parts = []
    for k, v in sorted_params:
        query_parts.append(f"{k}={v}")
    query_string = "&".join(query_parts)
    
    # 5) 最前方加入 HashKey，最後方加入 HashIV
    check_string = f"HashKey={hash_key}&{query_string}&HashIV={hash_iv}"
    
    # 6) 做 URLEncode
    encoded_string = urllib.parse.quote(check_string, safe="")
    
    # 7) 轉為全小寫
    encoded_string = encoded_string.lower()
    
    # 8) 轉換特定字元（與 .NET 相符的字元）
    # 这些字符在 URLEncode 后需要还原为原始字符
    char_replacements = {
        "%2d": "-",
        "%5f": "_",
        "%2e": ".",
        "%21": "!",
        "%2a": "*",
        "%28": "(",
        "%29": ")"
    }
    for encoded_char, original_char in char_replacements.items():
        encoded_string = encoded_string.replace(encoded_char, original_char)
    
    # 9) 進行 SHA256 編碼
    sha256_hash = hashlib.sha256(encoded_string.encode('utf-8')).hexdigest()
    
    # 10) 轉為全大寫後回傳
    return sha256_hash.upper()


@router.post("/create-order")
def create_ecpay_order(
    order_data: ECPayOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建订单并生成绿界金流表单数据"""
    # 获取用户购物车
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    
    if not cart or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )
    
    # 计算总金额
    total_amount = sum(item.product.price * item.quantity for item in cart.items)
    
    # 检查库存
    for item in cart.items:
        if item.product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product: {item.product.title}"
            )
    
    # 创建订单
    new_order = Order(
        user_id=current_user.id,
        total_amount=total_amount,
        status=OrderStatus.PENDING,
        shipping_name=order_data.shipping_name,
        shipping_address=order_data.shipping_address,
        shipping_city=order_data.shipping_city,
        shipping_zip=order_data.shipping_zip,
        payment_method=order_data.payment_method or "Credit"
    )
    db.add(new_order)
    db.flush()  # 获取 order.id
    
    # 创建订单项目並更新庫存
    item_names = []
    for cart_item in cart.items:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            price=cart_item.product.price
        )
        db.add(order_item)
        item_names.append(f"{cart_item.product.title} x{cart_item.quantity}")
        
        # 更新產品庫存
        cart_item.product.stock -= cart_item.quantity
    
    # 清空購物車
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    
    db.commit()
    db.refresh(new_order)
    
    # 生成订单编号（使用订单ID）
    merchant_trade_no = f"EC{new_order.id:08d}{int(datetime.now().timestamp())}"
    
    # 构建商品名称
    item_name = "#".join(item_names[:10])  # 最多10个商品
    
    # 构建绿界金流参数
    params = {
        "MerchantID": ECPAY_MERCHANT_ID,
        "MerchantTradeNo": merchant_trade_no,
        "MerchantTradeDate": datetime.now().strftime("%Y/%m/%d %H:%M:%S"),
        "PaymentType": "aio",
        "TotalAmount": str(int(total_amount)),
        "TradeDesc": "Lumina Shop Order",
        "ItemName": item_name,
        "ReturnURL": f"{settings.backend_url}/api/ecpay/return",  # 付款结果通知URL
        "OrderResultURL": f"{settings.frontend_url}/shop-finish?order_id={new_order.id}",  # 付款完成跳转URL
        "ChoosePayment": order_data.payment_method or "Credit",
        "EncryptType": "1",  # SHA256
    }
    
    # 添加客户信息
    params["CustomerName"] = order_data.shipping_name
    params["CustomerPhone"] = ""  # 可选
    params["CustomerEmail"] = current_user.email
    
    # 生成检查码
    check_value = generate_check_value(params, ECPAY_HASH_KEY, ECPAY_HASH_IV)
    params["CheckMacValue"] = check_value
    
    return {
        "order_id": new_order.id,
        "merchant_trade_no": merchant_trade_no,
        "form_data": params,
        "form_url": ECPAY_API_URL
    }


@router.post("/return")
async def ecpay_return(
    request: Request,
    db: Session = Depends(get_db)
):
    """处理绿界金流付款结果通知"""
    # 获取表单数据
    form_data = await request.form()
    params = dict(form_data)
    
    # TODO: 验证 CheckMacValue
    # TODO: 根据 RtnCode 更新订单状态
    # 如果 RtnCode == "1" 表示付款成功，更新订单状态为 PROCESSING
    
    # 返回 "1|OK" 给绿界（必须返回此格式）
    return PlainTextResponse("1|OK")

