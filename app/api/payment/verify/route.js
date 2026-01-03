import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { protect } from '@/lib/auth';
import { createErrorResponse } from '@/lib/apiHelpers';

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

    // Validate required fields
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { message: 'Missing payment verification data' },
        { status: 400 }
      );
    }

    // Validate field formats (basic sanity check)
    if (typeof razorpayOrderId !== 'string' || typeof razorpayPaymentId !== 'string' || typeof razorpaySignature !== 'string') {
      return NextResponse.json(
        { message: 'Invalid payment data format' },
        { status: 400 }
      );
    }

    // Verify signature
    const text = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const signatureBuffer = Buffer.from(razorpaySignature, 'hex');
    const isValid = expectedBuffer.length === signatureBuffer.length && 
      crypto.timingSafeEqual(expectedBuffer, signatureBuffer);

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
    return createErrorResponse(error, 'Payment verification failed');
  }
}
