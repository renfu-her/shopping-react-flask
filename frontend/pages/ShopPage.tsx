import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductList } from '../components/ProductList';
import { CategoryNav } from '../components/CategoryNav';
import { useApp } from '../context/AppContext';
import { PRODUCTS, ITEMS_PER_PAGE } from '../data/mockData';

export const ShopPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCategory, currentPage, setCurrentPage, handleCategorySelect, addToCart, user } = useApp();

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return PRODUCTS;
    return PRODUCTS.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleProductClick = (product: { id: number }) => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (product: { id: number }) => {
    if (!user) {
      navigate('/sign');
      return;
    }
    const fullProduct = PRODUCTS.find(p => p.id === product.id);
    if (fullProduct) {
      addToCart(fullProduct);
    }
  };

  return (
    <>
      <CategoryNav 
        onCategoryClick={handleCategorySelect}
        onViewAllClick={() => {
          handleCategorySelect(null);
          navigate('/shop');
        }}
      />
      <ProductList 
        products={currentProducts} 
        addToCart={handleAddToCart} 
        onProductClick={handleProductClick}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

