import { User, Review } from '../../../src/db/models';
import { requireAuth } from '../../../src/lib/auth';
import Link from 'next/link';
import { Op } from 'sequelize';
import TutorSearchFilter from '../../../src/components/tutor/TutorSearchFilter';
import Pagination from '../../../src/components/ui/Pagination';

export const revalidate = 0;

export default async function TutorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireAuth();

  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1');
  const limit = 9;
  const offset = (page - 1) * limit;
  const q = resolvedParams.q || '';

  const whereClause: any = { role: 'TUTOR' };
  if (q) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${q}%` } },
      { bio: { [Op.iLike]: `%${q}%` } },
    ];
  }

  // Fetch tutors with pagination and reviews
  const { rows: tutorsData, count } = await User.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Review,
        as: 'receivedReviews',
        attributes: ['rating'],
      },
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  const tutors = tutorsData.map((t) => t.toJSON() as any);
  const totalPages = Math.ceil(count / limit);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Our Expert Tutors</h1>
          <p className="text-slate-500">Learn from industry professionals with years of experience.</p>
        </div>
        <TutorSearchFilter />
      </div>

      {tutors.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center text-3xl mx-auto mb-4">
            👨‍🏫
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No tutors found</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            {q ? "We couldn't find any tutors matching your search." : "We are currently onboarding our expert tutors. Please check back later!"}
          </p>
          {q && (
            <Link href="/dashboard/tutors" className="mt-4 inline-block px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-100 transition-colors">
              Clear Search
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map((tutor) => {
              const reviews = tutor.receivedReviews || [];
              const averageRating = reviews.length > 0
                ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1)
                : 'New';

              return (
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
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-indigo-100">
                          Verified Tutor
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          <span>{averageRating}</span>
                          <span className="text-slate-400 font-medium ml-0.5">({reviews.length})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
                    <p className="text-sm text-slate-600 whitespace-pre-wrap break-words break-all line-clamp-4 min-h-[5rem]">
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
              );
            })}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
