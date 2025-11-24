import React from 'react';
import { NewsItem } from '../types';
import { ArrowLeft, Clock, Calendar, Share2 } from 'lucide-react';

interface NewsDetailProps {
  newsItem: NewsItem;
  onBack: () => void;
}

export const NewsDetail: React.FC<NewsDetailProps> = ({ newsItem, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in slide-in-from-right-8 duration-300">
      <button
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-indigo-600 mb-8 transition-colors group"
      >
        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to News
      </button>

      <article className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-64 md:h-96 overflow-hidden relative">
          <img
            src={newsItem.image}
            alt={newsItem.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 text-white">
             <div className="flex items-center gap-4 mb-2 text-sm font-medium opacity-90">
                <span className="flex items-center gap-1"><Calendar size={14} /> {newsItem.date}</span>
                <span className="flex items-center gap-1"><Clock size={14} /> 5 min read</span>
             </div>
             <h1 className="text-3xl md:text-4xl font-bold leading-tight">{newsItem.title}</h1>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="prose prose-indigo max-w-none">
            <p className="text-xl text-gray-600 leading-relaxed mb-8 font-medium">{newsItem.excerpt}</p>
            <div className="text-gray-600 leading-relaxed space-y-6 whitespace-pre-line">
                {newsItem.content}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
              <div className="flex gap-2">
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">#Trends</span>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">#LuminaLife</span>
              </div>
              <button className="flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800">
                  <Share2 size={18} /> Share
              </button>
          </div>
        </div>
      </article>
    </div>
  );
};