import { NextResponse } from 'next/server';
import { TutorAvailability, TutorSlotBooking, User } from '../../../../../src/db/models';
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

    const slots = await TutorAvailability.findAll({
      where: { tutorId, date: queryDate },
      order: [['startTime', 'ASC']],
      include: [
        {
          model: TutorSlotBooking,
          as: 'bookings',
          attributes: ['studentId', 'status'],
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

    // Check if this student already booked this slot
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

    // Check capacity (Max 100 students)
    const currentBookingsCount = await TutorSlotBooking.count({
      where: {
        slotId,
        status: { [Op.ne]: 'CANCELLED' },
      },
    });

    if (currentBookingsCount >= 100) {
      return NextResponse.json({ success: false, error: 'This session is fully booked (maximum 100 students reached)' }, { status: 400 });
    }

    // Create booking
    await TutorSlotBooking.create({
      slotId,
      studentId: authUser.userId,
      status: 'SCHEDULED',
    });

    const newCount = currentBookingsCount + 1;
    await slot.update({
      bookedCount: newCount,
      isBooked: newCount >= 100,
      studentId: slot.studentId || authUser.userId,
      status: 'SCHEDULED',
    });

    return NextResponse.json({
      success: true,
      message: 'Session booked successfully!',
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

