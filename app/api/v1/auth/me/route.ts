import { NextResponse } from 'next/server';
import { User } from '../../../../../src/db/models';
import { getAuthUserFromRequest } from '../jwt';

export async function GET(request: Request) {
  try {
    const authPayload = await getAuthUserFromRequest(request);
    if (!authPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: invalid or missing token' },
        { status: 401 }
      );
    }

    const user = await User.findByPk(authPayload.userId, {
      attributes: ['id', 'name', 'email', 'role', 'bio', 'avatar'],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Auth check failed' },
      { status: 500 }
    );
  }
}
