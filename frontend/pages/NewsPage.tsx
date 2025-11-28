import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import { fetchNews, NewsItem } from '../services/api';
import { getImageUrl } from '../utils/imageUrl';

export const NewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const news = await fetchNews();
        setNewsItems(news);
      } catch (err) {
        console.error('Error loading news:', err);
        setError('Failed to load news');
        setNewsItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  const handleNewsClick = (newsItem: { id: number }) => {
    navigate(`/news/${newsItem.id}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Latest News</h1>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading news...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Latest News</h1>
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Latest News | Lumina Shop"
        description="Stay updated with the latest news, updates, and announcements from Lumina Shop. Discover new products, special offers, and shopping tips."
        keywords="news, updates, announcements, Lumina Shop, e-commerce news"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Latest News',
          description: 'Latest news and updates from Lumina Shop',
          url: typeof window !== 'undefined' ? window.location.href : '',
        }}
      />
      <div className="max-w-7xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Latest News</h1>
      {newsItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No news available at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          {newsItems.map(item => {
            const imageUrl = getImageUrl(item.image);

            return (
              <div 
                key={item.id} 
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => handleNewsClick(item)}
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={imageUrl} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    alt={item.title}
                  />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-gray-800 flex items-center gap-1">
                <Clock size={12} /> {item.date}
              </div>
            </div>
            <div className="p-6 flex flex-col h-[220px]">
              <h3 className="font-bold text-xl mb-3 group-hover:text-indigo-600 transition-colors leading-snug">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 flex-1 leading-relaxed line-clamp-3">
                {item.excerpt}
              </p>
              <button 
                className="text-indigo-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all mt-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNewsClick(item);
                }}
              >
                Read Article <ChevronRight size={16} />
              </button>
            </div>
          </div>
            );
          })}
        </div>
      )}
      </div>
    </>
  );
};

