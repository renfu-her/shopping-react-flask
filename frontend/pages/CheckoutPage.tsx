import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Checkout } from '../components/Checkout';
import { useApp } from '../context/AppContext';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, user, isLoadingUser } = useApp();

  const handleCheckoutSubmit = () => {
    // 购物车会在订单创建成功后由后端清空
    // 这里不需要手动清空，因为会跳转到绿界支付页面
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Show loading state while verifying token
  if (isLoadingUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Verifying authentication...</p>
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
  if (cart.length === 0) {
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

