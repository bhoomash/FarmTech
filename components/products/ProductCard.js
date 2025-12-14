'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  const handleAddToCart = async () => {
    setLoading(true);
    const result = await addToCart(product._id);
    setLoading(false);

    if (result.success) {
      alert('Product added to cart!');
    } else {
      alert(result.message);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please login to add items to wishlist');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (inWishlist) {
        // Remove from wishlist
        const response = await fetch(`/api/user/wishlist/${product._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setInWishlist(false);
          alert('Removed from wishlist');
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/user/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId: product._id })
        });

        if (response.ok) {
          setInWishlist(true);
          alert('Added to wishlist!');
        } else {
          const data = await response.json();
          alert(data.message || 'Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      alert('An error occurred');
    }
  };

  const finalPrice = product.price - (product.price * product.discount / 100);

  return (
    <div className="bg-white overflow-hidden transition-all duration-200 relative">
      <Link href={`/products/${product._id}`}>
        <div className="relative h-64 bg-neutral-50">
          {product.discount > 0 && (
            <div className="absolute top-3 left-3 z-10">
              <div className="bg-neutral-800 text-white text-xs font-medium px-3 py-1">
                -{product.discount}%
              </div>
            </div>
          )}
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
            }}
          />
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product._id}`}>
          <h3 className="font-normal text-base mb-1 text-neutral-900 line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-neutral-500 text-sm mb-4 line-clamp-1">
          {product.description}
        </p>

        <div className="mb-4">
          {product.discount > 0 ? (
            <span className="text-xl font-normal text-neutral-900">
              ₹{finalPrice.toFixed(2)}
            </span>
          ) : (
            <span className="text-xl font-normal text-neutral-900">
              ₹{product.price}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleToggleWishlist(e);
            }}
            className="w-12 h-12 flex items-center justify-center hover:bg-neutral-100 transition-colors"
          >
            <svg 
              className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-neutral-600'}`} 
              fill={inWishlist ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={loading || product.stock === 0}
            className="flex-1 h-12 text-neutral-900 font-normal text-sm hover:bg-neutral-100 transition-colors disabled:bg-neutral-100 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
