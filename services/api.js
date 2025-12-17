import axios from 'axios';

// Now using Next.js API routes (same origin - port 3000)
const API_URL = '/api';

// Simple cache for GET requests with proper cleanup
const cache = new Map();
const CACHE_DURATION = 30000; // 30 seconds
const MAX_CACHE_SIZE = 50;

// Cleanup expired cache entries periodically
const cleanupCache = () => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
};

// Run cleanup every minute
if (typeof window !== 'undefined') {
  setInterval(cleanupCache, 60000);
}

// Create axios instance with performance optimizations
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add token and handle caching
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Cache GET requests
    if (config.method === 'get' && !config.params?.skipCache) {
      const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        config.adapter = () => Promise.resolve({
          data: cached.data,
          status: 200,
          statusText: 'OK (cached)',
          headers: {},
          config,
        });
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and caching
api.interceptors.response.use(
  (response) => {
    // Cache successful GET requests
    if (response.config.method === 'get' && response.status === 200) {
      const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`;
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
      
      // Clean old cache entries
      if (cache.size > MAX_CACHE_SIZE) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
    }
    
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Dispatch custom event for auth modal
      window.dispatchEvent(new CustomEvent('auth:required'));
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  sendOTP: (data) => api.post('/auth/send-otp', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data)
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  getAllUsers: () => api.get('/user/admin/users')
};

// Product API
export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`)
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart', data),
  updateCart: (data) => api.put(`/cart/${data.productId}`, { quantity: data.quantity }),
  removeFromCart: (productId) => api.delete(`/cart/${productId}`),
  clearCart: () => api.delete('/cart')
};

// Order API
export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders'),
  getOrder: (id) => api.get(`/orders/${id}`),
  getAllOrders: () => api.get('/orders'),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}`, data),
  getAdminStats: () => api.get('/orders/admin/stats')
};

// Payment API
export const paymentAPI = {
  createOrder: (data) => api.post('/payment/create-order', data),
  verifyPayment: (data) => api.post('/payment/verify', data)
};

export default api;
