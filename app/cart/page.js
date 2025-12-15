'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import CartItem from '@/components/cart/CartItem';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAuth();
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
              onClick={() => openAuthModal('login')}
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

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalSavings = cart.items.reduce((sum, item) => {
    const savings = (item.product.price * item.product.discount / 100) * item.quantity;
    return sum + savings;
  }, 0);

  return (
    <div className="bg-white min-h-screen pb-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Shopping Cart</h1>
        </div>

        {/* Savings Banner */}
        {totalSavings > 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-neutral-700 font-medium">Your total savings</span>
              <span className="text-green-600 font-bold text-lg">₹{totalSavings.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="space-y-6 mb-8">
          {cart.items.map((item) => (
            <CartItem key={item.product._id} item={item} />
          ))}
        </div>

        {/* Bill Details */}
        <div className="bg-white border-t pt-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Bill details</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Items total</span>
              <div className="flex items-center gap-2">
                {totalSavings > 0 && (
                  <span className="text-neutral-400 line-through text-sm">
                    ₹{cart.subtotal?.toFixed(2)}
                  </span>
                )}
                <span className="text-neutral-900 font-medium">
                  ₹{(cart.subtotal - totalSavings).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Quantity total</span>
              <span className="text-neutral-900 font-medium">{totalItems} items</span>
            </div>

            <div className="border-t pt-3 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-neutral-900 font-bold text-lg">Grand total</span>
                <span className="text-neutral-900 font-bold text-xl">
                  ₹{cart.total?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Checkout Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/checkout')}
            className="w-full bg-black text-white py-4 rounded-lg hover:bg-neutral-800 transition font-semibold text-lg flex items-center justify-between px-6"
          >
            <span>₹{cart.total?.toFixed(2) || '0.00'}</span>
            <span className="flex items-center gap-2">
              Proceed to Checkout
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
