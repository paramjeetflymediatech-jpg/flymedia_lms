'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction } from '../../actions';

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Abstract Dark Background Elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />

      <div className="w-full max-w-md p-8 relative z-10">
        
        {/* Branding & Header */}
        <div className="text-center space-y-6 mb-10">
          <Link href="/" className="inline-block hover:scale-105 transition-transform duration-300">
            {/* Assume logo.png works well on dark, or use text fallback */}
            <img src="/logo.png" alt="Flymedia Technology" className="h-12 w-auto mx-auto brightness-0 invert opacity-90" />
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white tracking-tight">Admin Portal</h1>
            <p className="text-sm font-medium text-slate-400">Secure access for Flymedia staff & administrators</p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl">
          
          {state?.error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm font-semibold text-red-400 flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-5 py-3.5 bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                placeholder="admin@company.com"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between ml-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              </div>
              <input
                name="password"
                type="password"
                required
                className="w-full px-5 py-3.5 bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-black rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating...
                </>
              ) : (
                'Secure Sign In'
              )}
            </button>
          </form>

        </div>
        
        {/* Footer text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 font-medium tracking-wide">
            &copy; {new Date().getFullYear()} Flymedia Technology. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
}
