import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { NewsDetail } from '../components/NewsDetail';
import { SEO } from '../components/SEO';
import { fetchNewsDetail, NewsItem } from '../services/api';
import { getImageUrl } from '../utils/imageUrl';

export const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNewsDetail = async () => {
      if (!id) {
        setError('Invalid news ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const news = await fetchNewsDetail(parseInt(id));
        setNewsItem(news);
      } catch (err) {
        console.error('Error loading news detail:', err);
        setError('Failed to load news');
      } finally {
        setLoading(false);
      }
    };

    loadNewsDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading news...</p>
        </div>
      </div>
    );
  }

  if (error || !newsItem) {
    return <Navigate to="/news" replace />;
  }

  const newsImage = getImageUrl(newsItem.image);
  const newsDescription = newsItem.excerpt || newsItem.content.replace(/[#*`]/g, '').substring(0, 160);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: newsItem.title,
    description: newsDescription,
    image: newsImage,
    datePublished: newsItem.date,
    author: {
      '@type': 'Organization',
      name: 'Lumina Shop',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Lumina Shop',
    },
  };

  return (
    <>
      <SEO
        title={`${newsItem.title} | News | Lumina Shop`}
        description={newsDescription}
        keywords={`${newsItem.title}, news, Lumina Shop, updates`}
        image={newsImage}
        type="article"
        structuredData={structuredData}
      />
      <NewsDetail
        newsItem={newsItem}
        onBack={() => navigate('/news')}
      />
    </>
  );
};

