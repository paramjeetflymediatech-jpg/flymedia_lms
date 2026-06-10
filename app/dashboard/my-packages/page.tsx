import Link from 'next/link';
import { requireAuth } from '../../../src/lib/auth';
import { Enrollment, Package, LiveClass } from '../../../src/db/models';

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

  const enrolledPackages = enrollments.map((enroll) => {
    const pkg = (enroll as any).Package;
    if (!pkg) return null;

    const liveClasses = pkg.liveClasses || [];
    const totalClasses = liveClasses.length;

    return {
      id: pkg.id,
      title: pkg.title,
      slug: pkg.slug,
      thumbnail: pkg.thumbnail,
      totalClasses,
      enrolledAt: enroll.enrolledAt,
    };
  }).filter(Boolean);

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">My Packages</h1>

      {enrolledPackages.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 text-2xl flex items-center justify-center mx-auto mb-4">
            📦
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No packages yet</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            You haven't enrolled in any packages yet. Discover our packages and start learning today!
          </p>
          <Link href="/packages" className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-sm shadow-purple-200">
            Browse Packages
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledPackages.map((p: any) => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
              {/* Thumbnail */}
              {p.thumbnail && (
                <div className="h-44 relative bg-slate-100 overflow-hidden">
                  <img
                    src={p.thumbnail}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                      {p.title}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-slate-400">
                      Contains {p.totalClasses} Live Classes
                    </div>
                  </div>
                </div>

                {/* Operations */}
                <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3">
                  <Link
                    href={`/packages/${p.slug}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
