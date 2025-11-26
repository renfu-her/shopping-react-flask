import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cart } from '../components/Cart';
import { useApp } from '../context/AppContext';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, user, updateQuantity, removeFromCart } = useApp();

  return (
    <Cart 
      items={cart} 
      updateQuantity={updateQuantity} 
      removeFromCart={removeFromCart} 
      onCheckout={() => navigate(user ? '/checkout' : '/sign')}
      onContinueShopping={() => navigate('/shop')}
    />
  );
};

