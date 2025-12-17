'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { productAPI } from '@/services/api';
import { validateData, productSchema } from '@/utils/validators';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Fertilizer',
    price: '',
    discount: '0',
    stock: '',
    image: ''
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.push('/');
        return;
      }
      
      // Fetch product data
      const fetchProduct = async () => {
        try {
          const response = await productAPI.getProduct(params.id);
          const product = response.data.data;
          setFormData({
            name: product.name || '',
            description: product.description || '',
            category: product.category || 'Fertilizer',
            price: product.price?.toString() || '',
            discount: product.discount?.toString() || '0',
            stock: product.stock?.toString() || '',
            image: product.image || ''
          });
        } catch (error) {
          console.error('Failed to fetch product:', error);
          toast.error('Failed to load product');
          router.push('/admin/products');
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [isAuthenticated, isAdmin, authLoading, router, params.id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Convert string numbers to numbers
    const productData = {
      ...formData,
      price: Number(formData.price),
      discount: Number(formData.discount),
      stock: Number(formData.stock)
    };

    // Validate
    const validation = validateData(productSchema, productData);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    setSaving(true);
    try {
      await productAPI.updateProduct(params.id, productData);
      toast.success('Product updated successfully!');
      router.push('/admin/products');
    } catch (error) {
      console.error('Failed to update product:', error);
      toast.error(error.response?.data?.message || 'Failed to update product');
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Edit Product</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="Fertilizer">Fertilizer</option>
            <option value="Seeds">Seeds</option>
            <option value="Pesticides">Pesticides</option>
            <option value="Tools">Tools</option>
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Price (₹)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Discount (%)</label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              min="0"
              max="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.discount && <p className="text-red-500 text-sm mt-1">{errors.discount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Image URL</label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
          
          {/* Image Preview */}
          {formData.image && (
            <div className="mt-3">
              <p className="text-sm text-gray-500 mb-2">Preview:</p>
              <img 
                src={formData.image} 
                alt="Product preview" 
                className="w-32 h-32 object-cover rounded-lg border"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 transition-colors"
          >
            {saving ? 'Saving...' : 'Update Product'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
