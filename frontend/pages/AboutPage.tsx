import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="About Us | Lumina Shop"
        description="Learn about Lumina Shop - a modern, AI-enhanced e-commerce platform dedicated to bringing you the best products with an innovative shopping experience."
        keywords="about, Lumina Shop, company, e-commerce, AI shopping"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'About Lumina Shop',
          description: 'Learn about Lumina Shop and our mission',
          url: typeof window !== 'undefined' ? window.location.href : '',
        }}
      />
      <div className="max-w-3xl mx-auto py-20 px-6 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About Lumina</h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          We are dedicated to bringing you the best products with an AI-powered shopping experience.
        </p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-8 text-indigo-600 font-medium hover:underline"
        >
          Back to Home
        </button>
      </div>
    </>
  );
};

