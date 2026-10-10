"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';

const SLIDES = [
  {
    image: '/mern_stack_bg.png',
    title: 'MERN Stack Development',
    subtitle: 'Master full-stack JavaScript with React, Node, Express, and MongoDB.',
    link: '/packages/full-stack-mern-developer-program-with-ai',
    courseValue: 'MERN Stack'
  },
  {
    image: '/graphic_design_bg.png',
    title: 'Graphic Design',
    subtitle: 'Create stunning visual experiences and digital art with industry-standard tools.',
    link: '/packages/graphic-design',
    courseValue: 'Graphic Designing'
  },
  {
    image: '/video_editing_bg.png',
    title: 'Video Editing',
    subtitle: 'Produce cinematic masterpieces with professional non-linear editing workflows.',
    link: '/packages/video-editing',
    courseValue: 'Video Editing'
  },
  {
    image: '/web_development_bg.png',
    title: 'Web Development',
    subtitle: 'Build modern, responsive, and scalable web applications from scratch.',
    link: '/packages/web-development',
    courseValue: 'Web Development'
  },
  {
    image: '/digital_marketing_bg.png',
    title: 'Digital Marketing',
    subtitle: 'Dominate search engines and drive massive ROI with data-driven campaigns.',
    link: '/packages/digital-marketing',
    courseValue: 'Digital Marketing'
  }
];

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(timer);
  }, []);

  // GSAP animation for text change
  useEffect(() => {
    if (!contentRef.current) return;
    
    const ctx = gsap.context(() => {
      // Animate H1 words stagger
      gsap.fromTo(
        '.animate-hero-word',
        { opacity: 0, y: 40, rotateX: -30 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.6, stagger: 0.05, ease: 'back.out(1.5)' }
      );
      // Animate subtitle
      gsap.fromTo(
        '.animate-hero-sub',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: 'power3.out' }
      );
      // Animate buttons
      gsap.fromTo(
        '.animate-hero-btn',
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, delay: 0.4, ease: 'power2.out' }
      );
    }, contentRef);

    return () => ctx.revert();
  }, [currentIndex]);

  const splitText = (text: string, gradientClassName?: string) => {
    return text.split(' ').map((word, i) => (
      <span key={i} className="inline-block overflow-hidden mr-2 md:mr-3">
        <span className={`animate-hero-word inline-block ${gradientClassName || ''}`}>{word}</span>
      </span>
    ));
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-28">
      {/* Background Images Slider */}
      {SLIDES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out z-0 ${index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
        >
          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-slate-950/80 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover transition-transform duration-[10000ms] ease-out"
            style={{
              transform: index === currentIndex ? 'scale(1.1)' : 'scale(1.05)'
            }}
          />
        </div>
      ))}

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] z-10 opacity-30" />

      {/* Hero Content */}
      <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10 relative z-20 w-full">
        {/* <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-orange-500/30 backdrop-blur-md shadow-lg shadow-orange-500/10 hover:bg-white/10 transition-colors cursor-pointer">
          <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
          <span className="text-xs font-bold text-orange-300 uppercase tracking-wider">Summer Training 2026 Admissions Open</span>
        </div> */}

        <div key={currentIndex} className="min-h-[160px] sm:min-h-[200px] flex flex-col items-center justify-center">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight max-w-5xl mx-auto leading-[1.1] text-white flex flex-wrap justify-center">
            {splitText('Learn')}
            {splitText(SLIDES[currentIndex].title, 'bg-gradient-to-r from-orange-400 via-rose-400 to-amber-400 bg-clip-text text-transparent drop-shadow-sm')}
          </h1>
          <p className="animate-hero-sub text-lg sm:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium mt-6">
            {SLIDES[currentIndex].subtitle}
          </p>
        </div>

        {/* Slider Navigation Dots */}
        <div className="flex items-center justify-center space-x-3 pt-4">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-12 h-1.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-orange-500 scale-105 shadow-[0_0_10px_rgba(249,115,22,0.6)]' : 'bg-white/20 hover:bg-white/40'
                }`}
            />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 sm:gap-5 pt-8 w-full max-w-xl mx-auto overflow-hidden p-2">
          <Link
            href={SLIDES[currentIndex].link}
            className="animate-hero-btn w-full sm:w-auto flex-1 inline-flex items-center justify-center px-8 sm:px-10 py-4 font-extrabold text-white bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 rounded-2xl shadow-xl shadow-orange-500/25 transition-all text-base sm:text-lg hover:-translate-y-1 text-center"
          >
            Explore Programs
          </Link>
          <Link
            href={`/contact?course=${encodeURIComponent(SLIDES[currentIndex].courseValue)}`}
            className="animate-hero-btn w-full sm:w-auto flex-1 inline-flex items-center justify-center px-8 sm:px-10 py-4 font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl transition-all text-base sm:text-lg hover:-translate-y-1 text-center"
          >
            Apply Now
          </Link>
        </div>
      </div>
    </section>
  );
}
