import Link from 'next/link';
import { getSessionPayload } from '../../lib/auth';
import { logoutAction } from '../../../app/actions';
import MobileMenu from './MobileMenu';

export default async function Header() {
  const session = await getSessionPayload();

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <img src="/logo.png" alt="Flymedia Technology" className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center space-x-10 text-sm font-bold text-slate-600">
          <Link href="/courses" className="hover:text-blue-600 transition-colors relative group">
            <span>Programs</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/about" className="hover:text-blue-600 transition-colors relative group">
            <span>About Us</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/contact" className="hover:text-blue-600 transition-colors relative group">
            <span>Contact</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/become-tutor" className="hover:text-orange-500 transition-colors relative group">
            <span>Become a tutor</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </nav>

        {/* Auth CTAs */}
        <div className="hidden md:flex items-center space-x-5">
          {session ? (
            <>
              <Link
                href={session.role === 'ADMIN' ? '/admin' : session.role === 'TUTOR' ? '/tutor' : '/dashboard'}
                className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors"
              >
                Dashboard
              </Link>
              <div className="h-4 w-px bg-slate-300 hidden sm:block"></div>
              <form action={logoutAction} className="inline">
                <button
                  type="submit"
                  className="text-sm font-bold text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-block text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 rounded-xl transition-all shadow-lg shadow-rose-500/25 transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <MobileMenu session={session ? { role: session.role } : null} />
      </div>
    </header>
  );
}
