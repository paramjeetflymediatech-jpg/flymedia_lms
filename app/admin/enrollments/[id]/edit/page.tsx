import { requireAdmin } from '../../../../../src/lib/auth';
import { Enrollment, User, Package } from '../../../../../src/db/models';
import { adminUpdateEnrollment } from '../../../../actions';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function EditEnrollmentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const enrData = await Enrollment.findByPk(id, {
    include: [
      { model: User, attributes: ['name', 'email'] },
      { model: Package, as: 'Package', attributes: ['title'] },
    ]
  });

  if (!enrData) {
    redirect('/admin/enrollments');
  }

  const enr = enrData.toJSON() as any;

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit Enrollment</h1>
          <p className="text-sm text-slate-500">Update status for {enr.User?.name}</p>
        </div>
        <Link href="/admin/enrollments" className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
          Back to Enrollments
        </Link>
      </div>

      <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm space-y-6">
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">Student</div>
            <div className="font-bold text-slate-900">{enr.User?.name} <span className="font-normal text-slate-500">({enr.User?.email})</span></div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Package</div>
            <div className="font-bold text-slate-900">{enr.Package?.title}</div>
          </div>
        </div>

        <form action={async (formData) => {
          'use server';
          const res = await adminUpdateEnrollment(enr.id, formData);
          if (res?.success) {
            redirect('/admin/enrollments');
          } else {
            console.error(res?.error);
          }
        }} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Enrollment Status</label>
              <select
                name="status"
                defaultValue={enr.completedAt ? 'COMPLETED' : 'ACTIVE'}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
              >
                <option value="ACTIVE">Active (In Progress)</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-2">Marking an enrollment as "Completed" sets its completion date to now.</p>
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
