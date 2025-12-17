'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productAPI } from '@/services/api';
import { useCart } from '@/context/CartContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProductCard from '@/components/products/ProductCard';
import toast from 'react-hot-toast';
import { getCachedData, prefetchProducts } from '@/lib/prefetch';

const PRODUCT_CACHE_KEY = 'farmtech_product_cache';
const CACHE_DURATION = 60 * 1000; // 1 minute

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, updateCartItem, cart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [updatingQuantity, setUpdatingQuantity] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Prefetch checkout page for faster Buy Now navigation
  useEffect(() => {
    router.prefetch('/checkout');
  }, [router]);

  useEffect(() => {
    if (!params.id) return;

    const fetchProduct = async () => {
      const localCacheKey = `${PRODUCT_CACHE_KEY}_${params.id}`;

      // Try localStorage cache first for instant render
      try {
        const cached = localStorage.getItem(localCacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const isFresh = Date.now() - timestamp < CACHE_DURATION;
          
          if (data) {
            setProduct(data);
            setLoading(false);
            if (isFresh) return;
          }
        }
      } catch (e) {
        // Ignore localStorage errors
      }

      try {
        setLoading(product === null);
        
        // Check for prefetched data first
        const cachedProduct = getCachedData(`product:${params.id}`);
        if (cachedProduct) {
          setProduct(cachedProduct);
          setLoading(false);
          // Also save to localStorage
          try {
            localStorage.setItem(localCacheKey, JSON.stringify({
              data: cachedProduct,
              timestamp: Date.now()
            }));
          } catch (e) {}
          return;
        }
        
        const response = await productAPI.getProduct(params.id);
        const productData = response.data.data;
        setProduct(productData);
        
        // Cache to localStorage
        try {
          localStorage.setItem(localCacheKey, JSON.stringify({
            data: productData,
            timestamp: Date.now()
          }));
        } catch (e) {}
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast.error('Product not found');
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, router]);

  // Fetch related products when product is loaded
  useEffect(() => {
    if (!product) return;

    const fetchRelatedProducts = async () => {
      try {
        setLoadingRelated(true);
        
        // Check for cached products first
        const cachedProducts = getCachedData(`products:${JSON.stringify({ category: product.category })}`);
        if (cachedProducts) {
          const filtered = cachedProducts
            .filter(p => p._id !== product._id)
            .slice(0, 4);
          setRelatedProducts(filtered);
          setLoadingRelated(false);
          return;
        }
        
        const response = await productAPI.getProducts({ category: product.category });
        // Filter out current product and limit to 4 items
        const filtered = response.data.data
          .filter(p => p._id !== product._id)
          .slice(0, 4);
        setRelatedProducts(filtered);
      } catch (error) {
        console.error('Failed to fetch related products:', error);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    const result = await addToCart(product._id);
    setAddingToCart(false);

    if (result.success) {
      toast.success('Product added to cart!');
    } else {
      toast.error(result.message);
    }
  };

  const handleBuyNow = async () => {
    setBuyingNow(true);
    
    // Navigate immediately for faster perceived performance
    // The cart will update in the background
    router.push('/checkout');
    
    // Add to cart in parallel - don't wait for it
    addToCart(product._id).then(result => {
      if (!result.success) {
        toast.error(result.message);
      }
    }).finally(() => {
      setBuyingNow(false);
    });
  };

  const handleIncreaseQuantity = async () => {
    const cartItem = cart.items.find(item => item.product._id === product._id);
    if (!cartItem) return;

    setUpdatingQuantity(true);
    const result = await updateCartItem(product._id, cartItem.quantity + 1);
    setUpdatingQuantity(false);

    if (!result.success) {
      toast.error(result.message || 'Failed to update quantity');
    }
  };

  const handleDecreaseQuantity = async () => {
    const cartItem = cart.items.find(item => item.product._id === product._id);
    if (!cartItem) return;

    setUpdatingQuantity(true);
    const result = await updateCartItem(product._id, cartItem.quantity - 1);
    setUpdatingQuantity(false);

    if (!result.success) {
      toast.error(result.message || 'Failed to update quantity');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return null;

  const finalPrice = product.price - (product.price * product.discount / 100);
  const cartItem = cart.items.find(item => item.product._id === product._id);
  const isInCart = !!cartItem;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Product Image */}
          <div>
            <div className="bg-neutral-50 rounded-lg overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-[325px] md:h-[500px] object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                }}
              />
            </div>
          </div>

          {/* Right Side - Product Details */}
          <div className="space-y-6">
            {/* Category */}
            <div className="text-sm text-neutral-500 uppercase tracking-wide">
              {product.category}
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-medium text-neutral-900">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-neutral-900">
                ₹{finalPrice.toFixed(2)}
              </span>
              {product.discount > 0 && (
                <>
                  <span className="text-lg text-neutral-400 line-through">
                    ₹{product.price}
                  </span>
                  <span className="text-sm text-red-600">
                    {product.discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Price Info */}
            <div className="text-sm text-neutral-600">
              Price inclusive of all taxes
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Total Availability:</span>
              <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {isInCart ? (
                <div className="flex-1 flex items-center justify-center gap-4 py-3 px-6 border border-neutral-300 rounded">
                  <button
                    onClick={handleDecreaseQuantity}
                    disabled={updatingQuantity || cartItem.quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center text-neutral-900 hover:bg-neutral-100 rounded transition disabled:text-neutral-300 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="text-sm font-medium text-neutral-900 min-w-[20px] text-center">
                    {cartItem.quantity}
                  </span>
                  <button
                    onClick={handleIncreaseQuantity}
                    disabled={updatingQuantity || cartItem.quantity >= product.stock}
                    className="w-8 h-8 flex items-center justify-center text-neutral-900 hover:bg-neutral-100 rounded transition disabled:text-neutral-300 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock === 0}
                  className="flex-1 bg-transparent text-neutral-900 py-3 px-6 text-sm font-medium hover:bg-neutral-50 transition disabled:text-neutral-300 disabled:cursor-not-allowed border-0"
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
              )}

              <button
                onClick={handleBuyNow}
                disabled={buyingNow || product.stock === 0}
                className="flex-1 bg-transparent text-green-600 py-3 px-6 text-sm font-light border-0 hover:text-green-700 transition disabled:text-neutral-300 disabled:cursor-not-allowed"
              >
                {buyingNow ? 'Processing...' : 'BUY NOW'}
              </button>
            </div>

            {/* Description Section */}
            <div className="border-t pt-6 space-y-4">
              <h2 className="text-lg font-medium">DESCRIPTION</h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Product Specifications */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-medium mb-4">PRODUCT SPECIFICATIONS</h2>
              <div className="space-y-3 text-sm">
                <div className="flex border-b pb-2">
                  <span className="w-40 text-neutral-600">Category</span>
                  <span className="text-neutral-900">{product.category}</span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="w-40 text-neutral-600">Stock</span>
                  <span className="text-neutral-900">{product.stock} units</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 border-t pt-12">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Related Products</h2>
              <p className="text-sm text-neutral-600">More items from {product.category}</p>
            </div>
            
            {loadingRelated ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct._id} product={relatedProduct} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
