import React from 'react';
import { CartItem } from '../types';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

interface CartProps {
  items: CartItem[];
  updateQuantity: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
}

export const Cart: React.FC<CartProps> = ({ items, updateQuantity, removeFromCart, onCheckout, onContinueShopping }) => {

  // Get the first image from product_images array or fallback to product.image
  const getProductImage = (item: CartItem & { product_images?: Array<{ image_url: string; order_index: number }> }) => {
    // Check if product_images exists and has items
    if (item.product_images && item.product_images.length > 0) {
      return item.product_images[0].image_url;
    }
    // Fallback to item.image
    return item.image;
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={48} className="text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Browse our products to find something you love.</p>
        <button
          onClick={onContinueShopping}
          className="bg-indigo-600 text-white px-8 py-3 rounded-full font-medium hover:bg-indigo-700 transition-colors"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h2>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items List */}
        <div className="flex-1 space-y-4">
          {items.map((item) => {
            // Get the first image (from product_images array or fallback to item.image)
            const firstImage = getProductImage(item as CartItem & { product_images?: Array<{ image_url: string; order_index: number }> });
            // Convert relative path to absolute URL
            const imageUrl = getImageUrl(firstImage);

            return (
            <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4 items-center">
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={imageUrl} alt={item.title} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                <p className="text-indigo-600 font-medium">${item.price}</p>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                <button 
                  onClick={() => updateQuantity(item.id, -1)}
                  disabled={item.quantity <= 1}
                  className="p-1 hover:bg-white rounded-md transition-colors disabled:opacity-30 text-gray-600"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-medium text-gray-700">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, 1)}
                  className="p-1 hover:bg-white rounded-md transition-colors text-gray-600"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button 
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors ml-2"
              >
                <Trash2 size={20} />
              </button>
            </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:w-96">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (Estimated)</span>
                <span>${(total * 0.08).toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100 my-2 pt-2 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>${(total * 1.08).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={onCheckout}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg active:scale-95"
            >
              Proceed to Checkout
              <ArrowRight size={20} />
            </button>
            
            <p className="text-center text-xs text-gray-400 mt-4">
              Secure Checkout powered by Lumina Pay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};