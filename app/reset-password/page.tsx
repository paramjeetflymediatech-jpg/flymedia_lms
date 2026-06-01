'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { resetPasswordAction } from '../actions';

function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null);
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  if (!token) {
    return (
      <div className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Invalid link</h2>
        <p className="mt-3 text-base text-slate-500">This password reset link is missing or malformed.</p>
        <Link href="/forgot-password" className="mt-6 inline-block font-bold text-blue-600 hover:underline">
          Request a new reset link →
        </Link>
      </div>
    );
  }

  if (state?.success) {
    return (
      <div className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Password updated!</h2>
        <p className="mt-4 text-base text-slate-500">
          Your password has been changed successfully. You can now sign in with your new password.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex items-center gap-2 py-4 px-8 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors"
        >
          Go to Sign in →
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="mt-8 text-4xl font-extrabold text-slate-900 tracking-tight">
        Set new password
      </h2>
      <p className="mt-3 text-base text-slate-500">
        Choose a strong password that you haven't used before.
      </p>

      <div className="mt-10">
        {state?.error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm font-semibold text-red-600 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          {/* Hidden token field */}
          <input type="hidden" name="token" value={token} />

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-slate-700">
              New password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="block w-full rounded-2xl border border-slate-200 px-5 py-4 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all text-sm font-medium"
                placeholder="Minimum 8 characters"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-bold text-slate-700">
              Confirm new password
            </label>
            <div className="mt-2">
              <input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="block w-full rounded-2xl border border-slate-200 px-5 py-4 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all text-sm font-medium"
                placeholder="Re-enter your password"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-blue-600/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-300 ease-out" />
              <span className="relative flex items-center gap-2">
                {isPending ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Updating password...
                  </>
                ) : 'Update password'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-row-reverse bg-white">
      {/* Form Section */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 relative z-10">
        <div className="mx-auto w-full max-w-sm lg:w-[400px]">

          <Link href="/" className="inline-block">
            <img src="/logo.png" alt="Flymedia Technology" className="h-10 w-auto" />
          </Link>

          <Suspense fallback={<div className="mt-8 text-slate-500 text-sm">Loading…</div>}>
            <ResetPasswordForm />
          </Suspense>

          <div className="mt-10 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to sign in
            </Link>
          </div>

        </div>
      </div>

      {/* Visuals Panel */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden bg-slate-900">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay scale-105 hover:scale-100 transition-transform duration-[10s] ease-out"
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop"
          alt="Students learning together"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/90 via-slate-900/80 to-purple-900/40" />
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />

        <div className="absolute inset-0 flex flex-col justify-end p-16 lg:p-24 pb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Secure Password Reset</span>
            </div>
            <h3 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Almost back in.
            </h3>
            <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
              Choose a strong, unique password to keep your account and learning progress safe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
