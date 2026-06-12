import { requireAuth } from '../../../src/lib/auth';
import { LiveClass, Package, Enrollment, User, TutorAvailability } from '../../../src/db/models';
import TutorClassRow from '../../../src/components/tutor/TutorClassRow';

export const revalidate = 0;

export default async function TutorClassesPage() {
  const user = await requireAuth();

  if (user.role !== 'TUTOR') {
    return <div className="p-10"><h1 className="text-2xl font-bold text-red-600">Unauthorized</h1></div>;
  }

  const classesData = await LiveClass.findAll({
    where: { tutorId: user.id },
    include: [
      { 
        model: Package, 
        attributes: ['title', 'slug'],
        include: [
          {
            model: Enrollment,
            as: 'enrollments',
            include: [{ model: User, attributes: ['name'] }]
          }
        ]
      }
    ],
    order: [['startTime', 'DESC']],
  });
  
  const liveClassesList = classesData.map(c => c.toJSON() as any);

  // Fetch all 1-on-1 sessions (TutorAvailability) booked by students with this tutor
  const oneOnOneSessions = await TutorAvailability.findAll({
    where: { tutorId: user.id, isBooked: true },
    include: [{ model: User, as: 'student', attributes: ['name', 'avatar'] }]
  });

  const oneOnOneList = oneOnOneSessions.map((sessionModel) => {
    const session = sessionModel.toJSON() as any;
    const startTimeDate = new Date(`${session.date}T${session.startTime}:00`);
    const endTimeDate = new Date(`${session.date}T${session.endTime}:00`);
    const duration = (endTimeDate.getTime() - startTimeDate.getTime()) / 60000;

    return {
      id: session.id,
      title: '1-on-1 Session',
      startTime: startTimeDate.toISOString(),
      duration: duration,
      meetLink: session.meetLink || null,
      status: session.status || 'SCHEDULED',
      isOneOnOne: true,
      Package: {
        title: `1-on-1 Session`,
        enrollments: [
          { User: session.student }
        ]
      }
    };
  });

  // Merge the two lists and sort by start time descending
  const classes = [...liveClassesList, ...oneOnOneList].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  
  const now = new Date();

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Classes</h1>
        <p className="text-sm text-slate-500">View and manage your scheduled live sessions.</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Meeting Link</th>
                <th className="px-6 py-4">Current Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    You have not been assigned any classes yet.
                  </td>
                </tr>
              ) : (
                classes.map((item) => {
                  const startTime = new Date(item.startTime);
                  const isPast = startTime < now;
                  
                  return <TutorClassRow key={item.id} item={item} isPast={isPast} startTime={startTime} />;
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
