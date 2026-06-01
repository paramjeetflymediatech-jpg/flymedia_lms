'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { forgotPasswordAction } from '../actions';

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, null);

  return (
    <div className="min-h-screen flex flex-row-reverse bg-white">
      {/* Form Section */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 relative z-10">
        <div className="mx-auto w-full max-w-sm lg:w-[400px]">

          {/* Logo */}
          <Link href="/" className="inline-block">
            <img src="/logo.png" alt="Flymedia Technology" className="h-10 w-auto" />
          </Link>

          {!state?.success ? (
            <>
              {/* Heading */}
              <h2 className="mt-8 text-4xl font-extrabold text-slate-900 tracking-tight">
                Forgot password?
              </h2>
              <p className="mt-3 text-base text-slate-500">
                Enter your account email and we'll send reset instructions to you.
              </p>

              <div className="mt-10">
                {/* Error Banner */}
                {state?.error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm font-semibold text-red-600 flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {state.error}
                  </div>
                )}

                <form action={formAction} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-slate-700">
                      Email address
                    </label>
                    <div className="mt-2">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="block w-full rounded-2xl border border-slate-200 px-5 py-4 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all text-sm font-medium"
                        placeholder="name@company.com"
                      />
                    </div>
                  </div>

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
                          Sending instructions...
                        </>
                      ) : 'Send reset instructions'}
                    </span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* ── Success State ── */
            <div className="mt-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Check your inbox</h2>
              <p className="mt-4 text-base text-slate-500 leading-relaxed">
                If <span className="font-semibold text-slate-700">{state.email}</span> is linked to an account, you'll receive password reset instructions within a few minutes.
              </p>
              <p className="mt-3 text-sm text-slate-400">
                Didn't receive it? Check your spam folder or contact{' '}
                <a href="mailto:anujguptaflymedia@gmail.com" className="text-blue-600 font-semibold hover:underline">
                  anujguptaflymedia@gmail.com
                </a>
              </p>
            </div>
          )}

          {/* Back to login */}
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

      {/* Visuals Panel (left side – mirrors login page) */}
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
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>Secure Account Recovery</span>
            </div>

            <h3 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Your account is safe with us.
            </h3>

            <p className="text-lg text-slate-300 leading-relaxed max-w-xl mb-12">
              We use industry-standard security to verify your identity and help you regain access quickly and safely.
            </p>

            {/* Tips card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl max-w-lg space-y-4">
              <p className="text-white font-bold text-sm uppercase tracking-wider">Security tips</p>
              {[
                'Use a unique, strong password for every site.',
                'Enable two-factor authentication wherever possible.',
                'Never share your password with anyone.',
              ].map((tip) => (
                <div key={tip} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
