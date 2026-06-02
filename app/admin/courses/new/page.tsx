import { requireAdmin } from '../../../../src/lib/auth';
import { adminCreateCourse } from '../../../actions';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function CreateCoursePage() {
  await requireAdmin();

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create New Course</h1>
          <p className="text-sm text-slate-500">Add a new training program to the platform.</p>
        </div>
        <Link href="/admin/courses" className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
          Back to Courses
        </Link>
      </div>

      <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-slate-900">Course Details</h3>
        
        <form action={async (formData) => {
          'use server';
          const res = await adminCreateCourse(formData);
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
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
              placeholder="Detailed course description..."
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

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center px-8 py-3 font-bold text-white gradient-bg hover:opacity-90 rounded-xl transition-all shadow-md text-sm"
            >
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
