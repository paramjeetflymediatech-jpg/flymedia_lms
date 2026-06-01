'use client';

import { useActionState } from 'react';
import { registerAction } from '../actions';
import Link from 'next/link';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

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
              Create an account
            </h2>
            <p className="mt-3 text-base text-slate-500">
              Join thousands of professionals scaling their careers.
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
                  <label htmlFor="name" className="block text-sm font-bold text-slate-700">
                    Full Name
                  </label>
                  <div className="mt-2">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="block w-full rounded-2xl border border-slate-200 px-5 py-4 text-slate-900 placeholder-slate-400 focus:border-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-600/10 transition-all text-sm font-medium"
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>

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
                      className="block w-full rounded-2xl border border-slate-200 px-5 py-4 text-slate-900 placeholder-slate-400 focus:border-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-600/10 transition-all text-sm font-medium"
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
                      required
                      className="block w-full rounded-2xl border border-slate-200 px-5 py-4 text-slate-900 placeholder-slate-400 focus:border-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-600/10 transition-all text-sm font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-purple-600/20 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-300 ease-out" />
                  <span className="relative flex items-center gap-2">
                    {isPending ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Creating account...
                      </>
                    ) : 'Create account'}
                  </span>
                </button>
              </div>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm font-medium text-slate-500">
                Already have an account?{' '}
                <Link href="/login" className="font-bold text-slate-900 hover:text-purple-600 hover:underline transition-colors">
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visuals Section (now on left) */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden bg-slate-900">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-70 mix-blend-overlay scale-105 hover:scale-100 transition-transform duration-[10s] ease-out"
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2670&auto=format&fit=crop"
          alt="Students studying"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-slate-900/80 to-blue-900/40" />

        {/* Abstract decorative elements */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />

        <div className="absolute inset-0 flex flex-col justify-end p-16 lg:p-24 pb-20">
          <div className="max-w-2xl transform transition-all duration-700 translate-y-0">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Enrollments Open</span>
            </div>

            <h3 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Accelerate your learning journey today.
            </h3>

            <p className="text-lg text-slate-300 leading-relaxed max-w-xl mb-12">
              Unlock access to world-class curriculum, hands-on projects, and a community of ambitious learners.
            </p>

            {/* Value Props */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl">
                <div className="text-2xl mb-2">🎓</div>
                <div className="font-bold text-white text-sm mb-1">Expert Instructors</div>
                <div className="text-slate-400 text-xs">Learn from industry veterans</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl">
                <div className="text-2xl mb-2">💼</div>
                <div className="font-bold text-white text-sm mb-1">Career Support</div>
                <div className="text-slate-400 text-xs">Get hired faster</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
