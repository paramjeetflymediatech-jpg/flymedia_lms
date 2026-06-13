import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Help Center & FAQ | Flymedia Technology',
  description: 'Find answers to common questions about our courses, enrollment, and platform.',
};

const faqs = [
  {
    category: "General",
    questions: [
      {
        q: "What is Flymedia Technology?",
        a: "Flymedia Technology is a premier learning platform offering professional courses in Digital Marketing, Web Development, Graphic Design, Video Editing, and more. We focus on practical, industry-ready skills to help you scale your career."
      },
      {
        q: "Are the courses online or offline?",
        a: "We offer flexible learning modes. Depending on the specific package you choose, you can attend online live classes, offline in-person sessions at our campus, or a hybrid of both."
      },
      {
        q: "Do I get a certificate upon completion?",
        a: "Yes! All our professional courses come with an industry-recognized certificate upon successful completion of the modules and final project."
      }
    ]
  },
  {
    category: "Enrollment & Payment",
    questions: [
      {
        q: "How do I enroll in a course?",
        a: "Simply browse our Courses page, select the package that fits your goals, and click 'Enroll Now'. You will be prompted to create an account and complete the payment process securely."
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit/debit cards, UPI, Net Banking, and popular digital wallets through our secure Razorpay payment gateway."
      },
      {
        q: "Do you offer refunds?",
        a: "We have a strict quality policy. If you are not satisfied with the course within the first 3 days of your enrollment, you can request a full refund, no questions asked."
      }
    ]
  },
  {
    category: "Learning Experience",
    questions: [
      {
        q: "How do I access my live classes?",
        a: "Once enrolled, navigate to your Student Dashboard. Under 'My Packages', you'll find the schedule and meeting links for all your upcoming live classes."
      },
      {
        q: "What if I miss a live class?",
        a: "Don't worry! All our online live sessions are recorded and made available in your dashboard within 24 hours, so you can catch up at your own pace."
      },
      {
        q: "Do I get access to tutors for doubts?",
        a: "Absolutely. We believe in mentorship. You can ask questions during live classes, or use the 'Book Session' feature in your dashboard to schedule a 1-on-1 doubt clearing session with your assigned tutor."
      }
    ]
  }
];

export default function HelpCenterPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50 relative overflow-hidden pt-20 pb-32">
        {/* Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-900 via-slate-900 to-slate-50 z-0" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-500/10 blur-[100px] rounded-full pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05] pointer-events-none z-0" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header Section */}
          <div className="text-center space-y-6 mb-16 pt-10">
            <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
              How can we help you?
            </h1>
            <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
              Search our knowledge base or browse frequently asked questions to find exactly what you need.
            </p>
            
            {/* Search Bar Placeholder */}
            <div className="max-w-xl mx-auto mt-8 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input 
                type="text" 
                placeholder="Search for articles, questions, or topics..." 
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white shadow-xl shadow-black/5 border-0 focus:ring-4 focus:ring-blue-500/20 text-slate-900 text-lg transition-all"
              />
            </div>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-12">
            {faqs.map((category, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
                <h2 className="text-2xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </span>
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((faq, fIdx) => (
                    <details 
                      key={fIdx} 
                      className="group border border-slate-200 rounded-2xl bg-slate-50 overflow-hidden [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-slate-800 text-lg hover:text-blue-600 transition-colors">
                        {faq.q}
                        <span className="ml-4 shrink-0 w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-open:rotate-180 group-open:bg-blue-600 group-open:text-white group-open:border-blue-600 transition-all duration-300">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </span>
                      </summary>
                      <div className="px-6 pb-6 text-slate-600 leading-relaxed bg-white border-t border-slate-100 pt-4 text-base">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Still Need Help? */}
          <div className="mt-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-2xl shadow-blue-900/20">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Still need help?</h2>
              <p className="text-blue-100 text-lg mb-8 max-w-lg mx-auto">
                Can't find the answer you're looking for? Our support team is here to assist you with anything you need.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/contact" className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:bg-slate-50 hover:scale-105 transition-all w-full sm:w-auto">
                  Contact Support
                </Link>
                <a href="mailto:support@flymediatech.com" className="px-8 py-4 bg-blue-700/50 text-white font-bold rounded-xl border border-blue-500 hover:bg-blue-700 transition-all w-full sm:w-auto backdrop-blur-sm">
                  Email Us
                </a>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
