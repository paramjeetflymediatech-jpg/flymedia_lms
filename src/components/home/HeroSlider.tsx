"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const SLIDES = [
  {
    image: '/mern_stack_bg.png',
    title: 'MERN Stack Developer',
    subtitle: 'Master full-stack JavaScript with React, Node, Express, and MongoDB.'
  },
  {
    image: '/graphic_design_bg.png',
    title: 'Graphic Design',
    subtitle: 'Create stunning visual experiences and digital art with industry-standard tools.'
  },
  {
    image: '/video_editing_bg.png',
    title: 'Video Editing',
    subtitle: 'Produce cinematic masterpieces with professional non-linear editing workflows.'
  },
  {
    image: '/web_development_bg.png',
    title: 'Web Development',
    subtitle: 'Build modern, responsive, and scalable web applications from scratch.'
  },
  {
    image: '/digital_marketing_bg.png',
    title: 'Digital Marketing',
    subtitle: 'Dominate search engines and drive massive ROI with data-driven campaigns.'
  }
];

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-28">
      {/* Background Images Slider */}
      {SLIDES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out z-0 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10 relative z-20 w-full">
        {/* <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-orange-500/30 backdrop-blur-md shadow-lg shadow-orange-500/10 hover:bg-white/10 transition-colors cursor-pointer">
          <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
          <span className="text-xs font-bold text-orange-300 uppercase tracking-wider">Summer Training 2026 Admissions Open</span>
        </div> */}
        
        <div className="min-h-[160px] sm:min-h-[200px] flex flex-col items-center justify-center">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight max-w-5xl mx-auto leading-[1.1] text-white transition-all duration-500">
            Learn <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-amber-400 bg-clip-text text-transparent drop-shadow-sm">{SLIDES[currentIndex].title}</span>
          </h1>
          <p className="text-lg sm:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium mt-6 transition-all duration-500">
            {SLIDES[currentIndex].subtitle}
          </p>
        </div>

        {/* Slider Navigation Dots */}
        <div className="flex items-center justify-center space-x-3 pt-4">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-12 h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-orange-500 scale-105 shadow-[0_0_10px_rgba(249,115,22,0.6)]' : 'bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Quick specifications highlights */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
          {[
            { label: 'Duration', value: '30 Days', icon: '⏱️' },
            { label: 'Mode', value: 'Hybrid', icon: '💻' },
            { label: 'Location', value: 'Ludhiana', icon: '📍' },
            { label: 'Timings', value: 'Flexible', icon: '🕒' },
          ].map((stat, i) => (
            <div key={i} className="p-5 bg-black/20 border border-white/10 rounded-2xl backdrop-blur-md hover:bg-black/40 transition-colors group">
              <span className="block text-2xl mb-2 group-hover:scale-110 transition-transform">{stat.icon}</span>
              <span className="block text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">{stat.label}</span>
              <span className="block text-white font-bold">{stat.value}</span>
            </div>
          ))}
        </div> */}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8">
          <Link
            href="/packages"
            className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 font-extrabold text-white bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 rounded-2xl shadow-xl shadow-orange-500/25 transition-all text-lg hover:-translate-y-1"
          >
            Explore Programs
          </Link>
          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl transition-all text-lg hover:-translate-y-1"
          >
            Apply Now
          </Link>
        </div>
      </div>
    </section>
  );
}
