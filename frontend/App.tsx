import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import { AppView, CartItem, Product, User, NewsItem } from './types';
import { Auth } from './components/Auth';
import { ProductList } from './components/ProductList';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { AiAssistant } from './components/AiAssistant';
import { Home } from './components/Home';
import { ProductDetail } from './components/ProductDetail';
import { NewsDetail } from './components/NewsDetail';
import { CategoryNav } from './components/CategoryNav';
import { ShoppingCart, LogOut, CheckCircle, Menu, X, ChevronDown, LogIn, ShoppingBag, Twitter, Facebook, Instagram, Clock, ChevronRight } from 'lucide-react';

// Expanded Mock Data with Specific Subcategories matching Home.tsx hierarchy
const PRODUCTS: Product[] = [
  { id: 1, title: 'Lumina Noise-Cancel Headphones', price: 299, category: 'Audio', description: 'Experience pure silence with our top-tier noise cancellation.', image: 'https://picsum.photos/seed/tech1/600/600' },
  { id: 2, title: 'Ergonomic Mesh Office Chair', price: 189, category: 'Furniture', description: 'Work in comfort all day long with breathable mesh.', image: 'https://picsum.photos/seed/furn1/600/600' },
  { id: 3, title: 'Minimalist Analog Watch', price: 129, category: 'Wearables', description: 'Timeless design meeting modern durability.', image: 'https://picsum.photos/seed/acc1/600/600' },
  { id: 4, title: 'Smart Fitness Tracker', price: 89, category: 'Wearables', description: 'Track your steps, heart rate, and sleep patterns.', image: 'https://picsum.photos/seed/tech2/600/600' },
  { id: 5, title: 'Leather Weekend Bag', price: 249, category: 'Travel', description: 'Handcrafted premium leather bag perfect for short getaways.', image: 'https://picsum.photos/seed/bag1/600/600' },
  { id: 6, title: 'Wireless Charging Dock', price: 49, category: 'Gadgets', description: 'Charge all your devices simultaneously.', image: 'https://picsum.photos/seed/tech3/600/600' },
  { id: 7, title: 'Premium Coffee Maker', price: 159, category: 'Kitchen', description: 'Barista-quality coffee in the comfort of your kitchen.', image: 'https://picsum.photos/seed/home1/600/600' },
  { id: 8, title: 'Urban Daypack', price: 79, category: 'Travel', description: 'Stylish and functional backpack for the daily commuter.', image: 'https://picsum.photos/seed/bag2/600/600' },
  { id: 9, title: 'Mechanical Keyboard', price: 149, category: 'Hobbies', description: 'Tactile switches for the ultimate typing experience.', image: 'https://picsum.photos/seed/tech4/600/600' },
  { id: 10, title: 'Ceramic Vase Set', price: 65, category: 'Decor', description: 'Minimalist ceramic vases to elevate your home decor.', image: 'https://picsum.photos/seed/home2/600/600' },
  { id: 11, title: 'Designer Sunglasses', price: 199, category: 'Accessories', description: 'UV protection with a classic frame design.', image: 'https://picsum.photos/seed/acc2/600/600' },
  { id: 12, title: 'Bluetooth Speaker', price: 119, category: 'Audio', description: '360-degree sound for your outdoor adventures.', image: 'https://picsum.photos/seed/tech5/600/600' },
  { id: 13, title: 'Cotton Throw Blanket', price: 45, category: 'Decor', description: 'Soft, breathable cotton for cozy evenings.', image: 'https://picsum.photos/seed/home3/600/600' },
  { id: 14, title: 'Leather Wallet', price: 55, category: 'Accessories', description: 'Slim profile with RFID blocking technology.', image: 'https://picsum.photos/seed/acc3/600/600' },
  { id: 15, title: 'Desk Lamp', price: 39, category: 'Furniture', description: 'Adjustable LED brightness for late night work.', image: 'https://picsum.photos/seed/furn2/600/600' },
  { id: 16, title: 'Yoga Mat', price: 29, category: 'Fitness', description: 'Non-slip surface for perfect stability.', image: 'https://picsum.photos/seed/fit1/600/600' },
  { id: 17, title: 'Running Shoes', price: 110, category: 'Fitness', description: 'Lightweight and breathable for long distance runs.', image: 'https://picsum.photos/seed/fit2/600/600' },
  { id: 18, title: 'Smart Home Hub', price: 129, category: 'Gadgets', description: 'Control your entire home with voice commands.', image: 'https://picsum.photos/seed/tech6/600/600' },
  { id: 19, title: 'Cookware Set', price: 299, category: 'Kitchen', description: 'Non-stick professional grade pots and pans.', image: 'https://picsum.photos/seed/home4/600/600' },
  { id: 20, title: 'Winter Scarf', price: 35, category: 'Accessories', description: 'Warm wool blend for the colder months.', image: 'https://picsum.photos/seed/fash1/600/600' },
  // New Products (Total 18 added)
  { id: 21, title: 'Pro Laptop 15"', price: 1299, category: 'Computers', description: 'High performance laptop for professionals.', image: 'https://picsum.photos/seed/comp1/600/600' },
  { id: 22, title: 'Gaming Desktop', price: 1899, category: 'Computers', description: 'Ultimate gaming experience with RTX graphics.', image: 'https://picsum.photos/seed/comp2/600/600' },
  { id: 23, title: 'Curved Monitor 34"', price: 499, category: 'Computers', description: 'Immersive ultrawide display.', image: 'https://picsum.photos/seed/comp3/600/600' },
  { id: 24, title: 'RGB Mechanical Keyboard', price: 159, category: 'Computers', description: 'Customizable lighting and clicky switches.', image: 'https://picsum.photos/seed/comp4/600/600' },
  { id: 25, title: 'Wireless Mouse', price: 79, category: 'Computers', description: 'Precision tracking with long battery life.', image: 'https://picsum.photos/seed/comp5/600/600' },
  { id: 26, title: 'Portable SSD 2TB', price: 229, category: 'Computers', description: 'Rugged and fast external storage.', image: 'https://picsum.photos/seed/comp6/600/600' },
  { id: 27, title: 'HD Webcam', price: 69, category: 'Computers', description: 'Crystal clear video conferencing.', image: 'https://picsum.photos/seed/comp7/600/600' },
  { id: 28, title: 'USB-C Docking Station', price: 149, category: 'Computers', description: 'Connect all your peripherals with one cable.', image: 'https://picsum.photos/seed/comp8/600/600' },
  { id: 29, title: 'Laptop Cooling Pad', price: 39, category: 'Computers', description: 'Keep your device cool under load.', image: 'https://picsum.photos/seed/comp9/600/600' },
  { id: 30, title: 'Drawing Tablet', price: 299, category: 'Computers', description: 'Professional grade pen display.', image: 'https://picsum.photos/seed/comp10/600/600' },
  { id: 31, title: 'Wireless Earbuds Pro', price: 199, category: 'Audio', description: 'Active noise cancellation in a compact form.', image: 'https://picsum.photos/seed/audio3/600/600' },
  { id: 32, title: 'Smart Doorbell', price: 149, category: 'Gadgets', description: 'Video security for your front door.', image: 'https://picsum.photos/seed/gadget7/600/600' },
  { id: 33, title: 'Robot Vacuum Cleaner', price: 349, category: 'Gadgets', description: 'Automated cleaning with mapping technology.', image: 'https://picsum.photos/seed/gadget8/600/600' },
  { id: 34, title: 'Mini Drone', price: 89, category: 'Hobbies', description: 'Fun flying for beginners.', image: 'https://picsum.photos/seed/hobby3/600/600' },
  { id: 35, title: 'VR Headset', price: 399, category: 'Gadgets', description: 'Standalone virtual reality system.', image: 'https://picsum.photos/seed/gadget9/600/600' },
  { id: 36, title: 'Smart Thermostat', price: 179, category: 'Gadgets', description: 'Save energy with intelligent climate control.', image: 'https://picsum.photos/seed/gadget10/600/600' },
  { id: 37, title: 'Action Camera', price: 299, category: 'Hobbies', description: 'Capture your adventures in 4K.', image: 'https://picsum.photos/seed/hobby4/600/600' },
  { id: 38, title: 'WiFi 6 Router', price: 199, category: 'Computers', description: 'High speed internet for the whole home.', image: 'https://picsum.photos/seed/comp11/600/600' },
];

