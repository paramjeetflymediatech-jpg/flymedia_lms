'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface CoursePackage {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string | null;
  price?: number | string | null;
  duration?: string | null;
  category?: string | null;
  description?: string | null;
  modulesCount?: number;
}

interface CoursesCoverflowSliderProps {
  packages: CoursePackage[];
}

export default function CoursesCoverflowSlider({ packages }: CoursesCoverflowSliderProps) {
  // If fewer than 5 items, duplicate list so the 3D arc has full left & right wings
  const displayItems = React.useMemo(() => {
    if (!packages || packages.length === 0) return [];
    if (packages.length === 1) return [packages[0], packages[0], packages[0], packages[0], packages[0]];
    if (packages.length < 5) {
      let repeated: CoursePackage[] = [];
      while (repeated.length < 5) {
        repeated = [...repeated, ...packages];
      }
      return repeated;
    }
    return packages;
  }, [packages]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const len = displayItems.length;

  const handleNext = useCallback(() => {
    if (len === 0) return;
    setActiveIndex((prev) => (prev + 1) % len);
  }, [len]);

  const handlePrev = useCallback(() => {
    if (len === 0) return;
    setActiveIndex((prev) => (prev - 1 + len) % len);
  }, [len]);

  // Autoplay
  useEffect(() => {
    if (isPaused || len <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, len, handleNext]);

  // Touch / Drag swipe support
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchStartX.current = clientX;
    touchEndX.current = clientX;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchEndX.current = clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!packages || packages.length === 0) {
    return (
      <div className="text-center p-8 sm:p-16 bg-white rounded-3xl sm:rounded-[3rem] border border-slate-100 max-w-2xl mx-auto shadow-sm">
        <div className="w-20 h-20 mx-auto bg-orange-50 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
          ✨
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
          New Programs Coming Soon!
        </h3>
        <p className="text-sm sm:text-lg text-slate-500 font-medium leading-relaxed">
          Our expert instructors are currently crafting an incredible new lineup of premium courses.
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full py-6 select-none overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
    >
      {/* 3D Stage Viewport */}
      <div
        className="relative w-full h-[470px] sm:h-[510px] md:h-[530px] flex items-center justify-center"
        style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
      >
        {displayItems.map((pkg, idx) => {
          // Calculate circular distance from activeIndex
          let diff = (idx - activeIndex + len) % len;
          if (diff > len / 2) {
            diff = diff - len;
          }

          const isActive = diff === 0;
          const isVisible = Math.abs(diff) <= 2;

          // 3D Arc Transform calculation matching Adda247 curved cylinder effect
          let transformStyle = '';
          let zIndex = 10;
          let opacity = 0;
          let pointerEvents: 'auto' | 'none' = 'none';

          if (diff === 0) {
            // Center active card: facing straight, elevated, largest
            transformStyle = 'translateX(0%) rotateY(0deg) scale(1.05) translateZ(0px)';
            zIndex = 30;
            opacity = 1;
            pointerEvents = 'auto';
          } else if (diff === 1) {
            // Right 1: angled inward
            transformStyle = 'translateX(78%) rotateY(-26deg) scale(0.9) translateZ(-80px)';
            zIndex = 20;
            opacity = 0.95;
            pointerEvents = 'auto';
          } else if (diff === -1) {
            // Left 1: angled inward
            transformStyle = 'translateX(-78%) rotateY(26deg) scale(0.9) translateZ(-80px)';
            zIndex = 20;
            opacity = 0.95;
            pointerEvents = 'auto';
          } else if (diff === 2) {
            // Right 2: further right, sharper angle
            transformStyle = 'translateX(145%) rotateY(-38deg) scale(0.78) translateZ(-170px)';
            zIndex = 10;
            opacity = 0.75;
            pointerEvents = 'auto';
          } else if (diff === -2) {
            // Left 2: further left, sharper angle
            transformStyle = 'translateX(-145%) rotateY(38deg) scale(0.78) translateZ(-170px)';
            zIndex = 10;
            opacity = 0.75;
            pointerEvents = 'auto';
          } else {
            // Hidden cards behind the arc
            const dir = diff > 0 ? 1 : -1;
            transformStyle = `translateX(${dir * 180}%) rotateY(${dir * -45}deg) scale(0.65) translateZ(-250px)`;
            zIndex = 0;
            opacity = 0;
            pointerEvents = 'none';
          }

          const formattedPrice =
            pkg.price && Number(pkg.price) > 0 ? `₹${Number(pkg.price).toLocaleString('en-IN')}` : 'Free';

          return (
            <div
              key={`${pkg.id}-${idx}`}
              onClick={() => {
                if (!isActive) {
                  setActiveIndex(idx);
                }
              }}
              style={{
                transform: transformStyle,
                zIndex,
                opacity,
                pointerEvents,
                transition: 'all 550ms cubic-bezier(0.25, 1, 0.5, 1)',
              }}
              className={`absolute w-[240px] sm:w-[270px] md:w-[300px] h-[400px] sm:h-[430px] md:h-[460px] rounded-[2rem] bg-white border cursor-pointer select-none overflow-hidden flex flex-col justify-between shadow-xl transition-shadow ${
                isActive
                  ? 'border-orange-500/50 shadow-2xl shadow-orange-500/20 ring-4 ring-orange-500/10'
                  : 'border-slate-200/80 shadow-lg shadow-black/5 hover:border-slate-300'
              }`}
            >
              {/* Card Image Header */}
              <div className="relative w-full h-[54%] overflow-hidden bg-slate-900 shrink-0">
                {pkg.thumbnail ? (
                  <img
                    src={pkg.thumbnail}
                    alt={pkg.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
                    <span className="text-4xl">🚀</span>
                    <span className="text-xs font-bold text-slate-300 mt-2">Flymedia Training</span>
                  </div>
                )}

                {/* Subtle dark gradient for badge contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                {/* Category Pill */}
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10 shadow-sm">
                  {pkg.category || 'Specialized Track'}
                </div>

                {/* Price Tag */}
                <div className="absolute top-3 right-3 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-md">
                  {formattedPrice}
                </div>
              </div>

              {/* Card Content Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
                <div>
                  {pkg.duration && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-1.5">
                      <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{pkg.duration}</span>
                    </div>
                  )}

                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug line-clamp-2 hover:text-orange-600 transition-colors">
                    {pkg.title}
                  </h3>

                  {pkg.description && (
                    <p className="text-slate-500 text-xs font-medium leading-relaxed line-clamp-2 mt-1 hidden sm:block">
                      {pkg.description.replace(/<[^>]*>?/gm, '')}
                    </p>
                  )}
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  {isActive ? (
                    <Link
                      href={`/packages/${pkg.slug}`}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                    >
                      <span>Explore Track</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveIndex(idx);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Left Arrow Navigation Button (Adda247 red rounded style) */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Course"
          className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-xl shadow-rose-900/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer border border-white/20"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right Arrow Navigation Button */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Course"
          className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-xl shadow-rose-900/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer border border-white/20"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Pagination Dot Indicators */}
      <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6">
        {displayItems.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              i === activeIndex
                ? 'w-7 h-2.5 bg-gradient-to-r from-rose-500 to-orange-500 shadow-sm'
                : 'w-2.5 h-2.5 bg-slate-200 hover:bg-slate-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
