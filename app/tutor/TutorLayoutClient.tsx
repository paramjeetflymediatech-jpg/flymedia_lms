"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, startTransition, useState } from 'react';
import { logoutAction } from '../actions';
import Swal from 'sweetalert2';

interface TutorLayoutClientProps {
  children: ReactNode;
  user: {
    name: string | null;
    avatar: string | null;
  };
}

export default function TutorLayoutClient({ children, user }: TutorLayoutClientProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    const isActive = pathname === path || (path !== '/tutor/dashboard' && pathname?.startsWith(path));
    return isActive
      ? "flex items-center gap-3 px-4 py-3 bg-orange-50 text-orange-600 rounded-xl font-bold transition-colors"
      : "flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-semibold transition-colors";
  };

  const displayName = user?.name || 'Tutor';
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col 
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
          <Link href="/" onClick={() => setSidebarOpen(false)}>
            <img src="/logo.png" alt="Flymedia Technology" className="h-8 w-auto object-contain" />
          </Link>
          <button className="md:hidden text-slate-500" onClick={() => setSidebarOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <Link href="/tutor/dashboard" onClick={() => setSidebarOpen(false)} className={getLinkClass('/tutor/dashboard')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Overview
          </Link>
          <Link href="/tutor/classes" onClick={() => setSidebarOpen(false)} className={getLinkClass('/tutor/classes')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            My Classes
          </Link>
          <Link href="/tutor/students" onClick={() => setSidebarOpen(false)} className={getLinkClass('/tutor/students')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Students
          </Link>
          <Link href="/tutor/availability" onClick={() => setSidebarOpen(false)} className={getLinkClass('/tutor/availability')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Availability
          </Link>
          <Link href="/tutor/profile" onClick={() => setSidebarOpen(false)} className={getLinkClass('/tutor/profile')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Tutor Profile
          </Link>
        </div>
        <div className="p-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-10 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
            </button>
            <h2 className="text-lg font-bold text-slate-800">Tutor Portal</h2>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-semibold text-orange-600 hover:text-orange-700 hidden sm:block">
              View Live Site
            </Link>
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs ring-2 ring-white overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
