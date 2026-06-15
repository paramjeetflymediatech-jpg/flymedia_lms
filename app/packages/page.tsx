import Link from 'next/link';
import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import { Package } from '../../src/db/models';
import { Op } from 'sequelize';

export const metadata = {
  title: 'Training Programs | Flymedia Technology LMS',
  description: 'Browse our catalog of professional packages, coding bootcamps, and certification tracks designed for software developers.',
};

export const revalidate = 0; // Fresh listing every time

export default async function PackagesListingPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams?.page;
  const searchParam = resolvedSearchParams?.search as string || '';
  const page = typeof pageParam === 'string' ? parseInt(pageParam, 10) || 1 : 1;
  const limit = 6;
  const offset = (page - 1) * limit;

  let packages: any[] = [];
  let totalPages = 1;

  try {
    const whereClause = searchParam ? {
      title: { [Op.like]: `%${searchParam}%` }
    } : {};
    
    const { count, rows } = await Package.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
    packages = rows;
    totalPages = Math.ceil(count / limit) || 1;
  } catch (error) {
    console.error('Failed to query packages list:', error);
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Headline */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              All Training Programs
            </h1>
            <p className="text-lg text-slate-600">
              Select a specialized learning track to expand your skill set and earn industry-recognized credentials.
            </p>
          </div>

          {/* Search Bar */}
          <form method="GET" action="/packages" className="max-w-xl mx-auto flex gap-2">
            <input 
              type="text" 
              name="search" 
              defaultValue={searchParam}
              placeholder="Search packages..." 
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm"
            />
            <button type="submit" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm">
              Search
            </button>
            {searchParam && (
              <Link href="/packages" className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-sm">
                Clear
              </Link>
            )}
          </form>

          {/* Grid list */}
          {packages.length === 0 ? (
            <div className="text-center p-16 bg-white rounded-3xl border border-slate-100 max-w-lg mx-auto shadow-sm">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <p className="text-slate-700 font-bold text-xl mb-2">No packages found</p>
              <p className="text-slate-500">
                {searchParam ? `We couldn't find any packages matching "${searchParam}". Try adjusting your search.` : 'Check back later for new training programs.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full"
                  >
                    {pkg.thumbnail && (
                      <div className="h-48 overflow-hidden relative bg-slate-100">
                        <img
                          src={pkg.thumbnail}
                          alt={pkg.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur">
                          PROGRAM
                        </span>
                      </div>
                    )}

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 leading-snug flex items-center justify-between">
                          <span>{pkg.title}</span>
                          {pkg.mode && (
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ml-2 flex-shrink-0 ${
                              pkg.mode === 'ONLINE' ? 'bg-blue-100 text-blue-700' :
                              pkg.mode === 'OFFLINE' ? 'bg-orange-100 text-orange-700' :
                              'bg-indigo-100 text-indigo-700'
                            }`}>
                              {pkg.mode === 'BOTH' ? 'Online + Offline' : pkg.mode}
                            </span>
                          )}
                        </h2>
                      </div>

                      <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500 font-medium">Price</span>
                          <span className="text-sm font-semibold text-slate-700">
                            {pkg.price && Number(pkg.price) > 0 ? `₹${Number(pkg.price)}` : 'FREE'}
                          </span>
                        </div>

                        <Link
                          href={`/packages/${pkg.slug}`}
                          style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
                          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 rounded-xl transition-all shadow-lg shadow-rose-500/25"
                        >
                          Enroll Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-4 mt-12">
                  {page > 1 ? (
                    <Link href={`/packages?page=${page - 1}${searchParam ? `&search=${encodeURIComponent(searchParam)}` : ''}`} className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                      Previous
                    </Link>
                  ) : (
                    <span className="px-6 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-400 cursor-not-allowed">
                      Previous
                    </span>
                  )}
                  
                  <span className="text-sm font-bold text-slate-500 px-4">
                    Page {page} of {totalPages}
                  </span>

                  {page < totalPages ? (
                    <Link href={`/packages?page=${page + 1}${searchParam ? `&search=${encodeURIComponent(searchParam)}` : ''}`} className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                      Next
                    </Link>
                  ) : (
                    <span className="px-6 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-400 cursor-not-allowed">
                      Next
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
