import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import { protect } from '@/lib/auth';

// GET /api/user/wishlist - Get user's wishlist
export async function GET(request) {
  try {
    const auth = await protect(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status }
      );
    }

    await dbConnect();

    const user = await User.findById(auth.user._id).populate('wishlist');

    return NextResponse.json(
      {
        success: true,
        data: user.wishlist || []
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get wishlist error:', error);
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// POST /api/user/wishlist - Add product to wishlist
export async function POST(request) {
  try {
    const auth = await protect(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status }
      );
    }

    await dbConnect();

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { message: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    const user = await User.findById(auth.user._id);

    // Check if product already in wishlist
    if (user.wishlist.includes(productId)) {
      return NextResponse.json(
        { message: 'Product already in wishlist' },
        { status: 400 }
      );
    }

    user.wishlist.push(productId);
    await user.save();

    await user.populate('wishlist');

    return NextResponse.json(
      {
        success: true,
        data: user.wishlist,
        message: 'Product added to wishlist'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Add to wishlist error:', error);
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
