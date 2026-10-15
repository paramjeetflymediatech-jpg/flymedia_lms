import { requireAuth } from '../../../src/lib/auth';
import { redirect } from 'next/navigation';
import { Package, LiveClass, User, Enrollment } from '../../../src/db/models';
import Link from 'next/link';
import TutorActivityChart from '../../../src/components/tutor/TutorActivityChart';

export const revalidate = 0;

export default async function TutorDashboard() {
  const user = await requireAuth();
  
  if (user.role !== 'TUTOR') {
    redirect('/dashboard'); // Kick non-tutors out
  }

  // 1. Fetch tutor with assigned packages and enrollments
  const tutorData = await User.findByPk(user.id, {
    include: [
      {
        model: Package,
        as: 'assignedPackages',
        through: { attributes: [] },
        include: [
          {
            model: Enrollment,
            as: 'enrollments',
            include: [{ model: User, attributes: ['id', 'name', 'email'] }],
          },
          {
            model: LiveClass,
            as: 'liveClasses',
            where: { tutorId: user.id },
            required: false,
          },
        ],
      },
    ],
  });

  const assignedPackages = (tutorData?.assignedPackages || []).map((p) => p.toJSON() as any);

  // 2. Fetch assigned Live Classes
  const liveClassesData = await LiveClass.findAll({
    where: { tutorId: user.id },
    include: [
      {
        model: Package,
        as: 'Package',
      },
    ],
    order: [['startTime', 'ASC']],
  });

  const now = new Date();
  const upcomingClasses: any[] = [];
  const pastClasses: any[] = [];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const activityData = daysOfWeek.map((day) => ({ label: day, value: 0 }));

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

  // Total unique students across all assigned packages
  const studentIds = new Set<string>();
  for (const p of assignedPackages) {
    for (const enr of p.enrollments || []) {
      if (enr.userId) studentIds.add(enr.userId);
    }
  }

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1400px] mx-auto space-y-10 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center text-2xl font-extrabold shadow-lg shadow-orange-200">
            {user.name ? user.name.charAt(0).toUpperCase() : 'T'}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user.name?.split(' ')[0] || 'Tutor'}!
            </h1>
            <p className="mt-1 text-slate-500 font-medium text-lg">
              Here are the packages assigned to you and classes you teach today.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/tutor/packages"
            className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-md transition-all text-xs"
          >
            🎓 Assigned Packages ({assignedPackages.length})
          </Link>
          <Link
            href="/tutor/classes"
            className="px-5 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors text-xs"
          >
            📅 My Classes
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        {[
          {
            label: 'Assigned Packages',
            value: assignedPackages.length.toString(),
            icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
            color: 'text-purple-600',
            bg: 'bg-purple-100',
          },
          {
            label: 'Upcoming Classes',
            value: upcomingClasses.length.toString(),
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
            color: 'text-blue-600',
            bg: 'bg-blue-100',
          },
          {
            label: 'Past Classes',
            value: pastClasses.length.toString(),
            icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
          },
          {
            label: 'Enrolled Students',
            value: studentIds.size.toString(),
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
            color: 'text-orange-600',
            bg: 'bg-orange-100',
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-shadow relative overflow-hidden group flex flex-col justify-between"
          >
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} shadow-inner`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="mt-1 text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
              <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================== */}
      {/* MY ASSIGNED PACKAGES SHOWCASE                                  */}
      {/* ============================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Assigned Courses & Packages</h2>
            <p className="text-xs text-slate-500">
              Packages assigned to you by admin that you are actively teaching.
            </p>
          </div>
          <Link
            href="/tutor/packages"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
          >
            View All ({assignedPackages.length}) →
          </Link>
        </div>

        {assignedPackages.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
            <p className="text-xs text-slate-500">No packages assigned yet by administrator.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedPackages.map((pkg) => {
              const enrollCount = (pkg.enrollments || []).length;
              const classesCount = (pkg.liveClasses || []).length;
              const totalClassesLimit = pkg.totalClasses || 12;

              return (
                <div
                  key={pkg.id}
                  className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      {pkg.thumbnail ? (
                        <img
                          src={pkg.thumbnail}
                          alt={pkg.title}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xl shrink-0">
                          🎓
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                          {pkg.category || 'Package'}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-sm mt-1 truncate">
                          {pkg.title}
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          {totalClassesLimit} Classes Limit • Mode: {pkg.mode || 'ONLINE'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Students</span>
                        <span className="font-extrabold text-slate-900">{enrollCount} Enrolled</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Classes</span>
                        <span className="font-extrabold text-orange-600">{classesCount} Sessions</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <Link
                      href="/tutor/packages"
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                    >
                      View Schedule & Students →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Activity Graph */}
        <div className="lg:col-span-2 space-y-8 flex flex-col">
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
              <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
                {upcomingClasses.length} Scheduled
              </span>
            </div>

            {upcomingClasses.length > 0 ? (
              <div className="space-y-4 flex-1">
                {upcomingClasses.map((lc, i) => (
                  <div
                    key={i}
                    className="flex flex-col p-5 border border-slate-100 rounded-[1.5rem] bg-white shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        {lc.classNumber && (
                          <span className="text-[10px] font-extrabold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md inline-block mb-1">
                            Class #{lc.classNumber} of 12
                          </span>
                        )}
                        <h4 className="font-bold text-slate-900 text-base leading-tight group-hover:text-orange-600 transition-colors">
                          {lc.title}
                        </h4>
                      </div>
                      <div className="flex flex-col items-end text-right shrink-0">
                        <span className="text-sm font-black text-slate-900">
                          {new Date(lc.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          {new Date(lc.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mb-4 flex items-center gap-1.5">
                      <span>🎓</span>
                      {lc.Package?.title || 'General Session'}
                    </p>

                    {lc.meetLink ? (
                      <a
                        href={lc.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-xs"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                        </svg>
                        Launch Class on Google Meet
                      </a>
                    ) : (
                      <div className="w-full text-center px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-400">
                        Link will be provided by Admin
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 flex-1 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
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
                    <p className="text-xs text-slate-500 mt-1">
                      📅 {new Date(lc.startTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • {lc.duration} mins
                    </p>
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
