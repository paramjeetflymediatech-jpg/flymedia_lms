import Link from 'next/link';
import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import { Course } from '../../src/db/models';

export const metadata = {
  title: 'Training Programs | Antigravity Academy LMS',
  description: 'Browse our catalog of professional courses, coding bootcamps, and certification tracks designed for software developers.',
};

export const revalidate = 0; // Fresh listing every time

export default async function CoursesListingPage() {
  let courses: Course[] = [];
  try {
    courses = await Course.findAll({
      order: [['createdAt', 'DESC']],
    });
  } catch (error) {
    console.error('Failed to query courses list:', error);
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Headline */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              All Training Programs
            </h1>
            <p className="text-lg text-slate-600">
              Select a specialized learning track to expand your skill set and earn industry-recognized credentials.
            </p>
          </div>

          {/* Grid list */}
          {courses.length === 0 ? (
            <div className="text-center p-16 bg-white rounded-3xl border border-slate-100 max-w-lg mx-auto">
              <p className="text-slate-500 mb-4">No training courses found.</p>
              <code className="text-xs px-2.5 py-1.5 rounded bg-slate-100 font-mono text-slate-600">npm run db:sync</code>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full"
                >
                  {course.thumbnail && (
                    <div className="h-48 overflow-hidden relative bg-slate-100">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur">
                        {course.level}
                      </span>
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h2 className="text-xl font-bold text-slate-900 leading-snug">
                        {course.title}
                      </h2>
                      <p className="text-slate-600 text-sm line-clamp-3">
                        {course.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 font-medium">Duration</span>
                        <span className="text-sm font-semibold text-slate-700">
                          ⏱️ {course.duration ? Math.round(course.duration / 60) : 0} hrs
                        </span>
                      </div>
                      
                      <Link
                        href={`/courses/${course.slug}`}
                        className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-white gradient-bg hover:opacity-90 rounded-xl transition-all"
                      >
                        Enroll Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
