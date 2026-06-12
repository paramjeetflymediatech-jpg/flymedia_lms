import { User, LiveClass, Package, Review } from '../../../../src/db/models';
import { requireAuth } from '../../../../src/lib/auth';
import Link from 'next/link';
import TutorProfileContent from '../../../../src/components/tutor/TutorProfileContent';

export default async function TutorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = await requireAuth();
  
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

  // Fetch Reviews
  const reviewsData = await Review.findAll({
    where: { tutorId: resolvedParams.id },
    include: [{ model: User, as: 'student', attributes: ['name', 'avatar'] }],
    order: [['createdAt', 'DESC']]
  });
  const reviews = reviewsData.map(r => r.toJSON() as any);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 'New';

  const sessionsTaken = tutor.teachingClasses ? tutor.teachingClasses.filter((c: any) => c.status === 'COMPLETED').length : 0;
  
  const upcomingClasses = tutor.teachingClasses ? tutor.teachingClasses.filter((c: any) => c.status !== 'COMPLETED' && c.status !== 'CANCELLED') : [];

  return (
    <TutorProfileContent 
      tutor={tutor} 
      reviews={reviews} 
      currentUserRole={currentUser.role}
      sessionsTaken={sessionsTaken}
      averageRating={averageRating}
    >
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Upcoming Classes</h2>
        
        {upcomingClasses.length > 0 ? (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {upcomingClasses.map((lc: any) => (
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
            No upcoming classes scheduled.
          </div>
        )}
      </div>
      
      <div className="bg-indigo-600 rounded-3xl p-6 shadow-sm text-center text-white relative overflow-hidden mt-6">
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
    </TutorProfileContent>
  );
}
