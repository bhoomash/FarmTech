'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { cartItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const productsDropdownRef = useRef(null);
  const adminDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(event.target)) {
        setProductsDropdownOpen(false);
      }
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target)) {
        setAdminDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
  };

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image 
              src="/logo.png" 
              alt="FarmTech Logo" 
              width={36} 
              height={36} 
              className="group-hover:scale-105 transition-transform"
              priority
            />
            <div className="flex flex-col">
              <span className="text-base font-bold text-neutral-900 tracking-tight leading-none">FARMTECH</span>
              <span className="text-[10px] text-neutral-500 font-medium tracking-wider uppercase">Agriculture</span>
            </div>
          </Link>

          {/* Center Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Products Dropdown */}
            <div className="relative" ref={productsDropdownRef}>
              <button 
                onClick={() => setProductsDropdownOpen(!productsDropdownOpen)}
                className="flex items-center gap-1 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                PRODUCTS
                <svg 
                  className={`w-4 h-4 transition-transform ${productsDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Products Dropdown Menu */}
              {productsDropdownOpen && (
                <div className="absolute left-0 mt-3 w-56 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-50">
                  <Link 
                    href="/products" 
                    onClick={() => setProductsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                  >
                    <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="text-sm font-medium text-neutral-900">All Products</span>
                  </Link>
                  
                  <div className="border-t border-neutral-200 my-2"></div>
                  <p className="px-4 py-2 text-xs font-semibold text-neutral-500 tracking-wider uppercase">Categories</p>
                  
                  <Link 
                    href="/products?category=Fertilizer" 
                    onClick={() => setProductsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                  >
                    <span className="text-lg">🧪</span>
                    <span className="text-sm font-medium text-neutral-900">Fertilizer</span>
                  </Link>
                  
                  <Link 
                    href="/products?category=Seeds" 
                    onClick={() => setProductsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                  >
                    <span className="text-lg">🌱</span>
                    <span className="text-sm font-medium text-neutral-900">Seeds</span>
                  </Link>
                  
                  <Link 
                    href="/products?category=Pesticides" 
                    onClick={() => setProductsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                  >
                    <span className="text-lg">🛡️</span>
                    <span className="text-sm font-medium text-neutral-900">Pesticides</span>
                  </Link>
                  
                  <Link 
                    href="/products?category=Tools" 
                    onClick={() => setProductsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                  >
                    <span className="text-lg">🔧</span>
                    <span className="text-sm font-medium text-neutral-900">Tools</span>
                  </Link>
                </div>
              )}
            </div>

            {isAuthenticated && (
              <Link href="/orders" className="flex items-center gap-1 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors">
                MY ORDERS
              </Link>
            )}
            
            {/* Admin Dropdown */}
            {isAdmin && (
              <div className="relative" ref={adminDropdownRef}>
                <button 
                  onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                  className="flex items-center gap-1 text-sm font-medium text-accent-600 hover:text-accent-700 transition-colors"
                >
                  ADMIN
                  <svg 
                    className={`w-4 h-4 transition-transform ${adminDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Admin Dropdown Menu */}
                {adminDropdownOpen && (
                  <div className="absolute left-0 mt-3 w-64 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-50">
                    <Link 
                      href="/admin/dashboard" 
                      onClick={() => setAdminDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent-50 transition-colors"
                    >
                      <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="text-sm font-medium text-neutral-900">Dashboard</span>
                    </Link>
                    
                    <Link 
                      href="/admin/products" 
                      onClick={() => setAdminDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent-50 transition-colors"
                    >
                      <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="text-sm font-medium text-neutral-900">Products Management</span>
                    </Link>
                    
                    <Link 
                      href="/admin/orders" 
                      onClick={() => setAdminDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent-50 transition-colors"
                    >
                      <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="text-sm font-medium text-neutral-900">Orders Management</span>
                    </Link>
                    
                    <Link 
                      href="/admin/users" 
                      onClick={() => setAdminDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent-50 transition-colors"
                    >
                      <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="text-sm font-medium text-neutral-900">Users Management</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search 'Products'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-400 transition-colors"
              />
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                {/* User Account Dropdown */}
                <div className="hidden lg:block relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-opacity"
                  >
                    <div className="w-9 h-9 rounded-full bg-neutral-400 flex items-center justify-center text-white text-sm font-semibold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-neutral-900 leading-tight">{user?.name}</span>
                      <span className="text-xs text-neutral-500">My Account</span>
                    </div>
                    <svg 
                      className={`w-4 h-4 text-neutral-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-xl border border-neutral-200 py-4 z-50">
                      {/* Signed in as */}
                      <div className="px-5 pb-4 border-b border-neutral-200">
                        <p className="text-xs text-neutral-500 mb-1">Signed in as</p>
                        <p className="text-sm font-medium text-neutral-900 break-all">{user?.email}</p>
                      </div>

                      {/* My Account Section */}
                      <div className="px-5 py-4 border-b border-neutral-200">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <h3 className="text-lg font-bold text-neutral-900">My Account</h3>
                            <p className="text-sm text-neutral-600">{user?.name}</p>
                          </div>
                          <Link 
                            href="/profile" 
                            onClick={() => setUserDropdownOpen(false)}
                            className="text-sm font-medium text-neutral-700 hover:text-neutral-900 flex items-center gap-1"
                          >
                            Profile
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>

                      {/* User Options */}
                      <div className="py-2">
                        <p className="px-5 py-2 text-xs font-semibold text-neutral-500 tracking-wider uppercase">User Options</p>
                        
                        <Link 
                          href="/orders" 
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-5 py-2.5 hover:bg-neutral-50 transition-colors"
                        >
                          <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <span className="text-sm font-medium text-neutral-900">My Orders</span>
                        </Link>

                        <Link 
                          href="/profile" 
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-5 py-2.5 hover:bg-neutral-50 transition-colors"
                        >
                          <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm font-medium text-neutral-900">My Profile</span>
                        </Link>

                        <Link 
                          href="/cart" 
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-5 py-2.5 hover:bg-neutral-50 transition-colors"
                        >
                          <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-sm font-medium text-neutral-900">My Cart</span>
                        </Link>

                        {isAdmin && (
                          <Link 
                            href="/admin/dashboard" 
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-5 py-2.5 hover:bg-accent-50 transition-colors"
                          >
                            <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm font-medium text-accent-600">Admin Dashboard</span>
                          </Link>
                        )}
                      </div>

                      {/* Logout Button */}
                      <div className="px-5 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cart Icon */
                <Link href="/cart" className="relative p-2 hover:bg-neutral-50 rounded-full transition-colors">
                  <svg className="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-neutral-900 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>

                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </>
            ) : (
              <Link href="/login">
                <button className="px-6 py-2 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors">
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="lg:hidden py-4 border-t border-neutral-200">
            <div className="flex flex-col space-y-1">
              {/* Mobile Search */}
              <div className="px-3 py-2 mb-2">
                <form onSubmit={handleSearch} className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search products"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-400"
                  />
                </form>
              </div>
              
              <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors">
                Products
              </Link>
              <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors">
                My Orders
              </Link>
              {isAdmin && (
                <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 text-sm font-medium text-accent-600 hover:bg-accent-50 rounded-lg transition-colors">
                  Admin Dashboard
                </Link>
              )}
              <div className="px-3 py-3 bg-neutral-50 rounded-lg mt-2">
                <div className="text-sm font-semibold text-neutral-900">{user?.name}</div>
                <div className="text-xs text-neutral-500 mt-0.5">{user?.email}</div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left mt-2"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
