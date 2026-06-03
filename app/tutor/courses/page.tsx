import { requireAuth } from '../../../src/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Course, Enrollment } from '../../../src/db/models';
import { sequelize } from '../../../src/db';

export const revalidate = 0;

export default async function TutorCoursesPage() {
  const user = await requireAuth();
  
  if (user.role !== 'TUTOR') {
    redirect('/dashboard');
  }

  // Fetch courses managed by this tutor dynamically
  const coursesData = await Course.findAll({
    where: { instructorId: user.id },
    include: [
      {
        model: Enrollment,
        as: 'enrollments',
        attributes: [], // We only need the count
      },
    ],
    attributes: {
      include: [
        [sequelize.fn('COUNT', sequelize.col('enrollments.id')), 'studentCount']
      ]
    },
    group: ['Course.id'],
    order: [['createdAt', 'DESC']],
  });

  const courses = coursesData.map(c => {
    const raw = c.get({ plain: true }) as any;
    return {
      id: raw.id,
      title: raw.title,
      status: raw.status || 'DRAFT',
      students: raw.studentCount || 0,
      rating: 0, // Implement ratings later
      price: raw.price ? `$${Number(raw.price).toFixed(2)}` : 'Free',
    };
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Courses</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your courses, update content, and track student progress.
          </p>
        </div>
        <Link href="/tutor/courses/new" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-orange-700 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          New Course
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Course Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Students</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{course.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded border inline-block
                      ${course.status === 'PUBLISHED' ? 'bg-green-50 text-green-600 border-green-100' : 
                        'bg-slate-100 text-slate-600 border-slate-200'}`}
                    >
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {course.price}
                  </td>
                  <td className="px-6 py-4">
                    {course.students}
                  </td>
                  <td className="px-6 py-4">
                    {course.rating > 0 ? (
                      <div className="flex items-center gap-1 text-amber-500">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        <span className="font-semibold text-slate-700">{course.rating}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[10px] font-bold text-orange-600 hover:text-white transition-colors border border-orange-200 hover:border-orange-600 px-3 py-1.5 rounded bg-orange-50 hover:bg-orange-600 whitespace-nowrap">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
