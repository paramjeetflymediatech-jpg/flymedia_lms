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
  const [loading, setLoading] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const router = useRouter();

  // Checkout states
  const originalPrice = pkg.price ? Number(pkg.price) : 0;
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercentage: number;
    discountAmount: number;
  } | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'PHONEPE'>('UPI');
  const [selectedUpiApp, setSelectedUpiApp] = useState('Google Pay');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [checkoutSuccess, setCheckoutSuccess] = useState<any>(null);

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
      // Free package
      handleFreeEnroll();
      return;
    }

    setShowCheckoutModal(true);
  };

  const handleFreeEnroll = async () => {
    if (user?.role === 'TUTOR') {
      alert('You are logged in as a Tutor. Course enrollment is available for student accounts only.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/payment/free-enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkg.id }),
      });
      if (res.ok) {
        window.location.href = `/dashboard`;
      } else {
        alert('Failed to enroll.');
      }
    } catch (e) {
      alert('Enrollment error.');
    } finally {
      setLoading(false);
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
    } catch (err: any) {
      setCouponError('Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleProcessCheckout = async () => {
    setLoading(true);
    try {
      // If PhonePe gateway is chosen, user can also route directly through gateway
      if (paymentMethod === 'PHONEPE') {
        const initRes = await fetch('/api/payment/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packageId: pkg.id,
            amount: finalPrice,
          }),
        });
        const initData = await initRes.json();
        if (initData.success && initData.redirectUrl) {
          window.location.href = initData.redirectUrl;
          return;
        }
      }

      // Execute unified checkout
      const res = await fetch('/api/v1/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: pkg.id,
          paymentMethod,
          amount: finalPrice,
          couponCode: appliedCoupon?.code,
          paymentDetails: {
            method: paymentMethod,
            upiApp: selectedUpiApp,
            upiId: upiId || `${selectedUpiApp.toLowerCase().replace(/\s/g, '')}@upi`,
            bank: selectedBank,
            cardLast4: cardNumber ? cardNumber.slice(-4) : '4242',
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCheckoutSuccess(data);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1800);
      } else {
        alert(data.error || 'Payment failed. Please retry.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Checkout error occurred.');
    } finally {
      setLoading(false);
    }
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
            href={`/dashboard`}
            className="w-full inline-flex items-center justify-center px-6 py-5 font-black text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-2xl transition-all shadow-md group"
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
            disabled={loading}
            style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
            className="w-full relative overflow-hidden group py-5 rounded-2xl text-white font-black text-lg transition-all shadow-lg shadow-rose-500/25 hover:-translate-y-1 hover:shadow-rose-500/40 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading
                ? 'Processing...'
                : pkg.price && Number(pkg.price) > 0
                ? `Pay ₹${Number(pkg.price).toLocaleString('en-IN')} & Enroll`
                : 'Instant Enrollment'}
              {!loading && (
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
            className="w-full relative overflow-hidden group flex items-center justify-center py-5 rounded-2xl text-white font-black text-lg transition-all shadow-lg shadow-rose-500/25 hover:-translate-y-1 hover:shadow-rose-500/40"
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
        <div className="sticky top-24 p-8 sm:p-10 bg-white border border-slate-100 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] space-y-8 flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Enrollment Plan</h3>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight break-words">
                  {pkg.price && Number(pkg.price) > 0 ? `₹${Number(pkg.price).toLocaleString('en-IN')}` : 'Free'}
                </span>
                {pkg.price && Number(pkg.price) > 0 && (
                  <span className="text-sm text-slate-500 font-bold mb-1">/ one-time</span>
                )}
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4">{buttonContent}</div>
        </div>
      )}

      {/* CHECKOUT PAYMENT MODAL */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {checkoutSuccess ? 'Payment Confirmed' : 'Course Checkout'}
                </h3>
                <p className="text-xs font-semibold text-slate-500 truncate max-w-xs">{pkg.title}</p>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {checkoutSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl">
                  ✓
                </div>
                <h4 className="text-2xl font-black text-slate-900">Enrollment Confirmed! 🎉</h4>
                <p className="text-sm text-slate-600">
                  Transaction <span className="font-mono font-bold text-slate-800">{checkoutSuccess.transactionId}</span> verified. Redirecting to your dashboard...
                </p>
                <div className="pt-2">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full animate-pulse w-full" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                {/* Price Breakdown */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Course Fee</span>
                    <span className="font-bold text-slate-800">₹{originalPrice.toLocaleString('en-IN')}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                      <span>
                        Coupon Discount ({appliedCoupon.code} - {appliedCoupon.discountPercentage}%)
                      </span>
                      <span>-₹{appliedCoupon.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                    <span className="font-black text-slate-900">Total Payable</span>
                    <span className="text-2xl font-black text-orange-600">
                      ₹{finalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Coupon Code Section */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Discount Coupon
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
                      <span className="font-bold">
                        ✓ {appliedCoupon.code} applied (Saved ₹{appliedCoupon.discountAmount})
                      </span>
                      <button
                        onClick={() => setAppliedCoupon(null)}
                        className="text-xs font-bold text-rose-600 hover:underline"
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
                          className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase font-semibold"
                        />
                        <button
                          onClick={() => handleApplyCoupon()}
                          disabled={couponLoading}
                          className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-black rounded-xl transition-colors disabled:opacity-60"
                        >
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon('FLYSCHOOL20')}
                          className="text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full hover:bg-orange-100 transition-colors"
                        >
                          ⚡ FLYSCHOOL20 (20% OFF)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon('WELCOME50')}
                          className="text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full hover:bg-orange-100 transition-colors"
                        >
                          🔥 WELCOME50 (50% OFF)
                        </button>
                      </div>

                      {couponError && <p className="text-xs font-bold text-rose-500">{couponError}</p>}
                    </div>
                  )}
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Select Payment Method
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        paymentMethod === 'UPI'
                          ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-sm font-black text-slate-900">⚡ Instant UPI</div>
                      <div className="text-xs text-slate-500">GPay, PhonePe, Paytm</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CARD')}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        paymentMethod === 'CARD'
                          ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-sm font-black text-slate-900">💳 Card</div>
                      <div className="text-xs text-slate-500">Visa, RuPay, Master</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('NETBANKING')}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        paymentMethod === 'NETBANKING'
                          ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-sm font-black text-slate-900">🏦 Net Banking</div>
                      <div className="text-xs text-slate-500">All Indian Banks</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('PHONEPE')}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        paymentMethod === 'PHONEPE'
                          ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-sm font-black text-slate-900">🛡️ PhonePe Gateway</div>
                      <div className="text-xs text-slate-500">1-Tap Fast Pay</div>
                    </button>
                  </div>
                </div>

                {/* Sub-form based on method */}
                {paymentMethod === 'UPI' && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex gap-2">
                      {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                        <button
                          key={app}
                          type="button"
                          onClick={() => setSelectedUpiApp(app)}
                          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                            selectedUpiApp === app
                              ? 'bg-orange-500 text-white shadow-sm'
                              : 'bg-white border border-slate-200 text-slate-700'
                          }`}
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Or enter UPI ID (e.g. mobile@upi)"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                )}

                {paymentMethod === 'CARD' && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <input
                      type="text"
                      placeholder="Card Number (XXXX XXXX XXXX XXXX)"
                      value={cardNumber}
                      maxLength={19}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-1/2 px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <input
                        type="password"
                        placeholder="CVV"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-1/2 px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'NETBANKING' && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="text-xs font-bold text-slate-600">Select Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                    >
                      <option>HDFC Bank</option>
                      <option>State Bank of India</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                      <option>Punjab National Bank</option>
                    </select>
                  </div>
                )}

                {/* Security Guarantee */}
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="text-emerald-500">🔒</span> 256-Bit SSL Encrypted • 100% Safe & RBI Compliant
                </div>

                {/* Submit Pay Button */}
                <button
                  type="button"
                  onClick={handleProcessCheckout}
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-base shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? 'Processing Payment...' : `Pay ₹${finalPrice.toLocaleString('en-IN')} & Unlock Course`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
