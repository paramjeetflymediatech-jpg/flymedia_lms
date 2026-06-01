'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CourseEnrollWidget({ course, user, isEnrolled }: { course: any, user: any, isEnrolled: boolean }) {
  const [batchMode, setBatchMode] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/login?callbackUrl=/courses/${course.slug}`);
      return;
    }
    
    setLoading(true);
    try {
      if (!course.price || Number(course.price) === 0) {
        // Free course, enroll directly via API or server action (simulating here, we will create a dedicated free enroll endpoint)
        const res = await fetch('/api/payment/free-enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId: course.id, batchMode })
        });
        if (res.ok) {
          window.location.href = `/dashboard/courses/${course.slug}`;
        } else {
          alert('Failed to enroll.');
        }
        return;
      }

      // Paid course -> Initiate PhonePe Payment
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          amount: Number(course.price),
          batchMode
        }),
      });

      const data = await res.json();
      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert(data.error || 'Failed to initiate payment.');
      }
    } catch (error) {
      console.error(error);
      alert('Payment error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sticky top-24 p-8 sm:p-10 bg-white border border-slate-100 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] space-y-8 flex flex-col justify-between overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none" />

      <div className="relative z-10 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Enrollment Plan</h3>
          <div className="flex items-end space-x-2">
            <span className="text-5xl font-black text-slate-900 tracking-tight">
              {course.price && Number(course.price) > 0 ? `₹${course.price}` : 'Free'}
            </span>
            {course.price && Number(course.price) > 0 && (
              <span className="text-sm text-slate-500 font-bold mb-1">/ one-time</span>
            )}
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-600 border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
            <span className="flex items-center space-x-2">
              <span className="text-lg">⏱️</span>
              <span className="font-bold text-slate-700">Duration</span>
            </span>
            <span className="font-black text-slate-900">
              {course.duration ? Math.round(course.duration / 60) : 0} hours
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
            <span className="flex items-center space-x-2">
              <span className="text-lg">🏆</span>
              <span className="font-bold text-slate-700">Certification</span>
            </span>
            <span className="font-black text-slate-900">Included</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
            <span className="flex items-center space-x-2">
              <span className="text-lg">📶</span>
              <span className="font-bold text-slate-700">Level</span>
            </span>
            <span className="font-black text-slate-900 capitalize">
              {course.level.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Batch Mode Selection */}
        {!isEnrolled && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-sm font-bold text-slate-700">Select Batch Mode:</h4>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setBatchMode('ONLINE')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                  batchMode === 'ONLINE'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Online
              </button>
              <button
                type="button"
                onClick={() => setBatchMode('OFFLINE')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                  batchMode === 'OFFLINE'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Offline
              </button>
            </div>
          </div>
        )}

      </div>

      <div className="relative z-10 pt-4">
        {user ? (
          isEnrolled ? (
            <Link
              href={`/dashboard/courses/${course.slug}`}
              className="w-full inline-flex items-center justify-center px-6 py-5 font-black text-white bg-slate-900 hover:bg-slate-800 rounded-2xl transition-all shadow-md group"
            >
              <span>Enter Classroom</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={loading}
              className="w-full relative overflow-hidden group py-5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 rounded-2xl text-white font-black text-lg transition-all shadow-lg shadow-orange-500/25 hover:-translate-y-1 hover:shadow-orange-500/40 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? 'Processing...' : (course.price && Number(course.price) > 0 ? `Pay ₹${course.price} & Enroll` : 'Instant Enrollment')}
                {!loading && <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
              </span>
            </button>
          )
        ) : (
          <div className="space-y-4">
            <Link
              href={`/login?callbackUrl=/courses/${course.slug}`}
              className="w-full relative overflow-hidden group flex items-center justify-center py-5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 rounded-2xl text-white font-black text-lg transition-all shadow-lg shadow-orange-500/25 hover:-translate-y-1 hover:shadow-orange-500/40"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10">Sign In to Enroll</span>
            </Link>
            <p className="text-center text-sm font-bold text-slate-500">
              New to platform? <Link href="/register" className="text-orange-600 hover:text-orange-500 transition-colors">Register here</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
