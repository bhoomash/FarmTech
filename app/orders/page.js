'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { orderAPI } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getCachedData } from '@/lib/prefetch';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, user, openAuthModal } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('shipping');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // Check for prefetched data first
        const cachedOrders = getCachedData('orders');
        if (cachedOrders) {
          setOrders(cachedOrders);
          setLoading(false);
          return;
        }
        
        const response = await orderAPI.getMyOrders();
        setOrders(response.data.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, router]);

  const getStatusBadge = (status) => {
    if (status === 'shipped') {
      return { text: 'On Deliver', color: 'text-orange-600 bg-orange-50' };
    } else if (status === 'delivered') {
      return { text: 'Delivered', color: 'text-green-600 bg-green-50' };
    } else if (status === 'cancelled') {
      return { text: 'Cancelled', color: 'text-red-600 bg-red-50' };
    }
    return { text: status, color: 'text-neutral-600 bg-neutral-50' };
  };

  const filterOrdersByTab = () => {
    if (activeTab === 'shipping') {
      return orders.filter(order => order.orderStatus === 'shipped' || order.orderStatus === 'confirmed');
    } else if (activeTab === 'arrived') {
      return orders.filter(order => order.orderStatus === 'delivered');
    } else if (activeTab === 'cancelled') {
      return orders.filter(order => order.orderStatus === 'cancelled');
    }
    return orders;
  };

  const filteredOrders = filterOrdersByTab();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h1>
        <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
        <button
          onClick={() => router.push('/products')}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4 sm:mb-6">My Orders</h1>

        {/* Tabs */}
        <div className="flex gap-4 sm:gap-8 mb-4 sm:mb-6 border-b border-neutral-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-3 px-1 font-medium text-sm transition-colors relative whitespace-nowrap ${
              activeTab === 'shipping'
                ? 'text-neutral-900 border-b-2 border-neutral-900'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            On Shipping
            {activeTab === 'shipping' && (
              <span className="ml-2 w-5 h-5 inline-flex items-center justify-center rounded-full bg-neutral-900 text-white text-xs">
                {orders.filter(o => o.orderStatus === 'shipped' || o.orderStatus === 'confirmed').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('arrived')}
            className={`pb-3 px-1 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'arrived'
                ? 'text-neutral-900 border-b-2 border-neutral-900'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Arrived
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`pb-3 px-1 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'cancelled'
                ? 'text-neutral-900 border-b-2 border-neutral-900'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Cancelled
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-neutral-500">No orders in this category</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusBadge = getStatusBadge(order.orderStatus);
              return (
                <div key={order._id} className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 sm:p-6">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    {/* Order Info - Mobile Stacked, Desktop Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      {/* Order ID */}
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-semibold text-neutral-900">#{order._id.slice(-8).toUpperCase()}</span>
                        
                        {/* Status Badge - Show next to ID on mobile */}
                        <span className="sm:hidden flex items-center gap-1.5 ml-auto">
                          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                          <span className={`text-xs font-medium ${statusBadge.color} px-2 py-0.5 rounded`}>
                            {statusBadge.text}
                          </span>
                        </span>
                      </div>
                      
                      {/* City & Date - Mobile row */}
                      <div className="flex items-center gap-3 text-sm text-neutral-600">
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{order.shippingAddress?.city || 'N/A'}</span>
                        </div>
                        <span className="text-neutral-300">•</span>
                        <span>
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge - Desktop only */}
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      <span className={`text-xs font-medium ${statusBadge.color} px-2 py-1 rounded`}>
                        {statusBadge.text}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <img
                          src={item.product?.image || '/placeholder.png'}
                          alt={item.name}
                          className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-900 text-sm sm:text-base truncate">{item.name}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm font-semibold text-neutral-900">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </p>
                            <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-neutral-100">
                    <div className="text-sm">
                      <span className="text-neutral-600">Total: </span>
                      <span className="font-bold text-neutral-900">
                        ₹{order.total?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <button 
                      onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                      className="text-sm font-medium text-neutral-900 hover:underline flex items-center gap-1"
                    >
                      Details
                      <svg 
                        className={`w-4 h-4 transition-transform ${expandedOrderId === order._id ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {expandedOrderId === order._id && (
                    <div className="mt-4 pt-4 border-t border-neutral-200 space-y-4">
                      {/* Payment Information */}
                      <div>
                        <h4 className="text-sm font-semibold text-neutral-900 mb-2">Payment Information</h4>
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between gap-2">
                            <span className="text-neutral-600">Payment Status:</span>
                            <span className="font-medium text-neutral-900 capitalize">{order.paymentStatus}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="text-neutral-600">Payment Method:</span>
                            <span className="font-medium text-neutral-900">{order.paymentMethod || 'N/A'}</span>
                          </div>
                          {order.razorpayOrderId && (
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                              <span className="text-neutral-600">Transaction ID:</span>
                              <span className="font-medium text-neutral-900 text-xs break-all">{order.razorpayOrderId}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shipping Information */}
                      {order.shippingAddress && (
                        <div>
                          <h4 className="text-sm font-semibold text-neutral-900 mb-2">Shipping Address</h4>
                          <div className="text-sm text-neutral-700 space-y-1">
                            <p>{order.shippingAddress.name || user?.name}</p>
                            <p className="break-words">{order.shippingAddress.address}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                            <p>Phone: {order.shippingAddress.phone}</p>
                          </div>
                        </div>
                      )}

                      {/* Order Summary */}
                      <div>
                        <h4 className="text-sm font-semibold text-neutral-900 mb-2">Order Summary</h4>
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-neutral-600">Subtotal:</span>
                            <span className="font-medium text-neutral-900">₹{(order.total || 0).toLocaleString('en-IN')}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Discount:</span>
                              <span className="font-medium text-green-600">-₹{order.discount.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-2 border-t border-neutral-200">
                            <span className="font-semibold text-neutral-900">Total Amount:</span>
                            <span className="font-bold text-neutral-900">₹{order.total?.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Order Timeline */}
                      <div>
                        <h4 className="text-sm font-semibold text-neutral-900 mb-2">Order Timeline</h4>
                        <div className="text-sm text-neutral-600 space-y-1">
                          <p>Order placed: {new Date(order.createdAt).toLocaleString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</p>
                          {order.updatedAt && (
                            <p>Last updated: {new Date(order.updatedAt).toLocaleString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
