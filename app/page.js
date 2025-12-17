'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/products/ProductCard';
import { productAPI } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { prefetchProducts } from '@/lib/prefetch';

// Cache key for localStorage
const PRODUCTS_CACHE_KEY = 'farmtech_products_cache';
const CACHE_DURATION = 60000; // 1 minute

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = ['Fertilizer', 'Seeds', 'Pesticides', 'Tools'];

  // Prefetch products page on component mount
  useEffect(() => {
    router.prefetch('/products');
  }, [router]);

  useEffect(() => {
    const fetchProducts = async () => {
      const cacheKey = `${PRODUCTS_CACHE_KEY}_${selectedCategory || 'all'}`;
      
      // Try to get cached data first for instant render
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const isFresh = Date.now() - timestamp < CACHE_DURATION;
          
          // Show cached data immediately
          if (data && data.length > 0) {
            setProducts(data);
            setLoading(false);
            
            // If cache is fresh, don't refetch
            if (isFresh) return;
          }
        }
      } catch (e) {
        // Ignore localStorage errors
      }

      // Fetch fresh data
      try {
        setLoading(products.length === 0); // Only show loading if no cached data
        const params = selectedCategory ? { category: selectedCategory } : {};
        const response = await productAPI.getProducts(params);
        const newProducts = response.data.data || [];
        setProducts(newProducts);
        
        // Cache the new data
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            data: newProducts,
            timestamp: Date.now()
          }));
        } catch (e) {
          // Ignore localStorage errors
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        if (products.length === 0) setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  return (
    <div className="bg-gradient-to-b from-green-50 via-yellow-50 to-amber-50">
      {/* Mobile Hero Section */}
      <section className="md:hidden relative">
        <div className="relative h-40 sm:h-48">
          {/* Background Image */}
          <Image 
            src="/banner.png" 
            alt="Farm background" 
            fill
            priority
            quality={85}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* Desktop Hero Section */}
      <section className="hidden md:block relative text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image 
            src="/banner.png" 
            alt="Farm background" 
            fill
            priority
            quality={85}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40 flex items-end min-h-[500px]">
          <div className="max-w-3xl ml-auto mr-[20%]">
            <div className="flex flex-wrap gap-4 justify-end">
              <Link 
                href="/products"
                onMouseEnter={() => prefetchProducts({})}
              >
                <button className="bg-transparent text-yellow-400 px-7 py-2.5 rounded-md font-medium hover:bg-white/10 transition-all shadow-lg hover:shadow-xl border border-yellow-400/50">
                  Browse Products
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 md:py-12 lg:py-20 bg-gradient-to-br from-green-50/50 to-yellow-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-8 lg:mb-12">
            
            <p className="text-base sm:text-lg text-green-800 font-medium px-4">Hand-picked quality products for your farm</p>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : !products || products.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-white/80 backdrop-blur-sm rounded-xl border border-green-100 shadow-lg mx-4">
              <div className="text-5xl sm:text-6xl mb-4">📦</div>
              <p className="text-green-700 text-base sm:text-lg px-4">No products found in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {products && products.length > 8 && (
            <div className="text-center mt-8 sm:mt-12 px-4">
              <Link 
                href="/products" 
                className="block sm:inline-block"
                onMouseEnter={() => prefetchProducts({})}
              >
                <button className="w-full sm:w-auto bg-transparent text-green-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium text-base sm:text-lg">
                  View All Products →
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
