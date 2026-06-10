'use client';

import { useState } from 'react';
import Link from 'next/link';
import { logoutAction } from '../../../app/actions';

interface MobileMenuProps {
  session: { role: string } | null;
}

export default function MobileMenu({ session }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden flex items-center ml-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-600 hover:text-slate-900 focus:outline-none p-2"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b border-slate-100 shadow-xl flex flex-col py-4 px-6 space-y-4 z-50">
          <Link href="/packages" onClick={() => setIsOpen(false)} className="text-base font-bold text-slate-700 hover:text-orange-500">
            Programs
          </Link>
          <Link href="/about" onClick={() => setIsOpen(false)} className="text-base font-bold text-slate-700 hover:text-orange-500">
            About Us
          </Link>
          <Link href="/contact" onClick={() => setIsOpen(false)} className="text-base font-bold text-slate-700 hover:text-orange-500">
            Contact
          </Link>
          <Link href="/become-tutor" onClick={() => setIsOpen(false)} className="text-base font-bold text-orange-500 hover:text-orange-600">
            Become a tutor
          </Link>

          <div className="pt-4 border-t border-slate-100 flex flex-col space-y-4">
            {session ? (
              <>
                <Link
                  href={session.role === 'ADMIN' ? '/admin' : session.role === 'TUTOR' ? '/tutor' : '/dashboard'}
                  onClick={() => setIsOpen(false)}
                  className="text-base font-bold text-slate-700 hover:text-orange-500"
                >
                  Dashboard
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full text-left text-base font-bold text-slate-500 hover:text-red-500"
                    onClick={() => setIsOpen(false)}
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)} className="text-base font-bold text-slate-700 hover:text-orange-500">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
                  className="inline-flex items-center justify-center px-5 py-3 text-sm font-bold text-white rounded-xl shadow-lg shadow-rose-500/25"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
