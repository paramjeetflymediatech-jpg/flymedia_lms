'use client';

import { useState } from 'react';
import { submitInquiryAction } from '../../../app/actions';

export default function CallbackForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const course = formData.get('course');
    if (course) {
      formData.set('message', `Interested in course: ${course}`);
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
        <h4 className="text-2xl font-black">Request Received!</h4>
        <p className="font-medium text-emerald-600">Our advisor will connect with you shortly regarding timings and fee structures.</p>
        <button 
          onClick={() => setSuccess(false)}
          className="mt-6 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors text-sm shadow-sm"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-5 animate-in fade-in duration-500" onSubmit={handleSubmit}>
      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 text-center">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
          <input
            type="text"
            name="name"
            required
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium"
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
          <input
            type="email"
            name="email"
            required
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium"
            placeholder="john@example.com"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
        <input
          type="text"
          name="phone"
          required
          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium"
          placeholder="+91 98884-84310"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Training Course</label>
        <div className="relative">
          <select
            name="course"
            required
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium appearance-none"
          >
            <option value="" className="text-slate-400">Select Training Course...</option>
            <option value="digital-marketing" className="text-slate-900">Digital Marketing</option>
            <option value="web-development" className="text-slate-900">Web Development</option>
            <option value="video-editing" className="text-slate-900">Video Editing</option>
            <option value="graphic-designing" className="text-slate-900">Graphic Designing</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-5 mt-4 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 rounded-2xl text-white font-black text-lg transition-all shadow-lg shadow-orange-500/25 hover:-translate-y-1 hover:shadow-orange-500/40 relative overflow-hidden group disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? 'Submitting Request...' : 'Submit Inquiry'}
          {!loading && <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
        </span>
      </button>
    </form>
  );
}
