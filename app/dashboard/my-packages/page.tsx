import Link from 'next/link';
import { requireAuth } from '../../../src/lib/auth';
import { Enrollment, Package, LiveClass } from '../../../src/db/models';
import { syncAndGetEnrollmentProgress } from '../../../src/lib/attendance';

export const revalidate = 0;

export default async function MyPackagesPage() {
  const user = await requireAuth();

  // Fetch all enrollments for user, including Package -> LiveClasses
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

  const enrolledPackages = await Promise.all(
    enrollments.map(async (enroll) => {
      const pkg = (enroll as any).Package;
      if (!pkg) return null;

      const progress = await syncAndGetEnrollmentProgress(enroll.id);

      return {
        id: pkg.id,
        enrollmentId: enroll.id,
        title: pkg.title,
        slug: pkg.slug,
        thumbnail: pkg.thumbnail,
        enrolledAt: enroll.enrolledAt,
        progress: progress || {
          totalClasses: enroll.totalClasses || 12,
          conductedClasses: 0,
          attendedClasses: 0,
          missedClasses: 0,
          remainingClasses: enroll.totalClasses || 12,
          isExpired: false,
          status: enroll.status || 'ACTIVE',
          progressPercentage: 0,
        },
      };
    })
  );

  const validPackages = enrolledPackages.filter(Boolean);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Packages</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor your package classes, attendance, missed sessions, and expiration status.
        </p>
      </div>

      {validPackages.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 text-2xl flex items-center justify-center mx-auto mb-4">
            📦
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No packages yet</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto text-xs">
            You haven't enrolled in any packages yet. Discover our packages and start learning with live tutor sessions today!
          </p>
          <Link
            href="/packages"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold text-xs transition-all shadow-sm"
          >
            Browse Packages
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {validPackages.map((p: any) => {
            const prog = p.progress;
            const isExpired = prog.isExpired || prog.status === 'EXPIRED';

            return (
              <div
                key={p.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Thumbnail */}
                <div className="h-44 relative bg-slate-100 overflow-hidden">
                  {p.thumbnail ? (
                    <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-orange-50">
                      📦
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {isExpired ? (
                      <span className="px-3 py-1 bg-rose-600 text-white font-extrabold text-[11px] rounded-lg shadow-md uppercase tracking-wider">
                        Package Expired
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold text-[11px] rounded-lg shadow-md uppercase tracking-wider">
                        Active ({prog.remainingClasses} Classes Left)
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                      {p.title}
                    </h3>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span>Class Completion</span>
                        <span className="font-bold text-orange-600">
                          {prog.conductedClasses} / {prog.totalClasses} Conducted
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            isExpired
                              ? 'bg-rose-500'
                              : 'bg-gradient-to-r from-orange-500 to-amber-500'
                          }`}
                          style={{ width: `${prog.progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Attended</span>
                        <span className="text-sm font-extrabold text-emerald-600">{prog.attendedClasses} Classes</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Missed / Absent</span>
                        <span className={`text-sm font-extrabold ${prog.missedClasses > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                          {prog.missedClasses} Classes {prog.missedClasses > 0 ? '⚠️' : ''}
                        </span>
                      </div>
                    </div>

                    {prog.missedClasses > 0 && (
                      <p className="text-[11px] text-rose-500 font-medium">
                        * Missed classes count against your {prog.totalClasses}-class limit.
                      </p>
                    )}

                    {isExpired && (
                      <div className="p-3 bg-rose-50 border border-rose-200/60 rounded-xl text-[11px] text-rose-800 font-medium">
                        All {prog.totalClasses} scheduled classes for this package have completed. This package has now expired.
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Link
                      href={`/packages/${p.slug}`}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                    >
                      View Syllabus
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl transition-all shadow-sm"
                    >
                      Class Schedule
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
