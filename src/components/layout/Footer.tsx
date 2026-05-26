import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 border-t border-slate-800 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Branding */}
        <div className="space-y-4 md:col-span-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-extrabold tracking-tight text-white">
              Flymedia Technology
            </span>
          </Link>
          <p className="text-xs max-w-sm text-slate-400">
            Leading digital marketing and IT development agency offering 30 days project-oriented summer training bootcamp programs for students and professionals.
          </p>
          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} Flymedia Technology. All rights reserved.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-4">LMS Platform</h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/courses" className="hover:text-orange-400 transition-colors">
                Summer Courses
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-orange-400 transition-colors">
                Student Login
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-orange-400 transition-colors">
                Registration
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Contact Info</h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/about" className="hover:text-orange-400 transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-orange-400 transition-colors">
                Contact Advisors
              </Link>
            </li>
            <li className="text-slate-500">
              anujguptaflymedia@gmail.com
            </li>
            <li className="text-slate-550">
              📞 +91-98884-84310
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
