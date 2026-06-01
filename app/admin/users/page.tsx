import { requireAdmin } from '../../../src/lib/auth';
import { User, Enrollment, Course } from '../../../src/db/models';
import DeleteConfirmButton from '../../../src/components/admin/DeleteConfirmButton';
import { deleteUserAction } from '../../actions';

export const revalidate = 0;

export default async function AdminUsersPage() {
  await requireAdmin();

  // Fetch all users with their enrollments
  const usersData = await User.findAll({
    include: [
      {
        model: Enrollment,
        as: 'enrollments',
        include: [
          {
            model: Course,
            attributes: ['id', 'title'],
          },
        ],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
  
  const users = usersData.map(u => u.toJSON());

  return (
    <div className="p-6 md:p-10 space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-sm text-slate-500">View and manage platform students and administrators.</p>
        </div>
        <button className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all">
          + Invite User
        </button>
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
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.name || 'No Name'}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded border ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {user.enrollments && user.enrollments.length > 0 ? (
                        user.enrollments.map((enr: any) => (
                          <span key={enr.id} className="text-[10px] font-medium text-slate-700 bg-slate-100 inline-block px-2 py-0.5 rounded border border-slate-200 w-fit">
                            {enr.Course?.title}
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
                      <form
                        action={async () => {
                          'use server';
                          const { updateUserRole } = await import('../../actions');
                          await updateUserRole(user.id, user.role === 'ADMIN' ? 'STUDENT' : 'ADMIN');
                        }}
                      >
                        <button type="submit" className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors border border-blue-200 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100" title={`Make ${user.role === 'ADMIN' ? 'Student' : 'Admin'}`}>
                          {user.role === 'ADMIN' ? 'Make ST' : 'Make AD'}
                        </button>
                      </form>
                      <button className="text-slate-400 hover:text-blue-600 transition-colors" title="Edit User">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <DeleteConfirmButton 
                        itemType="User" 
                        onDelete={async () => {
                          'use server';
                          await deleteUserAction(user.id);
                        }} 
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
            No users found.
          </div>
        )}
      </div>
    </div>
  );
}
