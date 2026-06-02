import { requireAdmin } from '../../../../../src/lib/auth';
import { Course, Module, Lesson } from '../../../../../src/db/models';
import {
  adminUpdateCourse,
  adminCreateModule,
  adminDeleteModule,
  adminCreateLesson,
  adminDeleteLesson,
} from '../../../../actions';
import DeleteConfirmButton from '../../../../../src/components/admin/DeleteConfirmButton';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const courseData = await Course.findByPk(id, {
    include: [
      {
        model: Module,
        as: 'modules',
        include: [{ model: Lesson, as: 'lessons' }],
      },
    ],
    order: [
      [{ model: Module, as: 'modules' }, 'order', 'ASC'],
      [{ model: Module, as: 'modules' }, { model: Lesson, as: 'lessons' }, 'order', 'ASC']
    ],
  });

  if (!courseData) {
    redirect('/admin/courses');
  }

  const course = courseData.toJSON() as any;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit Course: {course.title}</h1>
          <p className="text-sm text-slate-500">Update course details and manage syllabus.</p>
        </div>
        <Link href="/admin/courses" className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
          Back to Courses
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Course Details Form */}
        <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Course Details</h3>
          
          <form action={async (formData) => {
            'use server';
            const res = await adminUpdateCourse(course.id, formData);
            if (res?.success) {
              redirect('/admin/courses');
            }
          }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Course Title</label>
                <input
                  name="title"
                  type="text"
                  defaultValue={course.title}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Level</label>
                <select
                  name="level"
                  defaultValue={course.level}
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
                defaultValue={course.description}
                required
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Duration (minutes)</label>
                <input
                  name="duration"
                  type="number"
                  defaultValue={course.duration}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Price (₹ INR)</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={course.price || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
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
                  defaultValue={course.thumbnail}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 sm:col-span-2">Leave blank to keep existing image: {course.thumbnail}</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center px-6 py-3 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm text-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Syllabus Management */}
        <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl shadow-inner space-y-6">
          <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-4">Manage Syllabus</h3>
          
          {/* Add Module inside this course */}
          <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none text-xs text-slate-900"
                />
              </div>
              <div className="w-full sm:w-20">
                <input
                  name="order"
                  type="number"
                  placeholder="Order"
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none text-xs text-slate-900"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-white gradient-bg rounded-xl transition-all shadow"
              >
                Add Module
              </button>
            </form>
          </div>

          {/* Course Modules & Lessons list */}
          {(!course.modules || course.modules.length === 0) ? (
            <p className="text-xs text-slate-400 italic text-center py-4">No modules added yet.</p>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 pb-2">
              {course.modules.map((mod: any) => (
                <div key={mod.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h5 className="font-extrabold text-sm text-slate-900">{mod.title}</h5>
                    <DeleteConfirmButton
                      itemType="Module"
                      onDelete={async () => {
                        'use server';
                        await adminDeleteModule(mod.id);
                      }}
                      className="text-[10px] text-red-500 hover:text-red-600 font-bold px-2 py-1 bg-red-50 rounded-md transition-colors"
                    >
                      Delete Module
                    </DeleteConfirmButton>
                  </div>

                  {/* List existing lessons */}
                  {((mod as any).lessons || []).length > 0 && (
                    <ul className="divide-y divide-slate-100 text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                      {((mod as any).lessons).map((les: any) => (
                        <li key={les.id} className="py-2.5 flex items-center justify-between gap-4">
                          <span className="text-slate-700 font-medium truncate">
                            {les.title} <span className="text-[10px] text-slate-400 font-normal">({les.type})</span>
                          </span>
                          <DeleteConfirmButton
                            itemType="Lesson"
                            onDelete={async () => {
                              'use server';
                              await adminDeleteLesson(les.id);
                            }}
                            className="text-red-500 hover:underline text-[10px] flex-shrink-0"
                          >
                            Remove
                          </DeleteConfirmButton>
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
                    className="space-y-3 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        name="title"
                        type="text"
                        required
                        placeholder="Lesson Title"
                        className="sm:col-span-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-300"
                      />
                      <select
                        name="type"
                        className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-300"
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
                        className="sm:col-span-3 px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-300"
                      />
                      <input
                        name="order"
                        type="number"
                        placeholder="Order"
                        className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-300"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center px-3 py-2.5 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                    >
                      + Add Lesson content
                    </button>
                  </form>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
