import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronRight, Cpu, Armchair, Shirt, Dumbbell, X } from 'lucide-react';

interface CategoryNavProps {
  onCategoryClick: (category: string) => void;
  onViewAllClick: () => void;
}

// Define the Category Hierarchy
const CATEGORY_HIERARCHY = [
  { 
    id: 'electronics', 
    name: 'Electronics', 
    icon: Cpu, 
    subCategories: ['Audio', 'Gadgets', 'Hobbies', 'Computers'] 
  },
  { 
    id: 'home', 
    name: 'Home & Living', 
    icon: Armchair, 
    subCategories: ['Furniture', 'Decor', 'Kitchen'] 
  },
  { 
    id: 'fashion', 
    name: 'Fashion', 
    icon: Shirt, 
    subCategories: ['Wearables', 'Accessories', 'Travel'] 
  },
  { 
    id: 'lifestyle', 
    name: 'Lifestyle', 
    icon: Dumbbell, 
    subCategories: ['Fitness'] 
  }
];

export const CategoryNav: React.FC<CategoryNavProps> = ({ onCategoryClick, onViewAllClick }) => {
  const [activeMainCategory, setActiveMainCategory] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMainCategory(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleMainCategoryClick = (id: string) => {
    setActiveMainCategory(activeMainCategory === id ? null : id);
  };

  return (
    <>
        {/* CATEGORY NAVIGATION BAR */}
        <div className="bg-white border-b border-gray-200 sticky top-20 z-40 shadow-sm transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="flex items-center gap-1 md:gap-8 overflow-x-auto scrollbar-hide h-14">
                    {CATEGORY_HIERARCHY.map((cat) => {
                        const isActive = activeMainCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => handleMainCategoryClick(cat.id)}
                                className={`flex items-center gap-2 h-full px-4 text-sm font-bold border-b-4 transition-all whitespace-nowrap outline-none ${
                                    isActive 
                                    ? 'border-indigo-600 text-indigo-600' 
                                    : 'border-transparent text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                                }`}
                            >
                                <cat.icon size={18} className={isActive ? "text-indigo-600" : "text-gray-400"} />
                                {cat.name}
                            </button>
                        );
                    })}
                    
                    {/* Divider */}
                    <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>
                    
                    <button onClick={onViewAllClick} className="hidden md:block text-sm font-medium text-gray-500 hover:text-indigo-600 whitespace-nowrap">
                        View All Products
                    </button>
                </div>

                {/* MODAL / MEGA MENU OVERLAY */}
                {activeMainCategory && (
                  <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-b-2xl border-t border-gray-100 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200 z-50">
                     {(() => {
                        const cat = CATEGORY_HIERARCHY.find(c => c.id === activeMainCategory);
                        if (!cat) return null;
                        return (
                            <div className="flex flex-col md:flex-row min-h-[300px]">
                                {/* Left Side: Highlight / Info */}
                                <div className="hidden md:flex md:w-1/4 bg-gray-50 p-8 flex-col justify-between border-r border-gray-100 relative overflow-hidden">
                                    <div className="z-10 relative">
                                        <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{cat.name}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                            Explore our premium selection of {cat.name.toLowerCase()}.
                                        </p>
                                        <button 
                                            onClick={() => {
                                                onViewAllClick();
                                                setActiveMainCategory(null);
                                            }}
                                            className="text-indigo-600 font-bold text-sm flex items-center hover:gap-2 transition-all"
                                        >
                                            Shop All {cat.name} <ArrowRight size={16} className="ml-1"/>
                                        </button>
                                    </div>
                                    <div className="absolute -bottom-10 -right-10 text-indigo-100 opacity-50 z-0">
                                        <cat.icon size={200} />
                                    </div>
                                </div>

                                {/* Right Side: Subcategories Grid */}
                                <div className="flex-1 p-8 bg-white">
                                    <div className="flex justify-between items-center mb-6">
                                         <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Browse Categories</span>
                                         <button 
                                            onClick={() => setActiveMainCategory(null)} 
                                            className="md:hidden p-2 text-gray-400 hover:bg-gray-100 rounded-full"
                                         >
                                            <X size={20} />
                                         </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {cat.subCategories.map((sub) => (
                                            <button
                                                key={sub}
                                                onClick={() => {
                                                    onCategoryClick(sub);
                                                    setActiveMainCategory(null);
                                                }}
                                                className="group flex items-center p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-md transition-all text-left"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-sm">
                                                    <ChevronRight size={20} />
                                                </div>
                                                <div>
                                                    <span className="block font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{sub}</span>
                                                    <span className="text-xs text-gray-400 group-hover:text-indigo-500 transition-colors">View Collection</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                     })()}
                  </div>
                )}
            </div>
        </div>

        {/* BACKDROP */}
        {activeMainCategory && (
            <div 
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-30 animate-in fade-in duration-300" 
                style={{ top: '136px' }} // Positioned below the Navbar (80px) and CategoryNav (56px)
                onClick={() => setActiveMainCategory(null)}
            />
        )}
    </>
  );
};
