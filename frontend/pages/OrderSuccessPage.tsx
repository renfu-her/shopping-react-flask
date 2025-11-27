import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OrderSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCart } = useApp();
  const orderId = searchParams.get('order_id');

  // 確保購物車已清空
  useEffect(() => {
    setCart([]);
  }, [setCart]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4 animate-in zoom-in duration-500">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle size={48} className="text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">訂單確認成功！</h2>
      {orderId && (
        <p className="text-indigo-600 font-semibold mb-2">
          訂單編號: #{orderId}
        </p>
      )}
      <p className="text-gray-500 max-w-md mb-8">
        感謝您的購買！您的訂單已成功建立。我們已將訂單確認資訊發送至您的電子郵件信箱。訂單將盡快為您處理並出貨。
      </p>
      <div className="flex gap-4">
        <button 
          onClick={() => navigate('/')}
          className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg"
        >
          繼續購物
        </button>
        <button 
          onClick={() => navigate('/profile')}
          className="bg-gray-200 text-gray-700 px-8 py-3 rounded-full font-bold hover:bg-gray-300 transition-colors"
        >
          查看訂單
        </button>
      </div>
    </div>
  );
};

