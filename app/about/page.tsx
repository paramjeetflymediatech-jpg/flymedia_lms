import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import Reveal from '../../src/components/ui/Reveal';

export const metadata = {
  title: 'About Us | Flymedia Technology Summer Training',
  description: 'Learn about Flymedia Technology, our 14+ years of industry excellence in digital marketing, web designing, and our 30-day summer bootcamps.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white pt-10 pb-32 relative overflow-hidden">
        {/* Subtle Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-gradient-to-b from-orange-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-24">
          {/* Header Section */}
          <div className="text-center max-w-4xl mx-auto space-y-6 pt-12">
            <Reveal direction="down">
              <h1 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
                14+ Years of <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">Excellence</span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
                Flymedia Technology is a leading IT development and digital marketing agency delivering globally recognized results since 2012.
              </p>
            </Reveal>
          </div>

          {/* Director: Anuj Gupta (Left Content, Right Image) */}
          <Reveal direction="left">
            <div className="rounded-[3rem] bg-white border border-slate-200 p-8 sm:p-12 shadow-sm hover:shadow-xl transition-shadow duration-500 flex flex-col md:flex-row items-center justify-between gap-12 mt-8">
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-[10px] sm:text-xs font-black text-orange-600 uppercase tracking-widest mb-2">Meet Our Founder</h2>
                  <h3 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">Anuj Gupta</h3>
                </div>
                <p className="text-slate-600 text-lg leading-relaxed">
                  With 15+ years of industry experience, Anuj Gupta founded Fly Media Technology with a vision to empower businesses through innovative digital solutions.
                </p>
                <p className="text-slate-600 text-lg leading-relaxed">
                  His leadership has driven the successful delivery of 1000+ national and international projects while building a team focused on creativity, quality, and customer success.
                </p>
              </div>
              <div className="w-full md:w-[400px] h-[400px] shrink-0 rounded-[2.5rem] bg-gradient-to-br from-orange-100 to-rose-100 p-2 shadow-lg shadow-orange-500/10 hover:scale-105 transition-transform duration-700">
                <img src="/Anujgupta.png" alt="Anuj Gupta" className="w-full h-full object-cover object-top rounded-[2rem] bg-white" />
              </div>
            </div>
          </Reveal>

          {/* Co-Founder: Jainika Mittal (Left Image, Right Content) */}
          <Reveal direction="right" delay={200}>
            <div className="rounded-[3rem] bg-slate-900 border border-slate-800 p-8 sm:p-12 shadow-xl shadow-slate-900/20 flex flex-col-reverse md:flex-row items-center justify-between gap-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-orange-500/20 transition-colors duration-700" />
              
              <div className="w-full md:w-[400px] h-[400px] shrink-0 rounded-[2.5rem] bg-gradient-to-tr from-slate-800 to-slate-700 p-2 shadow-2xl group-hover:-translate-y-2 transition-transform duration-700">
                <div className="w-full h-full rounded-[2rem] bg-slate-800 flex items-center justify-center overflow-hidden relative">
                   <img src="/jainika.jpg" alt="Jainika Mittal" className="w-full h-full object-cover object-top rounded-[2rem] absolute inset-0 z-10" />
                   <span className="text-6xl">👩‍💼</span>
                </div>
              </div>

              <div className="flex-1 space-y-6 relative z-10">
                <div>
                  <h2 className="text-[10px] sm:text-xs font-black text-orange-500 uppercase tracking-widest mb-2">Co-Founder</h2>
                  <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Jainika Mittal</h3>
                </div>
                <p className="text-slate-300 text-lg leading-relaxed">
                  Jainika Mittal is the Co-Founder of Fly Media Technology, where she leads technical operations and manages SEO and social media strategy. With hands-on experience in project management, technology strategy, and product development, she brings real client work into the classroom.
                </p>
                <p className="text-slate-300 text-lg leading-relaxed">
                  Her teaching focuses on practical skills: how to build visibility online, grow a brand on social platforms, and turn ideas into working digital solutions. Learners benefit from her industry insight and her commitment to quality, creativity, and continuous improvement.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Redesigned Legacy & Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* The Legacy Block */}
            <div className="md:col-span-7">
              <Reveal delay={100}>
                <div className="rounded-[3rem] bg-slate-950 overflow-hidden relative shadow-2xl shadow-slate-900/20 group h-[500px] flex flex-col justify-end p-8 sm:p-12 hover:-translate-y-2 transition-all duration-700">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 blur-[100px] rounded-full group-hover:bg-orange-500/30 transition-colors duration-700" />
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/10 blur-[100px] rounded-full group-hover:bg-rose-500/30 transition-colors duration-700" />
                  
                  <div className="relative z-10">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-6 group-hover:scale-105 transition-transform origin-left">
                      Industry Leaders
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white max-w-xl leading-[1.15] mb-6">
                      Bridging the gap between academic theory and industry reality.
                    </h2>
                    <p className="text-slate-400 text-lg max-w-lg leading-relaxed group-hover:text-slate-300 transition-colors">
                      We believe standard software courses are too passive. Here, you will work on actual client campaigns, production servers, and real-world projects from day one.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Stats & Highlights Stack */}
            <div className="md:col-span-5 flex flex-col gap-8">
              
              <Reveal delay={300}>
                <div className="h-[234px] rounded-[3rem] bg-orange-50 border border-orange-100 p-8 sm:p-10 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-center relative overflow-hidden group hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[40px] rounded-full group-hover:bg-orange-500/30 transition-colors duration-500" />
                  <h3 className="text-4xl font-black text-slate-900 mb-2">14+ Years</h3>
                  <p className="text-orange-600 font-bold uppercase tracking-wider text-xs mb-4">Of Proven Excellence</p>
                  <p className="text-slate-600 group-hover:text-slate-900 transition-colors duration-500">Delivering globally recognized results and transforming digital landscapes since 2012.</p>
                </div>
              </Reveal>

              <div className="h-[234px] grid grid-cols-2 gap-4">
                <Reveal delay={400}>
                  <div className="h-full rounded-[2.5rem] bg-white border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center text-center hover:border-orange-200 hover:-translate-y-1 hover:shadow-xl transition-all duration-500 group">
                    <span className="text-4xl font-black text-slate-900 mb-1 group-hover:scale-110 transition-transform duration-500">100%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2 group-hover:text-orange-600 transition-colors duration-500">Live Projects</span>
                  </div>
                </Reveal>
                <Reveal delay={500}>
                  <div className="h-full rounded-[2.5rem] bg-white border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center text-center hover:border-orange-200 hover:-translate-y-1 hover:shadow-xl transition-all duration-500 group">
                    <span className="text-4xl font-black text-slate-900 mb-1 group-hover:scale-110 transition-transform duration-500">3</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2 group-hover:text-orange-600 transition-colors duration-500">Global Offices</span>
                  </div>
                </Reveal>
              </div>

            </div>

            {/* Contact Action */}
            <div className="md:col-span-12 mt-8">
              <Reveal delay={200} direction="up">
                <div className="rounded-[3rem] bg-slate-950 border border-slate-800 p-8 sm:p-16 shadow-2xl overflow-hidden relative flex flex-col md:flex-row items-center justify-between gap-12 group">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-orange-500/10 to-rose-500/10 blur-[120px] rounded-full pointer-events-none group-hover:scale-110 group-hover:opacity-100 opacity-70 transition-all duration-1000" />
                  <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05] pointer-events-none" />
                  
                  <div className="relative z-10 text-center md:text-left space-y-4 max-w-2xl">
                    <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                      Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">kickstart your career?</span>
                    </h3>
                    <p className="text-slate-300 text-lg">
                      Don't settle for theoretical knowledge. Call us directly to talk to our founders and secure your spot in our upcoming summer bootcamp.
                    </p>
                  </div>

                  <div className="relative z-10 shrink-0">
                    <a href="tel:+917814408934" className="inline-flex items-center justify-center gap-4 px-10 py-5 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-extrabold text-xl rounded-full hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-300">
                      <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                      </div>
                      +91 7814408934
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
