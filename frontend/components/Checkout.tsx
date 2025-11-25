import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Truck, ShieldCheck } from 'lucide-react';
import { OrderDetails } from '../types';

interface CheckoutProps {
  onBack: () => void;
  onSubmit: (details: OrderDetails) => void;
  total: number;
}

export const Checkout: React.FC<CheckoutProps> = ({ onBack, onSubmit, total }) => {
  const [details, setDetails] = useState<OrderDetails>({
    name: '',
    address: '',
    city: '',
    zip: '',
    cardNumber: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate processing
    onSubmit(details);
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

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          
          {/* Section: Shipping */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-indigo-600 font-semibold">
                <Truck size={20} />
                <h3>Shipping Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input required name="name" value={details.name} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="John Doe" />
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
                <h3>Payment Details</h3>
            </div>
            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                 <div className="relative">
                    <input 
                        required 
                        name="cardNumber" 
                        value={details.cardNumber} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono" 
                        placeholder="0000 0000 0000 0000" 
                        maxLength={19}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <CreditCard size={20} />
                    </div>
                 </div>
            </div>
            <div className="flex items-center mt-4 text-xs text-gray-500 gap-2">
                <ShieldCheck size={16} className="text-green-500"/>
                <span>Payments are secure and encrypted.</span>
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-[0.99]">
              Pay ${(total * 1.08).toFixed(2)}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};