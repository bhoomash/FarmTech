'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '@/services/api';

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
  const sendOTP = async (email, name) => {
    try {
      const response = await authAPI.sendOTP({ email, name });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send OTP'
      };
    }
  };

  // Verify OTP and login
  const verifyOTP = async (email, otp) => {
    try {
      const response = await authAPI.verifyOTP({ email, otp });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setToken(token);
      setUser(user);

      return { success: true, message: 'Login successful' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid OTP'
      };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Refresh user profile
  const refreshProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      const userData = response.data.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Functions to control auth modal
  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    isAdmin,
    sendOTP,
    verifyOTP,
    logout,
    refreshProfile,
    authModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
