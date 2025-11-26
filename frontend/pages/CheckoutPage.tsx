import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Checkout } from '../components/Checkout';
import { useApp } from '../context/AppContext';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, setCart } = useApp();

  const handleCheckoutSubmit = () => {
    setCart([]);
    navigate('/shop-finish');
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Checkout 
      onBack={() => navigate('/cart')}
      onSubmit={handleCheckoutSubmit}
      total={total}
    />
  );
};

