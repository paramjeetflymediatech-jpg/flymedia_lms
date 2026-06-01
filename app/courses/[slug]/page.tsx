import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '../../../src/components/layout/Header';
import Footer from '../../../src/components/layout/Footer';
import { Course, Module, Lesson, Enrollment } from '../../../src/db/models';
import { getCurrentUser } from '../../../src/lib/auth';
import CourseEnrollWidget from '../../../src/components/courses/CourseEnrollWidget';

export const revalidate = 0; // Keep dynamic

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await Course.findOne({ where: { slug } });

  if (!course) {
    return {
      title: 'Course Not Found',
    };
  }

  return {
    title: `${course.title} | Flymedia Technology`,
    description: course.description.slice(0, 160),
    openGraph: {
      title: course.title,
      description: course.description.slice(0, 160),
      images: course.thumbnail ? [{ url: course.thumbnail }] : [],
    },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const user = await getCurrentUser();

  // Fetch course with curriculum details
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

  // Check enrollment
  let isEnrolled = false;
  if (user) {
    const enroll = await Enrollment.findOne({
      where: { userId: user.id, courseId: course.id },
    });
    isEnrolled = !!enroll;
  }

  // Handle enrollment server action call helper
  // This is now handled inside CourseEnrollWidget client component

  return (
    <>
      <Header />
      <main className="flex-1 bg-white relative overflow-hidden pt-20 pb-32">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-[20%] left-0 w-[600px] h-[600px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 relative z-10">

          {/* Main Course Content (Left 8 cols) */}
          <div className="lg:col-span-8 space-y-12">

            {/* Header info */}
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-orange-500 mr-2 animate-pulse" />
                {course.level} Level Program
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
                {course.title}
              </h1>
              <p className="text-slate-600 text-lg sm:text-xl font-medium leading-relaxed max-w-3xl">
                {course.description}
              </p>
            </div>

            {/* Thumbnail */}
            {course.thumbnail && (
              <div className="w-full h-72 sm:h-[450px] rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100 relative group">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            )}

            {/* Curriculum Accordion/Structure */}
            <div className="space-y-8 pt-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-3xl font-black text-slate-900">Program Curriculum</h2>
                <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">{((course as any).modules || []).length} Modules</span>
              </div>

              {(!(course as any).modules || (course as any).modules.length === 0) ? (
                <div className="p-12 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-center">
                  <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-3xl mb-4">
                    📚
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Curriculum in Development</h3>
                  <p className="text-slate-500 font-medium text-sm max-w-md mx-auto">
                    Our master instructors are currently finalizing the curriculum for this cohort. Check back shortly for the full syllabus.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {((course as any).modules || []).map((mod: any, idx: number) => (
                    <div key={mod.id} className="p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm hover:shadow-lg transition-all duration-300 space-y-6 group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg font-black text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600 group-hover:border-orange-100 transition-colors">
                            {idx + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-xl">{mod.title}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{((mod as any).lessons || []).length} Lessons</p>
                          </div>
                        </div>
                      </div>

                      {/* Lessons inside Module */}
                      {((mod as any).lessons || []).length > 0 && (
                        <div className="pt-4 border-t border-slate-100">
                          <ul className="space-y-3">
                            {((mod as any).lessons || []).map((les: any) => (
                              <li key={les.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                <span className="text-sm font-bold text-slate-700 flex items-center space-x-3">
                                  <span className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center text-sm">
                                    {les.type === 'VIDEO' ? '🎥' : les.type === 'PDF' ? '📄' : les.type === 'QUIZ' ? '❓' : '📝'}
                                  </span>
                                  <span>{les.title}</span>
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100">
                                  {les.type}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Enrollment Sidebar Widget (Right 4 cols) */}
          <div className="lg:col-span-4 relative z-20">
            <CourseEnrollWidget 
              course={course.toJSON()} 
              user={user ? { id: user.id } : null} 
              isEnrolled={isEnrolled} 
            />
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
