const API_BASE_URL = 'http://localhost:8000/api';

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

export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

export async function fetchAds(): Promise<Ad[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/ads`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ads: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching ads:', error);
    throw error;
  }
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

export async function fetchHotProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/home/hot`);
    if (!response.ok) {
      throw new Error(`Failed to fetch hot products: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching hot products:', error);
    throw error;
  }
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/home/featured`);
    if (!response.ok) {
      throw new Error(`Failed to fetch featured products: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
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

export async function fetchNews(): Promise<NewsItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/news`);
    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.statusText}`);
    }
    const data: NewsListResponse = await response.json();
    // Map the API response to match frontend NewsItem format
    // Convert date from ISO format to YYYY-MM-DD if needed
    return data.news.map(item => ({
      ...item,
      date: item.date.split('T')[0], // Extract date part from ISO string
      excerpt: item.excerpt || '', // Ensure excerpt is never null
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
}

export async function fetchNewsDetail(newsId: number): Promise<NewsItem> {
  try {
    const response = await fetch(`${API_BASE_URL}/news/${newsId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch news detail: ${response.statusText}`);
    }
    const data: NewsItem = await response.json();
    // Map the API response to match frontend NewsItem format
    return {
      ...data,
      date: data.date.split('T')[0], // Extract date part from ISO string
      excerpt: data.excerpt || '', // Ensure excerpt is never null
    };
  } catch (error) {
    console.error('Error fetching news detail:', error);
    throw error;
  }
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export async function fetchProducts(
  categoryId?: number | null,
  page: number = 1,
  pageSize: number = 9
): Promise<ProductListResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    
    if (categoryId) {
      params.append('category_id', categoryId.toString());
    }
    
    const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    const data: ProductListResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

