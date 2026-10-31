'use client';

import { useState } from 'react';
import Link from 'next/link';
import { logoutAction } from '../../../app/actions';
import AppDownloadButtons from '../common/AppDownloadButtons';

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
        <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-2xl flex flex-col py-4 px-6 space-y-3 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto">
          {/* Quick Helpline Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <a
              href="tel:+919779324178"
              className="flex items-center gap-2 text-sm font-extrabold text-orange-600 hover:text-orange-700"
            >
              <span>📞</span>
              <span>+91-97793-24178</span>
            </a>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Admissions Helpline
            </span>
          </div>

          <Link href="/" onClick={() => setIsOpen(false)} className="text-base font-bold text-slate-800 hover:text-orange-500">
            Home
          </Link>
          <Link href="/packages" onClick={() => setIsOpen(false)} className="text-base font-bold text-slate-800 hover:text-orange-500">
            All Programs
          </Link>
          <Link
            href="/internship-form"
            onClick={() => setIsOpen(false)}
            className="text-base font-extrabold text-orange-600 hover:text-orange-700 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span>🎓</span>
              <span>Internship Application Form</span>
            </span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-orange-100 text-orange-800">
              Apply Now
            </span>
          </Link>
          <Link
            href="/partner-with-us?type=college#partner-form-section"
            onClick={() => setIsOpen(false)}
            className="text-base font-bold text-slate-800 hover:text-blue-600 flex items-center justify-between"
          >
            <span>College Tie-Ups</span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Campus
            </span>
          </Link>
          <Link
            href="/partner-with-us?type=charity#partner-form-section"
            onClick={() => setIsOpen(false)}
            className="text-base font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-between"
          >
            <span>Non-Profit Org Tie-Ups</span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Free Edu
            </span>
          </Link>
          <Link href="/about" onClick={() => setIsOpen(false)} className="text-base font-bold text-slate-800 hover:text-orange-500">
            About Us
          </Link>
          <Link href="/gallery" onClick={() => setIsOpen(false)} className="text-base font-bold text-slate-700 hover:text-orange-500">
            Success Gallery
          </Link>
          <Link
            href="/#callback"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 border border-rose-100"
          >
            <span>Book Demo Class</span>
            <span className="text-xs font-black bg-rose-500 text-white px-2.5 py-0.5 rounded-full">⚡ ₹99</span>
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

            {/* Quick Mobile App Install Links */}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 mb-2.5 uppercase tracking-wider">Get the Mobile App</p>
              <AppDownloadButtons variant="compact" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
