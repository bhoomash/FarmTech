'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { orderAPI, productAPI, userAPI } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isAdmin) {
      router.push('/');
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const [statsRes, productsRes] = await Promise.all([
          orderAPI.getAdminStats(),
          productAPI.getProducts()
        ]);

        setStats({
          totalOrders: statsRes.data.data?.totalOrders || 0,
          totalRevenue: statsRes.data.data?.totalRevenue || 0,
          totalProducts: productsRes.data.data?.length || 0,
          totalUsers: 0
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats({
          totalOrders: 0,
          totalRevenue: 0,
          totalProducts: 0,
          totalUsers: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, isAdmin, authLoading, router]);

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Admin Dashboard</h1>
          <p className="text-neutral-600">Manage your store and monitor performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-primary-600 mt-2">
                  ₹{stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="text-5xl">💰</div>
            </div>
          </div>

          <div className="card p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalOrders}</p>
              </div>
              <div className="text-5xl">📦</div>
            </div>
          </div>

          <div className="card p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalProducts}</p>
              </div>
              <div className="text-5xl">🌾</div>
            </div>
          </div>

          <div className="card p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.totalUsers}</p>
              </div>
              <div className="text-5xl">👥</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/admin/products">
              <button className="w-full btn-primary py-3">
                Manage Products
              </button>
            </Link>
            <Link href="/admin/orders">
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium">
                Manage Orders
              </button>
            </Link>
            <Link href="/admin/products/new">
              <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-medium">
                Add New Product
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
