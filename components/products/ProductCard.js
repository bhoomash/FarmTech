'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    setLoading(true);
    const result = await addToCart(product._id);
    setLoading(false);

    if (result.success) {
      toast.success('Product added to cart!');
    } else {
      toast.error(result.message);
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
