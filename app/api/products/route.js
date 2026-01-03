import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { protect, authorize } from '@/lib/auth';
import { validateData, productSchema } from '@/utils/validators';
import { createErrorResponse } from '@/lib/apiHelpers';

// In-memory cache for products (server-side)
let productsCache = {
  data: null,
  timestamp: 0,
  queries: new Map()
};
const CACHE_DURATION = 30000; // 30 seconds

// GET /api/products - Get all products with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');

    // Create cache key from query params
    const cacheKey = JSON.stringify({ category, minPrice, maxPrice, search });
    const now = Date.now();

    // Check cache first
    const cached = productsCache.queries.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(
        { success: true, data: cached.data },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
            'X-Cache': 'HIT'
          }
        }
      );
    }

    await dbConnect();

    // Build query - don't filter by isActive if products don't have this field
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      // Use MongoDB text search for better performance and security
      // Fallback to regex if text index not set up
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').substring(0, 100); // Limit length
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } },
      ];
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .lean() // Returns plain JS objects (faster)
      .exec();

    // Cache the result
    productsCache.queries.set(cacheKey, {
      data: products,
      timestamp: now
    });

    // Cleanup old cache entries (keep last 20)
    if (productsCache.queries.size > 20) {
      const firstKey = productsCache.queries.keys().next().value;
      productsCache.queries.delete(firstKey);
    }

    return NextResponse.json(
      {
        success: true,
        data: products
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          'X-Cache': 'MISS'
        }
      }
    );
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch products');
  }
}

// POST /api/products - Create product (Admin only)
export async function POST(request) {
  try {
    // Check authentication
    const auth = await protect(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status }
      );
    }

    // Check authorization
    const authz = authorize(auth.user, 'admin');
    if (authz.error) {
      return NextResponse.json(
        { message: authz.message },
        { status: authz.status }
      );
    }

    await dbConnect();

    const body = await request.json();
    
    // Validate input using Zod schema
    const validation = validateData(productSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    // Only allow specific fields
    const allowedFields = ['name', 'description', 'category', 'price', 'discount', 'stock', 'image', 'isActive'];
    const sanitizedBody = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        sanitizedBody[field] = body[field];
      }
    }

    const product = await Product.create(sanitizedBody);

    // Clear cache
    productsCache.queries.clear();

    return NextResponse.json(
      { message: 'Product created successfully', product },
      { status: 201 }
    );
  } catch (error) {
    return createErrorResponse(error, 'Failed to create product');
  }
}
