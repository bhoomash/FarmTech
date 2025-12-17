'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, memo } from 'react';
import { prefetchProducts, prefetchProduct, prefetchCart, prefetchOrders } from '@/lib/prefetch';

// Optimized Link component with data prefetching on hover
const OptimizedLink = memo(function OptimizedLink({ 
  href, 
  children, 
  className = '', 
  onClick,
  prefetchData = true,
  ...props 
}) {
  const router = useRouter();

  // Determine what data to prefetch based on href
  const handleMouseEnter = useCallback(() => {
    // Always prefetch the route
    router.prefetch(href);

    if (!prefetchData) return;

    // Prefetch data based on route
    if (href === '/products' || href.startsWith('/products?')) {
      const params = {};
      if (href.includes('category=')) {
        const match = href.match(/category=([^&]+)/);
        if (match) params.category = decodeURIComponent(match[1]);
      }
      if (href.includes('search=')) {
        const match = href.match(/search=([^&]+)/);
        if (match) params.search = decodeURIComponent(match[1]);
      }
      prefetchProducts(params);
    } else if (href.startsWith('/products/')) {
      const productId = href.split('/products/')[1];
      if (productId) prefetchProduct(productId);
    } else if (href === '/cart') {
      prefetchCart();
    } else if (href === '/orders') {
      prefetchOrders();
    } else if (href === '/checkout') {
      prefetchCart();
    }
  }, [href, router, prefetchData]);

  // Handle touch start for mobile
  const handleTouchStart = useCallback(() => {
    handleMouseEnter();
  }, [handleMouseEnter]);

  return (
    <Link
      href={href}
      className={className}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleTouchStart}
      prefetch={true}
      {...props}
    >
      {children}
    </Link>
  );
});

export default OptimizedLink;
