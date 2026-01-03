import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';
import { getPendingSignup, removePendingSignup } from '@/lib/pendingSignups';
import { createErrorResponse, checkRateLimit, getClientIP } from '@/lib/apiHelpers';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    // Rate limiting - 5 OTP attempts per 15 minutes per IP
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`verify-otp:${clientIP}`, 5, 15 * 60 * 1000);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: 'Too many OTP attempts. Please try again later.' },
        { status: 429 }
      );
    }

    await dbConnect();

    const { email, otp } = await request.json();

    // Validate input
    if (!email || !otp) {
      return NextResponse.json(
        { message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // First check if this is a pending signup (new user)
    const pendingData = getPendingSignup(normalizedEmail);
    
    if (pendingData) {
      // Verify OTP
      const isValidOTP = await bcrypt.compare(otp, pendingData.hashedOtp);
      if (!isValidOTP) {
        return NextResponse.json(
          { message: 'Invalid OTP' },
          { status: 400 }
        );
      }

      // OTP verified! Now create the user in database
      const user = await User.create({
        name: pendingData.name,
        email: normalizedEmail,
        password: pendingData.hashedPassword, // Already hashed
        role: 'user',
        isVerified: true,
      });

      // Remove from pending signups
      removePendingSignup(normalizedEmail);

      // Generate JWT token
      const token = generateToken(user._id);

      // Return user without sensitive fields
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return NextResponse.json(
        {
          success: true,
          message: 'Account created successfully! You are now logged in.',
          token,
          user: userResponse,
        },
        { status: 201 }
      );
    }

    // If not a pending signup, check for existing user (login via OTP)
    const user = await User.findOne({ email: normalizedEmail }).select('+otp +otpExpiry');

    if (!user) {
      return NextResponse.json(
        { message: 'No pending signup found. Please sign up again.' },
        { status: 404 }
      );
    }

    // Verify OTP for existing user
    const isValidOTP = await user.verifyOTP(otp);
    if (!isValidOTP) {
      return NextResponse.json(
        { message: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Clear OTP and mark as verified
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.isVerified = true;
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user without sensitive fields
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful!',
        token,
        user: userResponse,
      },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error, 'OTP verification failed');
  }
}
