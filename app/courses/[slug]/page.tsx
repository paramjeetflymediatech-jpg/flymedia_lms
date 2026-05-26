import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '../../../src/components/layout/Header';
import Footer from '../../../src/components/layout/Footer';
import { Course, Module, Lesson, Enrollment } from '../../../src/db/models';
import { getSessionPayload } from '../../../src/lib/auth';
import { enrollInCourse } from '../../actions';

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
    title: `${course.title} | Antigravity Academy`,
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
  const session = await getSessionPayload();

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
  if (session) {
    const enroll = await Enrollment.findOne({
      where: { userId: session.userId, courseId: course.id },
    });
    isEnrolled = !!enroll;
  }

  // Handle enrollment server action call helper
  const handleEnroll = async () => {
    'use server';
    if (!session) return;
    await enrollInCourse(course.id);
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Course Content (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header info */}
            <div className="space-y-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-xs font-semibold text-purple-600">
                {course.level} Level
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                {course.title}
              </h1>
              <p className="text-slate-600 text-base leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* Thumbnail */}
            {course.thumbnail && (
              <div className="h-64 sm:h-96 rounded-3xl overflow-hidden shadow-sm bg-slate-100 relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Curriculum Accordion/Structure */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Course Curriculum</h2>
              
              {(!course.modules || course.modules.length === 0) ? (
                <div className="p-8 bg-white border border-slate-100 rounded-3xl text-center text-slate-500">
                  Curriculum is currently being drafted by the admissions team.
                </div>
              ) : (
                <div className="space-y-4">
                  {course.modules.map((mod) => (
                    <div key={mod.id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                      <h3 className="font-bold text-slate-900 text-lg flex items-center justify-between">
                        <span>{mod.title}</span>
                        <span className="text-xs font-medium text-slate-400">
                          Order {mod.order}
                        </span>
                      </h3>
                      
                      {/* Lessons inside Module */}
                      <ul className="divide-y divide-slate-100">
                        {((mod as any).lessons || []).map((les: any) => (
                          <li key={les.id} className="py-3 flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                              <span>
                                {les.type === 'VIDEO' ? '🎥' : les.type === 'PDF' ? '📄' : les.type === 'QUIZ' ? '❓' : '📝'}
                              </span>
                              <span>{les.title}</span>
                            </span>
                            <span className="text-xs text-slate-400 capitalize px-2 py-0.5 rounded bg-slate-50 border border-slate-100">
                              {les.type.toLowerCase()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Enrollment Sidebar Widget (Right 1 col) */}
          <div className="space-y-6">
            <div className="sticky top-24 p-8 bg-white border border-slate-100 rounded-3xl shadow-md space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Program Enrollment</h3>
                
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {course.price && Number(course.price) > 0 ? `$${course.price}` : 'Free'}
                  </span>
                  {course.price && Number(course.price) > 0 && (
                    <span className="text-xs text-slate-500 font-medium">one-time admission</span>
                  )}
                </div>

                <div className="space-y-2.5 text-sm text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span>⏱️ Course Duration:</span>
                    <span className="font-semibold text-slate-900">
                      {course.duration ? Math.round(course.duration / 60) : 0} hours
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🏆 Certification:</span>
                    <span className="font-semibold text-slate-900">Included</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>📶 Program level:</span>
                    <span className="font-semibold text-slate-900 capitalize">
                      {course.level.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Call To Action Buttons based on Auth & Enrollment status */}
              {session ? (
                isEnrolled ? (
                  <Link
                    href={`/dashboard/courses/${course.slug}`}
                    className="w-full inline-flex items-center justify-center px-6 py-4 font-bold text-white gradient-bg hover:opacity-90 rounded-2xl transition-all shadow-md"
                  >
                    Go to Classroom
                  </Link>
                ) : (
                  <form action={handleEnroll} className="w-full">
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center px-6 py-4 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all shadow-md"
                    >
                      Instant Enrollment
                    </button>
                  </form>
                )
              ) : (
                <div className="space-y-3">
                  <Link
                    href={`/login?callbackUrl=/courses/${course.slug}`}
                    className="w-full inline-flex items-center justify-center px-6 py-4 font-bold text-white gradient-bg hover:opacity-90 rounded-2xl transition-all shadow-md"
                  >
                    Sign In to Enroll
                  </Link>
                  <p className="text-center text-xs text-slate-400">
                    New to platform? <Link href="/register" className="text-purple-600 font-semibold hover:underline">Register here</Link>
                  </p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </main>
      <Footer />
    </>
  );
}
