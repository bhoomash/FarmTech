import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { protect } from '@/lib/auth';
import { createErrorResponse, isValidObjectId } from '@/lib/apiHelpers';

// GET /api/cart - Get user's cart
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

    let cart = await Cart.findOne({ user: auth.user._id }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ user: auth.user._id, items: [] });
    }

    const totals = await cart.calculateTotal();

    return NextResponse.json(
      {
        success: true,
        data: { cart, ...totals }
      },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch cart');
  }
}

// POST /api/cart - Add item to cart
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

    const { productId, quantity } = await request.json();

    // Validate productId
    if (!productId || !isValidObjectId(productId)) {
      return NextResponse.json(
        { message: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Validate quantity
    if (!quantity || quantity < 1 || quantity > 100) {
      return NextResponse.json(
        { message: 'Invalid quantity' },
        { status: 400 }
      );
    }

    // Check product exists and has stock
    const product = await Product.findById(productId);
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

    // Get or create cart
    let cart = await Cart.findOne({ user: auth.user._id });
    if (!cart) {
      cart = await Cart.create({ user: auth.user._id, items: [] });
    }

    // Check if item already in cart
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return NextResponse.json(
          { message: 'Insufficient stock' },
          { status: 400 }
        );
      }
      existingItem.quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate('items.product');

    const totals = await cart.calculateTotal();

    return NextResponse.json(
      {
        success: true,
        message: 'Item added to cart',
        data: { cart, ...totals }
      },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error, 'Failed to add item to cart');
  }
}

// DELETE /api/cart - Clear cart
export async function DELETE(request) {
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
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    return NextResponse.json(
      { message: 'Cart cleared' },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error, 'Failed to clear cart');
  }
}
