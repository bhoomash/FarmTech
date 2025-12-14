import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendOTPEmail } from '@/lib/email';

export async function POST(request) {
  try {
    await dbConnect();

    const { email, name, isNewUser } = await request.json();

    // Validate email
    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await User.findOne({ email }).select('+otp +otpExpiry');

    if (!user) {
      // Create new user
      if (!name) {
        return NextResponse.json(
          { message: 'Name is required for new users' },
          { status: 400 }
        );
      }

      user = await User.create({
        name,
        email,
        role: 'customer',
      });
    } else if (isNewUser && name) {
      // Update name if provided for existing user
      user.name = name;
    }

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) {
      return NextResponse.json(
        { message: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'OTP sent to your email',
        email: user.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
