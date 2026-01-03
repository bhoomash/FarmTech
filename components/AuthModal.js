'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authAPI } from '@/services/api';
import toast from 'react-hot-toast';

// Validation functions
const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return '';
};

const validatePassword = (password, isSignup = false) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (isSignup) {
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  }
  return '';
};

const validateName = (name) => {
  if (!name) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
  return '';
};

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }) {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(defaultMode === 'signup');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ email: '', password: '', name: '' });
      setErrors({});
      setTouched({});
      setIsSignup(defaultMode === 'signup');
    }
  }, [isOpen, defaultMode]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Real-time validation for touched fields
    if (touched[name]) {
      let error = '';
      if (name === 'email') error = validateEmail(value);
      else if (name === 'password') error = validatePassword(value, isSignup);
      else if (name === 'name') error = validateName(value);
      setErrors({ ...errors, [name]: error, general: '' });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    
    // Validate on blur
    let error = '';
    if (name === 'email') error = validateEmail(value);
    else if (name === 'password') error = validatePassword(value, isSignup);
    else if (name === 'name') error = validateName(value);
    setErrors({ ...errors, [name]: error });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate email
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    // Validate password
    const passwordError = validatePassword(formData.password, isSignup);
    if (passwordError) newErrors.password = passwordError;
    
    // Validate name for signup
    if (isSignup) {
      const nameError = validateName(formData.name);
      if (nameError) newErrors.name = nameError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ email: true, password: true, name: true });
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      if (isSignup) {
        // Signup
        const response = await authAPI.signup({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });

        if (response.data.success) {
          localStorage.setItem('pendingEmail', formData.email);
          toast.success('Signup successful! Please verify your email with the OTP sent.');
          onClose();
          router.push('/verify-otp');
        }
      } else {
        // Login
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password
        });

        if (response.data.success) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          toast.success('Login successful!');
          onClose();
          // Redirect to landing page
          window.location.href = '/';
        }
      }
    } catch (error) {
      setErrors({ 
        general: error.response?.data?.message || 'An error occurred. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Image 
                src="/logo.png" 
                alt="FarmTech Logo" 
                width={40} 
                height={40}
              />
              <div className="text-left">
                <h2 className="text-2xl font-bold text-neutral-900">FarmTech</h2>
                <p className="text-xs text-neutral-500">Farm Solutions</p>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-neutral-600">
              {isSignup ? 'Sign up with email and password' : 'Login to your account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Toggle between login/signup */}
            <div className="flex gap-2 p-1 bg-neutral-100 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setIsSignup(false);
                  setErrors({});
                  setTouched({});
                }}
                className={`flex-1 px-4 py-2.5 rounded-md font-medium text-sm transition-all ${
                  !isSignup ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignup(true);
                  setErrors({});
                  setTouched({});
                }}
                className={`flex-1 px-4 py-2.5 rounded-md font-medium text-sm transition-all ${
                  isSignup ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Name field (only for signup) */}
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your name"
                  className={`input-field ${errors.name && touched.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.name && touched.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your email"
                className={`input-field ${errors.email && touched.email ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.email && touched.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your password"
                className={`input-field ${errors.password && touched.password ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.password && touched.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
              {isSignup && !errors.password && (
                <p className="text-neutral-500 text-xs mt-1">
                  Min 6 chars, with uppercase, lowercase, and number
                </p>
              )}
            </div>

            {/* General error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-green-600 border border-green-600 py-3 rounded-lg hover:bg-green-50 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (isSignup ? 'Creating Account...' : 'Logging in...') : (isSignup ? 'Sign Up' : 'Login')}
            </button>
          </form>

          {isSignup && (
            <div className="mt-6 text-center text-sm text-neutral-600 bg-primary-50 p-3 rounded-lg">
              <p>🔒 An OTP will be sent to verify your email after signup</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
