import Link from 'next/link';
import { requireAuth } from '../../src/lib/auth';
import { Enrollment, Package, LiveClass, Certificate } from '../../src/db/models';

export const revalidate = 0; // Dynamic dashboard

export default async function StudentDashboardPage() {
  const user = await requireAuth();

  // Fetch all enrollments for user
  const enrollments = await Enrollment.findAll({
    where: { userId: user.id },
    include: [
      {
        model: Package,
        as: 'Package',
        include: [
          {
            model: LiveClass,
            as: 'liveClasses',
          },
        ],
      },
    ],
    order: [['enrolledAt', 'DESC']],
  });

  const certificates = await Certificate.findAll({
    where: { userId: user.id },
  });

  // Extract upcoming classes
  let allUpcomingClasses: any[] = [];
  const now = new Date();

  const enrichedPackages = enrollments.map((enroll) => {
    const pkg = (enroll as any).Package;
    if (!pkg) return null;

    if (pkg.liveClasses) {
      pkg.liveClasses.forEach((lc: any) => {
        if (new Date(lc.startTime) > now) {
          allUpcomingClasses.push({
            ...lc.toJSON(),
            packageTitle: pkg.title,
            packageSlug: pkg.slug,
            packageThumbnail: pkg.thumbnail,
          });
        }
      });
    }

    return {
      id: pkg.id,
      title: pkg.title,
      slug: pkg.slug,
      thumbnail: pkg.thumbnail,
      enrolledAt: enroll.enrolledAt,
    };
  }).filter(Boolean);

  // Sort upcoming classes by start time
  allUpcomingClasses.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const nextClass = allUpcomingClasses[0];

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold mb-2">Welcome back, {user.name || 'Student'}</h1>
            <p className="text-purple-50 mb-6">Ready to join your next live class today?</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/packages" className="bg-white text-purple-600 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm">
                Browse Packages
              </Link>
            </div>
          </div>
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-48 h-48 bg-blue-400 opacity-20 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
              📦
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Packages</p>
              <p className="text-2xl font-bold text-slate-900">{enrollments.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
              📅
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Upcoming Classes</p>
              <p className="text-2xl font-bold text-slate-900">{allUpcomingClasses.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xl shrink-0">
              🎓
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Certificates</p>
              <p className="text-2xl font-bold text-slate-900">{certificates.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Next Class */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Your Next Live Class</h2>
            {nextClass ? (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-6 p-6">
                {/* Thumbnail */}
                {nextClass.packageThumbnail ? (
                  <div className="w-full sm:w-48 h-32 rounded-xl shrink-0 bg-slate-100 overflow-hidden border border-slate-200 relative">
                    <img src={nextClass.packageThumbnail} alt={nextClass.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-1 bg-black/70 text-white rounded-md backdrop-blur-sm shadow-sm">LIVE</span>
                  </div>
                ) : (
                  <div className="w-full sm:w-48 h-32 rounded-xl shrink-0 bg-slate-100 flex flex-col items-center justify-center text-purple-600 border border-purple-100">
                    <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    <span className="text-xs font-bold mt-2 px-2 py-1 bg-purple-100 rounded-md">LIVE</span>
                  </div>
                )}
                <div className="flex-1 w-full space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{nextClass.title}</h3>
                    <p className="text-sm text-slate-500 font-medium">
                      Package: {nextClass.packageTitle}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-slate-700">
                    {new Date(nextClass.startTime).toLocaleString()} ({nextClass.duration} mins)
                  </div>
                  <div className="pt-2">
                    {nextClass.meetLink ? (
                      <a href={nextClass.meetLink} target="_blank" rel="noreferrer" className="inline-block px-6 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
                        Join on Google Meet
                      </a>
                    ) : (
                      <span className="text-sm text-slate-400 italic">Meet link not provided yet</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 text-2xl flex items-center justify-center mx-auto mb-4">
                  💤
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No upcoming classes</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">You don't have any live classes scheduled in the near future.</p>
                <Link href="/packages" className="inline-block px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm">
                  Browse Packages
                </Link>
              </div>
            )}

            {/* Enrolled Packages List */}
            <h2 className="text-xl font-bold text-slate-900 pt-4">Your Enrolled Packages</h2>
            {enrichedPackages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {enrichedPackages.map((pkg: any) => (
                  <div key={pkg.id} className="bg-white border border-slate-200 p-4 rounded-2xl flex gap-4">
                    {pkg.thumbnail ? (
                      <img src={pkg.thumbnail} alt={pkg.title} className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0 border border-slate-200">📦</div>
                    )}
                    <div>
                      <Link href={`/packages/${pkg.slug}`} className="font-bold text-slate-900 hover:text-purple-600 transition-colors line-clamp-2 text-sm">
                        {pkg.title}
                      </Link>
                      <p className="text-xs text-slate-500 mt-1">Enrolled on {new Date(pkg.enrolledAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">You are not enrolled in any packages.</p>
            )}
          </div>

          {/* Schedule Sidebar */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Full Schedule</h2>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 max-h-[600px] overflow-y-auto">
              {allUpcomingClasses.length > 0 ? (
                allUpcomingClasses.map((cls, idx) => (
                  <div key={idx} className="flex flex-col border-l-2 border-purple-200 pl-4 py-1 relative">
                    <div className="absolute w-2 h-2 rounded-full bg-purple-400 -left-[5px] top-2" />
                    <span className="text-[10px] font-bold text-purple-600 uppercase">
                      {new Date(cls.startTime).toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{cls.title}</span>
                    <span className="text-xs text-slate-500">{new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">No scheduled classes.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
