import { User, LiveClass, Package } from '../../../../src/db/models';
import { requireAuth } from '../../../../src/lib/auth';
import Link from 'next/link';

export default async function TutorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();
  
  const resolvedParams = await params;

  // Fetch tutor details and the classes they are teaching
  const tutorData = await User.findOne({
    where: { id: resolvedParams.id, role: 'TUTOR' },
    include: [
      {
        model: LiveClass,
        as: 'teachingClasses',
        include: [
          {
            model: Package,
            as: 'Package',
            attributes: ['id', 'title', 'slug', 'thumbnail']
          }
        ]
      }
    ]
  });

  if (!tutorData) {
    return (
      <div className="p-6 md:p-10">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center font-semibold">
          Tutor not found or is no longer available.
        </div>
        <div className="mt-4 text-center">
          <Link href="/dashboard/tutors" className="text-purple-600 hover:underline font-bold">
            &larr; Back to Tutors
          </Link>
        </div>
      </div>
    );
  }

  const tutor = tutorData.toJSON() as any;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Link href="/dashboard/tutors" className="inline-flex items-center text-slate-500 hover:text-indigo-600 font-semibold transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Tutors
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tutor Header & Bio */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-full -z-10 opacity-70"></div>
            
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              {tutor.avatar ? (
                <img src={tutor.avatar} alt={tutor.name} className="w-32 h-32 rounded-full object-cover shadow-md ring-4 ring-white border border-slate-100 shrink-0" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-5xl font-bold text-indigo-700 shadow-md ring-4 ring-white border border-slate-100 shrink-0">
                  {tutor.name ? tutor.name.charAt(0).toUpperCase() : 'T'}
                </div>
              )}
              
              <div className="text-center sm:text-left pt-2">
                <h1 className="text-3xl font-extrabold text-slate-900">{tutor.name || 'Anonymous Tutor'}</h1>
                <span className="inline-block mt-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full border border-indigo-100">
                  Verified Expert Tutor
                </span>
                
                <div className="mt-4 flex items-center justify-center sm:justify-start gap-2 text-slate-500 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Joined {new Date(tutor.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">About the Tutor</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 whitespace-pre-wrap break-words break-all leading-relaxed">
                  {tutor.bio ? tutor.bio : "This tutor hasn't added a detailed bio yet, but they are a verified expert ready to help you succeed in your learning journey!"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Classes & Packages */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Classes Taught by {tutor.name?.split(' ')[0] || 'Tutor'}</h2>
            
            {tutor.teachingClasses && tutor.teachingClasses.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {tutor.teachingClasses.map((lc: any) => (
                  <div key={lc.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
                    <h3 className="font-bold text-slate-900 mb-1">{lc.title}</h3>
                    <p className="text-xs text-slate-500 mb-3">
                      {new Date(lc.startTime).toLocaleString(undefined, { 
                        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </p>
                    
                    {lc.Package && (
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-200 mt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Part of:</span>
                        <Link 
                          href={`/packages/${lc.Package.slug}`}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 truncate"
                        >
                          {lc.Package.title}
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 italic bg-slate-50 rounded-2xl border border-slate-100">
                Not currently assigned to any upcoming classes.
              </div>
            )}
          </div>
          
          <div className="bg-indigo-600 rounded-3xl p-6 shadow-sm text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
            <h3 className="font-bold text-lg mb-2">Need a 1-on-1?</h3>
            <p className="text-indigo-100 text-sm mb-4">Book a personalized session with {tutor.name?.split(' ')[0] || 'this tutor'}.</p>
            <Link 
              href="/dashboard/book-session"
              className="block w-full py-2.5 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-sm"
            >
              Book Session
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
