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
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Pricing & Coupon states
  const originalPrice = pkg.price ? Number(pkg.price) : 0;
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercentage: number;
    discountAmount: number;
  } | null>(null);

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  const handleOpenCheckout = () => {
    if (!user) {
      router.push(`/login?callbackUrl=/packages/${pkg.slug}`);
      return;
    }

    if (user.role === 'TUTOR') {
      alert('You are logged in as a Tutor. Course purchasing is available for student accounts only.');
      return;
    }

    if (!originalPrice || originalPrice === 0) {
      handleFreeEnroll();
      return;
    }

    setPaymentError('');
    setIsRedirecting(false);
    setProcessing(false);
    setShowCheckoutModal(true);
  };

  const handleFreeEnroll = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/payment/free-enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkg.id }),
      });
      if (res.ok) {
        window.location.href = '/dashboard';
      } else {
        alert('Failed to enroll.');
      }
    } catch {
      alert('Enrollment error.');
    } finally {
      setProcessing(false);
    }
  };

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await fetch('/api/v1/payment/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, amount: originalPrice }),
      });
      const data = await res.json();
      if (data.success && data.valid) {
        setAppliedCoupon({
          code: data.coupon.code,
          discountPercentage: data.coupon.discountPercentage,
          discountAmount: data.discountAmount,
        });
        setCouponCode('');
      } else {
        setCouponError(data.error || 'Invalid coupon code');
      }
    } catch {
      setCouponError('Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  // Direct PhonePe Gateway Checkout (Same as MobileApp)
  const handleProcessPhonePePayment = async () => {
    setProcessing(true);
    setPaymentError('');

    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: pkg.id,
          amount: finalPrice,
          couponCode: appliedCoupon?.code,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.redirectUrl) {
        setIsRedirecting(true);
        // Direct redirect to PhonePe Gateway
        window.location.href = data.redirectUrl;
      } else {
        setProcessing(false);
        setPaymentError(data.error || 'Failed to initiate PhonePe payment. Please try again.');
      }
    } catch (err: any) {
      setProcessing(false);
      setPaymentError(err?.message || 'Network error while connecting to PhonePe gateway.');
    }
  };

  const handleCancelRedirect = () => {
    setIsRedirecting(false);
    setProcessing(false);
    setPaymentError('Payment was cancelled. You can retry anytime.');
  };

  const isTutor = user?.role === 'TUTOR';

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
            onClick={handleOpenCheckout}
            disabled={processing}
            style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
            className="w-full relative overflow-hidden group py-4 px-6 rounded-2xl text-white font-black text-lg transition-all shadow-lg shadow-rose-500/25 hover:-translate-y-0.5 hover:shadow-rose-500/40 disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {processing
                ? 'Processing...'
                : pkg.price && Number(pkg.price) > 0
                ? `Buy Now • ₹${Number(pkg.price).toLocaleString('en-IN')}`
                : 'Instant Free Enrollment'}
              {!processing && (
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
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

  return (
    <>
      {variant === 'button' ? (
        buttonContent
      ) : (
        <div className="sticky top-24 p-8 sm:p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] space-y-6 flex flex-col justify-between overflow-hidden">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Course Fee</h3>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                {pkg.price && Number(pkg.price) > 0 ? `₹${Number(pkg.price).toLocaleString('en-IN')}` : 'Free'}
              </span>
              {pkg.price && Number(pkg.price) > 0 && (
                <span className="text-sm text-slate-500 font-bold">/ one-time</span>
              )}
            </div>
          </div>
          <div className="pt-2">{buttonContent}</div>
        </div>
      )}

      {/* PHONEPE CHECKOUT MODAL (MATCHING MOBILE APP PAYMENT SCREEN) */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            
            {/* Top Handle Bar for mobile sheet feel */}
            <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto mt-3 mb-1 sm:hidden" />

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#5f259f]/10 text-[#5f259f] font-black text-xs">
                    ₹
                  </span>
                  <h3 className="text-lg font-black text-slate-900">PhonePe Checkout</h3>
                </div>
                <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">{pkg.title}</p>
              </div>
              <button
                onClick={() => {
                  if (isRedirecting) handleCancelRedirect();
                  setShowCheckoutModal(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
              {isRedirecting ? (
                /* REDIRECTING / CONNECTING SCREEN */
                <div className="py-8 px-4 text-center space-y-5">
                  <div className="w-20 h-20 mx-auto rounded-full bg-[#5f259f]/10 flex items-center justify-center relative">
                    <div className="w-12 h-12 border-4 border-[#5f259f] border-t-transparent rounded-full animate-spin" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-slate-900">Connecting to PhonePe...</h4>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Redirecting you to the secure PhonePe payment gateway. Please wait a moment...
                    </p>
                  </div>

                  {/* Order Total pill */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-xs mx-auto">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Payable</div>
                    <div className="text-2xl font-black text-slate-900">₹{finalPrice.toLocaleString('en-IN')}</div>
                  </div>

                  <button
                    onClick={handleCancelRedirect}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors pt-2 cursor-pointer underline"
                  >
                    Cancel & Return
                  </button>
                </div>
              ) : (
                /* MAIN CHECKOUT FORM */
                <>
                  {/* Order Summary Box */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between items-center text-sm text-slate-600">
                      <span className="font-medium">Course Fee</span>
                      <span className="font-bold text-slate-900">₹{originalPrice.toLocaleString('en-IN')}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between items-center text-sm text-emerald-600 font-semibold">
                        <span>Coupon Discount ({appliedCoupon.code} • {appliedCoupon.discountPercentage}%)</span>
                        <span>-₹{appliedCoupon.discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                      <span className="text-sm font-black text-slate-900 uppercase tracking-wider">Total Payable</span>
                      <span className="text-2xl font-black text-slate-900">
                        ₹{finalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Coupon Code Section */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Have a Coupon?
                    </label>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
                        <span className="font-bold text-xs">
                          ✓ {appliedCoupon.code} applied (Saved ₹{appliedCoupon.discountAmount})
                        </span>
                        <button
                          onClick={() => setAppliedCoupon(null)}
                          className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. FLYSCHOOL20"
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value);
                              setCouponError('');
                            }}
                            className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5f259f]/40 uppercase font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => handleApplyCoupon()}
                            disabled={couponLoading}
                            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
                          >
                            {couponLoading ? '...' : 'Apply'}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() => handleApplyCoupon('FLYSCHOOL20')}
                            className="text-[11px] font-bold text-[#5f259f] bg-[#5f259f]/5 border border-[#5f259f]/20 px-2.5 py-1 rounded-lg hover:bg-[#5f259f]/10 transition-colors cursor-pointer"
                          >
                            ⚡ FLYSCHOOL20 (20% OFF)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyCoupon('WELCOME50')}
                            className="text-[11px] font-bold text-[#5f259f] bg-[#5f259f]/5 border border-[#5f259f]/20 px-2.5 py-1 rounded-lg hover:bg-[#5f259f]/10 transition-colors cursor-pointer"
                          >
                            🔥 WELCOME50 (50% OFF)
                          </button>
                        </div>
                        {couponError && <p className="text-xs font-bold text-rose-500">{couponError}</p>}
                      </div>
                    )}
                  </div>

                  {/* Payment Error / Cancellation Banner with Retry */}
                  {paymentError && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
                      <span className="text-rose-500 font-black text-sm">⚠️</span>
                      <div className="flex-1 text-xs">
                        <div className="font-bold text-rose-900">Payment Incomplete</div>
                        <div className="text-rose-700 mt-0.5">{paymentError}</div>
                      </div>
                    </div>
                  )}

                  {/* PhonePe Direct Gateway Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#5f259f]/5 to-purple-50/50 border border-[#5f259f]/20 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🛡️</span>
                        <span className="text-sm font-black text-slate-900">PhonePe Payment Gateway</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#5f259f] bg-[#5f259f]/10 px-2.5 py-0.5 rounded-full">
                        Direct Redirect
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      You will be redirected directly to PhonePe to complete your payment using UPI (GPay, PhonePe, Paytm), Debit/Credit Cards, or Net Banking.
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {['PhonePe', 'Google Pay', 'Paytm', 'BHIM UPI', 'Cards', 'NetBanking'].map((m) => (
                        <span key={m} className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500 py-1">
                    <span className="text-emerald-600 font-bold">🔒</span>
                    <span>Protected by 256-bit bank encryption • 100% Safe</span>
                  </div>

                  {/* Direct PhonePe Action Button */}
                  <button
                    type="button"
                    onClick={handleProcessPhonePePayment}
                    disabled={processing}
                    className="w-full py-4 px-6 rounded-2xl text-white font-black text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/25 hover:shadow-purple-900/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #5f259f 0%, #7b2cbf 100%)' }}
                  >
                    {processing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Connecting to PhonePe...</span>
                      </>
                    ) : (
                      <>
                        <span>{paymentError ? 'Retry Payment' : `Proceed to Pay • ₹${finalPrice.toLocaleString('en-IN')}`}</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
