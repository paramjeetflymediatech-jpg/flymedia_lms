import { User } from '../../../src/db/models';
import Header from '../../../src/components/layout/Header';
import Footer from '../../../src/components/layout/Footer';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function MentorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const tutorData = await User.findByPk(resolvedParams.id);
  
  if (!tutorData || tutorData.get('role') !== 'TUTOR') {
    notFound();
  }

  const tutor = tutorData.get({ plain: true });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Header />
      
      {/* Premium Profile Banner Header */}
      <div className="w-full h-64 md:h-80 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=2000&q=80')] opacity-20 bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
      </div>

      <main className="flex-1 pb-20 -mt-32 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Column: Avatar & Quick Info Card */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-200 flex flex-col items-center text-center relative overflow-hidden h-full">
                
                {/* Floating Decoration */}
                <div className="absolute -top-16 -left-16 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-50" />
                
                {/* Avatar */}
                <div className="w-40 h-40 rounded-[2.5rem] bg-slate-100 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center text-orange-600 font-bold text-5xl mb-6 relative z-10 rotate-3 hover:rotate-0 transition-transform duration-500">
                  {tutor.avatar ? (
                    <img src={tutor.avatar || ''} alt={tutor.name || ''} className="w-full h-full object-cover" />
                  ) : (
                    (tutor.name || 'T').substring(0, 2).toUpperCase()
                  )}
                </div>

                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-50 border border-green-100 text-xs font-black text-green-600 tracking-wider uppercase mb-4">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Verified Expert
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-2">{tutor.name}</h1>
                <p className="text-slate-500 font-medium text-sm mb-8">{tutor.professionTitle || 'Industry Expert & Tech Mentor'}</p>

                {/* Quick Stats */}
                <div className="w-full grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="text-2xl font-black text-slate-900">{tutor.rating || '5.0'}</div>
                    <div className="flex items-center justify-center text-orange-400 mb-1">
                      ★★★★★
                    </div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{tutor.reviewsCount || 0}+ Reviews</div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="text-2xl font-black text-slate-900">{tutor.studentsMentored || 0}+</div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-2">Students<br/>Mentored</div>
                  </div>
                </div>

                {/* Book Trial CTA */}
                <div className="w-full mt-auto">
                  <Link href="/dashboard/book-session" className="w-full py-4 bg-gradient-to-r from-orange-600 to-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Book Trial Session
                  </Link>
                  <p className="text-xs text-slate-400 mt-3 font-medium">*15-min introductory call (100% Free)</p>
                </div>
              </div>
            </div>

            {/* Right Column: Bio & Details */}
            <div className="w-full lg:w-2/3 space-y-8">
              
              {/* About Section */}
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-200">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  About Me
                </h2>
                <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed">
                  <p>
                    {tutor.bio || `Hi! I'm ${tutor.name}, and I'm passionate about helping developers level up their careers. With years of experience in the tech industry, I've seen firsthand what it takes to build robust, scalable applications and stand out in the job market.`}
                  </p>
                  {!tutor.bio && (
                    <p className="mt-4">
                      My mentoring approach focuses on practical, real-world skills. Whether you're struggling with a specific architectural pattern, preparing for a rigorous technical interview, or looking to map out your long-term career trajectory, I'm here to provide actionable guidance tailored to your specific goals.
                    </p>
                  )}
                </div>
              </div>

              {/* Skills/Expertise Section */}
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-200">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  Core Expertise
                </h2>
                
                <div className="flex flex-wrap gap-3">
                  {tutor.skills && Array.isArray(tutor.skills) && tutor.skills.length > 0 ? (
                    tutor.skills.map((skill: string, i: number) => (
                      <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm">
                        {skill}
                      </span>
                    ))
                  ) : (
                    ['Career Guidance', 'Interview Prep', 'Industry Best Practices'].map((skill, i) => (
                      <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm">
                        {skill}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* What to expect */}
              <div className="bg-gradient-to-br from-slate-900 to-black rounded-3xl p-8 md:p-10 shadow-xl border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#1A56DB] rounded-full blur-[100px] opacity-20 pointer-events-none" />
                
                <h2 className="text-2xl font-black text-white mb-6 relative z-10">What to expect in our Trial Call</h2>
                <div className="space-y-4 relative z-10">
                  {tutor.trialExpectations && Array.isArray(tutor.trialExpectations) && tutor.trialExpectations.length > 0 ? (
                    tutor.trialExpectations.map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold flex-shrink-0 mt-1">{i + 1}</div>
                        <p className="text-slate-300">{item}</p>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold flex-shrink-0 mt-1">1</div>
                        <p className="text-slate-300">We'll discuss your current skill level, career goals, and the specific challenges you are facing.</p>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold flex-shrink-0 mt-1">2</div>
                        <p className="text-slate-300">I will outline a customized learning roadmap specifically tailored for you.</p>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold flex-shrink-0 mt-1">3</div>
                        <p className="text-slate-300">We'll see if our teaching and learning styles are a good match before committing to any paid packages.</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
            
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
