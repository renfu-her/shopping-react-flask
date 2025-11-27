import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { User, CartItem, Product } from '../types';
import { logout as apiLogout, getCurrentUser } from '../services/api';

interface AppContextType {
  user: User | null;
  cart: CartItem[];
  selectedCategory: string | null;
  currentPage: number;
  isLoadingUser: boolean;
  setUser: (user: User | null) => void;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setSelectedCategory: (category: string | null) => void;
  setCurrentPage: (page: number) => void;
  addToCart: (product: Product) => void;
  updateQuantity: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  handleLogin: (userData: User) => void;
  handleLogout: () => void;
  handleCategorySelect: (category: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Auto-verify session on mount and restore user state
  useEffect(() => {
    const verifySession = async () => {
      try {
        // 嘗試從 session 獲取當前用戶
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error: any) {
          // Session 無效或不存在
          setUser(null);
        }
      } catch (error: any) {
        console.error('[AppContext] Error in verifySession:', error);
        setUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };

    verifySession();
  }, []);

  const addToCart = useCallback((product: Product) => {
    if (!user) {
      return; // Navigation will be handled by the component
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, [user]);

  const updateQuantity = useCallback((id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) return { ...item, quantity: Math.max(1, item.quantity + delta) };
      return item;
    }));
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleLogin = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  const handleLogout = useCallback(async () => {
    await apiLogout(); // 清除 session
    setUser(null);
    setCart([]);
  }, []);

  const handleCategorySelect = useCallback((category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  }, []);

  const value = useMemo(() => ({
    user,
    cart,
    selectedCategory,
    currentPage,
    isLoadingUser,
    setUser,
    setCart,
    setSelectedCategory,
    setCurrentPage,
    addToCart,
    updateQuantity,
    removeFromCart,
    handleLogin,
    handleLogout,
    handleCategorySelect,
  }), [user, cart, selectedCategory, currentPage, isLoadingUser, addToCart, updateQuantity, removeFromCart, handleLogin, handleLogout, handleCategorySelect]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Export hook separately to avoid Fast Refresh issues
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

