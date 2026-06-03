import { requireAuth } from '../../../../src/lib/auth';
import { redirect } from 'next/navigation';
import { CourseForm } from './CourseForm';
import Link from 'next/link';

export default async function NewCoursePage() {
  const user = await requireAuth();
  
  if (user.role !== 'TUTOR') {
    redirect('/dashboard');
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <div>
        <Link href="/tutor/courses" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 mb-4 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Courses
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create New Course</h1>
        <p className="mt-1 text-sm text-slate-500">
          Fill out the initial details to draft your new course.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8">
        <CourseForm />
      </div>
    </div>
  );
}
