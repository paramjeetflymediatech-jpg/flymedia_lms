"use client";

import { useState } from 'react';
import Swal from 'sweetalert2';
import { submitInquiryAction } from '../../../app/actions';

export default function ContactForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const course = formData.get('course') as string;
    const message = formData.get('message') as string;
    
    // Combine course and message if a course is selected
    if (course) {
      formData.set('message', `Interested in: ${course}\n\n${message}`);
    }

    try {
      const result = await submitInquiryAction(formData);
      
      if (result.error) {
        Swal.fire({
          title: 'Oops!',
          text: result.error,
          icon: 'error',
          confirmButtonColor: '#f97316'
        });
      } else {
        Swal.fire({
          title: 'Success!',
          text: result.message || 'Your inquiry has been submitted.',
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
        // Reset form
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Something went wrong. Please try again later.',
        icon: 'error',
        confirmButtonColor: '#f97316'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
          <input
            name="name"
            type="text"
            required
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium"
            placeholder="Jane Doe"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
          <input
            name="email"
            type="email"
            required
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium"
            placeholder="jane@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
          <input
            name="phone"
            type="tel"
            required
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium"
            placeholder="+91 98765 43210"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Course of Interest</label>
          <div className="relative">
            <select
              name="course"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium appearance-none"
            >
              <option value="" className="text-slate-400">Select a program...</option>
              <option value="Digital Marketing" className="text-slate-900">Digital Marketing</option>
              <option value="Web Development" className="text-slate-900">Web Development</option>
              <option value="Video Editing" className="text-slate-900">Video Editing</option>
              <option value="Graphic Designing" className="text-slate-900">Graphic Designing</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message Details</label>
        <textarea
          name="message"
          required
          rows={5}
          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium resize-none"
          placeholder="Tell us about your background and schedule availability..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-5 mt-4 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 rounded-2xl text-white font-black text-lg transition-all shadow-lg shadow-orange-500/25 hover:-translate-y-1 hover:shadow-orange-500/40 relative overflow-hidden group disabled:opacity-70 disabled:hover:-translate-y-0 disabled:hover:shadow-orange-500/25"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? 'Sending...' : 'Send Registration Inquiry'}
          {!loading && <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
        </span>
      </button>
    </form>
  );
}
