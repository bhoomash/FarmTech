'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import { productAPI } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = ['Fertilizer', 'Seeds', 'Pesticides', 'Tools'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = selectedCategory ? { category: selectedCategory } : {};
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
  }, [selectedCategory]);

  return (
    <div className="bg-gradient-to-b from-green-50 via-yellow-50 to-amber-50">
      {/* Hero Section - Modern Design */}
      <section className="relative text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/banner.png" 
            alt="Farm background" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-30 md:py-40 flex items-end min-h-[500px]">
          <div className="max-w-3xl ml-auto mr-[20%] mb-none">
            <div className="flex flex-wrap gap-4 justify-end">
              <Link href="/products">
                <button className="bg-transparent text-yellow-400 px-7 py-2 rounded-md font-medium hover:bg-white/10 transition-all shadow-lg hover:shadow-xl border border-yellow-400/50">
                  Browse Products
                </button>
              </Link>
              
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-br from-green-50/50 to-yellow-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            
            <p className="text-lg text-green-800 font-medium">Hand-picked quality products for your farm</p>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : !products || products.length === 0 ? (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-xl border border-green-100 shadow-lg">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-green-700 text-lg">No products found in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {products && products.length > 8 && (
            <div className="text-center mt-12">
              <Link href="/products">
                <button className="bg-transparent text-green-600 px-8 py-4 rounded-lg font-medium text-lg">
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
