'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '@/services/api';
import { useAuth } from './AuthContext';

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

  // Fetch cart
  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart({ items: [], subtotal: 0, discount: 0, total: 0 });
      return;
    }

    try {
      setLoading(true);
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
  };

  // Load cart on mount and when auth changes
  useEffect(() => {
    if (!isAuthenticated) {
      setCart({ items: [], subtotal: 0, discount: 0, total: 0 });
      return;
    }

    const loadCart = async () => {
      try {
        setLoading(true);
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
    };

    loadCart();
  }, [isAuthenticated]);

  // Add to cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      const response = await cartAPI.addToCart({ productId, quantity });
      const { cart: cartData, subtotal, discount, total } = response.data.data;
      setCart({
        items: cartData?.items || [],
        subtotal: subtotal || 0,
        discount: discount || 0,
        total: total || 0
      });
      return { success: true, message: 'Added to cart' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add to cart'
      };
    }
  };

  // Update cart item
  const updateCartItem = async (productId, quantity) => {
    try {
      const response = await cartAPI.updateCart({ productId, quantity });
      const { cart: cartData, subtotal, discount, total } = response.data.data;
      setCart({
        items: cartData?.items || [],
        subtotal: subtotal || 0,
        discount: discount || 0,
        total: total || 0
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update cart'
      };
    }
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    try {
      const response = await cartAPI.removeFromCart(productId);
      const { cart: cartData, subtotal, discount, total } = response.data.data;
      setCart({
        items: cartData?.items || [],
        subtotal: subtotal || 0,
        discount: discount || 0,
        total: total || 0
      });
      return { success: true, message: 'Removed from cart' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove from cart'
      };
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCart({ items: [], subtotal: 0, discount: 0, total: 0 });
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  // Get cart item count
  const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  const value = {
    cart,
    loading,
    cartItemCount,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
