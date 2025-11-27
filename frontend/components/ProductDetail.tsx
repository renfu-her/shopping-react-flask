import React, { useState } from 'react';
import { Product } from '../services/api';
import { ArrowLeft, ShoppingCart, Star, Check, Truck, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  addToCart: (product: Product) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, addToCart }) => {
  // Convert relative image URL to absolute URL
  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // If it's a relative path, prepend the backend base URL
    return `http://localhost:8000${url.startsWith('/') ? url : '/' + url}`;
  };

  // Get all product images (from product_images array or fallback to product.image)
  const allImages = product.product_images && product.product_images.length > 0
    ? product.product_images.map(img => img.image_url)
    : product.image ? [product.image] : [];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const currentImage = allImages[currentImageIndex] || '';
  const imageUrl = getImageUrl(currentImage);

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in slide-in-from-right-8 duration-300">
      <button 
        onClick={onBack} 
        className="flex items-center text-gray-500 hover:text-indigo-600 mb-8 transition-colors group"
      >
        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Shop
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="bg-gray-100 h-96 lg:h-auto flex items-center justify-center p-8 relative">
            {allImages.length > 1 && (
              <>
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} className="text-gray-700" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} className="text-gray-700" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-indigo-600 w-6' : 'bg-white/60 hover:bg-white/80'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
            <img 
              src={imageUrl} 
              alt={product.title} 
              className="max-h-full max-w-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Details Section */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <div className="mb-4">
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    {product.category_name || 'Uncategorized'}
                </span>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {product.title}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={20} className="fill-current" />
                ))}
              </div>
              <span className="text-gray-500 text-sm">(128 Reviews)</span>
            </div>

            <div className="text-4xl font-bold text-indigo-600 mb-8">
              ${product.price}
            </div>

            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              {product.description || 'No description available.'}
              {product.description && (
                <>
                  <br /><br />
                  Engineered for performance and designed for elegance. This item uses premium materials to ensure longevity and style in your daily life.
                </>
              )}
            </p>

            <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-gray-700">
                    <Check className="text-green-500" size={20} />
                    <span>In stock and ready to ship</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                    <Truck className="text-indigo-500" size={20} />
                    <span>Free delivery on orders over $50</span>
                </div>
            </div>

            <button
              onClick={() => addToCart(product)}
              className="w-full bg-gray-900 hover:bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              <ShoppingCart size={24} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};