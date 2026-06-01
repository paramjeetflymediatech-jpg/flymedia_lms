import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import ContactForm from '../../src/components/contact/ContactForm';

export const metadata = {
  title: 'Contact Us | Flymedia Technology Summer Training',
  description: 'Apply for summer training or get in touch with our Ludhiana admissions office for course details, timing, and fee configurations.',
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white pt-10 pb-32 relative overflow-hidden">
        {/* Subtle Background Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
          
          {/* Header Section */}
          <div className="text-center max-w-4xl mx-auto space-y-6 pt-12">
            <h1 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Let's Start a <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">Conversation</span>
            </h1>
            <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              Ready to accelerate your career? Drop an inquiry or visit our centers to register for the 30-day summer training bootcamp.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            
            {/* Contact Details Cards */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-2xl">
                    📞
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Call Us</p>
                    <p className="text-xl font-black text-slate-900">+91-98884-84310</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-2xl">
                    ✉️
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Email Us</p>
                    <p className="text-base font-bold text-slate-900">anujguptaflymedia@gmail.com</p>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-6">
                <h3 className="text-xl font-black text-slate-900">Global Offices</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 group cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                      🇮🇳
                    </div>
                    <div>
                      <strong className="block text-slate-900 font-bold mb-1 group-hover:text-orange-600 transition-colors">India Head Office</strong>
                      <span className="text-sm text-slate-600 leading-relaxed font-medium">Plot no, 20, Vishal Nagar Ext, Vishal Nagar, Ludhiana, Punjab 141001</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 group cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                      🇦🇺
                    </div>
                    <div>
                      <strong className="block text-slate-900 font-bold mb-1 group-hover:text-blue-600 transition-colors">Australia Office</strong>
                      <span className="text-sm text-slate-600 leading-relaxed font-medium">35 Edgewood Dr, Stanhope Gardens NSW 2768, Australia</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 group cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                      🇨🇦
                    </div>
                    <div>
                      <strong className="block text-slate-900 font-bold mb-1 group-hover:text-rose-600 transition-colors">Canada Office</strong>
                      <span className="text-sm text-slate-600 leading-relaxed font-medium">7664 126a St, Surrey, BC V3W 4A9, Canada</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Premium Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-slate-100 p-8 sm:p-12 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-900">Send an Inquiry</h2>
                    <p className="text-slate-500 font-medium text-sm">Fill in the details below and our admissions team will get back to you within 24 hours.</p>
                  </div>

                  <ContactForm />
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
