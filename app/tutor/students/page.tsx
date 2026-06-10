import { requireAuth } from '../../../src/lib/auth';
import { LiveClass, Enrollment, User, Package } from '../../../src/db/models';

export const revalidate = 0;

export default async function TutorStudentsPage() {
  const user = await requireAuth();

  if (user.role !== 'TUTOR') {
    return <div className="p-10"><h1 className="text-2xl font-bold text-red-600">Unauthorized</h1></div>;
  }

  // 1. Get all packages this tutor teaches
  const classes = await LiveClass.findAll({
    where: { tutorId: user.id },
    attributes: ['packageId'],
  });
  
  const packageIds = [...new Set(classes.map(c => c.packageId))];

  // 2. Fetch enrollments for these packages
  let enrollmentsData: any[] = [];
  if (packageIds.length > 0) {
    enrollmentsData = await Enrollment.findAll({
      where: { packageId: packageIds },
      include: [
        { model: User, attributes: ['id', 'name', 'email', 'avatar'] },
        { model: Package, as: 'Package', attributes: ['id', 'title'] },
      ],
      order: [['enrolledAt', 'DESC']],
    });
  }
  
  const enrollments = enrollmentsData.map(e => e.toJSON());

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Students</h1>
        <p className="text-sm text-slate-500">Students enrolled in packages where you teach live classes.</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Enrolled Package</th>
                <th className="px-6 py-4">Batch Mode</th>
                <th className="px-6 py-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                    No students currently enrolled in your packages.
                  </td>
                </tr>
              ) : (
                enrollments.map((enr: any) => (
                  <tr key={enr.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0 border border-blue-200 overflow-hidden">
                          {enr.User?.avatar ? (
                            <img src={enr.User.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            enr.User?.name ? enr.User.name.charAt(0).toUpperCase() : 'S'
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{enr.User?.name || 'Jane Doe'}</div>
                          <div className="text-xs text-slate-500">{enr.User?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                        {enr.Package?.title || 'Unknown Package'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border ${enr.batchMode === 'OFFLINE' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                        {enr.batchMode || 'ONLINE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">
                      {new Date(enr.enrolledAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
