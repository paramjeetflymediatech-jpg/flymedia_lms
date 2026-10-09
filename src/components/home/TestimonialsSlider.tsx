'use client';

import { useRef } from 'react';

export default function TestimonialsSlider({ testimonials }: { testimonials: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  if (!testimonials || testimonials.length === 0) {
    return (
      <div className="text-center p-8 sm:p-16 bg-white rounded-3xl sm:rounded-[3rem] border border-slate-100 max-w-2xl mx-auto shadow-sm">
        <div className="w-20 h-20 mx-auto bg-orange-50 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
          🌟
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Our Success Stories</h3>
        <p className="text-sm sm:text-lg text-slate-500 font-medium leading-relaxed">
          We are currently gathering the latest success stories from our amazing students. Check back soon to read about their incredible journeys!
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full group">
      {/* Scroll Controls */}
      {testimonials.length > 3 && (
        <>
          <button 
            onClick={scrollLeft}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white border border-slate-200 shadow-lg rounded-full text-slate-400 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
            aria-label="Scroll left"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={scrollRight}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white border border-slate-200 shadow-lg rounded-full text-slate-400 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
            aria-label="Scroll right"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Cards Container */}
      <div 
        ref={scrollRef}
        className={`flex overflow-x-auto gap-8 pb-8 snap-x snap-mandatory scrollbar-hide ${testimonials.length <= 3 ? 'justify-center' : ''}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {testimonials.map((testimonial) => (
          <div 
            key={testimonial.id} 
            className="w-full md:w-[calc(33.333%-1.33rem)] flex-shrink-0 snap-start bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
          >
            <div className="flex gap-1 text-orange-400 mb-6">
              {[...Array(testimonial.rating || 5)].map((_, i) => (
                <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              ))}
            </div>
            <p className="text-slate-700 leading-relaxed font-medium mb-8">
              "{testimonial.content}"
            </p>
            <div className="flex items-center gap-4 mt-auto">
              {testimonial.avatar ? (
                <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full border-2 border-slate-100 object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full border-2 border-slate-100 bg-slate-100 flex items-center justify-center text-slate-500 font-extrabold text-xl">
                  {testimonial.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="font-extrabold text-slate-900">{testimonial.name}</h4>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
