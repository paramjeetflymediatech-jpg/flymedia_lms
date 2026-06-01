'use client';

import { useActionState } from 'react';
import { loginAction } from '../actions';
import Link from 'next/link';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen flex flex-row-reverse bg-white">
      {/* Form Section (now on right) */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 relative z-10">
        <div className="mx-auto w-full max-w-sm lg:w-[400px]">
          <div>
            <Link href="/" className="inline-block">
              <img src="/logo.png" alt="Flymedia Technology" className="h-10 w-auto" />
            </Link>
            <h2 className="mt-8 text-4xl font-extrabold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="mt-3 text-base text-slate-500">
              Please enter your details to access your account.
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
                  <div className="mt-2">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="block w-full rounded-2xl border border-slate-200 px-5 py-4 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all text-sm font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-slate-600">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/forgot-password" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
                    Forgot password?
                  </Link>
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
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Authenticating...
                      </>
                    ) : 'Sign in to dashboard'}
                  </span>
                </button>
              </div>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm font-medium text-slate-500">
                Don't have an account?{' '}
                <Link href="/register" className="font-bold text-slate-900 hover:text-blue-600 hover:underline transition-colors">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visuals Section (now on left) */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden bg-slate-900">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay scale-105 hover:scale-100 transition-transform duration-[10s] ease-out"
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop"
          alt="Students learning together"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/90 via-slate-900/80 to-purple-900/40" />

        {/* Abstract decorative elements */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />

        <div className="absolute inset-0 flex flex-col justify-end p-16 lg:p-24 pb-20">
          <div className="max-w-2xl transform transition-all duration-700 translate-y-0">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>System Status: Online</span>
            </div>

            <h3 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Empowering the next generation of digital creators.
            </h3>

            <p className="text-lg text-slate-300 leading-relaxed max-w-xl mb-12">
              Join thousands of students and professionals scaling their careers with Flymedia Technology's premium curriculum.
            </p>

            {/* Testimonial Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl max-w-lg">
              <div className="flex gap-1 text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-white font-medium mb-4">"The administrative tools are unparalleled. Everything you need to manage courses and monitor student progress in one seamless interface."</p>
              <div className="flex items-center gap-4">
                <img src="https://i.pravatar.cc/100?img=68" alt="Sarah J." className="w-10 h-10 rounded-full border border-white/30" />
                <div>
                  <div className="font-bold text-white text-sm">Sarah Jenkins</div>
                  <div className="text-slate-400 text-xs font-medium">Head Instructor</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

