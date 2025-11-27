import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductList } from '../components/ProductList';
import { CategoryNav } from '../components/CategoryNav';
import { useApp } from '../context/AppContext';
import { fetchProducts, Product } from '../services/api';

export const ShopPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCategory, currentPage, setCurrentPage, handleCategorySelect, addToCart, user } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch all products (category filtering will be done on frontend by category_name)
        // Reset to page 1 when category changes
        const page = selectedCategory ? 1 : currentPage;
        const response = await fetchProducts(null, page, 9);
        setProducts(response.products);
        setTotalPages(response.total_pages);
        // Reset page to 1 if category changed
        if (selectedCategory && currentPage !== 1) {
          setCurrentPage(1);
        }
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [currentPage, selectedCategory]);

  const handleProductClick = (product: { id: number }) => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (product: Product) => {
    if (!user) {
      navigate('/sign');
      return;
    }
    addToCart(product);
  };

  // Filter products by category if selectedCategory is set
  const filteredProducts = React.useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter(p => p.category_name === selectedCategory);
  }, [products, selectedCategory]);

  if (loading) {
    return (
      <>
        <CategoryNav 
          onCategoryClick={handleCategorySelect}
          onViewAllClick={() => {
            handleCategorySelect(null);
            navigate('/shop');
          }}
        />
        <div className="max-w-7xl mx-auto p-6 text-center py-20">
          <p className="text-gray-500">Loading products...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <CategoryNav 
          onCategoryClick={handleCategorySelect}
          onViewAllClick={() => {
            handleCategorySelect(null);
            navigate('/shop');
          }}
        />
        <div className="max-w-7xl mx-auto p-6 text-center py-20">
          <p className="text-red-500">{error}</p>
        </div>
      </>
    );
  }

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
        products={filteredProducts} 
        addToCart={handleAddToCart} 
        onProductClick={handleProductClick}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

