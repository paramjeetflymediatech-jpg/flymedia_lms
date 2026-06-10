import { requireAdmin } from '../../../src/lib/auth';
import { Enrollment, User, Package, LiveClass } from '../../../src/db/models';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminEnrollmentsPage() {
  await requireAdmin();

  // Fetch all enrollments with student, package, and live classes data to find the tutor
  const enrollmentsData = await Enrollment.findAll({
    include: [
      { model: User, attributes: ['id', 'name', 'email'] },
      { 
        model: Package, 
        as: 'Package', 
        attributes: ['id', 'title'],
        include: [
          {
            model: LiveClass,
            as: 'liveClasses',
            include: [{ model: User, as: 'tutor', attributes: ['name'] }]
          }
        ]
      },
    ],
    order: [['enrolledAt', 'DESC']],
  });
  
  const enrollments = enrollmentsData.map(e => e.toJSON());

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Enrollments</h1>
        <p className="text-sm text-slate-500">View all student package enrollments.</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Tutor</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    No enrollments found.
                  </td>
                </tr>
              ) : (
                enrollments.map((enr: any) => {
                  // Attempt to extract the primary tutor from the package's live classes
                  const tutors = Array.from(new Set((enr.Package?.liveClasses || []).map((lc: any) => lc.tutor?.name).filter(Boolean)));
                  const tutorDisplay = tutors.length > 0 ? tutors.join(', ') : 'Unassigned';
                  
                  const d = new Date(enr.enrolledAt);

                  return (
                    <tr key={enr.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{enr.User?.name || 'Unknown Student'}</div>
                        <div className="text-xs text-slate-500">{enr.User?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {tutorDisplay}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {d.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4">
                        {enr.completedAt ? (
                          <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-600 uppercase">Completed</span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-1 rounded bg-green-100 text-green-700 uppercase">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/enrollments/${enr.id}`}
                          className="inline-flex items-center justify-center text-[10px] font-bold text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600 px-3 py-1.5 rounded transition-colors uppercase tracking-wider"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
