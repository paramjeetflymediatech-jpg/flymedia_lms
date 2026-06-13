import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '../../../src/components/layout/Header';
import Footer from '../../../src/components/layout/Footer';
import { Package, LiveClass, Enrollment } from '../../../src/db/models';
import { getCurrentUser } from '../../../src/lib/auth';
import PackageEnrollWidget from '../../../src/components/packages/PackageEnrollWidget';

export const revalidate = 0; // Keep dynamic

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await Package.findOne({ where: { slug } });

  if (!pkg) {
    return {
      title: 'Package Not Found',
    };
  }

  return {
    title: `${pkg.title} | Flymedia Technology`,
    description: pkg.description.slice(0, 160),
    openGraph: {
      title: pkg.title,
      description: pkg.description.slice(0, 160),
      images: pkg.thumbnail ? [{ url: pkg.thumbnail }] : [],
    },
  };
}

export default async function PackageDetailPage({ params }: Props) {
  const { slug } = await params;
  const user = await getCurrentUser();

  // Fetch package with live classes
  const pkg = await Package.findOne({
    where: { slug },
    include: [
      {
        model: LiveClass,
        as: 'liveClasses',
      },
    ],
    order: [
      [{ model: LiveClass, as: 'liveClasses' }, 'startTime', 'ASC'],
    ],
  });

  if (!pkg) {
    notFound();
  }

  // Check enrollment
  let isEnrolled = false;
  if (user) {
    const enroll = await Enrollment.findOne({
      where: { userId: user.id, packageId: pkg.id },
    });
    isEnrolled = !!enroll;
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-white relative overflow-hidden pt-20 pb-32">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-[20%] left-0 w-[600px] h-[600px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 relative z-10">

          {/* Main Package Content (Left 8 cols) */}
          <div className="lg:col-span-8 space-y-12">

            {/* Header info */}
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-orange-500 mr-2 animate-pulse" />
                  Live Classes
                </div>
                {pkg.mode && (
                  <div className={`inline-flex items-center px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-wider ${
                    pkg.mode === 'ONLINE' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                    pkg.mode === 'OFFLINE' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                    'bg-indigo-50 border-indigo-200 text-indigo-700'
                  }`}>
                    {pkg.mode === 'ONLINE' ? '🌐 Online' : pkg.mode === 'OFFLINE' ? '🏫 Offline' : '🌐🏫 Hybrid (Online + Offline)'}
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.2] tracking-tight">
                {pkg.title}
              </h1>
            </div>

            {/* Thumbnail */}
            {pkg.thumbnail && (
              <div className="w-full h-72 sm:h-[450px] rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100 relative group">
                <img
                  src={pkg.thumbnail}
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            )}

            {/* Description & Modules */}
            <div className="space-y-6 pt-4">
           {/* <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Modules Covered</h2> */}
              <div 
                className="prose prose-slate max-w-none prose-headings:font-black prose-h2:text-2xl prose-a:text-orange-600 prose-li:marker:text-orange-500 prose-p:my-2 prose-ul:my-2 prose-li:my-1 bg-white p-6 sm:p-10 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
                dangerouslySetInnerHTML={{ __html: pkg.description || '' }}
              />
            </div>

            {/* Live Classes Schedule */}
            <div className="space-y-8 pt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Class Schedule</h2>
                <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full w-fit">{((pkg as any).liveClasses || []).length} Classes</span>
              </div>

              {(!(pkg as any).liveClasses || (pkg as any).liveClasses.length === 0) ? (
                <div className="p-12 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-center">
                  <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-3xl mb-4">
                    📅
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Schedule Pending</h3>
                  <p className="text-slate-500 font-medium text-sm max-w-md mx-auto">
                    Live classes for this package have not been scheduled yet. Please check back later.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {((pkg as any).liveClasses || []).map((lc: any, idx: number) => (
                    <div key={lc.id} className="p-6 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">{lc.title}</h4>
                          <p className="text-sm text-slate-500 font-medium">
                            {new Date(lc.startTime).toLocaleString()} ({lc.duration} mins)
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg uppercase tracking-wide">Live</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Enrollment Sidebar Widget (Right 4 cols) */}
          <div className="lg:col-span-4 relative z-20">
            <PackageEnrollWidget 
              pkg={pkg.toJSON()} 
              user={user ? { id: user.id } : null} 
              isEnrolled={isEnrolled} 
            />
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
