import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { protect, authorize } from '@/lib/auth';
import { createErrorResponse } from '@/lib/apiHelpers';

// GET /api/orders/admin/stats - Get admin statistics
export async function GET(request) {
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

    // Use aggregation for better performance
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    const { totalRevenue = 0, totalOrders = 0 } = stats[0] || {};

    return NextResponse.json(
      {
        success: true,
        data: {
          totalRevenue,
          totalOrders,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch statistics');
  }
}
