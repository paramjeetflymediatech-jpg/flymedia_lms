import Link from 'next/link';
import Header from '../src/components/layout/Header';
import Footer from '../src/components/layout/Footer';
import HeroSlider from '../src/components/home/HeroSlider';
import CallbackForm from '../src/components/home/CallbackForm';
import { Course } from '../src/db/models';

export const revalidate = 0; // Dynamic rendering to fetch courses

export default async function HomePage() {
  let courses: Course[] = [];
  try {
    courses = await Course.findAll({ limit: 4 });
  } catch (error) {
    console.error('Failed to load courses for homepage:', error);
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
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-end justify-between mb-12">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-500">Training Modules</span>
                <h2 className="text-3xl font-bold text-slate-900">Courses We Offer</h2>
              </div>
              <Link href="/courses" className="mt-4 sm:mt-0 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                View all training tracks →
              </Link>
            </div>

            {courses.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-3xl border border-slate-100">
                <p className="text-slate-500 mb-4">No courses available. Database seed needed.</p>
                <code className="text-xs px-2.5 py-1.5 rounded bg-slate-100 font-mono text-slate-600">npm run db:sync</code>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {courses.map((course) => (
                  <div key={course.id} className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                    {course.thumbnail && (
                      <div className="h-44 overflow-hidden relative bg-slate-100">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-1 rounded-full bg-slate-950/80 text-white backdrop-blur uppercase">
                          {course.level}
                        </span>
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-slate-600 text-xs line-clamp-3">
                          {course.description}
                        </p>
                      </div>
                      <div className="mt-5 pt-4 border-t border-slate-55 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">
                          ⏱️ {course.duration ? Math.round(course.duration / 60) : 30} hrs
                        </span>
                        <Link
                          href={`/courses/${course.slug}`}
                          className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-all"
                        >
                          View Syllabus
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
                      <div className="h-full w-full bg-white rounded-full flex items-center justify-center font-black text-lg text-slate-900">AG</div>
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

        {/* Global Locations Map Links */}
        <section className="py-24 bg-white relative overflow-hidden border-t border-slate-100">
          {/* Subtle World Map / Pattern Background */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] pointer-events-none" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Our Training Offices</h2>
              <p className="text-lg text-slate-600 font-medium">Learn from anywhere in the world. Visit us at our global headquarters or regional centers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* India */}
              <div className="group relative p-8 rounded-[2.5rem] bg-slate-50 border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 overflow-hidden hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 space-y-5">
                  <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                    🇮🇳
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xl mb-2">India Headquarters</h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                      Plot no, 20, Vishal Nagar Ext, Vishal Nagar, Ludhiana, Punjab 141001
                    </p>
                  </div>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 text-sm font-bold text-orange-600 group-hover:text-orange-500 transition-colors mt-4"
                  >
                    <span>View on Map</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </a>
                </div>
              </div>

              {/* Australia */}
              <div className="group relative p-8 rounded-[2.5rem] bg-slate-50 border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 space-y-5">
                  <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                    🇦🇺
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xl mb-2">Australia Office</h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                      35 Edgewood Dr, Stanhope Gardens NSW 2768, Australia
                    </p>
                  </div>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 text-sm font-bold text-blue-600 group-hover:text-blue-500 transition-colors mt-4"
                  >
                    <span>View on Map</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </a>
                </div>
              </div>

              {/* Canada */}
              <div className="group relative p-8 rounded-[2.5rem] bg-slate-50 border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-500 overflow-hidden hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 space-y-5">
                  <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                    🇨🇦
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xl mb-2">Canada Office</h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                      7664 126a St, Surrey, BC V3W 4A9, Canada
                    </p>
                  </div>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 text-sm font-bold text-rose-600 group-hover:text-rose-500 transition-colors mt-4"
                  >
                    <span>View on Map</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </a>
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
