import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ProductDetail } from '../components/ProductDetail';
import { useApp } from '../context/AppContext';
import { fetchProductDetail, Product } from '../services/api';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, user } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError('Invalid product ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const productData = await fetchProductDetail(parseInt(id));
        setProduct(productData);
      } catch (err) {
        console.error('Error loading product detail:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!user) {
      navigate('/sign');
      return;
    }
    addToCart(product);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20">
          <p className="text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return <Navigate to="/shop" replace />;
  }
  
  return (
    <ProductDetail 
      product={product} 
      onBack={() => navigate('/shop')}
      addToCart={handleAddToCart}
    />
  );
};

