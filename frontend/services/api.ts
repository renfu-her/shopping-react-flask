const API_BASE_URL = 'https://shopping-react.ai-tacks.com/api';

// ==================== Types ====================

export interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  image: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
  children: Category[];
}

export interface Ad {
  id: number;
  title: string;
  image_url: string;
  link_url: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string | null;
  image: string;
  category_id: number;
  category_name: string | null;
  stock: number;
  is_active: boolean;
  created_at: string;
  product_images: Array<{
    id: number;
    image_url: string;
    order_index: number;
  }>;
}

export interface NewsItem {
  id: number;
  title: string;
  excerpt: string | null;
  content: string;
  image: string;
  date: string;
  created_at: string;
}

export interface NewsListResponse {
  news: NewsItem[];
  total: number;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  phone?: string;
  address?: string;
  county?: string;
  district?: string;
  zipcode?: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  county?: string;
  district?: string;
  zipcode?: string;
}

export interface UserPasswordUpdateRequest {
  current_password: string;
  new_password: string;
}

export interface ECPayOrderRequest {
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_zip: string;
  payment_method?: string;
}

export interface ECPayOrderResponse {
  order_id: number;
  merchant_trade_no: string;
  form_data: Record<string, string>;
  form_url: string;
}

// Cart Types
export interface CartItemResponse {
  id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

export interface CartResponse {
  id: number;
  user_id: number;
  items: CartItemResponse[];
  total: number;
  created_at: string;
  updated_at: string;
}

export interface CartItemCreate {
  product_id: number;
  quantity: number;
}

export interface CartItemUpdate {
  quantity: number;
}

// Order Types
export interface OrderItemResponse {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: Product;
}

export interface OrderResponse {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_zip: string;
  payment_method: string | null;
  items: OrderItemResponse[];
  created_at: string;
  updated_at: string;
}

export interface OrderCreate {
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_zip: string;
  payment_method?: string;
}

// ==================== API Client ====================

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

/**
 * 统一的 API 请求函数
 * @param endpoint API 端点（不包含 base URL）
 * @param options 请求选项
 * @returns Promise<T>
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = false, ...fetchOptions } = options;
  
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  const config: RequestInit = {
    ...fetchOptions,
    headers,
    credentials: requiresAuth ? 'include' : 'same-origin',
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        detail: response.statusText 
      }));
      throw new Error(errorData.detail || `Request failed: ${response.statusText}`);
    }

    // 处理空响应（如 204 No Content）
    if (response.status === 204) {
      return undefined as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

// ==================== Public API ====================

// Categories
export async function fetchCategories(): Promise<Category[]> {
  return apiRequest<Category[]>('/categories');
}

// Ads
export async function fetchAds(): Promise<Ad[]> {
  return apiRequest<Ad[]>('/ads');
}

// Products
export async function fetchHotProducts(): Promise<Product[]> {
  return apiRequest<Product[]>('/home/hot');
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  return apiRequest<Product[]>('/home/featured');
}

export async function fetchProducts(
  categoryId?: number | null,
  page: number = 1,
  pageSize: number = 9
): Promise<ProductListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  
  if (categoryId) {
    params.append('category_id', categoryId.toString());
  }
  
  return apiRequest<ProductListResponse>(`/products?${params.toString()}`);
}

export async function fetchProductDetail(productId: number): Promise<Product> {
  return apiRequest<Product>(`/products/${productId}`);
}

// News
export async function fetchNews(): Promise<NewsItem[]> {
  const data = await apiRequest<NewsListResponse>('/news');
  return data.news.map(item => ({
    ...item,
    date: item.date.split('T')[0],
    excerpt: item.excerpt || '',
  }));
}

export async function fetchNewsDetail(newsId: number): Promise<NewsItem> {
  const data = await apiRequest<NewsItem>(`/news/${newsId}`);
  return {
    ...data,
    date: data.date.split('T')[0],
    excerpt: data.excerpt || '',
  };
}

// Authentication
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    requiresAuth: true,
    body: JSON.stringify(credentials),
  });
}

export async function register(userData: RegisterRequest): Promise<User> {
  return apiRequest<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function logout(): Promise<void> {
  await apiRequest<void>('/auth/logout', {
    method: 'POST',
    requiresAuth: true,
  });
}

export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>('/auth/me', {
    method: 'GET',
    requiresAuth: true,
  });
}

// User Profile
export async function updateUserProfile(userData: UserUpdateRequest): Promise<User> {
  return apiRequest<User>('/auth/me', {
    method: 'PUT',
    requiresAuth: true,
    body: JSON.stringify(userData),
  });
}

export async function updateUserPassword(
  passwordData: UserPasswordUpdateRequest
): Promise<User> {
  return apiRequest<User>('/auth/me/password', {
    method: 'PUT',
    requiresAuth: true,
    body: JSON.stringify(passwordData),
  });
}

// Cart
export async function getCart(): Promise<CartResponse> {
  return apiRequest<CartResponse>('/cart', {
    method: 'GET',
    requiresAuth: true,
  });
}

export async function addToCart(item: CartItemCreate): Promise<CartResponse> {
  return apiRequest<CartResponse>('/cart/items', {
    method: 'POST',
    requiresAuth: true,
    body: JSON.stringify(item),
  });
}

export async function updateCartItem(
  itemId: number,
  update: CartItemUpdate
): Promise<CartResponse> {
  return apiRequest<CartResponse>(`/cart/items/${itemId}`, {
    method: 'PUT',
    requiresAuth: true,
    body: JSON.stringify(update),
  });
}

export async function removeCartItem(itemId: number): Promise<CartResponse> {
  return apiRequest<CartResponse>(`/cart/items/${itemId}`, {
    method: 'DELETE',
    requiresAuth: true,
  });
}

export async function clearCart(): Promise<void> {
  return apiRequest<void>('/cart', {
    method: 'DELETE',
    requiresAuth: true,
  });
}

// Orders
export async function createOrder(orderData: OrderCreate): Promise<OrderResponse> {
  return apiRequest<OrderResponse>('/orders', {
    method: 'POST',
    requiresAuth: true,
    body: JSON.stringify(orderData),
  });
}

export async function getOrders(): Promise<OrderResponse[]> {
  return apiRequest<OrderResponse[]>('/orders', {
    method: 'GET',
    requiresAuth: true,
  });
}

export async function getOrder(orderId: number): Promise<OrderResponse> {
  return apiRequest<OrderResponse>(`/orders/${orderId}`, {
    method: 'GET',
    requiresAuth: true,
  });
}

// ECPay
export async function createECPayOrder(
  orderData: ECPayOrderRequest
): Promise<ECPayOrderResponse> {
  return apiRequest<ECPayOrderResponse>('/ecpay/create-order', {
    method: 'POST',
    requiresAuth: true,
    body: JSON.stringify(orderData),
  });
}
