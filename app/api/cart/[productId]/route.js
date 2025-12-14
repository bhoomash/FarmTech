import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { protect } from '@/lib/auth';

// PUT /api/cart/[productId] - Update item quantity
export async function PUT(request, { params }) {
  try {
    const auth = await protect(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status }
      );
    }

    await dbConnect();

    const { quantity } = await request.json();

    // Validate quantity
    if (quantity < 1) {
      return NextResponse.json(
        { message: 'Quantity must be at least 1' },
        { status: 400 }
      );
    }

    // Check product stock
    const product = await Product.findById(params.productId);
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { message: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Update cart
    const cart = await Cart.findOne({ user: auth.user._id });
    if (!cart) {
      return NextResponse.json(
        { message: 'Cart not found' },
        { status: 404 }
      );
    }

    const item = cart.items.find(
      (item) => item.product.toString() === params.productId
    );

    if (!item) {
      return NextResponse.json(
        { message: 'Item not in cart' },
        { status: 404 }
      );
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');

    const totals = await cart.calculateTotal();

    return NextResponse.json(
      {
        success: true,
        message: 'Cart updated',
        data: { cart, ...totals }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart/[productId] - Remove item from cart
export async function DELETE(request, { params }) {
  try {
    const auth = await protect(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status }
      );
    }

    await dbConnect();

    const cart = await Cart.findOne({ user: auth.user._id });
    if (!cart) {
      return NextResponse.json(
        { message: 'Cart not found' },
        { status: 404 }
      );
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== params.productId
    );

    await cart.save();
    await cart.populate('items.product');

    const totals = await cart.calculateTotal();

    return NextResponse.json(
      {
        success: true,
        message: 'Item removed from cart',
        data: { cart, ...totals }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Remove from cart error:', error);
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
