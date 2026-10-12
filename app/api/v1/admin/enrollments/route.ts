import { NextResponse } from 'next/server';
import { Enrollment, Package, User } from '../../../../../src/db/models';
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

    const enrollments = await Enrollment.findAll({
      include: [
        {
          model: Package,
          attributes: ['id', 'title', 'slug', 'price', 'category'],
          required: false,
        },
        {
          model: User,
          attributes: ['id', 'name', 'email', 'role'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    const formattedEnrollments = enrollments.map((enr: any) => {
      const e = enr.toJSON ? enr.toJSON() : enr;
      return {
        ...e,
        package: e.Package || e.package || null,
        user: e.User || e.user || null,
      };
    });

    return NextResponse.json({
      success: true,
      enrollments: formattedEnrollments,
    });
  } catch (error: any) {
    console.error('Admin enrollments GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}
