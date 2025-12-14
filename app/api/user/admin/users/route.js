import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import { protect, authorize } from '@/lib/auth';

// GET /api/user/admin/users - Get all users (Admin only)
export async function GET(request) {
  try {
    const auth = await protect(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status }
      );
    }

    const authz = authorize(auth.user, 'admin');
    if (authz.error) {
      return NextResponse.json(
        { message: authz.message },
        { status: authz.status }
      );
    }

    await dbConnect();

    const users = await User.find().select('-otp -otpExpiry');
    const products = await Product.find();

    return NextResponse.json(
      {
        totalUsers: users.length,
        totalProducts: products.length,
        users,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
