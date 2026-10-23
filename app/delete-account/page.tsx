import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Request Account & Data Deletion | Flymedia LMS',
  description: 'Request permanent deletion of your Flymedia Academy LMS account and associated personal data.',
};

export default function DeleteAccountPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-10 sm:px-12 sm:py-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-xs font-semibold mb-6">
              Google Play Data Safety & Privacy Policy Compliance
            </div>
            
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
              Request Account & Personal Data Deletion
            </h1>
            
            <p className="text-slate-600 leading-relaxed mb-8">
              At <strong>Flymedia Technology (Flymedia LMS)</strong>, we respect your privacy and give you full control over your personal data. In accordance with Google Play Developer Policies and global data privacy standards, you can permanently delete your account and all associated records at any time.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 text-amber-900">
              <h2 className="font-bold text-base mb-2">⚠️ What happens when you delete your account:</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li>Your profile credentials (name, email, authentication tokens) are permanently destroyed.</li>
                <li>Your course enrollment records, attendance history, and learning progress are removed.</li>
                <li>Your issued completion certificates and class bookmarks will no longer be accessible.</li>
                <li>This action is <strong>immediate and irreversible</strong>.</li>
              </ul>
            </div>

            <div className="space-y-8">
              {/* Option 1: In-App */}
              <div className="border border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition-colors">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Option 1: Delete Directly Inside the Flymedia LMS App</h3>
                <ol className="list-decimal pl-5 text-sm text-slate-600 space-y-1.5 mb-4">
                  <li>Open the <strong>Flymedia LMS</strong> mobile application on your device.</li>
                  <li>Go to the <strong>Profile</strong> tab in the bottom navigation bar.</li>
                  <li>Scroll to the <strong>Danger Zone</strong> section at the bottom.</li>
                  <li>Tap <strong>Delete Account</strong> and confirm your request.</li>
                  <li>Your account and data will be erased immediately.</li>
                </ol>
              </div>

              {/* Option 2: Web / Email Request */}
              <div className="border border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition-colors">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Option 2: Web Request (If you uninstalled the app)</h3>
                <p className="text-sm text-slate-600 mb-4">
                  If you have already uninstalled the mobile app, you can submit an account deletion request directly to our admissions & privacy officer:
                </p>
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 space-y-2">
                  <p><strong>Email:</strong> <a href="mailto:learnwithflymedia@gmail.com" className="text-orange-600 underline">learnwithflymedia@gmail.com</a></p>
                  <p><strong>Subject:</strong> Account Deletion Request - Flymedia LMS</p>
                  <p><strong>Helpline / WhatsApp:</strong> +91-97793-24178</p>
                  <p><strong>Campus Address:</strong> Plot 20, Vishal Nagar Ext, Jawaddi, Ludhiana, Punjab - 141013</p>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Please send your request from the registered email address. Requests are processed within 24–48 hours.
                </p>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap gap-4 text-sm text-slate-500">
              <Link href="/privacy" className="text-orange-600 hover:underline">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/terms" className="text-orange-600 hover:underline">
                Terms of Service
              </Link>
              <span>•</span>
              <Link href="/" className="text-orange-600 hover:underline">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
