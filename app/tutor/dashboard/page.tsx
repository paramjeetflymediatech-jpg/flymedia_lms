import { requireAuth } from '../../../src/lib/auth';
import { redirect } from 'next/navigation';
import { Package, LiveClass, User } from '../../../src/db/models';
import Link from 'next/link';

export const revalidate = 0;

export default async function TutorDashboard() {
  const user = await requireAuth();
  
  if (user.role !== 'TUTOR') {
    redirect('/dashboard'); // Kick non-tutors out
  }

  // Fetch assigned Live Classes
  const liveClassesData = await LiveClass.findAll({
    where: { tutorId: user.id },
    include: [
      {
        model: Package,
        as: 'Package',
      }
    ],
    order: [['startTime', 'ASC']]
  });

  const now = new Date();
  const upcomingClasses: any[] = [];
  const pastClasses: any[] = [];

  for (const lc of liveClassesData) {
    const classJson = lc.toJSON() as any;
    if (new Date(classJson.startTime) > now) {
      upcomingClasses.push(classJson);
    } else {
      pastClasses.push(classJson);
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tutor Overview</h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back, <span className="font-semibold text-slate-700">{user.name || 'Tutor'}</span>. Here are your assigned live classes.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Upcoming Classes', value: upcomingClasses.length.toString(), icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
          { label: 'Past Classes', value: pastClasses.length.toString(), icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
          { label: 'Total Assigned', value: (upcomingClasses.length + pastClasses.length).toString(), icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
              <h3 className="mt-1 text-2xl font-extrabold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Classes */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 mb-6">Upcoming Classes</h3>
           {upcomingClasses.length > 0 ? (
             <div className="space-y-4">
               {upcomingClasses.map((lc, i) => (
                 <div key={i} className="flex flex-col p-4 border border-slate-100 rounded-2xl bg-slate-50">
                    <h4 className="font-bold text-slate-900 text-lg">{lc.title}</h4>
                    <p className="text-sm text-slate-500">Package: {lc.Package?.title}</p>
                    <div className="mt-2 text-sm font-semibold text-slate-700">
                      📅 {new Date(lc.startTime).toLocaleString()} ({lc.duration} mins)
                    </div>
                    {lc.meetLink ? (
                      <a href={lc.meetLink} target="_blank" rel="noreferrer" className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 w-max">
                        Join Google Meet
                      </a>
                    ) : (
                      <span className="mt-3 text-xs text-slate-400 italic">No meet link provided</span>
                    )}
                 </div>
               ))}
             </div>
           ) : (
             <div className="text-center py-12">
               <p className="text-slate-500 text-sm font-medium">No upcoming classes assigned.</p>
             </div>
           )}
        </div>

        {/* Past Classes */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 mb-6">Past Classes</h3>
           {pastClasses.length > 0 ? (
             <div className="space-y-4">
               {pastClasses.map((lc, i) => (
                 <div key={i} className="flex flex-col p-4 border border-slate-100 rounded-2xl bg-slate-50 opacity-70">
                    <h4 className="font-bold text-slate-900 text-lg">{lc.title}</h4>
                    <p className="text-sm text-slate-500">Package: {lc.Package?.title}</p>
                    <div className="mt-2 text-sm font-semibold text-slate-700">
                      📅 {new Date(lc.startTime).toLocaleString()} ({lc.duration} mins)
                    </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="text-center py-12">
               <p className="text-slate-500 text-sm font-medium">No past classes.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
