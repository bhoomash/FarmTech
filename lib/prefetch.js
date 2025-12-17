// Centralized prefetch utilities for optimized navigation
import axios from 'axios';

// Lightweight axios instance for prefetch with short timeout
const prefetchApi = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000, // 5 second timeout for prefetch (non-critical)
});

// Add token to prefetch requests
prefetchApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Prefetch cache with timestamps
const prefetchCache = new Map();
const CACHE_DURATION = 60000; // 1 minute

// Track pending requests to avoid duplicates
const pendingRequests = new Map();

// Check if cache is valid
const isCacheValid = (key) => {
  const cached = prefetchCache.get(key);
  if (!cached) return false;
  return Date.now() - cached.timestamp < CACHE_DURATION;
};

// Get cached data
export const getCachedData = (key) => {
  if (isCacheValid(key)) {
    return prefetchCache.get(key).data;
  }
  return null;
};

// Set cache data
const setCacheData = (key, data) => {
  prefetchCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Prefetch products list
export const prefetchProducts = async (params = {}) => {
  const cacheKey = `products:${JSON.stringify(params)}`;
  if (isCacheValid(cacheKey)) return getCachedData(cacheKey);
  if (pendingRequests.has(cacheKey)) return pendingRequests.get(cacheKey);
  
  const promise = (async () => {
    try {
      const response = await prefetchApi.get('/products', { params });
      const data = response.data.data || [];
      setCacheData(cacheKey, data);
      return data;
    } catch (error) {
      // Silently fail - prefetch is non-critical
      return null;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();
  
  pendingRequests.set(cacheKey, promise);
  return promise;
};

// Prefetch single product
export const prefetchProduct = async (productId) => {
  const cacheKey = `product:${productId}`;
  if (isCacheValid(cacheKey)) return getCachedData(cacheKey);
  if (pendingRequests.has(cacheKey)) return pendingRequests.get(cacheKey);
  
  const promise = (async () => {
    try {
      const response = await prefetchApi.get(`/products/${productId}`);
      const data = response.data.data;
      setCacheData(cacheKey, data);
      return data;
    } catch (error) {
      // Silently fail - prefetch is non-critical
      return null;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();
  
  pendingRequests.set(cacheKey, promise);
  return promise;
};

// Prefetch cart
export const prefetchCart = async () => {
  const cacheKey = 'cart';
  if (isCacheValid(cacheKey)) return getCachedData(cacheKey);
  if (pendingRequests.has(cacheKey)) return pendingRequests.get(cacheKey);
  
  const promise = (async () => {
    try {
      const response = await prefetchApi.get('/cart');
      const data = response.data.data;
      setCacheData(cacheKey, data);
      return data;
    } catch (error) {
      // Silently fail - prefetch is non-critical
      return null;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();
  
  pendingRequests.set(cacheKey, promise);
  return promise;
};

// Prefetch orders
export const prefetchOrders = async () => {
  const cacheKey = 'orders';
  if (isCacheValid(cacheKey)) return getCachedData(cacheKey);
  if (pendingRequests.has(cacheKey)) return pendingRequests.get(cacheKey);
  
  const promise = (async () => {
    try {
      const response = await prefetchApi.get('/orders');
      const data = response.data.data;
      setCacheData(cacheKey, data);
      return data;
    } catch (error) {
      // Silently fail - prefetch is non-critical
      return null;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();
  
  pendingRequests.set(cacheKey, promise);
  return promise;
};

// Prefetch admin orders (all orders)
export const prefetchAdminOrders = async () => {
  const cacheKey = 'admin:orders';
  if (isCacheValid(cacheKey)) return getCachedData(cacheKey);
  if (pendingRequests.has(cacheKey)) return pendingRequests.get(cacheKey);
  
  const promise = (async () => {
    try {
      const response = await prefetchApi.get('/orders');
      const data = response.data.data;
      setCacheData(cacheKey, data);
      return data;
    } catch (error) {
      return null;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();
  
  pendingRequests.set(cacheKey, promise);
  return promise;
};

// Prefetch admin users
export const prefetchAdminUsers = async () => {
  const cacheKey = 'admin:users';
  if (isCacheValid(cacheKey)) return getCachedData(cacheKey);
  if (pendingRequests.has(cacheKey)) return pendingRequests.get(cacheKey);
  
  const promise = (async () => {
    try {
      const response = await prefetchApi.get('/user/admin/users');
      const data = response.data.users;
      setCacheData(cacheKey, data);
      return data;
    } catch (error) {
      return null;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();
  
  pendingRequests.set(cacheKey, promise);
  return promise;
};

// Clear specific cache
export const clearCache = (key) => {
  if (key) {
    // Clear all entries that start with the key
    for (const k of prefetchCache.keys()) {
      if (k.startsWith(key)) {
        prefetchCache.delete(k);
      }
    }
  } else {
    prefetchCache.clear();
  }
};

// Clean up stale localStorage cache entries
export const cleanupLocalStorageCache = () => {
  if (typeof window === 'undefined') return;
  
  try {
    const keysToRemove = [];
    const now = Date.now();
    const MAX_CACHE_AGE = 5 * 60 * 1000; // 5 minutes max
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('farmtech_')) {
        try {
          const cached = JSON.parse(localStorage.getItem(key));
          if (cached && cached.timestamp && (now - cached.timestamp > MAX_CACHE_AGE)) {
            keysToRemove.push(key);
          }
        } catch (e) {
          keysToRemove.push(key); // Remove corrupted entries
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (e) {
    // Ignore errors
  }
};

// Invalidate cart cache (call after cart operations)
export const invalidateCartCache = () => clearCache('cart');

// Invalidate orders cache (call after order operations)
export const invalidateOrdersCache = () => clearCache('orders');

export default {
  prefetchProducts,
  prefetchProduct,
  prefetchCart,
  prefetchOrders,
  prefetchAdminOrders,
  prefetchAdminUsers,
  getCachedData,
  clearCache,
  cleanupLocalStorageCache,
  invalidateCartCache,
  invalidateOrdersCache
};
