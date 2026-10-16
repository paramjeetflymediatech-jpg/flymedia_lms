import { NextResponse } from 'next/server';
import { LiveClass, Package, Enrollment, User, TutorAvailability, TutorSlotBooking, PackageTutor, ClassSchedule } from '../../../../../src/db/models';
import { getAuthUserFromRequest } from '../../auth/jwt';
import { Op } from 'sequelize';

export const dynamic = 'force-dynamic';

function resolveFullImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
  }
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `https://course.flymediatech.com${cleanPath}`;
}

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser || (authUser.role !== 'TUTOR' && authUser.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Tutor access required' },
        { status: 403 }
      );
    }

    const tutorId = authUser.userId;
    const now = new Date();

    // 1. Fetch assigned LiveClasses
    const liveClassesData = await LiveClass.findAll({
      where: { tutorId },
      include: [
        {
          model: Package,
          attributes: ['title', 'slug', 'thumbnail'],
          include: [
            {
              model: Enrollment,
              as: 'enrollments',
              include: [{ model: User, attributes: ['id', 'name', 'email', 'avatar'] }],
            },
          ],
        },
      ],
      order: [['startTime', 'DESC']],
    });

    // 2. Fetch Sessions booked with this tutor
    const oneOnOneSessions = await TutorAvailability.findAll({
      where: {
        tutorId,
        [Op.or]: [
          { isBooked: true },
          { bookedCount: { [Op.gt]: 0 } },
          { studentId: { [Op.ne]: null } },
        ],
      },
      include: [
        {
          model: TutorSlotBooking,
          as: 'bookings',
          include: [{ model: User, as: 'student', attributes: ['id', 'name', 'avatar', 'email'] }],
        },
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'avatar', 'email'],
        },
      ],
      order: [['date', 'DESC'], ['startTime', 'DESC']],
    });

    // 3. Format classes & sessions
    const formattedClasses: any[] = [];
    const studentsMap = new Map<string, any>();

    // Batch Live Classes
    liveClassesData.forEach((lc: any) => {
      const startTimeDate = new Date(lc.startTime);
      const isPast = startTimeDate < now;
      const enrolledStudents = lc.Package?.enrollments?.map((e: any) => e.User).filter(Boolean) || [];

      enrolledStudents.forEach((st: any) => {
        if (!studentsMap.has(st.id)) {
          studentsMap.set(st.id, {
            id: st.id,
            name: st.name || 'Student',
            email: st.email || '',
            avatar: resolveFullImageUrl(st.avatar),
            enrolledIn: lc.Package?.title || 'Batch Course',
          });
        }
      });

      formattedClasses.push({
        id: lc.id,
        isOneOnOne: false,
        title: lc.title || lc.Package?.title || 'Live Batch Class',
        packageTitle: lc.Package?.title || 'Batch Course',
        startTime: startTimeDate.toISOString(),
        duration: lc.duration || 60,
        meetLink: lc.meetLink || null,
        status: lc.status || (isPast ? 'COMPLETED' : 'SCHEDULED'),
        studentsCount: enrolledStudents.length,
        studentName: enrolledStudents[0]?.name || (enrolledStudents.length > 0 ? `${enrolledStudents.length} Students` : 'Batch Enrolled'),
      });
    });

    // Tutor Sessions (Up to 100 students)
    oneOnOneSessions.forEach((sess: any) => {
      const startDateTime = new Date(`${sess.date}T${sess.startTime}:00`);
      const endDateTime = new Date(`${sess.date}T${sess.endTime}:00`);
      const isPast = startDateTime < now;
      const duration = Math.round((endDateTime.getTime() - startDateTime.getTime()) / 60000) || 60;

      const bookedStudents = (sess.bookings || [])
        .map((b: any) => b.student)
        .filter(Boolean);
      if (sess.student && !bookedStudents.some((st: any) => st.id === sess.student.id)) {
        bookedStudents.unshift(sess.student);
      }
      const studentsCount = bookedStudents.length || sess.bookedCount || 1;

      bookedStudents.forEach((st: any) => {
        if (!studentsMap.has(st.id)) {
          studentsMap.set(st.id, {
            id: st.id,
            name: st.name || 'Student',
            email: st.email || '',
            avatar: resolveFullImageUrl(st.avatar),
            enrolledIn: 'Tutor Mentorship',
          });
        }
      });

      formattedClasses.push({
        id: sess.id,
        isOneOnOne: true,
        title: `Tutor Session (${studentsCount}/100 Students)`,
        packageTitle: 'Personalized Coaching',
        startTime: startDateTime.toISOString(),
        duration,
        meetLink: sess.meetLink || null,
        status: sess.status || (isPast ? 'COMPLETED' : 'SCHEDULED'),
        studentsCount,
        studentName: bookedStudents.length > 0 ? (bookedStudents.length === 1 ? bookedStudents[0].name : `${studentsCount} Students Booked`) : 'Enrolled Students',
        studentAvatar: resolveFullImageUrl(bookedStudents[0]?.avatar),
        date: sess.date,
        slotTime: `${sess.startTime} - ${sess.endTime}`,
      });
    });

    // Sort by startTime descending
    formattedClasses.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    const upcomingClasses = formattedClasses.filter((c) => new Date(c.startTime) >= now);
    const pastClasses = formattedClasses.filter((c) => new Date(c.startTime) < now);

    // Sort upcoming ascending to get nextClass
    const nextClass = [...upcomingClasses].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0] || null;

    // 4. Fetch Assigned Packages & Schedules
    const packageTutors = await PackageTutor.findAll({
      where: { tutorId },
      include: [
        {
          model: Package,
          include: [
            {
              model: ClassSchedule,
              as: 'schedules',
            },
            {
              model: LiveClass,
              as: 'liveClasses',
            },
            {
              model: Enrollment,
              as: 'enrollments',
            },
          ],
        },
      ],
    });

    const directPackages = packageTutors.map((pt: any) => pt.Package).filter(Boolean);
    const existingPackageIds = new Set(directPackages.map((p: any) => p.id));

    // Also check for any packages where this tutor has live classes
    const extraLiveClasses = await LiveClass.findAll({
      where: { tutorId },
      attributes: ['packageId'],
    });
    const extraPackageIds = [...new Set(extraLiveClasses.map((c: any) => c.packageId))].filter(
      (id: string) => id && !existingPackageIds.has(id)
    );

    let allPackages = [...directPackages];
    if (extraPackageIds.length > 0) {
      const extraPkgs = await Package.findAll({
        where: { id: extraPackageIds },
        include: [
          {
            model: ClassSchedule,
            as: 'schedules',
          },
          {
            model: LiveClass,
            as: 'liveClasses',
          },
          {
            model: Enrollment,
            as: 'enrollments',
          },
        ],
      });
      allPackages.push(...extraPkgs);
    }

    const assignedPackages = allPackages.map((pkg: any) => {
      const schedules = (pkg?.schedules || []).map((s: any) => {
        let dayStr = '';
        if (Array.isArray(s.daysOfWeek)) {
          dayStr = s.daysOfWeek.join(' & ');
        } else if (typeof s.daysOfWeek === 'string') {
          dayStr = s.daysOfWeek;
        } else if (s.dayOfWeek) {
          dayStr = s.dayOfWeek;
        }

        return {
          id: s.id,
          daysOfWeek: s.daysOfWeek || [],
          dayOfWeek: dayStr,
          dayName: dayStr || 'Weekly',
          startTime: s.startTime || s.time || '',
          time: s.startTime || s.time || '',
          duration: s.duration || 60,
          meetLink: s.meetLink || '',
          isActive: s.status === 'ACTIVE' || s.isActive !== false,
          status: s.status || 'ACTIVE',
          totalClasses: s.totalClasses || 12,
        };
      });

      const liveClasses = (pkg?.liveClasses || []).map((lc: any) => ({
        id: lc.id,
        classNumber: lc.classNumber || 1,
        title: lc.title,
        topic: lc.title,
        startTime: lc.startTime,
        scheduledAt: lc.startTime,
        duration: lc.duration || 60,
        meetLink: lc.meetLink,
        status: lc.status || 'SCHEDULED',
      }));

      const primaryMeetLink =
        schedules.find((s: any) => s.meetLink)?.meetLink ||
        liveClasses.find((lc: any) => lc.meetLink)?.meetLink ||
        '';

      return {
        id: pkg?.id,
        packageId: pkg?.id,
        title: pkg?.title || 'Assigned Package',
        name: pkg?.title || 'Assigned Package',
        slug: pkg?.slug,
        thumbnail: resolveFullImageUrl(pkg?.thumbnail),
        image: resolveFullImageUrl(pkg?.thumbnail),
        category: pkg?.category || 'Training',
        totalClasses: pkg?.totalClasses || 12,
        totalClassesScheduled: pkg?.totalClasses || 12,
        assignedStudentsCount: (pkg?.enrollments || []).length,
        totalStudents: (pkg?.enrollments || []).length,
        meetLink: primaryMeetLink,
        schedules,
        liveClasses,
        classes: liveClasses,
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        upcomingClassesCount: upcomingClasses.length,
        pastClassesCount: pastClasses.length,
        totalAssignedCount: formattedClasses.length,
        totalStudentsCount: studentsMap.size,
        totalSlotsCount: 0,
        assignedPackagesCount: assignedPackages.length,
      },
      nextClass,
      classes: formattedClasses,
      assignedPackages,
      recentStudents: Array.from(studentsMap.values()),
    });
  } catch (error: any) {
    console.error('Tutor dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch tutor dashboard' },
      { status: 500 }
    );
  }
}
