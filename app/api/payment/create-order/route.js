import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { protect } from '@/lib/auth';
import { createErrorResponse } from '@/lib/apiHelpers';

const razorpay = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET 
  ? new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

// POST /api/payment/create-order - Create Razorpay order
export async function POST(request) {
  try {
    const auth = await protect(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status }
      );
    }

    if (!razorpay) {
      return NextResponse.json(
        { message: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    const { amount } = await request.json();

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { message: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Limit maximum order amount (e.g., 10 lakhs)
    if (amount > 1000000) {
      return NextResponse.json(
        { message: 'Amount exceeds maximum limit' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(
      {
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error, 'Failed to create payment order');
  }
}
