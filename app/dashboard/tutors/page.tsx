import { User } from '../../../src/db/models';
import { requireAuth } from '../../../src/lib/auth';
import Link from 'next/link';

export const revalidate = 0;

export default async function TutorsPage() {
  await requireAuth();

  // Fetch all tutors
  const tutorsData = await User.findAll({
    where: { role: 'TUTOR' },
    order: [['createdAt', 'DESC']],
  });

  const tutors = tutorsData.map(t => t.toJSON() as any);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Our Expert Tutors</h1>
        <p className="text-slate-500">Learn from industry professionals with years of experience.</p>
      </div>

      {tutors.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center text-3xl mx-auto mb-4">
            👨‍🏫
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No tutors available yet</h3>
          <p className="text-slate-500 max-w-md mx-auto">We are currently onboarding our expert tutors. Please check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutors.map((tutor) => (
            <div key={tutor.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              {/* Decorative background circle */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              
              <div className="flex items-center gap-5 mb-4">
                {tutor.avatar ? (
                  <img src={tutor.avatar} alt={tutor.name} className="w-16 h-16 rounded-full object-cover shadow-sm ring-4 ring-white border border-slate-100" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-700 shadow-sm ring-4 ring-white border border-slate-100 shrink-0">
                    {tutor.name ? tutor.name.charAt(0).toUpperCase() : 'T'}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{tutor.name || 'Anonymous Tutor'}</h3>
                  <span className="inline-block mt-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-indigo-100">
                    Verified Tutor
                  </span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
                <p className="text-sm text-slate-600 whitespace-pre-wrap break-words break-all line-clamp-4">
                  {tutor.bio ? tutor.bio : "This tutor hasn't added a bio yet, but they are ready to help you succeed in your learning journey!"}
                </p>
                
                <Link 
                  href={`/dashboard/tutors/${tutor.id}`}
                  className="w-full mt-auto block text-center py-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-sm rounded-xl transition-colors border border-indigo-100 hover:border-indigo-600"
                >
                  View Full Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
