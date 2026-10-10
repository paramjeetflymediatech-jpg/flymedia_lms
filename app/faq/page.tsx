import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import Link from 'next/link';
import { Faq } from '../../src/db/models';
import FaqAccordion from '../../src/components/home/FaqAccordion';
import GsapReveal from '../../src/components/animations/GsapReveal';
import SplitText from '../../src/components/animations/SplitText';
import SmoothScroller from '../../src/components/animations/SmoothScroller';

export const metadata = {
  title: 'Help Center & FAQ | Flymedia Technology',
  description: 'Find answers to common questions about our courses, enrollment, and platform.',
};

export const revalidate = 0;

export default async function HelpCenterPage() {
  let dbFaqs: any[] = [];
  try {
    const records = await Faq.findAll({ where: { isActive: true }, order: [['order', 'ASC']] });
    dbFaqs = records.map(f => f.toJSON());
  } catch (error) {
    console.error(error);
  }

  // Fallback data in case DB is empty or fails
  const fallbackFaqs = [
      {
        question: "What is Flymedia Technology?",
        answer: "Flymedia Technology is a premier learning platform offering professional courses in Digital Marketing, Web Development, Graphic Design, Video Editing, and more. We focus on practical, industry-ready skills to help you scale your career."
      },
      {
        question: "Are the courses online or offline?",
        answer: "We offer flexible learning modes. Depending on the specific package you choose, you can attend online live classes, offline in-person sessions at our campus, or a hybrid of both."
      },
      {
        question: "Do I get a certificate upon completion?",
        answer: "Yes! All our professional courses come with an industry-recognized certificate upon successful completion of the modules and final project."
      },
      {
        question: "How do I enroll in a course?",
        answer: "Simply browse our Courses page, select the package that fits your goals, and click 'Enroll Now'. You will be prompted to create an account and complete the payment process securely."
      }
  ];

  const faqsToDisplay = dbFaqs.length > 0 ? dbFaqs : fallbackFaqs;

  return (
    <SmoothScroller>
      <Header />
      <main className="flex-1 bg-slate-50 relative overflow-hidden pt-32 pb-32">
        {/* Modern Vibrant Gradient Background */}
        <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 z-0" />
        <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
        <div className="absolute -top-20 left-1/4 w-[600px] h-[600px] bg-rose-500/10 blur-[100px] rounded-full pointer-events-none z-0" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header Section */}
          <div className="text-center space-y-8 mb-24 pt-10">
            <GsapReveal animation="slideUp" duration={0.8}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-400 font-bold text-sm tracking-widest uppercase mb-4 shadow-xl backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                Support Center
              </div>
            </GsapReveal>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white leading-tight tracking-tight drop-shadow-sm flex flex-col items-center justify-center">
              <SplitText text="How can we" type="words" delay={0.1} />
              <SplitText text="help you?" type="chars" delay={0.3} className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent" />
            </h1>

            <GsapReveal animation="slideUp" delay={0.4}>
              <p className="text-xl text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto mt-6">
                Search our knowledge base or browse frequently asked questions to find exactly what you need.
              </p>
            </GsapReveal>
            
            {/* Search Bar */}
            <GsapReveal animation="slideUp" delay={0.5}>
              <div className="max-w-2xl mx-auto mt-12 relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Search for articles, questions, or topics..." 
                  className="w-full pl-16 pr-6 py-5 rounded-2xl bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/20 border border-white/20 focus:bg-white focus:ring-4 focus:ring-orange-500/20 text-white focus:text-slate-900 text-lg sm:text-xl transition-all placeholder:text-slate-400"
                />
              </div>
            </GsapReveal>
          </div>

          {/* Main Grid: Info + FAQ */}
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-start">
            
            {/* Left Sidebar */}
            <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-8">
              <GsapReveal animation="slideRight">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                  <h3 className="text-2xl font-black text-slate-900 mb-6">Didn't find what you're looking for?</h3>
                  <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                    Our support team is always ready to assist you. Don't hesitate to reach out to us directly.
                  </p>
                  <div className="space-y-4">
                    <Link href="/contact" className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-rose-500/25">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      Contact Support
                    </Link>
                    <a href="mailto:support@flymediatech.com" className="w-full py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors">
                      Email Us
                    </a>
                  </div>
                </div>
              </GsapReveal>
            </div>

            {/* Right Side FAQs */}
            <div className="lg:col-span-8">
              <GsapReveal animation="slideUp" delay={0.2}>
                <div className="bg-white p-6 sm:p-10 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                  <h2 className="text-3xl font-black text-slate-900 mb-8">Frequently Asked Questions</h2>
                  <FaqAccordion faqs={faqsToDisplay} />
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
