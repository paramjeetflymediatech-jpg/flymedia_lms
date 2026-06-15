import Link from 'next/link';
import Header from '../src/components/layout/Header';
import Footer from '../src/components/layout/Footer';
import HeroSlider from '../src/components/home/HeroSlider';
import CallbackForm from '../src/components/home/CallbackForm';
import { Package, SeoSetting } from '../src/db/models';
import { Metadata } from 'next';

export const revalidate = 0; // Dynamic rendering to fetch courses

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seo = await SeoSetting.findOne({ where: { pagePath: '/' } });
    if (seo) {
      return {
        title: seo.title,
        description: seo.description,
        keywords: seo.keywords ? seo.keywords.split(',').map((k: string) => k.trim()) : undefined,
      };
    }
  } catch (e) {
    console.error('Failed to load SEO for homepage:', e);
  }

  return {
    title: "Flymedia Academy LMS",
    description: "Premium learning management system.",
  };
}

export default async function HomePage() {
  let packages: Package[] = [];
  try {
    packages = await Package.findAll({ limit: 4 });
  } catch (error) {
    console.error('Failed to load packages for homepage:', error);
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-[#fafafa]">

        <HeroSlider />

        {/* Training Benefits Section */}
        <section className="py-24 bg-white relative overflow-hidden border-b border-slate-100">
          {/* Subtle Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Why Train with Flymedia?</h2>
              <p className="text-lg text-slate-600 font-medium">Get equipped with practical, live project execution experience built for software developers & digital marketers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Benefit 1 */}
              <div className="group relative p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">Live Projects</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Gain practical knowledge working on actual client campaigns and production server projects.
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="group relative p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-rose-600 transition-colors">Hands-on Coding</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Write dynamic scripts, design graphical UI/UX assets, or manage SEO parameters directly under expert review.
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="group relative p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Agency Exposure</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Observe how a leading IT and Digital Marketing agency structures sprint schedules, deliverables, and ROI strategies.
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefit 4 */}
              <div className="group relative p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">Verified Certificate</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Graduate with a professional training completion certificate valid for recruitment in leading IT corporations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Courses Offered Section */}
        <section className="py-16 sm:py-24 relative overflow-hidden bg-white">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-rose-500/5 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 sm:mb-12 md:mb-16 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4 max-w-2xl">
                <div className="inline-flex items-center space-x-2 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-slate-50 border border-slate-200 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span>Training Modules</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight sm:leading-[1.1]">
                  Explore Our <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent block sm:inline">Premium Tracks</span>
                </h2>
                <p className="text-base sm:text-lg text-slate-600 font-medium">
                  Master the most in-demand skills with our intensive, industry-aligned training programs.
                </p>
              </div>
              <Link
                href="/packages"
                className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3.5 sm:py-3 text-sm font-bold text-white transition-all rounded-xl sm:rounded-2xl shadow-lg shadow-rose-500/25 hover:-translate-y-0.5 hover:shadow-rose-500/40 shrink-0"
                style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
              >
                View All Programs →
              </Link>
            </div>

            {packages.length === 0 ? (
              <div className="text-center p-8 sm:p-16 bg-slate-50 rounded-3xl sm:rounded-[3rem] border border-slate-100 max-w-2xl mx-auto">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">No Packages Available</h3>
                <p className="text-sm sm:text-base text-slate-500 mb-6 font-medium">The package catalog is currently being updated. Please check back soon or sync the database.</p>
                <code className="text-xs px-3 py-2 rounded-lg bg-slate-200 font-mono text-slate-700 font-bold break-all">npm run db:sync</code>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="group flex flex-col h-full bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2 overflow-hidden">
                    {/* Image Header */}
                    <div className="h-40 sm:h-48 relative overflow-hidden bg-slate-100">
                      {pkg.thumbnail ? (
                        <img
                          src={pkg.thumbnail}
                          alt={pkg.title}
                          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl">📚</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <span className="absolute top-3 sm:top-4 right-3 sm:right-4 text-[10px] font-black px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/90 text-slate-900 backdrop-blur-md uppercase tracking-wider shadow-sm">
                        PACKAGE
                      </span>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 sm:p-6 md:p-8 flex-1 flex flex-col justify-between">
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <span className="flex items-center">
                            <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {pkg.price && Number(pkg.price) > 0 ? `₹${Number(pkg.price)}` : 'Free'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center text-orange-500">
                            <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            4.9
                          </span>
                        </div>
                        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-2">
                          <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
                            {pkg.title}
                          </h3>
                          {pkg.mode && (
                            <span className={`self-start text-[9px] sm:text-[10px] uppercase tracking-wider font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md flex-shrink-0 ${pkg.mode === 'ONLINE' ? 'bg-blue-100 text-blue-700' :
                                pkg.mode === 'OFFLINE' ? 'bg-orange-100 text-orange-700' :
                                  'bg-indigo-100 text-indigo-700'
                              }`}>
                              {pkg.mode === 'BOTH' ? 'Online + Offline' : pkg.mode}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-xs sm:text-sm line-clamp-3 font-medium leading-relaxed whitespace-pre-wrap">
                          {pkg.description?.replace(/<[^>]*>?/gm, '')}
                        </p>
                      </div>

                      {/* Footer CTA */}
                      <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-slate-100">
                        <Link
                          href={`/packages/${pkg.slug}`}
                          className="w-full inline-flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 group/link"
                        >
                          <span>Explore Details</span>
                          <span className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center group-hover/link:bg-orange-50 group-hover/link:border-orange-200 group-hover/link:text-orange-600 transition-colors">
                            <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4 group-hover/link:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Expert Mentor & Apply Section */}
        <section className="py-32 bg-slate-50 relative overflow-hidden border-t border-slate-100">
          {/* Animated Glow Backdrops */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/5 blur-[100px] -z-10 rounded-full animate-pulse" />
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-rose-500/5 blur-[100px] -z-10 rounded-full" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Mentor & Value Prop */}
            <div className="space-y-10">
              <div className="space-y-6">
                <h2 className="text-5xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  Transform Your Career in <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">30 Days</span>
                </h2>
              </div>

              <div className="p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 p-[2px] shadow-sm">
                      <img src="/Anujgupta.png" alt="Anuj Gupta" className="h-full w-full object-cover rounded-full bg-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-900">Anuj Gupta</h4>
                      <p className="text-orange-600 text-xs font-bold uppercase tracking-wider">Lead Mentor & Strategist</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium">
                    Google AdWords Certified Digital Marketing Expert. Connect directly with years of professional agency strategy and learn how to optimize campaigns, design web frameworks, and launch systems.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-orange-500 hover:shadow-md transition-all group cursor-pointer">
                  <span className="block text-slate-500 text-xs uppercase font-bold tracking-wider mb-2">Direct Call Support</span>
                  <a href="tel:+919888484310" className="text-xl sm:text-xl font-black text-slate-900 group-hover:text-orange-600 transition-colors">+91-98884-84310</a>
                </div>
                <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-rose-500 hover:shadow-md transition-all group cursor-pointer">
                  <span className="block text-slate-500 text-xs uppercase font-bold tracking-wider mb-2">Email Admissions</span>
                  <a href="mailto:anujguptaflymedia@gmail.com" className="text-base sm:text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors truncate block">anujguptaflymedia@gmail.com</a>
                </div>
              </div>
            </div>

            {/* Premium CTA Form */}
            <div className="relative">
              {/* Form glowing shadow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-rose-500/10 blur-3xl rounded-[3rem] -z-10" />

              <div className="bg-white border border-slate-100 p-8 sm:p-12 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                {/* Shine effect */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none" />

                <div className="relative z-10 space-y-8">
                  <div className="space-y-3">
                    <h3 className="text-3xl sm:text-4xl font-black text-slate-900">Request Callback</h3>
                    <p className="text-slate-500 font-medium text-sm sm:text-base">Secure your spot. Fill in the details and our advisor will connect regarding timings & fee structures.</p>
                  </div>
                  <CallbackForm />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-slate-50 relative overflow-hidden border-t border-slate-100">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">What Our Students Say</h2>
              <p className="text-lg text-slate-600 font-medium">Join thousands of successful graduates who have transformed their careers with our premium bootcamps.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className="flex gap-1 text-orange-400 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed font-medium mb-8">
                  "The Full Stack Developer bootcamp completely changed my career trajectory. The direct mentorship from industry experts gave me the confidence to land my dream job within weeks of graduating."
                </p>
                <div className="flex items-center gap-4">
                  <img src="https://i.pravatar.cc/100?img=68" alt="Sarah Jenkins" className="w-12 h-12 rounded-full border-2 border-slate-100" />
                  <div>
                    <h4 className="font-extrabold text-slate-900">Sarah Jenkins</h4>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Frontend Engineer</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className="flex gap-1 text-orange-400 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed font-medium mb-8">
                  "I was blown away by the depth of the Digital Marketing curriculum. We didn't just learn theory; we actually ran live campaigns. Highly recommended for anyone serious about marketing."
                </p>
                <div className="flex items-center gap-4">
                  <img src="https://i.pravatar.cc/100?img=11" alt="Michael Chen" className="w-12 h-12 rounded-full border-2 border-slate-100" />
                  <div>
                    <h4 className="font-extrabold text-slate-900">Michael Chen</h4>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Growth Lead</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className="flex gap-1 text-orange-400 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed font-medium mb-8">
                  &quot;The tools are unparalleled. Everything you need to learn and build real-world applications in one seamless program. It&apos;s truly the best investment I&apos;ve made in my education.&quot;
                </p>
                <div className="flex items-center gap-4">
                  <img src="https://i.pravatar.cc/100?img=32" alt="Emily Davis" className="w-12 h-12 rounded-full border-2 border-slate-100" />
                  <div>
                    <h4 className="font-extrabold text-slate-900">Emily Davis</h4>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Product Manager</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
