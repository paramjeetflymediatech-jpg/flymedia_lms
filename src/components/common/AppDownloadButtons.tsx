import React from 'react';
import { AppStoreLinks } from '../../constants/appLinks';

interface AppDownloadButtonsProps {
  variant?: 'default' | 'footer' | 'compact' | 'light';
  className?: string;
  showDirectApk?: boolean;
}

export default function AppDownloadButtons({
  variant = 'default',
  className = '',
  showDirectApk = false,
}: AppDownloadButtonsProps) {
  const isFooter = variant === 'footer';
  const isLight = variant === 'light';

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {/* GOOGLE PLAY STORE BUTTON */}
      <a
        href={AppStoreLinks.playStore}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Download Flymedia LMS on Google Play"
        className={`group inline-flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-md ${
          isLight
            ? 'bg-white text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-slate-100'
            : isFooter
            ? 'bg-slate-900/90 text-white hover:bg-slate-800 border border-slate-800 hover:border-slate-700'
            : 'bg-black text-white hover:bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-black/20'
        }`}
      >
        {/* Google Play Triangle SVG */}
        <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none">
          <path
            d="M3.609 1.813c-.352.378-.553.948-.553 1.688v16.998c0 .74.201 1.31.553 1.688l.056.056 9.52-9.52v-.226l-9.52-9.52-.056.056z"
            fill="#00E676"
          />
          <path
            d="M16.368 15.828l-3.183-3.183v-.226l3.183-3.183.072.04 3.774 2.144c1.077.61 1.077 1.61 0 2.222l-3.774 2.146-.072.04z"
            fill="#FFD54F"
          />
          <path
            d="M13.257 12.419L3.609 22.067c.394.42 1.05.47 1.785.053l11.046-6.275-3.183-3.426z"
            fill="#FF3D00"
          />
          <path
            d="M13.257 11.581l3.183-3.426-11.046-6.275c-.735-.417-1.391-.367-1.785.053l9.648 9.648z"
            fill="#00B0FF"
          />
        </svg>

        <div className="flex flex-col text-left">
          <span className="text-[10px] uppercase font-bold tracking-wider leading-none opacity-75">
            GET IT ON
          </span>
          <span className="text-sm font-extrabold tracking-tight leading-tight group-hover:text-rose-500 transition-colors">
            Google Play
          </span>
        </div>
      </a>

      {/* APPLE APP STORE BUTTON */}
      <a
        href={AppStoreLinks.appStore}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Download Flymedia LMS on the App Store"
        className={`group inline-flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-md ${
          isLight
            ? 'bg-white text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-slate-100'
            : isFooter
            ? 'bg-slate-900/90 text-white hover:bg-slate-800 border border-slate-800 hover:border-slate-700'
            : 'bg-black text-white hover:bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-black/20'
        }`}
      >
        {/* Apple Logo SVG */}
        <svg className="w-6 h-6 flex-shrink-0 fill-current" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.6-1.07.89-2.07.78-3.07-.99.07-2.14.7-2.8 1.47-.58.68-1.09 1.77-.96 2.81 1.11.08 2.38-.61 2.98-1.21z" />
        </svg>

        <div className="flex flex-col text-left">
          <span className="text-[10px] font-bold tracking-wider leading-none opacity-75">
            Download on the
          </span>
          <span className="text-sm font-extrabold tracking-tight leading-tight group-hover:text-orange-500 transition-colors">
            App Store
          </span>
        </div>
      </a>

      {/* DIRECT APK DOWNLOAD BUTTON */}
      {showDirectApk && (
        <a
          href={AppStoreLinks.apkDownload}
          download="flymedia-lms.apk"
          aria-label="Download Flymedia LMS Android APK directly"
          className={`group inline-flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-md ${
            isLight
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
              : 'bg-emerald-950/80 text-emerald-100 hover:bg-emerald-900 border border-emerald-500/30 hover:border-emerald-500/60 shadow-emerald-950/40'
          }`}
        >
          {/* Download APK / Android Icon */}
          <svg className="w-6 h-6 flex-shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>

          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider leading-none text-emerald-400">
              DIRECT DOWNLOAD
            </span>
            <span className="text-sm font-extrabold tracking-tight leading-tight group-hover:text-white transition-colors">
              Android APK
            </span>
          </div>
        </a>
      )}
    </div>
  );
}
