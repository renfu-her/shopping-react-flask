import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Checkout } from '../components/Checkout';
import { useApp } from '../context/AppContext';
import { getCart, CartResponse } from '../services/api';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoadingUser, setCart } = useApp();
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCart = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await getCart();
        setCartData(data);
        // 更新 AppContext 中的購物車
        const cartItems = data.items.map(item => ({
          ...item.product,
          quantity: item.quantity,
        }));
        setCart(cartItems);
      } catch (error) {
        console.error('Error loading cart:', error);
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };

    if (!isLoadingUser && user) {
      loadCart();
    }
  }, [user, isLoadingUser, navigate, setCart]);

  const handleCheckoutSubmit = () => {
    // 清空本地購物車狀態（後端已經在創建訂單時清空購物車）
    setCart([]);
  };

  const total = cartData?.total || 0;

  // Show loading state while verifying authentication or loading cart
  if (isLoadingUser || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // 如果用户未登录，重定向到登录页面
  if (!user) {
    navigate('/sign');
    return null;
  }

  // 如果购物车为空，重定向到购物车页面
  if (!cartData || cartData.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <Checkout 
      onBack={() => navigate('/cart')}
      onSubmit={handleCheckoutSubmit}
      total={total}
    />
  );
};

