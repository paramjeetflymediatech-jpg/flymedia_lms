"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { logoutAction } from '../../../app/actions';

interface ProfileDropdownProps {
  user: {
    name: string | null;
    avatar: string | null;
    role: string;
  };
}

export default function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDashboardLink = () => {
    switch (user.role) {
      case 'ADMIN': return '/admin';
      case 'TUTOR': return '/tutor/dashboard';
      default: return '/dashboard';
    }
  };

  const initials = user.name
    ? user.name.charAt(0).toUpperCase()
    : user.role.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-transparent hover:border-indigo-200 transition-colors shadow-sm overflow-hidden">
          {user.avatar ? (
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
          {/* <div className="px-4 py-2 border-b border-slate-100 mb-2">
            <p className="text-sm font-bold text-slate-800 truncate">{user.name || 'User'}</p>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{user.role}</p>
          </div> */}
          
          <Link 
            href={getDashboardLink()} 
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Dashboard
          </Link>

          <form action={logoutAction} className="w-full">
            <button 
              type="submit"
              className="flex w-full items-center gap-2 px-4 py-2 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Logout
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
