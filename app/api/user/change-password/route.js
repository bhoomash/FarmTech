import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// PUT /api/user/change-password - Change user password
export async function PUT(request) {
  try {
    const auth = await protect(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status }
      );
    }

    await dbConnect();

    const { currentPassword, newPassword } = await request.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Get user with password
    const user = await User.findById(auth.user._id).select('+password');
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Password changed successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
