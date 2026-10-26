import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import Link from 'next/link';
import { Faq } from '../../src/db/models';
import FaqPageTabs from '../../src/components/faq/FaqPageTabs';
import FaqSchema from '../../src/components/seo/FaqSchema';
import GsapReveal from '../../src/components/animations/GsapReveal';
import SplitText from '../../src/components/animations/SplitText';
import SmoothScroller from '../../src/components/animations/SmoothScroller';

import { Metadata } from 'next';
import { getSeoMetadata } from '../../src/lib/seo';
import PageSeoScripts from '../../src/components/common/PageSeoScripts';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/faq', {
    title: 'Help Center & FAQ | Flymedia Technology',
    description: 'Find answers to common questions about our courses, enrollment, partnerships, and platform.',
  });
}

export default async function HelpCenterPage() {
  let dbFaqs: any[] = [];
  try {
    const records = await Faq.findAll({ where: { isActive: true }, order: [['order', 'ASC']] });
    dbFaqs = records.map(f => f.toJSON());
  } catch (error) {
    console.error(error);
  }

  const faqsToDisplay = dbFaqs;

  return (
    <SmoothScroller>
      <PageSeoScripts path="/faq" />
      <FaqSchema faqs={faqsToDisplay} />
      <Header />
      <main className="flex-1 bg-slate-50 relative overflow-hidden pt-32 pb-32">
        {/* Modern Vibrant Gradient Background */}
        <div className="absolute top-0 inset-x-0 h-[550px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 z-0" />
        <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
        <div className="absolute -top-20 left-1/4 w-[600px] h-[600px] bg-rose-500/10 blur-[100px] rounded-full pointer-events-none z-0" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header Section */}
          <div className="text-center space-y-6 mb-16 pt-10">
            <GsapReveal animation="slideUp" duration={0.8}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-400 font-bold text-sm tracking-widest uppercase mb-4 shadow-xl backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                Support & Knowledge Base
              </div>
            </GsapReveal>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-tight tracking-tight drop-shadow-sm flex flex-col items-center justify-center">
              <SplitText text="How can we" type="words" delay={0.1} />
              <SplitText text="help you?" type="chars" delay={0.3} className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent" />
            </h1>

            <GsapReveal animation="slideUp" delay={0.4}>
              <p className="text-lg sm:text-xl text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
                Search our knowledge base or browse frequently asked questions organized by page and category.
              </p>
            </GsapReveal>
          </div>

          {/* Main Grid: Info + FAQ */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            
            {/* Left Sidebar */}
            <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-6">
              <GsapReveal animation="slideRight">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                  <h3 className="text-2xl font-black text-slate-900 mb-4">Didn't find what you're looking for?</h3>
                  <p className="text-slate-500 font-medium mb-6 leading-relaxed text-sm">
                    Our support team is always ready to assist you. Don't hesitate to reach out to us directly or visit our partnership portal.
                  </p>
                  <div className="space-y-3">
                    <Link href="/contact" className="w-full py-3.5 px-6 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-rose-500/25">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      Contact Support
                    </Link>
                    <Link href="/partner-with-us" className="w-full py-3.5 px-6 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors border border-orange-200">
                      🤝 Partner With Us
                    </Link>
                    <a href="mailto:support@flymediatech.com" className="w-full py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors">
                      Email Us
                    </a>
                  </div>
                </div>
              </GsapReveal>
            </div>

            {/* Right Side FAQs */}
            <div className="lg:col-span-8">
              <GsapReveal animation="slideUp" delay={0.2}>
                <div className="bg-white p-6 sm:p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                  <div className="mb-6">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Frequently Asked Questions</h2>
                    <p className="text-sm text-slate-500 mt-1">Browse by category or search for answers</p>
                  </div>
                  {faqsToDisplay.length > 0 ? (
                    <FaqPageTabs faqs={faqsToDisplay} />
                  ) : (
                    <div className="py-12 text-center text-slate-500">
                      <p className="font-bold text-lg text-slate-700">No FAQs Published Yet</p>
                      <p className="text-sm mt-1">Check back soon or contact our support team directly using the links on the left.</p>
                    </div>
                  )}
                </div>
              </GsapReveal>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </SmoothScroller>
  );
}
