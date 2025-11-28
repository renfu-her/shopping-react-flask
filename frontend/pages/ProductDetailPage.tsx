import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ProductDetail } from '../components/ProductDetail';
import { SEO } from '../components/SEO';
import { useApp } from '../context/AppContext';
import { fetchProductDetail, Product } from '../services/api';
import { getImageUrl } from '../utils/imageUrl';

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

  const productImage = getImageUrl(product.image);
  const productDescription = product.description 
    ? product.description.replace(/[#*`]/g, '').substring(0, 160)
    : `Buy ${product.title} for $${product.price}. ${product.category_name ? `Category: ${product.category_name}.` : ''}`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: productDescription,
    image: productImage,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    category: product.category_name || 'General',
  };

  return (
    <>
      <SEO
        title={`${product.title} - Product Details | Lumina Shop`}
        description={productDescription}
        keywords={`${product.title}, ${product.category_name || ''}, product, buy online, Lumina Shop`}
        image={productImage}
        type="product"
        structuredData={structuredData}
      />
      <ProductDetail 
        product={product} 
        onBack={() => navigate('/shop')}
        addToCart={handleAddToCart}
      />
    </>
  );
};

