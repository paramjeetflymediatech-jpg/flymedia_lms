import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | Flymedia Technology',
  description: 'Privacy Policy for Flymedia Technology.',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-8 py-10 sm:px-12 sm:py-16">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-8">Privacy Policy</h1>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
              <p className="font-medium text-slate-900">Last updated: {new Date().toLocaleDateString()}</p>
              
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">1. Information We Collect</h2>
                <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.</p>
              </section>
              
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">2. How We Use Your Information</h2>
                <p>We may use the information we collect about you to:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Provide, maintain, and improve our services;</li>
                  <li>Perform internal operations, including troubleshooting bugs and operational problems;</li>
                  <li>Send you communications we think will be of interest to you;</li>
                  <li>Personalize and improve the services.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">3. Sharing of Information</h2>
                <p>We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including as follows:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>With third party service providers who need access to such information to carry out work on our behalf;</li>
                  <li>In response to a request for information by a competent authority if we believe disclosure is in accordance with, or is otherwise required by, any applicable law, regulation, or legal process;</li>
                  <li>With law enforcement officials, government authorities, or other third parties if we believe your actions are inconsistent with our user agreements or policies.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">4. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at anujguptaflymedia@gmail.com.</p>
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
