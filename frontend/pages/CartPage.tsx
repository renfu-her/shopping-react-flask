import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cart } from '../components/Cart';
import { useApp } from '../context/AppContext';
import { getCart, CartResponse } from '../services/api';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, user, updateQuantity, removeFromCart, setCart } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const cartData = await getCart();
        // 更新 AppContext 中的購物車
        const cartItems = cartData.items.map(item => ({
          ...item.product,
          quantity: item.quantity,
        }));
        setCart(cartItems);
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [user, setCart]);

  const handleUpdateQuantity = async (id: number, delta: number) => {
    try {
      await updateQuantity(id, delta);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveFromCart = async (id: number) => {
    try {
      await removeFromCart(id);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <Cart 
      items={cart} 
      updateQuantity={handleUpdateQuantity} 
      removeFromCart={handleRemoveFromCart} 
      onCheckout={() => navigate(user ? '/checkout' : '/sign')}
      onContinueShopping={() => navigate('/shop')}
    />
  );
};

