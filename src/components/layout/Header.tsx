import Link from 'next/link';
import { getSessionPayload } from '../../lib/auth';
import { User, Category } from '../../db/models';
import MobileMenu from './MobileMenu';
import ProfileDropdown from './ProfileDropdown';
import ProgramsDropdown from './ProgramsDropdown';
import HeaderSearch from './HeaderSearch';

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
      dbUser = {
        name: session.name,
        avatar: null,
        role: session.role,
      };
    }
  }

  // Fetch all categories for Programs dropdown
  const categoriesData = await Category.findAll({ order: [['name', 'ASC']] });
  const categories = categoriesData.map(c => ({ id: c.id, name: c.name, slug: c.slug, icon: c.icon }));

  return (
    <header className="sticky top-0 z-50 w-full bg-white transition-all duration-300 shadow-sm">
      {/* ================= TOP UTILITY & HELPLINE BAR ================= */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Direct Helpline & Email */}
          <div className="flex items-center gap-4 sm:gap-6">
            <a
              href="tel:+919779324178"
              className="flex items-center gap-1.5 font-bold text-white hover:text-orange-400 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+91-97793-24178</span>
            </a>

            <a
              href="mailto:learnwithflymedia@gmail.com"
              className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors text-slate-400"
            >
              <svg className="w-3.5 h-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>learnwithflymedia@gmail.com</span>
            </a>

            <span className="hidden xl:flex items-center gap-1.5 text-slate-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span>Ludhiana Campus </span>
            </span>
          </div>

          {/* Center: Live Batch & Demo Announcement */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-extrabold text-[10px] uppercase tracking-wider border border-rose-500/30">
              Live Admissions
            </span>
            <span className="text-slate-300 font-medium text-xs">
              Book 1-on-1 Demo for <strong className="text-white font-extrabold">₹99</strong> • Refer friends & get a demo free!
            </span>
          </div>

          {/* Right: Quick Utility Links */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link
              href="/internship-form"
              className="text-orange-400 hover:text-orange-300 font-extrabold transition-colors flex items-center gap-1.5"
            >
              <span>🎓 Internship 2025-26</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </Link>
            <Link href="/become-tutor" className="text-slate-400 hover:text-white transition-colors">
              Teach With Us
            </Link>
          </div>
        </div>
      </div>

      {/* ================= MAIN NAVIGATION BAR ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 border-b border-slate-100">
        {/* Left: Logo & Academy Tagline */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <img
            src="/logo.png"
            alt="Flymedia Technology"
            className="h-10 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div className="hidden 2xl:flex flex-col border-l border-slate-200 pl-3">
            <span className="text-xs font-black tracking-tight text-slate-900 leading-none">Flymedia Technology</span>
            <span className="text-[10px] font-bold text-orange-600 tracking-wider uppercase mt-0.5">Career & Skills Academy</span>
          </div>
        </Link>

        {/* Center-Left: Interactive Course Search */}
        <HeaderSearch />

        {/* Center: Clean Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-7 xl:space-x-8 text-sm font-bold text-slate-700">
          <Link href="/" className="hover:text-orange-500 transition-colors relative group py-2">
            <span>Home</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full" />
          </Link>

          {/* Programs with category dropdown */}
          <ProgramsDropdown categories={categories} />

          <Link href="/internship" className="hover:text-orange-500 transition-colors relative group py-2 flex items-center gap-1.5">
            <span>Internship</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500 text-white tracking-wider animate-pulse">
              Open
            </span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full" />
          </Link>

          <Link href="/about" className="hover:text-orange-500 transition-colors relative group py-2">
            <span>About Us</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full" />
          </Link>

          <Link href="/gallery" className="hover:text-orange-500 transition-colors relative group py-2">
            <span>Placements</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full" />
          </Link>
        </nav>

        {/* Right: Auth & Demo Class CTAs */}
        <div className="hidden md:flex items-center space-x-3 shrink-0">
          <Link
            href="/#callback"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all hover:scale-105 shadow-sm"
          >
            <span>⚡ ₹99 Demo</span>
          </Link>

          {session && dbUser ? (
            <ProfileDropdown user={dbUser} />
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-bold text-slate-700 hover:text-orange-500 transition-colors px-2 py-1"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold text-white hover:opacity-95 rounded-xl transition-all shadow-md shadow-rose-500/20 transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger & Drawer */}
        <MobileMenu session={session ? { role: session.role } : null} />
      </div>
    </header>
  );
}
