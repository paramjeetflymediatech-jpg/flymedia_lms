import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import TutorApplicationForm from './TutorApplicationForm';

export const metadata = {
  title: 'Become a Tutor | Flymedia Technology',
  description: 'Apply to join our elite team of instructors.',
};

export default function BecomeTutorPage() {
  return (
    <>
      <Header />
      <main className="bg-white relative overflow-hidden">
        {/* Hero Section (Split Layout) */}
        <section className="relative pt-36 pb-20 lg:pt-10 lg:pb-28 overflow-hidden bg-slate-950 lg:min-h-screen flex items-center">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-600 rounded-full mix-blend-multiply filter blur-[150px] opacity-40 pointer-events-none" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-orange-600 rounded-full mix-blend-multiply filter blur-[150px] opacity-30 pointer-events-none" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.1] pointer-events-none invert" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              {/* Left Column: Text */}
              <div className="text-center lg:text-left">
                <h1 className="text-5xl md:text-6xl xl:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
                  Inspire the Next Generation of <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">Tech Leaders</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-400 font-medium mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Join Flymedia Technology's elite network of educators. Share your expertise, mentor ambitious students, and enjoy unparalleled flexibility and compensation.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  <a href="#process" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold text-white transition-all rounded-full shadow-lg shadow-orange-500/25 hover:-translate-y-1 hover:shadow-orange-500/40" style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}>
                    How it works
                  </a>
                  <a href="#benefits" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all rounded-full backdrop-blur-md">
                    Why teach with us?
                  </a>
                </div>
              </div>

              {/* Right Column: Form Card */}
              <div id="apply" className="w-full max-w-lg mx-auto lg:ml-auto lg:mr-0">
                <div className="bg-white rounded-[2rem] shadow-2xl p-6 sm:p-7 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5" style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }} />
                  
                  <div className="text-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">
                      Ready to define the future?
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">
                      Submit your application today.
                    </p>
                  </div>

                  <TutorApplicationForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Teach With Us */}
        <section id="benefits" className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Why Teach with Us?</h2>
              <p className="text-lg text-slate-600 font-medium">We provide our instructors with the best tools, competitive compensation, and a global audience.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-2xl mb-6">
                  🌎
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Global Reach</h3>
                <p className="text-slate-600 font-medium leading-relaxed">Connect with thousands of eager students worldwide. Expand your personal brand and impact on a global scale.</p>
              </div>
              
              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-2xl mb-6">
                  💸
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Top-Tier Compensation</h3>
                <p className="text-slate-600 font-medium leading-relaxed">Earn what you're truly worth. We offer highly competitive hourly rates and performance bonuses.</p>
              </div>

              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6">
                  ⚡
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">State-of-the-Art Tools</h3>
                <p className="text-slate-600 font-medium leading-relaxed">Say goodbye to administrative headaches. Use our modern LMS dashboard to easily manage your batches and curriculum.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Simple Hiring Process */}
        <section id="process" className="py-24 bg-slate-50 border-t border-slate-100 overflow-hidden relative">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Simple Hiring Process</h2>
              <p className="text-lg text-slate-600 font-medium">We've streamlined our onboarding so you can start teaching faster.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
              {/* Step 1 */}
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 relative group overflow-hidden hover:-translate-y-1">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 group-hover:bg-orange-500 transition-colors duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 font-black text-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner">
                  1
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Submit Application</h4>
                <p className="text-slate-600 font-medium text-sm leading-relaxed">Fill out the form above with your details, expertise, and teaching experience.</p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 relative group overflow-hidden hover:-translate-y-1">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 group-hover:bg-rose-500 transition-colors duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 font-black text-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner">
                  2
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Video Interview</h4>
                <p className="text-slate-600 font-medium text-sm leading-relaxed">A brief, casual conversation with our recruitment leads to discuss your goals.</p>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 relative group overflow-hidden hover:-translate-y-1">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 group-hover:bg-orange-500 transition-colors duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 font-black text-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner">
                  3
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Demo Session</h4>
                <p className="text-slate-600 font-medium text-sm leading-relaxed">Showcase your teaching style and knowledge in a short 15-minute live demo.</p>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 relative group overflow-hidden hover:-translate-y-1">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 group-hover:bg-rose-500 transition-colors duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 font-black text-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner">
                  4
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Onboarding</h4>
                <p className="text-slate-600 font-medium text-sm leading-relaxed">Get trained on our proprietary LMS platform and start taking batches!</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
