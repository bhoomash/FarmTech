'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { productAPI } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminProductsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getProducts();
        setProducts(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.push('/');
        return;
      }
      fetchProducts();
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productAPI.deleteProduct(id);
      alert('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <Link href="/admin/products/new">
          <button className="bg-white text-green-600 border border-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors">
            Add New Product
          </button>
        </Link>
      </div>

      <div className="rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product._id}>
                <td className="px-6 py-4">
                  <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium">{product.name}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4">₹{product.price}</td>
                <td className="px-6 py-4">{product.stock}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-3">
                    <Link href={`/admin/products/edit/${product._id}`}>
                      <button className="text-blue-600 hover:text-blue-800 transition-colors" title="Edit">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
