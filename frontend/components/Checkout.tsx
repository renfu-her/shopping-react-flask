import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CreditCard, Truck, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { createECPayOrder } from '../services/api';

interface CheckoutProps {
  onBack: () => void;
  onSubmit: () => void;
  total: number;
}

export const Checkout: React.FC<CheckoutProps> = ({ onBack, onSubmit, total }) => {
  const { user } = useApp();
  const [details, setDetails] = useState({
    name: user?.name || '',
    address: '',
    city: '',
    zip: '',
    payment_method: 'Credit'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-fill name from user
  useEffect(() => {
    if (user?.name && !details.name) {
      setDetails(prev => ({ ...prev, name: user.name }));
    }
  }, [user, details.name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 创建绿界订单
      const ecpayOrder = await createECPayOrder({
        shipping_name: details.name,
        shipping_address: details.address,
        shipping_city: details.city,
        shipping_zip: details.zip,
        payment_method: details.payment_method
      });

      // 创建隐藏表单并提交到绿界
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = ecpayOrder.form_url;
      form.style.display = 'none';

      // 添加所有表单字段
      Object.entries(ecpayOrder.form_data).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

      // 清空购物车（订单已创建）
      onSubmit();
    } catch (err: any) {
      setError(err.message || 'Failed to create order. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 lg:p-8">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft size={20} className="mr-2" />
        Back to Cart
      </button>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 p-6 border-b border-gray-100">
           <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
           <p className="text-gray-500 text-sm mt-1">Complete your order details below</p>
        </div>

        {error && (
          <div className="p-4 m-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          
          {/* Section: Shipping */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-indigo-600 font-semibold">
                <Truck size={20} />
                <h3>Shipping Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      required 
                      name="name" 
                      value={details.name} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                      placeholder="John Doe" 
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input required name="address" value={details.address} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="123 Main St" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input required name="city" value={details.city} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="New York" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
                    <input required name="zip" value={details.zip} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="10001" />
                </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section: Payment */}
          <div>
             <div className="flex items-center gap-2 mb-4 text-indigo-600 font-semibold">
                <CreditCard size={20} />
                <h3>Payment Method</h3>
            </div>
            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Choose Payment Method</label>
                 <select 
                    required 
                    name="payment_method" 
                    value={details.payment_method} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                 >
                    <option value="Credit">信用卡</option>
                    <option value="WebATM">網路 ATM</option>
                    <option value="ATM">ATM 自動櫃員機</option>
                    <option value="CVS">超商代碼</option>
                    <option value="BARCODE">超商條碼</option>
                 </select>
            </div>
            <div className="flex items-center mt-4 text-xs text-gray-500 gap-2">
                <ShieldCheck size={16} className="text-green-500"/>
                <span>Payments are processed securely by 綠界科技 (ECPay).</span>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-[0.99]"
            >
              {loading ? 'Processing...' : `Pay $${(total * 1.08).toFixed(2)}`}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};