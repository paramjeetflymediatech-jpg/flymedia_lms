import { NextResponse } from 'next/server';
import { User } from '../../../../../src/db/models';
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

    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'phone', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error: any) {
    console.error('Admin users GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
