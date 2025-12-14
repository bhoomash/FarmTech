import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { protect, authorize } from '@/lib/auth';
import { sendOrderConfirmationEmail } from '@/lib/email';

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
    console.error('Get orders error:', error);
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create order
export async function POST(request) {
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

    // Get cart
    const cart = await Cart.findOne({ user: auth.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { message: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Calculate totals
    const totals = await cart.calculateTotal();

    // Prepare order items
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      discount: item.product.discount,
      quantity: item.quantity,
    }));

    // Create order
    const order = await Order.create({
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
    });

    // Decrease product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    // Send confirmation email
    await sendOrderConfirmationEmail(auth.user.email, {
      orderId: order._id,
      items: orderItems,
      total: totals.total,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        data: order
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
