import Link from 'next/link';
import { getSessionPayload } from '../../lib/auth';
import { logoutAction } from '../../../app/actions';

export default async function Header() {
  const session = await getSessionPayload();

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
            Flymedia Technology
          </span>
          <span className="text-[9px] uppercase font-bold text-orange-600 px-1.5 py-0.5 rounded bg-orange-100/50 border border-orange-200">
            LMS
          </span>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-700">
          <Link href="/courses" className="hover:text-orange-500 transition-colors">
            Training Programs
          </Link>
          <Link href="/about" className="hover:text-orange-500 transition-colors">
            About Us
          </Link>
          <Link href="/contact" className="hover:text-orange-500 transition-colors">
            Contact
          </Link>
        </nav>

        {/* Auth CTAs */}
        <div className="flex items-center space-x-4">
          {session ? (
            <>
              <Link
                href={session.role === 'ADMIN' ? '/admin' : '/dashboard'}
                className="text-sm font-medium text-slate-700 hover:text-orange-500 transition-colors"
              >
                Go to Dashboard
              </Link>
              <form action={logoutAction} className="inline">
                <button
                  type="submit"
                  className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-700 hover:text-orange-500 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white gradient-bg hover:opacity-90 rounded-xl transition-all shadow-sm shadow-orange-500/10"
              >
                Register Now
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
