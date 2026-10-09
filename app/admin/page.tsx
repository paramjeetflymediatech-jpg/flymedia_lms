import Link from 'next/link';
import { requireAdmin } from '../../src/lib/auth';
import { Package, Enrollment, User, BlogPost, Category, TutorApplication } from '../../src/db/models';
import AdminDashboardClient from '../../src/components/admin/AdminDashboardClient';

export const revalidate = 0; // Fresh admin logs

export default async function AdminDashboardPage() {
  await requireAdmin();

  // Fetch metrics
  const packages = await Package.findAll();
  const blogs = await BlogPost.findAll();
  const categories = await Category.findAll();
  const pendingTutors = await TutorApplication.count({ where: { status: 'PENDING' } });
  
  const enrollments = await Enrollment.findAll({
    include: [
      { model: User, attributes: ['id', 'name', 'email'] },
      { model: Package, as: 'Package', attributes: ['id', 'title'] },
    ],
    order: [['enrolledAt', 'DESC']],
  });

  const uniqueStudents = await User.count({ where: { role: 'STUDENT' } });
  const uniqueTutors = await User.count({ where: { role: 'TUTOR' } });

  // Process data for charts
  const today = new Date();
  const days = [];
  
  // Last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  let cumulative = 0;
  
  // Pre-calculate cumulative up to 7 days ago
  const sevenDaysAgo = new Date(days[0]);
  cumulative = enrollments.filter((e: any) => new Date(e.enrolledAt) < sevenDaysAgo).length;

  const enrollmentData = days.map(day => {
    const count = enrollments.filter((e: any) => e.enrolledAt.toISOString().split('T')[0] === day).length;
    cumulative += count;
    return {
      date: new Date(day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      count,
      cumulative
    };
  });

  return (
    <div className="p-6 md:p-10 space-y-12">
      
      {/* Top Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-8 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 rounded-3xl shadow-md text-white">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-100 bg-black/20 px-3 py-1 rounded-full">Admin Control Panel</span>
          <h1 className="text-3xl font-extrabold tracking-tight">LMS Analytics & Operations</h1>
          <p className="text-rose-100 font-medium max-w-lg">Monitor enrollments, track growth, and manage your platform's content and users from your master dashboard.</p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Programs</span>
          <div className="text-4xl font-black text-slate-900">{packages.length}</div>
          <p className="text-xs font-semibold text-orange-600">Active packages</p>
        </div>
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Students</span>
          <div className="text-4xl font-black text-slate-900">{uniqueStudents}</div>
          <p className="text-xs font-semibold text-orange-600">Verified accounts</p>
        </div>
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Enrolls</span>
          <div className="text-4xl font-black text-slate-900">{enrollments.length}</div>
          <p className="text-xs font-semibold text-orange-600">Total registrations</p>
        </div>
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15M9 11l3 3m0 0l3-3m-3 3V8" /></svg>
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tutors</span>
          <div className="text-4xl font-black text-slate-900">{uniqueTutors}</div>
          <p className="text-xs font-semibold text-orange-600">{pendingTutors} pending apps</p>
        </div>
      </div>

      <AdminDashboardClient 
        enrollmentData={enrollmentData} 
        enrollmentsList={enrollments.slice(0, 15).map((e: any) => e.toJSON())} 
        totalEnrollments={enrollments.length}
      />

    </div>
  );
}
