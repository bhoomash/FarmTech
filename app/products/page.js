'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/products/ProductCard';
import { productAPI } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });

  const categories = ['Fertilizer', 'Seeds', 'Pesticides', 'Tools'];

  useEffect(() => {
    // Get search query and category from URL
    const searchQuery = searchParams.get('search');
    const categoryQuery = searchParams.get('category');
    
    if (searchQuery) {
      setFilters(prev => ({ ...prev, search: searchQuery }));
    }
    if (categoryQuery) {
      setFilters(prev => ({ ...prev, category: categoryQuery }));
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {};
        if (filters.category) params.category = filters.category;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (filters.search) params.search = filters.search;

        const response = await productAPI.getProducts(params);
        setProducts(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      search: ''
    });
  };

  const FilterContent = () => (
    <>
      {/* Filters Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-neutral-700" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          <h2 className="text-lg font-semibold text-neutral-900">Filters</h2>
        </div>
        <button
          onClick={clearFilters}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium underline"
        >
          Clear All
        </button>
      </div>

      {/* Category Filter as Radio Buttons */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Product Category</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              value=""
              checked={filters.category === ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-700">All Products</span>
          </label>
          {categories.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                value={cat}
                checked={filters.category === cat}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            placeholder="Min ₹"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
          <span className="text-sm text-neutral-500">to</span>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            placeholder="Max ₹"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>
        {(filters.minPrice || filters.maxPrice) && (
          <button
            onClick={() => {
              setFilters({ ...filters, minPrice: '', maxPrice: '' });
            }}
            className="w-full mt-3 px-4 py-2 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Price Filters
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setFilterDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-300 rounded-lg shadow-sm hover:bg-neutral-50 transition-colors"
          >
            <svg className="w-5 h-5 text-neutral-700" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-neutral-900">Filters</span>
            {(filters.category || filters.minPrice || filters.maxPrice) && (
              <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {[filters.category, filters.minPrice, filters.maxPrice].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="card p-6 sticky top-20">
              <FilterContent />
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {filterDrawerOpen && (
            <>
              {/* Backdrop */}
              <div
                className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
                onClick={() => setFilterDrawerOpen(false)}
              />
              
              {/* Drawer */}
              <div className="lg:hidden fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white shadow-2xl z-50 overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-neutral-900">Filters</h2>
                    <button
                      onClick={() => setFilterDrawerOpen(false)}
                      className="text-neutral-400 hover:text-neutral-600 transition"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <FilterContent />
                  <button
                    onClick={() => setFilterDrawerOpen(false)}
                    className="w-full mt-6 px-4 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Show Results
                  </button>
                </div>
              </div>
            </>
          )}

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-gray-600">
                Showing {products.length} product{products.length !== 1 ? 's' : ''}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProductsContent />
    </Suspense>
  );
}
