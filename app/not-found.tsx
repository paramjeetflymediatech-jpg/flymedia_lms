import Link from 'next/link';
import Header from '../src/components/layout/Header';
import Footer from '../src/components/layout/Footer';

export default function GlobalNotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 min-h-[80vh] flex items-center justify-center bg-slate-50 relative overflow-hidden pt-20">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] pointer-events-none" />

        <div className="max-w-2xl mx-auto px-4 relative z-10 text-center space-y-10">
          
          <div className="space-y-4">
            <h1 className="text-8xl sm:text-[10rem] font-black bg-gradient-to-br from-orange-500 to-rose-500 bg-clip-text text-transparent drop-shadow-sm leading-none tracking-tighter">
              404
            </h1>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Page Not Found
            </h2>
            <p className="text-slate-500 text-lg sm:text-xl font-medium max-w-lg mx-auto leading-relaxed">
              We couldn't find the page you're looking for. The course might have been moved, or the link may be broken.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link 
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 font-black text-white bg-slate-900 hover:bg-slate-800 rounded-2xl transition-all shadow-xl shadow-slate-900/20 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Homepage
              </span>
            </Link>
            
            <Link 
              href="/packages"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 font-black text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-all shadow-sm group"
            >
              Browse All Courses
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
