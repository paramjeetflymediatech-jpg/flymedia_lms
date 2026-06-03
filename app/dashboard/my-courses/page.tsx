import Link from 'next/link';
import { requireAuth } from '../../../src/lib/auth';
import { Enrollment, Course, Module, Lesson, Progress } from '../../../src/db/models';

export const revalidate = 0;

export default async function MyCoursesPage() {
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
      batchMode: enroll.batchMode,
    };
  }).filter(Boolean);

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">My Courses</h1>

      {enrolledCourses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 text-2xl flex items-center justify-center mx-auto mb-4">
            📚
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No courses yet</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            You haven't enrolled in any courses yet. Discover our bootcamps and start learning today!
          </p>
          <Link href="/courses" className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-sm shadow-purple-200">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((c: any) => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
              {/* Thumbnail */}
              {c.thumbnail && (
                <div className="h-44 relative bg-slate-100 overflow-hidden">
                  <img
                    src={c.thumbnail}
                    alt={c.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-sm">
                    {c.level}
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                      {c.title}
                    </h3>
                    {c.batchMode && (
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {c.batchMode}
                      </span>
                    )}
                  </div>

                  {/* Progress slider bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span className="text-slate-500">Progress</span>
                      <span className="text-purple-600 font-bold">{c.progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-purple-600 transition-all duration-300"
                        style={{ width: `${c.progressPercent}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-400">
                      Completed {c.completedCount} of {c.totalLessons} lessons
                    </div>
                  </div>
                </div>

                {/* Operations */}
                <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3">
                  <Link
                    href={`/dashboard/courses/${c.slug}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all text-center"
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
  );
}
