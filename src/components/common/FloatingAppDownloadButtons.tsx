'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import QRCode from 'qrcode';
import { AppStoreLinks } from '../../constants/appLinks';

export default function FloatingAppDownloadButtons() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate device-detection QR Code on mount if on homepage
  useEffect(() => {
    if (pathname !== '/') return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://course.flymediatech.com';
    const target = `${origin}/app`;

    QRCode.toDataURL(target, {
      width: 160,
      margin: 1,
      color: {
        dark: '#090d16',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((dataUrl) => {
        setQrDataUrl(dataUrl);
      })
      .catch((err) => {
        console.error('Failed to generate app download QR code:', err);
      });
  }, [pathname]);

  // Close on outside click (mobile or desktop outside click)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsPinned(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleClick = () => {
    const nextState = !(isOpen && isPinned);
    setIsPinned(nextState);
    setIsOpen(nextState);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPinned(false);
    setIsOpen(false);
  };

  // Only render on homepage ('/')
  if (pathname !== '/') {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center justify-end pointer-events-auto select-none"
      onMouseLeave={() => {
        if (!isPinned) {
          setIsOpen(false);
        }
      }}
    >
      {/* ===================== COMPACT EXPANDED QR CARD ===================== */}
      <div
        className={`absolute right-full top-1/2 -translate-y-1/2 mr-2.5 w-56 p-3.5 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/80 transition-all duration-200 origin-right text-white ${
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto translate-x-0'
            : 'opacity-0 scale-95 pointer-events-none translate-x-2'
        }`}
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-orange-500/20 rounded-full blur-xl pointer-events-none" />

        {/* Compact Header with Close Button */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h4 className="font-extrabold text-xs text-white tracking-tight">Scan to Download</h4>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300">
              Free
            </span>
            {/* Close button to dismiss pinned card */}
            <button
              onClick={handleClose}
              className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-xs leading-none"
              aria-label="Close QR Code Card"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Compact QR Code Display */}
        <div className="p-2 bg-white rounded-xl flex flex-col items-center justify-center shadow-inner">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Scan QR code to download app"
              className="w-32 h-32 object-contain rounded"
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center text-slate-400 text-[10px]">
              Loading QR...
            </div>
          )}
          <span className="text-[9px] font-bold text-slate-600 mt-1 uppercase tracking-wider">
            Point Phone Camera
          </span>
        </div>

        {/* Mini Device Routing Indicators */}
        <div className="mt-2 text-center text-[10px] text-slate-300 font-medium">
          <span>🍏 iOS App Store</span>
          <span className="mx-1.5 text-slate-600">•</span>
          <span>🤖 Google Play</span>
        </div>

        {/* Direct Link Options */}
        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
          <a
            href={AppStoreLinks.appStore}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            App Store ↗
          </a>
          <span className="text-slate-600">|</span>
          <a
            href={AppStoreLinks.playStore}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Google Play ↗
          </a>
          <span className="text-slate-600">|</span>
          <a
            href={AppStoreLinks.apkDownload}
            download="flymedia-lms.apk"
            className="text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            APK ↓
          </a>
        </div>
      </div>

      {/* ===================== FLOATING QR CODE TRIGGER ===================== */}
      <button
        onMouseEnter={() => setIsOpen(true)}
        onClick={handleToggleClick}
        className={`flex items-center gap-2 py-3 px-3 pl-3.5 rounded-l-xl border-l border-y border-white/20 transition-all duration-300 shadow-xl backdrop-blur-md cursor-pointer group ${
          isOpen
            ? 'bg-gradient-to-r from-orange-600 to-rose-600 text-white translate-x-0 shadow-orange-950/60 ring-2 ring-orange-500/30'
            : 'bg-slate-950/90 hover:bg-slate-900 text-slate-200 hover:text-orange-400 translate-x-0.5 hover:translate-x-0 shadow-black/40'
        }`}
        aria-label="Toggle QR Code to Download App"
        title={isPinned ? 'Click to close QR code' : 'Click to keep QR code open'}
      >
        <svg className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="3" height="3" />
          <rect x="18" y="14" width="3" height="3" />
          <rect x="14" y="18" width="7" height="3" />
        </svg>
        <span className="text-xs font-black tracking-wider uppercase hidden sm:inline-block">
          QR Code
        </span>
      </button>
    </div>
  );
}
