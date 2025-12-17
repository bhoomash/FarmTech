import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendOTPEmail } from '@/lib/email';

export async function POST(request) {
  try {
    await dbConnect();

    const { email, name, password } = await request.json();

    // Validate input
    if (!email || !name || !password) {
      return NextResponse.json(
        { message: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
    });

    // Generate OTP
    const otp = await user.generateOTP();
    await user.save();

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) {
      return NextResponse.json(
        { message: 'User created but failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Signup successful! OTP sent to your email for verification',
        email: user.email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
