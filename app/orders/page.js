'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { orderAPI } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-primary-100 text-primary-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-neutral-100 text-neutral-800';
  };

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-semibold">{order._id}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus.toUpperCase()}
                </span>
                <p className="text-sm text-gray-600 mt-2">
                  Payment: <span className="font-semibold">{order.paymentStatus}</span>
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product?.image || '/placeholder.png'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between items-center">
                <div>
                  {order.shippingAddress && (
                    <div className="text-sm text-gray-600">
                      <p className="font-semibold mb-1">Shipping Address:</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                      <p>Phone: {order.shippingAddress.phone}</p>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {order.discount > 0 && (
                    <p className="text-sm text-gray-600">
                      Subtotal: <span className="line-through">₹{order.subtotal?.toFixed(2)}</span>
                    </p>
                  )}
                  <p className="text-xl font-bold text-primary-600">
                    Total: ₹{order.total?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
