import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';

export const metadata = {
  title: 'Contact Us | Flymedia Technology Summer Training',
  description: 'Apply for summer training or get in touch with our Ludhiana admissions office for course details, timing, and fee configurations.',
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Main Title */}
          <div className="text-center space-y-4">
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Connect With Us</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Get in Touch
            </h1>
            <p className="text-lg text-slate-650 max-w-xl mx-auto">
              Ready to accelerate your career? Drop an inquiry or visit our centers to register for the 30-day summer training bootcamp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-sm">
            {/* Contact Details */}
            <div className="space-y-8 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">Training Offices</h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Call our admissions helpline or walk in to discuss timing schedules and project curricula.
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex items-start space-x-3 text-slate-700 text-xs leading-relaxed">
                  <span className="text-base mt-0.5">📍</span>
                  <div>
                    <strong className="block text-slate-900">India Head Office:</strong>
                    <span>Plot no, 20, Vishal Nagar Ext, Vishal Nagar, Ludhiana, Punjab 141001</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3 text-slate-700 text-xs leading-relaxed">
                  <span className="text-base mt-0.5">📍</span>
                  <div>
                    <strong className="block text-slate-900">Australia Office:</strong>
                    <span>35 Edgewood Dr, Stanhope Gardens NSW 2768, Australia</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3 text-slate-700 text-xs leading-relaxed">
                  <span className="text-base mt-0.5">📍</span>
                  <div>
                    <strong className="block text-slate-900">Canada Office:</strong>
                    <span>7664 126a St, Surrey, BC V3W 4A9, Canada</span>
                  </div>
                </div>
                
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="flex items-center space-x-3 text-slate-700 text-xs">
                    <span className="text-base">✉️</span>
                    <span>anujguptaflymedia@gmail.com</span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-700 text-xs">
                    <span className="text-base">📞</span>
                    <span className="font-semibold text-slate-900">+91-98884-84310</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400">
                Admissions open Monday through Friday, 9:00 AM to 6:00 PM IST.
              </div>
            </div>

            {/* Simple Contact Form */}
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-slate-750 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 transition-all text-xs text-slate-900"
                  placeholder="Jane Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-750 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 transition-all text-xs text-slate-900"
                  placeholder="jane@example.com"
                />
              </div>

              <div>
                <label htmlFor="course" className="block text-xs font-bold text-slate-750 mb-2">
                  Course of Interest
                </label>
                <select
                  id="course"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 transition-all text-xs text-slate-900"
                >
                  <option value="digital-marketing">Digital Marketing</option>
                  <option value="web-development">Web Development</option>
                  <option value="video-editing">Video Editing</option>
                  <option value="graphic-designing">Graphic Designing</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-bold text-slate-750 mb-2">
                  Message Details
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 transition-all text-xs text-slate-900"
                  placeholder="Tell us about your background and schedule availability..."
                />
              </div>

              <button
                type="submit"
                disabled
                className="w-full inline-flex items-center justify-center px-6 py-3.5 font-bold text-white bg-[#ff9900] hover:bg-[#e08800] rounded-xl transition-all shadow text-xs cursor-pointer"
              >
                Send Registration Inquiry
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
