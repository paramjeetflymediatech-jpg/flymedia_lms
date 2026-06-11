import { requireAdmin } from '../../../../../src/lib/auth';
import { User } from '../../../../../src/db/models';
import { adminUpdateUser } from '../../../../actions';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const userData = await User.findByPk(id);

  if (!userData) {
    redirect('/admin/users');
  }

  const user = userData.toJSON() as any;

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit User</h1>
          <p className="text-sm text-slate-500">Update details for {user.name || user.email}</p>
        </div>
        <Link href={`/admin/users/${user.id}`} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
          Back to User
        </Link>
      </div>

      <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
        <form action={async (formData) => {
          'use server';
          const res = await adminUpdateUser(user.id, formData);
          if (res?.success) {
            redirect(`/admin/users/${user.id}`);
          } else {
            // In a real app we'd show an error, but simple redirect for now
            console.error(res?.error);
          }
        }} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                name="name"
                type="text"
                defaultValue={user.name}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                name="email"
                type="email"
                defaultValue={user.email}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role</label>
              <select
                name="role"
                defaultValue={user.role}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
              >
                <option value="STUDENT">Student</option>
                <option value="TUTOR">Tutor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password (leave blank to keep current)</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center px-8 py-3 font-bold text-white gradient-bg hover:opacity-90 rounded-xl transition-all shadow-md text-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
