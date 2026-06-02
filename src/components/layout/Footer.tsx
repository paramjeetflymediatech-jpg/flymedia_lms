import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 text-slate-400 pt-20 pb-10 relative overflow-hidden mt-auto">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Call to Action / Newsletter */}
        {/* <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 md:p-12 mb-16 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden group shadow-2xl">
           <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
           <div className="relative z-10 max-w-xl text-center lg:text-left">
             <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3">Ready to level up your career?</h3>
             <p className="text-slate-400 font-medium leading-relaxed">Join our newsletter for the latest tech insights, exclusive course discounts, and industry news delivered to your inbox.</p>
           </div>
           <form className="relative z-10 flex flex-col sm:flex-row w-full lg:w-auto gap-3">
             <input type="email" placeholder="Enter your email" className="w-full sm:w-72 px-5 py-3.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-orange-500 text-white placeholder-slate-500 transition-colors" />
             <button type="button" className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] whitespace-nowrap">
               Subscribe
             </button>
           </form>
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          {/* Branding */}
          <div className="space-y-8 md:col-span-4">
            <Link href="/" className="inline-block">
              <img src="/logo.png" alt="Flymedia Technology" className="h-10 w-auto object-contain brightness-0 invert opacity-95 hover:opacity-100 transition-opacity" />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Empowering the next generation of digital creators. Premium curriculum, expert instructors, and a thriving community to scale your tech career.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300 hover:-translate-y-1">
                <span className="sr-only">Twitter</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-300 hover:-translate-y-1">
                <span className="sr-only">GitHub</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300 hover:-translate-y-1">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div className="md:col-span-2 md:col-start-6">
            <h3 className="text-white text-base font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Platform
            </h3>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <Link href="/courses" className="hover:text-orange-400 transition-colors inline-block hover:translate-x-1.5 transform duration-300">
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-orange-400 transition-colors inline-block hover:translate-x-1.5 transform duration-300">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-orange-400 transition-colors inline-block hover:translate-x-1.5 transform duration-300">
                  Member Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-orange-400 transition-colors inline-block hover:translate-x-1.5 transform duration-300">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="md:col-span-2">
            <h3 className="text-white text-base font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Resources
            </h3>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <Link href="/about" className="hover:text-rose-400 transition-colors inline-block hover:translate-x-1.5 transform duration-300">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-rose-400 transition-colors inline-block hover:translate-x-1.5 transform duration-300">
                  Tech Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-rose-400 transition-colors inline-block hover:translate-x-1.5 transform duration-300">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-rose-400 transition-colors inline-block hover:translate-x-1.5 transform duration-300">
                  Terms & Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-3">
            <h3 className="text-white text-base font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Get in Touch
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-orange-500 group-hover:scale-110 group-hover:border-orange-500/50 transition-all shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div className="pt-1.5">
                  <a href="mailto:anujguptaflymedia@gmail.com" className="hover:text-orange-400 transition-colors break-all">anujguptaflymedia@gmail.com</a>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-500 group-hover:scale-110 group-hover:border-rose-500/50 transition-all shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <div className="pt-1.5">
                  <a href="tel:+919888484310" className="hover:text-rose-400 transition-colors">+91-98884-84310</a>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-500 group-hover:scale-110 group-hover:border-purple-500/50 transition-all shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div className="pt-1.5 leading-relaxed">
                  <span>Plot no, 20, Vishal Nagar Ext, Vishal Nagar, Ludhiana, Punjab 141001</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-slate-500 font-medium text-center md:text-left">
            © {new Date().getFullYear()} Flymedia Technology. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center space-x-6 mt-4 md:mt-0 text-xs font-semibold text-slate-500">
            <Link href="/privacy" className="hover:text-orange-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-orange-400 transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-orange-400 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
