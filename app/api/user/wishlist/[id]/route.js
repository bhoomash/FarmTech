import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect } from '@/lib/auth';

// DELETE /api/user/wishlist/[id] - Remove product from wishlist
export async function DELETE(request, { params }) {
  try {
    const auth = await protect(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status }
      );
    }

    await dbConnect();

    const { id } = params;

    const user = await User.findById(auth.user._id);

    // Remove product from wishlist
    user.wishlist = user.wishlist.filter(
      (productId) => productId.toString() !== id
    );

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Product removed from wishlist'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
