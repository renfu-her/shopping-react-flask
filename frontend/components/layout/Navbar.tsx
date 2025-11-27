import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, LogOut, Menu, X, LogIn, ShoppingBag, User, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, cart, handleLogout, handleCategorySelect } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const isActive = (path: string) => 
    location.pathname === path || (path === '/shop' && location.pathname.startsWith('/product/'));

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 transition-all h-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center cursor-pointer group" onClick={() => navigate('/')}>
            <div className="bg-indigo-600 p-2 rounded-xl mr-3 group-hover:bg-indigo-700 transition-colors shadow-sm">
              <ShoppingBag className="text-white" size={22}/>
            </div>
            <span className="font-bold text-2xl tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">Shopping</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => navigate('/')} 
              className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
            >
              Home
            </button>
            <button 
              onClick={() => { handleCategorySelect(null); navigate('/shop'); }}
              className={`text-sm font-medium transition-colors ${isActive('/shop') ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
            >
              Shop
            </button>
            <button 
              onClick={() => navigate('/news')} 
              className={`text-sm font-medium transition-colors ${isActive('/news') ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
            >
              News
            </button>
            <button 
              onClick={() => navigate('/about')} 
              className={`text-sm font-medium transition-colors ${isActive('/about') ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
            >
              About
            </button>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 text-gray-400 hover:text-indigo-600 transition-colors relative"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
            
            {user ? (
              <div className="hidden md:flex items-center gap-3 pl-4 border-l border-gray-200 relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Welcome,</p>
                    <p className="text-sm font-bold text-gray-900 leading-none">{user.name}</p>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {profileMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={16} />
                      Profile
                    </button>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => navigate('/sign')}
                className="hidden md:flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-indigo-600 transition-colors shadow-md"
              >
                <LogIn size={16} /> Sign In
              </button>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl animate-in slide-in-from-top-2 z-50">
          <div className="p-4 space-y-3">
            <button 
              onClick={() => { navigate('/'); setMobileMenuOpen(false); }} 
              className="block w-full text-left p-2 font-medium text-gray-900 hover:bg-gray-50 rounded-lg"
            >
              Home
            </button>
            <button 
              onClick={() => { navigate('/shop'); setMobileMenuOpen(false); }} 
              className="block w-full text-left p-2 font-medium text-gray-900 hover:bg-gray-50 rounded-lg"
            >
              Shop All
            </button>
            <button 
              onClick={() => { navigate('/news'); setMobileMenuOpen(false); }} 
              className="block w-full text-left p-2 font-medium text-gray-900 hover:bg-gray-50 rounded-lg"
            >
              News
            </button>
            <button 
              onClick={() => { navigate('/cart'); setMobileMenuOpen(false); }} 
              className="block w-full text-left p-2 font-medium text-gray-900 hover:bg-gray-50 rounded-lg"
            >
              Cart ({cartCount})
            </button>
            
            {user ? (
              <>
                <button 
                  onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }} 
                  className="block w-full text-left p-2 font-medium text-gray-900 hover:bg-gray-50 rounded-lg"
                >
                  Profile ({user.name})
                </button>
                <button 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
                  className="block w-full text-left p-2 font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <button 
                onClick={() => { navigate('/sign'); setMobileMenuOpen(false); }} 
                className="block w-full text-left p-2 font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

