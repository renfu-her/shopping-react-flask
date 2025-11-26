import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '../components/Auth';
import { AppView } from '../types';
import { useApp } from '../context/AppContext';

export const SignPage: React.FC = () => {
  const navigate = useNavigate();
  const { handleLogin } = useApp();
  const [authView, setAuthView] = useState<AppView>(AppView.LOGIN);
  
  const handleLoginWithNavigate = (userData: Parameters<typeof handleLogin>[0]) => {
    handleLogin(userData);
    navigate('/');
  };
  
  return (
    <Auth 
      currentView={authView} 
      setView={setAuthView} 
      onLogin={handleLoginWithNavigate}
    />
  );
};

