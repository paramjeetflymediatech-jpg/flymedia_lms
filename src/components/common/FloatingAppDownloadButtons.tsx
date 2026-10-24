'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AppStoreLinks } from '../../constants/appLinks';

export default function FloatingAppDownloadButtons() {
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click (especially on mobile/touch screens)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveTab(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end pointer-events-auto select-none"
      onMouseLeave={() => setActiveTab(null)}
    >
      {/* ===================== TAB 1: iOS / APP STORE ===================== */}
      <div
        className="relative flex items-center justify-end my-1 group"
        onMouseEnter={() => setActiveTab('ios')}
      >
        {/* EXPANDED HOVER POPUP FOR iOS */}
        <div
          className={`absolute right-full top-1/2 -translate-y-1/2 mr-3 w-72 sm:w-80 p-5 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/60 transition-all duration-300 origin-right text-white ${
            activeTab === 'ios'
              ? 'opacity-100 scale-100 pointer-events-auto translate-x-0'
              : 'opacity-0 scale-95 pointer-events-none translate-x-2'
          }`}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0 shadow-inner">
                {/* Apple Icon */}
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.6-1.07.89-2.07.78-3.07-.99.07-2.14.7-2.8 1.47-.58.68-1.09 1.77-.96 2.81 1.11.08 2.38-.61 2.98-1.21z" />
                </svg>
              </div>
              <div>
                <h4 className="font-black text-sm text-white tracking-tight leading-tight">Flymedia LMS for iOS</h4>
                <p className="text-[11px] text-slate-400 font-medium">iPhone & iPad Compatible</p>
              </div>
            </div>

            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
              FREE
            </span>
          </div>

          <p className="text-xs text-slate-300 mb-4 leading-relaxed font-normal">
            Attend live interactive lectures, book ₹99 demo classes, and track certification progress.
          </p>

          <a
            href={AppStoreLinks.appStore}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs tracking-tight transition-all duration-200 shadow-lg shadow-white/10 group/btn"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.6-1.07.89-2.07.78-3.07-.99.07-2.14.7-2.8 1.47-.58.68-1.09 1.77-.96 2.81 1.11.08 2.38-.61 2.98-1.21z" />
            </svg>
            <span>Download on App Store</span>
            <span className="text-[11px] font-normal opacity-60 ml-auto group-hover/btn:translate-x-0.5 transition-transform">→</span>
          </a>
        </div>

        {/* SIDE TAB TRIGGER BUTTON (iOS) */}
        <button
          onClick={() => setActiveTab(activeTab === 'ios' ? null : 'ios')}
          className={`flex items-center gap-2.5 py-3 px-3.5 pl-4 rounded-l-2xl border-l border-y border-white/20 transition-all duration-300 shadow-2xl backdrop-blur-md cursor-pointer ${
            activeTab === 'ios'
              ? 'bg-slate-900 text-white translate-x-0 shadow-slate-900/50'
              : 'bg-slate-950/90 hover:bg-slate-900 text-slate-200 hover:text-white translate-x-1 hover:translate-x-0 shadow-black/40'
          }`}
          aria-label="Download iOS App"
        >
          <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.6-1.07.89-2.07.78-3.07-.99.07-2.14.7-2.8 1.47-.58.68-1.09 1.77-.96 2.81 1.11.08 2.38-.61 2.98-1.21z" />
          </svg>
          <span className="text-xs font-black tracking-wider uppercase hidden sm:inline-block">iOS</span>
        </button>
      </div>

      {/* ===================== TAB 2: ANDROID / PLAY STORE ===================== */}
      <div
        className="relative flex items-center justify-end my-1 group"
        onMouseEnter={() => setActiveTab('android')}
      >
        {/* EXPANDED HOVER POPUP FOR ANDROID */}
        <div
          className={`absolute right-full top-1/2 -translate-y-1/2 mr-3 w-72 sm:w-80 p-5 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/60 transition-all duration-300 origin-right text-white ${
            activeTab === 'android'
              ? 'opacity-100 scale-100 pointer-events-auto translate-x-0'
              : 'opacity-0 scale-95 pointer-events-none translate-x-2'
          }`}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-inner">
                {/* Google Play / Android Icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M3.609 1.813c-.352.378-.553.948-.553 1.688v16.998c0 .74.201 1.31.553 1.688l.056.056 9.52-9.52v-.226l-9.52-9.52-.056.056z" fill="#00E676" />
                  <path d="M16.368 15.828l-3.183-3.183v-.226l3.183-3.183.072.04 3.774 2.144c1.077.61 1.077 1.61 0 2.222l-3.774 2.146-.072.04z" fill="#FFD54F" />
                  <path d="M13.257 12.419L3.609 22.067c.394.42 1.05.47 1.785.053l11.046-6.275-3.183-3.426z" fill="#FF3D00" />
                  <path d="M13.257 11.581l3.183-3.426-11.046-6.275c-.735-.417-1.391-.367-1.785.053l9.648 9.648z" fill="#00B0FF" />
                </svg>
              </div>
              <div>
                <h4 className="font-black text-sm text-white tracking-tight leading-tight">Flymedia LMS for Android</h4>
                <p className="text-[11px] text-emerald-400 font-semibold">Play Store & Direct APK</p>
              </div>
            </div>

            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              FREE
            </span>
          </div>

          <p className="text-xs text-slate-300 mb-4 leading-relaxed font-normal">
            Download from Google Play Store or get the APK file directly to install instantly.
          </p>

          <div className="space-y-2.5">
            {/* GOOGLE PLAY LINK */}
            <a
              href={AppStoreLinks.playStore}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-tight border border-slate-700/60 hover:border-emerald-500/50 transition-all duration-200 group/btn"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M3.609 1.813c-.352.378-.553.948-.553 1.688v16.998c0 .74.201 1.31.553 1.688l.056.056 9.52-9.52v-.226l-9.52-9.52-.056.056z" fill="#00E676" />
                  <path d="M16.368 15.828l-3.183-3.183v-.226l3.183-3.183.072.04 3.774 2.144c1.077.61 1.077 1.61 0 2.222l-3.774 2.146-.072.04z" fill="#FFD54F" />
                  <path d="M13.257 12.419L3.609 22.067c.394.42 1.05.47 1.785.053l11.046-6.275-3.183-3.426z" fill="#FF3D00" />
                  <path d="M13.257 11.581l3.183-3.426-11.046-6.275c-.735-.417-1.391-.367-1.785.053l9.648 9.648z" fill="#00B0FF" />
                </svg>
                <span>Google Play Store</span>
              </div>
              <span className="text-[11px] font-normal text-slate-400 group-hover/btn:text-white transition-colors">↗</span>
            </a>

            {/* DIRECT APK DOWNLOAD */}
            <a
              href={AppStoreLinks.apkDownload}
              download="flymedia-lms.apk"
              className="flex items-center justify-between w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs tracking-tight transition-all duration-200 shadow-md shadow-emerald-950/40 group/apk"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 shrink-0 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Direct APK</span>
              </div>
              <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded text-white">76 MB</span>
            </a>
          </div>
        </div>

        {/* SIDE TAB TRIGGER BUTTON (Android) */}
        <button
          onClick={() => setActiveTab(activeTab === 'android' ? null : 'android')}
          className={`flex items-center gap-2.5 py-3 px-3.5 pl-4 rounded-l-2xl border-l border-y border-white/20 transition-all duration-300 shadow-2xl backdrop-blur-md cursor-pointer ${
            activeTab === 'android'
              ? 'bg-emerald-950 text-white translate-x-0 border-emerald-500/40 shadow-emerald-950/50'
              : 'bg-slate-950/90 hover:bg-slate-900 text-slate-200 hover:text-emerald-400 translate-x-1 hover:translate-x-0 shadow-black/40'
          }`}
          aria-label="Download Android App"
        >
          {/* Android Robot Icon */}
          <svg className="w-5 h-5 fill-current shrink-0 text-emerald-400" viewBox="0 0 24 24">
            <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4126 13.8533 8.0818 12 8.0818s-3.5902.3308-5.1367.8679L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
          </svg>
          <span className="text-xs font-black tracking-wider uppercase hidden sm:inline-block">Android</span>
        </button>
      </div>
    </div>
  );
}
