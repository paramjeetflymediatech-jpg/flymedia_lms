import Link from 'next/link';
import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import PublicFilterForm from '../../src/components/packages/PublicFilterForm';
import { Package } from '../../src/db/models';
import { Op } from 'sequelize';
import GsapReveal from '../../src/components/animations/GsapReveal';

export const metadata = {
  title: 'Training Programs | Flymedia Technology LMS',
  description: 'Browse our catalog of professional packages, coding bootcamps, and certification tracks designed for software developers.',
};

export const revalidate = 0; // Fresh listing every time

export default async function PackagesListingPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams?.page;
  const searchParam = resolvedSearchParams?.search as string || '';
  const categoryParam = resolvedSearchParams?.category as string || '';
  const modeParam = resolvedSearchParams?.mode as string || '';
  const durationParam = resolvedSearchParams?.duration as string || '';
  const page = typeof pageParam === 'string' ? parseInt(pageParam, 10) || 1 : 1;
  const limit = 6;
  const offset = (page - 1) * limit;

  let packages: any[] = [];
  let totalPages = 1;
  let totalCount = 0;
  let allDurations: string[] = [];

  try {
    const whereClause: any = {};
    if (searchParam) {
      whereClause.title = { [Op.like]: `%${searchParam}%` };
    }
    if (categoryParam) {
      whereClause.category = categoryParam;
    }
    if (modeParam) {
      if (modeParam === 'ONLINE') {
        whereClause.mode = { [Op.in]: ['ONLINE', 'BOTH'] };
      } else if (modeParam === 'OFFLINE') {
        whereClause.mode = { [Op.in]: ['OFFLINE', 'BOTH'] };
      } else {
        whereClause.mode = modeParam;
      }
    }
    if (durationParam) {
      whereClause.duration = durationParam;
    }
    
    // Only fetch published packages
    whereClause.status = 'PUBLISHED';
    const [result, durationRows] = await Promise.all([
      Package.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [
          ['duration', 'ASC'],
          ['createdAt', 'DESC']
        ],
      }),
      Package.findAll({
        where: { status: 'PUBLISHED' },
        attributes: ['duration'],
        raw: true,
      }),
    ]);

    packages = result.rows;
    totalCount = result.count;
    totalPages = Math.ceil(result.count / limit) || 1;
    allDurations = Array.from(new Set(durationRows.map((d: any) => d.duration).filter(Boolean)));
  } catch (error) {
    console.error('Failed to query packages list:', error);
  }

  const buildPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (modeParam) params.set('mode', modeParam);
    if (durationParam) params.set('duration', durationParam);
    if (categoryParam) params.set('category', categoryParam);
    if (searchParam) params.set('search', searchParam);
    params.set('page', targetPage.toString());
    return `/packages?${params.toString()}`;
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Headline */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              {categoryParam ? `${categoryParam} Programs` : 'All Training Programs'}
            </h1>
            <p className="text-lg text-slate-600">
              {categoryParam 
                ? `Explore our specialized ${categoryParam} courses designed to expand your skill set.`
                : 'Select a specialized learning track to expand your skill set and earn industry-recognized credentials.'}
            </p>
          </div>

          {/* Search Bar */}
          <PublicFilterForm 
            actionPath="/packages" 
            currentCategory={categoryParam} 
            currentMode={modeParam} 
            currentDuration={durationParam}
            durations={allDurations}
            currentSearch={searchParam} 
          />

          {/* Grid list */}
          {packages.length === 0 ? (
            <div className="text-center p-16 bg-white rounded-3xl border border-slate-100 max-w-lg mx-auto shadow-sm">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <p className="text-slate-700 font-bold text-xl mb-2">No packages found</p>
              <p className="text-slate-500">
                {searchParam || categoryParam 
                  ? `We couldn't find any packages matching your filters. Try adjusting your search.` 
                  : 'Check back later for new training programs.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {packages.map((pkg, idx) => (
                  <GsapReveal key={`${pkg.id}-${modeParam}-${durationParam}-${page}`} animation="slideUp" delay={idx * 0.05} duration={0.6}>
                    <Link href={`/packages/${pkg.slug}`} className="group block h-full">
                      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full relative">
                        <div className="w-full relative overflow-hidden">
                          {pkg.thumbnail ? (
                            <img src={pkg.thumbnail} alt={pkg.title} className="w-full h-auto block" />
                          ) : (
                            <div className="w-full aspect-video flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                              <svg className="w-16 h-16 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            </div>
                          )}
                          
                          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                            <span className="px-3 py-1.5 bg-white/95 backdrop-blur-md text-slate-900 text-xs font-black rounded-lg shadow-lg uppercase tracking-wider">
                              {pkg.category || 'PROGRAM'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-8 flex-1 flex flex-col relative bg-white">
                          <div className="absolute -top-6 right-6 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-500 z-20">
                            <svg className="w-5 h-5 -mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                          </div>
                          
                          <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-orange-600 transition-colors line-clamp-2 leading-tight">
                            {pkg.title}
                          </h3>
                          
                          <p className="text-slate-500 text-base mb-8 line-clamp-2 flex-1 font-medium leading-relaxed">
                            {pkg.description?.replace(/<[^>]*>?/gm, '')}
                          </p>
                          
                          <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 group-hover:border-orange-200 group-hover:text-orange-600 transition-colors">
                              {pkg.mode === 'BOTH' ? 'ONLINE & OFFLINE' : pkg.mode=='online'?'ONLINE':"OFFLINE" }
                            </span>
                            <div className="flex flex-col items-end gap-1">
                              {pkg.duration && (
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{pkg.duration}</span>
                              )}
                              <span className="font-black text-xl text-slate-900 group-hover:text-orange-600 transition-colors">
                                {pkg.price && Number(pkg.price) > 0 ? `₹${Number(pkg.price).toLocaleString('en-IN')}` : 'Free'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </GsapReveal>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-12 border-t border-slate-100">
                  <p className="text-sm font-semibold text-slate-500 order-2 sm:order-1">
                    Showing <span className="font-bold text-slate-900">{offset + 1}</span>–<span className="font-bold text-slate-900">{Math.min(offset + limit, totalCount)}</span> of <span className="font-bold text-slate-900">{totalCount}</span> packages
                  </p>

                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    {/* Previous Button */}
                    {page > 1 ? (
                      <Link 
                        href={buildPageUrl(page - 1)} 
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                        <span>Previous</span>
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-300 cursor-not-allowed">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                        <span>Previous</span>
                      </span>
                    )}

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                        const isActive = p === page;
                        return (
                          <Link
                            key={p}
                            href={buildPageUrl(p)}
                            className={`w-10 h-10 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${
                              isActive
                                ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                            }`}
                          >
                            {p}
                          </Link>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    {page < totalPages ? (
                      <Link 
                        href={buildPageUrl(page + 1)} 
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                      >
                        <span>Next</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-300 cursor-not-allowed">
                        <span>Next</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                      </span>
                    )}
                  </div>
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
