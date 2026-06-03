import { User } from '../../src/db/models';
import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import Link from 'next/link';
import { MentorList } from './MentorList';

export const revalidate = 0; // Ensure data is fresh

export default async function MentorsPage() {
  let tutors: any[] = [];
  try {
    const tutorsData = await User.findAll({
      where: { role: 'TUTOR' },
      order: [['createdAt', 'ASC']],
    });
    tutors = tutorsData.map(t => t.get({ plain: true }));
  } catch (error) {
    console.error('Failed to fetch tutors:', error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 bg-white overflow-hidden border-b border-slate-100">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] pointer-events-none" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
              Learn from <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">Industry Experts</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 font-medium max-w-3xl mx-auto">
              Our verified tutors bring years of real-world production experience straight to your screen. Browse our experts and schedule a trial session to start your journey.
            </p>
          </div>
        </section>


         {/* Tutors Grid with Search */}
        <section className="py-20 bg-slate-50 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-black text-slate-900">Directory of Experts</h2>
               <p className="text-slate-500 mt-2 font-medium">Search and book a trial with our verified instructors today.</p>
            </div>
            <MentorList tutors={tutors} />
          </div>
        </section>

        {/* Detailed Content: Why Choose Us */}
        <section className="py-20 bg-slate-50 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Why Choose Flymedia Mentors?</h2>
              <p className="text-slate-600 font-medium">We don't just hire teachers. We partner with active industry practitioners who are currently working on enterprise-level projects.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Real-World Experience</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Our mentors are actively working in the IT sector. You learn the exact tech stacks, marketing strategies, and design patterns that companies are using right now in production.</p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">1-on-1 Personalized Coaching</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Get dedicated attention. Your mentor will review your code, audit your campaigns, and provide highly personalized feedback to fast-track your specific career goals.</p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Career Acceleration</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Beyond just technical skills, our mentors provide insights into interview preparation, portfolio building, and how to effectively navigate the corporate IT landscape.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Content: How it Works */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/20 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h2 className="text-3xl sm:text-4xl font-black text-white">How Mentorship Works</h2>
                  <p className="text-slate-300 font-medium text-lg leading-relaxed">
                    We've streamlined the process to connect you with the perfect expert for your career trajectory.
                  </p>
                  <ul className="space-y-6 mt-8">
                    <li className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-bold shrink-0">1</div>
                      <div>
                        <h4 className="font-bold text-lg">Find Your Expert</h4>
                        <p className="text-slate-400 text-sm mt-1">Browse the directory below and use the search bar to find a mentor specializing in your desired tech stack or marketing field.</p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-bold shrink-0">2</div>
                      <div>
                        <h4 className="font-bold text-lg">Schedule a Trial</h4>
                        <p className="text-slate-400 text-sm mt-1">Click "Book Trial" to set up a preliminary consultation. Discuss your goals, current skill level, and see if they are a right fit.</p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-bold shrink-0">3</div>
                      <div>
                        <h4 className="font-bold text-lg">Start Learning</h4>
                        <p className="text-slate-400 text-sm mt-1">Begin your customized curriculum. Get daily tasks, live project access, and regular progress evaluations directly from your mentor.</p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div className="hidden lg:block relative">
                   <div className="aspect-square rounded-3xl bg-slate-800 border border-slate-700 overflow-hidden shadow-2xl relative">
                     <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60" alt="Mentorship Session" className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white text-center px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl sm:text-4xl font-black">Think you have what it takes?</h2>
            <p className="text-slate-300 font-medium text-lg max-w-2xl mx-auto">
              We are always looking for passionate industry leaders to join our platform. Apply to become a tutor and share your expertise with eager students.
            </p>
            <Link 
              href="/become-tutor" 
              className="inline-block px-8 py-4 rounded-xl font-bold bg-white text-slate-900 hover:bg-orange-50 hover:text-orange-600 transition-colors shadow-lg"
            >
              Apply as a Tutor
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
