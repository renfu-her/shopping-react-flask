import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home } from '../components/Home';
import { CategoryNav } from '../components/CategoryNav';
import { useApp } from '../context/AppContext';
import { PRODUCTS, NEWS_ITEMS } from '../data/mockData';

export const HomePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCategory, handleCategorySelect } = useApp();

  const filteredProducts = selectedCategory 
    ? PRODUCTS.filter(p => p.category === selectedCategory)
    : PRODUCTS;

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
        featuredProducts={filteredProducts.slice(0, 3)} 
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

