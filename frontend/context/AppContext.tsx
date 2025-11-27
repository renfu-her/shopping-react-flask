import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { User, CartItem, Product } from '../types';
import { logout as apiLogout, getCurrentUser, getCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeCartItem as apiRemoveCartItem } from '../services/api';

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
          // 載入購物車
          try {
            const cartData = await getCart();
            // 轉換 CartItemResponse 為 CartItem
            const cartItems: CartItem[] = cartData.items.map(item => ({
              ...item.product,
              quantity: item.quantity,
            }));
            setCart(cartItems);
          } catch (error) {
            // 購物車可能為空，設為空數組
            setCart([]);
          }
        } catch (error: any) {
          // Session 無效或不存在
          setUser(null);
          setCart([]);
        }
      } catch (error: any) {
        console.error('[AppContext] Error in verifySession:', error);
        setUser(null);
        setCart([]);
      } finally {
        setIsLoadingUser(false);
      }
    };

    verifySession();
  }, []);

  const addToCart = useCallback(async (product: Product) => {
    if (!user) {
      return; // Navigation will be handled by the component
    }
    try {
      // 檢查購物車中是否已有該商品
      const existing = cart.find(item => item.id === product.id);
      const quantity = existing ? existing.quantity + 1 : 1;
      
      // 調用 API 添加商品
      const cartData = await apiAddToCart({
        product_id: product.id,
        quantity: 1, // 每次添加 1 個
      });
      
      // 更新本地狀態
      const cartItems: CartItem[] = cartData.items.map(item => ({
        ...item.product,
        quantity: item.quantity,
      }));
      setCart(cartItems);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }, [user, cart]);

  const updateQuantity = useCallback(async (id: number, delta: number) => {
    if (!user) return;
    
    const item = cart.find(item => item.id === id);
    if (!item) return;
    
    const newQuantity = Math.max(1, item.quantity + delta);
    
    try {
      // 找到 cart item ID（需要從 API 獲取的完整購物車數據中獲取）
      // 這裡我們需要重新獲取購物車來找到正確的 item ID
      const cartData = await getCart();
      const cartItem = cartData.items.find(ci => ci.product_id === id);
      
      if (cartItem) {
        await apiUpdateCartItem(cartItem.id, { quantity: newQuantity });
        // 重新載入購物車
        const updatedCart = await getCart();
        const cartItems: CartItem[] = updatedCart.items.map(ci => ({
          ...ci.product,
          quantity: ci.quantity,
        }));
        setCart(cartItems);
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }, [user, cart]);

  const removeFromCart = useCallback(async (id: number) => {
    if (!user) return;
    
    try {
      // 獲取購物車以找到正確的 item ID
      const cartData = await getCart();
      const cartItem = cartData.items.find(ci => ci.product_id === id);
      
      if (cartItem) {
        await apiRemoveCartItem(cartItem.id);
        // 更新本地狀態
    setCart(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  }, [user]);

  const handleLogin = useCallback(async (userData: User) => {
    setUser(userData);
    // 載入購物車
    try {
      const cartData = await getCart();
      const cartItems: CartItem[] = cartData.items.map(item => ({
        ...item.product,
        quantity: item.quantity,
      }));
      setCart(cartItems);
    } catch (error) {
      // 購物車可能為空
      setCart([]);
    }
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

