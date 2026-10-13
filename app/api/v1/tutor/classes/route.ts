import { NextResponse } from 'next/server';
import { LiveClass, TutorAvailability } from '../../../../src/db/models';
import { getAuthUserFromRequest } from '../auth/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser || (authUser.role !== 'TUTOR' && authUser.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Tutor access required' }, { status: 403 });
    }

    const body = await request.json();
    const { sessionId, isOneOnOne, meetLink, status } = body;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'sessionId is required' }, { status: 400 });
    }

    if (isOneOnOne) {
      const session = await TutorAvailability.findOne({
        where: { id: sessionId, tutorId: authUser.userId },
      });
      if (!session) {
        return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
      }

      await session.update({
        meetLink: meetLink !== undefined ? meetLink : session.meetLink,
        status: status !== undefined ? status : session.status,
      });

      return NextResponse.json({
        success: true,
        message: 'Session updated successfully',
        session: session.get({ plain: true }),
      });
    } else {
      const liveClass = await LiveClass.findOne({
        where: { id: sessionId, tutorId: authUser.userId },
      });
      if (!liveClass) {
        return NextResponse.json({ success: false, error: 'Live class not found' }, { status: 404 });
      }

      await liveClass.update({
        meetLink: meetLink !== undefined ? meetLink : liveClass.meetLink,
        status: status !== undefined ? status : liveClass.status,
      });

      return NextResponse.json({
        success: true,
        message: 'Class updated successfully',
        class: liveClass.get({ plain: true }),
      });
    }
  } catch (error: any) {
    console.error('Tutor update class error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update class' }, { status: 500 });
  }
}
