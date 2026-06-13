import { requireAdmin } from '../../../src/lib/auth';
import { Enrollment, User, Package, LiveClass } from '../../../src/db/models';
import Link from 'next/link';
import { adminCreateEnrollment, adminDeleteEnrollment } from '../../actions';
import DeleteConfirmButton from '../../../src/components/admin/DeleteConfirmButton';

export const revalidate = 0;

export default async function AdminEnrollmentsPage() {
  await requireAdmin();

  const [enrollmentsData, usersData, packagesData] = await Promise.all([
    Enrollment.findAll({
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
    }),
    User.findAll({ where: { role: 'STUDENT' }, attributes: ['id', 'name', 'email'] }),
    Package.findAll({ attributes: ['id', 'title'] }),
  ]);
  
  const enrollments = enrollmentsData.map(e => e.toJSON());
  const users = usersData.map(u => u.toJSON());
  const packages = packagesData.map(p => p.toJSON());

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Enrollments</h1>
        <p className="text-sm text-slate-500">View and manage student package enrollments.</p>
      </div>

      <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm max-w-4xl">
        <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Enroll Student</h3>
        <form action={async (formData) => { 'use server'; await adminCreateEnrollment(formData); }} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Student</label>
            <select name="userId" required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900 bg-white">
              <option value="">Select Student...</option>
              {users.map((u: any) => (
                <option key={u.id} value={u.id}>{u.name || 'No Name'} ({u.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Package</label>
            <select name="packageId" required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900 bg-white">
              <option value="">Select Package...</option>
              {packages.map((p: any) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div>
            <button type="submit" className="w-full inline-flex items-center justify-center px-6 py-2.5 font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-sm text-sm">
              Enroll Student
            </button>
          </div>
        </form>
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
                        <div className="flex items-center justify-end gap-3">
                          <Link 
                            href={`/admin/enrollments/${enr.id}/edit`}
                            className="text-slate-500 hover:text-blue-600 transition-colors p-1"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </Link>
                          <DeleteConfirmButton
                            itemType="Enrollment"
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                            onDelete={adminDeleteEnrollment.bind(null, enr.id)}
                          />
                        </div>
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
