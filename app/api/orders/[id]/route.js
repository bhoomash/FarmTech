import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { protect, authorize } from '@/lib/auth';

// GET /api/orders/[id] - Get single order
export async function GET(request, { params }) {
  try {
    const auth = await protect(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status }
      );
    }

    await dbConnect();

    const { id } = await params;

    const order = await Order.findById(id)
      .populate('user', 'name email')
      .populate('items.product');

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== auth.user._id.toString() && auth.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: order
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Update order status (Admin only)
export async function PUT(request, { params }) {
  try {
    const auth = await protect(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status }
      );
    }

    const authz = authorize(auth.user, 'admin');
    if (authz.error) {
      return NextResponse.json(
        { message: authz.message },
        { status: authz.status }
      );
    }

    await dbConnect();

    const { id } = await params;
    const { orderStatus } = await request.json();

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus },
      { new: true, runValidators: true }
    ).populate('user', 'name email').populate('items.product');

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Order status updated',
        data: order
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
