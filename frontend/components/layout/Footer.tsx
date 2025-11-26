import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Twitter, Facebook, Instagram } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { handleCategorySelect } = useApp();

  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <ShoppingBag className="text-white" size={20}/>
              </div>
              <span className="font-bold text-xl text-gray-900">Shopping</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Redefining the modern shopping experience with AI-powered assistance and curated collections.
            </p>
            <div className="flex gap-4 text-gray-400">
              <Twitter size={20} className="hover:text-indigo-600 cursor-pointer transition-colors" />
              <Facebook size={20} className="hover:text-indigo-600 cursor-pointer transition-colors" />
              <Instagram size={20} className="hover:text-indigo-600 cursor-pointer transition-colors" />
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Shop</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li 
                className="hover:text-indigo-600 cursor-pointer" 
                onClick={() => { handleCategorySelect(null); navigate('/shop'); }}
              >
                All Products
              </li>
              <li 
                className="hover:text-indigo-600 cursor-pointer" 
                onClick={() => handleCategorySelect('Audio')}
              >
                Audio
              </li>
              <li 
                className="hover:text-indigo-600 cursor-pointer" 
                onClick={() => handleCategorySelect('Wearables')}
              >
                Wearables
              </li>
              <li 
                className="hover:text-indigo-600 cursor-pointer" 
                onClick={() => handleCategorySelect('Decor')}
              >
                Home Decor
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li 
                className="hover:text-indigo-600 cursor-pointer" 
                onClick={() => navigate('/about')}
              >
                About Us
              </li>
              <li className="hover:text-indigo-600 cursor-pointer">Careers</li>
              <li 
                className="hover:text-indigo-600 cursor-pointer" 
                onClick={() => navigate('/news')}
              >
                News
              </li>
              <li className="hover:text-indigo-600 cursor-pointer">Press</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="hover:text-indigo-600 cursor-pointer">Help Center</li>
              <li className="hover:text-indigo-600 cursor-pointer">Terms of Service</li>
              <li className="hover:text-indigo-600 cursor-pointer">Privacy Policy</li>
              <li className="hover:text-indigo-600 cursor-pointer">Returns</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
          &copy; 2025 Lumina Shop. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

