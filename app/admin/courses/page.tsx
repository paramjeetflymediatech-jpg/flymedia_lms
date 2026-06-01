import { requireAdmin } from '../../../src/lib/auth';
import { Course, Module, Lesson } from '../../../src/db/models';
import {
  adminCreateCourse,
  adminDeleteCourse,
  adminCreateModule,
  adminDeleteModule,
  adminCreateLesson,
  adminDeleteLesson,
} from '../../actions';

export const revalidate = 0; // Fresh admin logs

export default async function AdminCoursesPage() {
  await requireAdmin();

  const coursesData = await Course.findAll({
    include: [
      {
        model: Module,
        as: 'modules',
        include: [{ model: Lesson, as: 'lessons' }],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
  
  const courses = coursesData.map(c => c.toJSON());

  return (
    <div className="p-6 md:p-10 space-y-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Course Management</h1>
        <p className="text-sm text-slate-500">Create and manage curriculums, modules, and lessons.</p>
      </div>

      <div className="space-y-8 max-w-5xl">
        {/* Course Creator Form Hidden Behind Button */}
        <details className="group [&_summary::-webkit-details-marker]:hidden">
          <summary className="inline-flex items-center justify-center px-6 py-3 font-extrabold text-white bg-slate-900 hover:bg-slate-800 rounded-2xl cursor-pointer list-none transition-all shadow-md">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              Create New Course
            </span>
          </summary>
          
          <div className="mt-6 bg-white border border-slate-100 p-8 rounded-3xl shadow-sm space-y-6 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">Course Details</h3>
            </div>
            
            <form action={async (formData) => { 'use server'; await adminCreateCourse(formData); }} className="space-y-4">
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
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Price (₹ INR)</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="499"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
                />
              </div>
              <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Upload Thumbnail Image (Local)</label>
                  <input
                    name="thumbnailFile"
                    type="file"
                    accept="image/*"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Or enter Image URL</label>
                  <input
                    name="thumbnailUrl"
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
                  />
                </div>
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
        </details>

        {/* Course Manager list containing syllabus adder */}
        <div className="space-y-6 pt-4">
          <h3 className="text-2xl font-extrabold text-slate-900">Your Courses</h3>

          {courses.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-100 rounded-3xl text-slate-500 font-medium">
              No courses created yet. Click "Create New Course" above to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course: any) => (
                <details key={course.id} className="bg-white border border-slate-200 rounded-3xl shadow-sm group [&_summary::-webkit-details-marker]:hidden overflow-hidden">
                  
                  {/* Course Name Header (Listing Format) */}
                  <summary className="flex flex-col sm:flex-row sm:items-center justify-between p-6 cursor-pointer list-none hover:bg-slate-50 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-lg leading-tight">{course.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] uppercase font-bold text-purple-700 px-2.5 py-0.5 rounded-full bg-purple-100">
                            {course.level}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {course.modules?.length || 0} Modules
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 border-l border-slate-300 pl-2">
                            {course.price ? `₹${course.price}` : 'Free'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-blue-600 group-open:hidden">Manage Syllabus</span>
                      <span className="text-sm font-bold text-slate-500 hidden group-open:block">Close</span>
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-open:rotate-180 transition-transform">
                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7"/></svg>
                      </div>
                    </div>
                  </summary>

                  {/* Syllabus Management Body */}
                  <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-8">
                    
                    {/* Course delete form */}
                    <div className="flex justify-end">
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
                      {course.modules.map((mod: any) => (
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
                </details>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
