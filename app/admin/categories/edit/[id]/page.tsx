import { requireAdmin } from '../../../../../src/lib/auth';
import { Category } from '../../../../../src/db/models';
import { adminUpdateCategory } from '../../../../actions';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import CategoryContentEditor from '../../../../../src/components/admin/CategoryContentEditor';
import CategoryNameSlugInputs from '../../../../../src/components/admin/CategoryNameSlugInputs';

export const revalidate = 0;

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const category = await Category.findByPk(id);
  if (!category) {
    notFound();
  }

  const catData = category.toJSON() as any;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
        <Link
          href="/admin/categories"
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit Category</h1>
          <p className="text-sm text-slate-500">Update details for {catData.name}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
        <form action={async (formData) => {
          'use server';
          await adminUpdateCategory(id, formData);
          redirect('/admin/categories');
        }} className="space-y-6">
          
          <CategoryNameSlugInputs 
            initialName={catData.name} 
            initialSlug={catData.slug} 
            layout="grid"
            nameLabel="Category Name"
          />

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Icon (Upload)</label>
              {catData.icon && (
                <div className="mb-2">
                  <img src={catData.icon} alt="Current Icon" className="w-12 h-12 object-contain bg-slate-50 border border-slate-100 rounded-lg p-1" />
                </div>
              )}
              <input
                name="iconFile"
                type="file"
                accept="image/*"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Or Icon URL</label>
              <input
                name="iconUrl"
                type="text"
                defaultValue={catData.icon || ''}
                placeholder="e.g. https://example.com/icon.png"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h4 className="text-base font-bold text-slate-800 mb-2">Category Page Content</h4>
            <p className="text-xs text-slate-500 mb-4">Add structured dynamic content (Features, Sections, Dropdowns/FAQs) for the category landing page.</p>
            <CategoryContentEditor defaultValue={catData.content || ''} />
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h4 className="text-base font-bold text-slate-800 mb-4">SEO Settings (Optional)</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-1.5">Meta Title</label>
                <input
                  name="metaTitle"
                  type="text"
                  defaultValue={catData.metaTitle || ''}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 text-sm"
                  placeholder="SEO Title"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-1.5">Meta Description</label>
                <textarea
                  name="metaDescription"
                  rows={3}
                  defaultValue={catData.metaDescription || ''}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 text-sm"
                  placeholder="SEO Description"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-1.5">Meta Keywords</label>
                <input
                  name="metaKeywords"
                  type="text"
                  defaultValue={catData.metaKeywords || ''}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 text-sm"
                  placeholder="comma, separated, keywords"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 font-bold text-white bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-600 hover:via-red-600 hover:to-orange-600 rounded-xl transition-all shadow-md text-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
