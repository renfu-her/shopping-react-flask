import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { NewsDetail } from '../components/NewsDetail';
import { NEWS_ITEMS } from '../data/mockData';

export const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const newsItem = NEWS_ITEMS.find(n => n.id === parseInt(id || '0'));
  
  if (!newsItem) {
    return <Navigate to="/news" replace />;
  }
  
  return (
    <NewsDetail
      newsItem={newsItem}
      onBack={() => navigate('/news')}
    />
  );
};

