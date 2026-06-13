import { requireAdmin } from '../../../src/lib/auth';
import { User, Enrollment, Package } from '../../../src/db/models';
import DeleteConfirmButton from '../../../src/components/admin/DeleteConfirmButton';
import InviteUserModal from '../../../src/components/admin/InviteUserModal';
import Pagination from '../../../src/components/admin/Pagination';
import RoleFilter from './RoleFilter';
import { deleteUserAction } from '../../actions';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; page?: string }>;
}) {
  await requireAdmin();

  const resolvedSearchParams = await searchParams;

  const roleFilter = resolvedSearchParams.role?.toUpperCase() || 'ALL';
  const page = parseInt(resolvedSearchParams.page || '1', 10) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  // Build the where clause
  const whereClause: any = {};
  if (roleFilter !== 'ALL') {
    whereClause.role = roleFilter;
  }

  // Fetch users with pagination and filtering
  const { count, rows: usersData } = await User.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    include: [
      {
        model: Enrollment,
        as: 'enrollments',
        include: [
          {
            model: Package,
            as: 'Package',
            attributes: ['id', 'title'],
          },
        ],
      },
    ],
    order: [['createdAt', 'DESC']],
    distinct: true, // important when using include to get accurate count
  });

  const users = usersData.map(u => u.toJSON());
  const totalPages = Math.ceil(count / limit) || 1;

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        {/* Left Side: Title & Invite User */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
            <p className="text-sm text-slate-500">View and manage platform students, tutors, and administrators.</p>
          </div>
          <div>
            <InviteUserModal />
          </div>
        </div>

        {/* Right Side: Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shrink-0">
          <RoleFilter initialRole={roleFilter} />
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Enrollments</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.name || 'No Name'}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded border inline-block
                      ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                        user.role === 'TUTOR' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                          'bg-slate-100 text-slate-600 border-slate-200'}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {user.enrollments && user.enrollments.length > 0 ? (
                        user.enrollments.map((enr: any) => (
                          <span key={enr.id} className="text-[10px] font-medium text-slate-700 bg-slate-100 inline-block px-2 py-0.5 rounded border border-slate-200 w-fit line-clamp-1 max-w-[150px]" title={enr.Package?.title}>
                            {enr.Package?.title}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link 
                        href={`/admin/users/${user.id}`}
                        className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                        title="View"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </Link>
                      <Link 
                        href={`/admin/users/${user.id}/edit`}
                        className="text-slate-500 hover:text-blue-600 transition-colors p-1"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </Link>
                      <DeleteConfirmButton
                        itemType="User"
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        onDelete={deleteUserAction.bind(null, user.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-sm">
            No users found matching the selected filter.
          </div>
        )}

        <Pagination 
          page={page} 
          totalPages={totalPages} 
          totalItems={count} 
          limit={limit} 
          baseUrl="/admin/users" 
          searchParams={{ role: roleFilter }}
        />
      </div>
    </div>
  );
}
