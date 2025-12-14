'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authAPI } from '@/services/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!formData.email || !formData.password) {
      setErrors({ general: 'Email and password are required' });
      return;
    }

    if (isSignup && !formData.name) {
      setErrors({ name: 'Name is required for signup' });
      return;
    }

    if (formData.password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4">
      <div className="max-w-md w-full card p-8">
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
              onClick={() => setIsSignup(false)}
              className={`flex-1 px-4 py-2.5 rounded-md font-medium text-sm transition-all ${
                !isSignup ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsSignup(true)}
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
                placeholder="Enter your name"
                className="input-field"
              />
              {errors.name && (
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
              placeholder="Enter your email"
              className="input-field"
            />
            {errors.email && (
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
              placeholder="Enter your password"
              className="input-field"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
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
            className="btn-primary w-full"
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
  );
}
