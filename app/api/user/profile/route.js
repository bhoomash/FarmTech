import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect } from '@/lib/auth';
import { createErrorResponse } from '@/lib/apiHelpers';
import { z } from 'zod';

// Profile update schema
const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long').optional(),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits').optional().nullable(),
  address: z.string().max(500, 'Address is too long').optional().nullable()
});

// GET /api/user/profile - Get user profile
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

    const user = await User.findById(auth.user._id).select('-password -otp -otpExpiry');

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: user
      },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch profile');
  }
}

// PUT /api/user/profile - Update user profile
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

    const body = await request.json();

    // Validate input
    const validationResult = profileSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, phone, address } = validationResult.data;

    // Build update object with only allowed fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    const user = await User.findByIdAndUpdate(
      auth.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpiry');

    return NextResponse.json(
      {
        success: true,
        message: 'Profile updated successfully',
        data: user
      },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error, 'Failed to update profile');
  }
}
