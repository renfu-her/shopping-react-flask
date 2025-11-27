import React, { useState } from 'react';
import { AppView, User } from '../types';
import { Mail, Lock, User as UserIcon, ArrowLeft } from 'lucide-react';
import { login, register } from '../services/api';

interface AuthProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ currentView, setView, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
    if (currentView === AppView.FORGOT_PASSWORD) {
        alert("If an account exists, a reset link has been sent.");
        setView(AppView.LOGIN);
        setLoading(false);
        return;
    }
    
      if (currentView === AppView.LOGIN) {
        // Login - Session is automatically set by backend
        const response = await login({ email, password });
        console.log('Login successful, response:', response);
        // Pass complete user object with all fields
        onLogin(response.user);
      } else if (currentView === AppView.REGISTER) {
        // Register
        if (!name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        await register({ email, name, password });
        // After successful registration, automatically login
        // Session is automatically set by backend
        const loginResponse = await login({ email, password });
        console.log('Register and login successful, response:', loginResponse);
        // Pass complete user object with all fields
        onLogin(loginResponse.user);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderTitle = () => {
    switch(currentView) {
        case AppView.LOGIN: return "Welcome Back";
        case AppView.REGISTER: return "Create Account";
        case AppView.FORGOT_PASSWORD: return "Reset Password";
        default: return "";
    }
  };

  const fillDemoCredentials = () => {
      setEmail('demo@lumina.shop');
      setPassword('securepassword123');
      if (currentView === AppView.REGISTER) {
          setName('Lumina Tester');
      }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{renderTitle()}</h2>
            <p className="text-gray-500 text-sm">
                {currentView === AppView.LOGIN && "Enter your credentials to access your account."}
                {currentView === AppView.REGISTER && "Join us to start shopping today."}
                {currentView === AppView.FORGOT_PASSWORD && "Enter your email to receive recovery instructions."}
            </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {currentView === AppView.REGISTER && (
            <div className="relative">
                <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          )}

          <div className="relative">
            <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>

          {currentView !== AppView.FORGOT_PASSWORD && (
             <div className="relative">
                <input
                    type="password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             </div>
          )}

          {(currentView === AppView.LOGIN || currentView === AppView.REGISTER) && (
             <div className="flex justify-end">
                 <button 
                    type="button" 
                    onClick={fillDemoCredentials}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                 >
                    Use Demo Credentials
                 </button>
             </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-[0.98]"
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
            {currentView === AppView.LOGIN && "Sign In"}
            {currentView === AppView.REGISTER && "Sign Up"}
            {currentView === AppView.FORGOT_PASSWORD && "Send Reset Link"}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-center text-sm">
            {currentView === AppView.LOGIN && (
                <>
                    <button onClick={() => setView(AppView.FORGOT_PASSWORD)} className="text-gray-500 hover:text-indigo-600 transition-colors">Forgot Password?</button>
                    <p className="text-gray-500">
                        Don't have an account? <button onClick={() => setView(AppView.REGISTER)} className="text-indigo-600 font-semibold hover:underline">Register</button>
                    </p>
                </>
            )}
            
            {currentView === AppView.REGISTER && (
                 <p className="text-gray-500">
                    Already have an account? <button onClick={() => setView(AppView.LOGIN)} className="text-indigo-600 font-semibold hover:underline">Log In</button>
                </p>
            )}

            {currentView === AppView.FORGOT_PASSWORD && (
                 <button onClick={() => setView(AppView.LOGIN)} className="flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-colors gap-1">
                    <ArrowLeft size={16} /> Back to Login
                </button>
            )}
        </div>
      </div>
    </div>
  );
};