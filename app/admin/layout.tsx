"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, startTransition } from 'react';
import { logoutAction } from '../actions';
import Swal from 'sweetalert2';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

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
    const isActive = pathname === path || (path !== '/admin' && pathname?.startsWith(path));
    return isActive
      ? "flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold transition-colors text-sm"
      : "flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-semibold transition-colors text-sm";
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <img src="/logo.png" alt="Fly Media Technology" className="h-8 w-auto object-contain" />
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <Link href="/admin" className={getLinkClass('/admin')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Dashboard
          </Link>
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Packages</p>
          </div>
          <Link href="/admin/packages" className={getLinkClass('/admin/packages')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            All Packages
          </Link>
          <Link href="/admin/enrollments" className={getLinkClass('/admin/enrollments')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Enrollments
          </Link>
          <Link href="/admin/users" className={getLinkClass('/admin/users')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Users
          </Link>
          <Link href="/admin/tutor-applications" className={getLinkClass('/admin/tutor-applications')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Applications
          </Link>
          <Link href="/admin/payments" className={getLinkClass('/admin/payments')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            Payments
          </Link>
          <Link href="/admin/coupons" className={getLinkClass('/admin/coupons')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
            Coupons
          </Link>
          <Link href="/admin/seo" className={getLinkClass('/admin/seo')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            SEO
          </Link>
        </div>
        <div className="p-4 border-t border-slate-200">
          <button 
            type="button" 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-colors text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800 hidden sm:block">Administrator Console</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                AD
              </div>
              <span className="text-sm font-semibold text-slate-700 hidden sm:block">Admin User</span>
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
