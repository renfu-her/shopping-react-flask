import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ProductDetail } from '../components/ProductDetail';
import { useApp } from '../context/AppContext';
import { PRODUCTS } from '../data/mockData';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, user } = useApp();
  const product = PRODUCTS.find(p => p.id === parseInt(id || '0'));
  
  if (!product) {
    return <Navigate to="/shop" replace />;
  }

  const handleAddToCart = () => {
    if (!user) {
      navigate('/sign');
      return;
    }
    addToCart(product);
  };
  
  return (
    <ProductDetail 
      product={product} 
      onBack={() => navigate('/shop')}
      addToCart={handleAddToCart}
    />
  );
};

