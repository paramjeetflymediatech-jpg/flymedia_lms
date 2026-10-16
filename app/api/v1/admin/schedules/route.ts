import { NextResponse } from 'next/server';
import { Package, User, ClassSchedule, LiveClass } from '../../../../../src/db/models';
import { getAuthUserFromRequest } from '../../auth/jwt';

export const dynamic = 'force-dynamic';

function resolveFullImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
  }
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `https://course.flymediatech.com${cleanPath}`;
}

export async function GET(request: Request) {
  try {
    const authPayload = await getAuthUserFromRequest(request);
    if (!authPayload || authPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    // 1. Fetch recurring schedules
    const schedulesData = await ClassSchedule.findAll({
      include: [
        { model: Package, as: 'package', attributes: ['id', 'title', 'slug', 'category', 'thumbnail'] },
        { model: User, as: 'tutor', attributes: ['id', 'name', 'email', 'avatar'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    // 2. Fetch upcoming and scheduled live classes
    const liveClassesData = await LiveClass.findAll({
      include: [
        { model: Package, as: 'Package', attributes: ['id', 'title', 'slug', 'category', 'thumbnail'] },
        { model: User, as: 'tutor', attributes: ['id', 'name', 'email', 'avatar'] },
      ],
      order: [['startTime', 'ASC']],
      limit: 100,
    });

    const schedules = schedulesData.map((s) => {
      const json: any = s.toJSON();
      if (json.package) json.package.thumbnail = resolveFullImageUrl(json.package.thumbnail);
      if (json.tutor) json.tutor.avatar = resolveFullImageUrl(json.tutor.avatar);
      return json;
    });

    const liveClasses = liveClassesData.map((l) => {
      const json: any = l.toJSON();
      const pkg = json.Package || json.package;
      if (pkg) pkg.thumbnail = resolveFullImageUrl(pkg.thumbnail);
      if (json.tutor) json.tutor.avatar = resolveFullImageUrl(json.tutor.avatar);
      return {
        ...json,
        package: pkg,
      };
    });

    return NextResponse.json({
      success: true,
      schedules,
      liveClasses,
    });
  } catch (error: any) {
    console.error('Admin schedules GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authPayload = await getAuthUserFromRequest(request);
    if (!authPayload || authPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      tutorId,
      packageId,
      daysOfWeek,
      startTime,
      duration = 60,
      meetLink,
      startDate: startDateStr,
      totalClasses = 12,
    } = body;

    if (!tutorId || !packageId || !daysOfWeek || !Array.isArray(daysOfWeek) || daysOfWeek.length === 0 || !startTime || !meetLink) {
      return NextResponse.json(
        { success: false, error: 'Please select tutor, course, days of week, start time, and provide meet link' },
        { status: 400 }
      );
    }

    const pkg = await Package.findByPk(packageId);
    if (!pkg) {
      return NextResponse.json(
        { success: false, error: 'Course package not found' },
        { status: 404 }
      );
    }

    const tutor = await User.findByPk(tutorId);
    if (!tutor) {
      return NextResponse.json(
        { success: false, error: 'Tutor not found' },
        { status: 404 }
      );
    }

    // 1. Create ClassSchedule recurring record
    const schedule = await ClassSchedule.create({
      packageId,
      tutorId,
      daysOfWeek: (daysOfWeek as any[]).map(String),
      startTime,
      duration: Number(duration) || 60,
      meetLink,
      startDate: startDateStr || new Date().toISOString().slice(0, 10),
      totalClasses: Number(totalClasses) || 12,
      status: 'ACTIVE',
    });

    // 2. Generate recurring live class sessions
    const dayMap: { [key: string]: number } = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    const targetDayNumbers = (daysOfWeek as string[])
      .map((d) => dayMap[d.toLowerCase()])
      .filter((d) => d !== undefined);

    if (targetDayNumbers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid days of week selected' },
        { status: 400 }
      );
    }

    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = startDateStr ? new Date(`${startDateStr}T00:00:00`) : new Date();

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const cursor = startDate < now ? new Date(now) : new Date(startDate);

    const classesToCreate: any[] = [];
    let classesCreated = 0;
    let safetyCounter = 0;
    const numTotal = Number(totalClasses) || 12;

    while (classesCreated < numTotal && safetyCounter < 365) {
      safetyCounter++;
      const currentDay = cursor.getDay();
      if (targetDayNumbers.includes(currentDay)) {
        const classDate = new Date(cursor);
        classDate.setHours(hours || 0, minutes || 0, 0, 0);

        classesCreated++;
        classesToCreate.push({
          packageId,
          tutorId,
          scheduleId: schedule.id,
          classNumber: classesCreated,
          title: `${pkg.title} - Class ${classesCreated}`,
          meetLink,
          startTime: classDate,
          duration: Number(duration) || 60,
          status: 'SCHEDULED',
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    await LiveClass.bulkCreate(classesToCreate);

    return NextResponse.json({
      success: true,
      message: `Successfully scheduled ${classesToCreate.length} recurring classes for ${pkg.title}!`,
      schedule,
      generatedClassesCount: classesToCreate.length,
    });
  } catch (error: any) {
    console.error('Admin create schedule error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create schedule' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const authPayload = await getAuthUserFromRequest(request);
    if (!authPayload || authPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('scheduleId');
    const classId = searchParams.get('classId');

    if (scheduleId) {
      const schedule = await ClassSchedule.findByPk(scheduleId);
      if (!schedule) {
        return NextResponse.json(
          { success: false, error: 'Schedule not found' },
          { status: 404 }
        );
      }
      await LiveClass.destroy({ where: { scheduleId } });
      await schedule.destroy();
      return NextResponse.json({
        success: true,
        message: 'Schedule and its associated live classes cancelled successfully',
      });
    }

    if (classId) {
      const liveClass = await LiveClass.findByPk(classId);
      if (!liveClass) {
        return NextResponse.json(
          { success: false, error: 'Live class session not found' },
          { status: 404 }
        );
      }
      await liveClass.destroy();
      return NextResponse.json({
        success: true,
        message: 'Live class removed successfully',
      });
    }

    return NextResponse.json(
      { success: false, error: 'scheduleId or classId parameter is required' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Admin delete schedule error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete schedule or class' },
      { status: 500 }
    );
  }
}
