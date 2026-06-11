import { requireAdmin } from '../../../../src/lib/auth';
import { Enrollment, User, Package, LiveClass } from '../../../../src/db/models';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 0;

export default async function AdminEnrollmentDetailPage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const enrollmentData = await Enrollment.findByPk(params.id, {
    include: [
      { model: User, attributes: ['id', 'name', 'email', 'avatar'] },
      { 
        model: Package, 
        as: 'Package', 
        attributes: ['id', 'title', 'slug', 'thumbnail', 'price'],
        include: [
          {
            model: LiveClass,
            as: 'liveClasses',
            include: [{ model: User, as: 'tutor', attributes: ['name', 'email'] }]
          }
        ]
      },
    ],
  });

  if (!enrollmentData) {
    notFound();
  }

  const enr = enrollmentData.toJSON() as any;
  const d = new Date(enr.enrolledAt);
  const tutors = Array.from(new Set((enr.Package?.liveClasses || []).map((lc: any) => lc.tutor?.name).filter(Boolean)));
  const tutorDisplay = tutors.length > 0 ? tutors.join(', ') : 'Unassigned';

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/enrollments" className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Enrollment Details</h1>
          <p className="text-sm text-slate-500">ID: {enr.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Student Details */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Student Information
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Name</p>
              <p className="font-medium text-slate-900">{enr.User?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Email</p>
              <p className="font-medium text-slate-900">{enr.User?.email || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Package Details */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span> Course Information
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Package Title</p>
              <p className="font-medium text-slate-900">{enr.Package?.title || 'Unknown Package'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Assigned Tutors</p>
              <p className="font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                {tutorDisplay}
              </p>
            </div>
          </div>
        </div>

        {/* Enrollment Status */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm md:col-span-2">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Enrollment Status
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Status</p>
              <div>
                {enr.completedAt ? (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 uppercase">Completed</span>
                ) : (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700 uppercase">Active</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Enrollment Date</p>
              <p className="font-medium text-slate-900">
                {d.toLocaleDateString()} at {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Completion Date</p>
              <p className="font-medium text-slate-900">
                {enr.completedAt ? new Date(enr.completedAt).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
