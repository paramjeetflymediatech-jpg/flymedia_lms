'use client';

import { useActionState } from 'react';
import { registerAction } from '../actions';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-300/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-300/10 rounded-full blur-3xl" />

      <div className="max-w-md w-full space-y-8 glass-panel p-8 sm:p-10 rounded-3xl shadow-xl relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <a href="/" className="inline-flex items-center space-x-2">
            <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Antigravity Academy
            </span>
          </a>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Create your account
          </h2>
          <p className="text-sm text-slate-500">
            Sign up to enroll in programs and start learning.
          </p>
        </div>

        {/* Error Alert */}
        {state?.error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
            ⚠️ {state.error}
          </div>
        )}

        {/* Register Form */}
        <form action={formAction} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 transition-all text-sm text-slate-900"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 transition-all text-sm text-slate-900"
                placeholder="jane@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 transition-all text-sm text-slate-900"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full inline-flex items-center justify-center px-6 py-3.5 font-bold text-white gradient-bg hover:opacity-90 rounded-xl transition-all shadow-md shadow-blue-500/10 text-sm disabled:opacity-50"
          >
            {isPending ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Login prompt */}
        <div className="text-center pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <a href="/login" className="text-purple-600 font-bold hover:underline">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
