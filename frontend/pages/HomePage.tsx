import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home } from '../components/Home';
import { CategoryNav } from '../components/CategoryNav';
import { useApp } from '../context/AppContext';
import { NEWS_ITEMS } from '../data/mockData';
import { fetchFeaturedProducts, Product } from '../services/api';

export const HomePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCategory, handleCategorySelect } = useApp();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoading(true);
        const products = await fetchFeaturedProducts();
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Error loading featured products:', error);
        // 如果 API 失败，使用空数组
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  const handleProductClick = (product: { id: number }) => {
    navigate(`/product/${product.id}`);
  };

  const handleNewsClick = (newsItem: { id: number }) => {
    navigate(`/news/${newsItem.id}`);
  };

  return (
    <>
      {(location.pathname === '/' || location.pathname === '/shop') && (
        <CategoryNav 
          onCategoryClick={handleCategorySelect}
          onViewAllClick={() => {
            handleCategorySelect(null);
            navigate('/shop');
          }}
        />
      )}
      <Home 
        featuredProducts={featuredProducts} 
        newsItems={NEWS_ITEMS}
        onShopNow={() => {
          handleCategorySelect(null);
          navigate('/shop');
        }}
        onProductClick={handleProductClick}
        onCategoryClick={handleCategorySelect}
        onNewsClick={handleNewsClick}
      />
    </>
  );
};

