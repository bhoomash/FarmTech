'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { authAPI, userAPI, cartAPI } from '@/services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Send OTP
  const sendOTP = useCallback(async (email, name) => {
    try {
      const response = await authAPI.sendOTP({ email, name });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send OTP'
      };
    }
  }, []);

  // Verify OTP and login - optimized with parallel cart prefetch
  const verifyOTP = useCallback(async (email, otp) => {
    try {
      const response = await authAPI.verifyOTP({ email, otp });
      const { token: newToken, user: newUser } = response.data;

      // Store in localStorage first (fast sync operation)
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      // Update state immediately
      setToken(newToken);
      setUser(newUser);

      // Prefetch cart in background (don't await - fire and forget)
      // This will be ready when user navigates to cart
      cartAPI.getCart().then(cartResponse => {
        // Cache the cart data for CartContext to pick up
        if (cartResponse.data?.data) {
          sessionStorage.setItem('prefetchedCart', JSON.stringify({
            data: cartResponse.data.data,
            timestamp: Date.now()
          }));
        }
      }).catch(() => {
        // Silently fail - CartContext will fetch if needed
      });

      return { success: true, message: 'Login successful', user: newUser };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid OTP'
      };
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  // Refresh user profile
  const refreshProfile = useCallback(async () => {
    try {
      const response = await userAPI.getProfile();
      const userData = response.data.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  }, []);

  // Functions to control auth modal
  const openAuthModal = useCallback((mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  // Listen for auth:required events from API interceptor
  useEffect(() => {
    const handleAuthRequired = () => {
      setAuthModalMode('login');
      setAuthModalOpen(true);
    };

    window.addEventListener('auth:required', handleAuthRequired);
    return () => window.removeEventListener('auth:required', handleAuthRequired);
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    sendOTP,
    verifyOTP,
    logout,
    refreshProfile,
    authModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal
  }), [user, token, loading, sendOTP, verifyOTP, logout, refreshProfile, authModalOpen, authModalMode, openAuthModal, closeAuthModal]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
