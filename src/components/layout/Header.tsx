import Link from 'next/link';
import { getSessionPayload } from '../../lib/auth';
import { User } from '../../db/models';
import MobileMenu from './MobileMenu';
import ProfileDropdown from './ProfileDropdown';

export default async function Header() {
  const session = await getSessionPayload();
  let dbUser = null;
  if (session) {
    const user = await User.findByPk(session.userId, { attributes: ['name', 'avatar', 'role'] });
    if (user) {
      dbUser = {
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      };
    } else {
      // Fallback if DB user not found
      dbUser = {
        name: session.name,
        avatar: null,
        role: session.role,
      };
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <img src="/logo.png" alt="Flymedia Technology" className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center space-x-10 text-sm font-bold text-slate-600">
          <Link href="/" className="hover:text-orange-500 transition-colors relative group">
            <span>Home</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/packages" className="hover:text-orange-500 transition-colors relative group">
            <span>Programs</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/about" className="hover:text-orange-500 transition-colors relative group">
            <span>About Us</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/contact" className="hover:text-orange-500 transition-colors relative group">
            <span>Contact</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/mentors" className="hover:text-orange-500 transition-colors relative group">
            <span>Tutors</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/become-tutor" className="hover:text-orange-500 transition-colors relative group">
            <span>Become a tutor</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </nav>

        {/* Auth CTAs */}
        <div className="hidden md:flex items-center space-x-5">
          {session && dbUser ? (
            <ProfileDropdown user={dbUser} />
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-block text-sm font-bold text-slate-600 hover:text-orange-500 transition-colors"
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
