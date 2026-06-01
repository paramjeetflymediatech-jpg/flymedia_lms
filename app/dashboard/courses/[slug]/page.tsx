import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
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
  if ((course as any).modules) {
    for (const mod of (course as any).modules) {
      if ((mod as any).lessons) {
        allLessons.push(...(mod as any).lessons);
      }
    }
  }

  if (allLessons.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-20 relative overflow-hidden bg-slate-50">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-orange-500/10 to-rose-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] pointer-events-none" />
        
        <div className="relative z-10 max-w-lg w-full mx-4">
          <div className="bg-white border border-slate-100 rounded-[3rem] p-10 sm:p-14 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden">
            {/* Top Shine */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-slate-50/80 to-transparent pointer-events-none" />
            
            <div className="relative z-10 space-y-8">
              <div className="w-24 h-24 mx-auto bg-slate-50 rounded-full flex items-center justify-center text-4xl shadow-sm border border-slate-100 relative">
                <span className="absolute top-2 right-2 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                </span>
                🚧
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Classroom is empty</h2>
                <p className="text-slate-500 font-medium leading-relaxed">
                  The instructor has not added modules or lessons to this course yet. The curriculum is actively being drafted. Check back soon!
                </p>
              </div>

              <div className="pt-4">
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center justify-center w-full px-6 py-4 font-black text-white bg-slate-900 hover:bg-slate-800 rounded-2xl transition-all shadow-md group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Return to Dashboard
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
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

  // Extract primitives to avoid capturing Sequelize model in closure
  const lessonIdToToggle = activeLesson.id;
  const nextCompletionState = !isActiveCompleted;

  // Server Action call wrapper
  const handleToggleProgress = async () => {
    'use server';
    await toggleLessonProgress(lessonIdToToggle, nextCompletionState);
  };

  return (
    <div className="py-8">
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
                {((course as any).modules || []).map((mod: any) => (
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
    </div>
  );
}
