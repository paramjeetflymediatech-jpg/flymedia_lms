import { NextResponse } from 'next/server';
import { TutorAvailability } from '../../../../../src/db/models';
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
    });

    return NextResponse.json({
      success: true,
      slots: slots.map((s) => s.get({ plain: true })),
    });
  } catch (error: any) {
    console.error('Tutor availability GET error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch slots' }, { status: 500 });
  }
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

    if (startTime >= endTime) {
      return NextResponse.json({ success: false, error: 'End time must be after start time' }, { status: 400 });
    }

    // Check duplicate
    const existing = await TutorAvailability.findOne({
      where: {
        tutorId: authUser.userId,
        date,
        startTime,
        endTime,
      },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'A slot already exists for this exact time' }, { status: 400 });
    }

    const newSlot = await TutorAvailability.create({
      tutorId: authUser.userId,
      date,
      startTime,
      endTime,
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
