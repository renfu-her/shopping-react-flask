import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight } from 'lucide-react';
import { NEWS_ITEMS } from '../data/mockData';

export const NewsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleNewsClick = (newsItem: { id: number }) => {
    navigate(`/news/${newsItem.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Latest News</h1>
      <div className="grid gap-8 md:grid-cols-3">
        {NEWS_ITEMS.map(item => (
          <div 
            key={item.id} 
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => handleNewsClick(item)}
          >
            <div className="h-48 overflow-hidden relative">
              <img 
                src={item.image} 
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
        ))}
      </div>
    </div>
  );
};

