'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useCart } from '@/context/CartContext';

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated, router]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setWishlist(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/user/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setWishlist(wishlist.filter(item => item._id !== productId));
      } else {
        alert('Failed to remove item from wishlist');
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      alert('An error occurred');
    }
  };

  const handleAddToCart = async (product) => {
    const result = await addToCart(product._id, 1);
    if (result.success) {
      alert('Added to cart!');
      handleRemoveFromWishlist(product._id);
    } else {
      alert(result.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-neutral-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">My Wishlist</h1>
          <p className="text-neutral-600 mt-2">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Your wishlist is empty</h2>
            <p className="text-neutral-600 mb-6">Save your favorite items to buy them later</p>
            <Link href="/products">
              <button className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors">
                Browse Products
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => {
              const finalPrice = product.price - (product.price * product.discount / 100);
              
              return (
                <div key={product._id} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow group">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-neutral-100">
                    <Link href={`/products/${product._id}`}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                        }}
                      />
                    </Link>
                    {product.discount > 0 && (
                      <div className="absolute top-3 left-3 bg-accent-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                        {product.discount}% OFF
                      </div>
                    )}
                    <button
                      onClick={() => handleRemoveFromWishlist(product._id)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors group/btn"
                    >
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link href={`/products/${product._id}`}>
                      <span className="text-xs font-medium text-primary-600 mb-1 block">
                        {product.category}
                      </span>
                      <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="mb-3">
                      {product.discount > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-neutral-900">
                            ₹{finalPrice.toFixed(2)}
                          </span>
                          <span className="text-sm text-neutral-400 line-through">
                            ₹{product.price}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl font-bold text-neutral-900">
                          ₹{product.price}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
                      >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                      <Link href={`/products/${product._id}`} className="flex-shrink-0">
                        <button className="px-3 py-2 border-2 border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
