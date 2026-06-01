"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { logoutAction } from '../actions';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const isActive = pathname === path || (path !== '/dashboard' && pathname?.startsWith(path));
    return isActive
      ? "flex items-center gap-3 px-4 py-3 bg-purple-50 text-purple-600 rounded-xl font-bold transition-colors"
      : "flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-semibold transition-colors";
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Link href="/">
            <img src="/logo.png" alt="Fly Media Technology" className="h-8 w-auto object-contain" />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <Link href="/dashboard" className={getLinkClass('/dashboard')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            My Learning
          </Link>
          <Link href="/courses" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-semibold transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Browse Courses
          </Link>

        </div>
        <div className="p-4 border-t border-slate-200">
          <form action={logoutAction}>
            <button type="submit" className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800 hidden sm:block">Student Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-semibold text-purple-600 hover:text-purple-700 hidden sm:block">
              Back to Home
            </Link>
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                ST
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
