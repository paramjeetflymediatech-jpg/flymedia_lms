import { requireAuth } from '../../../src/lib/auth';
import { LiveClass, Package } from '../../../src/db/models';
import TutorClassRow from '../../../src/components/tutor/TutorClassRow';

export const revalidate = 0;

export default async function TutorClassesPage() {
  const user = await requireAuth();

  if (user.role !== 'TUTOR') {
    return <div className="p-10"><h1 className="text-2xl font-bold text-red-600">Unauthorized</h1></div>;
  }

  // Fetch all classes assigned to this tutor
  const classesData = await LiveClass.findAll({
    where: { tutorId: user.id },
    include: [{ model: Package, attributes: ['title', 'slug'] }],
    order: [['startTime', 'DESC']],
  });
  
  const classes = classesData.map(c => c.toJSON() as any);
  
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
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Class Details</th>
                <th className="px-6 py-4">Package</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4 text-right">Actions</th>
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
