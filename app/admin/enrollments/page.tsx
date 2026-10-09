import { requireAdmin } from '../../../src/lib/auth';
import { Enrollment, User, Package, LiveClass } from '../../../src/db/models';
import Link from 'next/link';
import { adminCreateEnrollment, adminDeleteEnrollment } from '../../actions';
import DeleteConfirmButton from '../../../src/components/admin/DeleteConfirmButton';
import EnrollStudentForm from '../../../src/components/admin/EnrollStudentForm';
import Pagination from '../../../src/components/admin/Pagination';
import { Op } from 'sequelize';

export const revalidate = 0;

export default async function AdminEnrollmentsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  await requireAdmin();

  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams?.page;
  const searchParam = resolvedSearchParams?.search as string || '';
  const page = typeof pageParam === 'string' ? parseInt(pageParam, 10) || 1 : 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const userWhereClause = searchParam ? {
    [Op.or]: [
      { name: { [Op.like]: `%${searchParam}%` } },
      { email: { [Op.like]: `%${searchParam}%` } }
    ]
  } : undefined;

  const [enrollmentsData, usersData, packagesData] = await Promise.all([
    Enrollment.findAndCountAll({
      limit,
      offset,
      include: [
        { model: User, attributes: ['id', 'name', 'email'], where: userWhereClause },
        { 
          model: Package, 
          as: 'Package', 
          attributes: ['id', 'title'],
          include: [
            {
              model: LiveClass,
              as: 'liveClasses',
              include: [{ model: User, as: 'tutor', attributes: ['name'] }]
            }
          ]
        },
      ],
      order: [['enrolledAt', 'DESC']],
    }),
    User.findAll({ where: { role: 'STUDENT' }, attributes: ['id', 'name', 'email'] }),
    Package.findAll({ attributes: ['id', 'title'] }),
  ]);
  
  const enrollments = enrollmentsData.rows.map(e => e.toJSON());
  const totalPages = Math.ceil(enrollmentsData.count / limit) || 1;
  const users = usersData.map(u => u.toJSON());
  const packages = packagesData.map(p => p.toJSON());

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Enrollments</h1>
          <p className="text-sm text-slate-500">View and manage student package enrollments.</p>
        </div>
        
        <form method="GET" action="/admin/enrollments" className="flex items-center gap-2 max-w-sm w-full">
          <input 
            type="text" 
            name="search" 
            defaultValue={searchParam}
            placeholder="Search student..." 
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm"
          />
          <button type="submit" className="px-4 py-2 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-600 hover:via-red-600 hover:to-orange-600 text-white font-bold rounded-xl transition-colors text-sm">
            Search
          </button>
          {searchParam && (
            <Link href="/admin/enrollments" className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
              Clear
            </Link>
          )}
        </form>
      </div>

      <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm max-w-4xl">
        <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Enroll Student</h3>
        <EnrollStudentForm users={users} packages={packages} />
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Tutor</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    No enrollments found.
                  </td>
                </tr>
              ) : (
                enrollments.map((enr: any) => {
                  // Attempt to extract the primary tutor from the package's live classes
                  const tutors = Array.from(new Set((enr.Package?.liveClasses || []).map((lc: any) => lc.tutor?.name).filter(Boolean)));
                  const tutorDisplay = tutors.length > 0 ? tutors.join(', ') : 'Unassigned';
                  
                  const d = new Date(enr.enrolledAt);

                  return (
                    <tr key={enr.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{enr.User?.name || 'Unknown Student'}</div>
                        <div className="text-xs text-slate-500">{enr.User?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{enr.Package?.title || 'Unknown Course'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                          {tutorDisplay}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{d.toLocaleDateString()}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="px-6 py-4">
                        {enr.completedAt ? (
                          <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-600 uppercase">Completed</span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-1 rounded bg-green-100 text-green-700 uppercase">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link 
                            href={`/admin/enrollments/${enr.id}`}
                            className="text-slate-500 hover:text-blue-600 transition-colors p-1"
                            title="View"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </Link>
                          <Link 
                            href={`/admin/enrollments/${enr.id}/edit`}
                            className="text-slate-500 hover:text-orange-600 transition-colors p-1"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </Link>
                          <DeleteConfirmButton
                            itemType="Enrollment"
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                            onDelete={adminDeleteEnrollment.bind(null, enr.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <Pagination 
        page={page} 
        totalPages={totalPages} 
        totalItems={enrollmentsData.count} 
        limit={limit} 
        baseUrl="/admin/enrollments" 
      />
    </div>
  );
}
