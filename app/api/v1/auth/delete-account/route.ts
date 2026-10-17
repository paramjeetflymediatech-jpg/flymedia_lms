import { NextResponse } from 'next/server';
import { User } from '../../../../../src/db/models';
import { getAuthUserFromRequest } from '../jwt';

export async function POST(request: Request) {
  try {
    const authPayload = await getAuthUserFromRequest(request);
    if (!authPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: invalid or missing session token' },
        { status: 401 }
      );
    }

    const user = await User.findByPk(authPayload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User account not found' },
        { status: 404 }
      );
    }

    // Safety guard: prevent accidental deletion of root master admin
    if (user.role === 'ADMIN' && user.email === 'admin@flymedia.org') {
      return NextResponse.json(
        { success: false, error: 'Primary administrator account cannot be deleted' },
        { status: 403 }
      );
    }

    // Permanently destroy user and cascade records (enrollments, certificates, etc.)
    await user.destroy();

    return NextResponse.json({
      success: true,
      message: 'Your account and associated personal data have been permanently deleted.',
    });
  } catch (error: any) {
    console.error('Error during account deletion:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  return POST(request);
}
