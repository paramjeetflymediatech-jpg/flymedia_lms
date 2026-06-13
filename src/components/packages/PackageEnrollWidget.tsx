'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PackageEnrollWidget({ pkg, user, isEnrolled }: { pkg: any, user: any, isEnrolled: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/login?callbackUrl=/packages/${pkg.slug}`);
      return;
    }
    
    setLoading(true);
    try {
      if (!pkg.price || Number(pkg.price) === 0) {
        // Free package, enroll directly via API
        const res = await fetch('/api/payment/free-enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageId: pkg.id })
        });
        if (res.ok) {
          window.location.href = `/dashboard`;
        } else {
          alert('Failed to enroll.');
        }
        return;
      }

      // Paid package -> Initiate Payment (e.g. PhonePe)
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: pkg.id,
          amount: Number(pkg.price)
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
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight break-words">
              {pkg.price && Number(pkg.price) > 0 ? `₹${Number(pkg.price)}` : 'Free'}
            </span>
            {pkg.price && Number(pkg.price) > 0 && (
              <span className="text-sm text-slate-500 font-bold mb-1">/ one-time</span>
            )}
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-600 border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
            <span className="flex items-center space-x-2">
              <span className="text-lg">📅</span>
              <span className="font-bold text-slate-700">Live Classes</span>
            </span>
            <span className="font-black text-slate-900">
              {pkg.liveClasses ? pkg.liveClasses.length : 0} Sessions
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
            <span className="flex items-center space-x-2">
              <span className="text-lg">🏆</span>
              <span className="font-bold text-slate-700">Certification</span>
            </span>
            <span className="font-black text-slate-900">Included</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 pt-4">
        {user ? (
          isEnrolled ? (
            <Link
              href={`/dashboard`}
              className="w-full inline-flex items-center justify-center px-6 py-5 font-black text-white bg-slate-900 hover:bg-slate-800 rounded-2xl transition-all shadow-md group"
            >
              <span>Go to Dashboard</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={loading}
              style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
              className="w-full relative overflow-hidden group py-5 rounded-2xl text-white font-black text-lg transition-all shadow-lg shadow-rose-500/25 hover:-translate-y-1 hover:shadow-rose-500/40 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? 'Processing...' : (pkg.price && Number(pkg.price) > 0 ? `Pay ₹${Number(pkg.price)} & Enroll` : 'Instant Enrollment')}
                {!loading && <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
              </span>
            </button>
          )
        ) : (
          <div className="space-y-4">
            <Link
              href={`/login?callbackUrl=/packages/${pkg.slug}`}
              style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
              className="w-full relative overflow-hidden group flex items-center justify-center py-5 rounded-2xl text-white font-black text-lg transition-all shadow-lg shadow-rose-500/25 hover:-translate-y-1 hover:shadow-rose-500/40"
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
