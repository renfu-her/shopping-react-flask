import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { NewsDetail } from '../components/NewsDetail';
import { fetchNewsDetail, NewsItem } from '../services/api';

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
  
  return (
    <NewsDetail
      newsItem={newsItem}
      onBack={() => navigate('/news')}
    />
  );
};

