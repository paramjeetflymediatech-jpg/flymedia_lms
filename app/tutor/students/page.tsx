import { requireAuth } from '../../../src/lib/auth';
import { redirect } from 'next/navigation';
import { User, Enrollment, Course, Progress } from '../../../src/db/models';

export const revalidate = 0;

export default async function TutorStudentsPage() {
  const user = await requireAuth();
  
  if (user.role !== 'TUTOR') {
    redirect('/dashboard');
  }

  // Fetch students enrolled in this tutor's courses
  const studentsData = await User.findAll({
    include: [
      {
        model: Enrollment,
        as: 'enrollments',
        required: true, // Must have at least one enrollment...
        include: [
          {
            model: Course,
            where: { instructorId: user.id }, // ...in a course taught by this tutor
            attributes: [],
          }
        ]
      }
    ],
    order: [['createdAt', 'DESC']],
  });

  const students = studentsData.map(s => {
    const raw = s.get({ plain: true }) as any;
    // In a real scenario, you'd calculate progress based on Progress model
    return {
      id: raw.id,
      name: raw.name || 'Anonymous Student',
      email: raw.email,
      enrolledCourses: raw.enrollments?.length || 0,
      progress: 0, // Placeholder
      lastActive: new Date(raw.updatedAt).toLocaleDateString(),
    };
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Students</h1>
          <p className="mt-1 text-sm text-slate-500">
            View your active students, their progress, and send messages.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Enrolled Courses</th>
                <th className="px-6 py-4">Avg Progress</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{student.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Active: {student.lastActive}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {student.enrolledCourses}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-24">
                        <div 
                          className="h-full bg-orange-500 rounded-full" 
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[10px] font-bold text-slate-600 hover:text-orange-600 transition-colors border border-slate-200 hover:border-orange-200 px-3 py-1.5 rounded bg-white hover:bg-orange-50 whitespace-nowrap">
                      Message
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
