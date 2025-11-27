import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '../components/Auth';
import { AppView } from '../types';
import { useApp } from '../context/AppContext';

export const SignPage: React.FC = () => {
  const navigate = useNavigate();
  const { handleLogin, user, isLoadingUser } = useApp();
  const [authView, setAuthView] = useState<AppView>(AppView.LOGIN);
  
  // Redirect to home if already logged in
  useEffect(() => {
    if (!isLoadingUser && user) {
      navigate('/');
    }
  }, [user, isLoadingUser, navigate]);
  
  const handleLoginWithNavigate = (userData: Parameters<typeof handleLogin>[0]) => {
    handleLogin(userData);
    navigate('/');
  };
  
  // Show loading state while verifying token
  if (isLoadingUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Verifying authentication...</p>
        </div>
      </div>
    );
  }
  
  // Don't show sign page if already logged in
  if (user) {
    return null;
  }
  
  return (
    <Auth 
      currentView={authView} 
      setView={setAuthView} 
      onLogin={handleLoginWithNavigate}
    />
  );
};

