'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const finalPrice = product.price - (product.price * product.discount / 100);

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    setLoading(true);
    const result = await addToCart(product._id);
    setLoading(false);

    if (result.success) {
      router.push('/checkout');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="bg-white overflow-hidden transition-all duration-200 relative">
      <Link href={`/products/${product._id}`}>
        <div className="relative h-48 bg-neutral-50">
          {product.discount > 0 && (
            <div className="absolute top-2 left-2 z-10">
              <div className="bg-neutral-800 text-white text-xs font-medium px-2 py-1">
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

      <div className="p-3">
        <Link href={`/products/${product._id}`}>
          <h3 className="font-normal text-sm mb-1 text-neutral-900 line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-neutral-500 text-xs mb-3 line-clamp-1">
          {product.description}
        </p>

        <div className="mb-3">
          {product.discount > 0 ? (
            <span className="text-lg font-normal text-neutral-900">
              ₹{finalPrice.toFixed(2)}
            </span>
          ) : (
            <span className="text-lg font-normal text-neutral-900">
              ₹{product.price}
            </span>
          )}
        </div>

        <button
          onClick={handleBuyNow}
          disabled={loading || product.stock === 0}
          className="w-full h-10 bg-transparent text-green-600 font-light text-sm border-0 hover:text-green-700 transition-colors disabled:text-neutral-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
        </button>
      </div>
    </div>
  );
}
