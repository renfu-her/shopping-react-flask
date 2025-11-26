import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronRight, Cpu, Armchair, Shirt, Dumbbell, X, Package } from 'lucide-react';
import { fetchCategories, Category } from '../services/api';

interface CategoryNavProps {
  onCategoryClick: (category: string) => void;
  onViewAllClick: () => void;
}

// Icon mapping function
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('electron') || name.includes('tech')) return Cpu;
  if (name.includes('home') || name.includes('living') || name.includes('furniture')) return Armchair;
  if (name.includes('fashion') || name.includes('wear') || name.includes('cloth')) return Shirt;
  if (name.includes('lifestyle') || name.includes('fitness') || name.includes('sport')) return Dumbbell;
  return Package; // Default icon
};

export const CategoryNav: React.FC<CategoryNavProps> = ({ onCategoryClick, onViewAllClick }) => {
  const [activeMainCategory, setActiveMainCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        setError('Failed to load categories');
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMainCategory(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleMainCategoryClick = (id: number) => {
    setActiveMainCategory(activeMainCategory === id ? null : id);
  };

  // Show loading or error state
  if (loading) {
    return (
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-14">
            <span className="text-gray-500 text-sm">Loading categories...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-14">
            <span className="text-red-500 text-sm">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  // Filter root categories (parent_id is null)
  const rootCategories = categories.filter(cat => cat.parent_id === null);

  return (
    <>
        {/* CATEGORY NAVIGATION BAR */}
        <div className="bg-white border-b border-gray-200 sticky top-20 z-40 shadow-sm transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="flex items-center gap-1 md:gap-8 overflow-x-auto scrollbar-hide h-14">
                    {rootCategories.map((cat) => {
                        const isActive = activeMainCategory === cat.id;
                        const IconComponent = getCategoryIcon(cat.name);
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
                                <IconComponent size={18} className={isActive ? "text-indigo-600" : "text-gray-400"} />
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
                        const cat = rootCategories.find(c => c.id === activeMainCategory);
                        if (!cat) return null;
                        const IconComponent = getCategoryIcon(cat.name);
                        const subCategories = cat.children || [];
                        return (
                            <div className="flex flex-col md:flex-row min-h-[300px]">
                                {/* Left Side: Highlight / Info */}
                                <div className="hidden md:flex md:w-1/4 bg-gray-50 p-8 flex-col justify-between border-r border-gray-100 relative overflow-hidden">
                                    <div className="z-10 relative">
                                        <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{cat.name}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                            {cat.description || `Explore our premium selection of ${cat.name.toLowerCase()}.`}
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
                                        <IconComponent size={200} />
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
                                    
                                    {subCategories.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {subCategories.map((sub) => (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => {
                                                        onCategoryClick(sub.name);
                                                        setActiveMainCategory(null);
                                                    }}
                                                    className="group flex items-center p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-md transition-all text-left"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-sm">
                                                        <ChevronRight size={20} />
                                                    </div>
                                                    <div>
                                                        <span className="block font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{sub.name}</span>
                                                        <span className="text-xs text-gray-400 group-hover:text-indigo-500 transition-colors">View Collection</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            No subcategories available
                                        </div>
                                    )}
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