const NEWS_ITEMS: NewsItem[] = [
    { 
      id: 1, 
      title: "The Future of Smart Homes", 
      date: "Oct 12, 2024", 
      image: "https://images.unsplash.com/photo-1558002038-109155713917?auto=format&fit=crop&w=800&q=80", 
      excerpt: "Discover how AI is transforming the way we interact with our living spaces.",
      content: "Artificial Intelligence is rapidly reshaping the landscape of home automation. From predictive climate control that learns your preferences to security systems that can distinguish between a family member and a stranger, the smart home of the future is more intuitive than ever.\n\nIn this report, we explore the latest gadgets that not only make life easier but also contribute to energy efficiency and sustainability. Companies are now focusing on interoperability, ensuring that your smart fridge can talk to your oven, and your car can communicate with your garage door seamlessly.\n\nWe also take a look at privacy concerns and how the industry is addressing the need for secure, local processing of data to keep your personal life private while still enjoying the benefits of a connected home."
    },
    { 
      id: 2, 
      title: "Sustainable Fashion Trends", 
      date: "Oct 08, 2024", 
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80", 
      excerpt: "Why eco-friendly materials are becoming the new standard in luxury apparel.",
      content: "The fashion industry is undergoing a massive shift towards sustainability. Gone are the days when 'eco-friendly' meant sacrificing style. Today, luxury brands are pioneering the use of recycled materials, organic cotton, and even lab-grown leather alternatives.\n\nThis article dives deep into the processes behind these new materials. We interview top designers who are committing to zero-waste manufacturing and explore how consumer demand is driving this change. \n\nLearn how you can build a wardrobe that looks good and feels good, knowing that you are supporting ethical labor practices and reducing your carbon footprint."
    },
    { 
      id: 3, 
      title: "Minimalism in 2025", 
      date: "Sep 28, 2024", 
      image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=800&q=80", 
      excerpt: "Exploring the aesthetic shift towards cleaner lines and functional design.",
      content: "Minimalism is more than just a design trend; it's a lifestyle. As we move into 2025, the clutter of the digital age is driving a desire for physical spaces that offer calm and clarity.\n\nWe analyze the architectural and interior design trends that emphasize open spaces, natural light, and multi-functional furniture. 'Less is more' has never been more relevant.\n\nDiscover how decluttering your space can lead to a less cluttered mind, and see examples of stunning minimalist homes from around the world that prove simplicity is the ultimate sophistication."
    }
];

