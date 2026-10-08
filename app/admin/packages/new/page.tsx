import { requireAdmin } from '../../../../src/lib/auth';
import { adminCreatePackage } from '../../../actions';
import { Category } from '../../../../src/db/models';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ThumbnailUpload from '../../../../src/components/admin/ThumbnailUpload';
import RichTextEditor from '../../../../src/components/admin/RichTextEditor';

export default async function CreatePackagePage() {
  await requireAdmin();
  
  const categoriesData = await Category.findAll({ order: [['name', 'ASC']] });
  const categories = categoriesData.map(c => c.toJSON());

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create New Package</h1>
          <p className="text-sm text-slate-500">Add a new training package to the platform.</p>
        </div>
        <Link href="/admin/packages" className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
          Back to Packages
        </Link>
      </div>

      <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-slate-900">Package Details</h3>
        
        <form action={async (formData) => {
          'use server';
          const res = await adminCreatePackage(formData);
          if (res?.success) {
            redirect('/admin/packages');
          }
        }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Package Title</label>
              <input
                name="title"
                type="text"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
                placeholder="e.g. Next.js 14 Masterclass Bootcamp"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Delivery Mode</label>
              <select
                name="mode"
                defaultValue="ONLINE"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900 bg-white"
              >
                <option value="ONLINE">Online Only</option>
                <option value="OFFLINE">Offline Only</option>
                <option value="BOTH">Online & Offline Both</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
              <select
                name="category"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900 bg-white"
                defaultValue=""
              >
                <option value="">-- Select Category (Optional) --</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Price (₹ INR)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                placeholder="499"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Package Description</label>
            <RichTextEditor name="description" defaultValue="" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Upload Package Image (Local)</label>
              <ThumbnailUpload name="thumbnailFile" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Or enter Image URL</label>
              <input
                name="thumbnailUrl"
                type="text"
                placeholder="Enter image URL"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center px-8 py-3 font-bold text-white bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-600 hover:via-red-600 hover:to-orange-600 rounded-xl transition-all shadow-md text-sm"
            >
              Create Package
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
