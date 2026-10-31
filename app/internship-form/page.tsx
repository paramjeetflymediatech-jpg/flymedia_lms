import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import { Metadata } from 'next';
import { getSeoMetadata } from '../../src/lib/seo';
import PageSeoScripts from '../../src/components/common/PageSeoScripts';
import DedicatedInternshipForm from './DedicatedInternshipForm';
import Link from 'next/link';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/internship-form', {
    title: 'Apply for Internship Program 2025-2026 | Flymedia Technology',
    description:
      'Submit your application for 45 Days, 6 Weeks, 3 Months & 6 Months Live Client Project Internship at Flymedia Technology. Certified training with 100% placement support.',
  });
}

export default function InternshipFormPage() {
  return (
    <>
      <PageSeoScripts path="/internship-form" />
      <Header />

      <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden py-10 sm:py-16">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-rose-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-orange-600/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb / Back Link */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors"
            >
              <span>&larr;</span>
              <span>Back to Home</span>
            </Link>

            <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Admissions Helpline:</span>
              <a href="tel:+919779324178" className="text-orange-400 hover:underline font-extrabold">
                +91-97793-24178
              </a>
            </div>
          </div>

          {/* Page Heading & Trust Banner */}
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 mb-3 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span>2026 - 2027 Batch Admissions Open</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight mb-3">
              Internship Application Form
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Fill out your details below to secure your seat for 45 Days, 6 Weeks or 6 Months Live Client Project Training at Flymedia Technology.
            </p>

            {/* Quick Value Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 text-center text-xs font-bold text-slate-200">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                🚀 Live Client Code
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                📜 MSME &amp; ISO Letter
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                💼 100% Placement Help
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                🏫 Campus &amp; Online
              </div>
            </div>
          </div>

          {/* Dedicated Responsive Form Card */}
          <div className="bg-white text-slate-900 rounded-3xl shadow-2xl p-5 sm:p-8 lg:p-10 border border-slate-200">
            <DedicatedInternshipForm />
          </div>

          {/* Help & Support Note */}
          <div className="mt-8 text-center text-xs text-slate-400 space-y-1">
            <p>Need help or facing any difficulty while filling the form?</p>
            <p>
              WhatsApp our counselor at{' '}
              <a
                href="https://wa.me/919779324178?text=Hello%20Flymedia,%20I%20have%20a%20question%20about%20the%20Internship%20Program."
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 font-bold hover:underline"
              >
                +91-97793-24178
              </a>{' '}
              or email us at{' '}
              <a href="mailto:learnwithflymedia@gmail.com" className="text-orange-400 font-bold hover:underline">
                learnwithflymedia@gmail.com
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

