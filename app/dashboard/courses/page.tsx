import Link from 'next/link';
import { requireAuth } from '../../../src/lib/auth';
import { Enrollment, Package, LiveClass, TutorAvailability, TutorSlotBooking, User } from '../../../src/db/models';
import CoursesTabs from '../../../src/components/dashboard/CoursesTabs';
import { Op } from 'sequelize';

export const revalidate = 0;

export default async function StudentCoursesPage() {
  const user = await requireAuth();
  
  // Fetch all enrollments for user
  const enrollments = await Enrollment.findAll({
    where: { userId: user.id },
    include: [
      {
        model: Package,
        as: 'Package',
        include: [
          {
            model: LiveClass,
            as: 'liveClasses',
          },
        ],
      },
    ],
    order: [['enrolledAt', 'DESC']],
  });

  // Fetch all sessions booked by this user either directly or via TutorSlotBooking
  const studentBookings = await TutorSlotBooking.findAll({
    where: { studentId: user.id, status: { [Op.ne]: 'CANCELLED' } },
    attributes: ['slotId'],
  });
  const bookedSlotIds = studentBookings.map(b => b.slotId);

  const oneOnOneSessions = await TutorAvailability.findAll({
    where: {
      [Op.or]: [
        { studentId: user.id },
        ...(bookedSlotIds.length > 0 ? [{ id: { [Op.in]: bookedSlotIds } }] : []),
      ],
    },
    include: [{ model: User, as: 'tutor', attributes: ['name', 'avatar'] }]
  });

  const now = new Date();
  
  let upcomingClasses: any[] = [];
  let completedClasses: any[] = [];
  let cancelledClasses: any[] = [];
  let missedClasses: any[] = [];

  enrollments.forEach((enroll) => {
    const pkg = (enroll as any).Package;
    if (!pkg || !pkg.liveClasses) return;

    pkg.liveClasses.forEach((lc: any) => {
      const classDate = new Date(lc.startTime);
      const classEndTime = new Date(classDate.getTime() + lc.duration * 60000);
      
      const classData = {
        ...lc.toJSON(),
        packageTitle: pkg.title,
        packageSlug: pkg.slug,
        packageThumbnail: pkg.thumbnail,
      };

      const status = lc.status || 'SCHEDULED';

      if (status === 'COMPLETED') {
        completedClasses.push(classData);
      } else if (status === 'CANCELLED') {
        cancelledClasses.push(classData);
      } else if (status === 'SCHEDULED') {
        if (now > classEndTime) {
          missedClasses.push(classData);
        } else {
          upcomingClasses.push(classData);
        }
      }
    });
  });

  oneOnOneSessions.forEach((sessionModel) => {
    const session = sessionModel.toJSON() as any;
    const dateStr = session.date instanceof Date 
      ? session.date.toISOString().split('T')[0] 
      : String(session.date).split('T')[0];

    const startTimeDate = new Date(`${dateStr}T${session.startTime}:00`);
    const endTimeDate = new Date(`${dateStr}T${session.endTime}:00`);
    const duration = (!isNaN(endTimeDate.getTime()) && !isNaN(startTimeDate.getTime()))
      ? (endTimeDate.getTime() - startTimeDate.getTime()) / 60000
      : 60;

    const classData = {
      id: session.id,
      title: '1-on-1 Session',
      startTime: !isNaN(startTimeDate.getTime()) ? startTimeDate.toISOString() : `${dateStr}T${session.startTime}:00`,
      duration: duration,
      meetLink: session.meetLink || null,
      status: session.status || 'SCHEDULED',
      packageTitle: `1-on-1 with ${session.tutor?.name || 'Tutor'}`,
      packageSlug: '#', 
      packageThumbnail: session.tutor?.avatar || null,
      isOneOnOne: true,
      rawDate: dateStr,
    };

    if (classData.status === 'COMPLETED') {
      completedClasses.push(classData);
    } else if (classData.status === 'CANCELLED') {
      cancelledClasses.push(classData);
    } else if (classData.status === 'SCHEDULED') {
      const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const isPastSession = !isNaN(endTimeDate.getTime()) ? now > endTimeDate : dateStr < todayString;
      if (isPastSession) {
        missedClasses.push(classData);
      } else {
        upcomingClasses.push(classData);
      }
    }
  });

  // Sort upcoming ascending (soonest first)
  upcomingClasses.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  
  // Sort completed descending (most recent first)
  completedClasses.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Courses & Sessions</h1>
          <p className="text-slate-500">Manage your live classes and track your progress.</p>
        </div>

        <CoursesTabs 
          upcomingClasses={upcomingClasses}
          completedClasses={completedClasses}
          cancelledClasses={cancelledClasses}
          missedClasses={missedClasses}
        />
        
      </div>
    </div>
  );
}
