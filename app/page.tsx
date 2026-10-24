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
import { Package, Testimonial, Faq, GalleryItem } from '../src/db/models';
import GallerySection from '../src/components/gallery/GallerySection';
import AppDownloadSection from '../src/components/home/AppDownloadSection';
import { Metadata } from 'next';
import { getSeoMetadata } from '../src/lib/seo';
import PageSeoScripts from '../src/components/common/PageSeoScripts';

export const revalidate = 0; // Dynamic rendering to fetch courses

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/');
}

export default async function HomePage() {
  let packages: Package[] = [];
  let allCoursesList: { id: string; title: string; category?: string }[] = [];
  let testimonials: any[] = [];
  let faqs: any[] = [];
  let galleryItems: any[] = [];

  try {
    const [featuredPkgs, allPkgs] = await Promise.all([
      Package.findAll({ where: { status: 'PUBLISHED' }, limit: 4 }),
      Package.findAll({
        where: { status: 'PUBLISHED' },
        attributes: ['id', 'title', 'slug', 'category'],
        order: [['title', 'ASC']],
      }),
    ]);
    packages = featuredPkgs;
    allCoursesList = allPkgs.map(p => ({
      id: p.slug || p.id,
      title: p.title,
      category: p.category || 'General',
    }));
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

    try {
      await GalleryItem.sync({ alter: true });
      const galleryData = await GalleryItem.findAll({
        where: { isActive: true },
        order: [['order', 'ASC'], ['createdAt', 'DESC']],
        limit: 6
      });
      galleryItems = galleryData.map(g => g.toJSON());
    } catch (gErr) {
      console.warn('GalleryItem sync/fetch warning:', gErr);
    }
  } catch (error) {
    console.error('Failed to load data for homepage:', error);
  }

  // Fallback demo items if no gallery items exist yet
  if (galleryItems.length === 0) {
    galleryItems = [
      {
        id: 'seed-home-1',
        title: 'Placed as Full Stack MERN Developer at Tech Mahindra',
        description: 'Completed 6-month live client project training at Flymedia Technology and cracked high-growth tech placement.',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
        studentName: 'Simran Kaur',
        courseName: 'Full Stack Web Development',
        companyPlaced: 'Tech Mahindra',
        salaryPackage: '₹6.5 LPA',
        rating: 5,
        category: 'PLACEMENT',
      },
      {
        id: 'seed-home-2',
        title: 'Video Review: Student Journey & Live Campaign Strategy',
        description: 'Watch how practical agency-level experience in SEO, PPC ads, and funnel design helped launch a full-time marketing career.',
        mediaType: 'VIDEO',
        mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnailUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
        studentName: 'Amanpreet Singh',
        courseName: 'Digital Marketing Masterclass',
        companyPlaced: 'Growth Media Group',
        salaryPackage: '₹5.8 LPA',
        rating: 5,
        category: 'VIDEO',
      },
      {
        id: 'seed-home-3',
        title: 'Placed as Motion Graphics Specialist at Media Works',
        description: 'Mastered Premiere Pro and After Effects while building 15+ broadcast videos and commercial reels under senior directors.',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        studentName: 'Gurpreet Singh',
        courseName: 'Video Editing & VFX',
        companyPlaced: 'Media Works Studios',
        salaryPackage: '₹4.8 LPA',
        rating: 5,
        category: 'PLACEMENT',
      },
    ];
  }

  return (
    <SmoothScroller>
      <PageSeoScripts path="/" />
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
                      <SplitText text="We Don't Just Educate,We Give Opportunities." type="words" delay={0.2} className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent" />
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
              <div className="w-[85vw] sm:w-[40vw]">
                <h3 className="text-4xl sm:text-6xl font-black text-white leading-tight">
                  Choice That Makes a <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">Huge Difference</span> In Your Career
                </h3>
                <p className="text-slate-400 text-lg font-medium">Scroll to see why students choose Flymedia Technology.</p>
              </div>

              <div className="w-[85vw] sm:w-[50vw] md:w-[45vw] lg:w-[35vw] shrink-0 bg-white/5 backdrop-blur-xl p-8 sm:p-10 lg:p-12 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-colors flex flex-col">
                <div className="w-16  bg-orange-500/20 text-orange-400 rounded-3xl flex items-center justify-center mb-8 shrink-0">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </div>
                <h4 className="text-2xl sm:text-3xl font-bold text-white mb-6">Hands-on Training</h4>
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed flex-1">We believe that students can gain more skills if they do the practice on their own. Our courses are designed to be fully hands-on so that students can gain the skills and understand the concept in detail. Gaining the skills by doing hands-on practice allows the student to solve real-life scenarios.</p>
              </div>

              <div className="w-[85vw] sm:w-[50vw] md:w-[45vw] lg:w-[35vw] shrink-0 bg-white/5 backdrop-blur-xl p-8 sm:p-10 lg:p-12 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-colors flex flex-col">
                <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-3xl flex items-center justify-center mb-8 shrink-0">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h4 className="text-2xl sm:text-3xl font-bold text-white mb-6">Expert Trainers</h4>
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed flex-1">Our trainers are expert IT professionals who have years of experience guiding students in online AI courses in India. Students get the opportunity to gain skills related to IT and AI, along with web designing, graphic designing or any of the courses they opt for.</p>
              </div>

              <div className="w-[85vw] sm:w-[50vw] md:w-[45vw] lg:w-[35vw] shrink-0 bg-white/5 backdrop-blur-xl p-8 sm:p-10 lg:p-12 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-colors flex flex-col pr-8">
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
                      <div className="w-full relative">
                        {pkg.thumbnail ? (
                          <img
                            src={pkg.thumbnail}
                            alt={pkg.title}
                            className="w-full h-auto block"
                          />
                        ) : (
                          <div className="w-full aspect-video flex items-center justify-center text-slate-300 text-5xl bg-slate-900">📚</div>
                        )}
                      </div>

                      {/* Content Body */}
                      <div className="p-6 md:p-8 flex-1 flex flex-col relative bg-white">
                        {/* Price Badge (floating) */}
                        <div className="absolute -top-6 right-6 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black px-4 py-2 rounded-xl shadow-lg shadow-orange-500/30 transform group-hover:-translate-y-1 transition-transform">
                          {pkg.price && Number(pkg.price) > 0 ? `₹${Number(pkg.price).toLocaleString('en-IN')}` : 'Free'}
                        </div>

                        <div className="flex-1 space-y-3 pt-2">
                          {pkg.duration && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              <span>{pkg.duration}</span>
                            </div>
                          )}

                          <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
                            {pkg.title}
                          </h3>

                          <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3">
                            {pkg.description?.replace(/<[^>]*>?/gm, '')}
                          </p>
                        </div>

                        {/* Footer CTA & Mode */}
                        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                          {pkg.mode ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-600 tracking-wide">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${pkg.mode === 'ONLINE' ? 'bg-emerald-500' :
                                pkg.mode === 'OFFLINE' ? 'bg-amber-500' :
                                  'bg-orange-500'
                                }`} />
                              <span>{pkg.mode === 'BOTH' ? 'Online & Offline' : pkg.mode}</span>
                            </div>
                          ) : <div />}

                          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors shrink-0">
                            {/* <span>View Details</span> */}
                            <span className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:text-white transition-all duration-300">
                              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                            </span>
                          </div>
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
        <section id="callback" className="py-16 bg-slate-50 relative overflow-hidden border-t border-slate-100 scroll-mt-24">
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
                    <a href="tel:+919779324178" className="text-xl sm:text-xl font-black text-slate-900 group-hover:text-orange-600 transition-colors">+91-97793-24178</a>
                  </div>
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-rose-500 hover:shadow-md transition-all group cursor-pointer">
                    <span className="block text-slate-500 text-xs uppercase font-bold tracking-wider mb-2">Email Admissions</span>
                    <a href="mailto:learnwithflymedia@gmail.com" className="text-base sm:text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors truncate block">learnwithflymedia@gmail.com</a>
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
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-extrabold text-xs">
                        ⚡ ₹99 ONLY • 1 DEMO CLASS FOR ANY COURSE
                      </div>
                      <h3 className="text-3xl sm:text-4xl font-black text-slate-900">Book ₹99 Demo Class</h3>
                      <p className="text-slate-500 font-medium text-sm sm:text-base">Experience live 1-on-1 industry training for just ₹99. Select your preferred course and our mentor will connect with you.</p>
                    </div>
                    <CallbackForm initialCourses={allCoursesList} />
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

        {/* Success Gallery & Video Reviews Section */}
        <GallerySection items={galleryItems} />

        {/* Flymedia LMS Mobile App Showcase & Download Section */}
        <div id="app">
          <AppDownloadSection />
        </div>

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
                  Visit Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">Office</span>
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
              </div>
            </GsapReveal>
          </div>
        </section>

      </main>
      <Footer />
    </SmoothScroller>
  );
}
