import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { protect, authorize } from '@/lib/auth';
import { isValidObjectId, createErrorResponse } from '@/lib/apiHelpers';
import { validateData, productSchema } from '@/utils/validators';

// GET /api/products/[id] - Get single product
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { message: 'Invalid product ID' },
        { status: 400 }
      );
    }

    await dbConnect();

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: product
      },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch product');
  }
}

// PUT /api/products/[id] - Update product (Admin only)
export async function PUT(request, { params }) {
  try {
    // Check authentication
    const auth = await protect(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status }
      );
    }

    // Check authorization
    const authz = authorize(auth.user, 'admin');
    if (authz.error) {
      return NextResponse.json(
        { message: authz.message },
        { status: authz.status }
      );
    }

    const { id } = await params;
    
    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { message: 'Invalid product ID' },
        { status: 400 }
      );
    }

    await dbConnect();

    const body = await request.json();
    
    // Validate input using Zod schema (partial for updates)
    const validation = validateData(productSchema.partial(), body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    // Only allow specific fields
    const allowedFields = ['name', 'description', 'category', 'price', 'discount', 'stock', 'image', 'isActive'];
    const sanitizedBody = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        sanitizedBody[field] = body[field];
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      sanitizedBody,
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Product updated successfully', product },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error, 'Failed to update product');
  }
}

// DELETE /api/products/[id] - Delete product (Admin only)
export async function DELETE(request, { params }) {
  try {
    // Check authentication
    const auth = await protect(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status }
      );
    }

    // Check authorization
    const authz = authorize(auth.user, 'admin');
    if (authz.error) {
      return NextResponse.json(
        { message: authz.message },
        { status: authz.status }
      );
    }

    const { id } = await params;
    
    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { message: 'Invalid product ID' },
        { status: 400 }
      );
    }

    await dbConnect();

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error, 'Failed to delete product');
  }
}
