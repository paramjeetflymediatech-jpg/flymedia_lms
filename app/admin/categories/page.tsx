import { requireAdmin } from '../../../src/lib/auth';
import { Category } from '../../../src/db/models';
import { adminCreateCategory, adminDeleteCategory } from '../../actions';
import DeleteConfirmButton from '../../../src/components/admin/DeleteConfirmButton';
import Pagination from '../../../src/components/admin/Pagination';
import { Op } from 'sequelize';
import Link from 'next/link';
import CategoryContentEditor from '../../../src/components/admin/CategoryContentEditor';
import CategoryNameSlugInputs from '../../../src/components/admin/CategoryNameSlugInputs';

export const revalidate = 0;

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  await requireAdmin();

  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams?.page;
  const searchParam = resolvedSearchParams?.search as string || '';
  const page = typeof pageParam === 'string' ? parseInt(pageParam, 10) || 1 : 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const whereClause = searchParam ? {
    name: { [Op.like]: `%${searchParam}%` }
  } : {};

  const { count, rows } = await Category.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });
  
  const categories = rows.map(c => c.toJSON());
  const totalPages = Math.ceil(count / limit) || 1;

  return (
    <div className="p-6 md:p-10 space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Category Management</h1>
          <p className="text-sm text-slate-500">Create and manage categories for your packages.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        <details className="group bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden transition-all duration-300 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex items-center justify-between p-6 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors list-none">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center text-orange-600 shadow-sm border border-orange-200/50">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Create New Category</h3>
                <p className="text-sm text-slate-500 font-medium">Add a new category to group your packages.</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center group-open:rotate-180 transition-transform duration-300 shadow-sm">
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </summary>
          
          <div className="p-8 border-t border-slate-100">
            <form action={async (formData) => {
              'use server';
              await adminCreateCategory(formData);
            }} className="space-y-4">
              <CategoryNameSlugInputs layout="stacked" />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Icon (Upload)</label>
                <input
                  name="iconFile"
                  type="file"
                  accept="image/*"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Or Icon URL</label>
                <input
                  name="iconUrl"
                  type="text"
                  placeholder="e.g. https://example.com/icon.png"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900"
                />
              </div>
              
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 mb-2">Category Page Content</h4>
                <p className="text-[10px] text-slate-500 mb-3">Add structured dynamic content (Features, Sections, Dropdowns/FAQs) for the category landing page.</p>
                <div className="mb-8">
                  <CategoryContentEditor defaultValue="" />
                </div>
              </div>
              
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 mb-3">SEO Settings (Optional)</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Meta Title</label>
                    <input
                      name="metaTitle"
                      type="text"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 text-xs"
                      placeholder="SEO Title"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Meta Description</label>
                    <textarea
                      name="metaDescription"
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 text-xs"
                      placeholder="SEO Description"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Meta Keywords</label>
                    <input
                      name="metaKeywords"
                      type="text"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 text-xs"
                      placeholder="comma, separated, keywords"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center px-4 py-2.5 font-bold text-white bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-600 hover:via-red-600 hover:to-orange-600 rounded-xl transition-all text-sm"
              >
                Create Category
              </button>
            </form>
          </div>
        </details>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-2xl font-extrabold text-slate-900">Your Categories</h3>
            
            <form method="GET" action="/admin/categories" className="flex items-center gap-2 max-w-sm w-full">
              <input 
                type="text" 
                name="search" 
                defaultValue={searchParam}
                placeholder="Search categories..." 
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm"
              />
              <button type="submit" className="px-4 py-2 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-600 hover:via-red-600 hover:to-orange-600 text-white font-bold rounded-xl transition-colors text-sm">
                Search
              </button>
              {searchParam && (
                <a href="/admin/categories" className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
                  Clear
                </a>
              )}
            </form>
          </div>

          {categories.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-100 rounded-3xl text-slate-500 font-medium">
              No categories found. Create your first category.
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {categories.map((cat: any) => (
                  <div key={cat.id} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      {cat.icon ? (
                        <img src={cat.icon} alt={cat.name} className="w-12 h-12 object-contain rounded-xl border border-slate-100 bg-slate-50 p-1" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl">
                          {cat.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-lg leading-tight">{cat.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">Slug: {cat.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/packages/category/${cat.slug}`}
                        target="_blank"
                        className="text-blue-500 hover:text-blue-700 transition-colors p-2 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center justify-center"
                        title="View Category Page"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </Link>
                      <Link
                        href={`/admin/categories/edit/${cat.id}`}
                        className="text-orange-500 hover:text-orange-700 transition-colors p-2 bg-orange-50 hover:bg-orange-100 rounded-xl flex items-center justify-center"
                        title="Edit Category"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </Link>
                      <DeleteConfirmButton
                        itemType="Category"
                        onDelete={adminDeleteCategory.bind(null, cat.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-2 bg-red-50 hover:bg-red-100 rounded-xl"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Pagination 
                page={page} 
                totalPages={totalPages} 
                totalItems={count} 
                limit={limit} 
                baseUrl="/admin/categories" 
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
