'use client';

import { useActionState, useState } from 'react';
import { loginAction } from '../../actions';
import Link from 'next/link';

export default function AdminLoginPage() {
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Admin Portal
              </span>
            </div>
            <h2 className="mt-4 text-4xl font-extrabold text-slate-900 tracking-tight">
              Administrator Sign In
            </h2>
            <p className="mt-3 text-base text-slate-500">
              Restricted access — authorized personnel only.
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
                  <label htmlFor="admin-email" className="block text-sm font-bold text-slate-700">
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="admin-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="block w-full rounded-2xl border border-slate-200 px-5 py-4 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all text-sm font-medium bg-slate-50 hover:bg-white focus:bg-white"
                      placeholder="admin@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="admin-password" className="block text-sm font-bold text-slate-700">
                    Password
                  </label>
                  <div className="mt-2 relative">
                    <input
                      id="admin-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className="block w-full rounded-2xl border border-slate-200 pl-5 pr-12 py-4 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all text-sm font-medium bg-slate-50 hover:bg-white focus:bg-white"
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex justify-center py-4 px-4 bg-blue-600 hover:bg-blue-500 border border-transparent rounded-2xl shadow-lg shadow-blue-600/20 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-300 ease-out" />
                  <span className="relative flex items-center gap-2">
                    {isPending ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Authenticating...
                      </>
                    ) : 'Access Control Panel'}
                  </span>
                </button>
              </div>
            </form>

            <div className="mt-10 pt-6 border-t border-slate-100 text-center">
              <Link href="/login" className="inline-flex items-center justify-center px-6 py-2.5 border-2 border-slate-100 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all">
                ← Back to Student Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Visuals Section (now on left) */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden bg-slate-900">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay scale-105 hover:scale-100 transition-transform duration-[10s] ease-out"
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop"
          alt="Server room infrastructure"
        />
        <div 
          className="absolute inset-0 opacity-80 mix-blend-multiply" 
          style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #60A5FA 100%)' }} 
        />

        {/* Abstract decorative elements */}
        <div 
          className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" 
          style={{ backgroundColor: '#1E40AF' }} 
        />
        <div 
          className="absolute bottom-[-10%] left-[-5%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40" 
          style={{ backgroundColor: '#60A5FA' }} 
        />

        <div className="absolute inset-0 flex flex-col justify-end p-16 lg:p-24 pb-20">
          <div className="max-w-2xl transform transition-all duration-700 translate-y-0">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>Admin Network Active</span>
            </div>

            <h3 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Command Center Control.
            </h3>

            <p className="text-lg text-slate-300 leading-relaxed max-w-xl mb-12">
              Oversee platform operations, manage extensive course catalogs, and track system analytics securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
