import { requireAuth } from '../../../src/lib/auth';
import { redirect } from 'next/navigation';
import { Package, LiveClass, User } from '../../../src/db/models';
import Link from 'next/link';
import TutorActivityChart from '../../../src/components/tutor/TutorActivityChart';

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

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const activityData = daysOfWeek.map(day => ({ label: day, value: 0 }));

  for (const lc of liveClassesData) {
    const classJson = lc.toJSON() as any;
    if (new Date(classJson.startTime) > now) {
      upcomingClasses.push(classJson);
    } else {
      pastClasses.push(classJson);
    }
    
    // Populate graph data
    const date = new Date(classJson.startTime);
    const day = date.getDay();
    activityData[day].value += 1;
  }

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1400px] mx-auto space-y-10 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-6">
          {/* Avatar Placeholder / Initial */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center text-2xl font-extrabold shadow-lg shadow-orange-200">
            {user.name ? user.name.charAt(0).toUpperCase() : 'T'}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, {user.name?.split(' ')[0] || 'Tutor'}!</h1>
            <p className="mt-1 text-slate-500 font-medium text-lg">
              Here is what's happening with your classes today.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/tutor/availability" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors">
            Manage Availability
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Graph */}
        <div className="lg:col-span-2 space-y-8 flex flex-col">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Upcoming Classes', value: upcomingClasses.length.toString(), icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'text-blue-600', bg: 'bg-blue-100' },
              { label: 'Past Classes', value: pastClasses.length.toString(), icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'text-emerald-600', bg: 'bg-emerald-100' },
              { label: 'Total Assigned', value: (upcomingClasses.length + pastClasses.length).toString(), icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', color: 'text-orange-600', bg: 'bg-orange-100' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-shadow relative overflow-hidden group flex flex-col justify-between">
                <div className="relative z-10 flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} shadow-inner`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="mt-1 text-4xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                  <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Graph */}
          <div className="flex-1">
            <TutorActivityChart data={activityData} />
          </div>
        </div>

        {/* Right Column: Upcoming & Past Classes feed */}
        <div className="space-y-8 flex flex-col">
          {/* Upcoming Classes */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex-1 flex flex-col">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-extrabold text-slate-900">Upcoming Agenda</h3>
               <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">{upcomingClasses.length} Scheduled</span>
             </div>
             
             {upcomingClasses.length > 0 ? (
               <div className="space-y-4 flex-1">
                 {upcomingClasses.map((lc, i) => (
                   <div key={i} className="flex flex-col p-5 border border-slate-100 rounded-[1.5rem] bg-white shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h4 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-orange-600 transition-colors">{lc.title}</h4>
                        <div className="flex flex-col items-end text-right shrink-0">
                          <span className="text-sm font-black text-slate-900">{new Date(lc.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          <span className="text-xs font-bold text-slate-400 uppercase">{new Date(lc.startTime).toLocaleDateString([], {month: 'short', day: 'numeric'})}</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 font-medium mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        {lc.Package?.title || 'General Session'}
                      </p>
                      
                      {lc.meetLink ? (
                        <a href={lc.meetLink} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white text-sm font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-sm">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                          Join Meeting
                        </a>
                      ) : (
                        <div className="w-full text-center px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-400">
                          Link will be provided by Admin
                        </div>
                      )}
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-16 flex-1 flex flex-col items-center justify-center">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                 </div>
                 <p className="text-slate-500 font-bold">No upcoming classes</p>
                 <p className="text-slate-400 text-sm mt-1">Enjoy your free time!</p>
               </div>
             )}
          </div>
          
          {/* Quick Recent Past */}
          {pastClasses.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-lg font-extrabold text-slate-900 mb-6">Recent Past Classes</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                 {pastClasses.slice(0, 3).map((lc, i) => (
                   <div key={i} className="flex flex-col p-4 border border-slate-100 rounded-[1.25rem] bg-slate-50 opacity-70">
                      <h4 className="font-bold text-slate-800">{lc.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">📅 {new Date(lc.startTime).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})} • {lc.duration} mins</p>
                   </div>
                 ))}
                 {pastClasses.length > 3 && (
                   <div className="text-center pt-2 text-xs font-bold text-orange-600">
                     + {pastClasses.length - 3} more past classes
                   </div>
                 )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
