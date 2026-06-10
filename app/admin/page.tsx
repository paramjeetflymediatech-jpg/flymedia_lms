import Link from 'next/link';

import { requireAdmin } from '../../src/lib/auth';
import { Package, Enrollment, User } from '../../src/db/models';

export const revalidate = 0; // Fresh admin logs

export default async function AdminDashboardPage() {
  await requireAdmin();

  // 1. Fetch packages to get total count
  const packages = await Package.findAll({
    include: [
      {
        model: Enrollment,
        as: 'enrollments',
      },
    ],
  });

  // 2. Fetch all enrollments with student information to display on the progress tracker
  const enrollments = await Enrollment.findAll({
    include: [
      { model: User, attributes: ['id', 'name', 'email'] },
      { model: Package, as: 'Package', attributes: ['id', 'title'] },
    ],
    order: [['enrolledAt', 'DESC']],
  });

  // 3. Simple Analytics Metrics
  const totalPackages = packages.length;
  const uniqueStudents = await User.count({ where: { role: 'STUDENT' } });
  const totalEnrollments = enrollments.length;

  return (
    <div className="p-6 md:p-10 space-y-12">
          
          {/* Top Headline */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-8 bg-white border border-slate-100 rounded-3xl shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Admin Control Panel</span>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">LMS Analytics & Operations</h1>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Programs</span>
              <div className="text-3xl font-black text-slate-900">{totalPackages}</div>
              <p className="text-xs text-slate-500">Professional bootcamps & packages</p>
            </div>
            <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Students</span>
              <div className="text-3xl font-black text-slate-900">{uniqueStudents}</div>
              <p className="text-xs text-slate-500">Verified platform student profiles</p>
            </div>
            <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Package Enrolls</span>
              <div className="text-3xl font-black text-slate-900">{totalEnrollments}</div>
              <p className="text-xs text-slate-500">Student enrollment registrations</p>
            </div>
          </div>

            {/* Admin Enrollment & Progress Logs */}
            <div className="lg:col-span-3 space-y-8">
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Student Enrolls</h3>
                
                {enrollments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No students enrolled yet.</p>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {enrollments.map((enr: any) => (
                      <div key={enr.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-1.5">
                        <div className="font-bold text-xs text-slate-800">{enr.User?.name || 'Jane Doe'}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{enr.User?.email}</div>
                        <div className="text-[10px] font-bold text-slate-600 bg-slate-100 inline-block px-2 py-0.5 rounded border border-slate-200">
                          {enr.Package?.title}
                        </div>
                        <div className="text-[9px] text-slate-400">
                          Enrolled: {new Date(enr.enrolledAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

    </div>
  );
}
