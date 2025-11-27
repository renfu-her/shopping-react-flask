import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home } from '../components/Home';
import { CategoryNav } from '../components/CategoryNav';
import { useApp } from '../context/AppContext';
import { fetchFeaturedProducts, fetchNews, Product, NewsItem } from '../services/api';

export const HomePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCategory, handleCategorySelect } = useApp();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [products, news] = await Promise.all([
          fetchFeaturedProducts(),
          fetchNews()
        ]);
        setFeaturedProducts(products);
        setNewsItems(news);
      } catch (error) {
        console.error('Error loading data:', error);
        // 如果 API 失败，使用空数组
        setFeaturedProducts([]);
        setNewsItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
        newsItems={newsItems}
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

