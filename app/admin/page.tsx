import Link from 'next/link';
import Header from '../../src/components/layout/Header';
import Footer from '../../src/components/layout/Footer';
import { requireAdmin } from '../../src/lib/auth';
import { Course, Module, Lesson, Enrollment, User, Progress } from '../../src/db/models';
import {
  adminCreateCourse,
  adminDeleteCourse,
  adminCreateModule,
  adminDeleteModule,
  adminCreateLesson,
  adminDeleteLesson,
} from '../actions';

export const revalidate = 0; // Fresh admin logs

export default async function AdminDashboardPage() {
  await requireAdmin();

  // 1. Fetch courses with count of modules, lessons, and enrolled students
  const courses = await Course.findAll({
    include: [
      {
        model: Module,
        as: 'modules',
        include: [{ model: Lesson, as: 'lessons' }],
      },
      {
        model: Enrollment,
        as: 'enrollments',
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  // 2. Fetch all enrollments with student information to display on the progress tracker
  const enrollments = await Enrollment.findAll({
    include: [
      { model: User, attributes: ['id', 'name', 'email'] },
      { model: Course, attributes: ['id', 'title'] },
    ],
    order: [['enrolledAt', 'DESC']],
  });

  // 3. Simple Analytics Metrics
  const totalCourses = courses.length;
  const uniqueStudents = await User.count({ where: { role: 'STUDENT' } });
  const totalEnrollments = enrollments.length;

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Top Headline */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-8 bg-white border border-slate-100 rounded-3xl shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Admin Control Panel</span>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">LMS Analytics & Operations</h1>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
            >
              Go to Student Dashboard
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Programs</span>
              <div className="text-3xl font-black text-slate-900">{totalCourses}</div>
              <p className="text-xs text-slate-500">Professional bootcamps & courses</p>
            </div>
            <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Students</span>
              <div className="text-3xl font-black text-slate-900">{uniqueStudents}</div>
              <p className="text-xs text-slate-500">Verified platform student profiles</p>
            </div>
            <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Course Enrolls</span>
              <div className="text-3xl font-black text-slate-900">{totalEnrollments}</div>
              <p className="text-xs text-slate-500">Student enrollment registrations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* 1. Admin Management Forms & Tools (Left 2 cols) */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* Course Creator Form */}
              <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Create New Course Program</h3>
                
                <form action={adminCreateCourse} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Course Title</label>
                      <input
                        name="title"
                        type="text"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
                        placeholder="e.g. Next.js 14 Masterclass"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Level</label>
                      <select
                        name="level"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
                      >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Course Description</label>
                    <textarea
                      name="description"
                      required
                      rows={3}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
                      placeholder="Brief course description..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Duration (minutes)</label>
                      <input
                        name="duration"
                        type="number"
                        defaultValue={1200}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Price ($ USD)</label>
                      <input
                        name="price"
                        type="number"
                        step="0.01"
                        placeholder="499"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Thumbnail Image URL</label>
                      <input
                        name="thumbnail"
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 font-bold text-white gradient-bg hover:opacity-90 rounded-xl transition-all shadow text-xs"
                  >
                    Add Program Course
                  </button>
                </form>
              </div>

              {/* Course Manager list containing syllabus adder */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Manage Course Curriculums</h3>

                {courses.length === 0 ? (
                  <div className="p-8 text-center bg-white border border-slate-100 rounded-3xl text-slate-400 text-xs">
                    No courses created yet. Create one above to manage syllabus.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {courses.map((course) => (
                      <div key={course.id} className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
                        
                        {/* Course Name Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-lg leading-snug">{course.title}</h4>
                            <span className="text-[10px] uppercase font-bold text-purple-600 px-2 py-0.5 rounded bg-purple-50 border border-purple-100">
                              {course.level}
                            </span>
                          </div>
                          
                          {/* Course delete form */}
                          <form
                            action={async () => {
                              'use server';
                              await adminDeleteCourse(course.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                            >
                              Delete Course
                            </button>
                          </form>
                        </div>

                        {/* Add Module inside this course */}
                        <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
                          <h5 className="text-xs font-bold text-slate-700 mb-3">Add Syllabus Module</h5>
                          <form
                            action={async (formData: FormData) => {
                              'use server';
                              const title = formData.get('title') as string;
                              const order = Number(formData.get('order') || 0);
                              await adminCreateModule(course.id, title, order);
                            }}
                            className="flex flex-col sm:flex-row items-end gap-3"
                          >
                            <div className="flex-1 w-full">
                              <input
                                name="title"
                                type="text"
                                required
                                placeholder="e.g. Module 1: Basics of React"
                                className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none text-xs text-slate-900"
                              />
                            </div>
                            <div className="w-full sm:w-20">
                              <input
                                name="order"
                                type="number"
                                placeholder="Order"
                                className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none text-xs text-slate-900"
                              />
                            </div>
                            <button
                              type="submit"
                              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all"
                            >
                              Add Module
                            </button>
                          </form>
                        </div>

                        {/* Course Modules & Lessons list */}
                        {(!course.modules || course.modules.length === 0) ? (
                          <p className="text-[10px] text-slate-400 italic">No modules added yet.</p>
                        ) : (
                          <div className="space-y-4">
                            {course.modules.map((mod) => (
                              <div key={mod.id} className="p-4 border border-slate-100 rounded-2xl space-y-4">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-bold text-xs text-slate-900">{mod.title}</h5>
                                  <form
                                    action={async () => {
                                      'use server';
                                      await adminDeleteModule(mod.id);
                                    }}
                                  >
                                    <button
                                      type="submit"
                                      className="text-[10px] text-red-500 hover:underline"
                                    >
                                      Delete Module
                                    </button>
                                  </form>
                                </div>

                                {/* List existing lessons */}
                                {((mod as any).lessons || []).length > 0 && (
                                  <ul className="divide-y divide-slate-100 text-xs bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                    {((mod as any).lessons).map((les: any) => (
                                      <li key={les.id} className="py-2.5 flex items-center justify-between">
                                        <span className="text-slate-700 font-medium">
                                          {les.title} ({les.type})
                                        </span>
                                        <form
                                          action={async () => {
                                            'use server';
                                            await adminDeleteLesson(les.id);
                                          }}
                                        >
                                          <button type="submit" className="text-red-500 hover:underline text-[9px]">
                                            Remove
                                          </button>
                                        </form>
                                      </li>
                                    ))}
                                  </ul>
                                )}

                                {/* Add Lesson form */}
                                <form
                                  action={async (formData: FormData) => {
                                    'use server';
                                    const title = formData.get('title') as string;
                                    const type = formData.get('type') as 'VIDEO' | 'TEXT' | 'PDF' | 'QUIZ';
                                    const content = formData.get('content') as string;
                                    const order = Number(formData.get('order') || 0);
                                    await adminCreateLesson(mod.id, title, type, content, order);
                                  }}
                                  className="space-y-3 bg-slate-50/30 p-3 rounded-xl border border-slate-100"
                                >
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <input
                                      name="title"
                                      type="text"
                                      required
                                      placeholder="Lesson Title"
                                      className="sm:col-span-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-[11px]"
                                    />
                                    <select
                                      name="type"
                                      className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-[11px]"
                                    >
                                      <option value="TEXT">Text Markdown</option>
                                      <option value="VIDEO">Video URL</option>
                                      <option value="PDF">PDF URL</option>
                                    </select>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                    <input
                                      name="content"
                                      type="text"
                                      required
                                      placeholder="Content URL / Text Body"
                                      className="sm:col-span-3 px-3 py-2 bg-white rounded-lg border border-slate-200 text-[11px]"
                                    />
                                    <input
                                      name="order"
                                      type="number"
                                      placeholder="Order"
                                      className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-[11px]"
                                    />
                                  </div>
                                  <button
                                    type="submit"
                                    className="w-full inline-flex items-center justify-center px-3 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg"
                                  >
                                    + Add Lesson content
                                  </button>
                                </form>

                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Admin Enrollment & Progress Logs Sidebar (Right 1 col) */}
            <div className="space-y-8">
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Student Enrolls</h3>
                
                {enrollments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No students enrolled yet.</p>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {enrollments.map((enr: any) => (
                      <div key={enr.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-1.5">
                        <div className="font-bold text-xs text-slate-800">{enr.User?.name || 'Jane Doe'}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{enr.User?.email}</div>
                        <div className="text-[10px] font-bold text-slate-600 bg-slate-100 inline-block px-2 py-0.5 rounded border border-slate-200">
                          {enr.Course?.title}
                        </div>
                        <div className="text-[9px] text-slate-400">
                          Enrolled: {new Date(enr.enrolledAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
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
