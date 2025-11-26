import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PRODUCTS, NEWS_ITEMS } from '../data/mockData';

export const useAiContext = (): string => {
  const location = useLocation();
  const { selectedCategory, cart } = useApp();

  const path = location.pathname;
  
  if (path.startsWith('/product/')) {
    const productId = path.split('/')[2];
    const product = PRODUCTS.find(p => p.id === parseInt(productId));
    return product ? `Viewing Product: ${product.title} - Price: $${product.price}` : 'Viewing a Product';
  }
  
  if (path === '/cart') {
    return `Viewing Cart with ${cart.length} items`;
  }
  
  if (path === '/checkout') {
    return 'During Checkout';
  }
  
  if (path === '/shop') {
    return `Browsing Shop - Category: ${selectedCategory || 'All'}`;
  }
  
  if (path === '/') {
    return 'Home Page';
  }
  
  if (path === '/about') {
    return 'About Us Page';
  }
  
  if (path === '/news') {
    return 'Reading News List';
  }
  
  if (path.startsWith('/news/')) {
    const newsId = path.split('/')[2];
    const news = NEWS_ITEMS.find(n => n.id === parseInt(newsId));
    return news ? `Reading Article: ${news.title}` : 'Reading News';
  }
  
  return 'General Shopping';
};

