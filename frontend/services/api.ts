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

