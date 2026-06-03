import { requireAdmin } from '../../../src/lib/auth';
import { TutorApplication } from '../../../src/db/models';
import Link from 'next/link';
import { rejectTutorApplication, approveTutorApplication } from '../../actions';
import Pagination from '../../../src/components/admin/Pagination';

export const revalidate = 0;

export default async function TutorApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();

  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1', 10) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  // Fetch all applications with pagination
  const { count, rows: applicationsData } = await TutorApplication.findAndCountAll({
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });
  
  const applications = applicationsData.map(a => a.toJSON());
  const totalPages = Math.ceil(count / limit) || 1;

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tutor Applications</h1>
          <p className="text-sm text-slate-500">Review and approve applications to join as an instructor.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Expertise</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app: any) => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{app.fullName}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Applied: {new Date(app.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded border border-blue-100">
                      {app.expertise}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-700">{app.email}</div>
                    <div className="text-xs text-slate-500">{app.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded border inline-block
                      ${app.status === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100' : 
                        app.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' :
                        'bg-orange-50 text-orange-600 border-orange-100'}`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {app.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-2">
                        <form
                          action={async () => {
                            'use server';
                            await rejectTutorApplication(app.id);
                          }}
                        >
                          <button type="submit" className="text-[10px] font-bold text-slate-600 hover:text-red-600 transition-colors border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded bg-white hover:bg-red-50 whitespace-nowrap">
                            Reject
                          </button>
                        </form>
                        <form
                          action={async () => {
                            'use server';
                            await approveTutorApplication(app.id);
                          }}
                        >
                          <button type="submit" className="text-[10px] font-bold text-white transition-colors border border-green-600 px-3 py-1.5 rounded bg-green-600 hover:bg-green-700 whitespace-nowrap shadow-sm">
                            Approve & Invite
                          </button>
                        </form>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {applications.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-sm">
            No tutor applications found.
          </div>
        )}

        <Pagination 
          page={page} 
          totalPages={totalPages} 
          totalItems={count} 
          limit={limit} 
          baseUrl="/admin/tutor-applications" 
        />
      </div>
    </div>
  );
}
