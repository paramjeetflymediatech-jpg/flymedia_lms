import { Metadata } from 'next';
import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import AppDownloadButtons from '../../src/components/common/AppDownloadButtons';
import { APP_LINKS } from '../../src/constants/appLinks';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Download Flymedia LMS Mobile App | Android & iOS',
  description: 'Download the official Flymedia LMS app for Android (Google Play) and iOS (Apple App Store). Access live classes, ₹99 demo bookings, certificates, and student tools anywhere.',
};

export default function DownloadAppPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-white">
      <Header />
      <main className="flex-1 relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        {/* Glow ambient background lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#E60870]/25 via-[#F8750E]/20 to-transparent rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-bold text-slate-300">
              Official Mobile App Available
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              Learn Anywhere with the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E60870] via-[#E63747] to-[#F8750E]">
                Flymedia LMS App
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
              Book ₹99 live demo classes, attend interactive lectures, submit real-world project assignments, and access verified industry certificates right from your phone.
            </p>
          </div>

          {/* Store & Direct Download Buttons */}
          <div className="flex flex-col items-center justify-center pt-2">
            <AppDownloadButtons variant="default" showDirectApk={true} />
            <p className="text-xs text-slate-400 mt-4">
              Compatible with Android 8.0+ and iOS 14.0+ • Free Direct APK & Store Download
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid sm:grid-cols-3 gap-5 pt-8 text-left">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-2xl mb-4">
                ⚡
              </div>
              <h2 className="text-lg font-bold text-white mb-1">₹99 Demo Booking</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Book trial sessions instantly with industry mentors or unlock free demos via referrals.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 text-2xl mb-4">
                📱
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Live Classes & Q&A</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Join video lectures, chat live with tutors, and access recorded revision archives on-demand.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-2xl mb-4">
                🎓
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Verified Credentials</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Download your ISO-certified course certificates directly to your smartphone wallet.
              </p>
            </div>
          </div>

          {/* Quick links & Back to home */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition-colors underline-offset-4 hover:underline">
              ← Back to Homepage
            </Link>
            <span>•</span>
            <Link href="/packages" className="hover:text-white transition-colors underline-offset-4 hover:underline">
              Explore Programs
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-white transition-colors underline-offset-4 hover:underline">
              Contact Support
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
