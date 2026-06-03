import Link from 'next/link';
import { requireAuth } from '../../src/lib/auth';
import { Enrollment, Course, Module, Lesson, Progress } from '../../src/db/models';

export const revalidate = 0; // Dynamic dashboard

export default async function StudentDashboardPage() {
  const user = await requireAuth();

  // Fetch all enrollments for user
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

  const userProgress = await Progress.findAll({
    where: { userId: user.id, completed: true },
  });
  const completedLessonIds = new Set(userProgress.map((p) => p.lessonId));

  let completedCourses = 0;
  let inProgressCourses = 0;

  const enrichedCourses = enrollments.map((enroll) => {
    const course = (enroll as any).Course;
    if (!course) return null;

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

    if (progressPercent === 100) completedCourses++;
    else if (progressPercent > 0) inProgressCourses++;

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      thumbnail: course.thumbnail,
      level: course.level,
      progressPercent,
      completedCount,
      totalLessons,
      batchMode: enroll.batchMode,
    };
  }).filter(Boolean);

  const activeCourse = enrichedCourses.find(c => c!.progressPercent > 0 && c!.progressPercent < 100) || enrichedCourses[0];

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold mb-2">Welcome back, {user.name || 'Student'}! 👋</h1>
            <p className="text-orange-50 mb-6">Ready to continue your learning journey today?</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard/my-courses" className="bg-white text-orange-600 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm">
                Go to My Courses
              </Link>
              <Link href="/dashboard/book-session" className="bg-white/20 text-white border border-white/20 px-6 py-2.5 rounded-xl font-bold hover:bg-white/30 transition-colors backdrop-blur-sm">
                Book a Session
              </Link>
            </div>
          </div>
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-48 h-48 bg-blue-400 opacity-20 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
              📚
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Enrolled</p>
              <p className="text-2xl font-bold text-slate-900">{enrollments.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
              ⚡
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">In Progress</p>
              <p className="text-2xl font-bold text-slate-900">{inProgressCourses}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xl shrink-0">
              ✅
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Completed</p>
              <p className="text-2xl font-bold text-slate-900">{completedCourses}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xl shrink-0">
              🎓
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Certificates</p>
              <p className="text-2xl font-bold text-slate-900">{completedCourses}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Continue Learning */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Continue Learning</h2>
            {activeCourse ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-6 items-center">
                {activeCourse.thumbnail ? (
                  <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    <img src={activeCourse.thumbnail} alt={activeCourse.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full sm:w-48 h-32 rounded-xl shrink-0 bg-slate-100 flex items-center justify-center text-2xl">
                    📘
                  </div>
                )}
                <div className="flex-1 w-full space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{activeCourse.title}</h3>
                      <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-md shrink-0">
                        {activeCourse.level}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {activeCourse.completedCount} of {activeCourse.totalLessons} lessons completed
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-orange-600">Progress</span>
                      <span className="text-slate-900">{activeCourse.progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-600 rounded-full transition-all duration-500" style={{ width: `${activeCourse.progressPercent}%` }}></div>
                    </div>
                  </div>

                  <Link href={`/dashboard/courses/${activeCourse.slug}`} className="inline-block mt-2 px-6 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
                    {activeCourse.progressPercent === 0 ? 'Start Learning' : 'Resume Course'}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 text-2xl flex items-center justify-center mx-auto mb-4">
                  🚀
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Start your journey</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">You aren't taking any courses yet. Browse our catalog to find the perfect course for you.</p>
                <Link href="/courses" className="inline-block px-6 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700 transition-colors shadow-sm">
                  Explore Courses
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <Link href="/dashboard/my-courses" className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl group-hover:scale-110 group-hover:bg-blue-100 transition-all">
                  ▶️
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">My Courses</h4>
                  <p className="text-xs text-slate-500">View all your enrollments</p>
                </div>
              </Link>
              <Link href="/dashboard/book-session" className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl group-hover:scale-110 group-hover:bg-orange-100 transition-all">
                  📅
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Book Session</h4>
                  <p className="text-xs text-slate-500">Schedule 1-on-1 tutoring</p>
                </div>
              </Link>
              <Link href="/dashboard/tutors" className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl group-hover:scale-110 group-hover:bg-amber-100 transition-all">
                  👨‍🏫
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Find Tutors</h4>
                  <p className="text-xs text-slate-500">Connect with experts</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
