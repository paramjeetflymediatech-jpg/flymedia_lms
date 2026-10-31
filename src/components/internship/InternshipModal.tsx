'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function InternshipModal() {
  const pathname = usePathname();
  const [showPrompt, setShowPrompt] = useState(false);

  // Do not show on admin, auth, or the internship form page itself
  const isHiddenRoute =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/reset-password') ||
    pathname?.startsWith('/forgot-password') ||
    pathname === '/internship-form';

  useEffect(() => {
    if (isHiddenRoute) return;

    // Check if dismissed or already submitted
    const timer = setTimeout(() => {
      try {
        const submitted = localStorage.getItem('flymedia_internship_submitted');
        const dismissed = sessionStorage.getItem('flymedia_internship_prompt_dismissed');
        if (!submitted && !dismissed) {
          setShowPrompt(true);
        }
      } catch (e) {
        console.warn('Storage check error:', e);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isHiddenRoute, pathname]);

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      sessionStorage.setItem('flymedia_internship_prompt_dismissed', 'true');
    } catch {}
  };

  if (isHiddenRoute) {
    return null;
  }

  return (
    <>
      {/* ================= PERSISTENT FLOATING CORNER PILL ================= */}
      {/* Visible across the site so students can open the new form page at any time */}
      <div className="fixed bottom-5 left-4 sm:left-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link
          href="/internship-form"
          className="flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 rounded-full bg-slate-900/95 hover:bg-slate-900 text-white border border-rose-500/40 shadow-2xl shadow-rose-950/40 hover:scale-105 active:scale-95 transition-all backdrop-blur-md group"
          aria-label="Open Internship Application Form Page"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
          </span>
          <div className="text-left">
            <span className="block text-xs font-black tracking-tight text-white group-hover:text-rose-400 transition-colors">
              🎓 Internship Form
            </span>
            <span className="hidden sm:block text-[10px] font-bold text-slate-400">
              Live Client Batches 2025-26
            </span>
          </div>
          <span className="text-xs text-rose-400 font-black group-hover:translate-x-0.5 transition-transform">
            &rarr;
          </span>
        </Link>
      </div>

      {/* ================= VISITOR PROMPT NOTIFICATION (BOTTOM-RIGHT SLIDE-UP) ================= */}
      {showPrompt && (
        <div className="fixed bottom-5 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-5 duration-300">
          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #881337 100%)',
            }}
            className="p-4 sm:p-5 rounded-3xl text-white shadow-2xl border border-rose-500/30 relative overflow-hidden"
          >
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Dismiss banner"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-start gap-3.5 pr-6">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center text-xl shrink-0">
                🎓
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/30 text-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  <span>Admissions Open</span>
                </div>
                <h4 className="text-sm font-black text-white tracking-tight leading-snug">
                  Apply for Internship Program
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  45 Days / 6 Months live client project training with ISO &amp; MSME certification &amp; placement help.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                onClick={handleDismiss}
                className="text-xs text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer"
              >
                Maybe Later
              </button>

              <Link
                href="/internship-form"
                onClick={handleDismiss}
                style={{
                  background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)',
                }}
                className="px-4 py-2 rounded-xl text-xs font-black text-white shadow-md shadow-rose-950/40 hover:opacity-95 transition-all flex items-center gap-1.5"
              >
                <span>Fill Form</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
