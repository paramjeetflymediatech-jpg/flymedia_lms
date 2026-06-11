import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';

export const metadata = {
  title: 'About Us | Flymedia Technology Summer Training',
  description: 'Learn about Flymedia Technology, our 14+ years of industry excellence in digital marketing, web designing, and our 30-day summer bootcamps.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white pt-10 pb-32 relative overflow-hidden">
        {/* Subtle Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-gradient-to-b from-orange-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-24">
          {/* Header Section */}
          <div className="text-center max-w-4xl mx-auto space-y-6 pt-12">
            <h1 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
              14+ Years of <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">Excellence</span>
            </h1>
            <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Flymedia Technology is a leading IT development and digital marketing agency delivering globally recognized results since 2012.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-5xl mx-auto">
            {[
              { label: 'Years Experience', value: '14+' },
              { label: 'Global Offices', value: '3' },
              { label: 'Live Projects', value: '100%' },
              { label: 'Job Placement', value: 'Focus' }
            ].map((stat, i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl sm:text-5xl font-black text-slate-900 mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Bento Grid Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Massive Image Block */}
            <div className="md:col-span-8 rounded-[3rem] overflow-hidden relative shadow-2xl shadow-slate-200/50 group h-[400px] sm:h-[500px]">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                alt="Flymedia Technology team collaboration"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80" />
              <div className="absolute bottom-0 left-0 p-8 sm:p-12 w-full">
                <div className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider mb-4">
                  Summer Bootcamp 2026
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white max-w-xl leading-tight">
                  Bridging the gap between academic theory and industry reality.
                </h2>
              </div>
            </div>

            {/* Practical Approach Card */}
            <div className="md:col-span-4 rounded-[3rem] bg-slate-950 p-8 sm:p-10 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500 shadow-xl shadow-slate-900/10 flex flex-col justify-between h-[400px] sm:h-[500px]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 blur-[80px] rounded-full group-hover:bg-orange-500/30 transition-colors duration-500" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center text-orange-400 mb-8">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">100% Practical</h3>
                <p className="text-slate-400 leading-relaxed">
                  We believe standard software courses are too passive. Our bootcamp is structured around daily 2-hour sessions of pure live project training. You will work on actual client campaigns and production server projects.
                </p>
              </div>
            </div>

            {/* Global Exposure Card */}
            <div className="md:col-span-4 rounded-[3rem] bg-orange-50 border border-orange-100 p-8 sm:p-10 hover:-translate-y-2 transition-transform duration-500 shadow-sm hover:shadow-xl">
              <div className="w-16 h-16 rounded-3xl bg-white border border-orange-200 shadow-sm flex items-center justify-center text-orange-500 mb-8">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Global Exposure</h3>
              <p className="text-slate-600 leading-relaxed">
                With footprints spanning India, Australia, and Canada, we offer students deep insights into cross-border agency strategies, digital market optimization, and modern web architectures.
              </p>
            </div>

            {/* Lead Trainer Card */}
            <div className="md:col-span-8 rounded-[3rem] bg-white border border-slate-200 p-8 sm:p-10 hover:-translate-y-2 transition-transform duration-500 shadow-sm hover:shadow-xl relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-rose-50/50 to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-8">
                <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-[2rem] bg-gradient-to-tr from-orange-500 to-rose-500 p-[3px] shadow-lg shadow-orange-500/20">
                  <img src="/Anujgupta.png" alt="Anuj Gupta" className="w-full h-full object-cover rounded-[1.8rem] bg-white" />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900">Anuj Gupta</h3>
                    <p className="text-orange-600 font-bold uppercase tracking-wider text-xs mt-1">Google AdWords Certified Expert</p>
                  </div>
                  <p className="text-slate-600 leading-relaxed max-w-xl">
                    Learn search engine marketing (SEM), SEO, payment gateway integrations, and robust web architectures from an active practitioner who directly manages hundreds of international business campaigns.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
