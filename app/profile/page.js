'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProfilePage() {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    bio: ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('account');

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        website: user.website || '',
        bio: user.bio || ''
      });
    }
  }, [user, isAuthenticated, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ oldPassword: '', newPassword: '' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <LoadingSpinner />;

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="lg:flex">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block w-64 bg-white border-r border-neutral-200 min-h-screen p-6">
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-neutral-900 mb-4">Account</h2>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'account'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'password'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                Change Password
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Mobile Tabs */}
          <div className="lg:hidden mb-6 bg-white rounded-lg p-1 border border-neutral-200">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('account')}
                className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors border ${
                  activeTab === 'account'
                    ? 'bg-white text-green-600 border-green-600'
                    : 'text-neutral-700 hover:bg-neutral-50 border-transparent'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors border ${
                  activeTab === 'password'
                    ? 'bg-white text-green-600 border-green-600'
                    : 'text-neutral-700 hover:bg-neutral-50 border-transparent'
                }`}
              >
                Password
              </button>
            </div>
          </div>
          <div className="max-w-4xl">
            {message.text && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6 sm:space-y-8">
                {/* Profile Information */}
                <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 border border-neutral-200">
                  <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-4 sm:mb-6">Profile Information</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Role
                        </label>
                        <select
                          disabled
                          value={user.role}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50 text-neutral-500"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="mt-6 sm:mt-8">
                      <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-3 sm:mb-4">Contact Info</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Email (required)
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto px-6 py-2.5 bg-white text-green-600 border border-green-600 font-medium rounded-md hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 border border-neutral-200">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-4 sm:mb-6">Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="max-w-md">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Old Password
                      </label>
                      <input
                        type="password"
                        name="oldPassword"
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-6 py-2.5 bg-white text-green-600 border border-green-600 font-medium rounded-md hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

