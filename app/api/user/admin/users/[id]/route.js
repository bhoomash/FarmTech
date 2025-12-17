import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect, authorize } from '@/lib/auth';

// PUT /api/user/admin/users/[id] - Update user role (Admin only)
export async function PUT(request, { params }) {
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

    const { id } = await params;
    const { role } = await request.json();

    if (!['user', 'admin'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpiry');

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
        message: 'User role updated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/admin/users/[id] - Delete user (Admin only)
export async function DELETE(request, { params }) {
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

    const { id } = await params;

    // Prevent deleting own account
    if (id === auth.user._id?.toString() || id === auth.user.userId) {
      return NextResponse.json(
        { message: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'User deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
