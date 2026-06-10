import { requireAdmin } from '../../../../../src/lib/auth';
import { Package, LiveClass, User } from '../../../../../src/db/models';
import {
  adminUpdatePackage,
  adminCreateLiveClass,
  adminDeleteLiveClass,
} from '../../../../actions';
import DeleteConfirmButton from '../../../../../src/components/admin/DeleteConfirmButton';
import LiveClassItem from '../../../../../src/components/admin/LiveClassItem';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const pkgData = await Package.findByPk(id, {
    include: [
      {
        model: LiveClass,
        as: 'liveClasses',
        include: [{ model: User, as: 'tutor' }]
      },
    ],
    order: [
      [{ model: LiveClass, as: 'liveClasses' }, 'startTime', 'ASC']
    ],
  });

  if (!pkgData) {
    redirect('/admin/packages');
  }

  const pkg = pkgData.toJSON() as any;
  const tutorsData = await User.findAll({ where: { role: 'TUTOR' } });
  const tutors = tutorsData.map(t => t.toJSON());

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit Package: {pkg.title}</h1>
          <p className="text-sm text-slate-500">Update package details and manage live classes.</p>
        </div>
        <Link href="/admin/packages" className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
          Back to Packages
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Package Details Form */}
        <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Package Details</h3>
          
          <form action={async (formData) => {
            'use server';
            const res = await adminUpdatePackage(pkg.id, formData);
            if (res?.success) {
              redirect('/admin/packages');
            }
          }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Package Title</label>
                <input
                  name="title"
                  type="text"
                  defaultValue={pkg.title}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Price (₹ INR)</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={pkg.price || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Package Description</label>
              <textarea
                name="description"
                defaultValue={pkg.description}
                required
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
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
                  defaultValue={pkg.thumbnail}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center px-6 py-3 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm text-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Live Classes Management */}
        <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl shadow-inner space-y-6">
          <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-4">Manage Live Classes</h3>
          
          {/* Add Live Class inside this package */}
          <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
            <h5 className="text-xs font-bold text-slate-700 mb-3">Schedule Live Class</h5>
            <form
              action={async (formData: FormData) => {
                'use server';
                formData.append('packageId', pkg.id);
                await adminCreateLiveClass(formData);
              }}
              className="space-y-3"
            >
              <input
                name="title"
                type="text"
                required
                placeholder="Class Title (e.g. Introduction to React)"
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none text-xs text-slate-900"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="startTime"
                  type="datetime-local"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none text-xs text-slate-900"
                />
                <input
                  name="duration"
                  type="number"
                  placeholder="Duration (mins) - Default 60"
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none text-xs text-slate-900"
                />
              </div>
              <input
                name="meetLink"
                type="url"
                placeholder="Google Meet Link (https://meet.google.com/...)"
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none text-xs text-slate-900"
              />
              <select
                name="tutorId"
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none text-xs text-slate-900"
              >
                <option value="">Select Tutor (Optional)</option>
                {tutors.map((tutor: any) => (
                  <option key={tutor.id} value={tutor.id}>{tutor.name} ({tutor.email})</option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-white gradient-bg rounded-xl transition-all shadow"
              >
                Schedule Class
              </button>
            </form>
          </div>

          {/* List existing live classes */}
          {(!pkg.liveClasses || pkg.liveClasses.length === 0) ? (
            <p className="text-xs text-slate-400 italic text-center py-4">No live classes scheduled yet.</p>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 pb-2">
              {pkg.liveClasses.map((lc: any) => (
                <LiveClassItem key={lc.id} lc={lc} pkgId={pkg.id} tutors={tutors} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
