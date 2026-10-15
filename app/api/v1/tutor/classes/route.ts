import { NextResponse } from 'next/server';
import { LiveClass, TutorAvailability, TutorSlotBooking, Enrollment, User } from '../../../../../src/db/models';
import { getAuthUserFromRequest } from '../../auth/jwt';
import { Op } from 'sequelize';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser || (authUser.role !== 'TUTOR' && authUser.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Tutor access required' }, { status: 403 });
    }

    const body = await request.json();
    const { sessionId, isOneOnOne, meetLink, status, attendanceStatus, studentId } = body;

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

      // Update student attendance status if provided
      if (attendanceStatus) {
        const whereClause: any = { slotId: sessionId };
        if (studentId) whereClause.studentId = studentId;

        await TutorSlotBooking.update(
          { attendanceStatus },
          { where: whereClause }
        );
      }

      // If tutor/admin cancels the class, refund the credit
      if (status === 'CANCELLED') {
        const bookings = await TutorSlotBooking.findAll({
          where: { slotId: sessionId, status: { [Op.ne]: 'CANCELLED' } },
        });

        for (const b of bookings) {
          if (b.creditDeducted) {
            const studentEnrollment = await Enrollment.findOne({
              where: { userId: b.studentId },
              order: [['createdAt', 'DESC']],
            });
            if (studentEnrollment && (studentEnrollment.usedCredits || 0) > 0) {
              await studentEnrollment.decrement('usedCredits', { by: 1 });
            }
            const studentUser = await User.findByPk(b.studentId);
            if (studentUser) {
              await studentUser.increment('credits', { by: 1 });
            }
            await b.update({ status: 'CANCELLED', creditDeducted: false });
          }
        }
      }

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
