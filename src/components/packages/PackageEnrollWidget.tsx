'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PackageEnrollWidget({
  pkg,
  user,
  isEnrolled,
  variant = 'card',
}: {
  pkg: any;
  user: any;
  isEnrolled: boolean;
  variant?: 'card' | 'button';
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const price = pkg.price ? Number(pkg.price) : 0;
  const isTutor = user?.role === 'TUTOR';

  // Direct 1-Click Buy Now & Redirect to PhonePe Gateway
  const handleBuyNow = async () => {
    if (!user) {
      router.push(`/login?callbackUrl=/packages/${pkg.slug}`);
      return;
    }

    if (isTutor) {
      alert('You are logged in as a Tutor. Course purchasing is available for student accounts only.');
      return;
    }

    // Free package instant enrollment
    if (!price || price === 0) {
      setLoading(true);
      try {
        const res = await fetch('/api/payment/free-enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageId: pkg.id }),
        });
        if (res.ok) {
          window.location.href = '/dashboard';
        } else {
          alert('Failed to enroll in free course.');
        }
      } catch {
        alert('Enrollment error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Direct PhonePe Gateway Checkout (No Modal)
    setLoading(true);
    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: pkg.id,
          amount: price,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.redirectUrl) {
        // Direct redirection straight to PhonePe Gateway
        window.location.href = data.redirectUrl;
      } else {
        setLoading(false);
        alert(data.error || 'Failed to initiate PhonePe payment. Please try again.');
      }
    } catch (err: any) {
      setLoading(false);
      alert(err?.message || 'Network error while connecting to PhonePe gateway.');
    }
  };

  const buttonContent = (
    <div className="relative z-10 w-full">
      {user ? (
        isTutor ? (
          <div className="p-4 sm:p-5 bg-amber-50 border border-amber-200/90 rounded-2xl text-center space-y-1.5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center justify-center gap-1.5">
              <span>🛡️ Instructor Account</span>
            </div>
            <p className="text-xs text-amber-700 font-medium">
              Course purchasing and demo bookings are available for student accounts only.
            </p>
          </div>
        ) : isEnrolled ? (
          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center px-6 py-4 font-black text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-2xl transition-all shadow-md group"
          >
            <span>Go to Dashboard</span>
            <svg
              className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        ) : (
          <button
            onClick={handleBuyNow}
            disabled={loading}
            style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
            className="w-full relative overflow-hidden group py-4 px-6 rounded-2xl text-white font-black text-lg transition-all shadow-lg shadow-rose-500/25 hover:-translate-y-0.5 hover:shadow-rose-500/40 disabled:opacity-75 disabled:hover:translate-y-0 cursor-pointer"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Redirecting to PhonePe...</span>
                </>
              ) : (
                <>
                  <span>
                    {price && price > 0
                      ? `Buy Now • ₹${price.toLocaleString('en-IN')}`
                      : 'Instant Free Enrollment'}
                  </span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </span>
          </button>
        )
      ) : (
        <div className="space-y-4">
          <Link
            href={`/login?callbackUrl=/packages/${pkg.slug}`}
            style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
            className="w-full relative overflow-hidden group flex items-center justify-center py-4 px-6 rounded-2xl text-white font-black text-lg transition-all shadow-lg shadow-rose-500/25 hover:-translate-y-0.5 hover:shadow-rose-500/40"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10">Sign In to Enroll</span>
          </Link>
          {variant === 'card' && (
            <p className="text-center text-sm font-bold text-slate-500">
              New to platform?{' '}
              <Link href="/register" className="text-orange-600 hover:text-orange-500 transition-colors">
                Register here
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (variant === 'button') {
    return buttonContent;
  }

  return (
    <div className="sticky top-24 p-8 sm:p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] space-y-6 flex flex-col justify-between overflow-hidden">
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Course Fee</h3>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            {price && price > 0 ? `₹${price.toLocaleString('en-IN')}` : 'Free'}
          </span>
          {price && price > 0 && (
            <span className="text-sm text-slate-500 font-bold">/ one-time</span>
          )}
        </div>
      </div>
      <div className="pt-2">{buttonContent}</div>
    </div>
  );
}
