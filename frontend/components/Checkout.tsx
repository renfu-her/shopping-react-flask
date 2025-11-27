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
  const [ecpayData, setEcpayData] = useState<any>(null);
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

      // 暫時不提交到綠界，先顯示參數和 CheckMacValue 用於驗證
      // 將數據存儲到狀態中，在頁面上顯示
      const paramsForCheck = { ...ecpayOrder.form_data };
      delete paramsForCheck.CheckMacValue;
      
      setEcpayData({
        order_id: ecpayOrder.order_id,
        merchant_trade_no: ecpayOrder.merchant_trade_no,
        form_url: ecpayOrder.form_url,
        check_mac_value: ecpayOrder.form_data.CheckMacValue,
        all_params: ecpayOrder.form_data,
        params_for_check: paramsForCheck
      });

      // 同時輸出到控制台
      console.log('=== ECPay Order Data ===');
      console.log('Order ID:', ecpayOrder.order_id);
      console.log('Merchant Trade No:', ecpayOrder.merchant_trade_no);
      console.log('Form URL:', ecpayOrder.form_url);
      console.log('\n=== Form Data (Parameters) ===');
      Object.entries(ecpayOrder.form_data).forEach(([key, value]) => {
        console.log(`${key}:`, value);
      });
      console.log('\n=== CheckMacValue ===');
      console.log('CheckMacValue:', ecpayOrder.form_data.CheckMacValue);
      console.log('\n=== All Parameters (for CheckMacValue calculation) ===');
      console.log(JSON.stringify(paramsForCheck, null, 2));

      // 清空本地購物車狀態（後端已經清空，這裡同步前端狀態）
      onSubmit();
      setLoading(false);

      // TODO: 驗證 CheckMacValue 正確後，取消下面的註解以啟用綠界提交
      /*
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
      */
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

        {ecpayData && (
          <div className="p-6 m-6 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="text-lg font-bold text-blue-900 mb-4">ECPay 訂單數據 (驗證模式)</h3>
            <p className="text-sm text-blue-700 mb-4">根據綠界官方文檔：<a href="https://developers.ecpay.com.tw/?p=2864" target="_blank" rel="noopener noreferrer" className="underline">全方位金流付款</a></p>
            
            <div className="space-y-4">
              {/* 必填參數 - 按照官方文檔順序 */}
              <div className="border-t border-blue-300 pt-4">
                <h4 className="text-sm font-bold text-blue-900 mb-3">必填參數 (Required Parameters)</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-blue-800 mb-1">
                      MerchantID <span className="text-red-500">*</span>
                      <span className="text-gray-500 font-normal ml-2">(特店編號)</span>
                    </label>
                    <div className="bg-white p-2 rounded border border-blue-300 text-sm font-mono">{ecpayData.all_params.MerchantID}</div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-blue-800 mb-1">
                      MerchantTradeNo <span className="text-red-500">*</span>
                      <span className="text-gray-500 font-normal ml-2">(特店訂單編號)</span>
                    </label>
                    <div className="bg-white p-2 rounded border border-blue-300 text-sm font-mono">{ecpayData.all_params.MerchantTradeNo}</div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-blue-800 mb-1">
                      MerchantTradeDate <span className="text-red-500">*</span>
                      <span className="text-gray-500 font-normal ml-2">(特店交易時間，格式：yyyy/MM/dd HH:mm:ss)</span>
                    </label>
                    <div className="bg-white p-2 rounded border border-blue-300 text-sm font-mono">{ecpayData.all_params.MerchantTradeDate}</div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-blue-800 mb-1">
                      PaymentType <span className="text-red-500">*</span>
                      <span className="text-gray-500 font-normal ml-2">(交易類型，固定為 aio)</span>
                    </label>
                    <div className="bg-white p-2 rounded border border-blue-300 text-sm font-mono">{ecpayData.all_params.PaymentType}</div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-blue-800 mb-1">
                      TotalAmount <span className="text-red-500">*</span>
                      <span className="text-gray-500 font-normal ml-2">(交易金額，整數)</span>
                    </label>
                    <div className="bg-white p-2 rounded border border-blue-300 text-sm font-mono">{ecpayData.all_params.TotalAmount}</div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-blue-800 mb-1">
                      TradeDesc <span className="text-red-500">*</span>
                      <span className="text-gray-500 font-normal ml-2">(交易描述)</span>
                    </label>
                    <div className="bg-white p-2 rounded border border-blue-300 text-sm font-mono">{ecpayData.all_params.TradeDesc}</div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-blue-800 mb-1">
                      ItemName <span className="text-red-500">*</span>
                      <span className="text-gray-500 font-normal ml-2">(商品名稱，多筆用 # 分隔)</span>
                    </label>
                    <div className="bg-white p-2 rounded border border-blue-300 text-sm font-mono break-words">{ecpayData.all_params.ItemName}</div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-blue-800 mb-1">
                      ReturnURL <span className="text-red-500">*</span>
                      <span className="text-gray-500 font-normal ml-2">(付款完成通知回傳網址)</span>
                    </label>
                    <div className="bg-white p-2 rounded border border-blue-300 text-sm font-mono break-all">{ecpayData.all_params.ReturnURL}</div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-blue-800 mb-1">
                      ChoosePayment <span className="text-red-500">*</span>
                      <span className="text-gray-500 font-normal ml-2">(選擇預設付款方式)</span>
                    </label>
                    <div className="bg-white p-2 rounded border border-blue-300 text-sm font-mono">{ecpayData.all_params.ChoosePayment}</div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-blue-800 mb-1">
                      EncryptType <span className="text-red-500">*</span>
                      <span className="text-gray-500 font-normal ml-2">(CheckMacValue加密類型，固定為 1)</span>
                    </label>
                    <div className="bg-white p-2 rounded border border-blue-300 text-sm font-mono">{ecpayData.all_params.EncryptType}</div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-blue-800 mb-1">
                      CheckMacValue <span className="text-red-500">*</span>
                      <span className="text-gray-500 font-normal ml-2">(檢查碼)</span>
                    </label>
                    <div className="bg-yellow-50 p-3 rounded border-2 border-yellow-400 text-sm font-mono break-all font-bold">
                      {ecpayData.check_mac_value}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 選填參數 */}
              {(ecpayData.all_params.OrderResultURL || ecpayData.all_params.CustomerName || ecpayData.all_params.CustomerEmail) && (
                <div className="border-t border-blue-300 pt-4">
                  <h4 className="text-sm font-bold text-blue-900 mb-3">選填參數 (Optional Parameters)</h4>
                  
                  <div className="space-y-3">
                    {ecpayData.all_params.OrderResultURL && (
                      <div>
                        <label className="block text-xs font-semibold text-blue-800 mb-1">
                          OrderResultURL
                          <span className="text-gray-500 font-normal ml-2">(付款完成跳轉網址)</span>
                        </label>
                        <div className="bg-white p-2 rounded border border-blue-300 text-sm font-mono break-all">{ecpayData.all_params.OrderResultURL}</div>
                      </div>
                    )}
                    
                    {ecpayData.all_params.CustomerName && (
                      <div>
                        <label className="block text-xs font-semibold text-blue-800 mb-1">
                          CustomerName
                          <span className="text-gray-500 font-normal ml-2">(客戶姓名)</span>
                        </label>
                        <div className="bg-white p-2 rounded border border-blue-300 text-sm font-mono">{ecpayData.all_params.CustomerName}</div>
                      </div>
                    )}
                    
                    {ecpayData.all_params.CustomerEmail && (
                      <div>
                        <label className="block text-xs font-semibold text-blue-800 mb-1">
                          CustomerEmail
                          <span className="text-gray-500 font-normal ml-2">(客戶 Email)</span>
                        </label>
                        <div className="bg-white p-2 rounded border border-blue-300 text-sm font-mono break-all">{ecpayData.all_params.CustomerEmail}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* 完整 JSON 數據 */}
              <div className="border-t border-blue-300 pt-4">
                <h4 className="text-sm font-bold text-blue-900 mb-2">完整表單數據 (JSON)</h4>
                <div className="bg-white p-3 rounded border border-blue-300 text-xs font-mono overflow-auto max-h-60">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(ecpayData.all_params, null, 2)}</pre>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
              <strong>注意：</strong> 訂單已創建，但尚未提交到綠界。驗證 CheckMacValue 正確後，可取消註解代碼以啟用綠界提交。
            </div>
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