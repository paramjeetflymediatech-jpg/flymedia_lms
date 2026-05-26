import Link from 'next/link';
import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import { requireAuth } from '../../src/lib/auth';
import { Enrollment, Course, Module, Lesson, Progress } from '../../src/db/models';

export const revalidate = 0; // Dynamic dashboard

export default async function StudentDashboardPage() {
  const user = await requireAuth();

  // Fetch all enrollments for user, including Course -> Modules -> Lessons
  const enrollments = await Enrollment.findAll({
    where: { userId: user.id },
    include: [
      {
        model: Course,
        include: [
          {
            model: Module,
            as: 'modules',
            include: [{ model: Lesson, as: 'lessons' }],
          },
        ],
      },
    ],
    order: [['enrolledAt', 'DESC']],
  });

  // Fetch all completed progress for user
  const userProgress = await Progress.findAll({
    where: { userId: user.id, completed: true },
  });
  const completedLessonIds = new Set(userProgress.map((p) => p.lessonId));

  // Build course data with progress computed
  const enrolledCourses = enrollments.map((enroll) => {
    const course = (enroll as any).Course;
    if (!course) return null;

    // Gather all lessons for this course
    const lessons: any[] = [];
    if (course.modules) {
      for (const mod of course.modules) {
        if (mod.lessons) {
          lessons.push(...mod.lessons);
        }
      }
    }

    const totalLessons = lessons.length;
    const completedCount = lessons.filter((l) => completedLessonIds.has(l.id)).length;
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      thumbnail: course.thumbnail,
      level: course.level,
      progressPercent,
      completedCount,
      totalLessons,
      enrolledAt: enroll.enrolledAt,
      completedAt: enroll.completedAt,
    };
  }).filter(Boolean);

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-8 bg-white border border-slate-100 rounded-3xl shadow-sm">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Student Dashboard</span>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {user.name || 'Student'}!
              </h1>
              <p className="text-sm text-slate-500">
                Logged in as <span className="font-semibold text-slate-700">{user.email}</span>
              </p>
            </div>
            {user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white gradient-bg hover:opacity-90 rounded-xl transition-all shadow-md shadow-purple-500/10"
              >
                Go to Admin Dashboard
              </Link>
            )}
          </div>

          {/* Core Body */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">My Courses</h2>

            {enrolledCourses.length === 0 ? (
              <div className="text-center p-16 bg-white border border-slate-100 rounded-3xl max-w-xl mx-auto space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-500 text-3xl flex items-center justify-center mx-auto">
                  📚
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">You are not enrolled in any training program yet</h3>
                  <p className="text-slate-500 text-sm">
                    Discover summer Bootcamps, professional career tracks, and get certified.
                  </p>
                </div>
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center px-6 py-3 font-bold text-white gradient-bg hover:opacity-90 rounded-xl transition-all shadow-md shadow-blue-500/10 text-sm"
                >
                  Browse Courses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {enrolledCourses.map((c: any) => (
                  <div key={c.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between h-full">
                    {/* Thumbnail */}
                    {c.thumbnail && (
                      <div className="h-40 relative bg-slate-100 overflow-hidden">
                        <img
                          src={c.thumbnail}
                          alt={c.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur">
                          {c.level}
                        </span>
                      </div>
                    )}

                    {/* Progress details */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                          {c.title}
                        </h3>

                        {/* Progress slider bar */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-medium">
                            <span className="text-slate-500">Course Progress</span>
                            <span className="text-slate-900 font-semibold">{c.progressPercent}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                              style={{ width: `${c.progressPercent}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Completed {c.completedCount} of {c.totalLessons} lessons
                          </div>
                        </div>
                      </div>

                      {/* Operations */}
                      <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
                        <Link
                          href={`/dashboard/courses/${c.slug}`}
                          className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold text-white gradient-bg hover:opacity-90 rounded-xl transition-all text-center"
                        >
                          {c.progressPercent === 0 ? 'Start Course' : 'Continue Learning'}
                        </Link>

                        {c.progressPercent === 100 && (
                          <a
                            href={`/api/certificate/download?courseId=${c.id}`}
                            className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200/50 rounded-xl transition-all text-center"
                          >
                            🎓 Download Certificate
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
