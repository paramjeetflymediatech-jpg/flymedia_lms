import React from 'react';
import ContactForm from './ContactForm';

interface ContactSectionProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  initialCourse?: string;
  sourceContext?: string;
  buttonText?: string;
  className?: string;
}

export default function ContactSection({
  badge = 'ADMISSIONS & ₹99 DEMO CLASS',
  title = 'Have Questions? Speak with our Career Advisors',
  subtitle = 'Need help selecting the right training program or understanding batch schedules, curriculum, and placement assistance? Get in touch with our team today.',
  initialCourse,
  sourceContext,
  buttonText = 'Submit Your Inquiry',
  className = '',
}: ContactSectionProps) {
  return (
    <section className={`relative overflow-hidden py-16 sm:py-20 ${className}`}>
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-orange-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-12 lg:p-16 text-white shadow-2xl shadow-slate-950/20 border border-slate-800 relative overflow-hidden">
          {/* Subtle inner grid pattern & light accents */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-orange-500/20 to-rose-500/20 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-500/10 to-orange-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center relative z-10">
            {/* Left Column: Context, Value Props & Direct Contact Info */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-orange-400 text-xs font-black tracking-widest uppercase backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  {badge}
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
                  {title}
                </h2>
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
                  {subtitle}
                </p>
              </div>

              {/* Value Proposition Highlights */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-orange-500/20">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Personalized Guidance</h4>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mt-0.5">Custom roadmap matching your background & career ambitions.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-orange-500/20">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Real-World Projects & Placement</h4>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mt-0.5">Live capstone development, portfolio reviews, and interview prep.</p>
                  </div>
                </div>
              </div>

              {/* Quick Contact Info */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row lg:flex-col gap-4">
                <a
                  href="tel:+919779324178"
                  className="flex items-center gap-3.5 group text-slate-300 hover:text-white transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-lg group-hover:scale-105 group-hover:bg-orange-500 transition-all">
                    📞
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Direct Call</p>
                    <p className="font-bold text-sm text-white group-hover:text-orange-400 transition-colors">+91-97793-24178</p>
                  </div>
                </a>

                <a
                  href="mailto:learnwithflymedia@gmail.com"
                  className="flex items-center gap-3.5 group text-slate-300 hover:text-white transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-lg group-hover:scale-105 group-hover:bg-orange-500 transition-all">
                    ✉️
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Us</p>
                    <p className="font-bold text-sm text-white group-hover:text-orange-400 transition-colors">learnwithflymedia@gmail.com</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Right Column: Contact Form Card */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl text-slate-900 border border-slate-100 relative">
                <div className="mb-6 space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Quick Consultation Form
                  </h3>
                  <p className="text-slate-500 text-sm font-medium">
                    Leave your details below and an admissions counselor will reach out to you within 24 hours.
                  </p>
                </div>

                <ContactForm
                  initialCourse={initialCourse}
                  sourceContext={sourceContext}
                  buttonText={buttonText}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
