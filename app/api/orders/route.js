import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { protect, authorize } from '@/lib/auth';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { createErrorResponse, isValidObjectId } from '@/lib/apiHelpers';
import { validateData, shippingAddressSchema } from '@/utils/validators';
import crypto from 'crypto';

// Verify Razorpay payment signature
function verifyPaymentSignature(orderId, paymentId, signature) {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return false;
  }
  
  const text = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');
  
  try {
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const signatureBuffer = Buffer.from(signature, 'hex');
    return expectedBuffer.length === signatureBuffer.length && 
      crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch {
    return false;
  }
}

// GET /api/orders - Get user's orders or all orders (admin)
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

    let orders;
    if (auth.user.role === 'admin') {
      // Admin gets all orders
      orders = await Order.find()
        .populate('user', 'name email')
        .populate('items.product')
        .sort({ createdAt: -1 });
    } else {
      // User gets their orders
      orders = await Order.find({ user: auth.user._id })
        .populate('items.product')
        .sort({ createdAt: -1 });
    }

    return NextResponse.json(
      {
        success: true,
        data: orders
      },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch orders');
  }
}

// POST /api/orders - Create order
export async function POST(request) {
  const session = await mongoose.startSession();
  
  try {
    const auth = await protect(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status }
      );
    }

    await dbConnect();

    const {
      shippingAddress,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = await request.json();

    // Validate shipping address
    const addressValidation = validateData(shippingAddressSchema, shippingAddress);
    if (!addressValidation.success) {
      return NextResponse.json(
        { message: 'Invalid shipping address', errors: addressValidation.errors },
        { status: 400 }
      );
    }

    // Verify payment signature
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { message: 'Payment details are required' },
        { status: 400 }
      );
    }

    const isValidPayment = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValidPayment) {
      return NextResponse.json(
        { message: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Start transaction for atomic stock update
    session.startTransaction();

    try {
      // Get cart
      const cart = await Cart.findOne({ user: auth.user._id }).populate('items.product').session(session);
      if (!cart || cart.items.length === 0) {
        await session.abortTransaction();
        return NextResponse.json(
          { message: 'Cart is empty' },
          { status: 400 }
        );
      }

      // Calculate totals
      const totals = await cart.calculateTotal();

      // Check stock availability and update stock atomically
      for (const item of cart.items) {
        const product = await Product.findById(item.product._id).session(session);
        
        if (!product) {
          await session.abortTransaction();
          return NextResponse.json(
            { message: `Product ${item.product.name} not found` },
            { status: 400 }
          );
        }
        
        if (product.stock < item.quantity) {
          await session.abortTransaction();
          return NextResponse.json(
            { message: `Insufficient stock for ${product.name}. Available: ${product.stock}` },
            { status: 400 }
          );
        }

        // Update stock
        await Product.findByIdAndUpdate(
          item.product._id,
          { $inc: { stock: -item.quantity } },
          { session }
        );
      }

      // Prepare order items
      const orderItems = cart.items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        discount: item.product.discount,
        quantity: item.quantity,
      }));

      // Create order
      const [order] = await Order.create([{
        user: auth.user._id,
        items: orderItems,
        shippingAddress,
        subtotal: totals.subtotal,
        discount: totals.discount,
        total: totals.total,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paymentStatus: 'completed',
        orderStatus: 'confirmed',
      }], { session });

      // Clear cart
      cart.items = [];
      await cart.save({ session });

      // Commit transaction
      await session.commitTransaction();

      // Send confirmation email (outside transaction - non-critical)
      try {
        await sendOrderConfirmationEmail(auth.user.email, {
          orderId: order._id,
          items: orderItems,
          total: totals.total,
        });
      } catch (emailError) {
        // Log but don't fail the order
        console.error('Failed to send order confirmation email:', emailError);
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Order created successfully',
          data: order
        },
        { status: 201 }
      );
    } catch (txError) {
      await session.abortTransaction();
      throw txError;
    }
  } catch (error) {
    return createErrorResponse(error, 'Failed to create order');
  } finally {
    session.endSession();
  }
}