const ITEMS_PER_PAGE = 9;

// Main App Component with Router
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

// App Content Component (needs to be inside Router)
const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Logic for filtered products
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return PRODUCTS;
    return PRODUCTS.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  // Logic for pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const categories = useMemo(() => Array.from(new Set(PRODUCTS.map(p => p.category))), []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    navigate('/');
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    navigate('/sign');
  };

  const addToCart = (product: Product) => {
    if (!user) {
        navigate('/sign');
        return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) return { ...item, quantity: Math.max(1, item.quantity + delta) };
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  const handleNewsClick = (newsItem: NewsItem) => {
    navigate(`/news/${newsItem.id}`);
  };

  const handleCategorySelect = (category: string | null) => {
      setSelectedCategory(category);
      setCurrentPage(1);
      navigate('/shop');
      setMobileMenuOpen(false);
  };

  const handleCheckoutSubmit = () => {
    setCart([]);
    navigate('/shop-finish');
  };

  // Helper to determine AI context string
  const getAiContext = () => {
    const path = location.pathname;
    if (path.startsWith('/product/')) {
      const productId = path.split('/')[2];
      const product = PRODUCTS.find(p => p.id === parseInt(productId));
      return product ? `Viewing Product: ${product.title} - Price: $${product.price}` : 'Viewing a Product';
    }
    if (path === '/cart') {
      return `Viewing Cart with ${cart.length} items`;
    }
    if (path === '/checkout') {
      return 'During Checkout';
    }
    if (path === '/shop') {
      return `Browsing Shop - Category: ${selectedCategory || 'All'}`;
    }
    if (path === '/') {
      return 'Home Page';
    }
    if (path === '/about') {
      return 'About Us Page';
    }
    if (path === '/news') {
      return 'Reading News List';
    }
    if (path.startsWith('/news/')) {
      const newsId = path.split('/')[2];
      const news = NEWS_ITEMS.find(n => n.id === parseInt(newsId));
      return news ? `Reading Article: ${news.title}` : 'Reading News';
    }
    return 'General Shopping';
  };

  const OrderSuccess = () => (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={48} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h2>
          <p className="text-gray-500 max-w-md mb-8">
              Thank you for your purchase. We've sent a confirmation email to your inbox. Your order will be shipped shortly.
          </p>
          <button 
              onClick={() => navigate('/')}
              className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg"
          >
              Continue Shopping
          </button>
      </div>
  );

  // Render Navbar
  const Navbar = () => {
    const isActive = (path: string) => location.pathname === path || (path === '/shop' && location.pathname.startsWith('/product/'));
    
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
              <button onClick={() => navigate('/')} className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}>Home</button>
              <button 
                onClick={() => { handleCategorySelect(null); navigate('/shop'); }}
                className={`text-sm font-medium transition-colors ${isActive('/shop') ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
              >
                Shop
              </button>
              <button onClick={() => navigate('/news')} className={`text-sm font-medium transition-colors ${isActive('/news') ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}>News</button>
              <button onClick={() => navigate('/about')} className={`text-sm font-medium transition-colors ${isActive('/about') ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}>About</button>
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
                  <div className="hidden md:flex items-center gap-3 pl-4 border-l border-gray-200">
                      <div className="text-right">
                          <p className="text-xs text-gray-500">Welcome,</p>
                          <p className="text-sm font-bold text-gray-900 leading-none">{user.name}</p>
                      </div>
                      <button onClick={handleLogout} className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors" title="Logout">
                          <LogOut size={18} />
                      </button>
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
                  <button onClick={() => { navigate('/'); setMobileMenuOpen(false); }} className="block w-full text-left p-2 font-medium text-gray-900 hover:bg-gray-50 rounded-lg">Home</button>
                  <button onClick={() => { navigate('/shop'); setMobileMenuOpen(false); }} className="block w-full text-left p-2 font-medium text-gray-900 hover:bg-gray-50 rounded-lg">Shop All</button>
                  <button onClick={() => { navigate('/news'); setMobileMenuOpen(false); }} className="block w-full text-left p-2 font-medium text-gray-900 hover:bg-gray-50 rounded-lg">News</button>
                  <button onClick={() => { navigate('/cart'); setMobileMenuOpen(false); }} className="block w-full text-left p-2 font-medium text-gray-900 hover:bg-gray-50 rounded-lg">Cart ({cartCount})</button>
                  
                  {user ? (
                      <button onClick={handleLogout} className="block w-full text-left p-2 font-medium text-red-600 hover:bg-red-50 rounded-lg">Logout ({user.name})</button>
                  ) : (
                      <button onClick={() => { navigate('/sign'); setMobileMenuOpen(false); }} className="block w-full text-left p-2 font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg">Sign In / Register</button>
                  )}
                </div>
            </div>
        )}
      </nav>
    );
  };

  const Footer = () => (
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
                        <li className="hover:text-indigo-600 cursor-pointer" onClick={() => { handleCategorySelect(null); navigate('/shop'); }}>All Products</li>
                        <li className="hover:text-indigo-600 cursor-pointer" onClick={() => handleCategorySelect('Audio')}>Audio</li>
                        <li className="hover:text-indigo-600 cursor-pointer" onClick={() => handleCategorySelect('Wearables')}>Wearables</li>
                        <li className="hover:text-indigo-600 cursor-pointer" onClick={() => handleCategorySelect('Decor')}>Home Decor</li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-bold text-gray-900 mb-4">Company</h3>
                    <ul className="space-y-3 text-sm text-gray-500">
                        <li className="hover:text-indigo-600 cursor-pointer" onClick={() => navigate('/about')}>About Us</li>
                        <li className="hover:text-indigo-600 cursor-pointer">Careers</li>
                        <li className="hover:text-indigo-600 cursor-pointer" onClick={() => navigate('/news')}>News</li>
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

  // Route Components
  const HomePage = () => (
    <>
      {(location.pathname === '/' || location.pathname === '/shop') && (
        <CategoryNav 
          onCategoryClick={handleCategorySelect}
          onViewAllClick={() => {
            handleCategorySelect(null);
            navigate('/shop');
          }}
        />
      )}
      <Home 
        featuredProducts={filteredProducts.slice(0, 3)} 
        newsItems={NEWS_ITEMS}
        onShopNow={() => {
          handleCategorySelect(null);
          navigate('/shop');
        }}
        onProductClick={handleProductClick}
        onCategoryClick={handleCategorySelect}
        onNewsClick={handleNewsClick}
      />
    </>
  );

  const ShopPage = () => (
    <>
      <CategoryNav 
        onCategoryClick={handleCategorySelect}
        onViewAllClick={() => {
          handleCategorySelect(null);
          navigate('/shop');
        }}
      />
      <ProductList 
        products={currentProducts} 
        addToCart={addToCart} 
        onProductClick={handleProductClick}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );

  const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const product = PRODUCTS.find(p => p.id === parseInt(id || '0'));
    
    if (!product) {
      return <Navigate to="/shop" replace />;
    }
    
    return (
      <ProductDetail 
        product={product} 
        onBack={() => navigate('/shop')}
        addToCart={addToCart}
      />
    );
  };

  const NewsPage = () => (
    <div className="max-w-7xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Latest News</h1>
        <div className="grid gap-8 md:grid-cols-3">
            {NEWS_ITEMS.map(item => (
                <div 
                   key={item.id} 
                   className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                   onClick={() => handleNewsClick(item)}
                >
                    <div className="h-48 overflow-hidden relative">
                       <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.title}/>
                       <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-gray-800 flex items-center gap-1">
                           <Clock size={12} /> {item.date}
                       </div>
                    </div>
                    <div className="p-6 flex flex-col h-[220px]">
                        <h3 className="font-bold text-xl mb-3 group-hover:text-indigo-600 transition-colors leading-snug">{item.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 flex-1 leading-relaxed line-clamp-3">{item.excerpt}</p>
                        <button 
                           className="text-indigo-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all mt-auto"
                           onClick={(e) => {
                               e.stopPropagation();
                               handleNewsClick(item);
                           }}
                        >
                            Read Article <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  const NewsDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const newsItem = NEWS_ITEMS.find(n => n.id === parseInt(id || '0'));
    
    if (!newsItem) {
      return <Navigate to="/news" replace />;
    }
    
    return (
      <NewsDetail
        newsItem={newsItem}
        onBack={() => navigate('/news')}
      />
    );
  };

  const AboutPage = () => (
    <div className="max-w-3xl mx-auto py-20 px-6 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About Lumina</h1>
        <p className="text-xl text-gray-600 leading-relaxed">
            We are dedicated to bringing you the best products with an AI-powered shopping experience.
        </p>
        <button onClick={() => navigate('/')} className="mt-8 text-indigo-600 font-medium hover:underline">Back to Home</button>
    </div>
  );

  const CartPage = () => (
    <Cart 
      items={cart} 
      updateQuantity={updateQuantity} 
      removeFromCart={removeFromCart} 
      onCheckout={() => navigate(user ? '/checkout' : '/sign')}
      onContinueShopping={() => navigate('/shop')}
    />
  );

  const CheckoutPage = () => (
    <Checkout 
      onBack={() => navigate('/cart')}
      onSubmit={handleCheckoutSubmit}
      total={cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
    />
  );

  const SignPage = () => {
    const [authView, setAuthView] = useState<AppView>(AppView.LOGIN);
    
    return (
      <Auth 
        currentView={authView} 
        setView={setAuthView} 
        onLogin={handleLogin}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Navbar />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/sign" element={<SignPage />} />
          <Route path="/shop-finish" element={<OrderSuccess />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      
      <AiAssistant context={getAiContext()} />
    </div>
  );
};

export default App;
