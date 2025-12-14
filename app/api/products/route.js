import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { protect, authorize } from '@/lib/auth';

// GET /api/products - Get all products with filters
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');

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
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: products
      },
      { status: 200 }
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
