'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import CartItem from '@/components/cart/CartItem';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { cart, loading } = useCart();

  if (!isAuthenticated) {
    return (
      <div className="bg-neutral-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="card max-w-md mx-auto p-12">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-3">Login Required</h1>
            <p className="text-neutral-600 mb-6">Please login to view your cart</p>
            <button
              onClick={() => router.push('/login')}
              className="btn-primary"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="bg-neutral-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="card max-w-md mx-auto p-12">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-3">Your cart is empty</h1>
            <p className="text-neutral-600 mb-6">Add some quality farming products to get started!</p>
            <button
              onClick={() => router.push('/products')}
              className="btn-primary"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <CartItem key={item.product._id} item={item} />
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{cart.subtotal?.toFixed(2) || '0.00'}</span>
              </div>

              {cart.discount > 0 && (
                <div className="flex justify-between text-accent-600">
                  <span>Discount</span>
                  <span>-₹{cart.discount?.toFixed(2) || '0.00'}</span>
                </div>
              )}

              <div className="border-t pt-3">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">₹{cart.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={() => router.push('/products')}
              className="w-full mt-3 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
