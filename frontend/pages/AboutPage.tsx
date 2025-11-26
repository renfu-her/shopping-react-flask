import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
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
  );
};

