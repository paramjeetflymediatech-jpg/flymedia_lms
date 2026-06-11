import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service | Flymedia Technology',
  description: 'Terms of Service for Flymedia Technology.',
};

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-8 py-10 sm:px-12 sm:py-16">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-8">Terms of Service</h1>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
              <p className="font-medium text-slate-900">Last updated: {new Date().toLocaleDateString()}</p>
              
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">1. Acceptance of Terms</h2>
                <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this website's particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>
              </section>
              
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">2. User Accounts</h2>
                <p>If you create an account on the website, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account and any other actions taken in connection with it.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">3. Intellectual Property</h2>
                <p>All content included on the website, such as text, graphics, logos, images, as well as the compilation thereof, and any software used on the site, is the property of Flymedia Technology or its suppliers and protected by copyright and other laws that protect intellectual property and proprietary rights.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">4. Termination</h2>
                <p>We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">5. Changes to Terms</h2>
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.</p>
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
