'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import CartItem from '@/components/cart/CartItem';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useEffect } from 'react';

export default function CartDrawer({ isOpen, onClose }) {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { cart, loading } = useCart();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalSavings = cart?.items?.reduce((sum, item) => {
    const savings = (item.product.price * item.product.discount / 100) * item.quantity;
    return sum + savings;
  }, 0) || 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[85%] sm:max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-neutral-900">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!isAuthenticated ? (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Login Required</h3>
                <p className="text-neutral-600 mb-6">Please login to view your cart</p>
                <button
                  onClick={() => {
                    onClose();
                    openAuthModal('login');
                  }}
                  className="btn-primary"
                >
                  Login
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : !cart?.items || cart.items.length === 0 ? (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Your cart is empty</h3>
                <p className="text-neutral-600 mb-6">Add some products to get started!</p>
                <button
                  onClick={() => {
                    onClose();
                    router.push('/products');
                  }}
                  className="btn-primary"
                >
                  Browse Products
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4">
              {/* Cart Items */}
              <div className="space-y-3 mb-4">
                {cart.items.map((item) => (
                  <CartItem key={item.product._id} item={item} />
                ))}
              </div>

              {/* Bill Details */}
              <div className="border-t pt-4">
                <h3 className="text-base font-bold text-neutral-900 mb-3">Bill details</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Items total</span>
                    <div className="flex items-center gap-2">
                      {totalSavings > 0 && (
                        <span className="text-neutral-400 line-through text-xs">
                          ₹{cart.subtotal?.toFixed(2)}
                        </span>
                      )}
                      <span className="text-neutral-900 font-medium">
                        ₹{((cart.subtotal || 0) - totalSavings).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Quantity total</span>
                    <span className="text-neutral-900 font-medium">{totalItems} items</span>
                  </div>

                  <div className="border-t pt-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-900 font-bold text-base">Grand total</span>
                      <span className="text-neutral-900 font-bold text-lg">
                        ₹{cart.total?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom Checkout Button */}
        {isAuthenticated && cart?.items && cart.items.length > 0 && (
          <div className="border-t p-3 bg-white">
            <button
              onClick={handleCheckout}
              className="w-full bg-white text-green-600 border-2 border-green-600 py-3 rounded-lg hover:bg-green-50 transition font-semibold text-sm sm:text-base flex items-center justify-between px-3 sm:px-4"
            >
              <span className="text-sm sm:text-base">₹{cart.total?.toFixed(2) || '0.00'}</span>
              <span className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                <span className="hidden xs:inline">Proceed to</span> Checkout
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
