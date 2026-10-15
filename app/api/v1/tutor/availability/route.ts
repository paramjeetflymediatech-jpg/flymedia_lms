import { NextResponse } from 'next/server';
import { TutorAvailability, TutorSlotBooking, User } from '../../../../../src/db/models';
import { getAuthUserFromRequest } from '../../auth/jwt';
import { Op } from 'sequelize';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser || (authUser.role !== 'TUTOR' && authUser.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Tutor access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const now = new Date();
    const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const queryDate = date || todayString;

    const slots = await TutorAvailability.findAll({
      where: {
        tutorId: authUser.userId,
        date: queryDate,
      },
      order: [['startTime', 'ASC']],
      include: [
        {
          model: TutorSlotBooking,
          as: 'bookings',
          attributes: ['id', 'status', 'createdAt'],
          include: [
            {
              model: User,
              as: 'student',
              attributes: ['id', 'name', 'email', 'avatar'],
            },
          ],
          required: false,
        },
      ],
    });

    const formatted = slots.map((s) => {
      const plain = s.get({ plain: true });
      const bookings = (plain as any).bookings || [];
      const activeBookings = bookings.filter((b: any) => b.status !== 'CANCELLED');
      const count = activeBookings.length > 0 ? activeBookings.length : (plain.bookedCount || 0);
      const students = activeBookings.map((b: any) => ({
        id: b.student?.id || b.id,
        name: b.student?.name || 'Student',
        email: b.student?.email || '',
        avatar: b.student?.avatar || null,
        bookedAt: b.createdAt,
      }));

      return {
        ...plain,
        bookedCount: count,
        maxStudents: 100,
        isBooked: count >= 100,
        students,
      };
    });

    return NextResponse.json({
      success: true,
      slots: formatted,
    });
  } catch (error: any) {
    console.error('Tutor availability GET error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch slots' }, { status: 500 });
  }
}

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return -1;
  const clean = timeStr.trim().split(' ')[0];
  const parts = clean.split(':');
  if (parts.length < 2) return -1;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return -1;
  }
  return hours * 60 + minutes;
}

function formatMinutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser || (authUser.role !== 'TUTOR' && authUser.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Tutor access required' }, { status: 403 });
    }

    const body = await request.json();
    const { date, startTime, endTime } = body;

    if (!date || !startTime || !endTime) {
      return NextResponse.json({ success: false, error: 'Date, start time, and end time are required' }, { status: 400 });
    }

    const newStartMinutes = parseTimeToMinutes(startTime);
    const newEndMinutes = parseTimeToMinutes(endTime);

    if (newStartMinutes < 0 || newEndMinutes < 0) {
      return NextResponse.json({ success: false, error: 'Invalid time format. Please provide time as HH:mm (e.g. 10:00)' }, { status: 400 });
    }

    if (newStartMinutes >= newEndMinutes) {
      return NextResponse.json({ success: false, error: 'End time must be after start time' }, { status: 400 });
    }

    const normalizedStartTime = formatMinutesToTime(newStartMinutes);
    const normalizedEndTime = formatMinutesToTime(newEndMinutes);

    const now = new Date();
    const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    if (date < todayString) {
      return NextResponse.json({ success: false, error: 'Cannot add availability for past dates' }, { status: 400 });
    }

    if (date === todayString) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (newStartMinutes <= currentMinutes) {
        return NextResponse.json({ success: false, error: 'Cannot add slots in the past for today' }, { status: 400 });
      }
    }

    // Check for overlapping active slots on the same date for this tutor
    const existingSlots = await TutorAvailability.findAll({
      where: {
        tutorId: authUser.userId,
        date,
        status: { [Op.ne]: 'CANCELLED' },
      },
    });

    const overlappingSlot = existingSlots.find((slot) => {
      const slotStart = parseTimeToMinutes(slot.startTime);
      const slotEnd = parseTimeToMinutes(slot.endTime);
      if (slotStart < 0 || slotEnd < 0) return false;

      // Intervals [newStart, newEnd) and [slotStart, slotEnd) overlap if:
      return newStartMinutes < slotEnd && newEndMinutes > slotStart;
    });

    if (overlappingSlot) {
      return NextResponse.json(
        {
          success: false,
          error: `This time slot (${normalizedStartTime} - ${normalizedEndTime}) overlaps with an existing slot (${overlappingSlot.startTime} - ${overlappingSlot.endTime})`,
        },
        { status: 400 }
      );
    }

    const newSlot = await TutorAvailability.create({
      tutorId: authUser.userId,
      date,
      startTime: normalizedStartTime,
      endTime: normalizedEndTime,
      isBooked: false,
      status: 'SCHEDULED',
    });

    return NextResponse.json({
      success: true,
      message: 'Slot added successfully',
      slot: newSlot.get({ plain: true }),
    });
  } catch (error: any) {
    console.error('Tutor availability POST error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to add slot' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser || (authUser.role !== 'TUTOR' && authUser.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Tutor access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const slotId = searchParams.get('slotId');

    if (!slotId) {
      return NextResponse.json({ success: false, error: 'slotId is required' }, { status: 400 });
    }

    const slot = await TutorAvailability.findOne({
      where: {
        id: slotId,
        tutorId: authUser.userId,
      },
    });

    if (!slot) {
      return NextResponse.json({ success: false, error: 'Slot not found' }, { status: 404 });
    }

    const bookingsCount = await TutorSlotBooking.count({
      where: { slotId, status: { [Op.ne]: 'CANCELLED' } },
    });

    if (bookingsCount > 0 || (slot.bookedCount && slot.bookedCount > 0)) {
      return NextResponse.json(
        { success: false, error: `Cannot delete slot: ${bookingsCount || slot.bookedCount} student(s) have already booked it.` },
        { status: 400 }
      );
    }

    await slot.destroy();

    return NextResponse.json({
      success: true,
      message: 'Slot deleted successfully',
    });
  } catch (error: any) {
    console.error('Tutor availability DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete slot' }, { status: 500 });
  }
}
