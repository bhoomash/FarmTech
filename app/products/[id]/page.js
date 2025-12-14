'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productAPI } from '@/services/api';
import { useCart } from '@/context/CartContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (!params.id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getProduct(params.id);
        setProduct(response.data.data);
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

  const handleAddToCart = async () => {
    setAddingToCart(true);
    const result = await addToCart(product._id, quantity);
    setAddingToCart(false);

    if (result.success) {
      toast.success('Product added to cart!');
    } else {
      toast.error(result.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return null;

  const finalPrice = product.price - (product.price * product.discount / 100);

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => router.back()}
          className="text-primary-600 hover:text-primary-700 font-medium mb-6 inline-flex items-center gap-1"
        >
          ← Back to Products
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div>
            <div className="card overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                }}
              />
            </div>
          </div>

          {/* Product Details */}
          <div>
            <div className="mb-4">
              <span className="bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full text-sm font-medium">
                {product.category}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-neutral-900 mb-4">{product.name}</h1>

            <div className="mb-6">
              {product.discount > 0 ? (
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold text-neutral-900">
                    ₹{finalPrice.toFixed(2)}
                  </span>
                  <span className="text-2xl text-neutral-400 line-through">
                    ₹{product.price}
                  </span>
                  <span className="bg-accent-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                    {product.discount}% OFF
                  </span>
                </div>
              ) : (
                <span className="text-4xl font-bold text-neutral-900">
                  ₹{product.price}
                </span>
              )}
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

            <div className="mb-6">
              <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Quantity:</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0}
              className="w-full bg-primary-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
