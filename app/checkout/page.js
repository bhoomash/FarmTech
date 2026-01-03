'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { orderAPI, paymentAPI } from '@/services/api';
import { validateData, shippingAddressSchema } from '@/utils/validators';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet components (they require window object)
const MapComponent = dynamic(() => import('@/components/checkout/LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  )
});

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, user, openAuthModal } = useAuth();
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [locationLoading, setLocationLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  useEffect(() => {
    if (paymentSuccess) return; // Don't redirect after successful payment
    
    if (!isAuthenticated) {
      openAuthModal('login');
      router.push('/');
    } else if (!cart.items || cart.items.length === 0) {
      router.push('/');
    }
  }, [isAuthenticated, cart.items, router, openAuthModal, paymentSuccess]);

  if (!paymentSuccess && (!isAuthenticated || !cart.items || cart.items.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-yellow-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const handleChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  // Get user's current location using browser Geolocation API
  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        setShowMap(true);
        
        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en',
                'User-Agent': 'FarmTech-App'
              }
            }
          );
          
          const data = await response.json();
          
          if (data && data.address) {
            const addr = data.address;
            setShippingAddress(prev => ({
              ...prev,
              address: [addr.road, addr.neighbourhood, addr.suburb].filter(Boolean).join(', ') || data.display_name?.split(',').slice(0, 2).join(',') || '',
              city: addr.city || addr.town || addr.village || addr.county || '',
              state: addr.state || '',
              pincode: addr.postcode || ''
            }));
            toast.success('Location detected! Please verify the address.');
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          toast.error('Failed to get address. Please enter manually.');
        }
        
        setLocationLoading(false);
      },
      (error) => {
        setLocationLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location permission denied. Please enable it in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out.');
            break;
          default:
            toast.error('An error occurred while getting your location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Handle map click to update location
  const handleMapClick = async (lat, lng) => {
    setCoordinates({ lat, lng });
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'FarmTech-App'
          }
        }
      );
      
      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        setShippingAddress(prev => ({
          ...prev,
          address: [addr.road, addr.neighbourhood, addr.suburb].filter(Boolean).join(', ') || data.display_name?.split(',').slice(0, 2).join(',') || '',
          city: addr.city || addr.town || addr.village || addr.county || '',
          state: addr.state || '',
          pincode: addr.postcode || ''
        }));
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    // Basic check - only require phone number
    if (!shippingAddress.phone) {
      setErrors({ phone: 'Phone number is required' });
      return;
    }

    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load Razorpay. Please try again.');
        setLoading(false);
        return;
      }

      // Create Razorpay order
      const orderResponse = await paymentAPI.createOrder({ amount: cart.total });
      const orderData = orderResponse.data.data;
      const razorpayKeyId = orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!razorpayKeyId) {
        toast.error('Razorpay configuration error. Please contact support.');
        setLoading(false);
        return;
      }

      // Razorpay options
      const options = {
        key: razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'FarmTech',
        description: 'Order Payment',
        order_id: orderData.orderId,
        handler: async function (response) {
          // Mark payment as successful immediately to prevent redirect issues
          setPaymentSuccess(true);
          
          // Show success toast and navigate immediately for better UX
          toast.success('Order placed successfully!');
          router.push('/orders');
          
          // Run verification, order creation, and cart clearing in background
          // These don't need to block the user experience
          Promise.all([
            paymentAPI.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            }),
            orderAPI.createOrder({
              items: cart.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity
              })),
              shippingAddress,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            })
          ]).then(() => {
            // Clear cart after order is created
            clearCart();
          }).catch(error => {
            console.error('Background order processing error:', error);
            // Order is already placed via Razorpay, just log the error
          });
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: shippingAddress.phone
        },
        theme: {
          color: '#2563eb'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      setLoading(false);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <h2 className="text-xl font-bold">Shipping Address</h2>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locationLoading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition disabled:opacity-50 w-full sm:w-auto text-sm sm:text-base"
              >
                {locationLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                    <span>Detecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Use My Location</span>
                  </>
                )}
              </button>
            </div>

            {/* Map Component */}
            {showMap && coordinates && (
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-2">
                  Click on the map to adjust your location
                </div>
                <MapComponent 
                  coordinates={coordinates} 
                  onMapClick={handleMapClick}
                />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <textarea
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your full address"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={shippingAddress.pincode}
                    onChange={handleChange}
                    maxLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.pincode && (
                    <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleChange}
                    maxLength={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4">
              {cart.items.map((item, index) => (
                <div key={`${item.product._id}-${index}`} className="flex justify-between text-sm">
                  <span>{item.product.name} x{item.quantity}</span>
                  <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{cart.subtotal?.toFixed(2)}</span>
              </div>

              {cart.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{cart.discount?.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-xl font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary-600">₹{cart.total?.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 font-semibold"
            >
              {loading ? 'Processing...' : 'Pay with Razorpay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
