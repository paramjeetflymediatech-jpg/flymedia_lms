import { NextResponse } from 'next/server';
import { Enrollment, Package, LiveClass, Certificate, TutorAvailability, TutorSlotBooking, User } from '../../../../../src/db/models';
import { getAuthUserFromRequest } from '../../auth/jwt';
import { Op } from 'sequelize';

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
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please log in to view student dashboard' },
        { status: 401 }
      );
    }

    const userId = authUser.userId;

    // 1. Fetch Enrollments with Package & LiveClasses
    const enrollments = await Enrollment.findAll({
      where: { userId },
      include: [
        {
          model: Package,
          include: [
            {
              model: LiveClass,
              as: 'liveClasses',
              include: [{ model: User, as: 'tutor', attributes: ['name', 'avatar'] }],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // 2. Fetch Booked Sessions (via TutorSlotBooking or direct studentId)
    const studentBookings = await TutorSlotBooking.findAll({
      where: { studentId: userId, status: { [Op.ne]: 'CANCELLED' } },
      attributes: ['slotId'],
    });
    const bookedSlotIds = studentBookings.map((b) => b.slotId);

    const bookedSessions = await TutorAvailability.findAll({
      where: {
        [Op.or]: [
          { studentId: userId },
          ...(bookedSlotIds.length > 0 ? [{ id: { [Op.in]: bookedSlotIds } }] : []),
        ],
      },
      include: [
        {
          model: User,
          as: 'tutor',
          attributes: ['id', 'name', 'avatar', 'professionTitle'],
        },
      ],
      order: [['date', 'ASC'], ['startTime', 'ASC']],
    });

    // 3. Fetch Certificates count
    const certificatesCount = await Certificate.count({ where: { userId } });

    // 4. Extract and sort upcoming live classes and 1-on-1 sessions
    const now = new Date();
    const upcomingSessions: any[] = [];

    // Live Classes from enrolled packages
    enrollments.forEach((enr: any) => {
      const pkg = enr.Package;
      if (pkg?.liveClasses) {
        pkg.liveClasses.forEach((lc: any) => {
          const lcStart = new Date(lc.startTime);
          if (lcStart >= now) {
            upcomingSessions.push({
              id: lc.id,
              type: 'BATCH_LIVE',
              title: lc.title || pkg.title,
              packageTitle: pkg.title,
              startTime: lc.startTime,
              duration: lc.duration || 60,
              meetLink: lc.meetLink || null,
              status: lc.status || 'SCHEDULED',
              tutorName: lc.tutor?.name || 'Assigned Instructor',
              tutorAvatar: resolveFullImageUrl(lc.tutor?.avatar),
            });
          }
        });
      }
    });

    // 1-on-1 booked sessions
    bookedSessions.forEach((sess: any) => {
      const startDateTime = new Date(`${sess.date}T${sess.startTime}:00`);
      const isPast = startDateTime < now;
      const duration = 60; // default 1 hour slot

      if (!isPast && sess.status !== 'CANCELLED') {
        upcomingSessions.push({
          id: sess.id,
          type: 'ONE_ON_ONE',
          title: `1-on-1 Session with ${sess.tutor?.name || 'Tutor'}`,
          packageTitle: 'Personalized Mentorship',
          date: sess.date,
          startTime: startDateTime.toISOString(),
          duration,
          meetLink: sess.meetLink || null,
          status: sess.status || 'SCHEDULED',
          tutorName: sess.tutor?.name || 'Expert Tutor',
          tutorAvatar: resolveFullImageUrl(sess.tutor?.avatar),
          professionTitle: sess.tutor?.professionTitle || 'Senior Tutor',
        });
      }
    });

    upcomingSessions.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    const nextSession = upcomingSessions[0] || null;

    // 5. Formatted Enrolled Packages list
    const enrolledPackages = enrollments.map((enr: any) => {
      const pkg = enr.Package;
      const totalLessons = pkg?.courseModules
        ? pkg.courseModules.reduce((acc: number, m: any) => acc + (m.topics?.length || 0), 0)
        : 20;

      return {
        id: enr.id,
        packageId: pkg?.id || enr.packageId,
        title: pkg?.title || 'Enrolled Course',
        slug: pkg?.slug || '',
        category: pkg?.category || 'Development',
        thumbnail: resolveFullImageUrl(pkg?.thumbnail),
        duration: pkg?.duration || '12 Weeks',
        enrolledAt: enr.enrolledAt ? new Date(enr.enrolledAt).toISOString().split('T')[0] : 'Recent',
        progressPercent: enr.completedAt ? 100 : 35,
        totalLessons: totalLessons || 20,
        completedLessons: enr.completedAt ? totalLessons : Math.min(7, totalLessons),
      };
    });

    // 6. Formatted all booked 1-on-1 sessions
    const formattedBookedSessions = bookedSessions.map((sess: any) => {
      const startDateTime = new Date(`${sess.date}T${sess.startTime}:00`);
      return {
        id: sess.id,
        date: sess.date,
        startTime: sess.startTime,
        endTime: sess.endTime,
        status: sess.status || 'SCHEDULED',
        meetLink: sess.meetLink || null,
        isPast: startDateTime < now,
        tutor: {
          id: sess.tutor?.id,
          name: sess.tutor?.name || 'Tutor',
          avatar: resolveFullImageUrl(sess.tutor?.avatar),
          professionTitle: sess.tutor?.professionTitle || 'Instructor',
        },
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        packagesCount: enrollments.length,
        upcomingSessionsCount: upcomingSessions.length,
        bookedSessionsCount: bookedSessions.length,
        certificatesCount,
      },
      nextSession,
      upcomingSessions,
      enrolledPackages,
      bookedSessions: formattedBookedSessions,
    });
  } catch (error: any) {
    console.error('Student dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load student dashboard' },
      { status: 500 }
    );
  }
}
