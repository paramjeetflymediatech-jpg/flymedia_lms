import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Header from '../../../../src/components/layout/Header';
import Footer from '../../../../src/components/layout/Footer';
import { requireAuth } from '../../../../src/lib/auth';
import { Course, Module, Lesson, Enrollment, Progress } from '../../../../src/db/models';
import { toggleLessonProgress } from '../../../actions';

export const revalidate = 0; // Fresh class contents

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lessonId?: string }>;
}

export default async function StudentClassroomPage({ params, searchParams }: Props) {
  const user = await requireAuth();
  const { slug } = await params;
  const { lessonId } = await searchParams;

  // Verify course exists
  const course = await Course.findOne({
    where: { slug },
    include: [
      {
        model: Module,
        as: 'modules',
        include: [{ model: Lesson, as: 'lessons' }],
      },
    ],
    order: [
      [{ model: Module, as: 'modules' }, 'order', 'ASC'],
      [{ model: Module, as: 'modules' }, { model: Lesson, as: 'lessons' }, 'order', 'ASC'],
    ],
  });

  if (!course) {
    notFound();
  }

  // Verify student is actually enrolled
  const enrolled = await Enrollment.findOne({
    where: { userId: user.id, courseId: course.id },
  });

  if (!enrolled) {
    // Redirect to public course page for enrollment
    redirect(`/courses/${course.slug}`);
  }

  // Flatten lessons list to find active, next, and previous lessons
  const allLessons: any[] = [];
  if (course.modules) {
    for (const mod of course.modules) {
      if ((mod as any).lessons) {
        allLessons.push(...(mod as any).lessons);
      }
    }
  }

  if (allLessons.length === 0) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-slate-50 py-16 text-center">
          <div className="max-w-md mx-auto bg-white border border-slate-100 p-8 rounded-3xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Classroom is empty</h2>
            <p className="text-slate-500 text-sm">
              The instructor has not added modules/lessons to this course yet. Check back soon!
            </p>
            <Link href="/dashboard" className="text-blue-600 hover:underline text-sm font-semibold">
              Return to Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Find active lesson (by parameter or default to first lesson)
  let activeLesson = allLessons[0];
  if (lessonId) {
    const found = allLessons.find((l) => l.id === lessonId);
    if (found) activeLesson = found;
  }

  // Find next/prev lessons for navigation
  const activeIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
  const prevLesson = activeIndex > 0 ? allLessons[activeIndex - 1] : null;
  const nextLesson = activeIndex < allLessons.length - 1 ? allLessons[activeIndex + 1] : null;

  // Check progress records for all lessons in this course
  const progressRecords = await Progress.findAll({
    where: {
      userId: user.id,
      lessonId: allLessons.map((l) => l.id),
      completed: true,
    },
  });
  const completedLessonIds = new Set(progressRecords.map((pr) => pr.lessonId));
  const isActiveCompleted = completedLessonIds.has(activeLesson.id);

  // Compute course overall progress percent
  const progressPercent = Math.round((completedLessonIds.size / allLessons.length) * 100);

  // Server Action call wrapper
  const handleToggleProgress = async () => {
    'use server';
    await toggleLessonProgress(activeLesson.id, !isActiveCompleted);
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Top Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link href="/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center space-x-1">
                <span>← Back to My Courses</span>
              </Link>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">{course.title}</h1>
            </div>
            
            {/* Progress indicator */}
            <div className="flex items-center space-x-4 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
              <div className="text-right">
                <span className="text-xs font-medium text-slate-400 block">Overall progress</span>
                <span className="text-sm font-bold text-slate-800">{progressPercent}% Completed</span>
              </div>
              <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
              </div>
              {progressPercent === 100 && (
                <a
                  href={`/api/certificate/download?courseId=${course.id}`}
                  className="px-3.5 py-1.5 text-xs font-bold text-white gradient-bg rounded-lg hover:opacity-90 transition-all shadow shadow-blue-500/10"
                >
                  Get Certificate
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Classroom Curriculum Navigation Sidebar (1 col) */}
            <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden h-[fit-content] sticky top-24">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 text-sm">Course Syllabus</h3>
              </div>
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {course.modules?.map((mod) => (
                  <div key={mod.id} className="p-4 space-y-3">
                    <h4 className="text-xs font-extrabold tracking-wider text-slate-400 uppercase">
                      {mod.title}
                    </h4>
                    
                    <ul className="space-y-1">
                      {((mod as any).lessons || []).map((les: any) => {
                        const isCurrent = les.id === activeLesson.id;
                        const isCompleted = completedLessonIds.has(les.id);
                        
                        return (
                          <li key={les.id}>
                            <Link
                              href={`/dashboard/courses/${course.slug}?lessonId=${les.id}`}
                              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                                isCurrent
                                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                                  : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <span className="truncate pr-2 flex items-center space-x-1.5">
                                <span>{isCompleted ? '✅' : '⚪'}</span>
                                <span className="truncate">{les.title}</span>
                              </span>
                              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-400">
                                {les.type.toLowerCase()}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Lesson Content Panel (3 cols) */}
            <div className="lg:col-span-3 bg-white border border-slate-100 rounded-3xl shadow-sm p-6 sm:p-8 space-y-8 flex flex-col justify-between">
              
              {/* Lesson header */}
              <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
                    Lesson {activeIndex + 1} of {allLessons.length}
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900">{activeLesson.title}</h2>
                </div>
                
                {/* Complete switch */}
                <form action={handleToggleProgress}>
                  <button
                    type="submit"
                    className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                      isActiveCompleted
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {isActiveCompleted ? '✓ Completed' : 'Mark Completed'}
                  </button>
                </form>
              </div>

              {/* Lesson Content Body */}
              <div className="flex-1 py-4">
                {activeLesson.type === 'VIDEO' ? (
                  <div className="space-y-4">
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner border border-slate-100">
                      <video
                        src={activeLesson.content}
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-xs text-slate-400 italic text-center">
                      Click play to stream lesson instruction video.
                    </p>
                  </div>
                ) : activeLesson.type === 'PDF' ? (
                  <div className="space-y-6 text-center py-8 bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl max-w-lg mx-auto">
                    <div className="text-5xl">📄</div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-slate-800">Lesson Material PDF</h3>
                      <p className="text-slate-500 text-sm">Download the supplemental PDF to study offline.</p>
                    </div>
                    <a
                      href={activeLesson.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-white gradient-bg hover:opacity-90 rounded-xl transition-all shadow"
                    >
                      Download/Open PDF
                    </a>
                  </div>
                ) : (
                  // Markdown-style TEXT or generic fallback
                  <div className="prose prose-slate max-w-none text-slate-700 text-base leading-relaxed whitespace-pre-wrap">
                    {activeLesson.content}
                  </div>
                )}
              </div>

              {/* Back / Next Navigation footer */}
              <div className="border-t border-slate-100 pt-6 mt-8 flex items-center justify-between">
                {prevLesson ? (
                  <Link
                    href={`/dashboard/courses/${course.slug}?lessonId=${prevLesson.id}`}
                    className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-xl transition-all"
                  >
                    ← Previous Lesson
                  </Link>
                ) : (
                  <span />
                )}

                {nextLesson ? (
                  <Link
                    href={`/dashboard/courses/${course.slug}?lessonId=${nextLesson.id}`}
                    className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-white gradient-bg hover:opacity-90 rounded-xl transition-all"
                  >
                    Next Lesson →
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                  >
                    Return to Dashboard
                  </Link>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
