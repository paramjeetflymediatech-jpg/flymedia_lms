'use client';

import { useActionState } from 'react';
import { loginAction } from '../../actions';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600 rounded-full mix-blend-multiply filter blur-[120px] opacity-20" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600 rounded-full mix-blend-multiply filter blur-[120px] opacity-20" />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">

          {/* Logo + Badge */}
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="inline-block mb-5">
              <img src="/logo.png" alt="Flymedia Technology" className="h-10 w-auto brightness-0 invert" />
            </Link>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Admin Portal
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-white text-center mb-1">Administrator Sign In</h1>
          <p className="text-slate-400 text-sm text-center mb-8">Restricted access — authorised personnel only.</p>

          {/* Error */}
          {state?.error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm font-semibold text-red-400 flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-bold text-slate-300 mb-2">
                Email address
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium"
                placeholder="admin@company.com"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-sm font-bold text-slate-300 mb-2">
                Password
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 mt-2"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Sign in to Admin Panel
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              ← Back to public site
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          © {new Date().getFullYear()} Flymedia Technology. All rights reserved.
        </p>
      </div>
    </div>
  );
}
