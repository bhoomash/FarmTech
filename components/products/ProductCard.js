'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useMemo, useCallback, memo } from 'react';
import toast from 'react-hot-toast';
import { prefetchProduct } from '@/lib/prefetch';

const ProductCard = memo(function ProductCard({ product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const finalPrice = useMemo(() => 
    product.price - (product.price * product.discount / 100),
    [product.price, product.discount]
  );

  // Prefetch product details on hover
  const handleMouseEnter = useCallback(() => {
    router.prefetch(`/products/${product._id}`);
    prefetchProduct(product._id);
  }, [product._id, router]);

  const handleBuyNow = useCallback(async (e) => {
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
  }, [isAuthenticated, product.stock, product._id, openAuthModal, addToCart, router]);

  return (
    <div 
      className="bg-white overflow-hidden transition-all duration-200 relative"
      onMouseEnter={handleMouseEnter}
    >
      <Link href={`/products/${product._id}`}>
        <div className="relative h-36 sm:h-48 bg-neutral-50">
          {product.discount > 0 && (
            <div className="absolute top-2 left-2 z-10">
              <div className="bg-neutral-800 text-white text-xs font-medium px-2 py-1">
                -{product.discount}%
              </div>
            </div>
          )}
          {!imageError ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <Image
              src="https://via.placeholder.com/400x300?text=No+Image"
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
          )}
        </div>
      </Link>

      <div className="p-2 sm:p-3">
        <Link href={`/products/${product._id}`}>
          <h3 className="font-normal text-xs sm:text-sm mb-1 text-neutral-900 line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-neutral-500 text-[10px] sm:text-xs mb-2 sm:mb-3 line-clamp-1">
          {product.description}
        </p>

        <div className="mb-2 sm:mb-3">
          {product.discount > 0 ? (
            <span className="text-base sm:text-lg font-normal text-neutral-900">
              ₹{finalPrice.toFixed(2)}
            </span>
          ) : (
            <span className="text-base sm:text-lg font-normal text-neutral-900">
              ₹{product.price}
            </span>
          )}
        </div>

        <button
          onClick={handleBuyNow}
          disabled={loading || product.stock === 0}
          className="w-full h-8 sm:h-10 bg-transparent text-green-600 font-light text-xs sm:text-sm border-0 hover:text-green-700 transition-colors disabled:text-neutral-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
        </button>
      </div>
    </div>
  );
});

export default ProductCard;
