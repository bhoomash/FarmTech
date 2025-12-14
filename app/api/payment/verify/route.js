import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { protect } from '@/lib/auth';

// POST /api/payment/verify - Verify Razorpay payment
export async function POST(request) {
  try {
    const auth = await protect(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status }
      );
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await request.json();

    // Verify signature
    const text = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    const isValid = expectedSignature === razorpaySignature;

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Payment verified successfully', verified: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
