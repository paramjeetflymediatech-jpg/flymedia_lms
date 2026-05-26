import Link from 'next/link';
import Header from '../src/components/layout/Header';
import Footer from '../src/components/layout/Footer';
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
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-28 bg-slate-900 text-white">
          {/* Subtle background glow mapping the brand orange */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-tr from-amber-500/20 to-orange-600/10 blur-3xl -z-10 rounded-full" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-orange-400">
              <span>🚀 Summer Training 2026 Admissions Open</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-none text-white">
              Summer Training 2026 at <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">Flymedia Technology</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Kickstart your career with practical industry training from a leading digital marketing agency. Join our comprehensive program and get job-ready in 30 days!
            </p>

            {/* Quick specifications highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4 text-xs font-semibold text-slate-300">
              <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl">
                <span className="block text-orange-400 text-base mb-1">⏱️ Duration</span>
                30 Days Program
              </div>
              <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl">
                <span className="block text-orange-400 text-base mb-1">💻 Learning Mode</span>
                Online & Offline Both
              </div>
              <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl">
                <span className="block text-orange-400 text-base mb-1">📍 Location</span>
                Ludhiana Center
              </div>
              <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl">
                <span className="block text-orange-400 text-base mb-1">🕒 Timings</span>
                2 Hrs Daily | 5 Days/Wk
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/courses"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-[#ff9900] hover:bg-[#e08800] rounded-2xl shadow-lg shadow-orange-500/20 transition-all text-base"
              >
                Explore Courses Offered
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 font-bold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-base"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </section>

        {/* Training Benefits Section */}
        <section className="py-20 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-500">Program Benefits</span>
              <h2 className="text-3xl font-bold text-slate-900">Why Train with Flymedia Technology?</h2>
              <p className="text-slate-600">Get equipped with practical, live project execution experience built for software developers & digital marketers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Benefit 1 */}
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-4 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-orange-100/80 flex items-center justify-center text-orange-600 font-bold text-xl">
                  🚀
                </div>
                <h3 className="text-lg font-bold text-slate-900">Live Projects</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Gain practical knowledge working on actual client campaigns and production server projects.
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-4 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-orange-100/80 flex items-center justify-center text-orange-600 font-bold text-xl">
                  💻
                </div>
                <h3 className="text-lg font-bold text-slate-900">Hands-on Experience</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Write dynamic scripts, design graphical UI/UX assets, or manage SEO parameters directly under expert review.
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-4 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-orange-100/80 flex items-center justify-center text-orange-600 font-bold text-xl">
                  🌐
                </div>
                <h3 className="text-lg font-bold text-slate-900">Industry Exposure</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Observe how a leading IT and Digital Marketing agency structures sprint schedules, deliverables, and ROI strategies.
                </p>
              </div>

              {/* Benefit 4 */}
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-4 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-orange-100/80 flex items-center justify-center text-orange-600 font-bold text-xl">
                  🎓
                </div>
                <h3 className="text-lg font-bold text-slate-900">Verified Certificate</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Graduate with a professional training completion certificate valid for recruitment in leading IT corporations.
                </p>
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
        <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 blur-3xl -z-10 rounded-full" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Mentor info */}
            <div className="space-y-6">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Learn From The Best</span>
              <h2 className="text-4xl font-extrabold text-white">Transform Your Career in 30 Days</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Our summer bootcamp is mentored directly by **Anuj Gupta**, Google AdWords Certified Digital Marketing Expert. Connect directly with years of professional agency strategy and learn how to optimize campaigns, design web frameworks, and launch systems.
              </p>
              
              <div className="pt-4 border-t border-white/10 space-y-3 text-sm text-slate-300">
                <div className="flex items-center space-x-2">
                  <span className="text-orange-400 font-bold">📞 Call Support:</span>
                  <a href="tel:+919888484310" className="hover:underline text-white font-semibold">+91-98884-84310</a>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-orange-400 font-bold">✉️ Email Admissions:</span>
                  <a href="mailto:anujguptaflymedia@gmail.com" className="hover:underline text-white font-semibold">anujguptaflymedia@gmail.com</a>
                </div>
              </div>
            </div>

            {/* Quick Apply panel */}
            <div className="bg-white/5 border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl space-y-6">
              <h3 className="text-xl font-bold text-white">Request Course Callback</h3>
              <p className="text-xs text-slate-400">Fill in details and our advisor will reach back regarding timing & fee structure.</p>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Phone Number (e.g. +91 98884-84310)"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                />
                <select
                  required
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                >
                  <option value="">Select Training Course</option>
                  <option value="digital-marketing">Digital Marketing</option>
                  <option value="web-development">Web Development</option>
                  <option value="video-editing">Video Editing</option>
                  <option value="graphic-designing">Graphic Designing</option>
                </select>
                <button
                  type="button"
                  className="w-full py-3 bg-[#ff9900] hover:bg-[#e08800] rounded-xl text-white text-xs font-bold transition-all shadow shadow-orange-500/10"
                >
                  Submit Inquiry callback
                </button>
              </form>
            </div>
            
          </div>
        </section>

        {/* Global Locations Map Links */}
        <section className="py-20 bg-slate-50 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Global Footprint</span>
              <h2 className="text-3xl font-bold text-slate-900">Our Training Offices</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* India */}
              <div className="p-6 bg-white border border-slate-150 rounded-2xl shadow-sm space-y-3">
                <span className="text-xl">🇮🇳</span>
                <h4 className="font-extrabold text-slate-900 text-sm">India Headquarters</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Plot no, 20, Vishal Nagar Ext, Vishal Nagar, Ludhiana, Punjab 141001
                </p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-orange-600 font-bold hover:underline inline-block mt-2"
                >
                  View on Map →
                </a>
              </div>

              {/* Australia */}
              <div className="p-6 bg-white border border-slate-150 rounded-2xl shadow-sm space-y-3">
                <span className="text-xl">🇦🇺</span>
                <h4 className="font-extrabold text-slate-900 text-sm">Australia Office</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  35 Edgewood Dr, Stanhope Gardens NSW 2768, Australia
                </p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-orange-600 font-bold hover:underline inline-block mt-2"
                >
                  View on Map →
                </a>
              </div>

              {/* Canada */}
              <div className="p-6 bg-white border border-slate-150 rounded-2xl shadow-sm space-y-3">
                <span className="text-xl">🇨🇦</span>
                <h4 className="font-extrabold text-slate-900 text-sm">Canada Office</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  7664 126a St, Surrey, BC V3W 4A9, Canada
                </p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-orange-600 font-bold hover:underline inline-block mt-2"
                >
                  View on Map →
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
