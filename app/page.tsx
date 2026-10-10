import Link from 'next/link';
import Header from '../src/components/layout/Header';
import Footer from '../src/components/layout/Footer';
import HeroSlider from '../src/components/home/HeroSlider';
import CallbackForm from '../src/components/home/CallbackForm';
import TestimonialsSlider from '../src/components/home/TestimonialsSlider';
import FaqAccordion from '../src/components/home/FaqAccordion';
import GsapReveal from '../src/components/animations/GsapReveal';
import GsapHorizontalScroll from '../src/components/animations/GsapHorizontalScroll';
import GsapScrubText from '../src/components/animations/GsapScrubText';
import GsapParallaxText from '../src/components/animations/GsapParallaxText';
import SplitText from '../src/components/animations/SplitText';
import SmoothScroller from '../src/components/animations/SmoothScroller';
import { Package, SeoSetting, Testimonial, Faq } from '../src/db/models';
import { Metadata } from 'next';

export const revalidate = 0; // Dynamic rendering to fetch courses

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seo = await SeoSetting.findOne({ where: { pagePath: '/' } });
    if (seo) {
      return {
        title: seo.title,
        description: seo.description,
        keywords: seo.keywords ? seo.keywords.split(',').map((k: string) => k.trim()) : undefined,
      };
    }
  } catch (e) {
    console.error('Failed to load SEO for homepage:', e);
  }

  return {
    title: "Flymedia Academy LMS",
    description: "Premium learning management system.",
  };
}

