'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';
import { prefetchProducts, prefetchOrders, prefetchCart, prefetchAdminOrders, prefetchAdminUsers } from '@/lib/prefetch';

const Navbar = memo(function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isAdmin, openAuthModal } = useAuth();
  const { cartItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const dropdownRef = useRef(null);
  const productsDropdownRef = useRef(null);
  const adminDropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const prefetchTimeoutRef = useRef(null);

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

  // Real-time search with debounce and prefetch optimization
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
    }

    const trimmedQuery = searchInput.trim();
    
    if (trimmedQuery) {
      // Prefetch route immediately (faster navigation)
      router.prefetch(`/products?search=${encodeURIComponent(trimmedQuery)}`);
      
      // Prefetch search results after 300ms (while user is still typing)
      prefetchTimeoutRef.current = setTimeout(async () => {
        try {
          const { productAPI } = await import('@/services/api');
          const response = await productAPI.getProducts({ search: trimmedQuery });
          // Cache the prefetched results
          if (response.data?.data) {
            sessionStorage.setItem('prefetchedSearch', JSON.stringify({
              query: trimmedQuery,
              data: response.data.data,
              timestamp: Date.now()
            }));
          }
        } catch (error) {
          // Silently fail - products page will fetch if needed
        }
      }, 300);

      // Navigate after 600ms of no typing (gives user more time to type)
      searchTimeoutRef.current = setTimeout(() => {
        setSearchQuery(trimmedQuery);
        router.push(`/products?search=${encodeURIComponent(trimmedQuery)}`);
      }, 600);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, [searchInput, router]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    const trimmedQuery = searchInput.trim();
    if (trimmedQuery) {
      // Clear any pending timeouts for immediate navigation
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
      setSearchQuery(trimmedQuery);
      router.push(`/products?search=${encodeURIComponent(trimmedQuery)}`);
    }
  }, [searchInput, router]);

  const handleLogout = useCallback(() => {
    logout();
    setUserDropdownOpen(false);
  }, [logout]);

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
                    onMouseEnter={() => prefetchProducts({})}
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
                    onMouseEnter={() => prefetchProducts({ category: 'Fertilizer' })}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-neutral-900">Fertilizer</span>
                  </Link>
                  
                  <Link 
                    href="/products?category=Seeds" 
                    onClick={() => setProductsDropdownOpen(false)}
                    onMouseEnter={() => prefetchProducts({ category: 'Seeds' })}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-neutral-900">Seeds</span>
                  </Link>
                  
                  <Link 
                    href="/products?category=Pesticides" 
                    onClick={() => setProductsDropdownOpen(false)}
                    onMouseEnter={() => prefetchProducts({ category: 'Pesticides' })}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-neutral-900">Pesticides</span>
                  </Link>
                  
                  <Link 
                    href="/products?category=Tools" 
                    onClick={() => setProductsDropdownOpen(false)}
                    onMouseEnter={() => prefetchProducts({ category: 'Tools' })}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-neutral-900">Tools</span>
                  </Link>
                </div>
              )}
            </div>

            {isAuthenticated && (
              <Link 
                href="/orders" 
                onMouseEnter={() => prefetchOrders()}
                className="flex items-center gap-1 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                MY ORDERS
              </Link>
            )}
            
            {/* Admin Dropdown */}
            {isAdmin && (
              <div 
                className="relative" 
                ref={adminDropdownRef}
                onMouseEnter={() => {
                  // Prefetch all admin data on hover
                  prefetchProducts();
                  prefetchAdminOrders();
                  prefetchAdminUsers();
                }}
              >
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
                      href="/admin/products" 
                      onClick={() => setAdminDropdownOpen(false)}
                      onMouseEnter={() => prefetchProducts()}
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
                      onMouseEnter={() => prefetchAdminOrders()}
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
                      onMouseEnter={() => prefetchAdminUsers()}
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
                placeholder="Search 'Fertilizers, Seeds, Tools...'"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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

                        <button 
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setCartDrawerOpen(true);
                          }}
                          className="flex items-center gap-3 px-5 py-2.5 hover:bg-neutral-50 transition-colors w-full"
                        >
                          <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-sm font-medium text-neutral-900">My Cart</span>
                        </button>
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

                <button 
                  onClick={() => setCartDrawerOpen(true)}
                  onMouseEnter={() => prefetchCart()}
                  className="relative p-2 hover:bg-neutral-50 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-neutral-900 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </button>

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
              <button 
                onClick={() => openAuthModal('login')}
                className="px-6 py-2 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden px-4 py-3 border-t border-neutral-100">
          <form onSubmit={handleSearch} className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search 'Fertilizers, Seeds, Tools...'"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded focus:outline-none focus:border-neutral-400"
            />
          </form>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="lg:hidden fixed inset-y-0 right-0 w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header with Close button */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <Image 
                    src="/logo.png" 
                    alt="FarmTech" 
                    width={24} 
                    height={24}
                  />
                  <span className="text-sm font-bold text-neutral-900">FARMTECH</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                {/* User Profile Section */}
                <div className="px-4 py-3 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm font-bold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-neutral-900 truncate">{user?.name}</div>
                      <Link 
                        href="/profile" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
                      >
                        View Profile
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link 
                    href="/orders" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    My Orders
                  </Link>

                  <div className="border-t border-neutral-100 my-2"></div>

                  {/* Products Section */}
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">PRODUCTS</span>
                    </div>
                  </div>

                  <Link 
                    href="/products" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    All Products
                  </Link>

                  <Link 
                    href="/products?category=Fertilizer" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Fertilizer
                  </Link>

                  <Link 
                    href="/products?category=Seeds" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Seeds
                  </Link>

                  <Link 
                    href="/products?category=Pesticides" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Pesticides
                  </Link>

                  <Link 
                    href="/products?category=Tools" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Tools
                  </Link>

                  <div className="border-t border-neutral-100 my-2"></div>

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>

              {/* Cart Summary Footer */}
              {cartItemCount > 0 && (
                <div className="border-t border-neutral-200 p-4 bg-neutral-900">
                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setCartDrawerOpen(true);
                    }}
                    className="flex items-center justify-between w-full"
                  >
                    <div className="flex items-center gap-3 text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <div>
                        <div className="text-xs text-neutral-400">{cartItemCount} items</div>
                      </div>
                    </div>
                    <div className="bg-white text-neutral-900 px-4 py-2 rounded text-sm font-medium hover:bg-neutral-100 transition-colors flex items-center gap-1">
                      View Cart
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overlay for mobile menu */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </nav>
  );
});

export default Navbar;
