'use client';

import { useState, useEffect } from 'react';
import { submitInquiryAction } from '../../../app/actions';

interface CallbackFormProps {
  defaultCourse?: string;
}

export default function CallbackForm({ defaultCourse = '' }: CallbackFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(defaultCourse);
  const [isHighlighted, setIsHighlighted] = useState(false);

  // Auto-scroll when URL has #callback or #demo-form
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#callback' || hash === '#demo-form') {
        const el = document.getElementById('callback') || document.getElementById('demo-form');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setIsHighlighted(true);
          setTimeout(() => setIsHighlighted(false), 2500);
        }
      }
    };

    // Check search params for pre-selected course if not passed
    const params = new URLSearchParams(window.location.search);
    const paramCourse = params.get('course');
    if (paramCourse && !defaultCourse) {
      setSelectedCourse(paramCourse);
    }

    // Run on initial load with a slight delay for hydration
    const timer = setTimeout(handleHash, 250);
    window.addEventListener('hashchange', handleHash);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', handleHash);
    };
  }, [defaultCourse]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const course = formData.get('course') || selectedCourse;
    if (course) {
      formData.set('message', `Interested in ₹99 Demo Class for course: ${course}`);
    }

    try {
      const res = await submitInquiryAction(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-50 text-emerald-700 p-8 rounded-3xl text-center space-y-4 border border-emerald-100 shadow-sm animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
          ✅
        </div>
        <h4 className="text-2xl font-black">Demo Class Request Received!</h4>
        <p className="font-medium text-emerald-600">
          Our admissions advisor will connect with you shortly to confirm your ₹99 one-on-one demo class schedule and details.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-6 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors text-sm shadow-sm"
        >
          Book Another Demo
        </button>
      </div>
    );
  }

  const [mode, setMode] = useState<'HYBRID' | 'CAMPUS' | 'ONLINE'>('HYBRID');

  const POPULAR_COURSES = [
    { id: 'web-development', name: 'Web Development (MERN)' },
    { id: 'digital-marketing', name: 'Digital Marketing' },
    { id: 'video-editing', name: 'Video Editing & VFX' },
    { id: 'graphic-designing', name: 'Graphic Design & UI/UX' },
    { id: 'python-data-science', name: 'Python & AI' },
  ];

  return (
    <form
      id="demo-form"
      className={`space-y-6 transition-all duration-700 rounded-3xl ${
        isHighlighted ? 'ring-4 ring-rose-500/50 p-2 bg-rose-50/20' : ''
      }`}
      onSubmit={(e) => {
        const formData = new FormData(e.currentTarget);
        formData.set('mode', mode);
        handleSubmit(e);
      }}
    >
      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 text-center animate-in fade-in">
          {error}
        </div>
      )}

      {/* Special Offer Badge & Value Pillars */}
      <div className="bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 border border-rose-100/80 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black text-rose-600 bg-white border border-rose-200/60 shadow-xs">
            <span>⚡ ₹99 INTRODUCTORY OFFER</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Limited Daily Slots
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-rose-200/40">
          <div className="text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1">
            <span className="text-emerald-500">✓</span> 1-on-1 Mentor
          </div>
          <div className="text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1">
            <span className="text-emerald-500">✓</span> Live Hands-on Code
          </div>
          <div className="text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1">
            <span className="text-emerald-500">✓</span> Fee Credited Back
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Full Name</label>
          <input
            type="text"
            name="name"
            required
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20 transition-all font-semibold text-sm"
            placeholder="e.g. Rahul Sharma"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Email Address</label>
          <input
            type="email"
            name="email"
            required
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20 transition-all font-semibold text-sm"
            placeholder="rahul@example.com"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Mobile Number (WhatsApp)</label>
        <div className="flex">
          <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-700 font-bold text-sm">
            🇮🇳 +91
          </span>
          <input
            type="tel"
            name="phone"
            required
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-r-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20 transition-all font-semibold text-sm"
            placeholder="97793 24178"
          />
        </div>
      </div>

      {/* Mode Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Learning Mode</label>
        <div className="grid grid-cols-3 gap-2">
          {(['HYBRID', 'CAMPUS', 'ONLINE'] as const).map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setMode(m)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                mode === m
                  ? 'bg-rose-500 text-white border-rose-600 shadow-sm shadow-rose-500/20'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {m === 'HYBRID' ? '⚡ Hybrid' : m === 'CAMPUS' ? '🏫 Campus Lab' : '🌐 Live Online'}
            </button>
          ))}
        </div>
      </div>

      {/* Course Selection */}
      <div className="space-y-2">
        <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Select Career Program</label>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_COURSES.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => setSelectedCourse(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                selectedCourse === c.id
                  ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="relative mt-2">
          <select
            name="course"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20 transition-all font-semibold text-sm appearance-none"
          >
            <option value="" className="text-slate-400">Or choose specific course track...</option>
            <option value="digital-marketing">Digital Marketing Masterclass</option>
            <option value="web-development">Web Development (Full Stack MERN)</option>
            <option value="video-editing">Video Editing & VFX</option>
            <option value="graphic-designing">Graphic Designing & UI/UX</option>
            <option value="python-data-science">Python & Data Science</option>
            <option value="seo-performance-marketing">SEO & Performance Marketing</option>
            <option value="other-course">Other / Customized Track</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 mt-2 bg-gradient-to-r from-rose-500 via-rose-600 to-orange-500 hover:from-rose-600 hover:to-orange-600 rounded-xl text-white font-black text-base transition-all shadow-lg shadow-rose-500/25 hover:-translate-y-0.5 hover:shadow-rose-500/40 relative overflow-hidden group disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            'Booking Demo Class...'
          ) : (
            <>
              <span>Confirm Demo Class Booking</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-black">₹99</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </span>
      </button>

      <div className="pt-1 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
        <span>🔒 100% verified mentors</span>
        <a href="tel:+919779324178" className="font-bold text-rose-600 hover:underline">
          📞 Or Call +91-97793-24178
        </a>
      </div>
    </form>
  );
}
