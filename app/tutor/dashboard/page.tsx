import { requireAuth } from '../../../src/lib/auth';
import { redirect } from 'next/navigation';
import { Course, Enrollment, Payment, User } from '../../../src/db/models';
import Link from 'next/link';

export const revalidate = 0;

export default async function TutorDashboard() {
  const user = await requireAuth();
  
  if (user.role !== 'TUTOR') {
    redirect('/dashboard'); // Kick non-tutors out
  }

  // 1. Fetch Active Courses
  const activeCoursesCount = await Course.count({
    where: { instructorId: user.id }
  });

  // 2. Fetch Total Earnings
  const paymentsData = await Payment.findAll({
    include: [{ model: Course, where: { instructorId: user.id }, attributes: [] }],
    where: { status: 'SUCCESS' }
  });
  let totalEarnings = 0;
  for (const p of paymentsData) {
    if (p.amount) totalEarnings += parseFloat(p.amount as unknown as string);
  }

  // 3. Fetch Active Students (Count unique users enrolled in this tutor's courses)
  const studentsData = await User.count({
    include: [
      {
        model: Enrollment,
        as: 'enrollments',
        required: true,
        include: [{ model: Course, where: { instructorId: user.id }, attributes: [] }]
      }
    ],
    distinct: true,
    col: 'id',
  });

  // 4. Fetch Recent Enrollments
  const recentEnrollments = await Enrollment.findAll({
    include: [
      { model: Course, where: { instructorId: user.id }, attributes: ['title'] },
      { model: User, attributes: ['name', 'email'] }
    ],
    order: [['createdAt', 'DESC']],
    limit: 5,
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back, <span className="font-semibold text-slate-700">{user.name || 'Tutor'}</span>. Here's what's happening with your courses today.
          </p>
        </div>
        <Link href="/tutor/courses" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-orange-700 focus:ring-4 focus:ring-orange-600/20 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          Create New Course
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Earnings', value: `$${totalEarnings.toFixed(2)}`, trend: '0', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Active Students', value: studentsData.toString(), trend: '0', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
          { label: 'Course Rating', value: '4.8', trend: '0', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
          { label: 'Active Courses', value: activeCoursesCount.toString(), trend: '0', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
                </div>
                {stat.trend !== '0' && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
              <h3 className="mt-1 text-2xl font-extrabold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Enrollments</h3>
           {recentEnrollments.length > 0 ? (
             <div className="space-y-4">
               {recentEnrollments.map((enr, i) => {
                 const enrRaw = enr.get({ plain: true });
                 const student = (enrRaw as any).User;
                 const course = (enrRaw as any).Course;
                 return (
                   <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                         {(student?.name || 'S').substring(0, 1).toUpperCase()}
                       </div>
                       <div>
                         <p className="font-bold text-slate-900 text-sm">{student?.name || 'Anonymous'}</p>
                         <p className="text-xs text-slate-500">Enrolled in: {course?.title}</p>
                       </div>
                     </div>
                     <span className="text-xs font-medium text-slate-400">
                       {new Date(enrRaw.createdAt).toLocaleDateString()}
                     </span>
                   </div>
                 );
               })}
             </div>
           ) : (
             <div className="text-center py-12">
               <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
               </div>
               <p className="text-slate-500 text-sm font-medium">No recent enrollments to show.</p>
             </div>
           )}
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h3>
           <div className="space-y-3">
              {[
                { label: 'Manage Curriculum', href: '/tutor/courses' },
                { label: 'Grade Assignments', href: '/tutor/students' },
                { label: 'Payout Settings', href: '/tutor/earnings' },
                { label: 'View Analytics', href: '/tutor/earnings' }
              ].map((action, i) => (
                <Link key={i} href={action.href} className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-colors text-left group">
                  <span className="font-semibold text-sm text-slate-700 group-hover:text-orange-700">{action.label}</span>
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
