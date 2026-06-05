import { Suspense } from 'react';
import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col bg-white">
        <div className="flex-1 flex flex-row-reverse bg-white min-h-[calc(100vh-80px)]">
          {/* Form Section */}
          <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 relative z-10">
            <div className="mx-auto w-full max-w-sm lg:w-[400px]">
              <Suspense fallback={<div className="mt-8 text-slate-500 text-sm">Loading...</div>}>
                <LoginForm />
              </Suspense>
            </div>
          </div>

          {/* Visuals Panel */}
          <div className="hidden lg:block relative w-0 flex-1 overflow-hidden bg-slate-900">
            <img
              className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay scale-105 hover:scale-100 transition-transform duration-[10s] ease-out"
              src="./graphic_design_bg.png"
              alt="Student learning online"
            />
            <div 
              className="absolute inset-0 opacity-80 mix-blend-multiply" 
            style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }} 
            />
            <div 
              className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" 
              style={{ backgroundColor: '#1e3a8a' }} 
            />
            
            <div className="absolute inset-0 flex flex-col justify-center p-16 lg:p-24 pb-20">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold tracking-wider uppercase mb-6 animate-pulse">
                  Learn. Grow. Succeed.
                </div>

                <h3 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
                  Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-600">Flymedia Technology</span>
                </h3>

                <p className="text-lg lg:text-xl text-white font-medium leading-relaxed max-w-xl mb-4">
                  Empower your skills, accelerate your career, and stay ahead in the digital world.
                </p>

                <p className="text-sm lg:text-base text-slate-300 leading-relaxed max-w-xl mb-8">
                  Access industry-focused courses, practical training modules, expert-led sessions, and valuable learning resources designed to help you grow professionally.
                </p>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    What You'll Get
                  </h4>
                  <div className="grid grid-cols-2 gap-3 max-w-xl">
                    {[
                      "Interactive Learning Experience",
                      "Expert-Led Training Programs",
                      "Real-World Projects & Assignments",
                      "Progress Tracking & Certifications",
                      "24/7 Access to Learning Resources"
                    ].map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-3 text-white text-sm font-medium bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3.5 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                      >
                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span>{item}</span>
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
