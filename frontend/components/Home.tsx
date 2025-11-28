import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Truck, Clock, Newspaper, ChevronRight } from 'lucide-react';
import { Product, NewsItem } from '../types';
import { fetchAds, Ad } from '../services/api';
import { getImageUrl } from '../utils/imageUrl';

interface HomeProps {
  featuredProducts: Product[];
  newsItems: NewsItem[];
  onShopNow: () => void;
  onProductClick: (product: Product) => void;
  onCategoryClick: (category: string) => void;
  onNewsClick: (newsItem: NewsItem) => void;
}

export const Home: React.FC<HomeProps> = ({ featuredProducts, newsItems, onShopNow, onProductClick, onNewsClick }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAds = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAds();
        setAds(data);
      } catch (err) {
        setError('Failed to load banner');
        console.error('Error loading ads:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAds();
  }, []);

  // Get the first ad (or ad with lowest order_index, which should be first after API sorting)
  const heroAd = ads.length > 0 ? ads[0] : null;


  const handleShopNowClick = () => {
    if (heroAd?.link_url) {
      window.location.href = heroAd.link_url;
    } else {
      onShopNow();
    }
  };

  return (
    <div className="animate-in fade-in duration-700 flex flex-col">
      
      {/* HERO BANNER */}
      <div className="relative bg-indigo-900 text-white overflow-hidden h-[500px] md:h-[600px]">
        {heroAd ? (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ backgroundImage: `url(${getImageUrl(heroAd.image_url)})` }}
            ></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
              <span className="bg-indigo-500/30 text-indigo-200 px-4 py-1 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-indigo-400/30">New Collection 2025</span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                {(() => {
                  const words = heroAd.title.split(' ');
                  if (words.length <= 2) {
                    return (
                      <>
                        {heroAd.title} <br />
                        <span className="text-indigo-400">Innovation</span>
                      </>
                    );
                  }
                  const midPoint = Math.ceil(words.length / 2);
                  return (
                    <>
                      {words.slice(0, midPoint).join(' ')} <br />
                      <span className="text-indigo-400">{words.slice(midPoint).join(' ')}</span>
                    </>
                  );
                })()}
              </h1>
              <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mb-10 leading-relaxed">
                Discover our curated collection of premium electronics, fashion, and home goods. 
                Designed for those who appreciate quality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                    onClick={handleShopNowClick}
                    className="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all hover:scale-105 shadow-xl"
                >
                    Shop Now
                    <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          // Fallback to default banner when no ads available
          <>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-30"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
              <span className="bg-indigo-500/30 text-indigo-200 px-4 py-1 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-indigo-400/30">New Collection 2025</span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                Style Meets <br />
                <span className="text-indigo-400">Innovation</span>
              </h1>
              <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mb-10 leading-relaxed">
                Discover our curated collection of premium electronics, fashion, and home goods. 
                Designed for those who appreciate quality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                    onClick={onShopNow}
                    className="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all hover:scale-105 shadow-xl"
                >
                    Shop Now
                    <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Hot Products (Popular) */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
             <div>
                <h2 className="text-3xl font-bold text-gray-900">Popular This Week</h2>
                <p className="text-gray-500 mt-2">Our most coveted items, curated just for you.</p>
             </div>
             <button onClick={onShopNow} className="text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1">
                View All <ArrowRight size={16} />
             </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => {
              // 获取第一张图片（order_index 为 0 的图片，或 product_images 的第一张）
              const firstImage = product.product_images && product.product_images.length > 0
                ? product.product_images[0].image_url
                : product.image;
              
              // 转换相对路径为绝对路径
              const imageUrl = getImageUrl(firstImage || '');
              
              return (
                <div key={product.id} className="group cursor-pointer" onClick={() => onProductClick(product)}>
                  <div className="bg-gray-100 rounded-2xl overflow-hidden relative aspect-[4/3] mb-4">
                      <img 
                          src={imageUrl} 
                          alt={product.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-900">
                          HOT
                      </div>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">{product.title}</h3>
                  <p className="text-gray-500 text-sm mb-2">{product.category_name || 'Uncategorized'}</p>
                  <p className="font-bold text-indigo-600">${product.price}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div className="py-24 bg-indigo-900 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 pointer-events-none"></div>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                    <div className="inline-flex items-center gap-2 text-indigo-300 font-semibold mb-4">
                        <div className="w-8 h-[1px] bg-indigo-300"></div>
                        ABOUT US
                    </div>
                    <h2 className="text-4xl font-bold mb-6">We're Redefining the <br/>Shopping Experience.</h2>
                    <p className="text-indigo-100 text-lg leading-relaxed mb-8">
                        Founded in 2024, Lumina was born from a simple idea: shopping should be effortless, personalized, and inspiring. We combine cutting-edge AI technology with human-centric design to bring you products that actually matter to your life.
                    </p>
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-800 rounded-xl text-indigo-300">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <div className="font-bold text-xl">100%</div>
                                <div className="text-indigo-300 text-sm">Secure</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                             <div className="p-3 bg-indigo-800 rounded-xl text-indigo-300">
                                <Truck size={24} />
                            </div>
                            <div>
                                <div className="font-bold text-xl">24h</div>
                                <div className="text-indigo-300 text-sm">Shipping</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <img 
                        src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80" 
                        alt="About Us" 
                        className="rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500 border-4 border-white/10"
                    />
                </div>
            </div>
         </div>
      </div>

      {/* Latest News Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Our Blog</span>
                <h2 className="text-4xl font-bold text-gray-900 mt-2">Latest News & Stories</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {newsItems.map((news) => {
                    // Convert relative image URL to absolute URL
                    const newsImageUrl = getImageUrl(news.image);
                    
                    return (
                        <div 
                            key={news.id} 
                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
                            onClick={() => onNewsClick(news)}
                        >
                            <div className="h-48 overflow-hidden relative">
                                <img src={newsImageUrl} alt={news.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-gray-800 flex items-center gap-1">
                                    <Clock size={12} /> {news.date}
                                </div>
                            </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">{news.title}</h3>
                            <p className="text-gray-500 mb-4 line-clamp-3 text-sm leading-relaxed">{news.excerpt}</p>
                            <button 
                                className="text-indigo-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onNewsClick(news);
                                }}
                            >
                                Read Article <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                    );
                })}
            </div>
        </div>
      </div>

      {/* Newsletter / Footer Teaser */}
      <div className="py-16 bg-white border-t border-gray-100">
         <div className="max-w-4xl mx-auto px-4 text-center">
            <Newspaper size={48} className="mx-auto text-indigo-600 mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Subscribe to our newsletter</h2>
            <p className="text-gray-500 mb-8">Get the latest updates on new products and upcoming sales.</p>
            <div className="flex gap-2 max-w-md mx-auto">
                <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-full border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                <button className="bg-indigo-600 text-white px-6 py-3 rounded-full font-bold hover:bg-indigo-700 transition-colors">Subscribe</button>
            </div>
         </div>
      </div>
    </div>
  );
};