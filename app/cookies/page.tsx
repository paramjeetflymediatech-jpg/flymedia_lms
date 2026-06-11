import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Cookie Policy | Flymedia Technology',
  description: 'Cookie Policy for Flymedia Technology.',
};

export default function CookiePolicyPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-8 py-10 sm:px-12 sm:py-16">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-8">Cookie Policy</h1>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
              <p className="font-medium text-slate-900">Last updated: {new Date().toLocaleDateString()}</p>
              
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">1. What Are Cookies</h2>
                <p>As is common practice with almost all professional websites this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it and why we sometimes need to store these cookies.</p>
              </section>
              
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">2. How We Use Cookies</h2>
                <p>We use cookies for a variety of reasons detailed below. Unfortunately, in most cases there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">3. Disabling Cookies</h2>
                <p>You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">4. The Cookies We Set</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-bold text-slate-900">Account related cookies:</span> If you create an account with us then we will use cookies for the management of the signup process and general administration.
                  </li>
                  <li>
                    <span className="font-bold text-slate-900">Login related cookies:</span> We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page.
                  </li>
                  <li>
                    <span className="font-bold text-slate-900">Site preferences cookies:</span> In order to provide you with a great experience on this site we provide the functionality to set your preferences for how this site runs when you use it.
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">5. Third Party Cookies</h2>
                <p>In some special cases we also use cookies provided by trusted third parties. The following section details which third party cookies you might encounter through this site.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>This site uses Google Analytics which is one of the most widespread and trusted analytics solutions on the web for helping us to understand how you use the site and ways that we can improve your experience.</li>
                </ul>
              </section>
            </div>
            
            <div className="mt-12 pt-8 border-t border-slate-100">
              <Link href="/" className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors inline-flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
