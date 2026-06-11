import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import RegisterForm from './RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col bg-white">
        <div className="flex-1 flex flex-row-reverse bg-white min-h-[calc(100vh-80px)]">
          {/* Form Section */}
          <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 relative z-10">
            <div className="mx-auto w-full max-w-sm lg:w-[400px]">
              <RegisterForm />
            </div>
          </div>

          {/* Visuals Section */}
          <div className="hidden lg:block relative w-0 flex-1 overflow-hidden bg-slate-900">
            <img
              className="absolute inset-0 h-full w-full object-cover opacity-70 mix-blend-overlay scale-105 hover:scale-100 transition-transform duration-[10s] ease-out"
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2670&auto=format&fit=crop"
              alt="Students studying"
            />
            <div 
              className="absolute inset-0 opacity-80 mix-blend-multiply" 
              style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }} 
            />

            {/* Abstract decorative elements */}
            <div 
              className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" 
              style={{ backgroundColor: '#E60870' }} 
            />
            <div 
              className="absolute bottom-[-10%] left-[-5%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40" 
              style={{ backgroundColor: '#F8750E' }} 
            />

            <div className="absolute inset-0 flex flex-col justify-center p-16 lg:p-24 pb-20">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-wider uppercase mb-6 animate-pulse">
                  Unlock Your Potential
                </div>

               
                <h3 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
                Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-600">Learning Journey Today</span>
                </h3>

                <p className="text-base text-white font-medium leading-relaxed max-w-xl mb-4">
                  Join SocialFly LMS and gain access to industry-focused courses, practical training, and expert guidance designed to help you succeed in the digital age.
                </p>

                <p className="text-sm text-slate-200 leading-relaxed max-w-xl mb-4">
                  Whether you&apos;re a student, freelancer, entrepreneur, or working professional, our platform provides the knowledge and skills you need to grow with confidence.
                </p>

                <p className="text-xs text-slate-300 leading-relaxed max-w-xl mb-8">
                  Thousands of learners are upgrading their skills and advancing their careers through structured, practical, and results-driven learning experiences.
                </p>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-200">
                    Why Join SocialFly LMS?
                  </h4>
                  <div className="grid grid-cols-2 gap-3 max-w-xl">
                    {[
                      "Access Premium Learning Resources",
                      "Learn from Industry Experts",
                      "Build Real-World Skills & Experience",
                      "Track Your Progress & Achievements",
                      "Earn Certificates & Showcase Your Expertise",
                      "Learn Anytime, Anywhere"
                    ].map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-3 text-white text-xs font-medium bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                      >
                        <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
