import React from 'react';
import { Product } from '../types';
import { ShoppingCart, Star, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  addToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  addToCart, 
  onProductClick,
  currentPage,
  totalPages,
  onPageChange
}) => {

  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 mb-12">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
            <div 
              className="relative h-72 overflow-hidden bg-gray-100 cursor-pointer"
              onClick={() => onProductClick(product)}
            >
              <img 
                src={product.image} 
                alt={product.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm">
                {product.category}
              </div>
              {/* Overlay button on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      <Eye size={16} /> View Details
                  </span>
              </div>
            </div>
            
            <div className="p-6 flex flex-col flex-1">
              <div 
                  className="flex justify-between items-start mb-3 cursor-pointer"
                  onClick={() => onProductClick(product)}
              >
                <h3 className="font-bold text-gray-900 text-lg leading-snug hover:text-indigo-600 transition-colors">{product.title}</h3>
              </div>
              
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xs text-gray-400 ml-2">(42 reviews)</span>
              </div>

              <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1 leading-relaxed">{product.description}</p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="font-bold text-2xl text-gray-900">${product.price}</span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                    }}
                    className="bg-gray-900 text-white p-3 rounded-xl hover:bg-indigo-600 transition-colors shadow-lg active:scale-95"
                    title="Add to Cart"
                >
                    <ShoppingCart size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button 
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft size={20} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        currentPage === page 
                        ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-lg scale-110' 
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    {page}
                </button>
            ))}

            <button 
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight size={20} />
            </button>
          </div>
      )}
      
      {products.length === 0 && (
          <div className="text-center py-20">
              <p className="text-gray-500 text-xl">No products found in this category.</p>
              <button onClick={() => onPageChange(1)} className="mt-4 text-indigo-600 font-semibold hover:underline">Clear Filters</button>
          </div>
      )}
    </div>
  );
};