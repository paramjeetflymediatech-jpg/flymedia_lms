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
          as: 'package',
          attributes: ['id', 'title', 'slug', 'price', 'category'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'role'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    return NextResponse.json({
      success: true,
      enrollments,
    });
  } catch (error: any) {
    console.error('Admin enrollments GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}
