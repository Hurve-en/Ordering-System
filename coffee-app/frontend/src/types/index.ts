// User types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
  refreshToken: string;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCustomization {
  id: string;
  type: 'size' | 'milk' | 'extra';
  name: string;
  priceAdd: number;
}

// Cart types
export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  customizations?: string;
  price: number;
}

export interface Cart {
  items: CartItem[];
  totalPrice: number;
}

// Order types
export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  customizations?: string;
}

export interface OrderRequest {
  items: OrderItem[];
  totalPrice: number;
  deliveryAddress: string;
}

export interface Order {
  id: string;
  customerId: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  totalPrice: number;
  deliveryAddress: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}