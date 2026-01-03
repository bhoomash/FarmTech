import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendOTPEmail } from '@/lib/email';

/**
 * Simple in-memory rate limiting (per IP)
 * NOTE: This works for single server deployments but won't persist
 * across serverless function invocations or multiple instances.
 * For production, consider using Redis or a database-backed solution.
 */
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 3; // Max 3 OTP requests per minute

function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];
  
  // Filter requests within the window
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  
  // Cleanup old entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, times] of rateLimitMap.entries()) {
      const validTimes = times.filter(t => now - t < RATE_LIMIT_WINDOW);
      if (validTimes.length === 0) {
        rateLimitMap.delete(key);
      }
    }
  }
  
  return true;
}

export async function POST(request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { message: 'Too many OTP requests. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    await dbConnect();

    const { email, name, isNewUser } = await request.json();

    // Validate email
    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Find existing user (for login flow)
    let user = await User.findOne({ email: normalizedEmail }).select('+otp +otpExpiry');

    if (!user) {
      // No user found - they need to sign up first
      return NextResponse.json(
        { message: 'No account found. Please sign up first.' },
        { status: 404 }
      );
    }

    // Generate OTP (now async due to bcrypt hashing)
    const otp = await user.generateOTP();
    await user.save();

    // Send OTP via email
    const emailResult = await sendOTPEmail(normalizedEmail, otp);

    if (!emailResult.success) {
      return NextResponse.json(
        { message: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'OTP sent to your email',
        email: normalizedEmail,
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
