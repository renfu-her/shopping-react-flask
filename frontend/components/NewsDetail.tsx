import React from 'react';
import ReactMarkdown from 'react-markdown';
import { NewsItem } from '../types';
import { ArrowLeft, Clock, Calendar, Share2 } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

interface NewsDetailProps {
  newsItem: NewsItem;
  onBack: () => void;
}

export const NewsDetail: React.FC<NewsDetailProps> = ({ newsItem, onBack }) => {

  const imageUrl = getImageUrl(newsItem.image);

  // Custom components for react-markdown to handle image URLs
  const markdownComponents = {
    img: ({ node, ...props }: any) => {
      const src = props.src || '';
      const imageSrc = getImageUrl(src);
      return <img {...props} src={imageSrc} alt={props.alt || ''} className="rounded-lg my-4 max-w-full h-auto" />;
    },
    h1: ({ node, ...props }: any) => <h1 {...props} className="text-3xl font-bold mt-8 mb-4 text-gray-900" />,
    h2: ({ node, ...props }: any) => <h2 {...props} className="text-2xl font-bold mt-6 mb-3 text-gray-900" />,
    h3: ({ node, ...props }: any) => <h3 {...props} className="text-xl font-bold mt-4 mb-2 text-gray-900" />,
    p: ({ node, ...props }: any) => <p {...props} className="mb-4 leading-relaxed" />,
    ul: ({ node, ...props }: any) => <ul {...props} className="list-disc list-inside mb-4 space-y-2" />,
    ol: ({ node, ...props }: any) => <ol {...props} className="list-decimal list-inside mb-4 space-y-2" />,
    li: ({ node, ...props }: any) => <li {...props} className="ml-4" />,
    blockquote: ({ node, ...props }: any) => <blockquote {...props} className="border-l-4 border-indigo-500 pl-4 italic my-4 text-gray-700" />,
    code: ({ node, inline, ...props }: any) => 
      inline ? (
        <code {...props} className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-indigo-600" />
      ) : (
        <code {...props} className="block bg-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto" />
      ),
    pre: ({ node, ...props }: any) => <pre {...props} className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4" />,
    a: ({ node, ...props }: any) => <a {...props} className="text-indigo-600 hover:text-indigo-800 underline" target="_blank" rel="noopener noreferrer" />,
    strong: ({ node, ...props }: any) => <strong {...props} className="font-bold text-gray-900" />,
    em: ({ node, ...props }: any) => <em {...props} className="italic" />,
  };

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
            src={imageUrl}
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
            <div className="text-gray-600 leading-relaxed">
              <ReactMarkdown components={markdownComponents}>
                {newsItem.content}
              </ReactMarkdown>
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