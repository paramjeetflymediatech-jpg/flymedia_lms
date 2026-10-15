import { NextResponse } from 'next/server';
import { TutorAvailability, TutorSlotBooking, User, Enrollment } from '../../../../../src/db/models';
import { getAuthUserFromRequest } from '../../auth/jwt';
import { Op } from 'sequelize';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get('tutorId');
    const date = searchParams.get('date');

    if (!tutorId) {
      return NextResponse.json({ success: false, error: 'tutorId is required' }, { status: 400 });
    }

    const authUser = await getAuthUserFromRequest(request);
    const currentUserId = authUser?.userId || null;

    const now = new Date();
    const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const queryDate = date || todayString;

    // Calculate student's available credit balance
    let availableCredits = 0;
    if (currentUserId) {
      const userRecord = await User.findByPk(currentUserId);
      const studentEnrollments = await Enrollment.findAll({ where: { userId: currentUserId } });
      if (studentEnrollments.length > 0) {
        availableCredits = studentEnrollments.reduce(
          (acc, e) => acc + Math.max(0, (e.totalCredits || 10) - (e.usedCredits || 0)),
          0
        );
      } else {
        availableCredits = userRecord?.credits || 0;
      }
    }

    const slots = await TutorAvailability.findAll({
      where: { tutorId, date: queryDate },
      order: [['startTime', 'ASC']],
      include: [
        {
          model: TutorSlotBooking,
          as: 'bookings',
          attributes: ['studentId', 'status', 'attendanceStatus', 'creditDeducted'],
          required: false,
        },
      ],
      attributes: ['id', 'startTime', 'endTime', 'date', 'isBooked', 'bookedCount', 'maxStudents', 'studentId', 'meetLink', 'status'],
    });

    const formattedSlots = slots.map((s) => {
      const plain = s.get({ plain: true });
      const slotDate = plain.date || queryDate;
      const isPast = slotDate < todayString || (slotDate === todayString && plain.startTime <= currentTime);
      
      const bookings = (plain as any).bookings || [];
      const activeBookings = bookings.filter((b: any) => b.status !== 'CANCELLED');
      const bookedCount = activeBookings.length > 0 ? activeBookings.length : (plain.bookedCount || 0);
      const isBookedByMe = Boolean(
        (currentUserId && activeBookings.some((b: any) => b.studentId === currentUserId)) ||
        (currentUserId && plain.studentId === currentUserId)
      );
      const isFull = bookedCount >= 100;
      const availableSeats = Math.max(0, 100 - bookedCount);

      return {
        id: plain.id,
        startTime: plain.startTime,
        endTime: plain.endTime,
        date: slotDate,
        isBooked: isFull,
        isBookedByMe,
        isPast,
        status: plain.status,
        bookedCount,
        maxStudents: 100,
        availableSeats,
      };
    });

    return NextResponse.json({
      success: true,
      availableCredits,
      slots: formattedSlots,
    });
  } catch (error: any) {
    console.error('Student availability API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch slots' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Please log in to book a session' }, { status: 401 });
    }

    const body = await request.json();
    const { slotId } = body;

    if (!slotId) {
      return NextResponse.json({ success: false, error: 'slotId is required' }, { status: 400 });
    }

    const slot = await TutorAvailability.findByPk(slotId);
    if (!slot) {
      return NextResponse.json({ success: false, error: 'Slot not found' }, { status: 404 });
    }

    const now = new Date();
    const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (slot.date < todayString || (slot.date === todayString && slot.startTime <= currentTime)) {
      return NextResponse.json({ success: false, error: 'Cannot book slots in the past' }, { status: 400 });
    }

    // 1. Check if student already booked this slot
    const existingBooking = await TutorSlotBooking.findOne({
      where: {
        slotId,
        studentId: authUser.userId,
        status: { [Op.ne]: 'CANCELLED' },
      },
    });

    if (existingBooking || slot.studentId === authUser.userId) {
      return NextResponse.json({ success: false, error: 'You have already booked this session' }, { status: 400 });
    }

    // 2. Check capacity (Max 100 students)
    const currentBookingsCount = await TutorSlotBooking.count({
      where: {
        slotId,
        status: { [Op.ne]: 'CANCELLED' },
      },
    });

    if (currentBookingsCount >= 100) {
      return NextResponse.json({ success: false, error: 'This session is fully booked (maximum 100 students reached)' }, { status: 400 });
    }

    // 3. Check student credit balance
    const userRecord = await User.findByPk(authUser.userId);
    const studentEnrollments = await Enrollment.findAll({
      where: { userId: authUser.userId },
      order: [['createdAt', 'DESC']],
    });

    let availableCredits = 0;
    let targetEnrollment: any = null;

    if (studentEnrollments.length > 0) {
      availableCredits = studentEnrollments.reduce(
        (acc, e) => acc + Math.max(0, (e.totalCredits || 10) - (e.usedCredits || 0)),
        0
      );
      targetEnrollment = studentEnrollments.find(e => (e.totalCredits || 10) > (e.usedCredits || 0));
    } else {
      availableCredits = userRecord?.credits || 0;
    }

    if (availableCredits <= 0) {
      return NextResponse.json(
        {
          success: false,
          insufficientCredits: true,
          error: 'Insufficient slot balance. You have 0 credits remaining. Please enroll in a package or purchase session credits to book.',
        },
        { status: 403 }
      );
    }

    // 4. Create booking record (marked creditDeducted: true - non-refundable on student absence)
    await TutorSlotBooking.create({
      slotId,
      studentId: authUser.userId,
      status: 'SCHEDULED',
      attendanceStatus: 'SCHEDULED',
      creditDeducted: true,
    });

    // 5. Deduct credit immediately from student
    if (targetEnrollment) {
      await targetEnrollment.increment('usedCredits', { by: 1 });
    }
    if (userRecord && (userRecord.credits || 0) > 0) {
      await userRecord.decrement('credits', { by: 1 });
    }

    const newCount = currentBookingsCount + 1;
    await slot.update({
      bookedCount: newCount,
      isBooked: newCount >= 100,
      studentId: slot.studentId || authUser.userId,
      status: 'SCHEDULED',
    });

    return NextResponse.json({
      success: true,
      message: 'Session booked successfully! 1 credit deducted from your profile balance.',
      remainingCredits: Math.max(0, availableCredits - 1),
      slot: {
        id: slot.id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBooked: newCount >= 100,
        isBookedByMe: true,
        bookedCount: newCount,
        maxStudents: 100,
        availableSeats: Math.max(0, 100 - newCount),
      },
    });
  } catch (error: any) {
    console.error('Book session API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to book slot' }, { status: 500 });
  }
}

