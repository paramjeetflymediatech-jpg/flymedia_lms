'use client';

import { useActionState, useState } from 'react';
import { loginAction } from '../actions';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get('reset_success') === '1';

  return (
    <>
      <div>
        {/* <Link href="/" className="inline-block">
          <img src="/logo.png" alt="Flymedia Technology" className="h-10 w-auto" />
        </Link> */}
        <h2 className="mt-8 text-4xl font-extrabold text-slate-900 tracking-tight">
          Welcome back
        </h2>
        <p className="mt-3 text-base text-slate-500 font-medium">
          Sign in to continue your learning journey and unlock new opportunities with Flymedia Technology.
        </p>
      </div>

      <div className="mt-10">
        {resetSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-sm font-semibold text-green-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Password created successfully! Please sign in.
          </div>
        )}
        
        {state?.error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm font-semibold text-red-600 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <div className="space-y-5">
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

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                Password
              </label>
              <div className="mt-2 relative" >
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-2xl border border-slate-200 pl-5 pr-12 py-4 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all text-sm font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 transition-colors cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-slate-700 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm font-medium">
                <Link href="/forgot-password" className="text-blue-600 hover:text-blue-500 hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              // style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}
              style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-blue-600/20 text-sm font-bold text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-300 ease-out" />
              <span className="relative flex items-center gap-2">
                {isPending ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Authenticating...
                  </>
                ) : 'Sign in to dashboard'}
              </span>
            </button>
          </div>
        </form>

        <div className="mt-10 text-center space-y-6">
          <p className="text-sm font-medium text-slate-500">
            Don't have an account?{' '}
            <Link href="/register" className="font-bold text-slate-900 hover:text-blue-600 hover:underline transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
