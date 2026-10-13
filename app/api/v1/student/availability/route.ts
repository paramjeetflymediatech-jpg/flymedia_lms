import { NextResponse } from 'next/server';
import { TutorAvailability, User } from '../../../../src/db/models';
import { getAuthUserFromRequest } from '../auth/jwt';
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
      attributes: ['id', 'startTime', 'endTime', 'date', 'isBooked', 'studentId', 'meetLink', 'status'],
    });

    const formattedSlots = slots.map((s) => {
      const plain = s.get({ plain: true });
      const slotDate = plain.date || queryDate;
      const isPast = slotDate < todayString || (slotDate === todayString && plain.startTime <= currentTime);
      const isBooked = Boolean(plain.isBooked);
      const isBookedByMe = Boolean(isBooked && currentUserId && plain.studentId === currentUserId);

      return {
        id: plain.id,
        startTime: plain.startTime,
        endTime: plain.endTime,
        date: slotDate,
        isBooked,
        isBookedByMe,
        isPast,
        status: plain.status,
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

    if (slot.isBooked) {
      return NextResponse.json({ success: false, error: 'This slot is already booked' }, { status: 400 });
    }

    const now = new Date();
    const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (slot.date < todayString || (slot.date === todayString && slot.startTime <= currentTime)) {
      return NextResponse.json({ success: false, error: 'Cannot book slots in the past' }, { status: 400 });
    }

    await slot.update({
      isBooked: true,
      studentId: authUser.userId,
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
        isBooked: true,
        isBookedByMe: true,
      },
    });
  } catch (error: any) {
    console.error('Book session API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to book slot' }, { status: 500 });
  }
}
