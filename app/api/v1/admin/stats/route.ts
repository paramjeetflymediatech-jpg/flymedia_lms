import { NextResponse } from 'next/server';
import { Package, Inquiry, Enrollment, User, Category, Coupon } from '../../../../../src/db/models';
import { getAuthUserFromRequest } from '../../auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authPayload = await getAuthUserFromRequest(request);
    if (!authPayload || authPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const [totalCourses, totalLeads, totalEnrollments, totalUsers, totalCategories, totalCoupons, recentLeads] = await Promise.all([
      Package.count(),
      Inquiry.count(),
      Enrollment.count(),
      User.count({ where: { role: 'STUDENT' } }),
      Category.count(),
      Coupon.count(),
      Inquiry.findAll({
        order: [['createdAt', 'DESC']],
        limit: 10,
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalCourses,
        totalLeads,
        totalEnrollments,
        totalUsers,
        totalCategories,
        totalCoupons,
      },
      recentLeads,
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
