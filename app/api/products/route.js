import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { protect, authorize } from '@/lib/auth';

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
      // Sanitize search input to prevent ReDoS attacks
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
    console.error('Get products error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false,
        message: error.message || 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
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
    const product = await Product.create(body);

    return NextResponse.json(
      { message: 'Product created successfully', product },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
