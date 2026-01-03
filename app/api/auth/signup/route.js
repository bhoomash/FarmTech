import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendOTPEmail } from '@/lib/email';
import { setPendingSignup, removePendingSignup } from '@/lib/pendingSignups';
import { checkRateLimit, getClientIP, createErrorResponse } from '@/lib/apiHelpers';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Strong password validation
function validatePassword(password) {
  const errors = [];
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  return errors;
}

export async function POST(request) {
  try {
    // Rate limiting - 3 signup attempts per 10 minutes per IP
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`signup:${clientIP}`, 3, 10 * 60 * 1000);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          message: 'Too many signup attempts. Please try again later.',
          retryAfter: rateLimit.resetAt
        },
        { status: 429 }
      );
    }

    await dbConnect();

    const { email, name, password } = await request.json();

    // Validate input
    if (!email || !name || !password) {
      return NextResponse.json(
        { message: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Validate name
    if (name.trim().length < 2) {
      return NextResponse.json(
        { message: 'Name must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Strong password validation
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return NextResponse.json(
        { message: passwordErrors[0] },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Check if verified user already exists in DB
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Store pending signup in shared memory (NOT in database)
    setPendingSignup(normalizedEmail, {
      name: name.trim(),
      hashedPassword,
      hashedOtp,
    });

    // Send OTP via email
    const emailResult = await sendOTPEmail(normalizedEmail, otp);

    if (!emailResult.success) {
      // Remove from pending if email fails
      removePendingSignup(normalizedEmail);
      return NextResponse.json(
        { message: 'Failed to send OTP email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'OTP sent to your email for verification',
        email: normalizedEmail,
      },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error, 'Signup failed');
  }
}
