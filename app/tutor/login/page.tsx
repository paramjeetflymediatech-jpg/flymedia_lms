'use client';

import { useActionState, useState } from 'react';
import { loginAction } from '../../actions';
import Link from 'next/link';

export default function TutorLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-row-reverse bg-white">
      {/* Form Section (now on right) */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 relative z-10">
        <div className="mx-auto w-full max-w-sm lg:w-[400px]">
          <div>
            <Link href="/" className="inline-block">
              <img src="/logo.png" alt="Flymedia Technology" className="h-10 w-auto" />
            </Link>
            <div className="mt-8 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                Tutor Portal
              </span>
            </div>
            <h2 className="mt-4 text-4xl font-extrabold text-slate-900 tracking-tight">
              Instructor Sign In
            </h2>
            <p className="mt-3 text-base text-slate-500">
              Manage your courses, students, and schedules.
            </p>
          </div>

          <div className="mt-10">
            {state?.error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm font-semibold text-red-600 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {state.error}
              </div>
            )}

            <form action={formAction} className="space-y-6">
              <div className="space-y-5">
                <div>
                  <label htmlFor="tutor-email" className="block text-sm font-bold text-slate-700">
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="tutor-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="block w-full rounded-2xl border border-slate-200 px-5 py-4 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all text-sm font-medium bg-slate-50 hover:bg-white focus:bg-white"
                      placeholder="instructor@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="tutor-password" className="block text-sm font-bold text-slate-700">
                    Password
                  </label>
                  <div className="mt-2 relative">
                    <input
                      id="tutor-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className="block w-full rounded-2xl border border-slate-200 pl-5 pr-12 py-4 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all text-sm font-medium bg-slate-50 hover:bg-white focus:bg-white"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-slate-600">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/forgot-password" className="font-bold text-orange-600 hover:text-orange-500 transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-rose-600/20 text-sm font-bold text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-300 ease-out" />
                  <span className="relative flex items-center gap-2">
                    {isPending ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Authenticating...
                      </>
                    ) : 'Sign in to Tutor Panel'}
                  </span>
                </button>
              </div>
            </form>

            <div className="mt-10 text-center space-y-6">
              <p className="text-sm font-medium text-slate-500">
                Want to join our team?{' '}
                <Link href="/become-tutor" className="font-bold text-slate-900 hover:text-orange-600 hover:underline transition-colors">
                  Apply to be a tutor
                </Link>
              </p>
              
              <div className="pt-6 border-t border-slate-100">
                <Link href="/login" className="inline-flex items-center justify-center px-6 py-2.5 border-2 border-slate-100 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all">
                  ← Back to Student Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visuals Section (now on left) */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden bg-slate-900">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay scale-105 hover:scale-100 transition-transform duration-[10s] ease-out"
          src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2669&auto=format&fit=crop"
          alt="Instructor teaching students"
        />
        <div 
          className="absolute inset-0 opacity-80 mix-blend-multiply" 
          style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }} 
        />

        {/* Abstract decorative elements */}
        <div 
          className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" 
          style={{ backgroundColor: '#E60870' }} 
        />
        <div 
          className="absolute bottom-[-10%] left-[-5%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40" 
          style={{ backgroundColor: '#F8750E' }} 
        />

        <div className="absolute inset-0 flex flex-col justify-end p-16 lg:p-24 pb-20">
          <div className="max-w-2xl transform transition-all duration-700 translate-y-0">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span>Tutor Portal Active</span>
            </div>

            <h3 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Shape the minds of tomorrow.
            </h3>

            <p className="text-lg text-slate-300 leading-relaxed max-w-xl mb-12">
              Join Flymedia Technology's elite network of educators. Manage your curriculum, track student progress, and expand your reach.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
