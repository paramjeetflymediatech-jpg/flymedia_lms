import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '../../../auth/jwt';
import { recordStudentClassJoin } from '@/src/lib/attendance';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUserFromRequest(req);

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please log in to join live class' },
        { status: 401 }
      );
    }

    const result = await recordStudentClassJoin(authUser.userId, id);

    if (!result.success || !result.meetLink) {
      return NextResponse.json(
        { success: false, error: result.error || 'Could not join class session' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      meetLink: result.meetLink,
      message: 'Attendance recorded successfully',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUserFromRequest(req);

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please log in to join live class' },
        { status: 401 }
      );
    }

    const result = await recordStudentClassJoin(authUser.userId, id);

    if (!result.success || !result.meetLink) {
      return NextResponse.json(
        { success: false, error: result.error || 'Could not join class session' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      meetLink: result.meetLink,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
