"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, startTransition, useState } from 'react';
import { logoutAction } from '../actions';
import Swal from 'sweetalert2';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be securely logged out.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, log out',
    }).then((result) => {
      if (result.isConfirmed) {
        startTransition(() => {
          logoutAction();
        });
      }
    });
  };

  const getLinkClass = (path: string) => {
    const isActive = pathname === path || (path !== '/dashboard' && pathname?.startsWith(path));
    return isActive
      ? "flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold transition-colors shadow-sm text-sm"
      : "flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-semibold transition-colors text-sm";
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Link href="/">
            <img src="/logo.png" alt="Fly Media Technology" className="h-8 w-auto object-contain" />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 flex flex-col">
          <div className="space-y-2">
            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/dashboard')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              Dashboard
            </Link>
            <Link href="/dashboard/courses" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/dashboard/courses')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Courses
            </Link>

            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Packages</p>
            </div>
            <Link href="/dashboard/my-packages" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/dashboard/my-packages')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              My Packages
            </Link>
            <Link href="/packages" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/packages')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              All Packages
            </Link>

            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Account</p>
            </div>
            <Link href="/dashboard/book-session" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/dashboard/book-session')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Book a Session
            </Link>
            <Link href="/dashboard/tutors" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/dashboard/tutors')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Tutors
            </Link>
            <Link href="/dashboard/profile" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/dashboard/profile')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Profile
            </Link>
          </div>
          <div className="pt-6 mt-auto">
            <button 
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-colors border border-transparent hover:border-red-100 text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Removed as requested */}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