export default async function HomePage() {
  let packages: Package[] = [];
  let testimonials: any[] = [];
  let faqs: any[] = [];
  try {
    packages = await Package.findAll({ where: { status: 'PUBLISHED' }, limit: 4 });
    const testimonialsData = await Testimonial.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
      limit: 6
    });
    testimonials = testimonialsData.map(t => t.toJSON());

    const faqsData = await Faq.findAll({
      where: { isActive: true },
      order: [['order', 'ASC'], ['createdAt', 'ASC']]
    });
    faqs = faqsData.map(f => f.toJSON());
  } catch (error) {
    console.error('Failed to load data for homepage:', error);
  }

  return (
    <SmoothScroller>
      <Header />
      <main className="flex-1 bg-[#fafafa]">

        <HeroSlider />

        {/* GSAP Massive Parallax & Scrub About Section */}
        <section className="py-32 bg-white relative overflow-hidden">
          {/* Parallax Background Text */}
          <div className="absolute top-20 left-0 w-full pointer-events-none opacity-5">
            <GsapParallaxText text="FLYMEDIA" className="text-[12rem] md:text-[20rem] text-slate-900" direction="left" speed={0.5} />
          </div>
          <div className="absolute bottom-20 left-0 w-full pointer-events-none opacity-5">
            <GsapParallaxText text="TECHNOLOGY" className="text-[10rem] md:text-[16rem] text-slate-900" direction="right" speed={0.3} />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row gap-16 md:gap-24 items-start">
            
            {/* Sticky Left Sidebar (H1 & Tags) */}
            <div className="md:w-1/3 md:sticky md:top-32 space-y-8">
              <GsapReveal animation="slideRight">
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] flex flex-wrap items-center gap-x-2 md:gap-x-4">
                  <SplitText text="Welcome To" type="words" delay={0.1} />
                  <img src="/logo.png" alt="Flymedia Logo" className="h-12 sm:h-16 md:h-20 object-contain mt-2 sm:mt-0" />
                </h1>
                <p className="mt-6 text-lg text-slate-500 font-medium leading-relaxed">
                  The choice that makes a huge difference in your career.
                </p>
                <div className="flex flex-wrap gap-2 pt-8">
                  {['Time flexibility', 'Batch flexibility', 'Affordable fee', 'Live project', 'Industry scenarios'].map((item, index) => (
                    <GsapReveal key={item} animation="slideUp" delay={0.3 + (index * 0.15)} className="inline-block">
                      <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider block">
                        {item}
                      </span>
                    </GsapReveal>
                  ))}
                </div>
              </GsapReveal>
            </div>

            {/* Right Side Scrolling Content */}
            <div className="md:w-2/3 space-y-32">
              
              {/* Scrubbed About Text */}
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed tracking-tight">
                <GsapScrubText 
                  text="At Flymedia Technology, under the guidance of professionals, we provide courses that are based on a quality concept. We focus on providing concept-based courses rather than cramming how to use the latest technology. We teach graphic design, web design, MERN stack, digital marketing and video editing using the latest tools." 
                />
              </div>

            </div>
          </div>

          {/* Full Width H2 Card Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-32">
            <GsapReveal animation="slideUp">
              <div className="group relative">
                {/* Animated border glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-rose-500 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                
                <div className="relative bg-slate-950 p-8 sm:p-10 md:p-16 rounded-[2.5rem] overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 blur-[100px] rounded-full" />
                  <div className="relative z-10 space-y-8">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight flex flex-wrap gap-x-2 md:gap-x-3">
                      <SplitText text="We Don't Just Educate," type="words" delay={0.2} className="text-white" />
                      <SplitText text="We Give Opportunities." type="words" delay={0.4} className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent" />
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8 text-slate-300 font-medium text-base sm:text-lg leading-relaxed mt-4">
                      <GsapReveal animation="slideUp" delay={0.6}>
                        <p>
                          Flymedia Technology has a renowned name in the industry for providing the best Computer courses in Punjab. Every student gets the opportunity to learn the skills at the exact same expert level.
                        </p>
                      </GsapReveal>
                      <GsapReveal animation="slideUp" delay={0.8}>
                        <p>
                          We guide the students and give them the opportunity to work on live projects with our professional team. Students who get trained at Flymedia get the opportunity to work with us as an employee after completing the course, or are well-trained to secure their careers elsewhere.
                        </p>
                      </GsapReveal>
                    </div>
                  </div>
                </div>
              </div>
            </GsapReveal>
          </div>
        </section>


        <section className="bg-slate-950 text-white relative z-20">
          <GsapHorizontalScroll>
            <div className="flex px-4 md:px-20 gap-8 sm:gap-16 items-center">
              <div className="w-[85vw] sm:w-[40vw] shrink-0 space-y-6">
                <h3 className="text-4xl sm:text-6xl font-black text-white leading-tight">
                  Choice That Makes a <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">Huge Difference</span> In Your Career
                </h3>
                <p className="text-slate-400 text-lg font-medium">Scroll to see why students choose Flymedia Technology.</p>
              </div>

              <div className="w-[85vw] sm:w-[50vw] md:w-[45vw] lg:w-[35vw] shrink-0 bg-white/5 backdrop-blur-xl p-8 sm:p-10 lg:p-12 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-colors h-auto min-h-[450px] lg:min-h-[500px] flex flex-col">
                <div className="w-16 h-16 bg-orange-500/20 text-orange-400 rounded-3xl flex items-center justify-center mb-8 shrink-0">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </div>
                <h4 className="text-2xl sm:text-3xl font-bold text-white mb-6">Hands-on Training</h4>
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed flex-1">We believe that students can gain more skills if they do the practice on their own. Our courses are designed to be fully hands-on so that students can gain the skills and understand the concept in detail. Gaining the skills by doing hands-on practice allows the student to solve real-life scenarios.</p>
              </div>
              
              <div className="w-[85vw] sm:w-[50vw] md:w-[45vw] lg:w-[35vw] shrink-0 bg-white/5 backdrop-blur-xl p-8 sm:p-10 lg:p-12 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-colors h-auto min-h-[450px] lg:min-h-[500px] flex flex-col">
                <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-3xl flex items-center justify-center mb-8 shrink-0">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h4 className="text-2xl sm:text-3xl font-bold text-white mb-6">Expert Trainers</h4>
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed flex-1">Our trainers are expert IT professionals who have years of experience guiding students in online AI courses in India. Students get the opportunity to gain skills related to IT and AI, along with web designing, graphic designing or any of the courses they opt for.</p>
              </div>
              
              <div className="w-[85vw] sm:w-[50vw] md:w-[45vw] lg:w-[35vw] shrink-0 bg-white/5 backdrop-blur-xl p-8 sm:p-10 lg:p-12 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-colors h-auto min-h-[450px] lg:min-h-[500px] flex flex-col pr-8">
                <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-3xl flex items-center justify-center mb-8 shrink-0">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
                <h4 className="text-2xl sm:text-3xl font-bold text-white mb-6">Cutting-edge Curriculum</h4>
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed flex-1">Stay ahead with a cutting-edge curriculum that covers the latest technologies and tools. Learning the latest technologies and tools is useful for students to stay in touch with the market trends of the technical industry and the demand for the skills they want.</p>
              </div>
            </div>
          </GsapHorizontalScroll>
        </section>

        <section className="py-16 sm:py-24 relative overflow-hidden bg-white z-10">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-rose-500/5 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <GsapReveal animation="slideLeft">
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 sm:mb-12 md:mb-16 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4 max-w-2xl">
                  <div className="inline-flex items-center space-x-2 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-slate-50 border border-slate-200 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-500 animate-pulse" />
                    <span>Training Modules</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight sm:leading-[1.1]">
                    Explore Our <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent block sm:inline">Premium Tracks</span>
                  </h2>
                  <p className="text-base sm:text-lg text-slate-600 font-medium">
                    Master the most in-demand skills with our intensive, industry-aligned training programs.
                  </p>
                </div>
                <Link
                  href="/packages"
                  className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3.5 sm:py-3 text-sm font-bold text-white transition-all rounded-xl sm:rounded-2xl shadow-lg shadow-rose-500/25 hover:-translate-y-0.5 hover:shadow-rose-500/40 shrink-0"
                  style={{ background: 'linear-gradient(135deg, #E60870 0%, #E63747 50%, #F8750E 100%)' }}
                >
                  View All Programs →
                </Link>
              </div>
            </GsapReveal>

            {packages.length === 0 ? (
              <div className="text-center p-8 sm:p-16 bg-white rounded-3xl sm:rounded-[3rem] border border-slate-100 max-w-2xl mx-auto shadow-sm">
                <div className="w-20 h-20 mx-auto bg-orange-50 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
                  ✨
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">New Programs Coming Soon!</h3>
                <p className="text-sm sm:text-lg text-slate-500 font-medium leading-relaxed">
                  Our expert instructors are currently crafting an incredible new lineup of premium courses. Check back shortly to accelerate your career!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {packages.map((pkg, idx) => (
                  <GsapReveal key={pkg.id} animation="slideUp" delay={idx * 0.1}>
                  <Link 
                    href={`/packages/${pkg.slug}`} 
                    className="group flex flex-col h-full bg-white rounded-[2rem] border border-slate-100 shadow-md hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                  >
                    {/* Image Header */}
                    <div className="h-56 sm:h-64 relative overflow-hidden bg-slate-900 w-full">
                      {pkg.thumbnail ? (
                        <img
                          src={pkg.thumbnail}
                          alt={pkg.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-5xl">📚</div>
                      )}
                      
                      {/* Gradient overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent opacity-80" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                        <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-white/95 text-slate-900 backdrop-blur-md uppercase tracking-wider shadow-sm">
                          PROGRAM
                        </span>
                        {pkg.mode && (
                          <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-md shadow-sm border ${
                            pkg.mode === 'ONLINE' ? 'bg-blue-500/30 text-blue-100 border-blue-400/40' :
                            pkg.mode === 'OFFLINE' ? 'bg-orange-500/30 text-orange-100 border-orange-400/40' :
                            'bg-indigo-500/30 text-indigo-100 border-indigo-400/40'
                          }`}>
                            {pkg.mode === 'BOTH' ? 'Online & Offline' : pkg.mode}
                          </span>
                        )}
                      </div>

                      {/* Bottom Image Info */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                         <div className="flex items-center gap-1.5 text-white/90 text-sm font-bold">
                            <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            4.9
                         </div>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-6 md:p-8 flex-1 flex flex-col relative bg-white">
                      {/* Price Badge (floating) */}
                      <div className="absolute -top-6 right-6 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black px-4 py-2 rounded-xl shadow-lg shadow-orange-500/30 transform group-hover:-translate-y-1 transition-transform">
                        {pkg.price && Number(pkg.price) > 0 ? `₹${Number(pkg.price).toLocaleString('en-IN')}` : 'Free'}
                      </div>

                      <div className="flex-1 space-y-4 pt-2">
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
                          {pkg.title}
                        </h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3">
                          {pkg.description?.replace(/<[^>]*>?/gm, '')}
                        </p>
                      </div>

                      {/* Footer CTA */}
                      <div className="mt-8 flex items-center justify-between text-sm font-bold text-slate-900 border-t border-slate-100 pt-5">
                        <span className="group-hover:text-orange-600 transition-colors">View Details</span>
                        <span className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-orange-50 group-hover:border-orange-200 group-hover:text-orange-600 transition-colors">
                          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                  </GsapReveal>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Expert Mentor & Apply Section */}
        <section className="py-16 bg-slate-50 relative overflow-hidden border-t border-slate-100">
          {/* Animated Glow Backdrops */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/5 blur-[100px] -z-10 rounded-full animate-pulse" />
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-rose-500/5 blur-[100px] -z-10 rounded-full" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Mentor & Value Prop */}
            <GsapReveal animation="slideRight">
              <div className="space-y-10">
                <div className="space-y-6">
                  <h2 className="text-5xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                    Transform Your Career in <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">30 Days</span>
                  </h2>
                </div>

                <div className="p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 p-[2px] shadow-sm">
                        <img src="/Anujgupta.png" alt="Anuj Gupta" className="h-full w-full object-cover rounded-full bg-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-slate-900">Anuj Gupta</h4>
                        <p className="text-orange-600 text-xs font-bold uppercase tracking-wider">Meet Our Founder</p>
                      </div>
                    </div>
                    <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium">
                      Google AdWords Certified Digital Marketing Expert. Connect directly with years of professional agency strategy and learn how to optimize campaigns, design web frameworks, and launch systems.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-orange-500 hover:shadow-md transition-all group cursor-pointer">
                    <span className="block text-slate-500 text-xs uppercase font-bold tracking-wider mb-2">Direct Call Support</span>
                    <a href="tel:+919888484310" className="text-xl sm:text-xl font-black text-slate-900 group-hover:text-orange-600 transition-colors">+91-97793-24178</a>
                  </div>
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-rose-500 hover:shadow-md transition-all group cursor-pointer">
                    <span className="block text-slate-500 text-xs uppercase font-bold tracking-wider mb-2">Email Admissions</span>
                    <a href="mailto:admissions@flymediatech.com" className="text-base sm:text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors truncate block">admissions@flymediatech.com</a>
                  </div>
                </div>
              </div>
            </GsapReveal>

            {/* Premium CTA Form */}
            <GsapReveal animation="slideLeft" delay={0.2}>
              <div className="relative">
                {/* Form glowing shadow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-rose-500/10 blur-3xl rounded-[3rem] -z-10" />

                <div className="bg-white border border-slate-100 p-8 sm:p-12 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                  {/* Shine effect */}
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none" />

                  <div className="relative z-10 space-y-8">
                    <div className="space-y-3">
                      <h3 className="text-3xl sm:text-4xl font-black text-slate-900">Request Callback</h3>
                      <p className="text-slate-500 font-medium text-sm sm:text-base">Secure your spot. Fill in the details and our advisor will connect regarding timings & fee structures.</p>
                    </div>
                    <CallbackForm />
                  </div>
                </div>
              </div>
            </GsapReveal>

          </div>
        </section>


        {/* Dynamic Testimonials Section */}
        {testimonials.length > 0 && (
          <section className="py-20 bg-slate-50 relative overflow-hidden border-t border-slate-100">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
              <GsapReveal animation="slideUp">
                <div className="text-center max-w-3xl mx-auto space-y-4">
                  <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Testimonials</h2>
                  <p className="text-lg text-slate-600 font-medium">
                    Hear directly from the students who built their careers with us.
                  </p>
                </div>
              </GsapReveal>

              <GsapReveal animation="fade" delay={0.2}>
                <TestimonialsSlider testimonials={testimonials} />
              </GsapReveal>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        {faqs.length > 0 && (
          <section className="py-20 bg-white relative overflow-hidden border-t border-slate-100">
            <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[500px] h-[500px] rounded-full bg-orange-50/50 blur-3xl pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start">
                <GsapReveal animation="slideRight" className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-bold text-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    Got Questions?
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">Questions</span>
                  </h2>
                  <p className="text-lg text-slate-600 font-medium">
                    Find answers to the most common questions about our courses, schedule, and certification process. Can't find what you're looking for? Reach out to our team.
                  </p>
                </GsapReveal>
                
                <GsapReveal animation="slideLeft" delay={0.2} className="lg:col-span-7">
                  <FaqAccordion faqs={faqs} />
                </GsapReveal>
              </div>
            </div>
          </section>
        )}

    

        {/* Location / Map Section */}
        <section className="py-20 bg-slate-50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <GsapReveal animation="slideUp">
              <div className="text-center mb-12">
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                  Visit Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">Campus</span>
                </h2>
                <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
                  Drop by our headquarters for a cup of coffee and let's discuss how we can accelerate your tech career.
                </p>
              </div>
            </GsapReveal>
            
            <GsapReveal animation="zoomIn" delay={0.2}>
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-200 h-[450px] group bg-white">
                <iframe 
                  src="https://maps.google.com/maps?q=Learn%20With%20Flymedia,%20Ludhiana&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 w-full h-full"
                ></iframe>
                
                {/* Floating Info Card */}
                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-xl shadow-black/10 max-w-sm border border-slate-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Headquarters</h4>
                      <p className="text-sm font-bold text-orange-500">Ludhiana, Punjab</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm font-medium leading-relaxed mb-4">
                    First Floor, Plot 20, Vishal Nagar Ext, opposite Kashish Cafe, Vishal Nagar, Jawaddi Taksal, Ludhiana, Punjab 141013, India
                  </p>
                  <a href="https://www.google.com/maps/dir//Learn+With+Flymedia,+First+Floor,+Plot+20,+Vishal+Nagar+Ext,+opposite+Kashish+Cafe,+Vishal+Nagar,+Jawaddi+Taksal,+Ludhiana,+Punjab+141013,+India/@30.9003452,75.8566733,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x391a83053a2c6f9d:0x1beaed8f1198aa16!2m2!1d75.820215!2d30.8795234?authuser=0&hl=en-GB&entry=ttu&g_ep=EgoyMDI2MTAwNy4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors duration-300 text-sm">
                    Get Directions
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </a>
                </div>
              </div>
            </GsapReveal>
          </div>
        </section>

      </main>
      <Footer />
    </SmoothScroller>
  );
}
