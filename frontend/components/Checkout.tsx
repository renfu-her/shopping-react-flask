import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CreditCard, Truck, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { createECPayOrder } from '../services/api';
import { getCounties, getDistricts, getZipcode } from '../utils/twzipcode';

interface CheckoutProps {
  onBack: () => void;
  onSubmit: () => void;
  total: number;
}

export const Checkout: React.FC<CheckoutProps> = ({ onBack, onSubmit, total }) => {
  const { user } = useApp();
  const [details, setDetails] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    county: user?.county || '',
    district: user?.district || '',
    zipcode: user?.zipcode || '',
    payment_method: 'Credit'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-fill from user profile
  useEffect(() => {
    if (user) {
      setDetails(prev => ({
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
        county: user.county || prev.county,
        district: user.district || prev.district,
        zipcode: user.zipcode || prev.zipcode,
        payment_method: prev.payment_method
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'county') {
      // 當縣市改變時，清空區鄉鎮和郵遞區號
      setDetails(prev => ({
        ...prev,
        county: value,
        district: '',
        zipcode: ''
      }));
    } else if (name === 'district') {
      // 當區鄉鎮改變時，自動填入郵遞區號
      const zipcode = getZipcode(details.county, value);
      setDetails(prev => ({
        ...prev,
        district: value,
        zipcode: zipcode || ''
      }));
    } else {
      setDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 組合縣市和區鄉鎮為完整的城市地址
      const shippingCity = details.county && details.district 
        ? `${details.county}${details.district}`
        : details.county || details.district || '';
      
      // 創建綠界訂單（會自動創建訂單並清空購物車）
      const ecpayOrder = await createECPayOrder({
        shipping_name: details.name,
        shipping_address: details.address,
        shipping_city: shippingCity,
        shipping_zip: details.zipcode,
        payment_method: details.payment_method
      });

      // 清空本地購物車狀態（後端已經清空，這裡同步前端狀態）
      onSubmit();

      // 創建隱藏表單並提交到綠界支付頁面
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = ecpayOrder.form_url;
      form.style.display = 'none';

      // 添加所有表單字段
      Object.entries(ecpayOrder.form_data).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      
      // 注意：提交後會跳轉到綠界支付頁面，支付完成後會自動跳轉到 /shop-finish
      // 不需要在這裡設置 loading = false，因為頁面會跳轉
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
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input 
                      type="tel"
                      name="phone" 
                      value={details.phone} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                      placeholder="0912345678" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">County (縣市)</label>
                    <select
                      required
                      name="county"
                      value={details.county}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="">Select County</option>
                      {getCounties().map(county => (
                        <option key={county} value={county}>{county}</option>
                      ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District (區鄉鎮)</label>
                    <select
                      required
                      name="district"
                      value={details.district}
                      onChange={handleChange}
                      disabled={!details.county}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select District</option>
                      {details.county && getDistricts(details.county).map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code (郵遞區號)</label>
                    <input 
                      required
                      type="text"
                      name="zipcode" 
                      value={details.zipcode} 
                      onChange={handleChange} 
                      readOnly
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all cursor-not-allowed" 
                      placeholder="Auto-filled" 
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input 
                      required 
                      name="address" 
                      value={details.address} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                      placeholder="Street address" 
                    />
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