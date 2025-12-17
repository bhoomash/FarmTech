'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { cartAPI } from '@/services/api';
import { useAuth } from './AuthContext';
import { invalidateCartCache } from '@/lib/prefetch';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, discount: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  // Fetch cart - with prefetch optimization
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], subtotal: 0, discount: 0, total: 0 });
      return;
    }

    try {
      setLoading(true);
      
      // Check for prefetched cart data (from login optimization)
      const prefetchedData = sessionStorage.getItem('prefetchedCart');
      if (prefetchedData) {
        const { data, timestamp } = JSON.parse(prefetchedData);
        // Use prefetched data if less than 30 seconds old
        if (Date.now() - timestamp < 30000) {
          const { cart: cartData, subtotal, discount, total } = data;
          setCart({
            items: cartData?.items || [],
            subtotal: subtotal || 0,
            discount: discount || 0,
            total: total || 0
          });
          sessionStorage.removeItem('prefetchedCart');
          setLoading(false);
          return;
        }
        sessionStorage.removeItem('prefetchedCart');
      }

      // Fetch fresh cart data
      const response = await cartAPI.getCart();
      const { cart: cartData, subtotal, discount, total } = response.data.data;
      setCart({
        items: cartData?.items || [],
        subtotal: subtotal || 0,
        discount: discount || 0,
        total: total || 0
      });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCart({ items: [], subtotal: 0, discount: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load cart on mount and when auth changes - use the memoized fetchCart
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add to cart
  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      const response = await cartAPI.addToCart({ productId, quantity });
      const { cart: cartData, subtotal, discount, total } = response.data.data;
      setCart({
        items: cartData?.items || [],
        subtotal: subtotal || 0,
        discount: discount || 0,
        total: total || 0
      });
      invalidateCartCache(); // Clear prefetch cache
      return { success: true, message: 'Added to cart' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add to cart'
      };
    }
  }, []);

  // Update cart item
  const updateCartItem = useCallback(async (productId, quantity) => {
    try {
      const response = await cartAPI.updateCart({ productId, quantity });
      const { cart: cartData, subtotal, discount, total } = response.data.data;
      setCart({
        items: cartData?.items || [],
        subtotal: subtotal || 0,
        discount: discount || 0,
        total: total || 0
      });
      invalidateCartCache(); // Clear prefetch cache
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update cart'
      };
    }
  }, []);

  // Remove from cart
  const removeFromCart = useCallback(async (productId) => {
    try {
      const response = await cartAPI.removeFromCart(productId);
      const { cart: cartData, subtotal, discount, total } = response.data.data;
      setCart({
        items: cartData?.items || [],
        subtotal: subtotal || 0,
        discount: discount || 0,
        total: total || 0
      });
      invalidateCartCache(); // Clear prefetch cache
      return { success: true, message: 'Removed from cart' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove from cart'
      };
    }
  }, []);

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      await cartAPI.clearCart();
      setCart({ items: [], subtotal: 0, discount: 0, total: 0 });
      invalidateCartCache(); // Clear prefetch cache
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }, []);

  // Get cart item count - memoized
  const cartItemCount = useMemo(() => 
    cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0,
    [cart.items]
  );

  const value = useMemo(() => ({
    cart,
    loading,
    cartItemCount,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
  }), [cart, loading, cartItemCount, fetchCart, addToCart, updateCartItem, removeFromCart, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
