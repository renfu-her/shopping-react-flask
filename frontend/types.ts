export enum AppView {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  HOME = 'HOME',
  PRODUCT_LIST = 'PRODUCT_LIST',
  PRODUCT_DETAIL = 'PRODUCT_DETAIL',
  CART = 'CART',
  CHECKOUT = 'CHECKOUT',
  ORDER_SUCCESS = 'ORDER_SUCCESS',
  ABOUT = 'ABOUT',
  NEWS = 'NEWS',
  NEWS_DETAIL = 'NEWS_DETAIL'
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  email: string;
  name: string;
}

export interface OrderDetails {
  name: string;
  address: string;
  city: string;
  zip: string;
  cardNumber: string;
}

export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  content: string;
}

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