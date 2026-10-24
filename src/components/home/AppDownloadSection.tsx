import React from 'react';
import AppDownloadButtons from '../common/AppDownloadButtons';
import Link from 'next/link';

export default function AppDownloadSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-black text-white relative overflow-hidden border-t border-b border-slate-800">
      {/* Decorative Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.04] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-black border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden">
          {/* Subtle Accent Edge */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>Flymedia Mobile App (iOS & Android)</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                Learn On The Go,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-orange-400">
                  Anytime, Anywhere
                </span>
              </h2>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
                Experience seamless 1-on-1 practical tech training directly from your phone. Attend live mentor classes, manage your projects, track live attendance, and refer friends to unlock 100% free demo passes.
              </p>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 pb-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Live Classes & Mentors</h4>
                    <p className="text-xs text-slate-400">Connect 1-on-1 with industry practitioners</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">₹99 Demo Class Booking</h4>
                    <p className="text-xs text-slate-400">Instant PhonePe checkout & slot confirmation</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V4a2 2 0 10-2 2h2m0 13a2 2 0 100-4 2 2 0 000 4zm0 0a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Refer & Earn Free Classes</h4>
                    <p className="text-xs text-slate-400">Invite friends & get 100% free demo passes</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Certificates & Progress</h4>
                    <p className="text-xs text-slate-400">Track attendance & download verified certificates</p>
                  </div>
                </div>
              </div>

              {/* STORE DOWNLOAD BUTTONS */}
              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <AppDownloadButtons variant="default" showDirectApk={true} />
                <div className="text-xs text-slate-400 font-medium sm:border-l sm:border-slate-800 sm:pl-4">
                  <span>Free download</span>
                  <span className="mx-1.5">•</span>
                  <span>Rated 4.9 ★ by 1,200+ students</span>
                </div>
              </div>
            </div>

            {/* Right Visual / App Showcase Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm">
                {/* Glowing backdrop circle */}
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-600/30 via-orange-600/20 to-transparent rounded-3xl filter blur-2xl transform scale-95" />

                {/* Device Frame */}
                <div className="relative bg-slate-900 border-2 border-slate-700 rounded-[2.5rem] p-4 shadow-2xl overflow-hidden">
                  {/* Speaker notch */}
                  <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-3" />

                  {/* App Screen Content Preview */}
                  <div className="bg-slate-950 rounded-[2rem] p-5 border border-slate-800/80 space-y-4">
                    {/* Header bar */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 flex items-center justify-center font-black text-xs text-white">
                          FM
                        </div>
                        <span className="text-xs font-black text-white">Flymedia LMS</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        ● LIVE APP
                      </span>
                    </div>

                    {/* Promo Mini Card */}
                    <div className="bg-gradient-to-r from-rose-900/60 to-orange-900/60 border border-rose-500/30 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-rose-300 uppercase tracking-wider">
                          REFER & EARN
                        </span>
                        <span className="text-[10px] font-extrabold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md">
                          ⚡ FREE ₹99
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-white">Get a ₹99 Demo Class Free</h4>
                      <p className="text-[11px] text-slate-300 mt-1">
                        When your friend signs up, you get a 1-on-1 demo pass 100% free!
                      </p>
                    </div>

                    {/* Stats Tile */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center">
                        <span className="text-lg font-black text-white">25+</span>
                        <span className="text-[10px] block text-slate-400 font-semibold">Live Tracks</span>
                      </div>
                      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center">
                        <span className="text-lg font-black text-emerald-400">100%</span>
                        <span className="text-[10px] block text-slate-400 font-semibold">Practical</span>
                      </div>
                    </div>

                    {/* CTA Pill */}
                    <div className="bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-xl py-2.5 text-center text-xs font-black shadow-lg shadow-rose-500/20">
                      Download from Play Store & App Store
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
